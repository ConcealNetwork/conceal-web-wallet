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
define(["require", "exports", "../lib/numbersLab/DependencyInjector", "./Wallet", "../providers/BlockchainExplorerProvider", "../lib/numbersLab/Observable", "./WalletRepository", "./TransactionsExplorer", "./WalletWatchdog"], function (require, exports, DependencyInjector_1, Wallet_1, BlockchainExplorerProvider_1, Observable_1, WalletRepository_1, TransactionsExplorer_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppState = exports.WalletWorker = void 0;
    var WalletWorker = /** @class */ (function () {
        function WalletWorker(wallet, password) {
            this.intervalSave = 0;
            this.wallet = wallet;
            this.password = password;
            var self = this;
            wallet.addObserver(Observable_1.Observable.EVENT_MODIFIED, function () {
                if (self.intervalSave === 0)
                    self.intervalSave = setTimeout(function () {
                        self.save();
                        self.intervalSave = 0;
                    }, 1000);
            });
            this.save();
        }
        WalletWorker.prototype.save = function () {
            WalletRepository_1.WalletRepository.save(this.wallet, this.password);
        };
        return WalletWorker;
    }());
    exports.WalletWorker = WalletWorker;
    var AppState = /** @class */ (function () {
        function AppState() {
        }
        AppState.openWallet = function (wallet, password) {
            var walletWorker = new WalletWorker(wallet, password);
            DependencyInjector_1.DependencyInjectorInstance().register(Wallet_1.Wallet.name, wallet);
            var watchdog = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance().watchdog(wallet);
            DependencyInjector_1.DependencyInjectorInstance().register(WalletWatchdog_1.WalletWatchdog.name, watchdog);
            DependencyInjector_1.DependencyInjectorInstance().register(WalletWorker.name, walletWorker);
            $('body').addClass('connected');
            if (wallet.isViewOnly())
                $('body').addClass('viewOnlyWallet');
        };
        AppState.disconnect = function () {
            var wallet = DependencyInjector_1.DependencyInjectorInstance().getInstance(Wallet_1.Wallet.name, 'default', false);
            var walletWorker = DependencyInjector_1.DependencyInjectorInstance().getInstance(WalletWorker.name, 'default', false);
            var walletWatchdog = DependencyInjector_1.DependencyInjectorInstance().getInstance(WalletWatchdog_1.WalletWatchdog.name, 'default', false);
            if (walletWatchdog !== null)
                walletWatchdog.stop();
            DependencyInjector_1.DependencyInjectorInstance().register(Wallet_1.Wallet.name, undefined, 'default');
            DependencyInjector_1.DependencyInjectorInstance().register(WalletWorker.name, undefined, 'default');
            DependencyInjector_1.DependencyInjectorInstance().register(WalletWatchdog_1.WalletWatchdog.name, undefined, 'default');
            $('body').removeClass('connected');
            $('body').removeClass('viewOnlyWallet');
        };
        AppState.enableLeftMenu = function () {
            if (!this.leftMenuEnabled) {
                this.leftMenuEnabled = true;
                $('body').removeClass('menuDisabled');
            }
        };
        AppState.disableLeftMenu = function () {
            if (this.leftMenuEnabled) {
                this.leftMenuEnabled = false;
                $('body').addClass('menuDisabled');
            }
        };
        AppState.askUserOpenWallet = function (redirectToHome) {
            if (redirectToHome === void 0) { redirectToHome = true; }
            var self = this;
            return new Promise(function (resolve, reject) {
                swal({
                    title: i18n.t('global.openWalletModal.title'),
                    input: 'password',
                    showCancelButton: true,
                    confirmButtonText: i18n.t('global.openWalletModal.confirmText'),
                    cancelButtonText: i18n.t('global.openWalletModal.cancelText'),
                }).then(function (result) {
                    setTimeout(function () {
                        if (result.value) {
                            swal({
                                type: 'info',
                                title: i18n.t('global.loading'),
                                onOpen: function () {
                                    swal.showLoading();
                                }
                            });
                            var savePassword_1 = result.value;
                            // let password = prompt();
                            var memoryWallet = DependencyInjector_1.DependencyInjectorInstance().getInstance(Wallet_1.Wallet.name, 'default', false);
                            if (memoryWallet === null) {
                                WalletRepository_1.WalletRepository.getLocalWalletWithPassword(savePassword_1).then(function (wallet) {
                                    //console.log(wallet);
                                    if (wallet !== null) {
                                        wallet.recalculateIfNotViewOnly();
                                        //checking the wallet to find integrity/problems and try to update it before loading
                                        var blockchainHeightToRescanObj = {};
                                        for (var _i = 0, _a = wallet.getTransactionsCopy(); _i < _a.length; _i++) {
                                            var tx = _a[_i];
                                            if (tx.hash === '') {
                                                blockchainHeightToRescanObj[tx.blockHeight] = true;
                                            }
                                        }
                                        var blockchainHeightToRescan = Object.keys(blockchainHeightToRescanObj);
                                        if (blockchainHeightToRescan.length > 0) {
                                            var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
                                            var promisesBlocks = [];
                                            for (var _b = 0, blockchainHeightToRescan_1 = blockchainHeightToRescan; _b < blockchainHeightToRescan_1.length; _b++) {
                                                var height = blockchainHeightToRescan_1[_b];
                                                promisesBlocks.push(blockchainExplorer.getTransactionsForBlocks(parseInt(height), parseInt(height), wallet.options.checkMinerTx));
                                                //console.log(`promisesBlocks.length: ${promisesBlocks.length}`);
                                            }
                                            Promise.all(promisesBlocks).then(function (arrayOfTxs) {
                                                for (var _i = 0, arrayOfTxs_1 = arrayOfTxs; _i < arrayOfTxs_1.length; _i++) {
                                                    var txs = arrayOfTxs_1[_i];
                                                    for (var _a = 0, txs_1 = txs; _a < txs_1.length; _a++) {
                                                        var rawTx = txs_1[_a];
                                                        if (wallet !== null) {
                                                            var tx = TransactionsExplorer_1.TransactionsExplorer.parse(rawTx, wallet);
                                                            if (tx !== null) {
                                                                console.log("Added new Tx " + tx.hash + " to wallet");
                                                                wallet.addNew(tx);
                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                        swal.close();
                                        resolve();
                                        AppState.openWallet(wallet, savePassword_1);
                                        if (redirectToHome)
                                            window.location.href = '#account';
                                    }
                                    else {
                                        swal({
                                            type: 'error',
                                            title: i18n.t('global.invalidPasswordModal.title'),
                                            text: i18n.t('global.invalidPasswordModal.content'),
                                            confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText'),
                                            onOpen: function () {
                                                swal.hideLoading();
                                            }
                                        });
                                        reject();
                                    }
                                });
                            }
                            else {
                                swal.close();
                                window.location.href = '#account';
                            }
                        }
                        else
                            reject();
                    }, 1);
                });
            });
        };
        AppState.leftMenuEnabled = false;
        return AppState;
    }());
    exports.AppState = AppState;
});
