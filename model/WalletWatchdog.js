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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
    var TxQueue = /** @class */ (function () {
        function TxQueue(wallet, processingCallback) {
            var _this = this;
            this.initWorker = function () {
                _this.workerProcess = new Worker('./workers/ParseTransactionsEntrypoint.js');
                _this.workerProcess.onmessage = function (data) {
                    var message = data.data;
                    if (message === 'ready') {
                        logDebugMsg('worker ready...');
                        // post the wallet to the worker
                        _this.workerProcess.postMessage({
                            type: 'initWallet'
                        });
                    }
                    else if (message === "missing_wallet") {
                        logDebugMsg("Wallet is missing for the worker...");
                    }
                    else if (message.type) {
                        if (message.type === 'readyWallet') {
                            _this.setIsReady(true);
                        }
                        else if (message.type === 'processed') {
                            _this.isRunning = false;
                            if (message.transactions.length > 0) {
                                for (var _i = 0, _a = message.transactions; _i < _a.length; _i++) {
                                    var tx = _a[_i];
                                    _this.wallet.addNew(Transaction_1.Transaction.fromRaw(tx));
                                }
                            }
                            // signall progress and start next loop now
                            _this.processingCallback(message.maxHeight);
                            _this.runProcessLoop();
                        }
                    }
                };
                return _this.workerProcess;
            };
            this.runProcessLoop = function () {
                if (_this.isReady) {
                    if (!_this.isRunning) {
                        var txQueueItem = _this.processingQueue.shift();
                        if (txQueueItem) {
                            //we destroy the worker in charge of decoding the transactions every 5k transactions to ensure the memory is not corrupted
                            //cnUtil bug, see https://github.com/mymonero/mymonero-core-js/issues/8
                            if (_this.countProcessed >= 5 * 1000) {
                                logDebugMsg('Recreated parseWorker..');
                                _this.restartWorker();
                                setTimeout(function () {
                                    _this.runProcessLoop();
                                }, 1000);
                                return;
                            }
                            _this.isRunning = true;
                            // increase the number of transactions we actually processed
                            _this.countProcessed = _this.countProcessed + txQueueItem.transactions.length;
                            _this.workerProcess.postMessage({
                                wallet: txQueueItem.transactions.length > 0 ? _this.wallet.exportToRaw() : null,
                                transactions: txQueueItem.transactions,
                                maxBlock: txQueueItem.maxBlockNum,
                                type: 'process'
                            });
                        }
                    }
                }
                else {
                    if (!_this.isReady) {
                        setTimeout(function () {
                            _this.runProcessLoop();
                        }, 1000);
                    }
                }
            };
            this.addTransactions = function (transactions, maxBlockNum) {
                var txQueueItem = {
                    transactions: transactions,
                    maxBlockNum: maxBlockNum
                };
                _this.processingQueue.push(txQueueItem);
                _this.runProcessLoop();
            };
            this.restartWorker = function () {
                _this.isReady = false;
                _this.isRunning = false;
                _this.countProcessed = 0;
                _this.workerProcess.terminate();
                _this.workerProcess = _this.initWorker();
            };
            this.setIsReady = function (value) {
                _this.isReady = value;
            };
            this.hasData = function () {
                return _this.processingQueue.length > 0;
            };
            this.getSize = function () {
                return _this.processingQueue.length;
            };
            this.reset = function () {
                _this.isReady = false;
                _this.isRunning = false;
                _this.processingQueue = [];
                _this.workerProcess = _this.initWorker();
            };
            this.wallet = wallet;
            this.isReady = false;
            this.isRunning = false;
            this.countProcessed = 0;
            this.processingQueue = [];
            this.workerProcess = this.initWorker();
            this.processingCallback = processingCallback;
        }
        return TxQueue;
    }());
    var BlockList = /** @class */ (function () {
        function BlockList(wallet, watchdog) {
            var _this = this;
            this.addBlockRange = function (startBlock, endBlock, chainHeight) {
                _this.chainHeight = Math.max(_this.chainHeight, chainHeight);
                var rangeData = {
                    startBlock: startBlock,
                    endBlock: endBlock,
                    finished: false,
                    timestamp: new Date(),
                    transactions: []
                };
                if (_this.blocks.length > 0) {
                    for (var i = _this.blocks.length - 1; i >= 0; i--) {
                        if ((startBlock === _this.blocks[i].startBlock) && (endBlock === _this.blocks[i].endBlock)) {
                            return;
                        }
                        else if (endBlock > _this.blocks[i].endBlock) {
                            if (i = _this.blocks.length) {
                                _this.blocks.push(rangeData);
                            }
                            else {
                                _this.blocks.splice(i + 1, 0, rangeData);
                            }
                            break;
                        }
                    }
                }
                else {
                    _this.blocks.push(rangeData);
                }
            };
            this.finishBlockRange = function (lastBlock, transactions) {
                if (lastBlock > -1) {
                    for (var i = 0; i < _this.blocks.length; ++i) {
                        if (lastBlock <= _this.blocks[i].endBlock) {
                            _this.blocks[i].transactions = transactions;
                            _this.blocks[i].finished = true;
                            break;
                        }
                    }
                    // remove all finished block
                    while (_this.blocks.length > 0) {
                        if (_this.blocks[0].finished) {
                            var block = _this.blocks.shift();
                            // add any transactions to the wallet
                            _this.txQueue.addTransactions(block.transactions, block.endBlock);
                        }
                        else {
                            break;
                        }
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
                for (var i = 0; i < _this.blocks.length; ++i) {
                    if (!_this.blocks[i].finished) {
                        var timeDiff = new Date().getTime() - _this.blocks[i].timestamp.getTime();
                        if ((timeDiff / 1000) > 30) {
                            if (reset) {
                                _this.blocks[i].timestamp = new Date();
                            }
                            return _this.blocks[i];
                        }
                    }
                    else {
                        return null;
                    }
                }
                // none found
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
                _this.watchdog.checkMempool();
            });
        }
        return BlockList;
    }());
    var ParseWorker = /** @class */ (function () {
        function ParseWorker(wallet, watchdog, blockList, parseTxCallback) {
            var _this = this;
            this.initWorker = function () {
                _this.workerProcess = new Worker('./workers/TransferProcessingEntrypoint.js');
                _this.workerProcess.onmessage = function (data) {
                    var message = data.data;
                    if (message === 'ready') {
                        logDebugMsg('worker ready...');
                        // signal the wallet update
                        _this.watchdog.checkMempool();
                        // post the wallet to the worker
                        _this.workerProcess.postMessage({
                            type: 'initWallet'
                        });
                    }
                    else if (message === "missing_wallet") {
                        logDebugMsg("Wallet is are missing for the worker...");
                    }
                    else if (message.type) {
                        if (message.type === 'readyWallet') {
                            _this.setIsReady(true);
                        }
                        else if (message.type === 'processed') {
                            // we are done processing now
                            _this.blockList.finishBlockRange(message.maxHeight, message.transactions);
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
        function SyncWorker(explorer, wallet) {
            var _this = this;
            this.fetchBlocks = function (startBlock, endBlock) {
                _this.isWorking = true;
                return new Promise(function (resolve, reject) {
                    _this.explorer.getTransactionsForBlocks(startBlock, endBlock, _this.wallet.options.checkMinerTx).then(function (transactions) {
                        resolve({
                            transactions: transactions,
                            lastBlock: endBlock
                        });
                    }).catch(function (err) {
                        reject({
                            transactions: [],
                            lastBlock: endBlock
                        });
                    }).finally(function () {
                        _this.isWorking = false;
                    });
                });
            };
            this.getIsWorking = function () {
                return _this.isWorking;
            };
            this.wallet = wallet;
            this.isWorking = false;
            this.explorer = explorer;
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
            this.syncWorkers = [];
            this.parseWorkers = [];
            this.intervalMempool = 0;
            this.lastBlockLoading = -1;
            this.lastMaximumHeight = 0;
            this.transactionsToProcess = [];
            this.setupWorkers = function () {
                _this.cpuCores = _this.maxCpuCores;
                if (_this.wallet.options.readSpeed == 10) {
                    // use 3/4 of the cores for fast syncing
                    _this.cpuCores = Math.min(Math.max(1, Math.floor(3 * (_this.maxCpuCores / 4))), config.maxWorkerCores);
                }
                else if (_this.wallet.options.readSpeed == 50) {
                    // use half of the cores for medim syncing
                    _this.cpuCores = Math.min(Math.max(1, Math.floor(_this.maxCpuCores / 2)), config.maxWorkerCores);
                }
                else if (_this.wallet.options.readSpeed == 100) {
                    // slowest, use only one core
                    _this.cpuCores = 1;
                }
                // random nodes are dependent both on max nodes available as well as on number of cores we have available and perfomance settings
                _this.remoteNodes = Math.min(config.maxRemoteNodes, config.nodeList.length, _this.cpuCores);
            };
            this.signalWalletUpdate = function () {
                logDebugMsg('wallet update in progress');
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
                    }, config.avgBlockTime / 4 * 1000);
                }
                _this.checkMempool();
            };
            this.acquireWorker = function () {
                var workingCount = 0;
                // first check if max worker usage is reached
                for (var i = 0; i < _this.parseWorkers.length; ++i) {
                    if (_this.parseWorkers[i].getIsWorking()) {
                        workingCount = workingCount + 1;
                    }
                }
                if (workingCount < _this.cpuCores) {
                    for (var i = 0; i < _this.parseWorkers.length; ++i) {
                        if (!_this.parseWorkers[i].getIsWorking() && _this.parseWorkers[i].getIsReady()) {
                            return _this.parseWorkers[i];
                        }
                    }
                }
                return null;
            };
            this.stop = function () {
                _this.transactionsToProcess = [];
                clearInterval(_this.intervalMempool);
                _this.blockList.getTxQueue().reset();
                _this.blockList.reset();
                _this.stopped = true;
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
                if (((_this.lastMaximumHeight - _this.wallet.lastHeight) > 1) && (_this.lastMaximumHeight > 0)) { //only check memory pool if the user is up to date to ensure outs & ins will be found in the wallet
                    return false;
                }
                _this.wallet.clearMemTx();
                _this.explorer.getTransactionPool().then(function (pool) {
                    if (typeof pool !== 'undefined') {
                        for (var _i = 0, pool_1 = pool; _i < pool_1.length; _i++) {
                            var rawTx = pool_1[_i];
                            var tx = TransactionsExplorer_1.TransactionsExplorer.parse(rawTx, _this.wallet);
                            if (tx !== null) {
                                _this.wallet.addNewMemTx(tx);
                            }
                        }
                    }
                }).catch(function (err) {
                    if (err) {
                        console.error("checkMempool error:", err);
                    }
                });
                return true;
            };
            this.processParseTransaction = function () {
                if (_this.transactionsToProcess.length > 0) {
                    var parseWorker = _this.acquireWorker();
                    if (parseWorker) {
                        // define the transactions we need to process
                        var transactionsToProcess = _this.transactionsToProcess.shift();
                        if (transactionsToProcess) {
                            parseWorker.setIsWorking(true);
                            // increase the number of transactions we actually processed
                            parseWorker.incProcessed(transactionsToProcess.transactions.length);
                            parseWorker.getWorker().postMessage({
                                transactions: transactionsToProcess.transactions,
                                readMinersTx: _this.wallet.options.checkMinerTx,
                                maxBlock: transactionsToProcess.lastBlock,
                                wallet: _this.wallet.exportToRaw(),
                                type: 'process',
                            });
                        }
                    }
                }
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
                if (workingCount < _this.remoteNodes) {
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
                                        if (!!self.stopped) return [3 /*break*/, 20];
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 17, , 19]);
                                        if (self.lastBlockLoading === -1) {
                                            self.lastBlockLoading = self.wallet.lastHeight;
                                        }
                                        if (!(self.transactionsToProcess.length > 500)) return [3 /*break*/, 3];
                                        logDebugMsg("Having more then 500 TX packets in FIFO queue", self.transactionsToProcess.length);
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 5000); })];
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
                                        freeWorker = self.getFreeWorker();
                                        if (!freeWorker) return [3 /*break*/, 14];
                                        idleRange = self.blockList.getFirstIdleRange(true);
                                        startBlock = 0;
                                        endBlock = 0;
                                        if (!idleRange) return [3 /*break*/, 8];
                                        startBlock = idleRange.startBlock;
                                        endBlock = idleRange.endBlock;
                                        return [3 /*break*/, 13];
                                    case 8:
                                        if (!(self.lastBlockLoading < height)) return [3 /*break*/, 11];
                                        if (!(self.blockList.getSize() > config.maxBlockQueue)) return [3 /*break*/, 10];
                                        logDebugMsg('Block range list is to big', self.blockList.getSize());
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                                    case 9:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 10:
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
                                        return [3 /*break*/, 13];
                                    case 11: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10 * 1000); })];
                                    case 12:
                                        _a.sent();
                                        return [3 /*break*/, 0];
                                    case 13:
                                        // try to fetch the block range with a currently selected sync worker
                                        freeWorker.fetchBlocks(startBlock, endBlock).then(function (blockData) {
                                            if (blockData.transactions.length > 0) {
                                                self.processTransactions(blockData.transactions, blockData.lastBlock);
                                            }
                                            else {
                                                self.blockList.finishBlockRange(blockData.lastBlock, []);
                                            }
                                        }).catch(function (blockData) {
                                            self.blockList.markIdleBlockRange(blockData.lastBlock);
                                        });
                                        return [3 /*break*/, 16];
                                    case 14: return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                                    case 15:
                                        _a.sent();
                                        _a.label = 16;
                                    case 16: return [3 /*break*/, 19];
                                    case 17:
                                        err_1 = _a.sent();
                                        console.error("Error occured in startSyncLoop...", err_1);
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 30 * 1000); })];
                                    case 18:
                                        _a.sent(); //retry 30s later if an error occurred
                                        return [3 /*break*/, 19];
                                    case 19: return [3 /*break*/, 0];
                                    case 20: return [2 /*return*/];
                                }
                            });
                        });
                    })(this);
                    return [2 /*return*/];
                });
            }); };
            // by default we use all cores but limited up to config.maxWorkerCores
            this.maxCpuCores = Math.min(window.navigator.hardwareConcurrency ? (Math.max(window.navigator.hardwareConcurrency - 1, 1)) : 1, config.maxWorkerCores);
            this.wallet = wallet;
            this.explorer = explorer;
            this.blockList = new BlockList(wallet, this);
            // create parse workers
            for (var i = 0; i < this.maxCpuCores; ++i) {
                var parseWorker = new ParseWorker(this.wallet, this, this.blockList, this.processParseTransaction);
                this.parseWorkers.push(parseWorker);
            }
            // create a worker for each random node
            for (var i = 0; i < config.nodeList.length; ++i) {
                this.syncWorkers.push(new SyncWorker(this.explorer, this.wallet));
            }
            this.setupWorkers();
        }
        WalletWatchdog.prototype.processTransactions = function (transactions, lastBlock) {
            var txList = {
                transactions: transactions,
                lastBlock: lastBlock,
            };
            logDebugMsg("processTransactions called...", transactions);
            // add the raw transaction to the processing FIFO list
            this.transactionsToProcess.push(txList);
            // parse the transactions immediately
            this.processParseTransaction();
        };
        return WalletWatchdog;
    }());
    exports.WalletWatchdog = WalletWatchdog;
});
