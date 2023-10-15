/*
 * Copyright (c) 2022, Conceal Devs
 * Copyright (c) 2022, Conceal Network
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
define(["require", "exports", "../model/KeysRepository", "../model/Wallet", "../providers/BlockchainExplorerProvider", "../model/Mnemonic", "../model/Translations", "../model/MnemonicLang", "../model/Cn", "../model/AppState", "../lib/numbersLab/DependencyInjector", "../model/TransactionsExplorer", "../model/WalletWatchdog"], function (require, exports, KeysRepository_1, Wallet_1, BlockchainExplorerProvider_1, Mnemonic_1, Translations_1, MnemonicLang_1, Cn_1, AppState_1, DependencyInjector_1, TransactionsExplorer_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Api = void 0;
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var Api = /** @class */ (function () {
        function Api() {
            this.mnemonicPhrase = "";
            this.importHeight = 0;
        }
        Api.prototype.importWalletFromKeys = function (publicAddress, viewOnly, privateViewKey, privateSpendKey, password) {
            var self = this;
            blockchainExplorer.getHeight().then(function (currentHeight) {
                var newWallet = new Wallet_1.Wallet();
                if (viewOnly) {
                    var decodedPublic = Cn_1.Cn.decode_address(publicAddress.trim());
                    newWallet.keys = {
                        priv: {
                            spend: '',
                            view: privateViewKey.trim()
                        },
                        pub: {
                            spend: decodedPublic.spend,
                            view: decodedPublic.view,
                        }
                    };
                }
                else {
                    //console.log(1);
                    var viewkey = privateViewKey.trim();
                    if (viewkey === '') {
                        viewkey = Cn_1.Cn.generate_keys(Cn_1.CnUtils.cn_fast_hash(privateSpendKey.trim())).sec;
                    }
                    //console.log(1, viewkey);
                    newWallet.keys = KeysRepository_1.KeysRepository.fromPriv(privateSpendKey.trim(), viewkey);
                    //console.log(1);
                }
                self.importHeightValidator();
                var height = self.importHeight; //never trust a perfect value from the user
                if (height >= currentHeight) {
                    height = currentHeight - 1;
                }
                height = height - 10;
                if (height < 0)
                    height = 0;
                if (height > currentHeight)
                    height = currentHeight;
                newWallet.lastHeight = height;
                newWallet.creationHeight = newWallet.lastHeight;
                AppState_1.AppState.openWallet(newWallet, password);
                return true;
            });
        };
        Api.prototype.importWalletFromMnemonic = function (mnemonicPhrase, language, password) {
            if (language === void 0) { language = "auto"; }
            var self = this;
            blockchainExplorer.getHeight().then(function (currentHeight) {
                var newWallet = new Wallet_1.Wallet();
                var mnemonic = mnemonicPhrase.trim();
                // let current_lang = 'english';
                var current_lang = 'english';
                if (language === 'auto') {
                    var detectedLang = Mnemonic_1.Mnemonic.detectLang(mnemonicPhrase.trim());
                    if (detectedLang !== null)
                        current_lang = detectedLang;
                }
                else
                    current_lang = language;
                var mnemonic_decoded = Mnemonic_1.Mnemonic.mn_decode(mnemonic, current_lang);
                if (mnemonic_decoded !== null) {
                    var keys = Cn_1.Cn.create_address(mnemonic_decoded);
                    var newWallet_1 = new Wallet_1.Wallet();
                    newWallet_1.keys = KeysRepository_1.KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);
                    var height = self.importHeight - 10;
                    if (height < 0)
                        height = 0;
                    if (height > currentHeight)
                        height = currentHeight;
                    newWallet_1.lastHeight = height;
                    newWallet_1.creationHeight = newWallet_1.lastHeight;
                    AppState_1.AppState.openWallet(newWallet_1, password);
                    return true;
                }
                else {
                    console.log("Invalid phrase");
                    return false;
                }
            });
        };
        Api.prototype.generateWallet = function (walletPassword) {
            var self = this;
            setTimeout(function () {
                blockchainExplorer.getHeight().then(function (currentHeight) {
                    var seed = Cn_1.CnNativeBride.sc_reduce32(Cn_1.CnRandom.rand_32());
                    var keys = Cn_1.Cn.create_address(seed);
                    var newWallet = new Wallet_1.Wallet();
                    newWallet.keys = KeysRepository_1.KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);
                    var height = currentHeight - 10;
                    if (height < 0)
                        height = 0;
                    newWallet.lastHeight = height;
                    newWallet.creationHeight = height;
                    Translations_1.Translations.getLang().then(function (userLang) {
                        var langToExport = 'english';
                        for (var _i = 0, _a = MnemonicLang_1.MnemonicLang.getLangs(); _i < _a.length; _i++) {
                            var lang = _a[_i];
                            if (lang.shortLang === userLang) {
                                langToExport = lang.name;
                                break;
                            }
                        }
                        var phrase = Mnemonic_1.Mnemonic.mn_encode(newWallet.keys.priv.spend, langToExport);
                        if (phrase !== null)
                            self.mnemonicPhrase = phrase;
                    });
                    AppState_1.AppState.openWallet(newWallet, walletPassword);
                });
            }, 0);
            return true;
        };
        Api.prototype.getMnemonicOfNewWallet = function () {
            return this.mnemonicPhrase;
        };
        // Maybe pass wallet as a pararm? To be define later after testing
        //	send(wallet: Wallet, amountToSend: string, destinationAddress: string, paymentId: string) {
        Api.prototype.send = function (amountToSend, destinationAddress, paymentId) {
            var self = this;
            var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
            blockchainExplorer.getHeight().then(function (blockchainHeight) {
                var amount = parseFloat(amountToSend);
                if (destinationAddress !== null) {
                    //todo use BigInteger
                    if (amount * Math.pow(10, config.coinUnitPlaces) > wallet.unlockedAmount(blockchainHeight)) {
                        console.log("Amount higher than the funds");
                        return;
                    }
                    //TODO use biginteger
                    var amountToSend_1 = amount * Math.pow(10, config.coinUnitPlaces);
                    var mixinToSendWith = config.defaultMixin;
                    TransactionsExplorer_1.TransactionsExplorer.createTx([{ address: destinationAddress, amount: amountToSend_1 }], paymentId, wallet, blockchainHeight, function (amounts, numberOuts) {
                        return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                    }, function (amount, feesAmount) {
                        if (amount + feesAmount > wallet.unlockedAmount(blockchainHeight)) {
                            console.log("Amount higher than the funds");
                            throw 'Amount higher than the funds';
                        }
                        return new Promise(function (resolve, reject) {
                        });
                    }, mixinToSendWith).then(function (rawTxData) {
                        blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
                            //save the tx private key
                            wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);
                            //force a mempool check so the user is up to date
                            var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                            if (watchdog !== null)
                                watchdog.checkMempool();
                        }).catch(function (data) {
                            console.log("Generic error while sending funds: ", data);
                        });
                    }).catch(function (error) {
                        //console.log(error);
                        if (error && error !== '') {
                            if (typeof error === 'string')
                                console.log("Generic error while sending funds: ", error);
                            else
                                console.log("Generic error while sending funds: ", JSON.stringify(error));
                        }
                    });
                }
                else {
                    console.log("Invalid amount");
                }
            });
        };
        Api.prototype.refresh = function (callback) {
            var self = this;
            blockchainExplorer.getHeight().then(function (height) {
                callback(height);
            });
        };
        Api.prototype.getTxDetails = function (transaction) {
            var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
            var explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
            var explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
            var fees = 0;
            if (transaction.getAmount() < 0)
                fees = (transaction.fees / Math.pow(10, config.coinUnitPlaces));
            var paymentId = '';
            if (transaction.paymentId !== '') {
                paymentId = transaction.paymentId;
            }
            var txPrivKeyMessage = '';
            var txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
            if (txPrivKey !== null) {
                txPrivKeyMessage = txPrivKey;
            }
            return {
                fees: fees,
                paymentId: paymentId,
                txPrivKeyMessage: txPrivKeyMessage,
                txUrl: explorerUrlHash.replace('{ID}', transaction.hash),
                blockUrl: explorerUrlBlock.replace('{ID}', '' + transaction.blockHeight)
            };
        };
        Api.prototype.getTransactions = function () {
            var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
            return wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());
        };
        Api.prototype.importHeightValidator = function () {
            if (this.importHeight === '')
                this.importHeight = 0;
            if (this.importHeight < 0) {
                this.importHeight = 0;
            }
            this.importHeight = parseInt('' + this.importHeight);
        };
        return Api;
    }());
    exports.Api = Api;
});
