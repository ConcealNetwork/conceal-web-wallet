/**
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2023, The Conceal Network
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
  timestamp: Date; 
  transactions: RawDaemon_Transaction[];
}   

type ProcessingCallback = (blockNumber: number) => void;

class TxQueue {
  wallet: Wallet;
  isRunning: boolean;
  maxBlockNum: number;
  transactions: RawDaemon_Transaction[];
  processingCallback: ProcessingCallback;

  constructor(wallet: Wallet, processingCallback: ProcessingCallback) {
    this.wallet = wallet;
    this.isRunning = false;
    this.maxBlockNum = 0;
    this.transactions = [];
    this.processingCallback = processingCallback;
  }
  
  processTransaction = (): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      if (this.transactions.length > 0) {
        let transaction = TransactionsExplorer.parse(this.transactions.shift()!, this.wallet);

        if (transaction) {
          logDebugMsg("Added new transaction", transaction);
          this.wallet.addNew(transaction);   
          this.processingCallback(transaction.blockHeight);       
          resolve(true);
        }
      } else {
        resolve(false);
      }     
    });
  }

  runProcessLoop = () => {
    if (!this.isRunning) {
      this.isRunning = true;

      (async function loop(self) {
        if (self.isRunning) {
          try {
            self.isRunning = await self.processTransaction();
            await new Promise(r => setTimeout(r, 5));
            await loop(self);
          } catch(err) {
            console.error('Error on single processTransaction iteration', err);
            await loop(self);
          }              
        } else {
          self.processingCallback(self.maxBlockNum);
        }
      }(this));
    }
  }

  stopProcessLoop = () => {
    this.isRunning = false;
  }

  addTransactions = (transactions: RawDaemon_Transaction[], maxBlockNum: number) => {
    this.transactions = this.transactions.concat(transactions);
    this.maxBlockNum = Math.max(this.maxBlockNum, maxBlockNum);
    this.runProcessLoop();
  }

  getSize = (): number => {
    return this.transactions.length; 
  }
}

class BlockList {  
  blocks: IBlockRange[];
  wallet: Wallet;
  txQueue: TxQueue;
  chainHeight: number;
  watchdog: WalletWatchdog;

  constructor(wallet: Wallet, watchdog: WalletWatchdog) {
    this.blocks = [];
    this.wallet = wallet;
    this.chainHeight = 0;
    this.watchdog = watchdog;
    this.txQueue = new TxQueue(wallet, (blockNumber: number) => {
      this.wallet.lastHeight = Math.min(this.chainHeight, Math.max(this.wallet.lastHeight, blockNumber));
      this.watchdog.checkMempool();            
    });
  }

  addBlockRange = (startBlock: number, endBlock: number, chainHeight: number) => {   
    this.chainHeight = Math.max(this.chainHeight, chainHeight);

    let rangeData: IBlockRange = {
      startBlock: startBlock,
      endBlock: endBlock,
      finished: false,
      timestamp: new Date(),
      transactions: []
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

  finishBlockRange = (lastBlock: number, transactions: RawDaemon_Transaction[]) => {
    if (lastBlock > -1) {
      for (let i = 0; i < this.blocks.length; ++i) {
        if (lastBlock <= this.blocks[i].endBlock) {
          this.blocks[i].transactions = transactions.slice();
          this.blocks[i].finished = true;
          break;
        }
      }

      // remove all finished block
      while (this.blocks.length > 0) {
        if (this.blocks[0].finished) {
          let block = this.blocks.shift()!;
          // add any transactions to the wallet 
          this.txQueue.addTransactions(block.transactions.slice(), block.endBlock);
        } else {
          break;
        }
      }    
    }
  }

  getFirstIdleRange = (reset: boolean): IBlockRange | null => {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (!this.blocks[i].finished) {
        let timeDiff: number = new Date().getTime() - this.blocks[i].timestamp.getTime();
        if ((timeDiff / 1000) > 60) {
          if (reset) { this.blocks[i].timestamp = new Date(); }        
          return this.blocks[i];
        }
      } else {
        return null;
      }
    }

    // none found
    return null;
  }

  getTxQueue = (): TxQueue => {
    return this.txQueue;
  }

  getSize = (): number => {
    return this.blocks.length;
  }  
}

class ParseWorker {  
  wallet: Wallet;
  isReady: boolean;
  watchdog: WalletWatchdog;
  isWorking: boolean;
  blockList: BlockList; 
  workerProcess: Worker;
  countProcessed: number;
  
  constructor(wallet: Wallet, watchdog: WalletWatchdog, blockList: BlockList) {
    this.blockList = blockList;
    this.watchdog = watchdog;
    this.wallet = wallet;

    this.workerProcess = this.initWorker();
    this.countProcessed = 0;
    this.isWorking = false;
    this.isReady = false;   
  }
  
  initWorker = (): Worker => {    
    this.workerProcess = new Worker('./workers/TransferProcessingEntrypoint.js');
    this.workerProcess.onmessage = (data: MessageEvent)  => {
      let message: string | any = data.data;
      if (message === 'ready') {
        logDebugMsg('worker ready...');
        // signal the wallet update
        this.watchdog.checkMempool();
        // post the wallet to the worker
        this.workerProcess.postMessage({
          type: 'initWallet',
          keys: this.wallet.keys
        });
      } else if (message === "missing_wallet_keys") {
        logDebugMsg("Wallet keys are missing for the worker...");
      } else if (message.type) {
        if (message.type === 'readyWallet') {
          this.setIsReady(true);
        } else if (message.type === 'processed') {
          // we are done processing now
          this.blockList.finishBlockRange(message.maxHeight, message.transactions);
          this.setIsWorking(false);
        }
      }
    };

    return this.workerProcess;
  }

  terminateWorker = () => {
    this.workerProcess.terminate();
    this.countProcessed = 0;
    this.isWorking = false;
    this.isReady = false;
  }    

  getWorker = (): Worker => {
    return this.workerProcess;
  }

  getIsReady = (): boolean => {
    return this.isReady;
  }

  getIsWorking = (): boolean => {
    return this.isWorking;
  }

  setIsReady = (value: boolean) => {
    this.isReady = value;
  }

  setIsWorking = (value: boolean) => {
    this.isWorking = value;
  }

  getProcessed = (): number => {
    return this.countProcessed;
  }

  incProcessed = () => {
    ++this.countProcessed;  
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

		return new Promise<any>((resolve, reject) => {      
      this.explorer.getTransactionsForBlocksEx(startBlock, endBlock, this.url, false).then((transactions: RawDaemon_Transaction[]) => {
        if (transactions.length > 0) {
          let lastTx = transactions[transactions.length - 1];

          if (typeof lastTx.height == 'undefined') {
            throw "Invalid last block!";
          }        
        }

        // report the transactions
        resolve(transactions);
      }).catch((err) => { 
        ++this.errors;
        reject(startBlock);
      }).finally(() => {
        this.isWorking = false;
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
  stopped: boolean = false;
  blockList: BlockList;
  explorer: BlockchainExplorer;
  syncWorkers: SyncWorker[] = [];
  parseWorkers: ParseWorker[] = [];  
  intervalMempool: any = 0;
  lastBlockLoading: number = -1;
  lastMaximumHeight: number = 0;
  intervalTransactionsProcess: any = 0;
  transactionsToProcess: RawDaemon_Transaction[][] = [];  

  constructor(wallet: Wallet, explorer: BlockchainExplorer) {
    let cpuCores = Math.min(window.navigator.hardwareConcurrency ? (Math.max(window.navigator.hardwareConcurrency - 1, 1)) : 1, config.maxWorkerCores);
    let randomNodes = this.getMultipleRandom(config.nodeList, Math.min(config.maxRemoteNodes, config.nodeList.length, cpuCores + 1));

    this.wallet = wallet;
    this.explorer = explorer;
    this.blockList = new BlockList(wallet, this);

    // set the default node for session
    if (this.wallet.options.customNode) {
      config.nodeUrl = this.wallet.options.nodeUrl;
    } else {
      let randNodeInt:number = Math.floor(Math.random() * Math.floor(config.nodeList.length));
      config.nodeUrl = config.nodeList[randNodeInt];
    }

    // create parse workers
    for (let i = 0; i < cpuCores; ++i) {
      let parseWorker: ParseWorker = new ParseWorker(wallet, this, this.blockList);
      this.parseWorkers.push(parseWorker);
    }    

    // create a worker for each random node
    for (let i = 0; i < randomNodes.length; ++i) {
      this.syncWorkers.push(new SyncWorker(randomNodes[i], explorer));
    }        

    // init the mempool
    this.initMempool();

    // set the interval for checking the new transactions
    this.intervalTransactionsProcess = setInterval(() => {
      this.checkTransactionsInterval();
    }, this.wallet.options.readSpeed);

  }

  signalWalletUpdate = () => {
    logDebugMsg('wallet update in progress');

    // reset the last block loading
    this.lastBlockLoading = -1;//reset scanning

    // set the default node for session
    if (this.wallet.options.customNode) {
      config.nodeUrl = this.wallet.options.nodeUrl;
    } else {
      let randNodeInt:number = Math.floor(Math.random() * Math.floor(config.nodeList.length));
      config.nodeUrl = config.nodeList[randNodeInt];
    }   
    
    this.checkMempool();
  }  

  initMempool = (force: boolean = false) => {
    if (this.intervalMempool === 0 || force) {
      if (force && this.intervalMempool !== 0) {
        clearInterval(this.intervalMempool);
      }

      this.intervalMempool = setInterval(() => {
        this.checkMempool();
      }, config.avgBlockTime / 2 * 1000);
    }
    this.checkMempool();
  }  

  stop = () => {
    clearInterval(this.intervalTransactionsProcess);
    this.transactionsToProcess = [];
    clearInterval(this.intervalMempool);
    this.stopped = true;
  }

  checkMempool = (): boolean => {
    if (((this.lastMaximumHeight - this.wallet.lastHeight) > 1) && (this.lastMaximumHeight > 0))  { //only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
      return false;
    }

    this.wallet.txsMem = [];
    this.explorer.getTransactionPool().then((pool: any) => {
      if (typeof pool !== 'undefined') {
        for (let rawTx of pool) {
          let tx = TransactionsExplorer.parse(rawTx, this.wallet);
          if (tx !== null) {
            this.wallet.txsMem.push(tx);
          }
        }
      }
    }).catch((err) => {
      console.log(err)
    });

    return true;
  }

  checkTransactionsInterval = () => {
    //somehow we're repeating and regressing back to re-process Tx's
    //loadHistory getting into a stack overflow ?
    //need to work out timings and ensure process does not reload when it's already running...

    if (this.transactionsToProcess.length > 0) {
      for (let i = 0; i < this.parseWorkers.length; ++i) {
        if (!(this.parseWorkers[i].getIsWorking() || !this.parseWorkers[i].getIsReady())) {
          //we destroy the worker in charge of decoding the transactions every 5k transactions to ensure the memory is not corrupted
          //cnUtil bug, see https://github.com/mymonero/mymonero-core-js/issues/8
          if (this.parseWorkers[i].getProcessed() >= 5 * 1000) {
            this.parseWorkers[i].terminateWorker();
            this.parseWorkers[i].initWorker();
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
            this.parseWorkers[i].setIsWorking(true);
            this.parseWorkers[i].getWorker().postMessage({
              type: 'process',
              wallet: this.wallet.exportToRaw(),
              transactions: transactionsToProcess,
              readMinersTx: this.wallet.options.checkMinerTx
            });
            this.parseWorkers[i].incProcessed();
          }
        }
      }
    }
  }

  processTransactions(transactions: RawDaemon_Transaction[], callback: Function) {
    logDebugMsg(`processTransactions called...`, transactions);
    // add the raw transaction to the processing FIFO list
    this.transactionsToProcess.push(transactions);
    // signal we are finished
    callback();
  }

  getMultipleRandom = (arr: any[], num: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }   
  
  getFreeWorker = (): SyncWorker | null => {
    for (let i = 0; i < this.syncWorkers.length; ++i) {
      if (!this.syncWorkers[i].getIsWorking() && !this.syncWorkers[i].getHasToManyErrors()) {
        return this.syncWorkers[i];
      }
    }     
    return null;
  }

  getBlockList = (): BlockList => {
    return this.blockList;
  }

  getLastBlockLoading = (): number => {
    return this.lastBlockLoading;
  } 

  fetchBlocks = (worker: SyncWorker, startBlock: number, endBlock: number): Promise<{transactions: RawDaemon_Transaction[], lastBlock: number}> => {
    return new Promise<{transactions: RawDaemon_Transaction[], lastBlock: number}>((resolve, reject) => {
      (async function(self) {
        let currWorker: SyncWorker | null = worker;
        let failed: boolean = false;

        while (currWorker) {
          try {
            let txResult = await currWorker.fetchBlocks(startBlock, endBlock);            
            currWorker = null;           
            failed = false;

            resolve({
              transactions: txResult,
              lastBlock: endBlock
            }); 
          } catch {
            currWorker = self.getFreeWorker();
            failed = true;
          }
        }

        // if we are here we failed
        if (!currWorker && failed) {
          reject({
            transactions: [],
            lastBlock: startBlock
          });        
        }
      })(this);
    });
  }

  loadHistory = async () => {
    (async function(self) {  
      while (!self.stopped) {
        try {
          if (self.lastBlockLoading === -1) {
            self.lastBlockLoading = self.wallet.lastHeight;
          }

          // check if transactions to process stack is to big
          if (self.transactionsToProcess.length > 500) {
            logDebugMsg(`Having more then 500 TX packets in FIFO queue`, self.transactionsToProcess.length);
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }

          // check if block range list is to big
          if (self.blockList.getSize() > 50) {
            logDebugMsg('Block range list is to big', self.blockList.getSize());
            await new Promise(r => setTimeout(r, 5000));
            continue;
          }

          // get the current height of the chain
          let height = await self.explorer.getHeight();

          // make sure we are not ahead of chain
          if (self.lastBlockLoading > height) {
            self.lastBlockLoading = height;
          }

          if (height > self.lastMaximumHeight) {
            self.lastMaximumHeight = height;
          } else {
            if (self.wallet.lastHeight >= self.lastMaximumHeight) {
              await new Promise(r => setTimeout(r, 1000));
              continue;
            }
          }
      
          if (self.lastBlockLoading < height) {
            let startBlock: number = Number(self.lastBlockLoading);
            let endBlock: number = startBlock + config.syncBlockCount;
            let freeWorker: SyncWorker | null = self.getFreeWorker();
            // make sure endBlock is not over current height
            endBlock = Math.min(endBlock, height + 1);
    
            if (startBlock > self.lastMaximumHeight) {
              startBlock = self.lastMaximumHeight;
            }
    
            if (freeWorker) {
              // first check if we have any stale ranges available
              let idleRange = self.blockList.getFirstIdleRange(true);

              if (idleRange) {
                logDebugMsg('Found idle block range', idleRange);
                startBlock = idleRange.startBlock;
                endBlock = idleRange.endBlock;
              } else {
                // add the blocks to be processed to the block list
                self.blockList.addBlockRange(startBlock, endBlock, height);
                self.lastBlockLoading = Math.max(self.lastBlockLoading, endBlock); 
              }
    
              // try to fetch the block range with a currently selected sync worker
              self.fetchBlocks(freeWorker, startBlock, endBlock).then(function(blockData: {transactions: RawDaemon_Transaction[], lastBlock: number}) {
                if (blockData.transactions.length > 0) {
                  self.processTransactions(blockData.transactions, function() {});
                } else {
                  self.blockList.finishBlockRange(blockData.lastBlock, []);
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
