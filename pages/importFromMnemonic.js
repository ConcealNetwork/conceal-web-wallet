/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/AppState", "../model/Password", "../model/Wallet", "../model/KeysRepository", "../providers/BlockchainExplorerProvider", "../model/Mnemonic", "../model/Cn"], function (require, exports, DestructableView_1, VueAnnotate_1, AppState_1, Password_1, Wallet_1, KeysRepository_1, BlockchainExplorerProvider_1, Mnemonic_1, Cn_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    AppState_1.AppState.enableLeftMenu();
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var ImportView = /** @class */ (function (_super) {
        __extends(ImportView, _super);
        function ImportView(container) {
            var _this = _super.call(this, container) || this;
            _this.languages.push({ key: 'auto', name: 'Detect automatically' });
            _this.languages.push({ key: 'english', name: 'English' });
            _this.languages.push({ key: 'chinese', name: 'Chinese (simplified)' });
            _this.languages.push({ key: 'dutch', name: 'Dutch' });
            _this.languages.push({ key: 'electrum', name: 'Electrum' });
            _this.languages.push({ key: 'esperanto', name: 'Esperanto' });
            _this.languages.push({ key: 'french', name: 'French' });
            _this.languages.push({ key: 'italian', name: 'Italian' });
            _this.languages.push({ key: 'japanese', name: 'Japanese' });
            _this.languages.push({ key: 'lojban', name: 'Lojban' });
            _this.languages.push({ key: 'portuguese', name: 'Portuguese' });
            _this.languages.push({ key: 'russian', name: 'Russian' });
            _this.languages.push({ key: 'spanish', name: 'Spanish' });
            _this.languages.push({ key: 'ukrainian', name: 'Ukrainian' });
            _this.language = 'auto';
            return _this;
        }
        ImportView.prototype.formValid = function () {
            if (this.password != this.password2)
                return false;
            if (!(this.password !== '' && (!this.insecurePassword || this.forceInsecurePassword)))
                return false;
            if (!this.validMnemonicPhrase)
                return false;
            return true;
        };
        ImportView.prototype.importWallet = function () {
            var self = this;
            blockchainExplorer.getHeight().then(function (currentHeight) {
                var newWallet = new Wallet_1.Wallet();
                var mnemonic = self.mnemonicPhrase.trim();
                // let current_lang = 'english';
                var current_lang = 'english';
                if (self.language === 'auto') {
                    var detectedLang = Mnemonic_1.Mnemonic.detectLang(self.mnemonicPhrase.trim());
                    if (detectedLang !== null)
                        current_lang = detectedLang;
                }
                else
                    current_lang = self.language;
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
                    AppState_1.AppState.openWallet(newWallet_1, self.password).then(function (success) {
                        window.location.href = '#account';
                    });
                }
                else {
                    swal({
                        type: 'error',
                        title: i18n.t('global.invalidMnemonicModal.title'),
                        text: i18n.t('global.invalidMnemonicModal.content'),
                        confirmButtonText: i18n.t('global.invalidMnemonicModal.confirmText'),
                    });
                }
            });
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
        ImportView.prototype.mnemonicPhraseWatch = function () {
            this.checkMnemonicValidity();
        };
        ImportView.prototype.languageWatch = function () {
            this.checkMnemonicValidity();
        };
        ImportView.prototype.checkMnemonicValidity = function () {
            var splitted = this.mnemonicPhrase.trim().split(' ');
            if (splitted.length != 25) {
                this.validMnemonicPhrase = false;
            }
            else {
                var detected = Mnemonic_1.Mnemonic.detectLang(this.mnemonicPhrase.trim());
                if (this.language === 'auto')
                    this.validMnemonicPhrase = detected !== null;
                else
                    this.validMnemonicPhrase = detected === this.language;
            }
        };
        ImportView.prototype.forceInsecurePasswordCheck = function () {
            var self = this;
            self.forceInsecurePassword = true;
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
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "mnemonicPhrase", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "validMnemonicPhrase", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "language", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], ImportView.prototype, "languages", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "passwordWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "importHeightWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "mnemonicPhraseWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "languageWatch", null);
        return ImportView;
    }(DestructableView_1.DestructableView));
    new ImportView('#app');
});
