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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../model/AppState", "../providers/BlockchainExplorerProvider"], function (require, exports, DestructableView_1, VueAnnotate_1, DependencyInjector_1, Wallet_1, AppState_1, BlockchainExplorerProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var DepositsView = /** @class */ (function (_super) {
        __extends(DepositsView, _super);
        function DepositsView(container) {
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
                _this.deposits = wallet.getDepositsCopy().reverse();
            };
            _this.moreInfoOnDeposit = function (deposit) {
                var explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
                var explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
                var status = 'Locked';
                var creatingTimestamp = 0;
                var spendingTimestamp = 0;
                var spendingHeight = 0;
                var creationTx = wallet.findWithTxHash(deposit.txHash);
                var spendingTx = wallet.findWithTxHash(deposit.spentTx);
                if (creationTx) {
                    creatingTimestamp = creationTx.timestamp;
                }
                if (spendingTx) {
                    spendingTimestamp = spendingTx.timestamp;
                    spendingHeight = spendingTx.blockHeight;
                }
                if ((deposit.blockHeight + deposit.term) <= _this.blockchainHeight) {
                    if (deposit.spentTx) {
                        status = 'Spent';
                    }
                    else {
                        status = 'Unlocked';
                    }
                }
                swal({
                    title: i18n.t('depositsPage.depositDetails.title'),
                    customClass: 'swal-wide',
                    html: "\n        <div class=\"tl\" >\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.txHash') + "</span>:<span class=\"txDetailsValue\"><a href=\"" + explorerUrlHash.replace('{ID}', deposit.txHash) + "\" target=\"_blank\">" + deposit.txHash + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.spendingTx') + "</span>:<span class=\"txDetailsValue\"><a href=\"" + explorerUrlHash.replace('{ID}', deposit.spentTx) + "\" target=\"_blank\">" + deposit.spentTx + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.status') + "</span>:<span class=\"txDetailsValue\">" + status + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.amount') + "</span>:<span class=\"txDetailsValue\">" + (deposit.amount / Math.pow(10, config.coinUnitPlaces)) + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.term') + "</span>:<span class=\"txDetailsValue\">" + deposit.term + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.creationHeight') + "</span>:<span class=\"txDetailsValue\">" + deposit.blockHeight + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.creationTime') + "</span>:<span class=\"txDetailsValue\">" + new Date(creatingTimestamp * 1000).toDateString() + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.unlockHeight') + "</span>:<span class=\"txDetailsValue\">" + (deposit.blockHeight + deposit.term) + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.spendingTime') + "</span>:<span class=\"txDetailsValue\">" + new Date(spendingTimestamp * 1000).toDateString() + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.spendingHeight') + "</span>:<span class=\"txDetailsValue\">" + spendingHeight + "</a></span></div>\n        </div>"
                });
            };
            _this.isWalletSyncing = true;
            AppState_1.AppState.enableLeftMenu();
            _this.intervalRefresh = setInterval(function () {
                _this.refresh();
            }, 3 * 1000);
            _this.refresh();
            return _this;
        }
        DepositsView.prototype.reset = function () {
            this.lockedForm = false;
            this.openAliasValid = false;
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], DepositsView.prototype, "deposits", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "blockchainHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], DepositsView.prototype, "lockedForm", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], DepositsView.prototype, "isWalletSyncing", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], DepositsView.prototype, "openAliasValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(Math.pow(10, config.coinUnitPlaces))
        ], DepositsView.prototype, "currencyDivider", void 0);
        return DepositsView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new DepositsView('#app');
    else {
        AppState_1.AppState.askUserOpenWallet(false).then(function () {
            wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
            if (wallet === null)
                throw 'e';
            new DepositsView('#app');
        }).catch(function () {
            window.location.href = '#index';
        });
    }
});
