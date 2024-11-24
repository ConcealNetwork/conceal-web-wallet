/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2024 Conceal Community, Conceal.Network & Conceal Devs
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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoinUri = void 0;
    var CoinUri = /** @class */ (function () {
        function CoinUri() {
        }
        CoinUri.decodeTx = function (str) {
            if (str.startsWith(CoinUri.coinAddressPrefix)) { // legacy code use to check .coinTxPrefix
                var data = str; //legacy .replace(this.coinTxPrefix,'');
                var temp = data.replace(/&/g, '?').trim();
                var exploded = temp.split('?');
                if (exploded.length == 0)
                    throw 'missing_address';
                if (exploded[0].length !== this.coinAddressLength)
                    throw 'invalid_address_length';
                var decodedUri = {
                    address: exploded[0]
                };
                for (var i = 0; i < exploded.length; ++i) {
                    var optionParts = exploded[i].split('=');
                    if (optionParts.length === 2) {
                        switch (optionParts[0].trim()) {
                            case 'payment_id':
                                decodedUri.paymentId = optionParts[1];
                                break;
                            case 'tx_payment_id':
                                decodedUri.paymentId = optionParts[1];
                                break;
                            case 'recipient_name':
                                decodedUri.recipientName = optionParts[1];
                                break;
                            case 'amount':
                                decodedUri.amount = optionParts[1];
                                break;
                            case 'tx_amount':
                                decodedUri.amount = optionParts[1];
                                break;
                            case 'tx_description':
                                decodedUri.description = optionParts[1];
                                break;
                            case 'label':
                                decodedUri.description = optionParts[1];
                                break;
                        }
                    }
                }
                return decodedUri;
            }
            throw 'missing_prefix';
        };
        CoinUri.isTxValid = function (str) {
            try {
                this.decodeTx(str);
                return true;
            }
            catch (e) {
                return false;
            }
        };
        CoinUri.encodeTx = function (address, paymentId, amount, recipientName, description) {
            if (paymentId === void 0) { paymentId = null; }
            if (amount === void 0) { amount = null; }
            if (recipientName === void 0) { recipientName = null; }
            if (description === void 0) { description = null; }
            var encoded = address; //legacy this.coinTxPrefix + address;
            if (address.length !== this.coinAddressLength)
                throw 'invalid_address_length';
            if (paymentId !== null)
                encoded += '?payment_id=' + paymentId;
            if (amount !== null)
                encoded += '?amount=' + amount;
            if (recipientName !== null)
                encoded += '?recipient_name=' + recipientName;
            if (description !== null)
                encoded += '?label=' + description;
            return encoded;
        };
        CoinUri.decodeWallet = function (str) {
            if (str.startsWith(CoinUri.coinWalletPrefix)) {
                var data = str.replace(this.coinWalletPrefix, '').trim();
                var exploded = data.split('?');
                if (exploded.length == 0)
                    throw 'missing_address';
                if (exploded[0].length !== this.coinAddressLength)
                    throw 'invalid_address_length';
                var decodedUri = {
                    address: exploded[0]
                };
                for (var i = 1; i < exploded.length; ++i) {
                    var optionParts = exploded[i].split('=');
                    if (optionParts.length === 2) {
                        switch (optionParts[0].trim()) {
                            case 'spend_key':
                                decodedUri.spendKey = optionParts[1];
                                break;
                            case 'view_key':
                                decodedUri.viewKey = optionParts[1];
                                break;
                            case 'mnemonic_seed':
                                decodedUri.mnemonicSeed = optionParts[1];
                                break;
                            case 'height':
                                decodedUri.height = optionParts[1];
                                break;
                            case 'nonce':
                                decodedUri.nonce = optionParts[1];
                                break;
                            case 'encrypt_method':
                                decodedUri.encryptMethod = optionParts[1];
                                break;
                        }
                    }
                }
                if (typeof decodedUri.mnemonicSeed !== 'undefined' ||
                    typeof decodedUri.spendKey !== 'undefined' ||
                    (typeof decodedUri.viewKey !== 'undefined' && typeof decodedUri.address !== 'undefined')) {
                    return decodedUri;
                }
                else
                    throw 'missing_seeds';
            }
            throw 'missing_prefix';
        };
        CoinUri.isWalletValid = function (str) {
            try {
                this.decodeWallet(str);
                return true;
            }
            catch (e) {
                return false;
            }
        };
        CoinUri.encodeWalletKeys = function (address, spendKey, viewKey, height, encryptMethod, nonce) {
            if (viewKey === void 0) { viewKey = null; }
            if (height === void 0) { height = null; }
            if (encryptMethod === void 0) { encryptMethod = null; }
            if (nonce === void 0) { nonce = null; }
            var encoded = this.coinWalletPrefix + address;
            if (address.length !== this.coinAddressLength)
                throw 'invalid_address_length';
            if (spendKey !== null)
                encoded += '?spend_key=' + spendKey;
            if (viewKey !== null)
                encoded += '?view_key=' + viewKey;
            if (height !== null)
                encoded += '?height=' + height;
            if (nonce !== null)
                encoded += '?nonce=' + nonce;
            if (encryptMethod !== null)
                encoded += '?encrypt_method=' + encryptMethod;
            return encoded;
        };
        CoinUri.coinTxPrefix = 'conceal.'; //legacy, used to be 'conceal:', but the char ':' was creating scanning issue
        CoinUri.coinAddressPrefix = 'ccx7'; //coin Address prefix, to check address , without using coinTxPrefix
        CoinUri.coinWalletPrefix = 'conceal.'; //legacy, used to be 'conceal:'
        CoinUri.coinAddressLength = 98;
        return CoinUri;
    }());
    exports.CoinUri = CoinUri;
});
