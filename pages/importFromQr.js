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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/AppState", "../model/Password", "../model/Wallet", "../model/KeysRepository", "../providers/BlockchainExplorerProvider", "../model/QRReader", "../model/CoinUri", "../model/Mnemonic", "../model/Cn"], function (require, exports, DestructableView_1, VueAnnotate_1, AppState_1, Password_1, Wallet_1, KeysRepository_1, BlockchainExplorerProvider_1, QRReader_1, CoinUri_1, Mnemonic_1, Cn_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    AppState_1.AppState.enableLeftMenu();
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var ImportView = /** @class */ (function (_super) {
        __extends(ImportView, _super);
        function ImportView(container) {
            var _this = _super.call(this, container) || this;
            _this.mnemonicSeed = null;
            _this.privateSpendKey = null;
            _this.privateViewKey = null;
            _this.publicAddress = null;
            _this.qrReader = null;
            return _this;
        }
        ImportView.prototype.formValid = function () {
            if (this.password != this.password2)
                return false;
            if (!(this.password !== '' && (!this.insecurePassword || this.forceInsecurePassword)))
                return false;
            if (!(this.privateSpendKey !== null || this.mnemonicSeed !== null || (this.publicAddress !== null && this.privateViewKey !== null)))
                return false;
            return true;
        };
        ImportView.prototype.importWallet = function () {
            var self = this;
            blockchainExplorer.getHeight().then(function (currentHeight) {
                var newWallet = new Wallet_1.Wallet();
                if (self.mnemonicSeed !== null) {
                    var detectedMnemonicLang = Mnemonic_1.Mnemonic.detectLang(self.mnemonicSeed);
                    if (detectedMnemonicLang !== null) {
                        var mnemonic_decoded = Mnemonic_1.Mnemonic.mn_decode(self.mnemonicSeed, detectedMnemonicLang);
                        if (mnemonic_decoded !== null) {
                            var keys = Cn_1.Cn.create_address(mnemonic_decoded);
                            newWallet.keys = KeysRepository_1.KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);
                        }
                        else {
                            swal({
                                type: 'error',
                                title: i18n.t('global.invalidMnemonicModal.title'),
                                text: i18n.t('global.invalidMnemonicModal.content'),
                                confirmButtonText: i18n.t('global.invalidMnemonicModal.confirmText'),
                            });
                            return;
                        }
                    }
                    else {
                        swal({
                            type: 'error',
                            title: i18n.t('global.invalidMnemonicModal.title'),
                            text: i18n.t('global.invalidMnemonicModal.content'),
                            confirmButtonText: i18n.t('global.invalidMnemonicModal.confirmText'),
                        });
                        return;
                    }
                }
                else if (self.privateSpendKey !== null) {
                    var viewkey = self.privateViewKey !== null ? self.privateViewKey : '';
                    if (viewkey === '') {
                        viewkey = Cn_1.Cn.generate_keys(Cn_1.CnUtils.cn_fast_hash(self.privateSpendKey)).sec;
                    }
                    newWallet.keys = KeysRepository_1.KeysRepository.fromPriv(self.privateSpendKey, viewkey);
                }
                else if (self.privateSpendKey === null && self.privateViewKey !== null && self.publicAddress !== null) {
                    var decodedPublic = Cn_1.Cn.decode_address(self.publicAddress);
                    newWallet.keys = {
                        priv: {
                            spend: '',
                            view: self.privateViewKey
                        },
                        pub: {
                            spend: decodedPublic.spend,
                            view: decodedPublic.view,
                        }
                    };
                }
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
                AppState_1.AppState.openWallet(newWallet, self.password);
                window.location.href = '#account';
            });
        };
        ImportView.prototype.initQr = function () {
            this.stopScan();
            this.qrReader = new QRReader_1.QRReader();
            this.qrReader.init('/lib/');
        };
        ImportView.prototype.startScan = function () {
            var _this = this;
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
                        _this.handleScanResult(result);
                    });
                }
            }
        };
        ImportView.prototype.handleScanResult = function (result) {
            this.qrScanning = false;
            this.stopScan();
            try {
                var txDetails = CoinUri_1.CoinUri.decodeWallet(result);
                if (txDetails !== null &&
                    (typeof txDetails.spendKey !== 'undefined' || typeof txDetails.mnemonicSeed !== 'undefined')) {
                    if (typeof txDetails.spendKey !== 'undefined')
                        this.privateSpendKey = txDetails.spendKey;
                    if (typeof txDetails.mnemonicSeed !== 'undefined')
                        this.mnemonicSeed = txDetails.mnemonicSeed;
                    if (typeof txDetails.viewKey !== 'undefined')
                        this.privateViewKey = txDetails.viewKey;
                    if (typeof txDetails.height !== 'undefined')
                        this.importHeight = parseInt('' + txDetails.height);
                    if (typeof txDetails.address !== 'undefined')
                        this.publicAddress = txDetails.address;
                    return true;
                }
            }
            catch (e) {
            }
            return false;
        };
        ImportView.prototype.stopScan = function () {
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
        ImportView.prototype.passwordWatch = function () {
            if (!Password_1.Password.checkPasswordConstraints(this.password, false)) {
                this.insecurePassword = true;
            }
            else
                this.insecurePassword = false;
        };
        ImportView.prototype.importHeightWatch = function () {
            if (this.importHeight === '')
                this.importHeight = 0;
            if (this.importHeight < 0) {
                this.importHeight = 0;
            }
            this.importHeight = parseInt('' + this.importHeight);
        };
        ImportView.prototype.forceInsecurePasswordCheck = function () {
            this.forceInsecurePassword = true;
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "password", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "password2", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "insecurePassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "forceInsecurePassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], ImportView.prototype, "importHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "qrScanning", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "passwordWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "importHeightWatch", null);
        return ImportView;
    }(DestructableView_1.DestructableView));
    new ImportView('#app');
});
