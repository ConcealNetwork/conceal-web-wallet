/**
 *	   Copyright (c) 2018, Gnock
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Masari Project
 *     Copyright (c) 2014-2018, MyMonero.com
 *     Copyright (c) 2022 - 2025, Conceal Devs
 *     Copyright (c) 2022 - 2025, Conceal Network
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define(["require", "exports", "./Currency"], function (require, exports, Currency_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransactionData = exports.Withdrawal = exports.Deposit = exports.Transaction = exports.TransactionIn = exports.TransactionOut = void 0;
    var TransactionOut = /** @class */ (function () {
        function TransactionOut() {
            var _this = this;
            this.amount = 0;
            this.keyImage = '';
            this.outputIdx = 0;
            this.globalIndex = 0;
            this.type = '';
            this.term = 0;
            this.ephemeralPub = '';
            this.pubKey = '';
            this.rtcOutPk = '';
            this.rtcMask = '';
            this.rtcAmount = '';
            this.export = function () {
                var data = {
                    keyImage: _this.keyImage,
                    outputIdx: _this.outputIdx,
                    globalIndex: _this.globalIndex,
                    amount: _this.amount,
                    type: _this.type,
                    term: _this.term,
                };
                if (_this.rtcOutPk !== '')
                    data.rtcOutPk = _this.rtcOutPk;
                if (_this.rtcMask !== '')
                    data.rtcMask = _this.rtcMask;
                if (_this.rtcAmount !== '')
                    data.rtcAmount = _this.rtcAmount;
                if (_this.ephemeralPub !== '')
                    data.ephemeralPub = _this.ephemeralPub;
                if (_this.pubKey !== '')
                    data.pubKey = _this.pubKey;
                return data;
            };
            this.copy = function () {
                var aCopy = new TransactionOut();
                aCopy.amount = _this.amount;
                aCopy.keyImage = _this.keyImage;
                aCopy.outputIdx = _this.outputIdx;
                aCopy.globalIndex = _this.globalIndex;
                aCopy.type = _this.type;
                aCopy.term = _this.term;
                aCopy.ephemeralPub = _this.ephemeralPub;
                aCopy.pubKey = _this.pubKey;
                aCopy.rtcOutPk = _this.rtcOutPk;
                aCopy.rtcMask = _this.rtcMask;
                aCopy.rtcAmount = _this.rtcAmount;
                return aCopy;
            };
        }
        TransactionOut.fromRaw = function (raw) {
            var nout = new TransactionOut();
            nout.keyImage = raw.keyImage;
            nout.outputIdx = raw.outputIdx;
            nout.globalIndex = raw.globalIndex;
            nout.amount = raw.amount;
            nout.type = raw.type;
            nout.term = raw.term;
            if (typeof raw.ephemeralPub !== 'undefined')
                nout.ephemeralPub = raw.ephemeralPub;
            if (typeof raw.pubKey !== 'undefined')
                nout.pubKey = raw.pubKey;
            if (typeof raw.rtcOutPk !== 'undefined')
                nout.rtcOutPk = raw.rtcOutPk;
            if (typeof raw.rtcMask !== 'undefined')
                nout.rtcMask = raw.rtcMask;
            if (typeof raw.rtcAmount !== 'undefined')
                nout.rtcAmount = raw.rtcAmount;
            return nout;
        };
        return TransactionOut;
    }());
    exports.TransactionOut = TransactionOut;
    var TransactionIn = /** @class */ (function () {
        function TransactionIn() {
            var _this = this;
            this.outputIndex = -1;
            this.keyImage = '';
            //if < 0, means the in has been seen but not checked (view only wallet)
            this.amount = 0;
            this.type = '';
            this.term = 0;
            this.export = function () {
                return {
                    outputIndex: _this.outputIndex,
                    keyImage: _this.keyImage,
                    amount: _this.amount,
                    term: _this.term,
                    type: _this.type
                };
            };
            this.copy = function () {
                var aCopy = new TransactionIn();
                aCopy.outputIndex = _this.outputIndex;
                aCopy.keyImage = _this.keyImage;
                aCopy.amount = _this.amount;
                aCopy.type = _this.type;
                aCopy.term = _this.term;
                return aCopy;
            };
        }
        TransactionIn.fromRaw = function (raw) {
            var nin = new TransactionIn();
            nin.outputIndex = raw.outputIndex,
                nin.keyImage = raw.keyImage;
            nin.amount = raw.amount;
            nin.type = raw.type;
            nin.term = raw.term;
            return nin;
        };
        return TransactionIn;
    }());
    exports.TransactionIn = TransactionIn;
    var Transaction = /** @class */ (function () {
        function Transaction() {
            var _this = this;
            this.blockHeight = 0;
            this.txPubKey = '';
            this.hash = '';
            this.outs = [];
            this.ins = [];
            this.timestamp = 0;
            this.paymentId = '';
            this.fees = 0;
            this.fusion = false;
            this.message = '';
            this.messageViewed = false;
            this.ttl = 0; // TTL timestamp (absolute UNIX timestamp in seconds)
            this.export = function () {
                var data = {
                    blockHeight: _this.blockHeight,
                    txPubKey: _this.txPubKey,
                    timestamp: _this.timestamp,
                    hash: _this.hash,
                };
                if (_this.ins.length > 0) {
                    var rins = [];
                    for (var _i = 0, _a = _this.ins; _i < _a.length; _i++) {
                        var nin = _a[_i];
                        rins.push(nin.export());
                    }
                    data.ins = rins;
                }
                if (_this.outs.length > 0) {
                    var routs = [];
                    for (var _b = 0, _c = _this.outs; _b < _c.length; _b++) {
                        var nout = _c[_b];
                        routs.push(nout.export());
                    }
                    data.outs = routs;
                }
                if (_this.paymentId !== '')
                    data.paymentId = _this.paymentId;
                if (_this.message !== '')
                    data.message = _this.message;
                if (_this.fees !== 0)
                    data.fees = _this.fees;
                if (_this.fusion)
                    data.fusion = _this.fusion;
                if (_this.messageViewed)
                    data.messageViewed = _this.messageViewed;
                if (_this.ttl !== 0)
                    data.ttl = _this.ttl;
                return data;
            };
            this.getAmount = function () {
                var amount = 0;
                for (var _i = 0, _a = _this.outs; _i < _a.length; _i++) {
                    var out = _a[_i];
                    if (out.type !== "03") {
                        amount += out.amount;
                    }
                }
                for (var _b = 0, _c = _this.ins; _b < _c.length; _b++) {
                    var nin = _c[_b];
                    if (nin.type !== "03") {
                        amount -= nin.amount;
                    }
                }
                return amount;
            };
            this.isCoinbase = function () {
                return _this.outs.length == 1 && _this.outs[0].rtcAmount === '';
            };
            this.isConfirmed = function (blockchainHeight) {
                if (_this.blockHeight === 0) {
                    return false;
                }
                else if (_this.isCoinbase() && _this.blockHeight + config.txCoinbaseMinConfirms < blockchainHeight) {
                    return true;
                }
                else if (!_this.isCoinbase() && _this.blockHeight + config.txMinConfirms < blockchainHeight) {
                    return true;
                }
                return false;
            };
            this.isFullyChecked = function () {
                if (_this.getAmount() === 0 || _this.getAmount() === (-1 * config.minimumFee_V2)) {
                    if (_this.isFusion) {
                        return true;
                    }
                    else if (_this.ttl > 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    for (var _i = 0, _a = _this.ins; _i < _a.length; _i++) {
                        var input = _a[_i];
                        if (input.amount < 0) {
                            return false;
                        }
                    }
                    return true;
                }
            };
            this.hasMessage = function () {
                var txAmount = _this.getAmount();
                return (_this.message !== '') && (txAmount > 0) && (txAmount !== (1 * config.remoteNodeFee)) && (txAmount !== (10 * config.remoteNodeFee)); // no envelope for a suspectedremote node fee transaction
            };
            this.copy = function () {
                var aCopy = new Transaction();
                aCopy.blockHeight = _this.blockHeight;
                aCopy.txPubKey = _this.txPubKey;
                aCopy.hash = _this.hash;
                aCopy.timestamp = _this.timestamp;
                aCopy.paymentId = _this.paymentId;
                aCopy.fees = _this.fees;
                aCopy.message = _this.message;
                aCopy.fusion = _this.fusion;
                aCopy.messageViewed = _this.messageViewed;
                aCopy.ttl = _this.ttl;
                for (var _i = 0, _a = _this.ins; _i < _a.length; _i++) {
                    var nin = _a[_i];
                    aCopy.ins.push(nin.copy());
                }
                for (var _b = 0, _c = _this.outs; _b < _c.length; _b++) {
                    var nout = _c[_b];
                    aCopy.outs.push(nout.copy());
                }
                return aCopy;
            };
        }
        Object.defineProperty(Transaction.prototype, "isDeposit", {
            get: function () {
                // Check if any of the outputs has a type "03", which indicates it's a deposit transaction
                return this.outs.some(function (out) { return out.type === "03"; });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transaction.prototype, "isWithdrawal", {
            get: function () {
                // Check if any of the inputs has a type "03", which indicates it's a withdrawal transaction
                return this.ins.some(function (input) { return input.type === "03"; });
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Transaction.prototype, "isFusion", {
            get: function () {
                var outputsCount = this.outs.length;
                var inputsCount = this.ins.length;
                if (this.outs.some(function (out) { return out.type === "03"; }) || this.ins.some(function (input) { return input.type === "03"; })) {
                    return false;
                }
                return (((inputsCount > Currency_1.Currency.fusionTxMinInputCount) && ((inputsCount / outputsCount) > config.fusionTxMinInOutCountRatio)) || this.fusion);
            },
            enumerable: false,
            configurable: true
        });
        Transaction.fromRaw = function (raw) {
            var transac = new Transaction();
            transac.blockHeight = raw.blockHeight;
            transac.txPubKey = raw.txPubKey;
            transac.timestamp = raw.timestamp;
            if (typeof raw.ins !== 'undefined') {
                var ins = [];
                for (var _i = 0, _a = raw.ins; _i < _a.length; _i++) {
                    var rin = _a[_i];
                    ins.push(TransactionIn.fromRaw(rin));
                }
                transac.ins = ins;
            }
            if (typeof raw.outs !== 'undefined') {
                var outs = [];
                for (var _b = 0, _c = raw.outs; _b < _c.length; _b++) {
                    var rout = _c[_b];
                    outs.push(TransactionOut.fromRaw(rout));
                }
                transac.outs = outs;
            }
            if (typeof raw.paymentId !== 'undefined')
                transac.paymentId = raw.paymentId;
            if (typeof raw.fees !== 'undefined')
                transac.fees = raw.fees;
            if (typeof raw.hash !== 'undefined')
                transac.hash = raw.hash;
            if (typeof raw.message !== 'undefined')
                transac.message = raw.message;
            if (typeof raw.fusion !== 'undefined')
                transac.fusion = raw.fusion;
            if (typeof raw.messageViewed !== 'undefined')
                transac.messageViewed = raw.messageViewed;
            if (typeof raw.ttl !== 'undefined')
                transac.ttl = raw.ttl;
            return transac;
        };
        return Transaction;
    }());
    exports.Transaction = Transaction;
    var BaseBanking = /** @class */ (function () {
        function BaseBanking() {
            this.term = 0;
            this.txHash = '';
            this.amount = 0;
            this.interest = 0;
            this.timestamp = 0;
            this.blockHeight = 0;
            this.unlockHeight = 0;
            this.globalOutputIndex = 0;
            this.indexInVout = 0;
            this.txPubKey = '';
        }
        BaseBanking.fromRaw = function (raw) {
            var deposit = new Deposit();
            deposit.term = raw.term;
            deposit.txHash = raw.txHash;
            deposit.amount = raw.amount;
            deposit.interest = raw.interest;
            deposit.timestamp = raw.timestamp;
            deposit.blockHeight = raw.blockHeight;
            deposit.unlockHeight = raw.unlockHeight || (raw.blockHeight + raw.term);
            deposit.globalOutputIndex = raw.globalOutputIndex;
            deposit.indexInVout = raw.indexInVout;
            deposit.txPubKey = raw.txPubKey;
            return deposit;
        };
        BaseBanking.prototype.export = function () {
            return {
                term: this.term,
                txHash: this.txHash,
                amount: this.amount,
                interest: this.interest,
                timestamp: this.timestamp,
                blockHeight: this.blockHeight,
                unlockHeight: this.unlockHeight,
                globalOutputIndex: this.globalOutputIndex,
                indexInVout: this.indexInVout,
                txPubKey: this.txPubKey
            };
        };
        BaseBanking.prototype.copy = function () {
            var aCopy = new Deposit();
            aCopy.term = this.term;
            aCopy.txHash = this.txHash;
            aCopy.amount = this.amount;
            aCopy.interest = this.interest;
            aCopy.timestamp = this.timestamp;
            aCopy.blockHeight = this.blockHeight;
            aCopy.unlockHeight = this.unlockHeight;
            aCopy.globalOutputIndex = this.globalOutputIndex;
            aCopy.indexInVout = this.indexInVout;
            aCopy.txPubKey = this.txPubKey;
            return aCopy;
        };
        return BaseBanking;
    }());
    var Deposit = /** @class */ (function (_super) {
        __extends(Deposit, _super);
        function Deposit() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.spentTx = '';
            _this.keys = []; // Array of public keys for multisignature deposit
            _this.withdrawPending = false;
            _this.copy = function () {
                var aCopy = _super.prototype.copy.call(_this);
                aCopy.spentTx = _this.spentTx;
                aCopy.withdrawPending = _this.withdrawPending;
                aCopy.keys = __spreadArray([], _this.keys, true);
                return aCopy;
            };
            return _this;
        }
        Deposit.fromRaw = function (raw) {
            var deposit = new Deposit();
            deposit.term = raw.term;
            deposit.txHash = raw.txHash;
            deposit.amount = raw.amount;
            deposit.interest = raw.interest;
            deposit.spentTx = raw.spentTx;
            deposit.timestamp = raw.timestamp;
            deposit.blockHeight = raw.blockHeight;
            deposit.globalOutputIndex = raw.globalOutputIndex; //used to build Multisig input for withdrawals
            deposit.indexInVout = raw.indexInVout; //used to generate_signature for withdrawals
            deposit.txPubKey = raw.txPubKey;
            deposit.unlockHeight = raw.unlockHeight || (raw.blockHeight + raw.term);
            deposit.keys = raw.keys || [];
            deposit.withdrawPending = raw.withdrawPending;
            return deposit;
        };
        Deposit.prototype.export = function () {
            return Object.assign(_super.prototype.export.call(this), {
                spentTx: this.spentTx,
                withdrawPending: this.withdrawPending,
                keys: this.keys
            });
        };
        // Get total amount (principal + interest)
        Deposit.prototype.getTotalAmount = function () {
            return this.amount + this.interest;
        };
        // Check if deposit is unlocked at current height
        Deposit.prototype.isUnlocked = function (currentHeight) {
            return currentHeight >= this.unlockHeight;
        };
        // Check if deposit has been spent
        Deposit.prototype.isSpent = function () {
            return !!this.spentTx;
        };
        // Get deposit status
        Deposit.prototype.getStatus = function (currentHeight) {
            if (this.isSpent()) {
                return 'Spent';
            }
            else if (this.isUnlocked(currentHeight)) {
                return 'Unlocked';
            }
            else {
                return 'Locked';
            }
        };
        return Deposit;
    }(BaseBanking));
    exports.Deposit = Deposit;
    var Withdrawal = /** @class */ (function (_super) {
        __extends(Withdrawal, _super);
        function Withdrawal() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Withdrawal;
    }(BaseBanking));
    exports.Withdrawal = Withdrawal;
    var TransactionData = /** @class */ (function () {
        function TransactionData() {
            var _this = this;
            this.transaction = null;
            this.withdrawals = [];
            this.deposits = [];
            this.export = function () {
                var txData = {};
                var deposits = [];
                var withdrawals = [];
                if (_this.transaction) {
                    txData.transaction = _this.transaction.export();
                }
                if (_this.deposits.length > 0) {
                    for (var _i = 0, _a = _this.deposits; _i < _a.length; _i++) {
                        var deposit = _a[_i];
                        deposits.push(deposit.export());
                    }
                }
                if (_this.withdrawals.length > 0) {
                    for (var _b = 0, _c = _this.withdrawals; _b < _c.length; _b++) {
                        var withdrawal = _c[_b];
                        withdrawals.push(withdrawal.export());
                    }
                }
                txData.deposits = deposits;
                txData.withdrawals = withdrawals;
                return txData;
            };
            this.copy = function () {
                var aCopy = new TransactionData();
                aCopy.transaction = _this.transaction ? _this.transaction.copy() : null;
                for (var _i = 0, _a = _this.deposits; _i < _a.length; _i++) {
                    var deposit = _a[_i];
                    aCopy.deposits.push(deposit.copy());
                }
                for (var _b = 0, _c = _this.withdrawals; _b < _c.length; _b++) {
                    var withdrawal = _c[_b];
                    aCopy.withdrawals.push(withdrawal.copy());
                }
                return aCopy;
            };
        }
        TransactionData.fromRaw = function (raw) {
            var txData = new TransactionData();
            txData.transaction = Transaction.fromRaw(raw.transaction);
            if (raw.withdrawals) {
                for (var _i = 0, _a = raw.withdrawals; _i < _a.length; _i++) {
                    var withdrawal = _a[_i];
                    txData.withdrawals.push(Deposit.fromRaw(withdrawal));
                }
            }
            if (raw.deposits) {
                for (var _b = 0, _c = raw.deposits; _b < _c.length; _b++) {
                    var deposit = _c[_b];
                    txData.deposits.push(Deposit.fromRaw(deposit));
                }
            }
            return txData;
        };
        return TransactionData;
    }());
    exports.TransactionData = TransactionData;
});
