/*
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/TransactionsExplorer", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../model/CoinUri", "../model/QRReader", "../model/AppState", "../providers/BlockchainExplorerProvider", "../model/Nfc", "../model/Cn", "../model/WalletWatchdog"], function (require, exports, DestructableView_1, VueAnnotate_1, TransactionsExplorer_1, DependencyInjector_1, Wallet_1, CoinUri_1, QRReader_1, AppState_1, BlockchainExplorerProvider_1, Nfc_1, Cn_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var MessagesView = /** @class */ (function (_super) {
        __extends(MessagesView, _super);
        function MessagesView(container) {
            var _this = _super.call(this, container) || this;
            _this.refreshInterval = 500;
            _this.qrReader = null;
            _this.timeoutResolveAlias = 0;
            _this.redirectUrlAfterSend = null;
            _this.ndefListener = null;
            _this.destruct = function () {
                clearInterval(_this.intervalRefresh);
                return _super.prototype.destruct.call(_this);
            };
            _this.refresh = function () {
                blockchainExplorer.getHeight().then(function (height) {
                    _this.isWalletSyncing = (wallet.lastHeight + 2) < height;
                    _this.blockchainHeight = height;
                    _this.refreshWallet();
                }).catch(function (err) {
                    _this.refreshWallet();
                });
            };
            _this.refreshWallet = function (forceRedraw) {
                if (forceRedraw === void 0) { forceRedraw = false; }
                var allTransactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());
                _this.transactions = allTransactions.filter(function (tx) {
                    return tx.message;
                });
            };
            _this.send = function () {
                var self = _this;
                blockchainExplorer.getHeight().then(function (blockchainHeight) {
                    var amount = 0.0001;
                    if (self.destinationAddress !== null) {
                        var destinationAddress = self.destinationAddress;
                        var amountToSend = config.messageTxAmount;
                        swal({
                            title: i18n.t('sendPage.creatingTransferModal.title'),
                            html: i18n.t('sendPage.creatingTransferModal.content'),
                            onOpen: function () {
                                swal.showLoading();
                            }
                        });
                        var mixinToSendWith = config.defaultMixin;
                        TransactionsExplorer_1.TransactionsExplorer.createTx([{ address: destinationAddress, amount: amountToSend }], '', wallet, blockchainHeight, function (amounts, numberOuts) {
                            return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                        }, function (amount, feesAmount) {
                            if (amount + feesAmount > wallet.unlockedAmount(blockchainHeight)) {
                                swal({
                                    type: 'error',
                                    title: i18n.t('sendPage.notEnoughMoneyModal.title'),
                                    text: i18n.t('sendPage.notEnoughMoneyModal.content'),
                                    confirmButtonText: i18n.t('sendPage.notEnoughMoneyModal.confirmText'),
                                    onOpen: function () {
                                        swal.hideLoading();
                                    }
                                });
                                throw '';
                            }
                            return new Promise(function (resolve, reject) {
                                setTimeout(function () {
                                    swal({
                                        title: i18n.t('sendPage.confirmTransactionModal.title'),
                                        html: i18n.t('sendPage.confirmTransactionModal.content', {
                                            amount: amount / Math.pow(10, config.coinUnitPlaces),
                                            fees: feesAmount / Math.pow(10, config.coinUnitPlaces),
                                            total: (amount + feesAmount) / Math.pow(10, config.coinUnitPlaces),
                                        }),
                                        showCancelButton: true,
                                        confirmButtonText: i18n.t('sendPage.confirmTransactionModal.confirmText'),
                                        cancelButtonText: i18n.t('sendPage.confirmTransactionModal.cancelText'),
                                    }).then(function (result) {
                                        if (result.dismiss) {
                                            reject('');
                                        }
                                        else {
                                            swal({
                                                title: i18n.t('sendPage.finalizingTransferModal.title'),
                                                html: i18n.t('sendPage.finalizingTransferModal.content'),
                                                onOpen: function () {
                                                    swal.showLoading();
                                                }
                                            });
                                            resolve();
                                        }
                                    }).catch(reject);
                                }, 1);
                            });
                        }, mixinToSendWith, self.message, 0).then(function (rawTxData) {
                            blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
                                //save the tx private key
                                wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);
                                //force a mempool check so the user is up to date
                                var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                                if (watchdog !== null)
                                    watchdog.checkMempool();
                                var promise = Promise.resolve();
                                promise = swal({
                                    type: 'success',
                                    title: i18n.t('sendPage.transferSentModal.title'),
                                    confirmButtonText: i18n.t('sendPage.transferSentModal.confirmText'),
                                    onClose: function () {
                                        window.location.href = '#!account';
                                    }
                                });
                                promise.then(function () {
                                    if (self.redirectUrlAfterSend !== null) {
                                        window.location.href = self.redirectUrlAfterSend.replace('{TX_HASH}', rawTxData.raw.hash);
                                    }
                                });
                            }).catch(function (data) {
                                swal({
                                    type: 'error',
                                    title: i18n.t('sendPage.transferExceptionModal.title'),
                                    html: i18n.t('sendPage.transferExceptionModal.content', { details: JSON.stringify(data) }),
                                    confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                                });
                            });
                            swal.close();
                        }).catch(function (error) {
                            //console.log(error);
                            if (error && error !== '') {
                                if (typeof error === 'string')
                                    swal({
                                        type: 'error',
                                        title: i18n.t('sendPage.transferExceptionModal.title'),
                                        html: i18n.t('sendPage.transferExceptionModal.content', { details: error }),
                                        confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                                    });
                                else
                                    swal({
                                        type: 'error',
                                        title: i18n.t('sendPage.transferExceptionModal.title'),
                                        html: i18n.t('sendPage.transferExceptionModal.content', { details: JSON.stringify(error) }),
                                        confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                                    });
                            }
                        });
                    }
                    else {
                        swal({
                            type: 'error',
                            title: i18n.t('sendPage.invalidAmountModal.title'),
                            html: i18n.t('sendPage.invalidAmountModal.content'),
                            confirmButtonText: i18n.t('sendPage.invalidAmountModal.confirmText'),
                        });
                    }
                }).catch(function (err) {
                    console.error("Error trying to send funds", err);
                });
            };
            _this.maxMessageSize = config.maxMessageSize;
            _this.isWalletSyncing = true;
            AppState_1.AppState.enableLeftMenu();
            _this.nfcAvailable = _this.nfc.has;
            _this.intervalRefresh = setInterval(function () {
                _this.refresh();
            }, 3 * 1000);
            _this.refresh();
            return _this;
        }
        MessagesView.prototype.reset = function () {
            this.lockedForm = false;
            this.destinationAddressUser = '';
            this.destinationAddress = '';
            this.destinationAddressValid = false;
            this.openAliasValid = false;
            this.qrScanning = false;
            this.domainAliasAddress = null;
            this.txDestinationName = null;
            this.txDescription = null;
            this.stopScan();
        };
        MessagesView.prototype.startNfcScan = function () {
            var _this = this;
            var self = this;
            if (this.ndefListener === null) {
                this.ndefListener = function (data) {
                    if (data.text)
                        self.handleScanResult(data.text.content);
                    swal.close();
                };
                this.nfc.listenNdef(this.ndefListener);
                swal({
                    title: i18n.t('sendPage.waitingNfcModal.title'),
                    html: i18n.t('sendPage.waitingNfcModal.content'),
                    onOpen: function () {
                        swal.showLoading();
                    },
                    onClose: function () {
                        _this.stopNfcScan();
                    }
                }).then(function (result) {
                    // do nothing
                });
            }
        };
        MessagesView.prototype.stopNfcScan = function () {
            if (this.ndefListener !== null)
                this.nfc.removeNdef(this.ndefListener);
            this.ndefListener = null;
        };
        MessagesView.prototype.initQr = function () {
            this.stopScan();
            this.qrReader = new QRReader_1.QRReader();
            this.qrReader.init('/lib/');
        };
        MessagesView.prototype.startScan = function () {
            var self = this;
            if (typeof window.QRScanner !== 'undefined') {
                window.QRScanner.scan(function (err, result) {
                    if (err) {
                        if (err.name === 'SCAN_CANCELED') {
                        }
                        else {
                            alert(JSON.stringify(err));
                        }
                    }
                    else {
                        self.handleScanResult(result);
                    }
                });
                window.QRScanner.show();
                $('body').addClass('transparent');
                $('#appContent').hide();
                $('#nativeCameraPreview').show();
            }
            else {
                this.initQr();
                if (this.qrReader) {
                    this.qrScanning = true;
                    this.qrReader.scan(function (result) {
                        self.qrScanning = false;
                        self.handleScanResult(result);
                    });
                }
            }
        };
        MessagesView.prototype.handleScanResult = function (result) {
            //console.log('Scan result:', result);
            var self = this;
            var parsed = false;
            try {
                var txDetails = CoinUri_1.CoinUri.decodeTx(result);
                if (txDetails !== null) {
                    self.destinationAddressUser = txDetails.address;
                    if (typeof txDetails.description !== 'undefined')
                        self.txDescription = txDetails.description;
                    if (typeof txDetails.recipientName !== 'undefined')
                        self.txDestinationName = txDetails.recipientName;
                    parsed = true;
                }
            }
            catch (e) {
            }
            try {
                var txDetails = CoinUri_1.CoinUri.decodeWallet(result);
                if (txDetails !== null) {
                    self.destinationAddressUser = txDetails.address;
                    parsed = true;
                }
            }
            catch (e) {
            }
            if (!parsed)
                self.destinationAddressUser = result;
            self.stopScan();
        };
        MessagesView.prototype.stopScan = function () {
            if (typeof window.QRScanner !== 'undefined') {
                window.QRScanner.cancelScan(function (status) {
                    //console.log(status);
                });
                window.QRScanner.hide();
                $('body').removeClass('transparent');
                $('#appContent').show();
                $('#nativeCameraPreview').hide();
            }
            else {
                if (this.qrReader !== null) {
                    this.qrReader.stop();
                    this.qrReader = null;
                    this.qrScanning = false;
                }
            }
        };
        MessagesView.prototype.destinationAddressUserWatch = function () {
            if (this.destinationAddressUser.indexOf('.') !== -1) {
                var self_1 = this;
                if (this.timeoutResolveAlias !== 0)
                    clearTimeout(this.timeoutResolveAlias);
                this.timeoutResolveAlias = setTimeout(function () {
                    blockchainExplorer.resolveOpenAlias(self_1.destinationAddressUser).then(function (data) {
                        try {
                            Cn_1.Cn.decode_address(data.address);
                            self_1.txDestinationName = data.name;
                            self_1.destinationAddress = data.address;
                            self_1.domainAliasAddress = data.address;
                            self_1.destinationAddressValid = true;
                            self_1.openAliasValid = true;
                        }
                        catch (e) {
                            self_1.destinationAddressValid = false;
                            self_1.openAliasValid = false;
                        }
                        self_1.timeoutResolveAlias = 0;
                    }).catch(function () {
                        self_1.openAliasValid = false;
                        self_1.timeoutResolveAlias = 0;
                    });
                }, 400);
            }
            else {
                this.openAliasValid = true;
                try {
                    Cn_1.Cn.decode_address(this.destinationAddressUser);
                    this.destinationAddressValid = true;
                    this.destinationAddress = this.destinationAddressUser;
                }
                catch (e) {
                    this.destinationAddressValid = false;
                }
            }
        };
        MessagesView.prototype.messageWatch = function () {
            try {
                this.messageValid = (this.message.length === 0) || (this.message.length <= config.maxMessageSize);
            }
            catch (e) {
                this.messageValid = false;
            }
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], MessagesView.prototype, "transactions", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], MessagesView.prototype, "blockchainHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], MessagesView.prototype, "destinationAddressUser", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], MessagesView.prototype, "destinationAddress", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], MessagesView.prototype, "destinationAddressValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], MessagesView.prototype, "message", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], MessagesView.prototype, "messageValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], MessagesView.prototype, "lockedForm", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], MessagesView.prototype, "maxMessageSize", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], MessagesView.prototype, "domainAliasAddress", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], MessagesView.prototype, "txDestinationName", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], MessagesView.prototype, "txDescription", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], MessagesView.prototype, "isWalletSyncing", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], MessagesView.prototype, "openAliasValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], MessagesView.prototype, "qrScanning", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], MessagesView.prototype, "nfcAvailable", void 0);
        __decorate([
            (0, DependencyInjector_1.Autowire)(Nfc_1.Nfc.name)
        ], MessagesView.prototype, "nfc", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], MessagesView.prototype, "destinationAddressUserWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], MessagesView.prototype, "messageWatch", null);
        return MessagesView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new MessagesView('#app');
    else {
        AppState_1.AppState.askUserOpenWallet(false).then(function () {
            wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
            if (wallet === null)
                throw 'e';
            new MessagesView('#app');
        }).catch(function () {
            window.location.href = '#index';
        });
    }
});
