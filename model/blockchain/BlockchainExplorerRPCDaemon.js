/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
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
define(["require", "exports", "../Storage", "../WalletWatchdog"], function (require, exports, Storage_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlockchainExplorerRpcDaemon = void 0;
    var NodeWorker = /** @class */ (function () {
        function NodeWorker(url) {
            var _this = this;
            this.timeout = 10 * 1000;
            this.maxTempErrors = 3;
            this.maxAllErrors = 100;
            this.makeRequest = function (method, path, body) {
                if (body === void 0) { body = undefined; }
                _this._isWorking = true;
                ++_this._requests;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: _this._url + path,
                        method: method,
                        timeout: _this.timeout,
                        data: typeof body === 'string' ? body : JSON.stringify(body)
                    }).done(function (raw) {
                        _this._isWorking = false;
                        resolve(raw);
                    }).fail(function (data, textStatus) {
                        _this._isWorking = false;
                        _this.increaseErrors();
                        reject(data);
                    });
                });
            };
            this.makeRpcRequest = function (method, params) {
                if (params === void 0) { params = {}; }
                _this._isWorking = true;
                ++_this._requests;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: _this._url + 'json_rpc',
                        method: 'POST',
                        timeout: _this.timeout,
                        data: JSON.stringify({
                            jsonrpc: '2.0',
                            method: method,
                            params: params,
                            id: 0
                        }),
                        contentType: 'application/json'
                    }).done(function (raw) {
                        _this._isWorking = false;
                        if (typeof raw.id === 'undefined' || typeof raw.jsonrpc === 'undefined' || raw.jsonrpc !== '2.0' || typeof raw.result !== 'object') {
                            _this.increaseErrors();
                            reject('Daemon response is not properly formatted');
                        }
                        else {
                            resolve(raw.result);
                        }
                    }).fail(function (data) {
                        _this._isWorking = false;
                        _this.increaseErrors();
                        reject(data);
                    });
                });
            };
            this.increaseErrors = function () {
                ++_this._errors;
                ++_this._allErrors;
            };
            this.hasToManyErrors = function () {
                return ((_this._errors >= _this.maxTempErrors) || (_this._allErrors >= _this.maxAllErrors));
            };
            this.getStatus = function () {
                if ((_this._errors < _this.maxTempErrors) && (_this._allErrors < _this.maxAllErrors)) {
                    return 0;
                }
                else if ((_this._errors >= _this.maxTempErrors) && (_this._allErrors < _this.maxAllErrors)) {
                    return 1;
                }
                else if (_this._allErrors >= _this.maxAllErrors) {
                    return 2;
                }
                else {
                    return 3;
                }
            };
            this._url = url;
            this._errors = 0;
            this._allErrors = 0;
            this._requests = 0;
            this._isWorking = false;
            // reduce error count each minute
            this.errorInterval = setInterval(function () {
                _this._errors = Math.max(_this._errors - 1, 0);
            }, 60 * 1000);
        }
        Object.defineProperty(NodeWorker.prototype, "isWorking", {
            get: function () {
                return this._isWorking;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NodeWorker.prototype, "url", {
            get: function () {
                return this._url;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NodeWorker.prototype, "errors", {
            get: function () {
                return this._errors;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NodeWorker.prototype, "allErrors", {
            get: function () {
                return this._allErrors;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(NodeWorker.prototype, "requests", {
            get: function () {
                return this._requests;
            },
            enumerable: false,
            configurable: true
        });
        return NodeWorker;
    }());
    var NodeWorkersList = /** @class */ (function () {
        function NodeWorkersList() {
            var _this = this;
            this.acquireWorker = function () {
                var shuffledNodes = __spreadArray([], _this.nodes, true).sort(function (a, b) { return 0.5 - Math.random(); });
                for (var i = 0; i < shuffledNodes.length; i++) {
                    if (!shuffledNodes[i].isWorking && !shuffledNodes[i].hasToManyErrors()) {
                        return shuffledNodes[i];
                    }
                }
                return null;
            };
            this.makeRequest = function (method, path, body) {
                if (body === void 0) { body = undefined; }
                return new Promise(function (resolve, reject) {
                    (function (self) {
                        return __awaiter(this, void 0, void 0, function () {
                            var waitCounter, currWorker, resultData, resultData_1, data_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        waitCounter = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!((self.nodes.length === 0) && (waitCounter < 5))) return [3 /*break*/, 3];
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                                    case 2:
                                        _a.sent();
                                        ++waitCounter;
                                        return [3 /*break*/, 1];
                                    case 3:
                                        if (!(self.nodes.length > 0)) return [3 /*break*/, 10];
                                        currWorker = self.acquireWorker();
                                        resultData = null;
                                        _a.label = 4;
                                    case 4:
                                        if (!currWorker) return [3 /*break*/, 9];
                                        _a.label = 5;
                                    case 5:
                                        _a.trys.push([5, 7, , 8]);
                                        return [4 /*yield*/, currWorker.makeRequest(method, path, body)];
                                    case 6:
                                        resultData_1 = _a.sent();
                                        currWorker = null;
                                        // return the data
                                        resolve(resultData_1);
                                        return [3 /*break*/, 8];
                                    case 7:
                                        data_1 = _a.sent();
                                        currWorker = self.acquireWorker();
                                        resultData = data_1;
                                        return [3 /*break*/, 8];
                                    case 8: return [3 /*break*/, 4];
                                    case 9:
                                        // if we are here we failed
                                        if (!currWorker) {
                                            reject(resultData);
                                        }
                                        return [3 /*break*/, 11];
                                    case 10:
                                        reject(null);
                                        _a.label = 11;
                                    case 11: return [2 /*return*/];
                                }
                            });
                        });
                    })(_this);
                });
            };
            this.makeRpcRequest = function (method, params) {
                if (params === void 0) { params = {}; }
                return new Promise(function (resolve, reject) {
                    (function (self) {
                        return __awaiter(this, void 0, void 0, function () {
                            var waitCounter, currWorker, resultData, resultData_2, data_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        waitCounter = 0;
                                        _a.label = 1;
                                    case 1:
                                        if (!((self.nodes.length === 0) && (waitCounter < 5))) return [3 /*break*/, 3];
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 1000); })];
                                    case 2:
                                        _a.sent();
                                        ++waitCounter;
                                        return [3 /*break*/, 1];
                                    case 3:
                                        if (!(self.nodes.length > 0)) return [3 /*break*/, 10];
                                        currWorker = self.acquireWorker();
                                        resultData = null;
                                        _a.label = 4;
                                    case 4:
                                        if (!currWorker) return [3 /*break*/, 9];
                                        _a.label = 5;
                                    case 5:
                                        _a.trys.push([5, 7, , 8]);
                                        return [4 /*yield*/, currWorker.makeRpcRequest(method, params)];
                                    case 6:
                                        resultData_2 = _a.sent();
                                        currWorker = null;
                                        // return the data
                                        resolve(resultData_2);
                                        return [3 /*break*/, 8];
                                    case 7:
                                        data_2 = _a.sent();
                                        currWorker = self.acquireWorker();
                                        resultData = data_2;
                                        return [3 /*break*/, 8];
                                    case 8: return [3 /*break*/, 4];
                                    case 9:
                                        // if we are here we failed
                                        if (!currWorker) {
                                            reject(resultData);
                                        }
                                        return [3 /*break*/, 11];
                                    case 10:
                                        reject(null);
                                        _a.label = 11;
                                    case 11: return [2 /*return*/];
                                }
                            });
                        });
                    })(_this);
                });
            };
            this.getNodes = function () {
                return _this.nodes;
            };
            this.start = function (nodes) {
                for (var i = 0; i < nodes.length; i++) {
                    _this.nodes.push(new NodeWorker(nodes[i]));
                }
            };
            this.stop = function () {
                _this.nodes = [];
            };
            this.nodes = [];
        }
        return NodeWorkersList;
    }());
    var BlockchainExplorerRpcDaemon = /** @class */ (function () {
        function BlockchainExplorerRpcDaemon() {
            var _this = this;
            this.initialized = false;
            this.lastTimeRetrieveHeight = 0;
            this.lastTimeRetrieveInfo = 0;
            this.scannedHeight = 0;
            this.cacheHeight = 0;
            this.cacheInfo = null;
            this.getInfo = function () {
                if (((Date.now() - _this.lastTimeRetrieveInfo) < 20 * 1000) && (_this.cacheInfo !== null)) {
                    return Promise.resolve(_this.cacheInfo);
                }
                _this.lastTimeRetrieveInfo = Date.now();
                return _this.nodeWorkers.makeRequest('GET', 'getinfo').then(function (data) {
                    _this.cacheInfo = data;
                    return data;
                });
            };
            this.getHeight = function () {
                if (((Date.now() - _this.lastTimeRetrieveHeight) < 20 * 1000) && (_this.cacheHeight !== 0)) {
                    return Promise.resolve(_this.cacheHeight);
                }
                _this.lastTimeRetrieveHeight = Date.now();
                return _this.nodeWorkers.makeRequest('GET', 'getheight').then(function (data) {
                    var height = parseInt(data.height);
                    _this.cacheHeight = height;
                    return height;
                });
            };
            this.getScannedHeight = function () {
                return _this.scannedHeight;
            };
            this.resetNodes = function () {
                Storage_1.Storage.getItem('customNodeUrl', null).then(function (customNodeUrl) {
                    _this.nodeWorkers.stop();
                    function shuffle(array) {
                        var _a;
                        var currentIndex = array.length;
                        // While there remain elements to shuffle...
                        while (currentIndex != 0) {
                            // Pick a remaining element...
                            var randomIndex = Math.floor(Math.random() * currentIndex);
                            currentIndex--;
                            // And swap it with the current element.
                            _a = [
                                array[randomIndex], array[currentIndex]
                            ], array[currentIndex] = _a[0], array[randomIndex] = _a[1];
                        }
                    }
                    if (customNodeUrl) {
                        _this.nodeWorkers.start([customNodeUrl]);
                    }
                    else {
                        shuffle(config.nodeList);
                        _this.nodeWorkers.start(config.nodeList);
                    }
                }).catch(function (err) {
                    console.log("resetNodes failed", err);
                });
            };
            this.isInitialized = function () {
                return _this.initialized;
            };
            this.initialize = function () {
                var doesMatch = function (toCheck) {
                    return function (element) {
                        return element.toLowerCase() === toCheck.toLowerCase();
                    };
                };
                if (_this.initialized) {
                    return Promise.resolve(true);
                }
                else {
                    if (config.publicNodes) {
                        return $.ajax({
                            method: 'GET',
                            timeout: 10 * 1000,
                            url: config.publicNodes + '/list?hasSSL=true'
                        }).done(function (result) {
                            if (result.success && (result.list.length > 0)) {
                                for (var i = 0; i < result.list.length; ++i) {
                                    var finalUrl = "https://" + result.list[i].url.host + "/";
                                    if (config.nodeList.findIndex(doesMatch(finalUrl)) == -1) {
                                        config.nodeList.push(finalUrl);
                                    }
                                }
                            }
                            _this.initialized = true;
                            _this.resetNodes();
                            return true;
                        }).fail(function (data, textStatus) {
                            return false;
                        });
                    }
                    else {
                        return Promise.resolve(true);
                    }
                }
            };
            this.start = function (wallet) {
                var watchdog = new WalletWatchdog_1.WalletWatchdog(wallet, _this);
                watchdog.start();
                return watchdog;
            };
            this.nodeWorkers = new NodeWorkersList();
            this.initialized = false;
        }
        /**
         * Returns an array containing all numbers like [start;end]
         * @param start
         * @param end
         */
        BlockchainExplorerRpcDaemon.prototype.range = function (start, end) {
            var numbers = [];
            for (var i = start; i <= end; ++i) {
                numbers.push(i);
            }
            return numbers;
        };
        BlockchainExplorerRpcDaemon.prototype.getTransactionsForBlocks = function (startBlock, endBlock, includeMinerTxs) {
            var tempStartBlock;
            if (startBlock === 0) {
                tempStartBlock = 1;
            }
            else {
                tempStartBlock = startBlock;
            }
            return this.nodeWorkers.makeRequest('POST', 'get_raw_transactions_by_heights', {
                heights: [tempStartBlock, endBlock],
                include_miner_txs: includeMinerTxs,
                range: true
            }).then(function (response) {
                var formatted = [];
                if (response.status !== 'OK') {
                    throw 'invalid_transaction_answer';
                }
                if (response.transactions.length > 0) {
                    for (var _i = 0, _a = response.transactions; _i < _a.length; _i++) {
                        var rawTx = _a[_i];
                        var tx = null;
                        if (rawTx && rawTx.transaction) {
                            tx = rawTx.transaction;
                            if (tx !== null) {
                                tx.ts = rawTx.timestamp;
                                tx.height = rawTx.height;
                                tx.hash = rawTx.hash;
                                tx.fee = rawTx.fee;
                                if (rawTx.output_indexes.length > 0)
                                    tx.global_index_start = rawTx.output_indexes[0];
                                tx.output_indexes = rawTx.output_indexes;
                                formatted.push(tx);
                            }
                        }
                    }
                }
                return formatted;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getTransactionPool = function () {
            return this.nodeWorkers.makeRequest('GET', 'getrawtransactionspool').then(function (response) {
                var formatted = [];
                for (var _i = 0, _a = response.transactions; _i < _a.length; _i++) {
                    var rawTx = _a[_i];
                    var tx = null;
                    if (rawTx && rawTx.transaction) {
                        tx = rawTx.transaction;
                        if (tx !== null) {
                            tx.ts = rawTx.timestamp;
                            tx.height = rawTx.height;
                            tx.hash = rawTx.hash;
                            if (rawTx.output_indexes.length > 0) {
                                tx.global_index_start = rawTx.output_indexes[0];
                                tx.output_indexes = rawTx.output_indexes;
                            }
                            formatted.push(tx);
                        }
                    }
                }
                return formatted;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getRandomOuts = function (amounts, nbOutsNeeded) {
            return this.nodeWorkers.makeRequest('POST', 'getrandom_outs', {
                amounts: amounts,
                outs_count: nbOutsNeeded
            }).then(function (response) {
                if (response.status !== 'OK')
                    throw 'invalid_getrandom_outs_answer';
                if (response.outs.length > 0) {
                    logDebugMsg(response.outs);
                }
                return response.outs;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.sendRawTx = function (rawTx) {
            return this.nodeWorkers.makeRequest('POST', 'sendrawtransaction', {
                tx_as_hex: rawTx,
                do_not_relay: false
            }).then(function (transactions) {
                if (!transactions.status || transactions.status !== 'OK')
                    throw transactions;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.resolveOpenAlias = function (domain) {
            return this.nodeWorkers.makeRpcRequest('resolve_open_alias', { url: domain }).then(function (response) {
                if (response.addresses && response.addresses.length > 0)
                    return { address: response.addresses[0], name: null };
                throw 'not_found';
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getNetworkInfo = function () {
            var _this = this;
            return this.nodeWorkers.makeRpcRequest('getlastblockheader').then(function (raw) {
                var nodeList = _this.nodeWorkers.getNodes();
                var usedNodes = [];
                for (var i = 0; i < nodeList.length; i++) {
                    usedNodes.push({
                        'url': nodeList[i].url,
                        'requests': nodeList[i].requests,
                        'errors': nodeList[i].errors,
                        'allErrors': nodeList[i].allErrors,
                        'status': nodeList[i].getStatus()
                    });
                }
                return {
                    'nodes': usedNodes,
                    'major_version': raw.block_header['major_version'],
                    'hash': raw.block_header['hash'],
                    'reward': raw.block_header['reward'],
                    'height': raw.block_header['height'],
                    'timestamp': raw.block_header['timestamp'],
                    'difficulty': raw.block_header['difficulty']
                };
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getRemoteNodeInformation = function () {
            // TODO change to /feeaddress
            return this.getInfo().then(function (info) {
                return {
                    'fee_address': info['fee_address'],
                    'status': info['status']
                };
            });
        };
        return BlockchainExplorerRpcDaemon;
    }());
    exports.BlockchainExplorerRpcDaemon = BlockchainExplorerRpcDaemon;
});
