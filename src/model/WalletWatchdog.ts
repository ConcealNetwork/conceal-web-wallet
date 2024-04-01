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
import {Transaction, TransactionData, Deposit} from "./Transaction";
import {TransactionsExplorer} from "./TransactionsExplorer";

interface IBlockRange {
  startBlock: number;
  endBlock: number;
  finished: boolean;
  timestamp: Date;
  transactions: RawDaemon_Transaction[];
}

interface ITxQueueItem {
  transactions: RawDaemon_Transaction[];
  maxBlockNum: number;
}

type ProcessingCallback = (blockNumber: number) => void;

class TxQueue {
  private wallet: Wallet;
  private isReady: boolean;
  private isRunning: boolean;
  private countAdded: number;
  private workerProcess: Worker;
  private countProcessed: number;
  private processingQueue: ITxQueueItem[];
  private processingCallback: ProcessingCallback;

  constructor(wallet: Wallet, processingCallback: ProcessingCallback) {
    this.wallet = wallet;
    this.isReady = false;
    this.isRunning = false;
    this.countAdded = 0;
    this.countProcessed = 0;
    this.processingQueue = [];
    this.workerProcess = this.initWorker();
    this.processingCallback = processingCallback;
  }

  initWorker = (): Worker => {
    this.workerProcess = new Worker('./workers/ParseTransactionsEntrypoint.js');
    this.workerProcess.onmessage = (data: MessageEvent)  => {
      let message: string | any = data.data;
      if (message === 'ready') {
        logDebugMsg('worker ready...');
        // post the wallet to the worker
        this.workerProcess.postMessage({
          type: 'initWallet'
        });
      } else if (message === "missing_wallet") {
        logDebugMsg("Wallet is missing for the worker...");
      } else if (message.type) {
        if (message.type === 'readyWallet') {
          this.setIsReady(true);
        } else if (message.type === 'processed') {
          if (message.transactions.length > 0) {
            for (let txData of message.transactions) {
              let txDataObject = TransactionData.fromRaw(txData);

              this.wallet.addNew(txDataObject.transaction);
              this.wallet.addDeposits(txDataObject.deposits);
              this.wallet.addWithdrawals(txDataObject.withdrawals);
            }

            // increase the number of transactions we actually added to wallet
            this.countAdded = this.countAdded + message.transactions.length;
            //console.log(`Added ${message.transactions.length} transactions to wallet. All count ${this.countAdded}`);
          }

          // we processed all
          this.isRunning = false;
          // signall progress and start next loop now
          this.processingCallback(message.maxHeight);
          this.runProcessLoop();
        }
      }
    };

    return this.workerProcess;    
  }      

  runProcessLoop = (): void => {
    if (this.isReady) {
      //we destroy the worker in charge of decoding the transactions every 5k transactions to ensure the memory is not corrupted
      //cnUtil bug, see https://github.com/mymonero/mymonero-core-js/issues/8
      if (this.countProcessed >= 5 * 1000) {
        logDebugMsg('Recreated parseWorker..');
        this.restartWorker();
        setTimeout(() => {
          this.runProcessLoop();
        }, 1000); 
        return;
      }

      if (!this.isRunning) {      
        this.isRunning = true;
        // dequeue one item form the processing queue and check if its valid
        let txQueueItem: ITxQueueItem | null = this.processingQueue.shift()!;

        if (txQueueItem) {                  
          // increase the number of transactions we actually processed
          this.countProcessed = this.countProcessed + txQueueItem.transactions.length;

          if (txQueueItem.transactions.length > 0) {
            //console.log(`sending ${txQueueItem.transactions.length} transactions to process. Last block ${txQueueItem.maxBlockNum}. All count ${this.countProcessed}`);
            this.workerProcess.postMessage({
              transactions: txQueueItem.transactions,
              maxBlock: txQueueItem.maxBlockNum,
              wallet: this.wallet.exportToRaw(),
              type: 'process'
            });
          } else {
            this.isRunning = false;
            this.processingCallback(txQueueItem.maxBlockNum);
            this.runProcessLoop();  
          }
        } else {
          this.isRunning = false;
        }
      }
    } else {
      if (!this.isReady) {
        setTimeout(() => {
          this.runProcessLoop();
        }, 1000); 
      }
    }
  }

  addTransactions = (transactions: RawDaemon_Transaction[], maxBlockNum: number) => {
    let txQueueItem: ITxQueueItem = {
      transactions: transactions,
      maxBlockNum: maxBlockNum
    }

    this.processingQueue.push(txQueueItem);
    this.runProcessLoop();
  }

  restartWorker = () => {
    this.isReady = false;
    this.isRunning = false;
    this.countProcessed = 0;
    this.workerProcess.terminate();
    this.workerProcess = this.initWorker();
  }

  setIsReady = (value: boolean) => {
    this.isReady = value;
  }

  hasData = (): boolean => {
    return this.processingQueue.length > 0;
  }

  getSize = (): number => {
    return this.processingQueue.length;
  }

  reset = () => {
    this.isReady = false;
    this.isRunning = false;
    this.processingQueue = [];
    this.workerProcess = this.initWorker();
  }
}

class BlockList {
  private blocks: IBlockRange[];
  private wallet: Wallet;
  private txQueue: TxQueue;
  private chainHeight: number;
  private watchdog: WalletWatchdog;

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
          this.blocks[i].transactions = transactions;
          this.blocks[i].finished = true;
          break;
        }
      }

      // remove all finished block
      while (this.blocks.length > 0) {
        if (this.blocks[0].finished) {
          let block = this.blocks.shift()!;
          // add any transactions to the wallet
          this.txQueue.addTransactions(block.transactions, block.endBlock);
        } else {
          break;
        }
      }
    }
  }

  markIdleBlockRange = (lastBlock: number): boolean => {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (this.blocks[i].endBlock == lastBlock) {
        this.blocks[i].timestamp = new Date(0);
        return true;
      }
    }

    return false;
  }

  getFirstIdleRange = (reset: boolean): IBlockRange | null => {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (!this.blocks[i].finished) {
        let timeDiff: number = new Date().getTime() - this.blocks[i].timestamp.getTime();
        if ((timeDiff / 1000) > 30) {
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

  getBlocks = (): IBlockRange[] => {
    return this.blocks;
  }

  getSize = (): number => {
    return this.blocks.length;
  }

  reset = () => {
    this.blocks = [];
  }
}

type ParseTxCallback = () => void;

class ParseWorker {
  private wallet: Wallet;
  private isReady: boolean;
  private watchdog: WalletWatchdog;
  private isWorking: boolean;
  private blockList: BlockList;
  private workerProcess: Worker;
  private countProcessed: number;
  private parseTxCallback: ParseTxCallback;

  constructor(wallet: Wallet, watchdog: WalletWatchdog, blockList: BlockList, parseTxCallback: ParseTxCallback) {
    this.parseTxCallback = parseTxCallback;
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
          type: 'initWallet'
        });
      } else if (message === "missing_wallet") {
        logDebugMsg("Wallet is are missing for the worker...");
      } else if (message.type) {
        if (message.type === 'readyWallet') {
          this.setIsReady(true);
        } else if (message.type === 'processed') {
          // we are done processing now
          this.blockList.finishBlockRange(message.maxHeight, message.transactions);
          this.setIsWorking(false);
          this.parseTxCallback();
        }
      }
    };

    return this.workerProcess;
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

  incProcessed = (value: number) => {
    this.countProcessed = this.countProcessed + value;
  }
}

class SyncWorker {
  private wallet: Wallet;
  private isWorking: boolean;
  private explorer: BlockchainExplorer;

  constructor(explorer: BlockchainExplorer, wallet: Wallet) {
    this.wallet = wallet; 
    this.isWorking = false;
    this.explorer = explorer;
  }

  fetchBlocks = (startBlock: number, endBlock: number): Promise<{transactions: RawDaemon_Transaction[], lastBlock: number}> => {
    this.isWorking = true;

		return new Promise<any>((resolve, reject) => {
      this.explorer.getTransactionsForBlocks(startBlock, endBlock, this.wallet.options.checkMinerTx).then((transactions: RawDaemon_Transaction[]) => {
        resolve({
          transactions: transactions,
          lastBlock: endBlock
        });
      }).catch((err) => {
        reject({
          transactions: [],
          lastBlock: endBlock
        });
      }).finally(() => {
        this.isWorking = false;
      });
    });
  }

  getIsWorking = (): boolean => {
    return this.isWorking;
  }
}

interface ITransacationQueue {
  transactions: RawDaemon_Transaction[];
  lastBlock: number;
}

export class WalletWatchdog {
  private wallet: Wallet;
  private stopped: boolean = false;
  private blockList: BlockList;
  private cpuCores: number = 0;
  private maxCpuCores: number = 0;
  private remoteNodes: number = 0;
  private explorer: BlockchainExplorer;
  private syncWorkers: SyncWorker[] = [];
  private parseWorkers: ParseWorker[] = [];
  private intervalMempool: any = 0;
  private lastBlockLoading: number = -1;
  private lastMaximumHeight: number = 0;
  private transactionsToProcess: ITransacationQueue[] = [];

  constructor(wallet: Wallet, explorer: BlockchainExplorer) {
    // by default we use all cores but limited up to config.maxWorkerCores
    this.maxCpuCores = Math.min(window.navigator.hardwareConcurrency ? (Math.max(window.navigator.hardwareConcurrency - 1, 1)) : 1, config.maxWorkerCores);

    this.wallet = wallet;
    this.explorer = explorer;
    this.blockList = new BlockList(wallet, this);

    // create parse workers
    for (let i = 0; i < this.maxCpuCores; ++i) {
      let parseWorker: ParseWorker = new ParseWorker(this.wallet, this, this.blockList, this.processParseTransaction);
      this.parseWorkers.push(parseWorker);
    }

    // create a worker for each random node
    for (let i = 0; i < config.nodeList.length; ++i) {
      this.syncWorkers.push(new SyncWorker(this.explorer, this.wallet));
    }

    this.setupWorkers();
  }

  setupWorkers = () => {
    this.cpuCores = this.maxCpuCores;

    if (this.wallet.options.readSpeed == 10) {
      // use 3/4 of the cores for fast syncing
      this.cpuCores = Math.min(Math.max(1, Math.floor(3 * (this.maxCpuCores / 4))), config.maxWorkerCores);
    } else if (this.wallet.options.readSpeed == 50) {
      // use half of the cores for medim syncing
      this.cpuCores = Math.min(Math.max(1, Math.floor(this.maxCpuCores / 2)), config.maxWorkerCores);
    } else if (this.wallet.options.readSpeed == 100) {
      // slowest, use only one core
      this.cpuCores = 1;
    }

    // random nodes are dependent both on max nodes available as well as on number of cores we have available and perfomance settings
    this.remoteNodes = Math.min(config.maxRemoteNodes, config.nodeList.length, this.cpuCores);
  }

  signalWalletUpdate = () => {
    logDebugMsg('wallet update in progress');

    // reset the last block loading
    this.lastBlockLoading = -1;//reset scanning
    this.checkMempool();
  }

  initMempool = (force: boolean = false) => {
    if (this.intervalMempool === 0 || force) {
      if (force && this.intervalMempool !== 0) {
        clearInterval(this.intervalMempool);
      }

      this.intervalMempool = setInterval(() => {
        this.checkMempool();
      }, config.avgBlockTime / 4 * 1000);
    }
    this.checkMempool();
  }

  acquireWorker = (): ParseWorker | null => {
    let workingCount = 0;

    // first check if max worker usage is reached
    for (let i = 0; i < this.parseWorkers.length; ++i) {
      if (this.parseWorkers[i].getIsWorking()) {
        workingCount = workingCount + 1;
      }
    }


    if (workingCount < this.cpuCores) {
      for (let i = 0; i < this.parseWorkers.length; ++i) {      
        if (!this.parseWorkers[i].getIsWorking() && this.parseWorkers[i].getIsReady()) {
          return this.parseWorkers[i];
        }
      }
    }

    return null;
  }

  stop = () => {
    this.transactionsToProcess = [];
    clearInterval(this.intervalMempool);
    this.blockList.getTxQueue().reset();
    this.blockList.reset();
    this.stopped = true;
  }

  start = () => {
    // init the mempool
    this.initMempool();

    // run main loop
    this.stopped = false;
    this.lastBlockLoading = -1;
    this.lastMaximumHeight = -1;    
    this.startSyncLoop();
  }

  checkMempool = (): boolean => {
    logDebugMsg("checkMempool", this.lastMaximumHeight, this.wallet.lastHeight);

    if (((this.lastMaximumHeight - this.wallet.lastHeight) > 1) && (this.lastMaximumHeight > 0))  { //only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
      return false;
    }

    this.wallet.clearMemTx();
    this.explorer.getTransactionPool().then((pool: any) => {
      if (typeof pool !== 'undefined') {
        for (let rawTx of pool) {
          let txData = TransactionsExplorer.parse(rawTx, this.wallet);

          if ((txData !== null) && (txData.transaction !== null)) {
            this.wallet.addNewMemTx(txData.transaction);
          }
        }
      }
    }).catch(err => {
      if (err) {
        console.error("checkMempool error:", err);
      }
    });

    return true;
  }

  processParseTransaction = () => {
    if (this.transactionsToProcess.length > 0) {
      let parseWorker = this.acquireWorker();

      if (parseWorker) {
        // define the transactions we need to process
        let transactionsToProcess: ITransacationQueue | null = this.transactionsToProcess.shift()!;

        if (transactionsToProcess) {          
          parseWorker.setIsWorking(true);
          // increase the number of transactions we actually processed
          parseWorker.incProcessed(transactionsToProcess.transactions.length);
          parseWorker.getWorker().postMessage({
            transactions: transactionsToProcess.transactions,
            readMinersTx: this.wallet.options.checkMinerTx,
            maxBlock: transactionsToProcess.lastBlock,
            wallet: this.wallet.exportToRaw(),
            type: 'process',
          });
        }
      }
    }
  }

  processTransactions(transactions: RawDaemon_Transaction[], lastBlock: number) {
    let txList: ITransacationQueue = {
      transactions: transactions,
      lastBlock: lastBlock,
    }    

    logDebugMsg(`processTransactions called...`, transactions);
    // add the raw transaction to the processing FIFO list
    this.transactionsToProcess.push(txList);
    // parse the transactions immediately
    this.processParseTransaction();
  }

  getMultipleRandom = (arr: any[], num: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  }

  getFreeWorker = (): SyncWorker | null => {
    let workingCount = 0;

    // first check if max worker usage is reached
    for (let i = 0; i < this.syncWorkers.length; ++i) {
      if (this.syncWorkers[i].getIsWorking()) {
        workingCount = workingCount + 1;
      }
    }

    if (workingCount < this.remoteNodes) {
      for (let i = 0; i < this.syncWorkers.length; ++i) {
        if (!this.syncWorkers[i].getIsWorking()) {
          return this.syncWorkers[i];
        }
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

  startSyncLoop = async () => {
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

          // get a free worker and check if we have idle blocks first
          let freeWorker: SyncWorker | null = self.getFreeWorker();

          if (freeWorker) {
            // first check if we have any stale ranges available
            let idleRange = self.blockList.getFirstIdleRange(true);
            let startBlock: number = 0;
            let endBlock: number = 0;
            

            if (idleRange) {
              startBlock = idleRange.startBlock;
              endBlock = idleRange.endBlock;
            }  else if (self.lastBlockLoading < height) {
              // check if block range list is to big
              if (self.blockList.getSize() >= config.maxBlockQueue) {
                logDebugMsg('Block range list is to big', self.blockList.getSize());
                await new Promise(r => setTimeout(r, 500));
                continue;
              }

              startBlock = Math.max(0, Number(self.lastBlockLoading));
              endBlock = startBlock + config.syncBlockCount;
              // make sure endBlock is not over current height
              endBlock = Math.min(endBlock, height + 1);
  
              if (startBlock > self.lastMaximumHeight) {
                startBlock = self.lastMaximumHeight;
              }

              // add the blocks to be processed to the block list
              self.blockList.addBlockRange(startBlock, endBlock, height);
              self.lastBlockLoading = Math.max(self.lastBlockLoading, endBlock);
            } else {
              await new Promise(r => setTimeout(r, 10 * 1000));
              continue;
            }
            
            // try to fetch the block range with a currently selected sync worker
            freeWorker.fetchBlocks(startBlock, endBlock).then((blockData: {transactions: RawDaemon_Transaction[], lastBlock: number}) => {
              if (blockData.transactions.length > 0) {
                self.processTransactions(blockData.transactions, blockData.lastBlock);
              } else {
                self.blockList.finishBlockRange(blockData.lastBlock, []);
              }
            }).catch((blockData: {transactions: RawDaemon_Transaction[], lastBlock: number}) => {
              self.blockList.markIdleBlockRange(blockData.lastBlock);
            });
          } else {
            await new Promise(r => setTimeout(r, 500));
          }
        } catch(err) {
          console.error(`Error occured in startSyncLoop...`, err);
          await new Promise(r => setTimeout(r, 30 * 1000)); //retry 30s later if an error occurred
        }
      }
    })(this);
  }
}
