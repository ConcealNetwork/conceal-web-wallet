/**
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Conceal Network
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {Wallet} from "./Wallet";
import {BlockchainExplorer, RawDaemon_Transaction} from "./blockchain/BlockchainExplorer";
import {Transaction} from "./Transaction";
import {TransactionsExplorer} from "./TransactionsExplorer";

class WatchdogWorker {  
  wallet: Wallet;
  instances: number;
  watchdog: WalletWatchdog;
  workersProcessing: Worker[];
  workersCountProcessed: number[] = [];
  workersProcessingReady: boolean[] = [];
  workersProcessingWorking: boolean[] = [];
  
  constructor(instances: number, wallet: Wallet, watchdog: WalletWatchdog) {
    this.instances = instances;
    this.watchdog = watchdog;
    this.wallet = wallet;

    this.workersProcessing = new Array(instances);
    this.workersCountProcessed = new Array(instances);
    this.workersProcessingReady = new Array(instances);
    this.workersProcessingWorking = new Array(instances);

    for (let i = 0; i < instances; ++i) {
      this.workersCountProcessed[i] = 0;
      this.workersProcessingReady[i] = false;
      this.workersProcessingWorking[i] = false;
    }
  }
  
  initWorker = (index: number) => {    
    if (this.wallet.options.customNode) {
      config.nodeUrl = this.wallet.options.nodeUrl;
    } else {
      let randNodeInt:number = Math.floor(Math.random() * Math.floor(config.nodeList.length));
      config.nodeUrl = config.nodeList[randNodeInt];
    }

    this.workersProcessing[index] = new Worker('./workers/TransferProcessingEntrypoint.js');
    this.workersProcessing[index].onmessage = (data: MessageEvent)  => {
      let message: string | any = data.data;
      if (message === 'ready') {
        logDebugMsg('worker ready');
        this.watchdog.signalWalletUpdate();
      } else if (message.type) {
        if (message.type === 'readyWallet') {
          this.setReady(message.wrkIndex, true);
        } else if (message.type === 'processed') {
          let transactions = message.transactions;
          if (transactions.length > 0) {
            for (let tx of transactions)
            this.wallet.addNew(Transaction.fromRaw(tx));
              this.watchdog.signalWalletUpdate();
          }

          // we are done processing now
          this.setWorking(message.wrkIndex, false);
        }
      }
    };
  }

  initWorkers = () => {
    for (let i = 0; i < this.getCount(); ++i) {
      this.initWorker(i);
    }
  }

  terminateWorker = (index: number) => {
    this.workersProcessing[index].terminate();
    this.workersProcessingWorking[index] = false;
    this.workersProcessingReady[index] = false;
    this.workersCountProcessed[index] = 0;
  }

  getWorker = (index: number): Worker => {
    return this.workersProcessing[index];
  }

  getReady = (index: number): boolean => {
    return this.workersProcessingReady[index];
  }

  getWorking = (index: number): boolean => {
    return this.workersProcessingWorking[index];
  }

  setReady = (index: number, value: boolean) => {
    this.workersProcessingReady[index] = value;
  }

  setWorking = (index: number, value: boolean) => {
    this.workersProcessingWorking[index] = value;
  }

  getProcessed = (index: number): number => {
    return this.workersCountProcessed[index];
  }

  incProcessed = (index: number) => {
    ++this.workersCountProcessed[index];  
  }

  available(): boolean {
    for (let i = 0; i < this.getCount(); ++i) {     
      if (!(this.getWorking(i) || !this.getReady(i))) {
        console.log(`worker ${i} IS available`);
        return true;
      }
    }

    console.log("worker IS NOT available");
    return false;
  }

  getCount = (): number => {
    return this.instances;
  }
}

export class WalletWatchdog {
  wallet: Wallet;
  explorer: BlockchainExplorer;
  watchdogWorkers: WatchdogWorker;
  lastBlockLoading: number = -1;
  lastMaximumHeight: number = 0;
  intervalTransactionsProcess: any = 0;
  transactionsToProcess: RawDaemon_Transaction[][] = [];

  constructor(wallet: Wallet, explorer: BlockchainExplorer) {
    let cpuCores = Math.max(window.navigator.hardwareConcurrency ? (window.navigator.hardwareConcurrency - 1) : 1, 4);
    console.log("cpuCores", cpuCores);

    this.wallet = wallet;
    this.explorer = explorer;
    this.watchdogWorkers = new WatchdogWorker(cpuCores, wallet, this);
    this.watchdogWorkers.initWorkers();
    this.initMempool();
  }

  signalWalletUpdate() {
    let self = this;
    logDebugMsg('wallet update in progress');
    this.lastBlockLoading = -1;//reset scanning

    if (this.wallet.options.customNode) {
      config.nodeUrl = this.wallet.options.nodeUrl;
    } else {
      let randNodeInt:number = Math.floor(Math.random() * Math.floor(config.nodeList.length));
      config.nodeUrl = config.nodeList[randNodeInt];
    }


    for (let i = 0; i < this.watchdogWorkers.getCount(); ++i) {
      this.watchdogWorkers.getWorker(i).postMessage({
        type: 'initWallet',
        wrkIndex: i,
        wallet: this.wallet.exportToRaw()
      });
    }

    clearInterval(this.intervalTransactionsProcess);
    this.intervalTransactionsProcess = setInterval(function () {
      self.checkTransactionsInterval();
    }, this.wallet.options.readSpeed);

    //force mempool update after a wallet update (new tx, ...)
    self.checkMempool();
  }

  intervalMempool: any = 0;

  initMempool(force: boolean = false) {
    let self = this;
    if (this.intervalMempool === 0 || force) {
      if (force && this.intervalMempool !== 0) {
        clearInterval(this.intervalMempool);
      }

      this.intervalMempool = setInterval(function () {
        self.checkMempool();
      }, config.avgBlockTime / 2 * 1000);
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
    if (this.lastMaximumHeight - this.lastBlockLoading > 1) { //only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
      return false;
    }

    this.wallet.txsMem = [];
    this.explorer.getTransactionPool().then(function (pool: any) {
      if (typeof pool !== 'undefined') {
        for (let rawTx of pool) {
            let tx = TransactionsExplorer.parse(rawTx, self.wallet);
            if (tx !== null) {
                self.wallet.txsMem.push(tx);
            }
        }
      }
    }).catch(function (err) {
      console.log(err)
    });

    return true;
  }

  checkTransactionsInterval() {
    //somehow we're repeating and regressing back to re-process Tx's
    //loadHistory getting into a stack overflow ?
    //need to work out timings and ensure process does not reload when it's already running...

    for (let i = 0; i < this.watchdogWorkers.getCount(); ++i) {
      if (this.transactionsToProcess.length > 0) {
        if (!(this.watchdogWorkers.getWorking(i) || !this.watchdogWorkers.getReady(i))) {
          console.log("procesing worker:", i);
          //we destroy the worker in charge of decoding the transactions every 5k transactions to ensure the memory is not corrupted
          //cnUtil bug, see https://github.com/mymonero/mymonero-core-js/issues/8
          if (this.watchdogWorkers.getProcessed(i) >= 5 * 1000) {
            this.watchdogWorkers.terminateWorker(i);
            this.watchdogWorkers.initWorker(i);
            logDebugMsg('Recreated worker..');
            return;
          }

          // define the transactions we need to process
          var transactionsToProcess: RawDaemon_Transaction[] = [];

          if (this.transactionsToProcess.length > 0) {
            transactionsToProcess = this.transactionsToProcess.shift()!;
          }

          // check if we have anything to process and log it if in debug more
          logDebugMsg('checkTransactionsInterval', 'Transactions to be processed', transactionsToProcess);

          if (transactionsToProcess.length > 0) {
            this.watchdogWorkers.setWorking(i, true);
            this.watchdogWorkers.getWorker(i).postMessage({
              type: 'process',
              wrkIndex: i,
              transactions: transactionsToProcess
            });
            this.watchdogWorkers.incProcessed(i);
          } else {
            clearInterval(this.intervalTransactionsProcess);
            this.intervalTransactionsProcess = 0;
          }
        }
      }
    }
  }

  processTransactions(transactions: RawDaemon_Transaction[], callback: Function) {
    logDebugMsg(`processTransactions called...`, transactions);

    // add the raw transaction to the processing FIFO list
    this.transactionsToProcess.push(transactions);

    if (this.intervalTransactionsProcess === 0) {
      let self = this;
      this.intervalTransactionsProcess = setInterval(function () {
        self.checkTransactionsInterval();
      }, this.wallet.options.readSpeed);
    }

    // signal we are finished
    callback();
  }

  loadHistory() {
    if (this.stopped) return;
    let self = this;

    if (this.lastBlockLoading === -1) {
      this.lastBlockLoading = this.wallet.lastHeight;
    }

    //don't reload until it's finished processing the last batch of transactions
    if (!this.watchdogWorkers.available()) {
      logDebugMsg(`Cannot process, need to wait, all workers are busy...`);
        setTimeout(function () {
          self.loadHistory();
        }, 1000);
        return;
    }

    if (this.transactionsToProcess.length > 500) {
      logDebugMsg(`Having more then 500 TX packets in FIFO queue`, this.transactionsToProcess.length);
        //to ensure no pile explosion
        setTimeout(function () {
          self.loadHistory();
        }, 2 * 1000);
        return;
    }

    this.explorer.getHeight().then(function (height) {
      if (height > self.lastMaximumHeight) {
        self.lastMaximumHeight = height;
      } else {
        if (self.wallet.lastHeight >= self.lastMaximumHeight) {
          setTimeout(function () {
            self.loadHistory();
          }, 1000);
          return;
        }
      }

      console.log("heights", self.lastBlockLoading, self.wallet.lastHeight, self.lastMaximumHeight);

      // we are only here if the block is actually increased from last processing
      if (self.lastBlockLoading === -1) { 
        self.lastBlockLoading = self.wallet.lastHeight;
      }

      if (self.lastBlockLoading !== height) {
        let previousStartBlock = Number(self.lastBlockLoading);

        if (previousStartBlock > self.lastMaximumHeight) {
          previousStartBlock = self.lastMaximumHeight;
        }

        self.explorer.getTransactionsForBlocksEx(previousStartBlock, height, self.wallet.options.checkMinerTx).then(function (rawTxData: { transactions: any[], endBlock: number }) {
          console.log("getTransactionsForBlocksEx", rawTxData);          

          if (rawTxData.transactions.length > 0) {
            let lastTx = rawTxData.transactions[rawTxData.transactions.length - 1];

            if (typeof lastTx.height !== 'undefined') {
              console.log("processed blocks:", lastTx.height - self.lastBlockLoading);
              self.lastBlockLoading = lastTx.height + 1;

              self.processTransactions(rawTxData.transactions, function() {
                self.wallet.lastHeight = rawTxData.endBlock;

                setTimeout(function () {
                  self.loadHistory();
                }, 1);
              });
            } else {
              throw "Invalid last block!";
            }            
          } else {
            let timeout = (rawTxData.endBlock < height) ? 1 : (30 * 1000)
            self.wallet.lastHeight = rawTxData.endBlock;
            self.lastBlockLoading = rawTxData.endBlock;
  
            setTimeout(function () {
              self.loadHistory();
            }, timeout);
          }
        }).catch(function (e) {
          logDebugMsg(`Error occured in loadHistory...`, e.message);

          setTimeout(function () {
            self.loadHistory();
          }, 30 * 1000);//retry 30s later if an error occurred
        });
      } else {
        setTimeout(function () {
          self.loadHistory();
        }, 30 * 1000);
      }
    }).catch(function (e) {
      logDebugMsg(`Error occured in loadHistory...`, e.message);

      setTimeout(function () {
        self.loadHistory();
      }, 30 * 1000);//retry 30s later if an error occurred
    });
  }
}
