/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2025 Conceal Community, Conceal.Network & Conceal Devs
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
                        console.error("Node ".concat(_this._url, " makeRequest failed: ").concat(textStatus, " (errors: ").concat(_this._errors + 1, ")"));
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
            this.sessionNode = null;
            this.sessionStartTime = 0;
            this.sessionDuration = 30 * 60 * 1000; // 30 minutes
            this.maxSessionErrors = 3;
            this.sessionErrorCount = 0;
            this.usedNodeUrls = new Set(); // Track used nodes to avoid re-picking
            this.makeRequest = function (method, path, body) {
                if (body === void 0) { body = undefined; }
                return _this.executeWithSessionFailover(function (node) { return node.makeRequest(method, path, body); });
            };
            this.executeWithSessionFailover = function (operation) { return __awaiter(_this, void 0, void 0, function () {
                var lastError, attempts, sessionNode, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            attempts = 0;
                            _a.label = 1;
                        case 1:
                            if (!(attempts < 3)) return [3 /*break*/, 6];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            sessionNode = this.getSessionNode();
                            if (!sessionNode) {
                                throw new Error('No available nodes');
                            }
                            return [4 /*yield*/, operation(sessionNode)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            error_1 = _a.sent();
                            lastError = error_1;
                            this.sessionErrorCount++;
                            // If we've reached max session errors, reset the session to pick a new node
                            if (this.sessionErrorCount >= this.maxSessionErrors) {
                                this.sessionNode = null;
                                this.sessionErrorCount = 0;
                                // Only clear used nodes if we've used most of the available nodes
                                // This prevents immediately re-selecting the same failed node
                                if (this.usedNodeUrls.size >= Math.max(1, this.nodes.length - 1)) {
                                    this.usedNodeUrls.clear();
                                }
                                else {
                                    console.log("Keeping used nodes list (".concat(this.usedNodeUrls.size, "/").concat(this.nodes.length, " used)"));
                                }
                            }
                            return [3 /*break*/, 5];
                        case 5:
                            attempts++;
                            return [3 /*break*/, 1];
                        case 6: throw lastError;
                    }
                });
            }); };
            this.makeRpcRequest = function (method, params) {
                if (params === void 0) { params = {}; }
                return _this.executeWithSessionFailover(function (node) { return node.makeRpcRequest(method, params); });
            };
            this.getNodes = function () {
                return _this.nodes;
            };
            this.start = function (nodes) {
                console.log("NodeWorkersList.start: Initializing ".concat(nodes.length, " nodes"));
                for (var i = 0; i < nodes.length; i++) {
                    _this.nodes.push(new NodeWorker(nodes[i]));
                }
                // Initialize session when nodes are available
                _this.initializeSession();
            };
            this.stop = function () {
                _this.nodes = [];
            };
            this.nodes = [];
        }
        NodeWorkersList.prototype.initializeSession = function () {
            // Pick a random node for the session
            this.sessionNode = this.pickRandomNode();
            this.sessionStartTime = Date.now();
            this.sessionErrorCount = 0;
            if (this.sessionNode) {
                this.usedNodeUrls.add(this.sessionNode.url);
            }
        };
        NodeWorkersList.prototype.cleanupSession = function () {
            // Clean up the session when wallet closes
            this.sessionNode = null;
            this.sessionStartTime = 0;
            this.sessionErrorCount = 0;
            this.usedNodeUrls.clear(); // Clear used nodes to allow fresh random selection
        };
        NodeWorkersList.prototype.isSessionExpired = function () {
            return (Date.now() - this.sessionStartTime) > this.sessionDuration;
        };
        NodeWorkersList.prototype.pickRandomNode = function () {
            var _this = this;
            var availableNodes = this.nodes.filter(function (node) {
                return !node.hasToManyErrors() && !_this.usedNodeUrls.has(node.url);
            });
            if (availableNodes.length === 0) {
                // If all nodes have been used, reset and try again
                this.usedNodeUrls.clear();
                availableNodes = this.nodes.filter(function (node) { return !node.hasToManyErrors(); });
                if (availableNodes.length === 0) {
                    // Last resort: try any node, even if it has errors
                    availableNodes = this.nodes;
                    if (availableNodes.length === 0) {
                        console.error("pickRandomNode: No nodes at all!");
                        return null; // No nodes at all
                    }
                    // Filter out nodes with excessive errors even in last resort
                    var lastResortNodes = availableNodes.filter(function (node) { return node.allErrors < node.maxAllErrors; });
                    if (lastResortNodes.length > 0) {
                        availableNodes = lastResortNodes;
                    }
                }
            }
            // Shuffle the available nodes for better randomization
            var shuffledNodes = __spreadArray([], availableNodes, true).sort(function () { return Math.random() - 0.5; });
            var selectedNode = shuffledNodes[0];
            if (selectedNode) {
                this.usedNodeUrls.add(selectedNode.url);
            }
            else {
                console.error("pickRandomNode: No node selected from ".concat(availableNodes.length, " available nodes"));
            }
            return selectedNode;
        };
        NodeWorkersList.prototype.getSessionNode = function () {
            if (!this.sessionNode || this.isSessionExpired() || this.sessionErrorCount >= this.maxSessionErrors) {
                // Need to pick a new node
                this.sessionNode = this.pickRandomNode();
                this.sessionStartTime = Date.now();
                this.sessionErrorCount = 0;
                if (this.sessionNode) {
                    console.log("New session node selected: ".concat(this.sessionNode.url));
                }
                else {
                    console.log('No available nodes found');
                }
            }
            return this.sessionNode;
        };
        // Get the current session node's fee address
        NodeWorkersList.prototype.getSessionNodeFeeAddress = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                // Use the session failover system instead of direct node calls
                _this.executeWithSessionFailover(function (sessionNode) { return __awaiter(_this, void 0, void 0, function () {
                    var response, error_2, info, fallbackError_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 7]);
                                return [4 /*yield*/, sessionNode.makeRequest('GET', 'feeaddress')];
                            case 1:
                                response = _a.sent();
                                if (response.status !== 'OK') {
                                    throw new Error('Invalid fee address response');
                                }
                                return [2 /*return*/, response.fee_address || ''];
                            case 2:
                                error_2 = _a.sent();
                                console.warn("Fee address endpoint failed for node ".concat(sessionNode.url, ":"), error_2);
                                _a.label = 3;
                            case 3:
                                _a.trys.push([3, 5, , 6]);
                                return [4 /*yield*/, sessionNode.makeRequest('GET', 'getinfo')];
                            case 4:
                                info = _a.sent();
                                return [2 /*return*/, info.fee_address || ''];
                            case 5:
                                fallbackError_1 = _a.sent();
                                console.warn("Getinfo fallback also failed for node ".concat(sessionNode.url, ":"), fallbackError_1);
                                // If both fail, return empty string (will use donation address)
                                return [2 /*return*/, ''];
                            case 6: return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); }).then(resolve).catch(reject);
            });
        };
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
                return Storage_1.Storage.getItem('customNodeUrl', null).then(function (customNodeUrl) {
                    // Clean up current session before changing nodes
                    _this.nodeWorkers.cleanupSession();
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
                    // Ensure we have nodes to work with
                    if (!config || !config.nodeList || config.nodeList.length === 0) {
                        throw new Error('No nodes available in configuration');
                    }
                    if (customNodeUrl) {
                        _this.nodeWorkers.start([customNodeUrl]);
                    }
                    else {
                        // Shuffle the node list for random selection
                        shuffle(config.nodeList);
                        _this.nodeWorkers.start(config.nodeList);
                    }
                    // Note: initializeSession() is already called in NodeWorkersList.start()     
                    // Verify that nodes are actually available before proceeding
                    if (_this.nodeWorkers.getNodes().length === 0) {
                        throw new Error('Failed to initialize nodes');
                    }
                }).catch(function (err) {
                    console.error("resetNodes failed", err);
                    throw err;
                });
            };
            this.isInitialized = function () {
                return _this.initialized;
            };
            this.initialize = function () { return __awaiter(_this, void 0, void 0, function () {
                var doesMatch, response, i, finalUrl, error_3, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            doesMatch = function (toCheck) {
                                return function (element) {
                                    return element.toLowerCase() === toCheck.toLowerCase();
                                };
                            };
                            if (this.initialized) {
                                return [2 /*return*/, true];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            if (!config.publicNodes) return [3 /*break*/, 5];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, $.ajax({
                                    method: 'GET',
                                    timeout: 10 * 1000,
                                    url: config.publicNodes + '/list?hasSSL=true'
                                })];
                        case 3:
                            response = _a.sent();
                            if (response.success && (response.list.length > 0)) {
                                for (i = 0; i < response.list.length; ++i) {
                                    finalUrl = "https://" + response.list[i].url.host + "/";
                                    if (config.nodeList.findIndex(doesMatch(finalUrl)) == -1) {
                                        config.nodeList.push(finalUrl);
                                    }
                                }
                            }
                            return [3 /*break*/, 5];
                        case 4:
                            error_3 = _a.sent();
                            console.warn('Failed to fetch public nodes, using config nodes only:', error_3);
                            return [3 /*break*/, 5];
                        case 5:
                            this.initialized = true;
                            // Wait for resetNodes to complete before returning
                            return [4 /*yield*/, this.resetNodes()];
                        case 6:
                            // Wait for resetNodes to complete before returning
                            _a.sent();
                            // Double-check that nodes are ready
                            if (this.nodeWorkers.getNodes().length === 0) {
                                throw new Error('Node initialization failed - no nodes available');
                            }
                            console.log("Initialized with ".concat(this.nodeWorkers.getNodes().length, " nodes"));
                            return [2 /*return*/, true];
                        case 7:
                            error_4 = _a.sent();
                            console.error('Node initialization failed:', error_4);
                            throw error_4;
                        case 8: return [2 /*return*/];
                    }
                });
            }); };
            this.start = function (wallet) {
                var watchdog = new WalletWatchdog_1.WalletWatchdog(wallet, _this);
                watchdog.start();
                return watchdog;
            };
            console.log('BlockchainExplorerRpcDaemon');
            this.nodeWorkers = new NodeWorkersList();
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
                // if (response.outs.length > 0) {
                //   logDebugMsg(response.outs);
                // }
                return response.outs;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.sendRawTx = function (rawTx) {
            return this.nodeWorkers.makeRequest('POST', 'sendrawtransaction', {
                tx_as_hex: rawTx,
                do_not_relay: false
            }).then(function (transactions) {
                if (!transactions.status || transactions.status !== 'OK') {
                    // Create a meaningful error message from the status
                    var errorMessage = 'Failed to send raw transaction';
                    if (transactions.status) {
                        errorMessage += ": ".concat(transactions.status);
                    }
                    // Create and throw a proper Error object
                    var error = new Error(errorMessage);
                    // Attach the original response for debugging if needed
                    error.originalResponse = transactions;
                    throw error;
                }
                return transactions;
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
        // Session management methods
        BlockchainExplorerRpcDaemon.prototype.initializeSession = function () {
            // Initialize the node session when wallet opens
            this.nodeWorkers.initializeSession();
        };
        BlockchainExplorerRpcDaemon.prototype.cleanupSession = function () {
            // Clean up the node session when wallet closes
            this.nodeWorkers.cleanupSession();
        };
        // Get the current session node's fee address
        BlockchainExplorerRpcDaemon.prototype.getSessionNodeFeeAddress = function () {
            return this.nodeWorkers.getSessionNodeFeeAddress();
        };
        return BlockchainExplorerRpcDaemon;
    }());
    exports.BlockchainExplorerRpcDaemon = BlockchainExplorerRpcDaemon;
});
