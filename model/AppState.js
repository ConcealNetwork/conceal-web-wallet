/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2025 Conceal Community, Conceal.Network & Conceal Devs
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
            (0, DependencyInjector_1.DependencyInjectorInstance)().register(Wallet_1.Wallet.name, wallet);
            var watchdog = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance().start(wallet);
            (0, DependencyInjector_1.DependencyInjectorInstance)().register(WalletWatchdog_1.WalletWatchdog.name, watchdog);
            (0, DependencyInjector_1.DependencyInjectorInstance)().register(WalletWorker.name, walletWorker);
            $('body').addClass('connected');
            if (wallet.isViewOnly()) {
                $('body').addClass('viewOnlyWallet');
            }
        };
        AppState.disconnect = function () {
            var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
            var walletWorker = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWorker.name, 'default', false);
            var walletWatchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name, 'default', false);
            if (walletWatchdog !== null) {
                walletWatchdog.stop();
            }
            // Clean up the blockchain explorer session to ensure fresh node selection on next connection
            var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
            blockchainExplorer.cleanupSession();
            (0, DependencyInjector_1.DependencyInjectorInstance)().register(Wallet_1.Wallet.name, undefined, 'default');
            (0, DependencyInjector_1.DependencyInjectorInstance)().register(WalletWorker.name, undefined, 'default');
            (0, DependencyInjector_1.DependencyInjectorInstance)().register(WalletWatchdog_1.WalletWatchdog.name, undefined, 'default');
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
            return new Promise(function (resolve, reject) {
                swal({
                    title: i18n.t('global.openWalletModal.title'),
                    input: 'password',
                    showCancelButton: true,
                    confirmButtonText: i18n.t('global.openWalletModal.confirmText'),
                    cancelButtonText: i18n.t('global.openWalletModal.cancelText'),
                }).then(function (result) {
                    $('#pageLoading').show();
                    BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance().initialize().then(function (success) {
                        $('#pageLoading').hide();
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
                                var memoryWallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
                                if (memoryWallet === null) {
                                    // Migration and wallet loading logic
                                    WalletRepository_1.WalletRepository.migrateWallet()
                                        .then(function (isSuccess) {
                                        return WalletRepository_1.WalletRepository.getLocalWalletWithPassword(savePassword_1);
                                    })
                                        .then(function (wallet) {
                                        if (wallet !== null) {
                                            handleWalletLoading(wallet, savePassword_1, resolve, redirectToHome);
                                        }
                                        else {
                                            showInvalidPasswordError();
                                            reject();
                                        }
                                    })
                                        .catch(function (err) {
                                        console.error("Error loading wallet:", err);
                                        reject(err);
                                    });
                                }
                                else {
                                    swal.close();
                                    window.location.href = '#account';
                                    resolve();
                                }
                            }
                            else {
                                reject();
                            }
                        }, 1);
                    }).catch(function (err) {
                        console.log(err);
                        $('#pageLoading').hide();
                        reject(err);
                    });
                }).catch(function (err) {
                    console.log(err);
                    $('#pageLoading').hide();
                    reject(err);
                });
            });
        };
        AppState.leftMenuEnabled = false;
        return AppState;
    }());
    exports.AppState = AppState;
    // Helper functions to improve readability
    function handleWalletLoading(wallet, savePassword, resolve, redirectToHome) {
        wallet.recalculateIfNotViewOnly();
        updateWalletTransactions(wallet);
        swal.close();
        resolve();
        AppState.openWallet(wallet, savePassword);
        if (redirectToHome) {
            window.location.href = '#account';
        }
    }
    function showInvalidPasswordError() {
        swal({
            type: 'error',
            title: i18n.t('global.invalidPasswordModal.title'),
            text: i18n.t('global.invalidPasswordModal.content'),
            confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText'),
            onOpen: function () {
                swal.hideLoading();
            }
        });
    }
    function updateWalletTransactions(wallet) {
        var blockchainHeightToRescanObj = {};
        for (var _i = 0, _a = wallet.getTransactionsCopy(); _i < _a.length; _i++) {
            var tx = _a[_i];
            if (tx.hash === '') {
                blockchainHeightToRescanObj[tx.blockHeight] = true;
            }
        }
        var blockchainHeightToRescan = Object.keys(blockchainHeightToRescanObj);
        if (blockchainHeightToRescan.length > 0) {
            var blockchainExplorer_1 = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
            var promisesBlocks = blockchainHeightToRescan.map(function (height) {
                return blockchainExplorer_1.getTransactionsForBlocks(parseInt(height), parseInt(height), wallet.options.checkMinerTx);
            });
            Promise.all(promisesBlocks)
                .then(function (arrayOfTxs) {
                arrayOfTxs.forEach(function (txs) {
                    txs.forEach(function (rawTx) {
                        var txData = TransactionsExplorer_1.TransactionsExplorer.parse(rawTx, wallet);
                        if (txData === null || txData === void 0 ? void 0 : txData.transaction) {
                            wallet.addNew(txData.transaction);
                            wallet.addDeposits(txData.deposits);
                            wallet.addWithdrawals(txData.withdrawals);
                        }
                    });
                });
            })
                .catch(console.error);
        }
    }
});
