/*
 * Copyright (c) 2018, Gnock
 * Copyright (c) 2018, The Masari Project
 * Copyright (c) 2022, The Karbo Developers
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/TransactionsExplorer", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../utils/Url", "../model/CoinUri", "../model/QRReader", "../model/AppState", "../providers/BlockchainExplorerProvider", "../model/Nfc", "../model/Cn", "../model/WalletWatchdog"], function (require, exports, DestructableView_1, VueAnnotate_1, TransactionsExplorer_1, DependencyInjector_1, Wallet_1, Url_1, CoinUri_1, QRReader_1, AppState_1, BlockchainExplorerProvider_1, Nfc_1, Cn_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = DependencyInjector_1.DependencyInjectorInstance().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    AppState_1.AppState.enableLeftMenu();
    var SendView = /** @class */ (function (_super) {
        __extends(SendView, _super);
        function SendView(container) {
            var _this = _super.call(this, container) || this;
            _this.qrReader = null;
            _this.redirectUrlAfterSend = null;
            _this.ndefListener = null;
            _this.timeoutResolveAlias = 0;
            var sendAddress = Url_1.Url.getHashSearchParameter('address');
            var amount = Url_1.Url.getHashSearchParameter('amount');
            var destinationName = Url_1.Url.getHashSearchParameter('destName');
            var description = Url_1.Url.getHashSearchParameter('txDesc');
            var redirect = Url_1.Url.getHashSearchParameter('redirect');
            if (sendAddress !== null)
                _this.destinationAddressUser = sendAddress.substr(0, 256);
            if (amount !== null)
                _this.amountToSend = amount;
            if (destinationName !== null)
                _this.txDestinationName = destinationName.substr(0, 256);
            if (description !== null)
                _this.txDescription = description.substr(0, 256);
            if (redirect !== null)
                _this.redirectUrlAfterSend = decodeURIComponent(redirect);
            _this.nfcAvailable = _this.nfc.has;
            return _this;
        }
        SendView.prototype.reset = function () {
            this.lockedForm = false;
            this.destinationAddressUser = '';
            this.destinationAddress = '';
            this.amountToSend = '0';
            this.destinationAddressValid = false;
            this.openAliasValid = false;
            this.qrScanning = false;
            this.amountToSendValid = false;
            this.domainAliasAddress = null;
            this.txDestinationName = null;
            this.txDescription = null;
            this.stopScan();
        };
        SendView.prototype.startNfcScan = function () {
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
                });
            }
        };
        SendView.prototype.stopNfcScan = function () {
            if (this.ndefListener !== null)
                this.nfc.removeNdef(this.ndefListener);
            this.ndefListener = null;
        };
        SendView.prototype.initQr = function () {
            this.stopScan();
            this.qrReader = new QRReader_1.QRReader();
            this.qrReader.init('/lib/');
        };
        SendView.prototype.startScan = function () {
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
        SendView.prototype.handleScanResult = function (result) {
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
                    if (typeof txDetails.amount !== 'undefined') {
                        self.amountToSend = txDetails.amount;
                        self.lockedForm = true;
                    }
                    if (typeof txDetails.paymentId !== 'undefined')
                        self.paymentId = txDetails.paymentId;
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
        SendView.prototype.stopScan = function () {
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
        SendView.prototype.destruct = function () {
            this.stopScan();
            this.stopNfcScan();
            swal.close();
            return _super.prototype.destruct.call(this);
        };
        SendView.prototype.send = function () {
            var self = this;
            blockchainExplorer.getHeight().then(function (blockchainHeight) {
                var amount = parseFloat(self.amountToSend);
                if (self.destinationAddress !== null) {
                    //todo use BigInteger
                    if (amount * Math.pow(10, config.coinUnitPlaces) > wallet.unlockedAmount(blockchainHeight)) {
                        swal({
                            type: 'error',
                            title: i18n.t('sendPage.notEnoughMoneyModal.title'),
                            text: i18n.t('sendPage.notEnoughMoneyModal.content'),
                            confirmButtonText: i18n.t('sendPage.notEnoughMoneyModal.confirmText'),
                        });
                        return;
                    }
                    //TODO use biginteger
                    var amountToSend = amount * Math.pow(10, config.coinUnitPlaces);
                    var destinationAddress_1 = self.destinationAddress;
                    swal({
                        title: i18n.t('sendPage.creatingTransferModal.title'),
                        html: i18n.t('sendPage.creatingTransferModal.content'),
                        onOpen: function () {
                            swal.showLoading();
                        }
                    });
                    TransactionsExplorer_1.TransactionsExplorer.createTx([{ address: destinationAddress_1, amount: amountToSend }], self.paymentId, wallet, blockchainHeight, function (numberOuts) {
                        return blockchainExplorer.getRandomOuts(numberOuts);
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
                    }).then(function (rawTxData) {
                        blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
                            //save the tx private key
                            wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);
                            //force a mempool check so the user is up to date
                            var watchdog = DependencyInjector_1.DependencyInjectorInstance().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                            if (watchdog !== null)
                                watchdog.checkMempool();
                            var promise = Promise.resolve();
                            if (destinationAddress_1 === 'ccx7NzuofXxcypov8Yqm2A118xT17HereBFjp3RScjzM7wncf8BRcnHZbACy63sWD71L7NmkJRgQKXFE3weCfAh31RAVFHgttf' ||
                                destinationAddress_1 === 'ccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj' ||
                                destinationAddress_1 === 'ccx7YZ4RC97fqMh1bmzrFtDoSSiEgvEYzhaLE53SR9bh4QrDBUhGUH3TCmXqv8MTLjJDtnCeeaT5bLC2ZSzp3ZmQ19DoiPLLXS') {
                                promise = swal({
                                    type: 'success',
                                    title: i18n.t('sendPage.thankYouDonationModal.title'),
                                    text: i18n.t('sendPage.thankYouDonationModal.content'),
                                    confirmButtonText: i18n.t('sendPage.thankYouDonationModal.confirmText'),
                                });
                            }
                            else
                                promise = swal({
                                    type: 'success',
                                    title: i18n.t('sendPage.transferSentModal.title'),
                                    confirmButtonText: i18n.t('sendPage.transferSentModal.confirmText'),
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
            });
        };
        SendView.prototype.destinationAddressUserWatch = function () {
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
        SendView.prototype.amountToSendWatch = function () {
            try {
                this.amountToSendValid = !isNaN(parseFloat(this.amountToSend));
            }
            catch (e) {
                this.amountToSendValid = false;
            }
        };
        SendView.prototype.paymentIdWatch = function () {
            try {
                this.paymentIdValid = this.paymentId.length === 0 ||
                    (this.paymentId.length === 16 && (/^[0-9a-fA-F]{16}$/.test(this.paymentId))) ||
                    (this.paymentId.length === 64 && (/^[0-9a-fA-F]{64}$/.test(this.paymentId)));
            }
            catch (e) {
                this.paymentIdValid = false;
            }
        };
        __decorate([
            VueAnnotate_1.VueVar('')
        ], SendView.prototype, "destinationAddressUser", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], SendView.prototype, "destinationAddress", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], SendView.prototype, "destinationAddressValid", void 0);
        __decorate([
            VueAnnotate_1.VueVar('10.5')
        ], SendView.prototype, "amountToSend", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], SendView.prototype, "lockedForm", void 0);
        __decorate([
            VueAnnotate_1.VueVar(true)
        ], SendView.prototype, "amountToSendValid", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], SendView.prototype, "paymentId", void 0);
        __decorate([
            VueAnnotate_1.VueVar(true)
        ], SendView.prototype, "paymentIdValid", void 0);
        __decorate([
            VueAnnotate_1.VueVar(null)
        ], SendView.prototype, "domainAliasAddress", void 0);
        __decorate([
            VueAnnotate_1.VueVar(null)
        ], SendView.prototype, "txDestinationName", void 0);
        __decorate([
            VueAnnotate_1.VueVar(null)
        ], SendView.prototype, "txDescription", void 0);
        __decorate([
            VueAnnotate_1.VueVar(true)
        ], SendView.prototype, "openAliasValid", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], SendView.prototype, "qrScanning", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], SendView.prototype, "nfcAvailable", void 0);
        __decorate([
            DependencyInjector_1.Autowire(Nfc_1.Nfc.name)
        ], SendView.prototype, "nfc", void 0);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "destinationAddressUserWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "amountToSendWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "paymentIdWatch", null);
        return SendView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new SendView('#app');
    else {
        AppState_1.AppState.askUserOpenWallet(false).then(function () {
            wallet = DependencyInjector_1.DependencyInjectorInstance().getInstance(Wallet_1.Wallet.name, 'default', false);
            if (wallet === null)
                throw 'e';
            new SendView('#app');
        }).catch(function () {
            window.location.href = '#index';
        });
    }
});
