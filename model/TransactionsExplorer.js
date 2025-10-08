/**
 *	   Copyright (c) 2018, Gnock
 *     Copyright (c) 2014-2018, MyMonero.com
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Masari Project
 *     Copyright (c) 2022, The Karbo Developers
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define(["require", "exports", "./MathUtil", "./ChaCha8", "./Cn", "./Transaction", "./Interest", "./Currency", "./Varint"], function (require, exports, MathUtil_1, ChaCha8_1, Cn_1, Transaction_1, Interest_1, Currency_1, Varint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransactionsExplorer = exports.TX_EXTRA_MESSAGE_CHECKSUM_SIZE = exports.TX_EXTRA_TTL = exports.TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID = exports.TX_EXTRA_NONCE_PAYMENT_ID = exports.TX_EXTRA_MYSTERIOUS_MINERGATE_TAG = exports.TX_EXTRA_MESSAGE_TAG = exports.TX_EXTRA_MERGE_MINING_TAG = exports.TX_EXTRA_NONCE = exports.TX_EXTRA_TAG_PUBKEY = exports.TX_EXTRA_TAG_PADDING = exports.TX_EXTRA_NONCE_MAX_COUNT = exports.TX_EXTRA_PADDING_MAX_COUNT = void 0;
    exports.TX_EXTRA_PADDING_MAX_COUNT = 255;
    exports.TX_EXTRA_NONCE_MAX_COUNT = 255;
    exports.TX_EXTRA_TAG_PADDING = 0x00;
    exports.TX_EXTRA_TAG_PUBKEY = 0x01;
    exports.TX_EXTRA_NONCE = 0x02;
    exports.TX_EXTRA_MERGE_MINING_TAG = 0x03;
    exports.TX_EXTRA_MESSAGE_TAG = 0x04;
    exports.TX_EXTRA_MYSTERIOUS_MINERGATE_TAG = 0xDE;
    exports.TX_EXTRA_NONCE_PAYMENT_ID = 0x00;
    exports.TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID = 0x01;
    exports.TX_EXTRA_TTL = 0x05;
    exports.TX_EXTRA_MESSAGE_CHECKSUM_SIZE = 4;
    var TransactionsExplorer = /** @class */ (function () {
        function TransactionsExplorer() {
        }
        TransactionsExplorer.parseExtra = function (oExtra) {
            var extra = oExtra.slice();
            var extras = [];
            var hasFoundPubKey = false;
            while (extra.length > 0) {
                try {
                    var extraSize = 0;
                    var startOffset = 0;
                    if (extra[0] === exports.TX_EXTRA_NONCE ||
                        extra[0] === exports.TX_EXTRA_MERGE_MINING_TAG ||
                        extra[0] === exports.TX_EXTRA_MYSTERIOUS_MINERGATE_TAG) {
                        extraSize = extra[1];
                        startOffset = 2;
                    }
                    else if (extra[0] === exports.TX_EXTRA_TAG_PUBKEY) {
                        extraSize = 32;
                        startOffset = 1;
                        hasFoundPubKey = true;
                    }
                    else if (extra[0] === exports.TX_EXTRA_MESSAGE_TAG) {
                        extraSize = extra[1];
                        startOffset = 2;
                    }
                    else if (extra[0] === exports.TX_EXTRA_TTL) {
                        extraSize = extra[1];
                        startOffset = 2;
                    }
                    else if (extra[0] === exports.TX_EXTRA_TAG_PADDING) {
                        // do nothing
                    }
                    if (extraSize === 0) {
                        if (!hasFoundPubKey) {
                            throw 'Invalid extra size ' + extra[0];
                        }
                        break;
                    }
                    if ((startOffset > 0) && (extraSize > 0)) {
                        var data = extra.slice(startOffset, startOffset + extraSize);
                        extras.push({
                            type: extra[0],
                            data: data
                        });
                        extra = extra.slice(startOffset + extraSize);
                    }
                    else if (!extraSize) {
                        logDebugMsg("Corrupt extra skipping it...");
                        break;
                    }
                }
                catch (err) {
                    logDebugMsg("Error in parsing extra", err);
                    break;
                }
            }
            // extras array
            return extras;
        };
        TransactionsExplorer.isMinerTx = function (rawTransaction) {
            if (!Array.isArray(rawTransaction.vout) || rawTransaction.vin.length > 0) {
                return false;
            }
            if (!Array.isArray(rawTransaction.vout) || rawTransaction.vout.length === 0) {
                console.error('Weird tx !', rawTransaction);
                return false;
            }
            try {
                return rawTransaction.vout[0].amount !== 0;
            }
            catch (err) {
                return false;
            }
        };
        TransactionsExplorer.ownsTx = function (rawTransaction, wallet) {
            var tx_pub_key = '';
            var txExtras = [];
            try {
                var hexExtra = [];
                var uint8Array = Cn_1.CnUtils.hextobin(rawTransaction.extra);
                for (var i = 0; i < uint8Array.byteLength; i++) {
                    hexExtra[i] = uint8Array[i];
                }
                txExtras = this.parseExtra(hexExtra);
            }
            catch (e) {
                console.error('Error when scanning transaction on block ' + rawTransaction.height, e);
                return false;
            }
            for (var _i = 0, txExtras_1 = txExtras; _i < txExtras_1.length; _i++) {
                var extra = txExtras_1[_i];
                if (extra.type === exports.TX_EXTRA_TAG_PUBKEY) {
                    for (var i = 0; i < 32; ++i) {
                        tx_pub_key += String.fromCharCode(extra.data[i]);
                    }
                    break;
                }
            }
            if (tx_pub_key === '') {
                console.error("tx_pub_key === null", rawTransaction.height, rawTransaction.hash);
                return false;
            }
            tx_pub_key = Cn_1.CnUtils.bintohex(tx_pub_key);
            var derivation = null;
            try {
                derivation = Cn_1.CnNativeBride.generate_key_derivation(tx_pub_key, wallet.keys.priv.view);
            }
            catch (e) {
                console.error('UNABLE TO CREATE DERIVATION', e);
                return false;
            }
            if (!derivation) {
                console.error('UNABLE TO CREATE DERIVATION');
                return false;
            }
            var keyIndex = 0;
            for (var iOut = 0; iOut < rawTransaction.vout.length; iOut++) {
                var out = rawTransaction.vout[iOut];
                var txout_k = out.target.data;
                if (out.target.type == "02" && typeof txout_k.key !== 'undefined') {
                    var publicEphemeral = Cn_1.CnNativeBride.derive_public_key(derivation, keyIndex, wallet.keys.pub.spend);
                    if (txout_k.key == publicEphemeral) {
                        logDebugMsg("Found our tx...");
                        return true;
                    }
                    ++keyIndex;
                }
                else if (out.target.type == "03" && (typeof txout_k.keys !== 'undefined')) {
                    for (var iKey = 0; iKey < txout_k.keys.length; iKey++) {
                        var key = txout_k.keys[iKey];
                        var publicEphemeral = Cn_1.CnNativeBride.derive_public_key(derivation, iOut, wallet.keys.pub.spend);
                        if (key == publicEphemeral) {
                            return true;
                        }
                        ++keyIndex;
                    }
                }
            }
            //check if no read only wallet
            if (wallet.keys.priv.spend !== null && wallet.keys.priv.spend !== '') {
                var keyImages = wallet.getTransactionKeyImages();
                for (var iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
                    var vin = rawTransaction.vin[iIn];
                    if (vin.value && keyImages.indexOf(vin.value.k_image) !== -1) {
                        var walletOuts = wallet.getAllOuts();
                        for (var _a = 0, walletOuts_1 = walletOuts; _a < walletOuts_1.length; _a++) {
                            var ut = walletOuts_1[_a];
                            if (ut.keyImage == vin.value.k_image) {
                                return true;
                            }
                        }
                    }
                }
            }
            else {
                var txOutIndexes = wallet.getTransactionOutIndexes();
                for (var iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
                    var vin = rawTransaction.vin[iIn];
                    if (!vin.value) {
                        continue;
                    }
                    var absoluteOffets = vin.value.key_offsets.slice();
                    for (var i = 1; i < absoluteOffets.length; ++i) {
                        absoluteOffets[i] += absoluteOffets[i - 1];
                    }
                    var ownTx = -1;
                    for (var _b = 0, absoluteOffets_1 = absoluteOffets; _b < absoluteOffets_1.length; _b++) {
                        var index = absoluteOffets_1[_b];
                        if (txOutIndexes.indexOf(index) !== -1) {
                            ownTx = index;
                            break;
                        }
                    }
                    if (ownTx !== -1) {
                        var txOut = wallet.getOutWithGlobalIndex(ownTx);
                        if (txOut !== null) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        TransactionsExplorer.decryptMessage = function (index, txPubKey, recepientSecretSpendKey, rawMessage) {
            var decryptedMessage = '';
            var mlen = rawMessage.length / 2;
            if (mlen < exports.TX_EXTRA_MESSAGE_CHECKSUM_SIZE) {
                return null;
            }
            var derivation;
            try {
                derivation = Cn_1.CnNativeBride.generate_key_derivation(txPubKey, recepientSecretSpendKey);
            }
            catch (e) {
                console.error('UNABLE TO CREATE DERIVATION', e);
                return null;
            }
            var magick1 = "80";
            var magick2 = "00";
            var keyData = derivation + magick1 + magick2;
            var hash = Cn_1.CnUtils.cn_fast_hash(keyData);
            var hashBuf = Cn_1.CnUtils.hextobin(hash);
            var nonceBuf = new Uint8Array(12);
            for (var i = 0; i < 12; i++) {
                nonceBuf.set([index / Math.pow(0x100, i)], 11 - i);
            }
            // make a binary array out of raw message
            var rawMessArr = Cn_1.CnUtils.hextobin(rawMessage);
            // typescripted chacha
            var cha = new ChaCha8_1.JSChaCha8(hashBuf, nonceBuf);
            var _buf = cha.decrypt(rawMessArr);
            // decode the buffer from chacha8 with text decoder
            decryptedMessage = new TextDecoder().decode(_buf);
            mlen -= exports.TX_EXTRA_MESSAGE_CHECKSUM_SIZE;
            for (var i = 0; i < exports.TX_EXTRA_MESSAGE_CHECKSUM_SIZE; i++) {
                if (_buf[mlen + i] != 0) {
                    return null;
                }
            }
            return decryptedMessage.slice(0, -exports.TX_EXTRA_MESSAGE_CHECKSUM_SIZE);
        };
        TransactionsExplorer.parse = function (rawTransaction, wallet) {
            var _a;
            var transactionData = null;
            var transaction = null;
            var withdrawals = [];
            var deposits = [];
            var tx_pub_key = '';
            var paymentId = null;
            var rawMessage = '';
            var ttl = 0;
            var txExtras = [];
            try {
                var hexExtra = [];
                var uint8Array = Cn_1.CnUtils.hextobin(rawTransaction.extra);
                for (var i = 0; i < uint8Array.byteLength; i++) {
                    hexExtra[i] = uint8Array[i];
                }
                txExtras = this.parseExtra(hexExtra);
            }
            catch (e) {
                console.error('Error when scanning transaction on block ' + rawTransaction.height, e);
                return null;
            }
            for (var _i = 0, txExtras_2 = txExtras; _i < txExtras_2.length; _i++) {
                var extra = txExtras_2[_i];
                if (extra.type === exports.TX_EXTRA_TAG_PUBKEY) {
                    for (var i = 0; i < 32; ++i) {
                        tx_pub_key += String.fromCharCode(extra.data[i]);
                    }
                    break;
                }
            }
            if (tx_pub_key === '') {
                console.error("tx_pub_key === null", rawTransaction.height, rawTransaction.hash);
                return null;
            }
            tx_pub_key = Cn_1.CnUtils.bintohex(tx_pub_key);
            var encryptedPaymentId = null;
            var extraIndex = 0;
            for (var _b = 0, txExtras_3 = txExtras; _b < txExtras_3.length; _b++) {
                var extra = txExtras_3[_b];
                if (extra.type === exports.TX_EXTRA_NONCE) {
                    if (extra.data[0] === exports.TX_EXTRA_NONCE_PAYMENT_ID) {
                        paymentId = '';
                        for (var i = 1; i < extra.data.length; ++i) {
                            paymentId += String.fromCharCode(extra.data[i]);
                        }
                        paymentId = Cn_1.CnUtils.bintohex(paymentId);
                        //break;
                    }
                    else if (extra.data[0] === exports.TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID) {
                        encryptedPaymentId = '';
                        for (var i = 1; i < extra.data.length; ++i) {
                            encryptedPaymentId += String.fromCharCode(extra.data[i]);
                        }
                        encryptedPaymentId = Cn_1.CnUtils.bintohex(encryptedPaymentId);
                        //break;
                    }
                }
                else if (extra.type === exports.TX_EXTRA_MESSAGE_TAG) {
                    // TODO: Only extract message if not a remote node fee transaction
                    for (var i = 0; i < extra.data.length; ++i) {
                        rawMessage += String.fromCharCode(extra.data[i]);
                    }
                    rawMessage = Cn_1.CnUtils.bintohex(rawMessage);
                }
                else if (extra.type === exports.TX_EXTRA_TTL) {
                    var rawTTL = '';
                    for (var i = 0; i < extra.data.length; ++i) {
                        rawTTL += String.fromCharCode(extra.data[i]);
                    }
                    var ttlStr = Cn_1.CnUtils.bintohex(rawTTL);
                    var uint8Array = Cn_1.CnUtils.hextobin(ttlStr);
                    ttl = (0, Varint_1.decode)(uint8Array);
                }
                extraIndex++;
            }
            var derivation = null;
            try {
                derivation = Cn_1.CnNativeBride.generate_key_derivation(tx_pub_key, wallet.keys.priv.view);
            }
            catch (e) {
                console.error('UNABLE TO CREATE DERIVATION', e);
                return null;
            }
            var outs = [];
            var ins = [];
            for (var iOut = 0; iOut < rawTransaction.vout.length; iOut++) {
                var out = rawTransaction.vout[iOut];
                var txout_k = out.target.data;
                var amount = 0;
                try {
                    amount = out.amount;
                }
                catch (e) {
                    console.error(e);
                    continue;
                }
                var output_idx_in_tx = iOut;
                var generated_tx_pubkey = Cn_1.CnNativeBride.derive_public_key(derivation, output_idx_in_tx, wallet.keys.pub.spend);
                // check if generated public key matches the current output's key
                var mine_output = false;
                if (out.target.type == "02" && typeof txout_k.key !== 'undefined') {
                    mine_output = (txout_k.key == generated_tx_pubkey);
                }
                else if (out.target.type == "03" && typeof txout_k.keys !== 'undefined') {
                    for (var iKey = 0; iKey < txout_k.keys.length; iKey++) {
                        if (txout_k.keys[iKey] == generated_tx_pubkey) {
                            mine_output = true;
                        }
                    }
                }
                if (mine_output) {
                    var transactionOut = new Transaction_1.TransactionOut();
                    if (typeof rawTransaction.global_index_start !== 'undefined')
                        transactionOut.globalIndex = rawTransaction.output_indexes[output_idx_in_tx];
                    else
                        transactionOut.globalIndex = output_idx_in_tx;
                    transactionOut.amount = amount;
                    if (out.target.type == "02" && typeof txout_k.key !== 'undefined') {
                        transactionOut.pubKey = txout_k.key;
                        transactionOut.type = "02";
                    }
                    else if (out.target.type == "03" && typeof txout_k.keys !== 'undefined') {
                        transactionOut.pubKey = generated_tx_pubkey; // assume
                        transactionOut.type = "03";
                        if (out.target.data && out.target.data.term) {
                            var deposit = new Transaction_1.Deposit();
                            if (typeof rawTransaction.height !== 'undefined')
                                deposit.blockHeight = rawTransaction.height;
                            if (typeof rawTransaction.hash !== 'undefined')
                                deposit.txHash = rawTransaction.hash;
                            if (typeof rawTransaction.ts !== 'undefined')
                                deposit.timestamp = rawTransaction.ts;
                            deposit.amount = transactionOut.amount;
                            deposit.term = out.target.data.term;
                            if (rawTransaction.output_indexes && typeof rawTransaction.output_indexes[iOut] !== 'undefined') {
                                deposit.globalOutputIndex = rawTransaction.output_indexes[iOut];
                            }
                            else {
                                deposit.globalOutputIndex = output_idx_in_tx;
                            }
                            deposit.indexInVout = iOut;
                            // Extract keys from the transaction output target data
                            if (out.target.data.keys && Array.isArray(out.target.data.keys)) {
                                deposit.keys = out.target.data.keys;
                            }
                            deposit.txPubKey = tx_pub_key; // Reuse the already extracted transaction public key
                            // Calculate the interest for this deposit
                            deposit.interest = Interest_1.InterestCalculator.calculateInterest(deposit.amount, deposit.term, deposit.blockHeight);
                            deposits.push(deposit);
                        }
                    }
                    transactionOut.outputIdx = output_idx_in_tx;
                    /*
                    if (!minerTx) {
                      transactionOut.rtcOutPk = rawTransaction.rct_signatures.outPk[output_idx_in_tx];
                      transactionOut.rtcMask = rawTransaction.rct_signatures.ecdhInfo[output_idx_in_tx].mask;
                      transactionOut.rtcAmount = rawTransaction.rct_signatures.ecdhInfo[output_idx_in_tx].amount;
                    }
                    */
                    if (wallet.keys.priv.spend !== null && wallet.keys.priv.spend !== '') {
                        var m_key_image = Cn_1.CnTransactions.generate_key_image_helper({
                            view_secret_key: wallet.keys.priv.view,
                            spend_secret_key: wallet.keys.priv.spend,
                            public_spend_key: wallet.keys.pub.spend,
                        }, tx_pub_key, output_idx_in_tx, derivation);
                        transactionOut.keyImage = m_key_image.key_image;
                        transactionOut.ephemeralPub = m_key_image.ephemeral_pub;
                    }
                    outs.push(transactionOut);
                } //  if (mine_output)
            }
            //check if no read only wallet
            if (wallet.keys.priv.spend !== null && wallet.keys.priv.spend !== '') {
                var keyImages = wallet.getTransactionKeyImages();
                for (var iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
                    var vin = rawTransaction.vin[iIn];
                    var wasAdded = false;
                    if (vin.value && vin.value.k_image && keyImages.indexOf(vin.value.k_image) !== -1) {
                        var walletOuts = wallet.getAllOuts();
                        for (var _c = 0, walletOuts_2 = walletOuts; _c < walletOuts_2.length; _c++) {
                            var ut = walletOuts_2[_c];
                            if (wasAdded) {
                                console.log(ut.keyImage, "=", vin.value.k_image);
                            }
                            if (ut.keyImage == vin.value.k_image) {
                                var transactionIn = new Transaction_1.TransactionIn();
                                transactionIn.amount = ut.amount;
                                transactionIn.keyImage = ut.keyImage;
                                // check if its a withdrawal
                                if (vin.type == "03") {
                                    if (vin.value && vin.value.term) {
                                        var withdrawal = new Transaction_1.Deposit();
                                        withdrawal.globalOutputIndex = (vin.value && vin.value.outputIndex) ? vin.value.outputIndex : 0;
                                        if (typeof rawTransaction.height !== 'undefined')
                                            withdrawal.blockHeight = rawTransaction.height;
                                        if (typeof rawTransaction.hash !== 'undefined')
                                            withdrawal.txHash = rawTransaction.hash;
                                        if (typeof rawTransaction.ts !== 'undefined')
                                            withdrawal.timestamp = rawTransaction.ts;
                                        withdrawal.term = (vin.value && vin.value.term) ? vin.value.term : 0;
                                        withdrawal.amount = transactionIn.amount;
                                        withdrawals.push(withdrawal);
                                        wasAdded = true;
                                    }
                                }
                                ins.push(transactionIn);
                                break;
                            }
                        }
                    }
                    // add the withdrawal if it was not yet processed
                    if ((!wasAdded) && (vin.type == "03")) {
                        var transactionIn = new Transaction_1.TransactionIn();
                        transactionIn.type = "03"; // Set type explicitly for withdrawal
                        transactionIn.term = (vin.value && vin.value.term) ? vin.value.term : 0;
                        if (vin.value && vin.value.amount) {
                            transactionIn.amount = parseInt(vin.value.amount);
                        }
                        // Add the transaction input to the array
                        ins.push(transactionIn);
                        var withdrawal = new Transaction_1.Deposit();
                        if (typeof rawTransaction.ts !== 'undefined')
                            withdrawal.timestamp = rawTransaction.ts;
                        if (typeof rawTransaction.hash !== 'undefined')
                            withdrawal.txHash = rawTransaction.hash;
                        if (typeof rawTransaction.height !== 'undefined')
                            withdrawal.blockHeight = rawTransaction.height;
                        if (vin.value && vin.value.amount)
                            withdrawal.amount = parseInt((_a = vin.value) === null || _a === void 0 ? void 0 : _a.amount);
                        withdrawal.globalOutputIndex = (vin.value && vin.value.outputIndex) ? vin.value.outputIndex : 0;
                        withdrawal.term = (vin.value && vin.value.term) ? vin.value.term : 0;
                        withdrawals.push(withdrawal);
                        wasAdded = true;
                    }
                }
            }
            else {
                var txOutIndexes = wallet.getTransactionOutIndexes();
                for (var iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
                    var vin = rawTransaction.vin[iIn];
                    if (!vin.value)
                        continue;
                    var absoluteOffets = vin.value.key_offsets.slice();
                    for (var i = 1; i < absoluteOffets.length; ++i) {
                        absoluteOffets[i] += absoluteOffets[i - 1];
                    }
                    var ownTx = -1;
                    for (var _d = 0, absoluteOffets_2 = absoluteOffets; _d < absoluteOffets_2.length; _d++) {
                        var index = absoluteOffets_2[_d];
                        if (txOutIndexes.indexOf(index) !== -1) {
                            ownTx = index;
                            break;
                        }
                    }
                    if (ownTx !== -1) {
                        var txOut = wallet.getOutWithGlobalIndex(ownTx);
                        if (txOut !== null) {
                            var transactionIn = new Transaction_1.TransactionIn();
                            transactionIn.amount = -txOut.amount;
                            transactionIn.keyImage = txOut.keyImage;
                            // check if its a withdrawal
                            if (vin.type == "03") {
                                if (vin.value && vin.value.term) {
                                }
                            }
                            ins.push(transactionIn);
                        }
                    }
                }
            }
            if (outs.length > 0 || ins.length) {
                transactionData = new Transaction_1.TransactionData();
                transaction = new Transaction_1.Transaction();
                if (typeof rawTransaction.height !== 'undefined')
                    transaction.blockHeight = rawTransaction.height;
                if (typeof rawTransaction.ts !== 'undefined')
                    transaction.timestamp = rawTransaction.ts;
                if (typeof rawTransaction.hash !== 'undefined')
                    transaction.hash = rawTransaction.hash;
                transaction.txPubKey = tx_pub_key;
                if (paymentId !== null)
                    transaction.paymentId = paymentId;
                if (encryptedPaymentId !== null) {
                    transaction.paymentId = Cn_1.Cn.decrypt_payment_id(encryptedPaymentId, tx_pub_key, wallet.keys.priv.view);
                }
                if (rawTransaction.vin[0].type === 'ff') {
                    transaction.fees = 0;
                }
                else {
                    transaction.fees = rawTransaction.fee;
                }
                transaction.fusion = ((rawTransaction.vin.length > Currency_1.Currency.fusionTxMinInputCount) &&
                    (rawTransaction.vout.length <= config.maxFusionOutputs) &&
                    ((rawTransaction.vin.length / rawTransaction.vout.length) > config.fusionTxMinInOutCountRatio) &&
                    (rawTransaction.vin.some(function (vin) { return vin.type != "03"; })) &&
                    (rawTransaction.vout.some(function (vout) { return vout.target.type != "03"; }))) &&
                    (transaction.fees === 0 || transaction.fees === parseInt(config.minimumFee_V2));
                // fill the transaction info
                transaction.outs = outs;
                transaction.ins = ins;
                // assing transaction, deposits etc... to wrapper
                transactionData.transaction = transaction;
                transactionData.withdrawals = withdrawals;
                transactionData.deposits = deposits;
                if (rawMessage !== '') {
                    // decode message
                    try {
                        var message = this.decryptMessage(extraIndex, tx_pub_key, wallet.keys.priv.spend, rawMessage);
                        transaction.message = message;
                    }
                    catch (e) {
                        console.error('ERROR IN DECRYPTING MESSAGE: ', e);
                    }
                }
            }
            if (transaction && typeof ttl !== 'undefined') {
                transaction.ttl = ttl;
            }
            return transactionData;
        };
        TransactionsExplorer.formatWalletOutsForTx = function (wallet, blockchainHeight) {
            var allOuts = [];
            var unspentOuts = [];
            //rct=rct_outpk + rct_mask + rct_amount
            // {"amount"          , out.amount},
            // {"public_key"      , out.out_pub_key},
            // {"index"           , out.out_index},
            // {"global_index"    , out.global_index},
            // {"rct"             , rct},
            // {"tx_id"           , out.tx_id},
            // {"tx_hash"         , tx.hash},
            // {"tx_prefix_hash"  , tx.prefix_hash},
            // {"tx_pub_key"      , tx.tx_pub_key},
            // {"timestamp"       , static_cast<uint64_t>(out.timestamp)},
            // {"height"          , tx.height},
            // {"spend_key_images", json::array()}
            for (var _i = 0, _a = wallet.getAll(); _i < _a.length; _i++) {
                var tr = _a[_i];
                //todo improve to take into account miner tx ... well, if the user is smart enough to mine, he should be able to toggle the "Read miner tx" option in settings.
                //only add outs unlocked
                if (!tr.isConfirmed(blockchainHeight - 2)) { // -2 extra buffer
                    continue;
                }
                for (var _b = 0, _c = tr.outs; _b < _c.length; _b++) {
                    var out = _c[_b];
                    // Skip type "03" outputs (deposit outputs) for regular transactions
                    // These should only be used for withdrawals, not regular sends
                    if (out.type === "03") {
                        continue;
                    }
                    allOuts.push({
                        keyImage: out.keyImage,
                        amount: out.amount,
                        public_key: out.pubKey,
                        index: out.outputIdx,
                        global_index: out.globalIndex,
                        tx_pub_key: tr.txPubKey,
                        keys: []
                    });
                }
            }
            // Create a set of all key images that have been spent (used as inputs)
            var spentKeyImages = new Set();
            for (var _d = 0, _e = wallet.getAll().concat(wallet.txsMem); _d < _e.length; _d++) {
                var tr = _e[_d];
                for (var _f = 0, _g = tr.ins; _f < _g.length; _f++) {
                    var i = _g[_f];
                    if (i.keyImage) {
                        spentKeyImages.add(i.keyImage);
                    }
                }
            }
            // Filter out outputs that have already been spent
            unspentOuts = allOuts.filter(function (out) { return !spentKeyImages.has(out.keyImage); });
            return unspentOuts;
        };
        TransactionsExplorer.createRawTx = function (dsts, wallet, rct, usingOuts, pid_encrypt, mix_outs, mixin, neededFee, payment_id, message, ttl, transactionType, term) {
            if (mix_outs === void 0) { mix_outs = []; }
            return new Promise(function (resolve, reject) {
                var signed;
                try {
                    //need to get viewkey for encrypting here, because of splitting and sorting
                    var realDestViewKey = undefined;
                    if (pid_encrypt) {
                        realDestViewKey = Cn_1.Cn.decode_address(dsts[0].address).view;
                    }
                    // getting message destination address for encrypting here, before splitting and sorting
                    var messageTo = undefined;
                    if (message) {
                        messageTo = dsts[0].address;
                    }
                    //let splittedDsts = CnTransactions.decompose_tx_destinations(dsts, rct);
                    var splittedDsts = void 0;
                    if (transactionType === "deposit") {
                        // For deposit transactions, keep the first destination intact. At this stage, dsts[0].amount is the deposit amount. and will be type "03"
                        var depositDst = dsts[0];
                        var otherDsts = dsts.slice(1);
                        // Only decompose the non-deposit destinations, those destinations will be type "02"
                        var decomposedOtherDsts = Cn_1.CnTransactions.decompose_tx_destinations(otherDsts, rct);
                        // Combine back with the deposit destination first
                        splittedDsts = [depositDst].concat(decomposedOtherDsts); //then we could sort the splittedDsts by amount ?
                    }
                    else {
                        // Regular transaction - decompose all destinations
                        splittedDsts = Cn_1.CnTransactions.decompose_tx_destinations(dsts, rct);
                    }
                    signed = Cn_1.CnTransactions.create_transaction({
                        spend: wallet.keys.pub.spend,
                        view: wallet.keys.pub.view
                    }, {
                        spend: wallet.keys.priv.spend,
                        view: wallet.keys.priv.view
                    }, splittedDsts, wallet.getPublicAddress(), usingOuts, mix_outs, mixin, neededFee, payment_id, pid_encrypt, realDestViewKey, 0, rct, message, messageTo, ttl, transactionType, term);
                    logDebugMsg("signed tx: ", signed);
                    //console.log('Pre-serialization transaction:', JSON.stringify(signed, null, 2));
                    var raw_tx_and_hash = Cn_1.CnTransactions.serialize_tx_with_hash(signed);
                    //console.log('Serialized transaction structure:', JSON.stringify(raw_tx_and_hash, null, 2));
                    resolve({ raw: raw_tx_and_hash, signed: signed });
                }
                catch (e) {
                    reject("Failed to create transaction: " + e);
                }
            });
        };
        TransactionsExplorer.createTx = function (userDestinations, userPaymentId, wallet, blockchainHeight, obtainMixOutsCallback, confirmCallback, mixin, message, ttl, transactionType, term) {
            if (userPaymentId === void 0) { userPaymentId = ''; }
            if (mixin === void 0) { mixin = config.defaultMixin; }
            if (message === void 0) { message = ''; }
            if (ttl === void 0) { ttl = 0; }
            if (transactionType === void 0) { transactionType = "regular"; }
            if (term === void 0) { term = 0; }
            return new Promise(function (resolve, reject) {
                var neededFee = new JSBigInt(window.config.coinFee);
                var pid_encrypt = false; //don't encrypt payment ID unless we find an integrated one
                var totalAmountWithoutFee = new JSBigInt(0);
                var paymentIdIncluded = 0;
                var paymentId = '';
                var dsts = [];
                for (var _i = 0, userDestinations_1 = userDestinations; _i < userDestinations_1.length; _i++) {
                    var dest = userDestinations_1[_i];
                    totalAmountWithoutFee = totalAmountWithoutFee.add(dest.amount);
                    var target = Cn_1.Cn.decode_address(dest.address);
                    if (target.intPaymentId !== null) {
                        ++paymentIdIncluded;
                        paymentId = target.intPaymentId;
                        pid_encrypt = true;
                    }
                    dsts.push({
                        address: dest.address,
                        amount: new JSBigInt(dest.amount)
                    });
                }
                if (paymentIdIncluded > 1) {
                    reject('multiple_payment_ids');
                    return;
                }
                if (paymentId !== '' && userPaymentId !== '') {
                    reject('address_payment_id_conflict_user_payment_id');
                    return;
                }
                if (totalAmountWithoutFee.compare(0) <= 0) {
                    reject('negative_amount');
                    return;
                }
                if (paymentId === '' && userPaymentId !== '') {
                    if (userPaymentId.length <= 16 && /^[0-9a-fA-F]+$/.test(userPaymentId)) {
                        userPaymentId = ('0000000000000000' + userPaymentId).slice(-16);
                    }
                    // now double check if ok
                    if ((userPaymentId.length !== 16 && userPaymentId.length !== 64) ||
                        (!(/^[0-9a-fA-F]{16}$/.test(userPaymentId)) && !(/^[0-9a-fA-F]{64}$/.test(userPaymentId)))) {
                        reject('invalid_payment_id');
                        return;
                    }
                    pid_encrypt = userPaymentId.length === 16;
                    paymentId = userPaymentId;
                }
                var unspentOuts = TransactionsExplorer.formatWalletOutsForTx(wallet, blockchainHeight);
                var usingOuts = [];
                var usingOuts_amount = new JSBigInt(0);
                var unusedOuts = unspentOuts.slice(0);
                var totalAmount = totalAmountWithoutFee.add(neededFee) /*.add(chargeAmount)*/;
                //selecting outputs to fit the desired amount (totalAmount);
                function pop_random_value(list) {
                    var idx = Math.floor(MathUtil_1.MathUtil.randomFloat() * list.length);
                    var val = list[idx];
                    list.splice(idx, 1);
                    return val;
                }
                while (usingOuts_amount.compare(totalAmount) < 0 && unusedOuts.length > 0) {
                    var out = pop_random_value(unusedOuts);
                    usingOuts.push(out);
                    usingOuts_amount = usingOuts_amount.add(out.amount);
                }
                logDebugMsg("Selected outs:", usingOuts);
                logDebugMsg('using amount of ' + usingOuts_amount + ' for sending ' + totalAmountWithoutFee + ' with fees of ' + (neededFee / Math.pow(10, config.coinUnitPlaces)) + ' CCX');
                confirmCallback(totalAmountWithoutFee, neededFee).then(function () {
                    if (usingOuts_amount.compare(totalAmount) < 0) {
                        logDebugMsg("Not enough spendable outputs / balance too low (have "
                            + Cn_1.Cn.formatMoneyFull(usingOuts_amount) + " but need "
                            + Cn_1.Cn.formatMoneyFull(totalAmount)
                            + " (estimated fee " + Cn_1.Cn.formatMoneyFull(neededFee) + " CCX included)");
                        // return;
                        reject({ error: 'balance_too_low' });
                        return;
                    }
                    else if (usingOuts_amount.compare(totalAmount) > 0) {
                        var changeAmount = usingOuts_amount.subtract(totalAmount);
                        if (ttl > 0) {
                            changeAmount = changeAmount.add(neededFee);
                        }
                        //add entire change for rct
                        logDebugMsg("1) Sending change of " + Cn_1.Cn.formatMoneySymbol(changeAmount)
                            + " to " + wallet.getPublicAddress());
                        dsts.push({
                            address: wallet.getPublicAddress(),
                            amount: changeAmount
                        });
                    }
                    /* Not applicable for CCX
           
                        else if (usingOuts_amount.compare(totalAmount) === 0) {
           
                      //create random destination to keep 2 outputs always in case of 0 change
           
                      let fakeAddress = Cn.create_address(CnRandom.random_scalar()).public_addr;
                      logDebugMsg("Sending 0 CCX to a fake address to keep tx uniform (no change exists): " + fakeAddress);
                      dsts.push({
                        address: fakeAddress,
                        amount: 0
                      });
                    }
                    */
                    logDebugMsg('destinations', dsts);
                    var amounts = [];
                    for (var l = 0; l < usingOuts.length; l++) {
                        amounts.push(usingOuts[l].amount);
                    }
                    var nbOutsNeeded = mixin + 1;
                    // Request nbOutsNeeded mixouts for each output (including duplicates)
                    var nbOutsRequested = nbOutsNeeded + 3; // Request 3 more to account for potentialduplicates
                    obtainMixOutsCallback(amounts, nbOutsRequested).then(function (lotsMixOuts) {
                        logDebugMsg('------------------------------mix_outs');
                        logDebugMsg('amounts', amounts);
                        logDebugMsg('lots_mix_outs', lotsMixOuts);
                        // 1. Check for duplicates and remove them
                        var removedDuplicateMixOuts = TransactionsExplorer.removeDuplicateMixOuts(lotsMixOuts);
                        // 2. Shuffle and select exactly nbOutsNeeded mixouts per amount
                        var selectedMixOuts = TransactionsExplorer.selectMixOuts(removedDuplicateMixOuts, usingOuts, nbOutsNeeded);
                        // 3. Validate that we have enough mixouts for each input
                        var validation = TransactionsExplorer.validateMixOutsForInputs(usingOuts, selectedMixOuts, mixin);
                        if (!validation.valid) {
                            reject(new Error(validation.reason));
                            return;
                        }
                        TransactionsExplorer.createRawTx(dsts, wallet, false, usingOuts, pid_encrypt, selectedMixOuts, mixin, neededFee, paymentId, message, ttl, transactionType, term).then(function (data) {
                            resolve(data);
                        }).catch(function (e) {
                            reject(e);
                        });
                    });
                });
            });
        };
        TransactionsExplorer.createWithdrawTx = function (deposit, wallet, blockchainHeight, obtainMixOutsCallback, confirmCallback, mixin, paymentId, message, ttl, transactionType, term) {
            if (mixin === void 0) { mixin = 0; }
            if (paymentId === void 0) { paymentId = ''; }
            if (message === void 0) { message = ''; }
            if (ttl === void 0) { ttl = 0; }
            if (transactionType === void 0) { transactionType = "withdraw"; }
            if (term === void 0) { term = 0; }
            return new Promise(function (resolve, reject) {
                var lockedAmount = deposit.amount;
                var totalInterest = deposit.interest;
                var totalAmount = lockedAmount + totalInterest;
                var pid_encrypt = false; // don't encrypt payment ID for withdrawals
                var paymentId = '';
                // Check if the deposit is unlocked
                if (deposit.unlockHeight > blockchainHeight) {
                    reject(new Error("Deposit is still locked"));
                    return;
                }
                logDebugMsg('Withdrawing deposit with amount', totalAmount);
                // For withdrawals, we want a small fee for the transaction
                var neededFee = new JSBigInt(config.depositSmallWithdrawFee);
                var totalAmountWithoutFee = new JSBigInt(totalAmount);
                if (lockedAmount < 1) {
                    reject(new Error('such a deposit cannot could not have been created'));
                    return;
                }
                confirmCallback(totalAmountWithoutFee.subtract(neededFee), neededFee).then(function () {
                    var usingOuts = [];
                    // Create the multisignature input for the deposit
                    var depositOutput = {
                        keyImage: '', // Not needed for deposit withdrawal
                        amount: deposit.amount,
                        public_key: deposit.keys[0], // to be corrected 
                        index: deposit.indexInVout,
                        global_index: deposit.globalOutputIndex,
                        tx_pub_key: deposit.txPubKey,
                        type: "input_to_deposit_key", // Specify this is a deposit key input
                        required_signatures: 1, // We know this is a single-signature deposit
                        keys: [deposit.keys[0]], // Add the single key from deposit
                    };
                    usingOuts.push(depositOutput);
                    var changeAmount = totalAmountWithoutFee.subtract(neededFee);
                    var dsts = [];
                    logDebugMsg("Sending withdrawn amount of " + Cn_1.Cn.formatMoneySymbol(changeAmount)
                        + " to " + wallet.getPublicAddress());
                    dsts.push({
                        address: wallet.getPublicAddress(),
                        amount: changeAmount
                    });
                    logDebugMsg('destinations', dsts);
                    var amounts = [];
                    for (var l = 0; l < usingOuts.length; l++) {
                        amounts.push(usingOuts[l].amount);
                    }
                    var nbOutsNeeded = mixin + 1;
                    obtainMixOutsCallback(amounts, nbOutsNeeded).then(function (lotsMixOuts) {
                        logDebugMsg('------------------------------mix_outs');
                        logDebugMsg('amounts', amounts);
                        logDebugMsg('lots_mix_outs', lotsMixOuts);
                        TransactionsExplorer.createRawTx(dsts, wallet, false, usingOuts, pid_encrypt, lotsMixOuts, mixin, neededFee, paymentId, message, ttl, "withdraw", deposit.term).then(function (data) {
                            resolve(data);
                        }).catch(function (e) {
                            reject(e);
                        });
                    }).catch(function (error) {
                        reject(error);
                    });
                }).catch(function (error) {
                    reject(error);
                });
            });
        };
        /**
         * Validates that we have enough valid decoys for each input
         * This ensures we have the required number of mixins (default 5) for each input
         */
        TransactionsExplorer.validateMixOutsForInputs = function (usingOuts, mixOuts, // Full mix_outs structure from daemon
        mixin) {
            // Check that we have one mixout group per output
            if (mixOuts.length !== usingOuts.length) {
                return {
                    valid: false,
                    reason: 'Wrong number of mixout groups provided'
                };
            }
            // Check each output has enough mixouts
            for (var i = 0; i < usingOuts.length; i++) {
                var out = usingOuts[i];
                var mixOutGroup = mixOuts[i];
                if (!mixOutGroup || mixOutGroup.amount !== out.amount) {
                    return {
                        valid: false,
                        reason: 'Mixout group mismatch'
                    };
                }
                var availableMixouts = mixOutGroup.outs.length;
                var requiredMixouts = mixin + 1;
                if (availableMixouts < requiredMixouts) {
                    return {
                        valid: false,
                        reason: 'Not enough mixouts available, try smaller amount'
                    };
                }
            }
            return {
                valid: true,
                reason: 'All outputs have sufficient mixouts'
            };
        };
        /**
         * Selects the required number of mixouts for each input from the daemon-provided mixouts
         * Shuffles the available mixouts for additional entropy before selection
         */
        TransactionsExplorer.selectMixOuts = function (mixOuts, usingOuts, nbOutsNeeded) {
            var _a;
            var selectedMixOuts = [];
            var usedGlobalIndices = new Set();
            // Process outputs in order, using the corresponding mixout group for each
            for (var i = 0; i < usingOuts.length; i++) {
                var out = usingOuts[i];
                var mixOutGroup = mixOuts[i]; // Use the mixout group at the same index
                if (mixOutGroup && mixOutGroup.amount === out.amount && mixOutGroup.outs.length > 0) {
                    // Filter out already used global indices to ensure uniqueness
                    var availableMixouts = mixOutGroup.outs.filter(function (mixout) { return !usedGlobalIndices.has(mixout.global_index); });
                    if (availableMixouts.length < nbOutsNeeded) {
                        console.log("Warning: Not enough unique mixouts for output ".concat(i, " (amount ").concat(out.amount, "). Need ").concat(nbOutsNeeded, ", have ").concat(availableMixouts.length));
                    }
                    // Shuffle the available mixouts for additional entropy
                    var shuffledMixouts = __spreadArray([], availableMixouts, true);
                    for (var j = shuffledMixouts.length - 1; j > 0; j--) {
                        var k = Math.floor(MathUtil_1.MathUtil.randomFloat() * (j + 1));
                        _a = [shuffledMixouts[k], shuffledMixouts[j]], shuffledMixouts[j] = _a[0], shuffledMixouts[k] = _a[1];
                    }
                    // Select the first nbOutsNeeded mixouts from the shuffled array
                    var selectedMixouts = shuffledMixouts.slice(0, nbOutsNeeded);
                    // Mark these global indices as used
                    for (var _i = 0, selectedMixouts_1 = selectedMixouts; _i < selectedMixouts_1.length; _i++) {
                        var mixout = selectedMixouts_1[_i];
                        usedGlobalIndices.add(mixout.global_index);
                    }
                    // Add to selected mixouts (one entry per output)
                    selectedMixOuts.push({
                        amount: out.amount,
                        outs: selectedMixouts
                    });
                }
                else {
                    console.error("Error: No valid mixout group found for output ".concat(i, " (amount ").concat(out.amount, ")"));
                }
            }
            return selectedMixOuts;
        };
        TransactionsExplorer.removeDuplicateMixOuts = function (mixOuts) {
            // First loop: remove duplicates within each object
            for (var i = 0; i < mixOuts.length; i++) {
                var group = mixOuts[i];
                var seenInThisGroup = new Set();
                var uniqueOuts = [];
                for (var _i = 0, _a = group.outs; _i < _a.length; _i++) {
                    var mixout = _a[_i];
                    if (!seenInThisGroup.has(mixout.global_index)) {
                        seenInThisGroup.add(mixout.global_index);
                        uniqueOuts.push(mixout);
                    }
                }
                mixOuts[i] = {
                    amount: group.amount,
                    outs: uniqueOuts
                };
            }
            // Second loop: if a global index appears in multiple objects, remove it from the object with more mixouts
            var globalIndexCounts = new Map();
            // Count which objects contain each global index
            for (var i = 0; i < mixOuts.length; i++) {
                for (var _b = 0, _c = mixOuts[i].outs; _b < _c.length; _b++) {
                    var mixout = _c[_b];
                    if (!globalIndexCounts.has(mixout.global_index)) {
                        globalIndexCounts.set(mixout.global_index, []);
                    }
                    globalIndexCounts.get(mixout.global_index).push(i);
                }
            }
            var _loop_1 = function (globalIndex, objectIndices) {
                if (objectIndices.length > 1) {
                    // Find the object with the most mixouts
                    var maxMixouts = 0;
                    var objectToRemoveFrom = objectIndices[0];
                    for (var _g = 0, objectIndices_1 = objectIndices; _g < objectIndices_1.length; _g++) {
                        var objectIndex = objectIndices_1[_g];
                        if (mixOuts[objectIndex].outs.length > maxMixouts) {
                            maxMixouts = mixOuts[objectIndex].outs.length;
                            objectToRemoveFrom = objectIndex;
                        }
                    }
                    // Remove this global index from the object with MORE mixouts
                    // This leaves the duplicate in the object with fewer mixouts
                    mixOuts[objectToRemoveFrom].outs = mixOuts[objectToRemoveFrom].outs.filter(function (mixout) { return mixout.global_index !== globalIndex; });
                }
            };
            // Remove duplicates across objects
            for (var _d = 0, _e = Array.from(globalIndexCounts.entries()); _d < _e.length; _d++) {
                var _f = _e[_d], globalIndex = _f[0], objectIndices = _f[1];
                _loop_1(globalIndex, objectIndices);
            }
            return mixOuts;
        };
        return TransactionsExplorer;
    }());
    exports.TransactionsExplorer = TransactionsExplorer;
});
