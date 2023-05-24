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

interface IBlockRange {
  startBlock: number;
  endBlock: number;
  finished: boolean;
}   

class BlockList {  
  blocks: IBlockRange[];
  wallet: Wallet;

  constructor(wallet: Wallet) {
    this.blocks = [];
    this.wallet = wallet;
  }

  addBlockRange = (startBlock: number, endBlock: number) => {   
    let rangeData: IBlockRange = {
      startBlock: startBlock,
      endBlock: endBlock,
      finished: false
    }

    if (this.blocks.length > 0) {
      for (var i = this.blocks.length - 1; i >= 0; i--) {
        if ((startBlock === this.blocks[i].startBlock) && (endBlock === this.blocks[i].endBlock)) {
          return;
        } else if (endBlock > this.blocks[i].endBlock) {
          if (i = this.blocks.length) {
            this.blocks.push(rangeData);
          } else {
            this.blocks.splice(i + 1, 0, rangeData);
          }

          break;
        }
      }
    } else {
      this.blocks.push(rangeData);
    }
  }

  finishBlockRange = (lastBlock: number) => {
    if (lastBlock > -1) {
      for (var i = this.blocks.length - 1; i >= 0; i--) {
        if ((lastBlock >= this.blocks[i].startBlock) && (lastBlock <= this.blocks[i].endBlock)) {
          this.blocks[i].finished = true;
          break;
        }
      }

      let maxBlock = -1;
      // remove all finished block
      while (this.blocks.length > 0) {
        if (this.blocks[0].finished) {
          maxBlock = this.blocks[0].endBlock;
          this.blocks.shift()!;
        } else {
          break;
        }
      }    

      if (maxBlock > -1) { 
        this.wallet.lastHeight = maxBlock; 
      }
    }
  }
}

class WatchdogWorkers {  
  wallet: Wallet;
  instances: number;
  watchdog: WalletWatchdog;
  blockList: BlockList; 
  workersProcessing: Worker[];
  workersCountProcessed: number[] = [];
  workersProcessingReady: boolean[] = [];
  workersProcessingWorking: boolean[] = [];
  
  constructor(instances: number, wallet: Wallet, watchdog: WalletWatchdog, blockList: BlockList) {
    this.instances = instances;
    this.blockList = blockList;
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
          this.setIsReady(message.wrkIndex, true);
        } else if (message.type === 'processed') {
          let transactions = message.transactions;
          
          if (transactions.length > 0) {
            for (let tx of transactions)
            this.wallet.addNew(Transaction.fromRaw(tx));
              this.watchdog.signalWalletUpdate();
          }

          // we are done processing now
          this.blockList.finishBlockRange(message.maxHeight);
          this.setIsWorking(message.wrkIndex, false);
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

  getIsReady = (index: number): boolean => {
    return this.workersProcessingReady[index];
  }

  getIsWorking = (index: number): boolean => {
    return this.workersProcessingWorking[index];
  }

  setIsReady = (index: number, value: boolean) => {
    this.workersProcessingReady[index] = value;
  }

  setIsWorking = (index: number, value: boolean) => {
    this.workersProcessingWorking[index] = value;
  }

  getProcessed = (index: number): number => {
    return this.workersCountProcessed[index];
  }

  incProcessed = (index: number) => {
    ++this.workersCountProcessed[index];  
  }

  getCount = (): number => {
    return this.instances;
  }
}

class SyncWorker {  
  url: string;
  errors: number;
  isWorking: boolean;
  explorer: BlockchainExplorer;
  errorInterval: NodeJS.Timer;
  
  constructor(url: string, explorer: BlockchainExplorer) {
    this.url = url;
    this.errors = 0;
    this.isWorking = false;
    this.explorer = explorer;

    this.errorInterval = setInterval(() => {
      this.errors = Math.max(this.errors - 1, 0);
    }, 60 * 1000);
  }

  fetchBlocks = (startBlock: number, endBlock: number): Promise<any> => {
    this.isWorking = true;
    let self = this;

		return new Promise<any>(function (resolve, reject) {      
      self.explorer.getTransactionsForBlocksEx(startBlock, endBlock, self.url, false).then(function(transactions: RawDaemon_Transaction[]) {
        if (transactions.length > 0) {
          let lastTx = transactions[transactions.length - 1];

          if (typeof lastTx.height == 'undefined') {
            throw "Invalid last block!";
          }        
        }

        // report the transactions
        resolve(transactions);
      }).catch(function(err) { 
        ++self.errors;
        reject(startBlock);
      }).finally(function() {
        self.isWorking = false;
      });
    });
  }

  getIsWorking = (): boolean => {
    return this.isWorking;
  }

  getHasToManyErrors = (): boolean => {
    return this.errors > 5;
  }

  getNodeUrl = (): string => {
    return this.url;
  }
}

export class WalletWatchdog {
  wallet: Wallet;
  blockList: BlockList;
  explorer: BlockchainExplorer;
  syncWorkers: SyncWorker[] = [];
  watchdogWorkers: WatchdogWorkers;  
  lastBlockLoading: number = -1;
  lastMaximumHeight: number = 0;
  intervalTransactionsProcess: any = 0;
  transactionsToProcess: RawDaemon_Transaction[][] = [];  

  constructor(wallet: Wallet, explorer: BlockchainExplorer) {
    let cpuCores = Math.min(window.navigator.hardwareConcurrency ? (Math.max(window.navigator.hardwareConcurrency - 1, 1)) : 1, config.maxWorkerCores);
    let randomNodes = this.getMultipleRandom(config.nodeList, Math.min(config.maxRemoteNodes, config.nodeList.length, cpuCores + 1));

    this.wallet = wallet;
    this.explorer = explorer;
    this.blockList = new BlockList(wallet);
    this.watchdogWorkers = new WatchdogWorkers(cpuCores, wallet, this, this.blockList);
    this.watchdogWorkers.initWorkers();
    this.initMempool();

    // create a worker for each random node
    for (let i = 0; i < randomNodes.length; ++i) {
      this.syncWorkers.push(new SyncWorker(randomNodes[i], explorer));
    }    
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

  initMempool = (force: boolean = false) => {
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

  stop = () => {
    clearInterval(this.intervalTransactionsProcess);
    this.transactionsToProcess = [];
    clearInterval(this.intervalMempool);
    this.stopped = true;
  }

  checkMempool = (): boolean => {
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

  checkTransactionsInterval = () => {
    //somehow we're repeating and regressing back to re-process Tx's
    //loadHistory getting into a stack overflow ?
    //need to work out timings and ensure process does not reload when it's already running...

    if (this.transactionsToProcess.length > 0) {
      for (let i = 0; i < this.watchdogWorkers.getCount(); ++i) {
        if (!(this.watchdogWorkers.getIsWorking(i) || !this.watchdogWorkers.getIsReady(i))) {
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
            this.watchdogWorkers.setIsWorking(i, true);
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

  getMultipleRandom = (arr: any[], num: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }   
  
  getFreeWorker = (): any => {
    for (let i = 0; i < this.syncWorkers.length; ++i) {
      if (!this.syncWorkers[i].getIsWorking() && !this.syncWorkers[i].getHasToManyErrors()) {
        return this.syncWorkers[i];
      }
    }     
    return null;
  }

  fetchBlocks = (worker: SyncWorker, startBlock: number, endBlock: number): Promise<{transactions: RawDaemon_Transaction[], lastBlock: number}> => {
    let self = this;

    return new Promise<{transactions: RawDaemon_Transaction[], lastBlock: number}>(function (resolve, reject) {
      (async function() {
        let currWorker: any = worker;

        while (currWorker) {
          try {
            let txResult = await currWorker.fetchBlocks(startBlock, endBlock);            
            resolve({
              transactions: txResult,
              lastBlock: endBlock
            }); 
            currWorker = null;           
          } catch(lastBlock) {
            currWorker = self.getFreeWorker();
          }
        }

        // if we are here we failed
        if (!currWorker) {
          reject({
            transactions: [],
            lastBlock: startBlock
          });        
        }
      })();
    });
  }

  loadHistory = async () => {
    (async function(self) {  
      while (!self.stopped) {
        try {
          if (self.lastBlockLoading === -1) {
            self.lastBlockLoading = self.wallet.lastHeight;
          }
      
          if (self.transactionsToProcess.length > 500) {
            logDebugMsg(`Having more then 500 TX packets in FIFO queue`, self.transactionsToProcess.length);
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }

          // get the current height of the chain
          let height = await self.explorer.getHeight();

          if (height > self.lastMaximumHeight) {
            self.lastMaximumHeight = height;
          } else {
            if (self.wallet.lastHeight >= self.lastMaximumHeight) {
              await new Promise(r => setTimeout(r, 1000));
              continue;
            }
          }
      
          if (self.lastBlockLoading < height) {
            let startBlock: number = Number(self.lastBlockLoading) + 1;
            let endBlock: number = startBlock + config.syncBlockCount;
            let freeWorker: SyncWorker = self.getFreeWorker();
    
            if (startBlock > self.lastMaximumHeight) {
              startBlock = self.lastMaximumHeight;
            }
    
            if (freeWorker) {
              // add the blocks to be processed to the block list
              self.blockList.addBlockRange(startBlock, endBlock);
              self.lastBlockLoading = Math.max(self.lastBlockLoading, endBlock); 
    
              // try to fetch the block range with a currently selected sync worker
              self.fetchBlocks(freeWorker, startBlock, endBlock).then(function(blockData: {transactions: RawDaemon_Transaction[], lastBlock: number}) {
                if (blockData.transactions.length > 0) {
                  self.processTransactions(blockData.transactions, function() {});
                } else {
                  self.blockList.finishBlockRange(blockData.lastBlock);
                }
              });
            } else {
              await new Promise(r => setTimeout(r, 500));
            }         
          } else {
            await new Promise(r => setTimeout(r, 30 * 1000));
          }
        } catch(err) {
          logDebugMsg(`Error occured in loadHistory...`);
          await new Promise(r => setTimeout(r, 230 * 1000000)); //retry 30s later if an error occurred
        }    
      }
    })(this);    
  }
}
