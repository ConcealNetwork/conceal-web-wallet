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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/WalletRepository", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../model/AppState", "../model/Translations", "../providers/BlockchainExplorerProvider", "../model/WalletWatchdog"], function (require, exports, DestructableView_1, VueAnnotate_1, WalletRepository_1, DependencyInjector_1, Wallet_1, AppState_1, Translations_1, BlockchainExplorerProvider_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = DependencyInjector_1.DependencyInjectorInstance().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var walletWatchdog = DependencyInjector_1.DependencyInjectorInstance().getInstance(WalletWatchdog_1.WalletWatchdog.name, 'default', false);
    var SendView = /** @class */ (function (_super) {
        __extends(SendView, _super);
        function SendView(container) {
            var _this = _super.call(this, container) || this;
            var self = _this;
            _this.readSpeed = wallet.options.readSpeed;
            _this.checkMinerTx = wallet.options.checkMinerTx;
            _this.customNode = wallet.options.customNode;
            _this.nodeUrl = wallet.options.nodeUrl;
            _this.creationHeight = wallet.creationHeight;
            _this.scanHeight = wallet.lastHeight;
            blockchainExplorer.getHeight().then(function (height) {
                self.maxHeight = height;
            });
            Translations_1.Translations.getLang().then(function (userLang) {
                _this.language = userLang;
            });
            if (typeof window.cordova !== 'undefined' && typeof window.cordova.getAppVersion !== 'undefined') {
                window.cordova.getAppVersion.getVersionNumber().then(function (version) {
                    _this.nativeVersionNumber = version;
                });
                window.cordova.getAppVersion.getVersionCode().then(function (version) {
                    _this.nativeVersionCode = version;
                });
            }
            return _this;
        }
        SendView.prototype.languageWatch = function () {
            Translations_1.Translations.setBrowserLang(this.language);
            Translations_1.Translations.loadLangTranslation(this.language);
        };
        SendView.prototype.deleteWallet = function () {
            swal({
                title: i18n.t('settingsPage.deleteWalletModal.title'),
                html: i18n.t('settingsPage.deleteWalletModal.content'),
                showCancelButton: true,
                confirmButtonText: i18n.t('settingsPage.deleteWalletModal.confirmText'),
                cancelButtonText: i18n.t('settingsPage.deleteWalletModal.cancelText'),
            }).then(function (result) {
                if (result.value) {
                    AppState_1.AppState.disconnect();
                    DependencyInjector_1.DependencyInjectorInstance().register(Wallet_1.Wallet.name, undefined, 'default');
                    WalletRepository_1.WalletRepository.deleteLocalCopy();
                    window.location.href = '#index';
                }
            });
        };
        SendView.prototype.readSpeedWatch = function () { this.updateWalletOptions(); };
        SendView.prototype.checkMinerTxWatch = function () { this.updateWalletOptions(); };
        SendView.prototype.customNodeWatch = function () { this.updateWalletOptions(); };
        SendView.prototype.creationHeightWatch = function () {
            if (this.creationHeight < 0)
                this.creationHeight = 0;
            if (this.creationHeight > this.maxHeight && this.maxHeight !== -1)
                this.creationHeight = this.maxHeight;
        };
        SendView.prototype.scanHeightWatch = function () {
            if (this.scanHeight < 0)
                this.scanHeight = 0;
            if (this.scanHeight > this.maxHeight && this.maxHeight !== -1)
                this.scanHeight = this.maxHeight;
        };
        SendView.prototype.updateWalletOptions = function () {
            var options = wallet.options;
            options.readSpeed = this.readSpeed;
            options.checkMinerTx = this.checkMinerTx;
            options.customNode = this.customNode;
            options.nodeUrl = this.nodeUrl;
            wallet.options = options;
            walletWatchdog.signalWalletUpdate();
        };
        SendView.prototype.updateWalletSettings = function () {
            wallet.creationHeight = this.creationHeight;
            wallet.lastHeight = this.scanHeight;
            walletWatchdog.signalWalletUpdate();
        };
        SendView.prototype.updateConnectionSettings = function () {
            var options = wallet.options;
            options.customNode = this.customNode;
            options.nodeUrl = this.nodeUrl;
            config.nodeUrl = this.nodeUrl;
            wallet.options = options;
            walletWatchdog.signalWalletUpdate();
        };
        __decorate([
            VueAnnotate_1.VueVar(10)
        ], SendView.prototype, "readSpeed", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], SendView.prototype, "checkMinerTx", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], SendView.prototype, "customNode", void 0);
        __decorate([
            VueAnnotate_1.VueVar('http://node.conceal.network:32348/')
        ], SendView.prototype, "nodeUrl", void 0);
        __decorate([
            VueAnnotate_1.VueVar(0)
        ], SendView.prototype, "creationHeight", void 0);
        __decorate([
            VueAnnotate_1.VueVar(0)
        ], SendView.prototype, "scanHeight", void 0);
        __decorate([
            VueAnnotate_1.VueVar(-1)
        ], SendView.prototype, "maxHeight", void 0);
        __decorate([
            VueAnnotate_1.VueVar('en')
        ], SendView.prototype, "language", void 0);
        __decorate([
            VueAnnotate_1.VueVar(0)
        ], SendView.prototype, "nativeVersionCode", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], SendView.prototype, "nativeVersionNumber", void 0);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "languageWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "readSpeedWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "checkMinerTxWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "customNodeWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "creationHeightWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], SendView.prototype, "scanHeightWatch", null);
        return SendView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new SendView('#app');
    else
        window.location.href = '#index';
});
