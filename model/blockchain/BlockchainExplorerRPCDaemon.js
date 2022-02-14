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
define(["require", "exports", "../MathUtil", "../Cn", "../WalletWatchdog"], function (require, exports, MathUtil_1, Cn_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BlockchainExplorerRpcDaemon = void 0;
    var BlockchainExplorerRpcDaemon = /** @class */ (function () {
        function BlockchainExplorerRpcDaemon(daemonAddress) {
            if (daemonAddress === void 0) { daemonAddress = null; }
            //daemonAddress = config.nodeList[Math.floor(Math.random() * Math.floor(config.nodeList.length))];
            this.daemonAddress = config.nodeUrl;
            this.phpProxy = false;
            this.cacheInfo = null;
            this.cacheHeight = 0;
            this.lastTimeRetrieveInfo = 0;
            this.scannedHeight = 0;
            this.existingOuts = [];
            if (daemonAddress !== null && daemonAddress.trim() !== '') {
                this.daemonAddress = daemonAddress;
            }
        }
        BlockchainExplorerRpcDaemon.prototype.makeRpcRequest = function (method, params) {
            if (params === void 0) { params = {}; }
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: config.nodeUrl + 'json_rpc',
                    method: 'POST',
                    data: JSON.stringify({
                        jsonrpc: '2.0',
                        method: method,
                        params: params,
                        id: 0
                    }),
                    contentType: 'application/json'
                }).done(function (raw) {
                    if (typeof raw.id === 'undefined' ||
                        typeof raw.jsonrpc === 'undefined' ||
                        raw.jsonrpc !== '2.0' ||
                        typeof raw.result !== 'object')
                        reject('Daemon response is not properly formatted');
                    else
                        resolve(raw.result);
                }).fail(function (data) {
                    reject(data);
                });
            });
        };
        BlockchainExplorerRpcDaemon.prototype.makeRequest = function (method, url, body) {
            if (body === void 0) { body = undefined; }
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: config.nodeUrl + url,
                    method: method,
                    data: typeof body === 'string' ? body : JSON.stringify(body)
                }).done(function (raw) {
                    resolve(raw);
                }).fail(function (data) {
                    reject(data);
                });
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getInfo = function () {
            var _this = this;
            if (Date.now() - this.lastTimeRetrieveInfo < 20 * 1000 && this.cacheInfo !== null) {
                return Promise.resolve(this.cacheInfo);
            }
            this.lastTimeRetrieveInfo = Date.now();
            return this.makeRequest('GET', 'getinfo').then(function (data) {
                _this.cacheInfo = data;
                console.log("GetInfo: ");
                return data;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getHeight = function () {
            var _this = this;
            if (Date.now() - this.lastTimeRetrieveInfo < 20 * 1000 && this.cacheHeight !== 0) {
                return Promise.resolve(this.cacheHeight);
            }
            this.lastTimeRetrieveInfo = Date.now();
            return this.makeRequest('GET', 'getheight').then(function (data) {
                var height = parseInt(data.height);
                _this.cacheHeight = height;
                return height;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getScannedHeight = function () {
            return this.scannedHeight;
        };
        BlockchainExplorerRpcDaemon.prototype.watchdog = function (wallet) {
            var watchdog = new WalletWatchdog_1.WalletWatchdog(wallet, this);
            watchdog.loadHistory();
            return watchdog;
        };
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
            return this.makeRequest('POST', 'get_raw_transactions_by_heights', {
                heights: [tempStartBlock, endBlock],
                include_miner_txs: includeMinerTxs,
                range: true
            }).then(function (response) {
                var formatted = [];
                if (response.status !== 'OK')
                    throw 'invalid_transaction_answer';
                if (response.transactions.length > 0) {
                    for (var _i = 0, _a = response.transactions; _i < _a.length; _i++) {
                        var rawTx = _a[_i];
                        var tx = null;
                        try {
                            tx = rawTx.transaction;
                        }
                        catch (e) {
                            try {
                                //compat for some invalid endpoints
                                tx = rawTx.transaction;
                            }
                            catch (e) {
                            }
                        }
                        if (tx !== null) {
                            tx.ts = rawTx.timestamp;
                            tx.height = rawTx.height;
                            tx.hash = rawTx.hash;
                            if (rawTx.output_indexes.length > 0)
                                tx.global_index_start = rawTx.output_indexes[0];
                            tx.output_indexes = rawTx.output_indexes;
                            formatted.push(tx);
                        }
                    }
                    return formatted;
                }
                else {
                    return response.status;
                }
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getTransactionPool = function () {
            return this.makeRequest('GET', 'getrawtransactionspool').then(function (response) {
                var formatted = [];
                for (var _i = 0, _a = response.transactions; _i < _a.length; _i++) {
                    var rawTx = _a[_i];
                    var tx = null;
                    try {
                        tx = rawTx.transaction;
                    }
                    catch (e) {
                        try {
                            //compat for some invalid endpoints
                            tx = rawTx.transaction;
                        }
                        catch (e) {
                        }
                    }
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
                return formatted;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getRandomOuts = function (nbOutsNeeded, initialCall) {
            if (initialCall === void 0) { initialCall = true; }
            var self = this;
            if (initialCall) {
                self.existingOuts = [];
            }
            return this.getHeight().then(function (height) {
                var txs = [];
                var promiseGetCompressedBlocks = Promise.resolve();
                var randomBlocksIndexesToGet = [];
                var numOuts = height;
                var compressedBlocksToGet = {};
                console.log('Requires ' + nbOutsNeeded + ' outs');
                //select blocks for the final mixin. selection is made with a triangular selection
                for (var i = 0; i < nbOutsNeeded; ++i) {
                    var selectedIndex = -1;
                    do {
                        selectedIndex = MathUtil_1.MathUtil.randomTriangularSimplified(numOuts);
                        if (selectedIndex >= height - config.txCoinbaseMinConfirms)
                            selectedIndex = -1;
                    } while (selectedIndex === -1 || randomBlocksIndexesToGet.indexOf(selectedIndex) !== -1);
                    randomBlocksIndexesToGet.push(selectedIndex);
                    compressedBlocksToGet[Math.floor(selectedIndex / 100) * 100] = true;
                }
                console.log('Random blocks required: ', randomBlocksIndexesToGet);
                console.log('Blocks to get for outputs selections:', compressedBlocksToGet);
                var _loop_1 = function (compressedBlock) {
                    promiseGetCompressedBlocks = promiseGetCompressedBlocks.then(function () {
                        return self.getTransactionsForBlocks(parseInt(compressedBlock), Math.min(parseInt(compressedBlock) + 99, height - config.txCoinbaseMinConfirms), false).then(function (rawTransactions) {
                            txs.push.apply(txs, rawTransactions);
                        });
                    });
                };
                //load compressed blocks (100 blocks) containing the blocks referred by their index
                for (var compressedBlock in compressedBlocksToGet) {
                    _loop_1(compressedBlock);
                }
                return promiseGetCompressedBlocks.then(function () {
                    console.log('txs selected for outputs: ', txs);
                    var txCandidates = {};
                    for (var iOut = 0; iOut < txs.length; ++iOut) {
                        var tx = txs[iOut];
                        if ((typeof tx.height !== 'undefined' && randomBlocksIndexesToGet.indexOf(tx.height) === -1) ||
                            typeof tx.height === 'undefined') {
                            continue;
                        }
                        for (var output_idx_in_tx = 0; output_idx_in_tx < tx.vout.length; ++output_idx_in_tx) {
                            var rct = null;
                            var globalIndex = output_idx_in_tx;
                            if (typeof tx.global_index_start !== 'undefined' && typeof tx.output_indexes !== 'undefined') {
                                globalIndex = tx.output_indexes[output_idx_in_tx];
                            }
                            if (tx.vout[output_idx_in_tx].amount !== 0) { //check if miner tx
                                rct = Cn_1.CnTransactions.zeroCommit(Cn_1.CnUtils.d2s(tx.vout[output_idx_in_tx].amount));
                            }
                            else {
                                var rtcOutPk = tx.rct_signatures.outPk[output_idx_in_tx];
                                var rtcMask = tx.rct_signatures.ecdhInfo[output_idx_in_tx].mask;
                                var rtcAmount = tx.rct_signatures.ecdhInfo[output_idx_in_tx].amount;
                                rct = rtcOutPk + rtcMask + rtcAmount;
                            }
                            var newOut = {
                                rct: rct,
                                public_key: tx.vout[output_idx_in_tx].target.data.key,
                                global_index: globalIndex,
                            };
                            if (typeof txCandidates[tx.height] === 'undefined')
                                txCandidates[tx.height] = [];
                            txCandidates[tx.height].push(newOut);
                        }
                    }
                    console.log(txCandidates);
                    var selectedOuts = [];
                    for (var txsOutsHeight in txCandidates) {
                        var outIndexSelect = MathUtil_1.MathUtil.getRandomInt(0, txCandidates[txsOutsHeight].length - 1);
                        console.log('select ' + outIndexSelect + ' for ' + txsOutsHeight + ' with length of ' + txCandidates[txsOutsHeight].length);
                        selectedOuts.push(txCandidates[txsOutsHeight][outIndexSelect]);
                    }
                    console.log(selectedOuts);
                    return selectedOuts;
                });
            });
        };
        BlockchainExplorerRpcDaemon.prototype.sendRawTx = function (rawTx) {
            return this.makeRequest('POST', 'sendrawtransaction', {
                tx_as_hex: rawTx,
                do_not_relay: false
            }).then(function (transactions) {
                if (!transactions.status || transactions.status !== 'OK')
                    throw transactions;
            });
        };
        BlockchainExplorerRpcDaemon.prototype.resolveOpenAlias = function (domain) {
            return this.makeRpcRequest('resolve_open_alias', { url: domain }).then(function (response) {
                if (response.addresses && response.addresses.length > 0)
                    return { address: response.addresses[0], name: null };
                throw 'not_found';
            });
        };
        BlockchainExplorerRpcDaemon.prototype.getNetworkInfo = function () {
            return this.makeRpcRequest('getlastblockheader').then(function (raw) {
                //console.log(raw);
                return {
                    'node': config.nodeUrl,
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
