/**
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2026, The Conceal Network, Conceal Devs
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

import { Wallet } from "./Wallet";
import { BlockchainExplorer, RawDaemon_Transaction } from "./blockchain/BlockchainExplorer";
import { Transaction, TransactionData, Deposit } from "./Transaction";
import { TransactionsExplorer } from "./TransactionsExplorer";

interface IBlockRange {
  startBlock: number;
  endBlock: number;
  finished: boolean;
  timestamp: Date;
  parsedTransactions: any[];
  fetched: boolean;
  fetchedTransactions: RawDaemon_Transaction[];
  filterDispatched: boolean;
  screenComplete: boolean;
  screenShardTotal: number;
  screenNextShardIndex: number;
  screenShardsCompleted: number;
  screenHashes: Set<string>;
  parseDispatched: boolean;
}

type ProcessingCallback = (blockNumber: number) => void;

/** Applies pre-parsed sync results on the main wallet (no second ParseTransactions pass). */
class TxQueue {
  private wallet: Wallet;
  private isApplying: boolean;
  private processingCallback: ProcessingCallback;

  constructor(wallet: Wallet, processingCallback: ProcessingCallback) {
    this.wallet = wallet;
    this.isApplying = false;
    this.processingCallback = processingCallback;
  }

  applyParsedTransactions = (parsedTransactions: any[], maxBlockNum: number) => {
    this.isApplying = true;

    try {
      for (let txData of parsedTransactions) {
        let txDataObject = TransactionData.fromRaw(txData);

        this.wallet.addNew(txDataObject.transaction);
        this.wallet.addDeposits(txDataObject.deposits);
        this.wallet.addWithdrawals(txDataObject.withdrawals);
      }
    } finally {
      this.isApplying = false;
    }

    this.processingCallback(maxBlockNum);
  };

  hasData = (): boolean => {
    return this.isApplying;
  };

  getSize = (): number => {
    return this.isApplying ? 1 : 0;
  };

  isIdle = (): boolean => {
    return !this.isApplying;
  };

  isBusy = (): boolean => {
    return this.isApplying;
  };

  reset = () => {
    this.isApplying = false;
  };
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
      this.watchdog.setLastBlockLoadingFromApply(blockNumber);
      this.watchdog.checkMempool();
      this.watchdog.notifyTxQueueDrain();
      this.watchdog.tryScheduleFilter();
    });
  }

  addBlockRange = (startBlock: number, endBlock: number, chainHeight: number): boolean => {
    if (endBlock <= startBlock) {
      return false;
    }

    this.chainHeight = Math.max(this.chainHeight, chainHeight);

    let rangeData: IBlockRange = {
      startBlock: startBlock,
      endBlock: endBlock,
      finished: false,
      timestamp: new Date(),
      parsedTransactions: [],
      fetched: false,
      fetchedTransactions: [],
      filterDispatched: false,
      screenComplete: false,
      screenShardTotal: 0,
      screenNextShardIndex: 0,
      screenShardsCompleted: 0,
      screenHashes: new Set<string>(),
      parseDispatched: false,
    };

    for (let i = 0; i < this.blocks.length; ++i) {
      if (startBlock === this.blocks[i].startBlock && endBlock === this.blocks[i].endBlock) {
        return false;
      }
    }

    this.blocks.push(rangeData);
    this.blocks.sort((a, b) => a.startBlock - b.startBlock);
    return true;
  };

  setFetchedTransactions = (startBlock: number, endBlock: number, transactions: RawDaemon_Transaction[]) => {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (this.blocks[i].startBlock === startBlock && this.blocks[i].endBlock === endBlock) {
        this.blocks[i].fetched = true;
        this.blocks[i].fetchedTransactions = transactions;
        return;
      }
    }
  };

  /** Only the head range may be filtered; strict order is enforced by the queue. */
  getNextRangeForFilter = (): IBlockRange | null => {
    if (this.blocks.length === 0) {
      return null;
    }

    const range = this.blocks[0];
    if (!range.fetched || range.finished) {
      return null;
    }

    if (!range.screenComplete) {
      if (!range.filterDispatched) {
        return range;
      }
      return null;
    }

    if (!range.parseDispatched) {
      return range;
    }

    return null;
  };

  /** Next range can be queued once the head chunk is downloaded (filter/apply may still run). */
  canPrefetchNextRange = (): boolean => {
    if (this.blocks.length === 0) {
      return true;
    }

    const head = this.blocks[0];
    return head.fetched || head.finished;
  };

  getTailQueuedEndBlock = (): number => {
    if (this.blocks.length === 0) {
      return Math.max(0, Number(this.wallet.lastHeight));
    }

    return this.blocks[this.blocks.length - 1].endBlock;
  };

  recordScreenShard = (startBlock: number, endBlock: number, hashes: string[]) => {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (this.blocks[i].startBlock === startBlock && this.blocks[i].endBlock === endBlock) {
        const range = this.blocks[i];
        for (let h = 0; h < hashes.length; ++h) {
          range.screenHashes.add(hashes[h]);
        }
        range.screenShardsCompleted = range.screenShardsCompleted + 1;
        if (range.screenShardsCompleted >= range.screenShardTotal) {
          range.screenComplete = true;
          range.filterDispatched = false;
        }
        return;
      }
    }
  };

  buildOwnedTransactions = (range: IBlockRange): RawDaemon_Transaction[] => {
    const owned: RawDaemon_Transaction[] = [];
    for (let raw of range.fetchedTransactions) {
      if (raw?.height && raw.hash && range.screenHashes.has(raw.hash)) {
        owned.push(raw);
      }
    }
    return owned;
  };

  finishBlockRange = (startBlock: number, endBlock: number, parsedTransactions: any[]) => {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (this.blocks[i].startBlock === startBlock && this.blocks[i].endBlock === endBlock) {
        this.blocks[i].parsedTransactions = parsedTransactions;
        this.blocks[i].finished = true;
        break;
      }
    }

    while (this.blocks.length > 0) {
      if (this.blocks[0].finished) {
        let block = this.blocks.shift()!;
        this.txQueue.applyParsedTransactions(block.parsedTransactions, block.endBlock);
      } else {
        break;
      }
    }
  };

  markIdleBlockRange = (lastBlock: number): boolean => {
    for (let i = 0; i < this.blocks.length; ++i) {
      if (this.blocks[i].endBlock == lastBlock) {
        this.blocks[i].timestamp = new Date(0);
        return true;
      }
    }

    return false;
  };

  getFirstIdleRange = (reset: boolean): IBlockRange | null => {
    if (this.blocks.length === 0) {
      return null;
    }

    const head = this.blocks[0];
    if (head.finished || head.fetched) {
      return null;
    }

    let timeDiff: number = new Date().getTime() - head.timestamp.getTime();
    if (timeDiff / 1000 > 30) {
      if (reset) {
        head.timestamp = new Date();
      }
      return head;
    }

    return null;
  };

  getTxQueue = (): TxQueue => {
    return this.txQueue;
  };

  getBlocks = (): IBlockRange[] => {
    return this.blocks;
  };

  getSize = (): number => {
    return this.blocks.length;
  };

  reset = () => {
    this.blocks = [];
  };
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
    this.workerProcess = new Worker("./workers/TransferProcessingEntrypoint.js");
    this.workerProcess.onmessage = (data: MessageEvent) => {
      let message: string | any = data.data;
      if (message === "ready") {
        logDebugMsg("worker ready...");
        // signal the wallet update
        this.watchdog.checkMempool();
        // post the wallet to the worker
        this.workerProcess.postMessage({
          type: "initWallet",
        });
      } else if (message === "missing_wallet") {
        logDebugMsg("Wallet is are missing for the worker...");
      } else if (message.type) {
        if (message.type === "readyWallet") {
          this.setIsReady(true);
          this.parseTxCallback();
        } else if (message.type === "screened") {
          this.blockList.recordScreenShard(message.startBlock, message.maxHeight, message.hashes);
          this.setIsWorking(false);
          this.parseTxCallback();
        } else if (message.type === "processed") {
          this.blockList.finishBlockRange(message.startBlock, message.maxHeight, message.transactions);
          this.setIsWorking(false);
          this.parseTxCallback();
        }
      }
    };

    return this.workerProcess;
  };

  getWorker = (): Worker => {
    return this.workerProcess;
  };

  getIsReady = (): boolean => {
    return this.isReady;
  };

  getIsWorking = (): boolean => {
    return this.isWorking;
  };

  setIsReady = (value: boolean) => {
    this.isReady = value;
  };

  setIsWorking = (value: boolean) => {
    this.isWorking = value;
  };

  getProcessed = (): number => {
    return this.countProcessed;
  };

  incProcessed = (value: number) => {
    this.countProcessed = this.countProcessed + value;
  };
}

class SyncWorker {
  private wallet: Wallet;
  private isWorking: boolean;
  private explorer: BlockchainExplorer;
  private prefetchSlotIndex: number;

  constructor(explorer: BlockchainExplorer, wallet: Wallet, prefetchSlotIndex: number) {
    this.wallet = wallet;
    this.isWorking = false;
    this.explorer = explorer;
    this.prefetchSlotIndex = prefetchSlotIndex;
  }

  fetchBlocks = (
    startBlock: number,
    endBlock: number
  ): Promise<{ transactions: RawDaemon_Transaction[]; lastBlock: number; startBlock: number }> => {
    this.isWorking = true;

    const fetchPromise = this.explorer.getTransactionsForBlocksPrefetchSlot(
      this.prefetchSlotIndex,
      startBlock,
      endBlock,
      this.wallet.options.checkMinerTx
    );

    return fetchPromise
      .then((transactions: RawDaemon_Transaction[]) => ({
        transactions: transactions,
        lastBlock: endBlock,
        startBlock: startBlock,
      }))
      .catch(() => {
        throw {
          transactions: [],
          lastBlock: endBlock,
          startBlock: startBlock,
        };
      })
      .finally(() => {
        this.isWorking = false;
      });
  };

  getIsWorking = (): boolean => {
    return this.isWorking;
  };
}

export class WalletWatchdog {
  private wallet: Wallet;
  private stopped: boolean = false;
  private blockList: BlockList;
  private cpuCores: number = 0;
  private maxCpuCores: number = 0;
  private remoteNodes: number = 0;
  private maxConcurrentFetches: number = 1;
  private explorer: BlockchainExplorer;
  private syncWorkers: SyncWorker[] = [];
  private filterWorkers: ParseWorker[] = [];
  private intervalMempool: any = 0;
  private lastBlockLoading: number = -1;
  private lastMaximumHeight: number = 0;
  private txQueueWaiters: Array<() => void> = [];

  constructor(wallet: Wallet, explorer: BlockchainExplorer) {
    console.log("WalletWatchdog");
    // by default we use all cores but limited up to config.maxWorkerCores
    this.maxCpuCores = Math.min(
      window.navigator.hardwareConcurrency ? Math.max(window.navigator.hardwareConcurrency - 1, 1) : 1,
      config.maxWorkerCores
    );

    this.wallet = wallet;
    this.explorer = explorer;
    this.blockList = new BlockList(wallet, this);

    for (let i = 0; i < config.maxPrefetchParallel; ++i) {
      this.filterWorkers.push(new ParseWorker(this.wallet, this, this.blockList, this.tryScheduleFilter));
      this.syncWorkers.push(new SyncWorker(this.explorer, this.wallet, i));
    }

    this.setupWorkers();
  }

  setupWorkers = () => {
    const poolSize = Math.max(1, this.explorer.getPrefetchNodePoolSize());

    if (this.wallet.options.readSpeed == 10) {
      this.remoteNodes = Math.min(config.maxPrefetchParallel, poolSize, config.maxRemoteNodes);
    } else if (this.wallet.options.readSpeed == 50) {
      this.remoteNodes = Math.min(Math.max(1, Math.floor(poolSize / 2)), config.maxPrefetchParallel, config.maxRemoteNodes);
    } else if (this.wallet.options.readSpeed == 100) {
      this.remoteNodes = 1;
    } else {
      this.remoteNodes = Math.min(config.maxPrefetchParallel, poolSize, config.maxRemoteNodes);
    }

    // Main-thread apply is cheap; use full prefetch parallelism for fetches
    this.maxConcurrentFetches = this.remoteNodes;
  };

  signalWalletUpdate = () => {
    logDebugMsg("wallet update in progress");

    // reset the last block loading
    this.lastBlockLoading = -1; //reset scanning
    this.checkMempool();
  };

  initMempool = (force: boolean = false) => {
    if (this.intervalMempool === 0 || force) {
      if (force && this.intervalMempool !== 0) {
        clearInterval(this.intervalMempool);
      }

      this.intervalMempool = setInterval(
        () => {
          this.checkMempool();
        },
        (config.avgBlockTime / 4) * 1000
      );
    }
    this.checkMempool();
  };

  private acquireFilterWorker = (): ParseWorker | null => {
    for (let i = 0; i < this.filterWorkers.length; ++i) {
      if (this.filterWorkers[i].getIsReady() && !this.filterWorkers[i].getIsWorking()) {
        return this.filterWorkers[i];
      }
    }
    return null;
  };

  private isFilterBusy = (): boolean => {
    for (let i = 0; i < this.filterWorkers.length; ++i) {
      if (this.filterWorkers[i].getIsWorking()) {
        return true;
      }
    }
    return false;
  };

  private getScreenShardCount = (txCount: number): number => {
    const minPerShard = config.syncScreenMinTxPerShard;
    const maxShards = config.maxPrefetchParallel;

    if (txCount < minPerShard * 2) {
      return 1;
    }

    return Math.min(maxShards, Math.ceil(txCount / minPerShard));
  };

  private initScreening = (range: IBlockRange): void => {
    const txCount = range.fetchedTransactions.length;
    range.filterDispatched = true;
    range.screenShardTotal = this.getScreenShardCount(txCount);
    range.screenNextShardIndex = 0;
    range.screenShardsCompleted = 0;
    range.screenHashes = new Set<string>();
    range.screenComplete = false;
    range.parseDispatched = false;

    if (txCount === 0) {
      range.screenComplete = true;
      range.filterDispatched = false;
    }
  };

  private dispatchScreenShards = (range: IBlockRange): void => {
    const txs = range.fetchedTransactions;
    const shardSize = Math.ceil(txs.length / range.screenShardTotal);
    const walletRaw = this.wallet.exportToRaw();

    while (range.screenNextShardIndex < range.screenShardTotal) {
      const filterWorker = this.acquireFilterWorker();
      if (!filterWorker) {
        break;
      }

      const shardIndex = range.screenNextShardIndex;
      const shardStart = shardIndex * shardSize;
      const shardEnd = Math.min(shardStart + shardSize, txs.length);
      const shard = txs.slice(shardStart, shardEnd);

      range.screenNextShardIndex = range.screenNextShardIndex + 1;
      filterWorker.setIsWorking(true);
      filterWorker.incProcessed(shard.length);
      filterWorker.getWorker().postMessage({
        type: "screen",
        transactions: shard,
        shardIndex: shardIndex,
        readMinersTx: this.wallet.options.checkMinerTx,
        startBlock: range.startBlock,
        maxBlock: range.endBlock,
        wallet: walletRaw,
      });
    }
  };

  private dispatchParseOwned = (range: IBlockRange): void => {
    const filterWorker = this.acquireFilterWorker();
    if (!filterWorker) {
      return;
    }

    const ownedTransactions = this.blockList.buildOwnedTransactions(range);

    if (ownedTransactions.length === 0) {
      range.parseDispatched = true;
      this.blockList.finishBlockRange(range.startBlock, range.endBlock, []);
      return;
    }

    range.parseDispatched = true;
    filterWorker.setIsWorking(true);
    filterWorker.incProcessed(ownedTransactions.length);
    filterWorker.getWorker().postMessage({
      type: "process",
      transactions: ownedTransactions,
      readMinersTx: this.wallet.options.checkMinerTx,
      startBlock: range.startBlock,
      maxBlock: range.endBlock,
      wallet: this.wallet.exportToRaw(),
    });
  };

  tryScheduleFilter = (): void => {
    if (this.stopped) {
      return;
    }

    if (!this.blockList.getTxQueue().isIdle()) {
      return;
    }

    const head = this.blockList.getBlocks()[0];
    if (head && head.fetched && !head.finished && !head.screenComplete && head.filterDispatched) {
      this.dispatchScreenShards(head);
    }

    const range = this.blockList.getNextRangeForFilter();
    if (!range) {
      return;
    }

    if (!range.screenComplete) {
      if (!range.filterDispatched) {
        this.initScreening(range);
      }
      if (!range.screenComplete) {
        this.dispatchScreenShards(range);
      }
      if (range.screenComplete) {
        this.tryScheduleFilter();
      }
      return;
    }

    this.dispatchParseOwned(range);
  };

  stop = () => {
    this.releaseTxQueueWaiters();
    clearInterval(this.intervalMempool);
    this.blockList.getTxQueue().reset();
    this.blockList.reset();
    this.stopped = true;
  };

  private queuedTxCount = (): number => {
    let count = 0;
    for (const range of this.blockList.getBlocks()) {
      if (!range.finished) {
        count += range.fetchedTransactions.length;
      }
    }
    return count;
  };

  private isTxQueueFull = (incomingTxCount: number = 0): boolean => {
    return this.queuedTxCount() + incomingTxCount > config.maxTxQueueHigh || this.blockList.getSize() >= config.maxTxQueuePackets;
  };

  private waitForQueueCapacity = async (incomingTxCount: number = 0): Promise<void> => {
    while (this.isTxQueueFull(incomingTxCount) && !this.stopped) {
      await new Promise<void>((resolve) => {
        this.txQueueWaiters.push(resolve);
      });
    }
  };

  private releaseTxQueueWaiters = (): void => {
    const waiters = this.txQueueWaiters.splice(0);
    for (let i = 0; i < waiters.length; i++) {
      waiters[i]();
    }
  };

  private getTxQueuePacketsLowWatermark = (): number => {
    return Math.max(1, Math.floor(config.maxTxQueuePackets * 0.2));
  };

  private isTxQueueBelowLowWatermark = (): boolean => {
    return this.queuedTxCount() <= config.maxTxQueueLow && this.blockList.getSize() <= this.getTxQueuePacketsLowWatermark();
  };

  notifyTxQueueDrain = (): void => {
    if (this.isTxQueueBelowLowWatermark()) {
      this.releaseTxQueueWaiters();
    }
  };

  setLastBlockLoadingFromApply = (blockNumber: number): void => {
    this.lastBlockLoading = Math.max(this.lastBlockLoading, blockNumber);
  };

  /** Wallet scan progress vs chain tip (not lastBlockLoading, which can run ahead while prefetching). */
  private needsMoreBlockRanges = (chainHeight: number): boolean => {
    const walletHeight = Math.max(0, Number(this.wallet.lastHeight));
    const queuedThrough = this.blockList.getTailQueuedEndBlock();
    return walletHeight < chainHeight || queuedThrough < chainHeight;
  };

  start = () => {
    // init the mempool
    this.initMempool();

    // run main loop
    this.stopped = false;
    this.lastBlockLoading = -1;
    this.lastMaximumHeight = -1;
    this.startSyncLoop();
  };

  checkMempool = (): boolean => {
    logDebugMsg("checkMempool", this.lastMaximumHeight, this.wallet.lastHeight);

    if (this.lastMaximumHeight - this.wallet.lastHeight > 1 && this.lastMaximumHeight > 0) {
      //only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
      return false;
    }

    this.wallet.clearMemTx();
    this.explorer
      .getTransactionPool()
      .then((pool: any) => {
        if (typeof pool !== "undefined") {
          for (let rawTx of pool) {
            let txData = TransactionsExplorer.parse(rawTx, this.wallet);

            if (txData !== null && txData.transaction !== null) {
              this.wallet.addNewMemTx(txData.transaction);
            }
          }
        }
      })
      .catch((err) => {
        if (err) {
          console.error("checkMempool error:", err);
        }
      });

    return true;
  };

  private onBlockRangeFetched = (startBlock: number, endBlock: number, transactions: RawDaemon_Transaction[]): void => {
    this.blockList.setFetchedTransactions(startBlock, endBlock, transactions);
    this.tryScheduleFilter();
  };

  getMultipleRandom = (arr: any[], num: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  getFreeWorker = (): SyncWorker | null => {
    let workingCount = 0;

    // first check if max worker usage is reached
    for (let i = 0; i < this.syncWorkers.length; ++i) {
      if (this.syncWorkers[i].getIsWorking()) {
        workingCount = workingCount + 1;
      }
    }

    if (workingCount < this.maxConcurrentFetches) {
      for (let i = 0; i < this.syncWorkers.length; ++i) {
        if (!this.syncWorkers[i].getIsWorking()) {
          return this.syncWorkers[i];
        }
      }
    }

    return null;
  };

  getBlockList = (): BlockList => {
    return this.blockList;
  };

  getLastBlockLoading = (): number => {
    return this.lastBlockLoading;
  };

  startSyncLoop = async () => {
    (async function (self) {
      while (!self.stopped) {
        try {
          if (self.lastBlockLoading === -1) {
            self.lastBlockLoading = self.wallet.lastHeight;
          }

          // backpressure: avoid scheduling new fetches while the tx FIFO is at high watermark
          if (self.isTxQueueFull(0)) {
            logDebugMsg(`Tx FIFO at high watermark`, self.blockList.getSize(), self.queuedTxCount(), config.maxTxQueueHigh);
            await self.waitForQueueCapacity(0);
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
              await new Promise((r) => setTimeout(r, 1000));
              continue;
            }
          }

          self.tryScheduleFilter();

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
            } else if (self.needsMoreBlockRanges(height)) {
              if (!self.blockList.canPrefetchNextRange()) {
                self.tryScheduleFilter();
                await new Promise((r) => setTimeout(r, 200));
                continue;
              }

              // check if block range list is to big
              if (self.blockList.getSize() >= config.maxBlockQueue) {
                logDebugMsg("Block range list is to big", self.blockList.getSize());
                self.tryScheduleFilter();
                await new Promise((r) => setTimeout(r, 500));
                continue;
              }

              startBlock = self.blockList.getTailQueuedEndBlock();
              endBlock = startBlock + config.syncBlockCount;
              // make sure endBlock is not over current height
              endBlock = Math.min(endBlock, height + 1);

              if (startBlock >= endBlock) {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
              }

              if (startBlock > self.lastMaximumHeight) {
                startBlock = self.lastMaximumHeight;
              }

              if (startBlock >= endBlock) {
                await new Promise((r) => setTimeout(r, 1000));
                continue;
              }

              // add the blocks to be processed to the block list
              if (!self.blockList.addBlockRange(startBlock, endBlock, height)) {
                self.tryScheduleFilter();
                await new Promise((r) => setTimeout(r, 200));
                continue;
              }
            } else {
              await new Promise((r) => setTimeout(r, 10 * 1000));
              continue;
            }

            // try to fetch the block range with a currently selected sync worker
            freeWorker
              .fetchBlocks(startBlock, endBlock)
              .then((blockData: { transactions: RawDaemon_Transaction[]; lastBlock: number; startBlock: number }) => {
                self.onBlockRangeFetched(blockData.startBlock, blockData.lastBlock, blockData.transactions);
              })
              .catch((blockData: { transactions: RawDaemon_Transaction[]; lastBlock: number; startBlock: number }) => {
                self.blockList.markIdleBlockRange(blockData.lastBlock);
                self.tryScheduleFilter();
              });
          } else {
            self.tryScheduleFilter();
            await new Promise((r) => setTimeout(r, 500));
          }
        } catch (err) {
          console.error(`Error occured in startSyncLoop...`, err);
          await new Promise((r) => setTimeout(r, 30 * 1000)); //retry 30s later if an error occurred
        }
      }
    })(this);
  };
}
