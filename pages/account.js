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
define(["require", "exports", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../lib/numbersLab/DestructableView", "../model/Constants", "../model/AppState", "../model/WalletWatchdog", "../model/Translations"], function (require, exports, VueAnnotate_1, DependencyInjector_1, Wallet_1, DestructableView_1, Constants_1, AppState_1, WalletWatchdog_1, Translations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    var blockchainExplorer = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Constants_1.Constants.BLOCKCHAIN_EXPLORER);
    var walletWatchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name, 'default', false);
    var AccountView = /** @class */ (function (_super) {
        __extends(AccountView, _super);
        function AccountView(container) {
            var _this = _super.call(this, container) || this;
            _this.isInitialized = false;
            _this.messagesCountRecord = 0;
            _this.refreshInterval = 500;
            _this.initMessagesCount = wallet.txsMem.concat(wallet.getTransactionsCopy()).filter(function (tx) { return tx.message; }).length;
            _this.unsubscribeTicker = null;
            _this.optimizePanelTimeout = null;
            _this.destruct = function () {
                // Cleanup ticker subscription
                if (_this.unsubscribeTicker) {
                    _this.unsubscribeTicker();
                }
                if (_this.optimizePanelTimeout)
                    clearTimeout(_this.optimizePanelTimeout);
                clearInterval(_this.intervalRefresh);
                return _super.prototype.destruct.call(_this);
            };
            _this.refresh = function () {
                blockchainExplorer.getHeight().then(function (height) {
                    _this.blockchainHeight = height;
                    _this.refreshWallet();
                    _this.updateMessageNotifications();
                }).catch(function (err) {
                    _this.refreshWallet();
                });
            };
            _this.onFilterChanged = function () {
                _this.refreshWallet();
            };
            _this.checkOptimization = function () {
                blockchainExplorer.getHeight()
                    .then(function (blockchainHeight) {
                    try {
                        var optimizeInfo = wallet.optimizationNeeded(blockchainHeight, config.optimizeThreshold);
                        _this.optimizeIsNeeded = optimizeInfo.isNeeded;
                        if (optimizeInfo.isNeeded) {
                            _this.optimizeOutputs = optimizeInfo.numOutputs;
                            _this.showOptimizePanel = true;
                            if (_this.optimizePanelTimeout)
                                clearTimeout(_this.optimizePanelTimeout);
                            _this.optimizePanelTimeout = setTimeout(function () {
                                _this.showOptimizePanel = false;
                            }, 20000);
                        }
                        else {
                            _this.showOptimizePanel = false;
                            if (_this.optimizePanelTimeout)
                                clearTimeout(_this.optimizePanelTimeout);
                        }
                    }
                    catch (innerError) {
                        if (innerError === null)
                            return;
                        throw innerError;
                    }
                })
                    .catch(function (err) {
                    if (err === null)
                        return;
                    console.error("Error in checkOptimization:", err);
                });
            };
            _this.optimizeWallet = function () {
                _this.optimizeLoading = true; // set loading state to true
                blockchainExplorer.getHeight().then(function (blockchainHeight) {
                    wallet.createFusionTransaction(blockchainHeight, config.optimizeThreshold, blockchainExplorer, function (amounts, numberOuts) {
                        return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                    }).then(function (processedOuts) {
                        var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                        //force a mempool check so the user is up to date
                        if (watchdog !== null) {
                            watchdog.checkMempool();
                        }
                        _this.optimizeLoading = false; // set loading state to false
                        setTimeout(function () {
                            _this.checkOptimization(); // check if optimization is still needed
                        }, 1000);
                    }).catch(function (err) {
                        console.error("optimize error:", err);
                        _this.optimizeLoading = false; // set loading state to false
                        setTimeout(function () {
                            _this.checkOptimization(); // check if optimization is still needed
                        }, 1000);
                    });
                }).catch(function (err) {
                    console.error("Error in optimizeWallet, trying to call getHeight", err);
                });
            };
            _this.increasePageCount = function () {
                ++_this.pagesCount;
                _this.refreshWallet(true);
            };
            _this.moreInfoOnTx = function (transaction) {
                var explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
                var explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
                var feesHtml = '';
                if (transaction.fees > 0) {
                    feesHtml = "<div><span class=\"txDetailsLabel\">".concat(i18n.t('accountPage.txDetails.feesOnTx'), "</span>:<span class=\"txDetailsValue\">").concat((transaction.fees / Math.pow(10, config.coinUnitPlaces)), "</a></span></div>");
                }
                var paymentId = '';
                if (transaction.paymentId) {
                    paymentId = "<div><span class=\"txDetailsLabel\">".concat(i18n.t('accountPage.txDetails.paymentId'), "</span>:<span class=\"txDetailsValue\">").concat(transaction.paymentId, "</a></span></div>");
                }
                var txPrivKeyMessage = '';
                var txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
                if (txPrivKey) {
                    txPrivKeyMessage = "<div><span class=\"txDetailsLabel\">".concat(i18n.t('accountPage.txDetails.txPrivKey'), "</span>:<span class=\"txDetailsValue\">").concat(txPrivKey, "</a></span></div>");
                }
                var messageText = '';
                if (transaction.message) {
                    messageText = "<div><span class=\"txDetailsLabel\">".concat(i18n.t('accountPage.txDetails.message'), "</span>:<div style=\"color: #e2e2e2; border: 1px solid #212529; border-radius: 4px; background-color: #343a40; padding: 8px; margin-top: 4px;\"><span class=\"txDetailsValue\">").concat(transaction.message, "</span></div></div>");
                    // Set message as viewed and update the transaction in wallet
                    wallet.updateTransactionFlags(transaction.hash, { messageViewed: true });
                }
                new Promise(function (resolve) {
                    setTimeout(function () {
                        swal({
                            title: i18n.t('accountPage.txDetails.title'),
                            customClass: 'swal-wide',
                            html: "\n            <div class=\"tl\" >\n              <div><span class=\"txDetailsLabel\">".concat(i18n.t('accountPage.txDetails.txHash'), "</span>:<span class=\"txDetailsValue\"><a href=\"").concat(explorerUrlHash.replace('{ID}', transaction.hash), "\" target=\"_blank\">").concat(transaction.hash, "</a></span></div>\n              ").concat(paymentId, "\n              ").concat(feesHtml, "\n              ").concat(txPrivKeyMessage, "\n              <div><span class=\"txDetailsLabel\">").concat(i18n.t('accountPage.txDetails.blockHeight'), "</span>:<span class=\"txDetailsValue\"><a href=\"").concat(explorerUrlBlock.replace('{ID}', '' + transaction.blockHeight), "\" target=\"_blank\">").concat(transaction.blockHeight, "</a></span></div>\n              ").concat(transaction.fusion ? '<div><span class="txDetailsLabel">Fusion:</span><span class="txDetailsValue">true</span></div>' : '', "\n              ").concat(messageText, "\n            </div>")
                        });
                        resolve(true);
                        // Force UI update after the modal is shown
                        _this.refreshWallet(true);
                    }, 500);
                });
            };
            _this.refreshWallet = function (forceRedraw) {
                if (forceRedraw === void 0) { forceRedraw = false; }
                var filterChanged = false;
                var oldIsWalletSyncing = _this.isWalletSyncing;
                var timeDiff = new Date().getTime() - _this.refreshTimestamp.getTime();
                _this.processingTxQueue = walletWatchdog.getBlockList().getTxQueue().getSize();
                _this.processingQueue = walletWatchdog.getBlockList().getSize();
                _this.lastBlockLoading = walletWatchdog.getLastBlockLoading();
                _this.currentScanBlock = wallet.lastHeight;
                _this.isWalletSyncing = (wallet.lastHeight + 2) < _this.blockchainHeight;
                _this.isWalletProcessing = _this.isWalletSyncing || (walletWatchdog.getBlockList().getTxQueue().hasData());
                if (oldIsWalletSyncing && !_this.isWalletSyncing) {
                    _this.checkOptimization();
                }
                if (_this.oldTxFilter !== _this.txFilter) {
                    timeDiff = 2 * _this.refreshInterval;
                    _this.oldTxFilter = _this.txFilter;
                    filterChanged = true;
                }
                if ((((_this.refreshTimestamp < wallet.modifiedTimestamp()) || (_this.lastPending > 0)) && (timeDiff > _this.refreshInterval)) || forceRedraw || filterChanged) {
                    logDebugMsg("refreshWallet", _this.currentScanBlock);
                    _this.walletAmount = wallet.amount;
                    _this.unlockedWalletAmount = wallet.availableAmount(_this.currentScanBlock);
                    _this.depositedWalletAmount = wallet.lockedDeposits(_this.currentScanBlock);
                    _this.withdrawableWalletAmount = wallet.unlockedDeposits(_this.currentScanBlock);
                    _this.lastPending = _this.walletAmount - _this.unlockedWalletAmount;
                    _this.futureLockedInterest = wallet.futureDepositInterest(_this.currentScanBlock).locked;
                    _this.futureUnlockedInterest = wallet.futureDepositInterest(_this.currentScanBlock).unlocked;
                    if ((_this.refreshTimestamp < wallet.modifiedTimestamp()) || forceRedraw || filterChanged) {
                        var allTransactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());
                        if (_this.txFilter) {
                            allTransactions = allTransactions.filter(function (tx) {
                                return (tx.hash.toUpperCase().includes(_this.txFilter.toUpperCase()) ||
                                    tx.paymentId.toUpperCase().includes(_this.txFilter.toUpperCase()) ||
                                    tx.getAmount().toString().toUpperCase().includes(_this.txFilter.toUpperCase()));
                            });
                        }
                        _this.transactions = allTransactions.slice(0, _this.pagesCount * _this.txPerPage);
                        _this.allTransactionsCount = allTransactions.length;
                        if (!_this.isWalletSyncing) {
                            _this.checkOptimization();
                        }
                    }
                    // set new refresh timestamp to
                    _this.refreshTimestamp = new Date();
                }
            };
            _this.download = function () {
                // credit: https://www.bitdegree.org/learn/javascript-download
                var text = JSON.stringify(_this.transactions);
                var filename = 'cats.json';
                var element = document.createElement('a');
                element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            };
            _this.refreshTimestamp = new Date(0);
            _this.lastPending = 0;
            _this.pagesCount = 1;
            _this.txPerPage = 200;
            _this.oldTxFilter = '';
            _this.txFilter = '';
            // Initialize ticker from store
            Translations_1.tickerStore.initialize().then(function () {
                _this.useShortTicker = Translations_1.tickerStore.useShortTicker;
                _this.ticker = Translations_1.tickerStore.currentTicker;
                // Subscribe to ticker changes
                _this.unsubscribeTicker = Translations_1.tickerStore.subscribe(function (useShortTicker) {
                    _this.useShortTicker = useShortTicker;
                    _this.ticker = Translations_1.tickerStore.currentTicker;
                });
            });
            _this.checkOptimization();
            AppState_1.AppState.enableLeftMenu();
            _this.intervalRefresh = setInterval(function () {
                _this.refresh();
            }, 1 * 1000);
            _this.refresh();
            _this.showOptimizePanel = false;
            window.accountView = _this;
            return _this;
        }
        AccountView.prototype.updateMessageNotifications = function () {
            if (!this.isInitialized) {
                this.initMessagesCount = wallet.txsMem.concat(wallet.getTransactionsCopy()).filter(function (tx) { return tx.message; }).length;
                this.isInitialized = true;
            }
            else {
                var previousMessagesCount = this.initMessagesCount;
                var currentMessagesCount = wallet.txsMem.concat(wallet.getTransactionsCopy()).filter(function (tx) { return tx.message; }).length;
                var newMessagesCount = currentMessagesCount - previousMessagesCount;
                if (newMessagesCount > this.messagesCountRecord) {
                    var messageItem = document.querySelector('#menu a[href="#!messages"]');
                    if (messageItem) {
                        var messageText = messageItem.querySelector('span:last-child');
                        if (messageText && messageText.textContent) {
                            messageItem.classList.add('font-bold');
                            if (messageText.textContent.includes('(+')) {
                                messageText.textContent = messageText.textContent.split('(')[0] + "(+".concat(newMessagesCount, ")");
                            }
                            else {
                                messageText.textContent += " (+".concat(newMessagesCount, ")");
                            }
                        }
                        this.messagesCountRecord = newMessagesCount;
                    }
                }
            }
        };
        AccountView.prototype.getTTLCountdown = function (transaction) {
            if (!transaction.ttl || transaction.ttl === 0 || transaction.blockHeight !== 0) {
                return '';
            }
            var currentTimestamp = Math.floor(Date.now() / 1000);
            var remainingSeconds = transaction.ttl - currentTimestamp;
            if (remainingSeconds <= 0) {
                return 'Expired';
            }
            var hours = Math.floor(remainingSeconds / 3600);
            var minutes = Math.floor((remainingSeconds % 3600) / 60);
            var seconds = remainingSeconds % 60;
            if (hours > 0) {
                return "".concat(hours, "h ").concat(minutes, "m ").concat(seconds, "s");
            }
            else if (minutes > 0) {
                return "".concat(minutes, "m ").concat(seconds, "s");
            }
            else {
                return "".concat(seconds, "s");
            }
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], AccountView.prototype, "transactions", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], AccountView.prototype, "txFilter", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "lastBlockLoading", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "processingTxQueue", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "processingQueue", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "walletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "unlockedWalletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "depositedWalletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "withdrawableWalletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "futureLockedInterest", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "futureUnlockedInterest", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "allTransactionsCount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "pagesCount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "txPerPage", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], AccountView.prototype, "ticker", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "useShortTicker", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "currentScanBlock", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "blockchainHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(Math.pow(10, config.coinUnitPlaces))
        ], AccountView.prototype, "currencyDivider", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "isWalletProcessing", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "optimizeIsNeeded", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "optimizeLoading", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "isWalletSyncing", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "optimizeOutputs", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "showDepositsFuture", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "showWithdrawableFuture", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "isInitialized", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], AccountView.prototype, "messagesCountRecord", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], AccountView.prototype, "showOptimizePanel", void 0);
        return AccountView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new AccountView('#app');
    else
        window.location.href = '#index';
});
