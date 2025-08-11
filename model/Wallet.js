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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
define(["require", "exports", "./Transaction", "./TransactionsExplorer", "./KeysRepository", "../lib/numbersLab/Observable", "./Cn", "./MathUtil", "./Currency"], function (require, exports, Transaction_1, TransactionsExplorer_1, KeysRepository_1, Observable_1, Cn_1, MathUtil_1, Currency_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Wallet = exports.WalletOptions = void 0;
    var WalletOptions = /** @class */ (function () {
        function WalletOptions() {
            this.checkMinerTx = false;
            this.readSpeed = 10;
            this.customNode = false;
            this.nodeUrl = 'https://node.conceal.network:16000/';
        }
        WalletOptions.fromRaw = function (raw) {
            var options = new WalletOptions();
            if (typeof raw.checkMinerTx !== 'undefined')
                options.checkMinerTx = raw.checkMinerTx;
            if (typeof raw.readSpeed !== 'undefined')
                options.readSpeed = raw.readSpeed;
            if (typeof raw.customNode !== 'undefined')
                options.customNode = raw.customNode;
            if (typeof raw.nodeUrl !== 'undefined')
                options.nodeUrl = raw.nodeUrl;
            return options;
        };
        WalletOptions.prototype.exportToJson = function () {
            var data = {
                readSpeed: this.readSpeed,
                checkMinerTx: this.checkMinerTx,
                customNode: this.customNode,
                nodeUrl: this.nodeUrl
            };
            return data;
        };
        return WalletOptions;
    }());
    exports.WalletOptions = WalletOptions;
    var Wallet = /** @class */ (function (_super) {
        __extends(Wallet, _super);
        function Wallet() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._lastHeight = 0;
            _this.transactions = [];
            _this.withdrawals = [];
            _this.deposits = [];
            _this.keyLookupMap = new Map();
            _this.txLookupMap = new Map();
            _this.txsMem = [];
            _this.modified = true;
            _this.modifiedTS = new Date();
            _this.creationHeight = 0;
            _this.txPrivateKeys = {};
            _this.coinAddressPrefix = config.addressPrefix;
            _this._options = new WalletOptions();
            _this.signalChanged = function () {
                _this.modifiedTS = new Date();
                _this.modified = true;
            };
            _this.exportToRaw = function () {
                var deposits = [];
                var withdrawals = [];
                var transactions = [];
                for (var _i = 0, _a = _this.deposits; _i < _a.length; _i++) {
                    var deposit = _a[_i];
                    deposits.push(deposit.export());
                }
                for (var _b = 0, _c = _this.withdrawals; _b < _c.length; _b++) {
                    var withdrawal = _c[_b];
                    withdrawals.push(withdrawal.export());
                }
                for (var _d = 0, _e = _this.transactions; _d < _e.length; _d++) {
                    var transaction = _e[_d];
                    transactions.push(transaction.export());
                }
                var data = {
                    deposits: deposits,
                    withdrawals: withdrawals,
                    transactions: transactions,
                    txPrivateKeys: _this.txPrivateKeys,
                    lastHeight: _this._lastHeight,
                    nonce: '',
                    options: _this._options,
                    coinAddressPrefix: _this.coinAddressPrefix
                };
                data.keys = _this.keys;
                if (_this.creationHeight !== 0) {
                    data.creationHeight = _this.creationHeight;
                }
                return data;
            };
            _this.isViewOnly = function () {
                return _this.keys.priv.spend === '';
            };
            _this.getAll = function (forceReload) {
                if (forceReload === void 0) { forceReload = false; }
                return _this.transactions.slice();
            };
            _this.getAllOuts = function () {
                var alls = _this.getAll();
                var outs = [];
                for (var _i = 0, alls_1 = alls; _i < alls_1.length; _i++) {
                    var tr = alls_1[_i];
                    outs.push.apply(outs, tr.outs);
                }
                return outs;
            };
            _this.addNew = function (transaction, replace) {
                if (replace === void 0) { replace = true; }
                if (transaction) {
                    var exist = _this.findWithTxPubKey(transaction.txPubKey);
                    if (!exist || replace) {
                        if (!exist) {
                            _this.keyLookupMap.set(transaction.txPubKey, transaction);
                            _this.txLookupMap.set(transaction.hash, transaction);
                            _this.transactions.push(transaction);
                        }
                        else {
                            for (var tr = 0; tr < _this.transactions.length; ++tr) {
                                if (_this.transactions[tr].txPubKey === transaction.txPubKey) {
                                    // Preserve fusion flag when replacing
                                    transaction.fusion = _this.transactions[tr].fusion;
                                    // Preserve messageViewed flag when replacing
                                    transaction.messageViewed = _this.transactions[tr].messageViewed || transaction.messageViewed;
                                    _this.keyLookupMap.set(transaction.txPubKey, transaction);
                                    _this.txLookupMap.set(transaction.hash, transaction);
                                    _this.transactions[tr] = transaction;
                                }
                            }
                        }
                        // remove from unconfirmed and preserve fusion flag and messageViewed flag
                        var existMem = _this.findMemWithTxPubKey(transaction.txPubKey);
                        if (existMem) {
                            // Preserve fusion flag from mempool
                            transaction.fusion = existMem.fusion;
                            // Preserve messageViewed flag from mempool
                            transaction.messageViewed = existMem.messageViewed || transaction.messageViewed;
                            var trIndex = _this.txsMem.indexOf(existMem);
                            if (trIndex != -1) {
                                _this.txsMem.splice(trIndex, 1);
                            }
                        }
                        // finalize the add tx function
                        _this.recalculateKeyImages();
                        _this.signalChanged();
                        _this.notify();
                    }
                }
            };
            /**
             * Update a flag on an existing transaction by txPubKey or hash.
             * Only updates the specified fields, does not replace the transaction object.
             */
            _this.updateTransactionFlags = function (txPubKeyOrHash, flags) {
                var tx = _this.findWithTxPubKey(txPubKeyOrHash) || _this.findWithTxHash(txPubKeyOrHash);
                if (tx) {
                    if (typeof flags.fusion !== 'undefined')
                        tx.fusion = flags.fusion;
                    if (typeof flags.messageViewed !== 'undefined')
                        tx.messageViewed = flags.messageViewed;
                    _this.signalChanged();
                    _this.notify();
                    return true;
                }
                return false;
            };
            _this.addDeposits = function (deposits) {
                for (var i = 0; i < deposits.length; ++i) {
                    _this.addDeposit(deposits[i]);
                }
            };
            _this.addDeposit = function (deposit) {
                var foundMatch = false;
                for (var i = 0; i < _this.deposits.length; ++i) {
                    if (_this.deposits[i].txHash == deposit.txHash) { // only check txHash
                        _this.deposits[i] = deposit;
                        foundMatch = true;
                        break;
                    }
                }
                if (!foundMatch) {
                    _this.deposits.push(deposit);
                }
                _this.signalChanged();
                _this.notify();
            };
            _this.updateDepositFlags = function (txHashOrPubKey, flags) {
                var deposit = _this.deposits.find(function (d) { return d.txHash === txHashOrPubKey || d.txPubKey === txHashOrPubKey; });
                if (deposit) {
                    if (typeof flags.withdrawPending !== 'undefined')
                        deposit.withdrawPending = flags.withdrawPending;
                    _this.signalChanged();
                    _this.notify();
                    return true;
                }
                return false;
            };
            _this.addWithdrawals = function (withdrawals) {
                for (var i = 0; i < withdrawals.length; ++i) {
                    _this.addWithdrawal(withdrawals[i]);
                }
            };
            _this.addWithdrawal = function (withdrawal) {
                var foundMatchDeposit = false;
                var foundMatchWithdrawal = false;
                // 1. First Priority: Match deposits with withdrawPending=true AND matching amount and outputIndex
                for (var i = 0; i < _this.deposits.length; ++i) {
                    if (_this.deposits[i].withdrawPending === true &&
                        _this.deposits[i].amount === withdrawal.amount &&
                        _this.deposits[i].globalOutputIndex === withdrawal.globalOutputIndex) {
                        _this.deposits[i].spentTx = withdrawal.txHash;
                        _this.deposits[i].withdrawPending = false; // Clear the flag
                        foundMatchDeposit = true;
                        break;
                    }
                }
                // 2. Second Priority: Match by amount and outputIndex (fallback)
                if (!foundMatchDeposit) {
                    for (var i = 0; i < _this.deposits.length; ++i) {
                        if (_this.deposits[i].amount === withdrawal.amount &&
                            _this.deposits[i].globalOutputIndex === withdrawal.globalOutputIndex &&
                            !_this.deposits[i].spentTx) {
                            _this.deposits[i].spentTx = withdrawal.txHash;
                            foundMatchDeposit = true;
                            break;
                        }
                    }
                }
                // 3. Update withdrawals array - first try to find by txHash (most reliable)
                for (var i = 0; i < _this.withdrawals.length; ++i) {
                    if (_this.withdrawals[i].txHash === withdrawal.txHash) {
                        _this.withdrawals[i] = withdrawal;
                        foundMatchWithdrawal = true;
                        break;
                    }
                }
                // 4. Update withdrawals array - fallback to amount & outputIndex if needed
                if (!foundMatchWithdrawal) {
                    for (var i = 0; i < _this.withdrawals.length; ++i) {
                        if (_this.withdrawals[i].amount === withdrawal.amount &&
                            _this.withdrawals[i].globalOutputIndex === withdrawal.globalOutputIndex) {
                            _this.withdrawals[i] = withdrawal;
                            foundMatchWithdrawal = true;
                            break;
                        }
                    }
                }
                // Add as new withdrawal if no match found
                if (!foundMatchWithdrawal) {
                    _this.withdrawals.push(withdrawal);
                }
                _this.signalChanged();
                _this.notify();
            };
            _this.addNewMemTx = function (transaction, replace) {
                if (replace === void 0) { replace = true; }
                var modified = false;
                var foundTx = false;
                for (var i = 0; i < _this.txsMem.length; ++i) {
                    if (_this.txsMem[i].hash === transaction.hash) {
                        if (replace) {
                            _this.txsMem[i] = transaction;
                            modified = true;
                        }
                        foundTx = true;
                    }
                }
                if (!foundTx) {
                    _this.txsMem.push(transaction);
                    modified = true;
                }
                if (modified) {
                    _this.signalChanged();
                }
            };
            _this.clearMemTx = function () {
                _this.txsMem = [];
            };
            _this.findWithTxPubKey = function (pubKey) {
                var transaction = _this.keyLookupMap.get(pubKey);
                if (transaction !== undefined) {
                    return transaction;
                }
                else {
                    return null;
                }
            };
            _this.findWithTxHash = function (hash) {
                var transaction = _this.txLookupMap.get(hash);
                if (transaction !== undefined) {
                    return transaction;
                }
                else {
                    return null;
                }
            };
            _this.findMemWithTxPubKey = function (pubKey) {
                for (var _i = 0, _a = _this.txsMem; _i < _a.length; _i++) {
                    var tr = _a[_i];
                    if (tr.txPubKey === pubKey)
                        return tr;
                }
                return null;
            };
            _this.findTxPrivateKeyWithHash = function (hash) {
                if (typeof _this.txPrivateKeys[hash] !== 'undefined')
                    return _this.txPrivateKeys[hash];
                return null;
            };
            _this.addTxPrivateKeyWithTxHash = function (txHash, txPrivKey) {
                _this.txPrivateKeys[txHash] = txPrivKey;
                _this.signalChanged();
            };
            _this.addTxPrivateKeyWithTxHashAndFusion = function (txHash, txPrivKey, fusion) {
                _this.txPrivateKeys[txHash] = txPrivKey;
                var tx = _this.transactions.find(function (tx) { return tx.hash === txHash; });
                if (tx)
                    tx.fusion = fusion;
                _this.signalChanged();
            };
            _this.getTransactionKeyImages = function () {
                return _this.keyImages;
            };
            _this.getTransactionOutIndexes = function () {
                return _this.txOutIndexes;
            };
            _this.getOutWithGlobalIndex = function (index) {
                for (var _i = 0, _a = _this.transactions; _i < _a.length; _i++) {
                    var tx = _a[_i];
                    for (var _b = 0, _c = tx.outs; _b < _c.length; _b++) {
                        var out = _c[_b];
                        if (out.globalIndex === index)
                            return out;
                    }
                }
                return null;
            };
            _this.keyImages = [];
            _this.txOutIndexes = [];
            _this.getTransactionsCopy = function () {
                var news = [];
                for (var _i = 0, _a = _this.transactions; _i < _a.length; _i++) {
                    var transaction = _a[_i];
                    news.push(Transaction_1.Transaction.fromRaw(transaction.export()));
                }
                news.sort(function (a, b) {
                    return a.timestamp - b.timestamp;
                });
                return news;
            };
            _this.getDepositsCopy = function () {
                var news = _this.deposits.slice();
                news.sort(function (a, b) {
                    return a.timestamp - b.timestamp;
                });
                return news;
            };
            _this.getWithdrawalsCopy = function () {
                var news = _this.withdrawals.slice();
                news.sort(function (a, b) {
                    return a.timestamp - b.timestamp;
                });
                return news;
            };
            _this.availableAmount = function (currentBlockHeight) {
                if (currentBlockHeight === void 0) { currentBlockHeight = -1; }
                var amount = 0;
                for (var _i = 0, _a = _this.transactions; _i < _a.length; _i++) {
                    var transaction = _a[_i];
                    if (!transaction.isFullyChecked())
                        continue;
                    if (transaction.isConfirmed(currentBlockHeight) || currentBlockHeight === -1) {
                        for (var _b = 0, _c = transaction.outs; _b < _c.length; _b++) {
                            var nout = _c[_b];
                            if (nout.type !== "03") {
                                amount += nout.amount;
                            }
                        }
                    }
                    for (var _d = 0, _e = transaction.ins; _d < _e.length; _d++) {
                        var nin = _e[_d];
                        if (nin.type !== "03") {
                            amount -= nin.amount;
                        }
                    }
                }
                for (var _f = 0, _g = _this.txsMem; _f < _g.length; _f++) {
                    var transaction = _g[_f];
                    if (transaction.isConfirmed(currentBlockHeight) || currentBlockHeight === -1) {
                        for (var _h = 0, _j = transaction.outs; _h < _j.length; _h++) {
                            var nout = _j[_h];
                            if (nout.type !== "03") {
                                amount += nout.amount;
                            }
                        }
                    }
                    for (var _k = 0, _l = transaction.ins; _k < _l.length; _k++) {
                        var nin = _l[_k];
                        if (nin.type !== "03") {
                            amount -= nin.amount;
                        }
                    }
                }
                return amount;
            };
            _this.lockedDeposits = function (currHeight) {
                var amount = 0;
                for (var _i = 0, _a = _this.deposits; _i < _a.length; _i++) {
                    var deposit = _a[_i];
                    //if (!deposit.tx?.isFullyChecked()) {
                    //  continue;
                    //}
                    if ((deposit.blockHeight + deposit.term) > currHeight) {
                        amount += deposit.amount;
                    }
                }
                return amount;
            };
            _this.unlockedDeposits = function (currHeight) {
                var amount = 0;
                for (var _i = 0, _a = _this.deposits; _i < _a.length; _i++) {
                    var deposit = _a[_i];
                    //if (!deposit.tx?.isFullyChecked()) {
                    //	continue;
                    //}
                    if (deposit.blockHeight + (deposit.term) <= currHeight) {
                        if (!deposit.spentTx) {
                            amount += deposit.amount;
                        }
                    }
                }
                return amount;
            };
            // Calculate total future interest (from both locked and unlocked deposits)
            _this.futureDepositInterest = function (currHeight) {
                var futureLockedInterest = 0;
                var futureUnlockedInterest = 0;
                var spentInterest = 0;
                for (var _i = 0, _a = _this.deposits; _i < _a.length; _i++) {
                    var deposit = _a[_i];
                    var status_1 = deposit.getStatus(currHeight);
                    switch (status_1) {
                        case 'Locked':
                            futureLockedInterest += deposit.interest;
                            break;
                        case 'Unlocked':
                            futureUnlockedInterest += deposit.interest;
                            break;
                        case 'Spent':
                            spentInterest += deposit.interest;
                            break;
                    }
                }
                return {
                    spent: spentInterest,
                    locked: futureLockedInterest,
                    unlocked: futureUnlockedInterest,
                    total: futureLockedInterest + futureUnlockedInterest
                };
            };
            // Returns the deposit with the earliest unlock date (not spent)
            _this.earliestUnlockableDeposit = function (currHeight) {
                var earliest = null;
                for (var _i = 0, _a = _this.deposits; _i < _a.length; _i++) {
                    var deposit = _a[_i];
                    if (deposit.isSpent())
                        continue;
                    if (!earliest || deposit.unlockHeight < earliest.unlockHeight) {
                        earliest = deposit;
                    }
                }
                return earliest;
            };
            _this.hasBeenModified = function () {
                return _this.modified;
            };
            _this.modifiedTimestamp = function () {
                return _this.modifiedTS;
            };
            _this.getPublicAddress = function () {
                return Cn_1.Cn.pubkeys_to_string(_this.keys.pub.spend, _this.keys.pub.view);
            };
            _this.recalculateIfNotViewOnly = function () {
                if (!_this.isViewOnly()) {
                    for (var _i = 0, _a = _this.transactions; _i < _a.length; _i++) {
                        var tx = _a[_i];
                        var needDerivation = false;
                        for (var _b = 0, _c = tx.outs; _b < _c.length; _b++) {
                            var out = _c[_b];
                            if (out.keyImage === '') {
                                needDerivation = true;
                                break;
                            }
                        }
                        if (needDerivation) {
                            var derivation = '';
                            try {
                                derivation = Cn_1.CnNativeBride.generate_key_derivation(tx.txPubKey, _this.keys.priv.view);
                            }
                            catch (e) {
                                continue;
                            }
                            for (var _d = 0, _e = tx.outs; _d < _e.length; _d++) {
                                var out = _e[_d];
                                if (out.keyImage === '') {
                                    var m_key_image = Cn_1.CnTransactions.generate_key_image_helper({
                                        view_secret_key: _this.keys.priv.view,
                                        spend_secret_key: _this.keys.priv.spend,
                                        public_spend_key: _this.keys.pub.spend,
                                    }, tx.txPubKey, out.outputIdx, derivation);
                                    out.keyImage = m_key_image.key_image;
                                    out.ephemeralPub = m_key_image.ephemeral_pub;
                                    _this.signalChanged();
                                }
                            }
                        }
                    }
                    if (_this.modified) {
                        _this.recalculateKeyImages();
                    }
                    for (var iTx = 0; iTx < _this.transactions.length; ++iTx) {
                        for (var iIn = 0; iIn < _this.transactions[iTx].ins.length; ++iIn) {
                            var vin = _this.transactions[iTx].ins[iIn];
                            if (vin.amount < 0) {
                                if (_this.keyImages.indexOf(vin.keyImage) != -1) {
                                    //logDebugMsg('found in', vin);
                                    var walletOuts = _this.getAllOuts();
                                    for (var _f = 0, walletOuts_1 = walletOuts; _f < walletOuts_1.length; _f++) {
                                        var ut = walletOuts_1[_f];
                                        if (ut.keyImage == vin.keyImage) {
                                            _this.transactions[iTx].ins[iIn].amount = ut.amount;
                                            _this.transactions[iTx].ins[iIn].keyImage = ut.keyImage;
                                            _this.signalChanged();
                                            break;
                                        }
                                    }
                                }
                                else {
                                    _this.transactions[iTx].ins.splice(iIn, 1);
                                    --iIn;
                                }
                            }
                        }
                        if (_this.transactions[iTx].outs.length === 0 && _this.transactions[iTx].ins.length === 0) {
                            _this.transactions.splice(iTx, 1);
                            --iTx;
                        }
                    }
                }
            };
            /**
             * Estimates the fusion readiness of the wallet.
             * @param threshold The threshold amount for fusion.
             * @param blockchainHeight The current blockchain height.
             * @returns { unspentOutsCount: number, fusionReadyCount: number }
             */
            _this.estimateFusionReadyness = function (threshold, blockchainHeight) {
                // Number of buckets: 20 (uint64_t has 19 digits + 1)
                var NUM_BUCKETS = 20;
                var bucketSizes = new Array(NUM_BUCKETS).fill(0);
                // Use unspent outputs only
                var unspentOuts = TransactionsExplorer_1.TransactionsExplorer.formatWalletOutsForTx(_this, blockchainHeight);
                var unspentOutsCount = unspentOuts.length;
                for (var _i = 0, unspentOuts_1 = unspentOuts; _i < unspentOuts_1.length; _i++) {
                    var out = unspentOuts_1[_i];
                    var result = Currency_1.Currency.isAmountApplicableInFusionTransactionInput(out.amount, threshold, blockchainHeight);
                    if (result.applicable && typeof result.amountPowerOfTen === 'number') {
                        if (result.amountPowerOfTen < NUM_BUCKETS) {
                            bucketSizes[result.amountPowerOfTen]++;
                        }
                    }
                }
                var fusionReadyCount = 0;
                for (var _a = 0, bucketSizes_1 = bucketSizes; _a < bucketSizes_1.length; _a++) {
                    var bucketSize = bucketSizes_1[_a];
                    if (bucketSize >= config.optimizeOutputs) {
                        fusionReadyCount += bucketSize;
                    }
                }
                return {
                    unspentOutsCount: unspentOutsCount,
                    fusionReadyCount: fusionReadyCount,
                };
            };
            _this.pickRandomFusionInputs = function (threshold, blockchainHeight, minInputCount, maxInputCount) {
                if (minInputCount === void 0) { minInputCount = Currency_1.Currency.fusionTxMinInputCount; }
                var NUM_BUCKETS = 20;
                var bucketSizes = new Array(NUM_BUCKETS).fill(0);
                // Use unspent outputs only
                var unspentOuts = TransactionsExplorer_1.TransactionsExplorer.formatWalletOutsForTx(_this, blockchainHeight);
                var allFusionReadyOuts = [];
                // First pass: collect all fusion-ready outputs and count bucket sizes
                for (var _i = 0, unspentOuts_2 = unspentOuts; _i < unspentOuts_2.length; _i++) {
                    var out = unspentOuts_2[_i];
                    var result = Currency_1.Currency.isAmountApplicableInFusionTransactionInput(out.amount, threshold, blockchainHeight);
                    if (result.applicable) {
                        allFusionReadyOuts.push(out);
                        var powerOfTen = result.amountPowerOfTen || 0;
                        if (powerOfTen < NUM_BUCKETS) {
                            bucketSizes[powerOfTen]++;
                        }
                    }
                }
                // Create and shuffle bucket numbers
                var bucketNumbers = Array.from({ length: NUM_BUCKETS }, function (_, i) { return i; });
                var bucketGenerator = new ShuffleGenerator(NUM_BUCKETS);
                var shuffledBucketNumbers = [];
                for (var i = 0; i < NUM_BUCKETS; i++) {
                    shuffledBucketNumbers.push(bucketNumbers[bucketGenerator.next()]);
                }
                // Find first bucket with enough inputs
                var selectedBucket = shuffledBucketNumbers.find(function (bucket) { return bucketSizes[bucket] >= minInputCount; });
                if (selectedBucket === undefined) {
                    return [];
                }
                // Calculate bounds for selected bucket
                var lowerBound = 1;
                for (var i = 0; i < selectedBucket; ++i) {
                    lowerBound *= 10;
                }
                var upperBound = selectedBucket === NUM_BUCKETS - 1 ? Number.MAX_SAFE_INTEGER : lowerBound * 10;
                // Select outputs within bounds
                var selectedOuts = allFusionReadyOuts.filter(function (out) {
                    return out.amount >= lowerBound && out.amount < upperBound;
                });
                // Ensure we have enough outputs for fusion
                if (selectedOuts.length < minInputCount) {
                    return [];
                }
                // Sort by amount
                selectedOuts.sort(function (a, b) { return a.amount - b.amount; });
                // If we have more outputs than maxInputCount, randomly select maxInputCount outputs
                if (selectedOuts.length > maxInputCount) {
                    var generator = new ShuffleGenerator(selectedOuts.length);
                    var trimmedSelectedOuts = [];
                    for (var i = 0; i < maxInputCount; ++i) {
                        trimmedSelectedOuts.push(selectedOuts[generator.next()]);
                    }
                    trimmedSelectedOuts.sort(function (a, b) { return a.amount - b.amount; });
                    return trimmedSelectedOuts;
                }
                return selectedOuts;
            };
            _this.optimizationNeeded = function (blockchainHeight, threshold) {
                var unspentOuts = TransactionsExplorer_1.TransactionsExplorer.formatWalletOutsForTx(_this, blockchainHeight);
                var unspentOutsCount = unspentOuts.length;
                var isNeeded = false;
                if (unspentOutsCount < config.optimizeOutputs) {
                    return {
                        numOutputs: unspentOutsCount,
                        isNeeded: false
                    };
                }
                ;
                var balance = _this.availableAmount(blockchainHeight);
                //threshold = config.optimizeThreshold;
                var fusionReady = false;
                while (threshold <= balance && !fusionReady) {
                    var estimation = _this.estimateFusionReadyness(threshold, blockchainHeight);
                    if (estimation.fusionReadyCount > (config.optimizeOutputs / 2)) {
                        fusionReady = true;
                        break;
                    }
                    else {
                        threshold = 10 * threshold;
                    }
                }
                if (fusionReady) {
                    isNeeded = true;
                }
                else {
                    logDebugMsg("Nothing to optimize, unspentOutsCount", unspentOutsCount);
                }
                return {
                    numOutputs: unspentOutsCount,
                    isNeeded: isNeeded
                };
            };
            _this.createFusionTransaction = function (blockchainHeight, threshold, blockchainExplorer, obtainMixOutsCallback) {
                return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var MAX_FUSION_OUTPUTS, fusionThreshold, neededFee, destinationAddress, estimateFusionInputsCount, fusionInputs, fusionTransaction_1, transactionSize, round_1, inputAmounts, mixinResult, inputsAmount, dsts, data, error_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 8, , 9]);
                                MAX_FUSION_OUTPUTS = config.maxFusionOutputs;
                                fusionThreshold = config.dustThreshold;
                                neededFee = config.minimumFee_V2;
                                if (threshold <= fusionThreshold) {
                                    throw new Error("Threshold is too low");
                                }
                                destinationAddress = this.getPublicAddress();
                                if (destinationAddress === '') {
                                    throw new Error("Destination address is not set");
                                }
                                estimateFusionInputsCount = Currency_1.Currency.getApproximateMaximumInputCount(Currency_1.Currency.fusionTxMaxSize, MAX_FUSION_OUTPUTS, config.defaultMixin);
                                if (estimateFusionInputsCount < Currency_1.Currency.fusionTxMinInputCount) {
                                    throw new Error("Mixin count is too big");
                                }
                                fusionInputs = this.pickRandomFusionInputs(threshold, blockchainHeight, Currency_1.Currency.fusionTxMinInputCount, estimateFusionInputsCount);
                                if (fusionInputs.length < Currency_1.Currency.fusionTxMinInputCount) {
                                    throw new Error("Nothing to optimize");
                                }
                                fusionTransaction_1 = null;
                                transactionSize = 0;
                                round_1 = 0;
                                _a.label = 1;
                            case 1:
                                if (round_1 !== 0) {
                                    fusionInputs.pop();
                                }
                                inputAmounts = fusionInputs.map(function (input) { return input.amount; });
                                mixinResult = [];
                                if (!(config.defaultMixin !== 0)) return [3 /*break*/, 3];
                                return [4 /*yield*/, obtainMixOutsCallback(inputAmounts, config.defaultMixin + 1)];
                            case 2:
                                mixinResult = _a.sent();
                                _a.label = 3;
                            case 3:
                                inputsAmount = fusionInputs.reduce(function (sum, input) { return sum + input.amount; }, 0);
                                dsts = [{
                                        address: destinationAddress,
                                        amount: (inputsAmount - neededFee)
                                    }];
                                return [4 /*yield*/, TransactionsExplorer_1.TransactionsExplorer.createRawTx(dsts, this, false, fusionInputs, false, mixinResult, config.defaultMixin, neededFee, '', '', 0, 'regular', 0)];
                            case 4:
                                data = _a.sent();
                                transactionSize = Currency_1.Currency.getApproximateTransactionSize(data.signed.vin.length, data.signed.vout.length, config.defaultMixin);
                                fusionTransaction_1 = data;
                                round_1++;
                                _a.label = 5;
                            case 5:
                                if (transactionSize > Currency_1.Currency.fusionTxMaxSize && fusionInputs.length >= Currency_1.Currency.fusionTxMinInputCount) return [3 /*break*/, 1];
                                _a.label = 6;
                            case 6:
                                // Final validation
                                if (fusionInputs.length < Currency_1.Currency.fusionTxMinInputCount) {
                                    throw new Error("Minimum input count not met");
                                }
                                if (!fusionTransaction_1 || fusionTransaction_1.signed.vout.length === 0) {
                                    throw new Error("Transaction has no outputs");
                                }
                                if (fusionTransaction_1.signed.vout.length > MAX_FUSION_OUTPUTS) {
                                    throw new Error("Maximum output count exceeded");
                                }
                                if (fusionTransaction_1.signed.vout.length > MAX_FUSION_OUTPUTS) {
                                    throw new Error("Maximum output count exceeded");
                                }
                                // Send transaction and add to mempool
                                return [4 /*yield*/, blockchainExplorer.sendRawTx(fusionTransaction_1.raw.raw)
                                        .then(function () {
                                        // Save the transaction private key
                                        _this.addTxPrivateKeyWithTxHashAndFusion(fusionTransaction_1.raw.hash, fusionTransaction_1.raw.prvkey, true);
                                        return swal({
                                            type: 'success',
                                            title: i18n.t('global.optimize.success'),
                                            confirmButtonText: i18n.t('global.optimize.confirmText')
                                        });
                                    })
                                        .then(function () {
                                        resolve(round_1);
                                    })
                                        .catch(function (error) {
                                        reject(error);
                                        return swal({
                                            type: 'error',
                                            title: i18n.t('global.optimize.error'),
                                            text: error.message,
                                            confirmButtonText: i18n.t('global.optimize.confirmText')
                                        });
                                    })];
                            case 7:
                                // Send transaction and add to mempool
                                _a.sent();
                                return [3 /*break*/, 9];
                            case 8:
                                error_1 = _a.sent();
                                reject(error_1);
                                return [2 /*return*/, swal({
                                        type: 'info',
                                        title: i18n.t('global.optimize.errorInfo'),
                                        text: error_1.message,
                                        confirmButtonText: i18n.t('global.optimize.confirmText')
                                    })];
                            case 9: return [2 /*return*/];
                        }
                    });
                }); });
            };
            _this.clearTransactions = function () {
                _this.txsMem = [];
                _this.deposits = [];
                _this.withdrawals = [];
                _this.transactions = [];
                _this.txLookupMap.clear();
                _this.keyLookupMap.clear();
                _this.recalculateKeyImages;
                _this.notify();
            };
            _this.resetScanHeight = function () {
                _this.lastHeight = _this.creationHeight;
                _this.signalChanged();
                _this.notify();
            };
            return _this;
        }
        Wallet.loadFromRaw = function (raw) {
            var wallet = new Wallet();
            wallet.transactions = [];
            wallet.withdrawals = [];
            wallet.deposits = [];
            wallet.keyLookupMap.clear();
            wallet.txLookupMap.clear();
            if (raw.deposits) {
                for (var _i = 0, _a = raw.deposits; _i < _a.length; _i++) {
                    var rawDeposit = _a[_i];
                    var deposit = Transaction_1.Deposit.fromRaw(rawDeposit);
                    wallet.deposits.push(deposit);
                }
            }
            if (raw.withdrawals) {
                for (var _b = 0, _c = raw.withdrawals; _b < _c.length; _b++) {
                    var rawWithdrawal = _c[_b];
                    var withdrawal = Transaction_1.Withdrawal.fromRaw(rawWithdrawal);
                    wallet.withdrawals.push(withdrawal);
                }
            }
            if (raw.transactions) {
                for (var _d = 0, _e = raw.transactions; _d < _e.length; _d++) {
                    var rawTransac = _e[_d];
                    var transaction = Transaction_1.Transaction.fromRaw(rawTransac);
                    wallet.transactions.push(transaction);
                    wallet.txLookupMap.set(transaction.hash, transaction);
                    wallet.keyLookupMap.set(transaction.txPubKey, transaction);
                }
            }
            wallet._lastHeight = raw.lastHeight;
            if (typeof raw.encryptedKeys === 'string' && raw.encryptedKeys !== '') {
                if (raw.encryptedKeys.length === 128) {
                    var privView = raw.encryptedKeys.substr(0, 64);
                    var privSpend = raw.encryptedKeys.substr(64, 64);
                    wallet.keys = KeysRepository_1.KeysRepository.fromPriv(privSpend, privView);
                }
                else {
                    var privView = raw.encryptedKeys.substr(0, 64);
                    var pubViewKey = raw.encryptedKeys.substr(64, 64);
                    var pubSpendKey = raw.encryptedKeys.substr(128, 64);
                    wallet.keys = {
                        pub: {
                            view: pubViewKey,
                            spend: pubSpendKey
                        },
                        priv: {
                            view: privView,
                            spend: '',
                        }
                    };
                }
            }
            else if (typeof raw.keys !== 'undefined') {
                wallet.keys = raw.keys;
            }
            if (typeof raw.creationHeight !== 'undefined')
                wallet.creationHeight = raw.creationHeight;
            if (typeof raw.options !== 'undefined')
                wallet._options = WalletOptions.fromRaw(raw.options);
            if (typeof raw.txPrivateKeys !== 'undefined')
                wallet.txPrivateKeys = raw.txPrivateKeys;
            if (typeof raw.coinAddressPrefix !== 'undefined')
                wallet.coinAddressPrefix = raw.coinAddressPrefix;
            else
                wallet.coinAddressPrefix = config.addressPrefix;
            if (typeof raw.coinAddressPrefix !== 'undefined')
                wallet.coinAddressPrefix = raw.coinAddressPrefix;
            else
                wallet.coinAddressPrefix = config.addressPrefix;
            wallet.recalculateKeyImages();
            return wallet;
        };
        Object.defineProperty(Wallet.prototype, "lastHeight", {
            get: function () {
                return this._lastHeight;
            },
            set: function (value) {
                var modified = value !== this._lastHeight;
                this._lastHeight = value;
                if (modified) {
                    this.notify();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Wallet.prototype, "options", {
            get: function () {
                return this._options;
            },
            set: function (value) {
                this._options = value;
                this.signalChanged();
            },
            enumerable: false,
            configurable: true
        });
        Wallet.prototype.recalculateKeyImages = function () {
            var keys = [];
            var indexes = [];
            for (var _i = 0, _a = this.transactions; _i < _a.length; _i++) {
                var transaction = _a[_i];
                for (var _b = 0, _c = transaction.outs; _b < _c.length; _b++) {
                    var out = _c[_b];
                    if (out.keyImage !== null && out.keyImage !== '')
                        keys.push(out.keyImage);
                    if (out.globalIndex !== 0)
                        indexes.push(out.globalIndex);
                }
            }
            this.keyImages = keys;
            this.txOutIndexes = indexes;
        };
        Object.defineProperty(Wallet.prototype, "hasPendingDeposit", {
            /**
             * Checks if there are any pending deposits in the wallet.
             * @returns {boolean} True if there is at least one pending deposit
             */
            get: function () {
                // Check mempool transactions
                for (var _i = 0, _a = this.txsMem; _i < _a.length; _i++) {
                    var tx = _a[_i];
                    for (var _b = 0, _c = tx.outs; _b < _c.length; _b++) {
                        var out = _c[_b];
                        if (out.type === "03" && (out.globalIndex === undefined || out.globalIndex === 0)) {
                            return true;
                        }
                    }
                }
                return false;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Wallet.prototype, "amount", {
            get: function () {
                return this.availableAmount(-1);
            },
            enumerable: false,
            configurable: true
        });
        return Wallet;
    }(Observable_1.Observable));
    exports.Wallet = Wallet;
    // Add this helper class for random number generation
    var ShuffleGenerator = /** @class */ (function () {
        function ShuffleGenerator(size) {
            this.indices = Array.from({ length: size }, function (_, i) { return i; });
            this.currentIndex = size;
            this.shuffle();
        }
        ShuffleGenerator.prototype.shuffle = function () {
            var _a;
            for (var i = this.indices.length - 1; i > 0; i--) {
                var j = Math.floor(MathUtil_1.MathUtil.randomFloat() * (i + 1));
                _a = [this.indices[j], this.indices[i]], this.indices[i] = _a[0], this.indices[j] = _a[1];
            }
        };
        ShuffleGenerator.prototype.next = function () {
            if (this.currentIndex === 0) {
                this.shuffle();
                this.currentIndex = this.indices.length;
            }
            return this.indices[--this.currentIndex];
        };
        return ShuffleGenerator;
    }());
});
