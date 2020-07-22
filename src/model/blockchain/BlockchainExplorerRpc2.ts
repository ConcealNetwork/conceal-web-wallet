/*
 * Copyright (c) 2018, Gnock
 * Copyright (c) 2018, The Masari Project
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { BlockchainExplorer } from "./BlockchainExplorer";
import { Wallet } from "../Wallet";
import { TransactionsExplorer, TX_EXTRA_TAG_PUBKEY } from "../TransactionsExplorer";
import { CryptoUtils } from "../CryptoUtils";
import { Transaction } from "../Transaction";
import { MathUtil } from "../MathUtil";

export class WalletWatchdog {

    wallet: Wallet;
    explorer: BlockchainExplorerRpc2;

    constructor(wallet: Wallet, explorer: BlockchainExplorerRpc2) {
        this.wallet = wallet;
        this.explorer = explorer;

        this.initWorker();
        this.initMempool();
    }

    initWorker() {
        let self = this;
        this.workerProcessing = new Worker('./workers/TransferProcessingEntrypoint.js');
        this.workerProcessing.onmessage = function (data: MessageEvent) {
            let message: string | any = data.data;
            //console.log("InitWorker message: ");
            //console.log(message);
            if (message === 'ready') {
                self.signalWalletUpdate();
            } else if (message === 'readyWallet') {
                self.workerProcessingReady = true;
            } else if (message.type) {
                if (message.type === 'processed') {
                    let transactions = message.transactions;
                    if (transactions.length > 0) {
                        for (let tx of transactions)
                            self.wallet.addNew(Transaction.fromRaw(tx));
                        self.signalWalletUpdate();
                    }
                    if (self.workerCurrentProcessing.length > 0) {
                        let transactionHeight = self.workerCurrentProcessing[self.workerCurrentProcessing.length - 1].blockIndex;
                        if (typeof transactionHeight !== 'undefined')
                            self.wallet.lastHeight = transactionHeight;
                    }

                    self.workerProcessingWorking = false;
                }
            }
        };
    }

    signalWalletUpdate() {
        let self = this;
        this.lastBlockLoading = -1;//reset scanning
        this.workerProcessing.postMessage({
            type: 'initWallet',
            wallet:this.wallet.exportToRaw()
        });
        clearInterval(this.intervalTransactionsProcess);
        this.intervalTransactionsProcess = setInterval(function () {
            self.checkTransactionsInterval();
        }, this.wallet.options.readSpeed);
    }

    intervalMempool = 0;
    initMempool() {
        let self = this;
        if (this.intervalMempool === 0) {
            this.intervalMempool = setInterval(function () {
                self.checkMempool();
            }, 30 * 1000);
        }
        self.checkMempool();
    }

    stopped: boolean = false;

    stop() {
        clearInterval(this.intervalTransactionsProcess);
        this.transactionsToProcess = [];
        clearInterval(this.intervalMempool);
        this.stopped = true;
    }

    checkMempool(): boolean {
        let self = this;
        if (this.lastMaximumHeight - this.lastBlockLoading > 1) {//only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
            return false;
        }

        this.wallet.txsMem = [];
        this.explorer.getTransactionPool().then(function (pool: any) {
            if (typeof pool !== 'undefined')
                for (let rawTx of pool) {
                    let tx = TransactionsExplorer.parse(rawTx, self.wallet);
                    if (tx !== null) {
                        self.wallet.txsMem.push(tx);
                    }
                }
        }).catch(function () { });
        return true;
    }

    terminateWorker() {
        this.workerProcessing.terminate();
        this.workerProcessingReady = false;
        this.workerCurrentProcessing = [];
        this.workerProcessingWorking = false;
        this.workerCountProcessed = 0;
    }

    transactionsToProcess: RawDaemonTransaction[] = [];
    intervalTransactionsProcess = 0;

    workerProcessing !: Worker;
    workerProcessingReady = false;
    workerProcessingWorking = false;
    workerCurrentProcessing: RawDaemonTransaction[] = [];
    workerCountProcessed = 0;

    checkTransactions(rawTransactions: RawDaemonTransaction[]) {
        for (let rawTransaction of rawTransactions) {
            let height = rawTransaction.blockIndex;
            if (typeof height !== 'undefined') {
                let transaction = TransactionsExplorer.parse(rawTransaction, this.wallet);
                if (transaction !== null) {
                    this.wallet.addNew(transaction);
                }
                if (height - this.wallet.lastHeight >= 2) {
                    this.wallet.lastHeight = height - 1;
                }
            }
        }
        if (this.transactionsToProcess.length == 0) {
            this.wallet.lastHeight = this.lastBlockLoading;
        }
    }

    checkTransactionsInterval() {

        //somehow we're repeating and regressing back to re-process Tx's 
        //loadHistory getting into a stack overflow ?
        //need to work out timinings and ensure process does not reload when it's already running... 

        if (this.workerProcessingWorking || !this.workerProcessingReady) {
            return;
        }
        
        //we destroy the worker in charge of decoding the transactions every 250 transactions to ensure the memory is not corrupted
        //cnUtil bug, see https://github.com/mymonero/mymonero-core-js/issues/8
        if (this.workerCountProcessed >= 100) {
            //console.log('Recreate worker..');
            this.terminateWorker();
            this.initWorker();
            return;
        }

        let transactionsToProcess: RawDaemonTransaction[] = this.transactionsToProcess.splice(0, 25); //process 25 tx's at a time
        if (transactionsToProcess.length > 0) {
            this.workerCurrentProcessing = transactionsToProcess;
            this.workerProcessing.postMessage({
                type: 'process',
                transactions: transactionsToProcess
            });
            ++this.workerCountProcessed;
            this.workerProcessingWorking = true;
        } else {
            clearInterval(this.intervalTransactionsProcess);
            this.intervalTransactionsProcess = 0;
        }
    }

    processTransactions(transactions: RawDaemonTransaction[]) {
        let transactionsToAdd = [];

        for (let tr of transactions) {
            if (typeof tr.blockIndex !== 'undefined')
                if (tr.blockIndex > this.wallet.lastHeight) {
                    transactionsToAdd.push(tr);
                }
        }

        this.transactionsToProcess.push.apply(this.transactionsToProcess, transactionsToAdd);
        if (this.intervalTransactionsProcess === 0) {
            let self = this;
            this.intervalTransactionsProcess = setInterval(function () {
                self.checkTransactionsInterval();
            }, this.wallet.options.readSpeed);
        }
        
    }


    lastBlockLoading = -1;
    lastMaximumHeight = 0;

    loadHistory() {
        if (this.stopped) return;
        
        if (this.lastBlockLoading === -1) this.lastBlockLoading = this.wallet.lastHeight;
        let self = this;
        //don't reload until it's finished processing the last batch of transactions
        if (this.workerProcessingWorking || !this.workerProcessingReady) {
            setTimeout(function () {
                self.loadHistory();
            }, 100);
            return;
        }
        if (this.transactionsToProcess.length > 100) {
            //to ensure no pile explosion
            setTimeout(function () {
                self.loadHistory();
            }, 2 * 1000);
            return;
        }

        //console.log('checking');
        this.explorer.getHeight().then(function (height) {
            //console.log(self.lastBlockLoading,height);
            if (height > self.lastMaximumHeight) self.lastMaximumHeight = height;

            if (self.lastBlockLoading !== height) {
                let previousStartBlock = Number(self.lastBlockLoading);
                let startBlock = Math.floor(self.lastBlockLoading / 100) * 100;
                //console.log('=>',self.lastBlockLoading, endBlock, height, startBlock, self.lastBlockLoading);
                //console.log('load block from ' + startBlock);
                self.explorer.getTransactionsForBlocks(previousStartBlock).then(function (transactions: RawDaemonTransaction[]) {
                    //to ensure no pile explosion
                    if (transactions.length > 0) {
                        let lastTx = transactions[transactions.length - 1];
                        if (typeof lastTx.blockIndex !== 'undefined') {
                            self.lastBlockLoading = lastTx.blockIndex + 1;
                        }
                    }
                    self.processTransactions(transactions);

                    setTimeout(function () {
                        self.loadHistory();
                    }, 1);
                }).catch(function () {
                    setTimeout(function () {
                        self.loadHistory();
                    }, 30 * 1000);//retry 30s later if an error occurred
                });
            } else {
                setTimeout(function () {
                    self.loadHistory();
                }, 30 * 1000);
            }
        }).catch(function () {
            setTimeout(function () {
                self.loadHistory();
            }, 30 * 1000);//retry 30s later if an error occurred
        });
    }


}

export class BlockchainExplorerRpc2 implements BlockchainExplorer {

    // testnet : boolean = true;
    randInt = Math.floor(Math.random() * Math.floor(config.apiUrl.length));
    randNodeInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
    serverAddress = config.apiUrl[this.randInt];
    nodeAddress = config.nodeList[this.randNodeInt];

    heightCache = 0;
    heightLastTimeRetrieve = 0;
    getHeight(): Promise<number> {
        if (Date.now() - this.heightLastTimeRetrieve < 20 * 1000 && this.heightCache !== 0) {
            return Promise.resolve(this.heightCache);
        }
        let self = this;
        this.heightLastTimeRetrieve = Date.now();
        return new Promise<number>(function (resolve, reject) {
            $.ajax({
                url: self.nodeAddress + 'getheight',
                method: 'POST',
                data: JSON.stringify({
                })
            }).done(function (raw: any) {
                self.heightCache = parseInt(raw.height);
                resolve(self.heightCache);
            }).fail(function (data: any) {
                reject(data);
            });
        });
    }

    scannedHeight: number = 0;

    getScannedHeight(): number {
        return this.scannedHeight;
    }

    watchdog(wallet: Wallet): WalletWatchdog {
        let watchdog = new WalletWatchdog(wallet, this);
        watchdog.loadHistory();
        return watchdog;
    }

    getTransactionsForBlocks(start_block: number): Promise<RawDaemonTransaction[]> {
        let self = this;
        let transactions: RawDaemonTransaction[] = [];
        let startBlock = Number(start_block);
        return new Promise<RawDaemonTransaction[]>(function (resolve, reject) {
            let tempHeight;
            let operator = 10;
            if (self.heightCache - startBlock > operator) {
                tempHeight = startBlock + operator;
            } else {
                tempHeight = self.heightCache;
            }
            
            let blockHeights: number[] = [];        
            for (let i = startBlock; i <= tempHeight; i++) {
                blockHeights.push(i);
            }

            self.postData(self.nodeAddress + 'json_rpc', {
                "jsonrpc": "2.0",
                "id": 0,
                "method": "getblocksbyheights",
                "params": {
                    "blockHeights": blockHeights
                }
            }).then(data => {
                for (let i = 0; i < data.result.blocks.length; i++) {
                    let finalTxs: any[] = data.result.blocks[i].transactions;
                    for (let j = 0; j < finalTxs.length; j++) {
                        let finalTx = finalTxs[j];
                        transactions.push(finalTx);
                    }
                }
                resolve(transactions);
            }).catch(error => {
                console.log('REJECT');
                try {
                    console.log(JSON.parse(error.responseText));
                } catch (e) {
                    console.log(e);
                }
                reject(error);
            });    
        
        });
    }

    getTransactionPool(): Promise<RawDaemonTransaction[]> {
        let self = this;
        return new Promise<RawDaemonTransaction[]>(function (resolve, reject) {
            self.postData(self.nodeAddress + 'json_rpc', {
                'jsonrpc': '2.0',
                'id': 0,
                'method': 'gettransactionspool',
                'params': ''
            }).then(data => {
                let rawTxs = data.result.transactions;
                let txHashes: any[] = [];

                for (let iTx = 0; iTx < rawTxs.length; iTx++) {
                    txHashes.push(rawTxs[iTx].hash);
                }

                self.postData(self.nodeAddress + 'json_rpc', {
                    "jsonrpc": "2.0",
                    "id": 0,
                    "method": "gettransactionsbyhashes",
                    "params": {
                        "transactionHashes": txHashes
                    }
                }).then(detailTx => {
                    let response = detailTx.transactions;
                    if (response !== null) {                       
                        resolve(response);
                    }
                }).catch(error => {
                    console.log('REJECT');
                    try {
                        console.log(JSON.parse(error.responseText));
                    } catch (e) {
                        console.log(e);
                    }
                    reject(error);
                });    
            });
        });    
    }

    existingOuts: any[] = [];
    getRandomOuts(nbOutsNeeded: number, initialCall = true): Promise<any[]> {
        let self = this;
        if (initialCall) {
            self.existingOuts = [];
        }

        return this.getHeight().then(function (height: number) {
            let txs: RawDaemonTransaction[] = [];
            let promises = [];

            let randomBlocksIndexesToGet: number[] = [];
            let numOuts = height;

            for (let i = 0; i < nbOutsNeeded; ++i) {
                let selectedIndex: number = -1;
                do {
                    selectedIndex = MathUtil.randomTriangularSimplified(numOuts);
                    if (selectedIndex >= height - config.txCoinbaseMinConfirms)
                        selectedIndex = -1;
                } while (selectedIndex === -1 || randomBlocksIndexesToGet.indexOf(selectedIndex) !== -1);
                randomBlocksIndexesToGet.push(selectedIndex);

                let promise = self.getTransactionsForBlocks(Math.floor(selectedIndex / 100) * 100).then(function (rawTransactions: RawDaemonTransaction[]) {
                    txs.push.apply(txs, rawTransactions);
                });
                promises.push(promise);
            }

            return Promise.all(promises).then(function () {
                let txCandidates: any = {};
                for (let iOut = 0; iOut < txs.length; ++iOut) {
                    let tx = txs[iOut];

                    if (
                        (typeof tx.blockIndex !== 'undefined' && randomBlocksIndexesToGet.indexOf(tx.blockIndex) === -1) ||
                        typeof tx.blockIndex === 'undefined'
                    ) {
                        continue;
                    }

                    for (let output_idx_in_tx = 0; output_idx_in_tx < tx.outputs.length; ++output_idx_in_tx) {
                        //let globalIndex = output_idx_in_tx;
                        //if (typeof tx.global_index_start !== 'undefined')
                        //    globalIndex += tx.global_index_start;
                        let globalIndex = tx.outputs[output_idx_in_tx].globalIndex;
                       
                        let newOut = {
                            public_key: tx.outputs[output_idx_in_tx].output.target.data.key,
                            global_index: globalIndex,
                            // global_index: count,
                        };
                        if (typeof txCandidates[tx.blockIndex] === 'undefined') txCandidates[tx.blockIndex] = [];
                        txCandidates[tx.blockIndex].push(newOut);
                    }
                }

                //console.log(txCandidates);

                let selectedOuts = [];
                for (let txsOutsHeight in txCandidates) {
                    let outIndexSelect = MathUtil.getRandomInt(0, txCandidates[txsOutsHeight].length - 1);
                    //console.log('select ' + outIndexSelect + ' for ' + txsOutsHeight + ' with length of ' + txCandidates[txsOutsHeight].length);
                    selectedOuts.push(txCandidates[txsOutsHeight][outIndexSelect]);
                }

                //console.log(selectedOuts);

                return selectedOuts;
            });
        });
    }

    sendRawTx(rawTx: string) {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.postData(self.nodeAddress + 'sendrawtransaction', {
                tx_as_hex: rawTx,
                do_not_relay: false
            }).then(transactions => {
                if (transactions.status && transactions.status == 'OK') {
                    resolve(transactions);
                } else {
                    reject(transactions);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    resolveOpenAlias(domain: string): Promise<{ address: string, name: string | null }> {
        let self = this;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: self.serverAddress + 'openAlias.php?domain=' + domain,
                method: 'GET',
            }).done(function (response: any) {
                resolve(response);
            }).fail(function (data: any) {
                reject(data);
            });
        });
    }

    async postData(url: string, data: any) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        return response.json();
    }

}