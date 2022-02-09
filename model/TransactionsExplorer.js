/**
 *	   Copyright (c) 2018, Gnock
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Masari Project
 *     Copyright (c) 2014-2018, MyMonero.com
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
define(["require", "exports", "./Transaction", "./MathUtil", "./Cn"], function (require, exports, Transaction_1, MathUtil_1, Cn_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TransactionsExplorer = exports.TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID = exports.TX_EXTRA_NONCE_PAYMENT_ID = exports.TX_EXTRA_MYSTERIOUS_MINERGATE_TAG = exports.TX_EXTRA_TAG_ADDITIONAL_PUBKEYS = exports.TX_EXTRA_MERGE_MINING_TAG = exports.TX_EXTRA_NONCE = exports.TX_EXTRA_TAG_PUBKEY = exports.TX_EXTRA_TAG_PADDING = exports.TX_EXTRA_NONCE_MAX_COUNT = exports.TX_EXTRA_PADDING_MAX_COUNT = void 0;
    var hextobin = Cn_1.CnUtils.hextobin;
    exports.TX_EXTRA_PADDING_MAX_COUNT = 255;
    exports.TX_EXTRA_NONCE_MAX_COUNT = 255;
    exports.TX_EXTRA_TAG_PADDING = 0x00;
    exports.TX_EXTRA_TAG_PUBKEY = 0x01;
    exports.TX_EXTRA_NONCE = 0x02;
    exports.TX_EXTRA_MERGE_MINING_TAG = 0x03;
    exports.TX_EXTRA_TAG_ADDITIONAL_PUBKEYS = 0x04;
    exports.TX_EXTRA_MYSTERIOUS_MINERGATE_TAG = 0xDE;
    exports.TX_EXTRA_NONCE_PAYMENT_ID = 0x00;
    exports.TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID = 0x01;
    var TransactionsExplorer = /** @class */ (function () {
        function TransactionsExplorer() {
        }
        TransactionsExplorer.parseExtra = function (oExtra) {
            var extra = oExtra.slice();
            var extras = [];
            var hasFoundPubKey = false;
            while (extra.length > 0) {
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
                else if (extra[0] === exports.TX_EXTRA_TAG_ADDITIONAL_PUBKEYS) {
                    extraSize = extra[1] * 32;
                    startOffset = 2;
                }
                else if (extra[0] === exports.TX_EXTRA_TAG_PADDING) {
                    // this tag has to be the last in extra
                    // we do nothing with it
                    /*
    
                    let iExtra = 2;
                    let fExtras = {
                        type: extra[0],
                        data: [extra[1]]
                    };
    
                    while (extra.length > iExtra && extra[iExtra++] == 0) {
                        fExtras.data.push(0);
                    }
    
                    continue;
                    */
                }
                if (extraSize === 0) {
                    if (!hasFoundPubKey) {
                        throw 'Invalid extra size' + extra[0];
                    }
                    break;
                }
                var data = extra.slice(startOffset, startOffset + extraSize);
                extras.push({
                    type: extra[0],
                    data: data
                });
                extra = extra.slice(startOffset + extraSize);
            }
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
        TransactionsExplorer.parse = function (rawTransaction, wallet) {
            var transaction = null;
            var tx_pub_key = '';
            var paymentId = null;
            var txExtras = [];
            try {
                var hexExtra = [];
                var uint8Array = hextobin(rawTransaction.extra);
                for (var i = 0; i < uint8Array.byteLength; i++) {
                    hexExtra[i] = uint8Array[i];
                }
                txExtras = this.parseExtra(hexExtra);
            }
            catch (e) {
                console.error(e);
                console.log('Error when scanning transaction on block ' + rawTransaction.height, rawTransaction);
                return null;
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
                console.log("tx_pub_key === null");
                return null;
            }
            tx_pub_key = Cn_1.CnUtils.bintohex(tx_pub_key);
            var encryptedPaymentId = null;
            for (var _a = 0, txExtras_2 = txExtras; _a < txExtras_2.length; _a++) {
                var extra = txExtras_2[_a];
                if (extra.type === exports.TX_EXTRA_NONCE) {
                    if (extra.data[0] === exports.TX_EXTRA_NONCE_PAYMENT_ID) {
                        paymentId = '';
                        for (var i = 1; i < extra.data.length; ++i) {
                            paymentId += String.fromCharCode(extra.data[i]);
                        }
                        paymentId = Cn_1.CnUtils.bintohex(paymentId);
                        break;
                    }
                    else if (extra.data[0] === exports.TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID) {
                        encryptedPaymentId = '';
                        for (var i = 1; i < extra.data.length; ++i) {
                            encryptedPaymentId += String.fromCharCode(extra.data[i]);
                        }
                        encryptedPaymentId = Cn_1.CnUtils.bintohex(encryptedPaymentId);
                        break;
                    }
                }
            }
            var derivation = null;
            try {
                derivation = Cn_1.CnNativeBride.generate_key_derivation(tx_pub_key, wallet.keys.priv.view);
            }
            catch (e) {
                console.log('UNABLE TO CREATE DERIVATION', e);
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
                var mine_output = (txout_k.key == generated_tx_pubkey);
                if (mine_output) {
                    var transactionOut = new Transaction_1.TransactionOut();
                    if (typeof rawTransaction.global_index_start !== 'undefined')
                        transactionOut.globalIndex = rawTransaction.output_indexes[output_idx_in_tx];
                    else
                        transactionOut.globalIndex = output_idx_in_tx;
                    transactionOut.amount = amount;
                    transactionOut.pubKey = txout_k.key;
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
                    //if (minerTx)
                    //    break;
                } //  if (mine_output)
            }
            //check if no read only wallet
            if (wallet.keys.priv.spend !== null && wallet.keys.priv.spend !== '') {
                var keyImages = wallet.getTransactionKeyImages();
                for (var iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
                    var vin = rawTransaction.vin[iIn];
                    if (vin.value && keyImages.indexOf(vin.value.k_image) !== -1) {
                        //console.log('found in', vin);
                        var walletOuts = wallet.getAllOuts();
                        for (var _b = 0, walletOuts_1 = walletOuts; _b < walletOuts_1.length; _b++) {
                            var ut = walletOuts_1[_b];
                            if (ut.keyImage == vin.value.k_image) {
                                // ins.push(vin.key.k_image);
                                // sumIns += ut.amount;
                                var transactionIn = new Transaction_1.TransactionIn();
                                transactionIn.amount = ut.amount;
                                transactionIn.keyImage = ut.keyImage;
                                ins.push(transactionIn);
                                // console.log(ut);
                                break;
                            }
                        }
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
                    for (var _c = 0, absoluteOffets_1 = absoluteOffets; _c < absoluteOffets_1.length; _c++) {
                        var index = absoluteOffets_1[_c];
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
                            ins.push(transactionIn);
                        }
                    }
                }
            }
            if (outs.length > 0 || ins.length) {
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
                transaction.outs = outs;
                transaction.ins = ins;
            }
            return transaction;
        };
        TransactionsExplorer.formatWalletOutsForTx = function (wallet, blockchainHeight) {
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
                //todo improve to take into account miner tx
                //only add outs unlocked
                if (!tr.isConfirmed(blockchainHeight)) {
                    continue;
                }
                for (var _b = 0, _c = tr.outs; _b < _c.length; _b++) {
                    var out = _c[_b];
                    var rct = '';
                    if (out.rtcAmount !== '') {
                        rct = out.rtcOutPk + out.rtcMask + out.rtcAmount;
                    }
                    else {
                        rct = Cn_1.CnTransactions.zeroCommit(Cn_1.CnUtils.d2s(out.amount));
                    }
                    unspentOuts.push({
                        keyImage: out.keyImage,
                        amount: out.amount,
                        public_key: out.pubKey,
                        index: out.outputIdx,
                        global_index: out.globalIndex,
                        tx_pub_key: tr.txPubKey
                    });
                }
            }
            //console.log('outs count before spend:', unspentOuts.length, unspentOuts);
            for (var _d = 0, _e = wallet.getAll().concat(wallet.txsMem); _d < _e.length; _d++) {
                var tr = _e[_d];
                //console.log(tr.ins);
                for (var _f = 0, _g = tr.ins; _f < _g.length; _f++) {
                    var i = _g[_f];
                    for (var iOut = 0; iOut < unspentOuts.length; ++iOut) {
                        var out = unspentOuts[iOut];
                        var exist = out.keyImage === i.keyImage;
                        if (exist) {
                            unspentOuts.splice(iOut, 1);
                            break;
                        }
                    }
                }
            }
            return unspentOuts;
        };
        TransactionsExplorer.createRawTx = function (dsts, wallet, rct, usingOuts, pid_encrypt, mix_outs, mixin, neededFee, payment_id) {
            if (mix_outs === void 0) { mix_outs = []; }
            return new Promise(function (resolve, reject) {
                var signed;
                try {
                    //console.log('Destinations: ');
                    //need to get viewkey for encrypting here, because of splitting and sorting
                    var realDestViewKey = undefined;
                    if (pid_encrypt) {
                        realDestViewKey = Cn_1.Cn.decode_address(dsts[0].address).view;
                    }
                    var splittedDsts = Cn_1.CnTransactions.decompose_tx_destinations(dsts, rct);
                    signed = Cn_1.CnTransactions.create_transaction({
                        spend: wallet.keys.pub.spend,
                        view: wallet.keys.pub.view
                    }, {
                        spend: wallet.keys.priv.spend,
                        view: wallet.keys.priv.view
                    }, splittedDsts, usingOuts, mix_outs, mixin, neededFee, payment_id, pid_encrypt, realDestViewKey, 0, rct);
                    console.log("signed tx: ", signed);
                    var raw_tx_and_hash = Cn_1.CnTransactions.serialize_tx_with_hash(signed);
                    resolve({ raw: raw_tx_and_hash, signed: signed });
                }
                catch (e) {
                    reject("Failed to create transaction: " + e);
                }
            });
        };
        TransactionsExplorer.createTx = function (userDestinations, userPaymentId, wallet, blockchainHeight, obtainMixOutsCallback, confirmCallback, mixin) {
            if (userPaymentId === void 0) { userPaymentId = ''; }
            if (mixin === void 0) { mixin = config.defaultMixin; }
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
                //console.log('outs available:', unspentOuts.length, unspentOuts);
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
                    //console.log("Using output: " + out.amount + " - " + JSON.stringify(out));
                }
                var calculateFeeWithBytes = function (fee_per_kb, bytes, fee_multiplier) {
                    var kB = (bytes + 1023) / 1024;
                    return kB * fee_per_kb * fee_multiplier;
                };
                console.log("Selected outs:", usingOuts);
                //if (neededFee < 10000000) {
                //	neededFee = 10000000;
                //}
                console.log('using amount of ' + usingOuts_amount + ' for sending ' + totalAmountWithoutFee + ' with fees of ' + (neededFee / Math.pow(10, config.coinUnitPlaces)) + ' QWC');
                confirmCallback(totalAmountWithoutFee, neededFee).then(function () {
                    if (usingOuts_amount.compare(totalAmount) < 0) {
                        console.log("Not enough spendable outputs / balance too low (have "
                            + Cn_1.Cn.formatMoneyFull(usingOuts_amount) + " but need "
                            + Cn_1.Cn.formatMoneyFull(totalAmount)
                            + " (estimated fee " + Cn_1.Cn.formatMoneyFull(neededFee) + " QWC included)");
                        // return;
                        reject({ error: 'balance_too_low' });
                        return;
                    }
                    else if (usingOuts_amount.compare(totalAmount) > 0) {
                        var changeAmount = usingOuts_amount.subtract(totalAmount);
                        //add entire change for rct
                        console.log("1) Sending change of " + Cn_1.Cn.formatMoneySymbol(changeAmount)
                            + " to " /*+ AccountService.getAddress()*/);
                        dsts.push({
                            address: wallet.getPublicAddress(),
                            amount: changeAmount
                        });
                    }
                    else if (usingOuts_amount.compare(totalAmount) === 0) {
                        //create random destination to keep 2 outputs always in case of 0 change
                        var fakeAddress = Cn_1.Cn.create_address(Cn_1.CnRandom.random_scalar()).public_addr;
                        console.log("Sending 0 QWC to a fake address to keep tx uniform (no change exists): " + fakeAddress);
                        dsts.push({
                            address: fakeAddress,
                            amount: 0
                        });
                    }
                    console.log('destinations', dsts);
                    var amounts = [];
                    for (var l = 0; l < usingOuts.length; l++) {
                        amounts.push(usingOuts[l].amount.toString());
                    }
                    obtainMixOutsCallback(amounts.length * (mixin + 1)).then(function (lotsMixOuts) {
                        console.log('------------------------------mix_outs', lotsMixOuts);
                        console.log('amounts', amounts);
                        console.log('lots_mix_outs', lotsMixOuts);
                        var mix_outs = [];
                        var iMixOutsIndexes = 0;
                        for (var _i = 0, amounts_1 = amounts; _i < amounts_1.length; _i++) {
                            var amount = amounts_1[_i];
                            var localMixOuts = [];
                            for (var i = 0; i < mixin + 1; ++i) {
                                localMixOuts.push(lotsMixOuts[iMixOutsIndexes]);
                                ++iMixOutsIndexes;
                            }
                            localMixOuts.sort().reverse();
                            mix_outs.push({
                                outputs: localMixOuts.slice(),
                                amount: 0
                            });
                        }
                        console.log('mix_outs', mix_outs);
                        TransactionsExplorer.createRawTx(dsts, wallet, false, usingOuts, pid_encrypt, mix_outs, mixin, neededFee, paymentId).then(function (data) {
                            resolve(data);
                        }).catch(function (e) {
                            reject(e);
                        });
                    });
                    //https://github.com/moneroexamples/openmonero/blob/ebf282faa8d385ef3cf97e6561bd1136c01cf210/README.md
                    //https://github.com/moneroexamples/openmonero/blob/95bc207e1dd3881ba0795c02c06493861de8c705/src/YourMoneroRequests.cpp
                });
            });
        };
        return TransactionsExplorer;
    }());
    exports.TransactionsExplorer = TransactionsExplorer;
});
