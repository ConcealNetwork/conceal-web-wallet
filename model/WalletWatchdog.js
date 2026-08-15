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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define(["require", "exports", "./Transaction", "./TransactionsExplorer"], function (require, exports, Transaction_1, TransactionsExplorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WalletWatchdog = void 0;
    /** Applies pre-parsed sync results on the main wallet (no second ParseTransactions pass). */
    var TxQueue = /** @class */ (function () {
        function TxQueue(wallet, processingCallback) {
            var _this = this;
            this.applyParsedTransactions = function (parsedTransactions, maxBlockNum) {
                _this.isApplying = true;
                try {
                    for (var _i = 0, parsedTransactions_1 = parsedTransactions; _i < parsedTransactions_1.length; _i++) {
                        var txData = parsedTransactions_1[_i];
                        var txDataObject = Transaction_1.TransactionData.fromRaw(txData);
                        _this.wallet.addNew(txDataObject.transaction);
                        _this.wallet.addDeposits(txDataObject.deposits);
                        _this.wallet.addWithdrawals(txDataObject.withdrawals);
                    }
                }
                finally {
                    _this.isApplying = false;
                }
                _this.processingCallback(maxBlockNum);
            };
            this.hasData = function () {
                return _this.isApplying;
            };
            this.getSize = function () {
                return _this.isApplying ? 1 : 0;
            };
            this.isIdle = function () {
                return !_this.isApplying;
            };
            this.isBusy = function () {
                return _this.isApplying;
            };
            this.reset = function () {
                _this.isApplying = false;
            };
            this.wallet = wallet;
            this.isApplying = false;
            this.processingCallback = processingCallback;
        }
        return TxQueue;
    }());
    var BlockList = /** @class */ (function () {
        function BlockList(wallet, watchdog) {
            var _this = this;
            this.addBlockRange = function (startBlock, endBlock, chainHeight) {
                if (endBlock <= startBlock) {
                    return false;
                }
                _this.chainHeight = Math.max(_this.chainHeight, chainHeight);
                var rangeData = {
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
                    screenHashes: new Set(),
                    parseDispatched: false,
                };
                for (var i = 0; i < _this.blocks.length; ++i) {
                    if (startBlock === _this.blocks[i].startBlock && endBlock === _this.blocks[i].endBlock) {
                        return false;
                    }
                }
                _this.blocks.push(rangeData);
                _this.blocks.sort(function (a, b) { return a.startBlock - b.startBlock; });
                return true;
            };
            this.setFetchedTransactions = function (startBlock, endBlock, transactions) {
                for (var i = 0; i < _this.blocks.length; ++i) {
                    if (_this.blocks[i].startBlock === startBlock && _this.blocks[i].endBlock === endBlock) {
                        _this.blocks[i].fetched = true;
                        _this.blocks[i].fetchedTransactions = transactions;
                        return;
                    }
                }
            };
            /** Only the head range may be filtered; strict order is enforced by the queue. */
            this.getNextRangeForFilter = function () {
                if (_this.blocks.length === 0) {
                    return null;
                }
                var range = _this.blocks[0];
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
            this.canPrefetchNextRange = function () {
                if (_this.blocks.length === 0) {
                    return true;
                }
                var head = _this.blocks[0];
                return head.fetched || head.finished;
            };
            this.getTailQueuedEndBlock = function () {
                if (_this.blocks.length === 0) {
                    return Math.max(0, Number(_this.wallet.lastHeight));
                }
                return _this.blocks[_this.blocks.length - 1].endBlock;
            };
            this.recordScreenShard = function (startBlock, endBlock, hashes) {
                for (var i = 0; i < _this.blocks.length; ++i) {
                    if (_this.blocks[i].startBlock === startBlock && _this.blocks[i].endBlock === endBlock) {
                        var range = _this.blocks[i];
                        for (var h = 0; h < hashes.length; ++h) {
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
            this.buildOwnedTransactions = function (range) {
                var owned = [];
                for (var _i = 0, _a = range.fetchedTransactions; _i < _a.length; _i++) {
                    var raw = _a[_i];
                    if ((raw === null || raw === void 0 ? void 0 : raw.height) && raw.hash && range.screenHashes.has(raw.hash)) {
                        owned.push(raw);
                    }
                }
                return owned;
            };
            this.finishBlockRange = function (startBlock, endBlock, parsedTransactions) {
                for (var i = 0; i < _this.blocks.length; ++i) {
                    if (_this.blocks[i].startBlock === startBlock && _this.blocks[i].endBlock === endBlock) {
                        _this.blocks[i].parsedTransactions = parsedTransactions;
                        _this.blocks[i].finished = true;
                        break;
                    }
                }
                while (_this.blocks.length > 0) {
                    if (_this.blocks[0].finished) {
                        var block = _this.blocks.shift();
                        _this.txQueue.applyParsedTransactions(block.parsedTransactions, block.endBlock);
                    }
                    else {
                        break;
                    }
                }
            };
            this.markIdleBlockRange = function (lastBlock) {
                for (var i = 0; i < _this.blocks.length; ++i) {
                    if (_this.blocks[i].endBlock == lastBlock) {
                        _this.blocks[i].timestamp = new Date(0);
                        return true;
                    }
                }
                return false;
            };
            this.getFirstIdleRange = function (reset) {
                if (_this.blocks.length === 0) {
                    return null;
                }
                var head = _this.blocks[0];
                if (head.finished || head.fetched) {
                    return null;
                }
                var timeDiff = new Date().getTime() - head.timestamp.getTime();
                if (timeDiff / 1000 > 30) {
                    if (reset) {
                        head.timestamp = new Date();
                    }
                    return head;
                }
                return null;
            };
            this.getTxQueue = function () {
                return _this.txQueue;
            };
            this.getBlocks = function () {
                return _this.blocks;
            };
            this.getSize = function () {
                return _this.blocks.length;
            };
            this.reset = function () {
                _this.blocks = [];
            };
            this.blocks = [];
            this.wallet = wallet;
            this.chainHeight = 0;
            this.watchdog = watchdog;
            this.txQueue = new TxQueue(wallet, function (blockNumber) {
                _this.wallet.lastHeight = Math.min(_this.chainHeight, Math.max(_this.wallet.lastHeight, blockNumber));
                _this.watchdog.setLastBlockLoadingFromApply(blockNumber);
                _this.watchdog.checkMempool();
                _this.watchdog.notifyTxQueueDrain();
                _this.watchdog.tryScheduleFilter();
            });
        }
        return BlockList;
    }());
    var ParseWorker = /** @class */ (function () {
        function ParseWorker(wallet, watchdog, blockList, parseTxCallback) {
            var _this = this;
            this.initWorker = function () {
                _this.workerProcess = new Worker("./workers/TransferProcessingEntrypoint.js");
                _this.workerProcess.onmessage = function (data) {
                    var message = data.data;
                    if (message === "ready") {
                        logDebugMsg("worker ready...");
                        // signal the wallet update
                        _this.watchdog.checkMempool();
                        // post the wallet to the worker
                        _this.workerProcess.postMessage({
                            type: "initWallet",
                        });
                    }
                    else if (message === "missing_wallet") {
                        logDebugMsg("Wallet is are missing for the worker...");
                    }
                    else if (message.type) {
                        if (message.type === "readyWallet") {
                            _this.setIsReady(true);
                            _this.parseTxCallback();
                        }
                        else if (message.type === "screened") {
                            _this.blockList.recordScreenShard(message.startBlock, message.maxHeight, message.hashes);
                            _this.setIsWorking(false);
                            _this.parseTxCallback();
                        }
                        else if (message.type === "processed") {
                            _this.blockList.finishBlockRange(message.startBlock, message.maxHeight, message.transactions);
                            _this.setIsWorking(false);
                            _this.parseTxCallback();
                        }
                    }
                };
                return _this.workerProcess;
            };
            this.getWorker = function () {
                return _this.workerProcess;
            };
            this.getIsReady = function () {
                return _this.isReady;
            };
            this.getIsWorking = function () {
                return _this.isWorking;
            };
            this.setIsReady = function (value) {
                _this.isReady = value;
            };
            this.setIsWorking = function (value) {
                _this.isWorking = value;
            };
            this.getProcessed = function () {
                return _this.countProcessed;
            };
            this.incProcessed = function (value) {
                _this.countProcessed = _this.countProcessed + value;
            };
            this.parseTxCallback = parseTxCallback;
            this.blockList = blockList;
            this.watchdog = watchdog;
            this.wallet = wallet;
            this.workerProcess = this.initWorker();
            this.countProcessed = 0;
            this.isWorking = false;
            this.isReady = false;
        }
        return ParseWorker;
    }());
    var SyncWorker = /** @class */ (function () {
        function SyncWorker(explorer, wallet, prefetchSlotIndex) {
            var _this = this;
            this.fetchBlocks = function (startBlock, endBlock) {
                _this.isWorking = true;
                var fetchPromise = _this.explorer.getTransactionsForBlocksPrefetchSlot(_this.prefetchSlotIndex, startBlock, endBlock, _this.wallet.options.checkMinerTx);
                return fetchPromise
                    .then(function (transactions) { return ({
                    transactions: transactions,
                    lastBlock: endBlock,
                    startBlock: startBlock,
                }); })
                    .catch(function () {
                    throw {
                        transactions: [],
                        lastBlock: endBlock,
                        startBlock: startBlock,
                    };
                })
                    .finally(function () {
                    _this.isWorking = false;
                });
            };
            this.getIsWorking = function () {
                return _this.isWorking;
            };
            this.wallet = wallet;
            this.isWorking = false;
            this.explorer = explorer;
            this.prefetchSlotIndex = prefetchSlotIndex;
        }
        return SyncWorker;
    }());
    var WalletWatchdog = /** @class */ (function () {
        function WalletWatchdog(wallet, explorer) {
            var _this = this;
            this.stopped = false;
            this.cpuCores = 0;
            this.maxCpuCores = 0;
            this.remoteNodes = 0;
            this.maxConcurrentFetches = 1;
            this.syncWorkers = [];
            this.filterWorkers = [];
            this.intervalMempool = 0;
            this.lastBlockLoading = -1;
            this.lastMaximumHeight = 0;
            this.txQueueWaiters = [];
            this.setupWorkers = function () {
                var poolSize = Math.max(1, _this.explorer.getPrefetchNodePoolSize());
                if (_this.wallet.options.readSpeed == 10) {
                    _this.remoteNodes = Math.min(config.maxPrefetchParallel, poolSize, config.maxRemoteNodes);
                }
                else if (_this.wallet.options.readSpeed == 50) {
                    _this.remoteNodes = Math.min(Math.max(1, Math.floor(poolSize / 2)), config.maxPrefetchParallel, config.maxRemoteNodes);
                }
                else if (_this.wallet.options.readSpeed == 100) {
                    _this.remoteNodes = 1;
                }
                else {
                    _this.remoteNodes = Math.min(config.maxPrefetchParallel, poolSize, config.maxRemoteNodes);
                }
                // Main-thread apply is cheap; use full prefetch parallelism for fetches
                _this.maxConcurrentFetches = _this.remoteNodes;
            };
            this.signalWalletUpdate = function () {
                logDebugMsg("wallet update in progress");
                // reset the last block loading
                _this.lastBlockLoading = -1; //reset scanning
                _this.checkMempool();
            };
            this.initMempool = function (force) {
                if (force === void 0) { force = false; }
                if (_this.intervalMempool === 0 || force) {
                    if (force && _this.intervalMempool !== 0) {
                        clearInterval(_this.intervalMempool);
                    }
                    _this.intervalMempool = setInterval(function () {
                        _this.checkMempool();
                    }, (config.avgBlockTime / 4) * 1000);
                }
                _this.checkMempool();
            };
            this.acquireFilterWorker = function () {
                for (var i = 0; i < _this.filterWorkers.length; ++i) {
                    if (_this.filterWorkers[i].getIsReady() && !_this.filterWorkers[i].getIsWorking()) {
                        return _this.filterWorkers[i];
                    }
                }
                return null;
            };
            this.isFilterBusy = function () {
                for (var i = 0; i < _this.filterWorkers.length; ++i) {
                    if (_this.filterWorkers[i].getIsWorking()) {
                        return true;
                    }
                }
                return false;
            };
            this.getScreenShardCount = function (txCount) {
                var minPerShard = config.syncScreenMinTxPerShard;
                var maxShards = config.maxPrefetchParallel;
                if (txCount < minPerShard * 2) {
                    return 1;
                }
                return Math.min(maxShards, Math.ceil(txCount / minPerShard));
            };
            this.initScreening = function (range) {
                var txCount = range.fetchedTransactions.length;
                range.filterDispatched = true;
                range.screenShardTotal = _this.getScreenShardCount(txCount);
                range.screenNextShardIndex = 0;
                range.screenShardsCompleted = 0;
                range.screenHashes = new Set();
                range.screenComplete = false;
                range.parseDispatched = false;
                if (txCount === 0) {
                    range.screenComplete = true;
                    range.filterDispatched = false;
                }
            };
            this.dispatchScreenShards = function (range) {
                var txs = range.fetchedTransactions;
                var shardSize = Math.ceil(txs.length / range.screenShardTotal);
                var walletRaw = _this.wallet.exportToRaw();
                while (range.screenNextShardIndex < range.screenShardTotal) {
                    var filterWorker = _this.acquireFilterWorker();
                    if (!filterWorker) {
                        break;
                    }
                    var shardIndex = range.screenNextShardIndex;
                    var shardStart = shardIndex * shardSize;
                    var shardEnd = Math.min(shardStart + shardSize, txs.length);
                    var shard = txs.slice(shardStart, shardEnd);
                    range.screenNextShardIndex = range.screenNextShardIndex + 1;
                    filterWorker.setIsWorking(true);
                    filterWorker.incProcessed(shard.length);
                    // Worker screens shard with transactions.ownsTxBatch (one WASM receive batch per shard).
                    filterWorker.getWorker().postMessage({
                        type: "screen",
                        transactions: shard,
                        shardIndex: shardIndex,
                        readMinersTx: _this.wallet.options.checkMinerTx,
                        startBlock: range.startBlock,
                        maxBlock: range.endBlock,
                        wallet: walletRaw,
                    });
                }
            };
            this.dispatchParseOwned = function (range) {
                var filterWorker = _this.acquireFilterWorker();
                if (!filterWorker) {
                    return;
                }
                var ownedTransactions = _this.blockList.buildOwnedTransactions(range);
                if (ownedTransactions.length === 0) {
                    range.parseDispatched = true;
                    _this.blockList.finishBlockRange(range.startBlock, range.endBlock, []);
                    return;
                }
                range.parseDispatched = true;
                filterWorker.setIsWorking(true);
                filterWorker.incProcessed(ownedTransactions.length);
                filterWorker.getWorker().postMessage({
                    type: "process",
                    transactions: ownedTransactions,
                    screenedOwned: true,
                    readMinersTx: _this.wallet.options.checkMinerTx,
                    startBlock: range.startBlock,
                    maxBlock: range.endBlock,
                    wallet: _this.wallet.exportToRaw(),
                });
            };
            this.tryScheduleFilter = function () {
                if (_this.stopped) {
                    return;
                }
                if (!_this.blockList.getTxQueue().isIdle()) {
                    return;
                }
                var head = _this.blockList.getBlocks()[0];
                if (head && head.fetched && !head.finished && !head.screenComplete && head.filterDispatched) {
                    _this.dispatchScreenShards(head);
                }
                var range = _this.blockList.getNextRangeForFilter();
                if (!range) {
                    return;
                }
                if (!range.screenComplete) {
                    if (!range.filterDispatched) {
                        _this.initScreening(range);
                    }
                    if (!range.screenComplete) {
                        _this.dispatchScreenShards(range);
                    }
                    if (range.screenComplete) {
                        _this.tryScheduleFilter();
                    }
                    return;
                }
                _this.dispatchParseOwned(range);
            };
            this.stop = function () {
                _this.releaseTxQueueWaiters();
                clearInterval(_this.intervalMempool);
                _this.blockList.getTxQueue().reset();
                _this.blockList.reset();
                _this.stopped = true;
            };
            this.queuedTxCount = function () {
                var count = 0;
                for (var _i = 0, _a = _this.blockList.getBlocks(); _i < _a.length; _i++) {
                    var range = _a[_i];
                    if (!range.finished) {
                        count += range.fetchedTransactions.length;
                    }
                }
                return count;
            };
            this.isTxQueueFull = function (incomingTxCount) {
                if (incomingTxCount === void 0) { incomingTxCount = 0; }
                return _this.queuedTxCount() + incomingTxCount > config.maxTxQueueHigh || _this.blockList.getSize() >= config.maxTxQueuePackets;
            };
            this.waitForQueueCapacity = function () {
                var args_1 = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args_1[_i] = arguments[_i];
                }
                return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (incomingTxCount) {
                    var _this = this;
                    if (incomingTxCount === void 0) { incomingTxCount = 0; }
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(this.isTxQueueFull(incomingTxCount) && !this.stopped)) return [3 /*break*/, 2];
                                return [4 /*yield*/, new Promise(function (resolve) {
                                        _this.txQueueWaiters.push(resolve);
                                    })];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 0];
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            };
            this.releaseTxQueueWaiters = function () {
                var waiters = _this.txQueueWaiters.splice(0);
                for (var i = 0; i < waiters.length; i++) {
                    waiters[i]();
                }
            };
            this.getTxQueuePacketsLowWatermark = function () {
                return Math.max(1, Math.floor(config.maxTxQueuePackets * 0.2));
            };
            this.isTxQueueBelowLowWatermark = function () {
                return _this.queuedTxCount() <= config.maxTxQueueLow && _this.blockList.getSize() <= _this.getTxQueuePacketsLowWatermark();
            };
            this.notifyTxQueueDrain = function () {
                if (_this.isTxQueueBelowLowWatermark()) {
                    _this.releaseTxQueueWaiters();
                }
            };
            this.setLastBlockLoadingFromApply = function (blockNumber) {
                _this.lastBlockLoading = Math.max(_this.lastBlockLoading, blockNumber);
            };
            /** Wallet scan progress vs chain tip (not lastBlockLoading, which can run ahead while prefetching). */
            this.needsMoreBlockRanges = function (chainHeight) {
                var walletHeight = Math.max(0, Number(_this.wallet.lastHeight));
                var queuedThrough = _this.blockList.getTailQueuedEndBlock();
                return walletHeight < chainHeight || queuedThrough < chainHeight;
            };
            this.start = function () {
                // init the mempool
                _this.initMempool();
                // run main loop
                _this.stopped = false;
                _this.lastBlockLoading = -1;
                _this.lastMaximumHeight = -1;
                _this.startSyncLoop();
            };
            this.checkMempool = function () {
                logDebugMsg("checkMempool", _this.lastMaximumHeight, _this.wallet.lastHeight);
                if (_this.lastMaximumHeight - _this.wallet.lastHeight > 1 && _this.lastMaximumHeight > 0) {
                    //only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
                    return false;
                }
                _this.wallet.clearMemTx();
                _this.explorer
                    .getTransactionPool()
                    .then(function (pool) {
                    if (typeof pool !== "undefined") {
                        for (var _i = 0, pool_1 = pool; _i < pool_1.length; _i++) {
                            var rawTx = pool_1[_i];
                            var txData = TransactionsExplorer_1.TransactionsExplorer.parse(rawTx, _this.wallet);
                            if (txData !== null && txData.transaction !== null) {
                                _this.wallet.addNewMemTx(txData.transaction);
                            }
                        }
                    }
                })
                    .catch(function (err) {
                    if (err) {
                        console.error("checkMempool error:", err);
                    }
                });
                return true;
            };
            this.onBlockRangeFetched = function (startBlock, endBlock, transactions) {
                _this.blockList.setFetchedTransactions(startBlock, endBlock, transactions);
                _this.tryScheduleFilter();
            };
            this.getMultipleRandom = function (arr, num) {
                var shuffled = __spreadArray([], arr, true).sort(function () { return 0.5 - Math.random(); });
                return shuffled.slice(0, num);
            };
            this.getFreeWorker = function () {
                var workingCount = 0;
                // first check if max worker usage is reached
                for (var i = 0; i < _this.syncWorkers.length; ++i) {
                    if (_this.syncWorkers[i].getIsWorking()) {
                        workingCount = workingCount + 1;
                    }
                }
                if (workingCount < _this.maxConcurrentFetches) {
                    for (var i = 0; i < _this.syncWorkers.length; ++i) {
                        if (!_this.syncWorkers[i].getIsWorking()) {
                            return _this.syncWorkers[i];
                        }
                    }
                }
                return null;
            };
            this.getBlockList = function () {
                return _this.blockList;
            };
            this.getLastBlockLoading = function () {
                return _this.lastBlockLoading;
            };
            this.startSyncLoop = function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    (function (self) {
                        return __awaiter(this, void 0, void 0, function () {
                            var height, freeWorker, idleRange, startBlock, endBlock, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!!self.stopped) return [3 /*break*/, 28];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 25, , 27]);
                                        if (self.lastBlockLoading === -1) {
                                            self.lastBlockLoading = self.wallet.lastHeight;
                                        }
                                        if (!self.isTxQueueFull(0)) return [3 /*break*/, 3];
                                        logDebugMsg("Tx FIFO at high watermark", self.blockList.getSize(), self.queuedTxCount(), config.maxTxQueueHigh);
                                        return [4 /*yield*/, self.waitForQueueCapacity(0)];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 3: return [4 /*yield*/, self.explorer.getHeight()];
                                    case 4:
                                        height = _a.sent();
                                        // make sure we are not ahead of chain
                                        if (self.lastBlockLoading > height) {
                                            self.lastBlockLoading = height;
                                        }
                                        if (!(height > self.lastMaximumHeight)) return [3 /*break*/, 5];
                                        self.lastMaximumHeight = height;
                                        return [3 /*break*/, 7];
                                    case 5:
                                        if (!(self.wallet.lastHeight >= self.lastMaximumHeight)) return [3 /*break*/, 7];
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                                    case 6:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 7:
                                        self.tryScheduleFilter();
                                        freeWorker = self.getFreeWorker();
                                        if (!freeWorker) return [3 /*break*/, 22];
                                        idleRange = self.blockList.getFirstIdleRange(true);
                                        startBlock = 0;
                                        endBlock = 0;
                                        if (!idleRange) return [3 /*break*/, 8];
                                        startBlock = idleRange.startBlock;
                                        endBlock = idleRange.endBlock;
                                        return [3 /*break*/, 21];
                                    case 8:
                                        if (!self.needsMoreBlockRanges(height)) return [3 /*break*/, 19];
                                        if (!!self.blockList.canPrefetchNextRange()) return [3 /*break*/, 10];
                                        self.tryScheduleFilter();
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 200); })];
                                    case 9:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 10:
                                        if (!(self.blockList.getSize() >= config.maxBlockQueue)) return [3 /*break*/, 12];
                                        logDebugMsg("Block range list is to big", self.blockList.getSize());
                                        self.tryScheduleFilter();
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                                    case 11:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 12:
                                        startBlock = self.blockList.getTailQueuedEndBlock();
                                        endBlock = startBlock + config.syncBlockCount;
                                        // make sure endBlock is not over current height
                                        endBlock = Math.min(endBlock, height + 1);
                                        if (!(startBlock >= endBlock)) return [3 /*break*/, 14];
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                                    case 13:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 14:
                                        if (startBlock > self.lastMaximumHeight) {
                                            startBlock = self.lastMaximumHeight;
                                        }
                                        if (!(startBlock >= endBlock)) return [3 /*break*/, 16];
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                                    case 15:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 16:
                                        if (!!self.blockList.addBlockRange(startBlock, endBlock, height)) return [3 /*break*/, 18];
                                        self.tryScheduleFilter();
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 200); })];
                                    case 17:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 18: return [3 /*break*/, 21];
                                    case 19: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10 * 1000); })];
                                    case 20:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 21:
                                        // try to fetch the block range with a currently selected sync worker
                                        freeWorker
                                            .fetchBlocks(startBlock, endBlock)
                                            .then(function (blockData) {
                                            self.onBlockRangeFetched(blockData.startBlock, blockData.lastBlock, blockData.transactions);
                                        })
                                            .catch(function (blockData) {
                                            self.blockList.markIdleBlockRange(blockData.lastBlock);
                                            self.tryScheduleFilter();
                                        });
                                        return [3 /*break*/, 24];
                                    case 22:
                                        self.tryScheduleFilter();
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                                    case 23:
                                        _a.sent();
                                        _a.label = 24;
                                    case 24: return [3 /*break*/, 27];
                                    case 25:
                                        err_1 = _a.sent();
                                        console.error("Error occured in startSyncLoop...", err_1);
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 30 * 1000); })];
                                    case 26:
                                        _a.sent(); //retry 30s later if an error occurred
                                        return [3 /*break*/, 27];
                                    case 27: return [3 /*break*/, 0];
                                    case 28: return [2 /*return*/];
                                }
                            });
                        });
                    })(this);
                    return [2 /*return*/];
                });
            }); };
            console.log("WalletWatchdog");
            // by default we use all cores but limited up to config.maxWorkerCores
            this.maxCpuCores = Math.min(window.navigator.hardwareConcurrency ? Math.max(window.navigator.hardwareConcurrency - 1, 1) : 1, config.maxWorkerCores);
            this.wallet = wallet;
            this.explorer = explorer;
            this.blockList = new BlockList(wallet, this);
            for (var i = 0; i < config.maxPrefetchParallel; ++i) {
                this.filterWorkers.push(new ParseWorker(this.wallet, this, this.blockList, this.tryScheduleFilter));
                this.syncWorkers.push(new SyncWorker(this.explorer, this.wallet, i));
            }
            this.setupWorkers();
        }
        return WalletWatchdog;
    }());
    exports.WalletWatchdog = WalletWatchdog;
});
