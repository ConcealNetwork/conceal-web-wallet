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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/WalletRepository", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../model/AppState", "../model/Password", "../providers/BlockchainExplorerProvider", "../model/WalletWatchdog"], function (require, exports, DestructableView_1, VueAnnotate_1, WalletRepository_1, DependencyInjector_1, Wallet_1, AppState_1, Password_1, BlockchainExplorerProvider_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var walletWatchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name, 'default', false);
    var ChangeWalletPasswordView = /** @class */ (function (_super) {
        __extends(ChangeWalletPasswordView, _super);
        function ChangeWalletPasswordView(container) {
            return _super.call(this, container) || this;
        }
        ChangeWalletPasswordView.prototype.oldPasswordWatch = function () {
            var wallet = WalletRepository_1.WalletRepository.getLocalWalletWithPassword(this.oldPassword);
            if (wallet !== null) {
                this.invalidOldPassword = false;
            }
            else
                this.invalidOldPassword = true;
        };
        ChangeWalletPasswordView.prototype.forceInsecurePasswordCheck = function () {
            var self = this;
            self.forceInsecurePassword = true;
        };
        ChangeWalletPasswordView.prototype.walletPasswordWatch = function () {
            if (!Password_1.Password.checkPasswordConstraints(this.walletPassword, false)) {
                this.insecurePassword = true;
            }
            else
                this.insecurePassword = false;
        };
        ChangeWalletPasswordView.prototype.changePassword = function () {
            var walletWorker = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(AppState_1.WalletWorker.name, 'default', false);
            if (walletWorker !== null) {
                walletWorker.password = this.walletPassword;
                walletWorker.save();
                swal({
                    type: 'success',
                    title: i18n.t('changeWalletPasswordPage.modalSuccess.title'),
                    confirmButtonText: i18n.t('changeWalletPasswordPage.modalSuccess.confirmText'),
                });
                this.oldPassword = '';
                this.walletPassword = '';
                this.walletPassword2 = '';
                this.insecurePassword = false;
                this.forceInsecurePassword = false;
                this.invalidOldPassword = false;
            }
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ChangeWalletPasswordView.prototype, "oldPassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ChangeWalletPasswordView.prototype, "invalidOldPassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ChangeWalletPasswordView.prototype, "walletPassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ChangeWalletPasswordView.prototype, "walletPassword2", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ChangeWalletPasswordView.prototype, "insecurePassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ChangeWalletPasswordView.prototype, "forceInsecurePassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ChangeWalletPasswordView.prototype, "oldPasswordWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ChangeWalletPasswordView.prototype, "walletPasswordWatch", null);
        return ChangeWalletPasswordView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new ChangeWalletPasswordView('#app');
    else
        window.location.href = '#index';
});
