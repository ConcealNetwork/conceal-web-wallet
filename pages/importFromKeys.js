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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/AppState", "../model/Password", "../model/Wallet", "../model/KeysRepository", "../providers/BlockchainExplorerProvider", "../model/Cn"], function (require, exports, DestructableView_1, VueAnnotate_1, AppState_1, Password_1, Wallet_1, KeysRepository_1, BlockchainExplorerProvider_1, Cn_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    AppState_1.AppState.enableLeftMenu();
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var ImportView = /** @class */ (function (_super) {
        __extends(ImportView, _super);
        function ImportView(container) {
            return _super.call(this, container) || this;
        }
        ImportView.prototype.formValid = function () {
            if (this.password != this.password2)
                return false;
            if (!(this.password !== '' && (!this.insecurePassword || this.forceInsecurePassword)))
                return false;
            if (!((!this.viewOnly && this.validPrivateSpendKey) ||
                (this.viewOnly && this.validPublicAddress && this.validPrivateViewKey)))
                return false;
            return true;
        };
        ImportView.prototype.importWallet = function () {
            var self = this;
            blockchainExplorer.getHeight().then(function (currentHeight) {
                var newWallet = new Wallet_1.Wallet();
                if (self.viewOnly) {
                    var decodedPublic = Cn_1.Cn.decode_address(self.publicAddress.trim());
                    newWallet.keys = {
                        priv: {
                            spend: '',
                            view: self.privateViewKey.trim()
                        },
                        pub: {
                            spend: decodedPublic.spend,
                            view: decodedPublic.view,
                        }
                    };
                }
                else {
                    //console.log(1);
                    var viewkey = self.privateViewKey.trim();
                    if (viewkey === '') {
                        viewkey = Cn_1.Cn.generate_keys(Cn_1.CnUtils.cn_fast_hash(self.privateSpendKey.trim())).sec;
                    }
                    //console.log(1, viewkey);
                    newWallet.keys = KeysRepository_1.KeysRepository.fromPriv(self.privateSpendKey.trim(), viewkey);
                    //console.log(1);
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
        ImportView.prototype.privateSpendKeyWatch = function () {
            this.validPrivateSpendKey = this.privateSpendKey.trim().length == 64;
        };
        ImportView.prototype.privateViewKeyWatch = function () {
            this.validPrivateViewKey = this.privateViewKey.trim().length == 64 || (!this.viewOnly && this.privateViewKey.trim().length == 0);
        };
        ImportView.prototype.publicAddressWatch = function () {
            try {
                Cn_1.Cn.decode_address(this.publicAddress.trim());
                this.validPublicAddress = true;
            }
            catch (e) {
                this.validPublicAddress = false;
            }
        };
        ImportView.prototype.forceInsecurePasswordCheck = function () {
            var self = this;
            self.forceInsecurePassword = true;
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "viewOnly", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "privateSpendKey", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "validPrivateSpendKey", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "privateViewKey", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "validPrivateViewKey", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "publicAddress", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "validPublicAddress", void 0);
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
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "passwordWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "importHeightWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "privateSpendKeyWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "privateViewKeyWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "publicAddressWatch", null);
        return ImportView;
    }(DestructableView_1.DestructableView));
    new ImportView('#app');
});
