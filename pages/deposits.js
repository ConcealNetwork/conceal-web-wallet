/*
 * Copyright (c) 2022 - 2025, Conceal Devs
 * Copyright (c) 2022 - 2025, Conceal Network
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/TransactionsExplorer", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../model/AppState", "../providers/BlockchainExplorerProvider", "../model/WalletWatchdog", "../model/WalletRepository", "../model/Interest", "../model/Translations"], function (require, exports, DestructableView_1, VueAnnotate_1, TransactionsExplorer_1, DependencyInjector_1, Wallet_1, AppState_1, BlockchainExplorerProvider_1, WalletWatchdog_1, WalletRepository_1, Interest_1, Translations_1) {
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
            _this.refreshTimestamp = new Date(0);
            _this.ndefListener = null;
            _this.unsubscribeTicker = null;
            _this.destruct = function () {
                // Cleanup ticker subscription
                if (_this.unsubscribeTicker) {
                    _this.unsubscribeTicker();
                }
                clearInterval(_this.intervalRefresh);
                return _super.prototype.destruct.call(_this);
            };
            _this.refresh = function () {
                blockchainExplorer.getHeight().then(function (height) {
                    _this.isWalletSyncing = (wallet.lastHeight + 2) < height;
                    _this.blockchainHeight = height;
                    _this.refreshWallet();
                    // Update isDepositDisabled based on syncing status and max amount
                    _this.isDepositDisabled = _this.isWalletSyncing || _this.maxDepositAmount < 1;
                    _this.isWithdrawDisabled = _this.isWalletSyncing;
                }).catch(function (err) {
                    _this.refreshWallet();
                });
            };
            _this.refreshWallet = function (forceRedraw) {
                if (forceRedraw === void 0) { forceRedraw = false; }
                _this.deposits = wallet.getDepositsCopy().reverse();
                _this.currentScanBlock = wallet.lastHeight;
                var timeDiff = new Date().getTime() - _this.refreshTimestamp.getTime();
                if ((((_this.refreshTimestamp < wallet.modifiedTimestamp()) || (_this.lastPending > 0)) && (timeDiff > _this.refreshInterval)) || forceRedraw /*|| filterChanged*/) {
                    logDebugMsg("refreshWallet", _this.currentScanBlock);
                    _this.walletAmount = wallet.amount;
                    _this.unlockedWalletAmount = wallet.availableAmount(_this.currentScanBlock);
                    // Calculate the maximum deposit amount
                    _this.maxDepositAmount = Math.floor((_this.unlockedWalletAmount - config.coinFee) / _this.currencyDivider);
                    // Recap calculations
                    _this.totalLifetimeDeposit = _this.deposits.reduce(function (sum, d) { return sum + d.amount; }, 0);
                    _this.totalLifetimeInterest = _this.deposits.reduce(function (sum, d) { return sum + d.interest; }, 0);
                    var future = wallet.futureDepositInterest(_this.currentScanBlock);
                    _this.totalCashedOutInterest = future.spent;
                    _this.futureInterestLocked = future.locked;
                    _this.futureInterestUnlocked = future.unlocked;
                    _this.depositPending = wallet.hasPendingDeposit;
                    // Earliest unlockable
                    var earliest = wallet.earliestUnlockableDeposit(_this.currentScanBlock);
                    if (earliest) {
                        var unlockTimestamp = (earliest.timestamp + (earliest.term * 120)) * 1000;
                        _this.earliestUnlockableDate = new Date(unlockTimestamp).toLocaleDateString();
                        var now = Date.now();
                        _this.earliestUnlockableIsPast = unlockTimestamp < now;
                    }
                    else {
                        _this.earliestUnlockableDate = '-';
                        _this.earliestUnlockableIsPast = false;
                    }
                }
                _this.refreshTimestamp = new Date();
            };
            _this.moreInfoOnDeposit = function (deposit) {
                var explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
                var explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
                var status = deposit.getStatus(_this.blockchainHeight);
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
                /*
                    if ((deposit.blockHeight + deposit.term) <= this.blockchainHeight) {
                      if (deposit.spentTx) {
                        status = 'Spent'
                      } else {
                        status = 'Unlocked'
                      }
                    }
                */
                swal({
                    title: i18n.t('depositsPage.depositDetails.title'),
                    customClass: 'swal-wide',
                    html: "\n        <div class=\"tl\" >\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.txHash') + "</span>:<span class=\"txDetailsValue\"><a href=\"" + explorerUrlHash.replace('{ID}', deposit.txHash) + "\" target=\"_blank\">" + deposit.txHash + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.spendingTx') + "</span>:<span class=\"txDetailsValue\"><a href=\"" + explorerUrlHash.replace('{ID}', deposit.spentTx) + "\" target=\"_blank\">" + deposit.spentTx + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.status') + "</span>:<span class=\"txDetailsValue\">" + status + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.amount') + "</span>:<span class=\"txDetailsValue\">" + (deposit.amount / Math.pow(10, config.coinUnitPlaces)) + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.term') + "</span>:<span class=\"txDetailsValue\">" + deposit.term + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.creationHeight') + "</span>:<span class=\"txDetailsValue\">" + deposit.blockHeight + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.creationTime') + "</span>:<span class=\"txDetailsValue\">" + new Date(creatingTimestamp * 1000).toDateString() + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.unlockHeight') + "</span>:<span class=\"txDetailsValue\">" + (deposit.unlockHeight) + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.interest') + "</span>:<span class=\"txDetailsValue\">" + (deposit.interest / Math.pow(10, config.coinUnitPlaces)) + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.spendingTime') + "</span>:<span class=\"txDetailsValue\">" + (spendingTimestamp == 0 ? "unspent" : new Date(spendingTimestamp * 1000).toDateString()) + "</a></span></div>\n          <div><span class=\"txDetailsLabel\">" + i18n.t('depositsPage.depositDetails.spendingHeight') + "</span>:<span class=\"txDetailsValue\">" + (spendingHeight == 0 ? "unspent" : spendingHeight) + "</a></span></div>\n        </div>"
                });
            };
            _this.withdrawDeposit = function (deposit) { return __awaiter(_this, void 0, void 0, function () {
                var foundDeposit_1, blockchainHeight_1, mixinToSendWith, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, 3, 4]);
                            this.lockedForm = true;
                            foundDeposit_1 = this.deposits.find(function (d) {
                                return d.txHash === deposit.txHash &&
                                    d.globalOutputIndex === deposit.globalOutputIndex;
                            });
                            if (!foundDeposit_1 || foundDeposit_1.withdrawPending || foundDeposit_1.isSpent()) {
                                swal({
                                    type: 'error',
                                    title: i18n.t('depositsPage.withdrawError'),
                                    text: i18n.t('depositsPage.withdrawPending')
                                });
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, blockchainExplorer.getHeight()];
                        case 1:
                            blockchainHeight_1 = _a.sent();
                            mixinToSendWith = config.defaultMixin;
                            TransactionsExplorer_1.TransactionsExplorer.createWithdrawTx(foundDeposit_1, wallet, blockchainHeight_1, function (amounts, numberOuts) {
                                // For withdrawals, we don't need mixins, so return empty array
                                return Promise.resolve([]);
                            }, function (amount, feesAmount) {
                                if (feesAmount > wallet.availableAmount(blockchainHeight_1)) {
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
                                                amount: (amount + feesAmount) / Math.pow(10, config.coinUnitPlaces),
                                                fees: feesAmount / Math.pow(10, config.coinUnitPlaces),
                                                total: amount / Math.pow(10, config.coinUnitPlaces),
                                            }),
                                            showCancelButton: true,
                                            confirmButtonText: i18n.t('sendPage.confirmTransactionModal.confirmText'),
                                            cancelButtonText: i18n.t('sendPage.confirmTransactionModal.cancelText'),
                                        }).then(function (result) {
                                            if (result.dismiss) {
                                                reject('');
                                            }
                                            else {
                                                wallet.updateDepositFlags(foundDeposit_1.txHash, { withdrawPending: true }); // Update the deposit in the wallet
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
                                    }, 500);
                                });
                            }, mixinToSendWith, "", "", 0, "withdraw", foundDeposit_1.term).then(function (rawTxData) {
                                //console.log('Raw transaction data:', rawTxData.raw.raw);
                                blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
                                    setTimeout(function () {
                                        //save the tx private key
                                        wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);
                                        //force a mempool check so the user is up to date
                                        var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                                        if (watchdog !== null)
                                            watchdog.checkMempool();
                                        // Success
                                        swal({
                                            type: 'success',
                                            title: i18n.t('depositsPage.createDeposit.withdrawSuccess'),
                                            html: "TxHash:<br>\n                <a href=\"".concat(config.mainnetExplorerUrlHash.replace('{ID}', rawTxData.raw.hash), "\" \n                target=\"_blank\" class=\"tx-hash-value\">").concat(rawTxData.raw.hash, "</a>")
                                        });
                                        var promise = Promise.resolve();
                                        promise.then(function () {
                                            console.log('Withdrawal successfully submitted to the blockchain');
                                        });
                                    }, 5);
                                }).catch(function (data) {
                                    setTimeout(function () {
                                        wallet.updateDepositFlags(foundDeposit_1.txHash, { withdrawPending: false });
                                        swal({
                                            type: 'error',
                                            title: i18n.t('sendPage.transferExceptionModal.title'),
                                            html: i18n.t('sendPage.transferExceptionModal.content', { details: JSON.stringify(data) }),
                                            confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                                        });
                                    }, 5);
                                });
                                swal.close();
                            }).catch(function (error) {
                                setTimeout(function () {
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
                                }, 100);
                            });
                            return [3 /*break*/, 4];
                        case 2:
                            error_1 = _a.sent();
                            console.error('Error withdrawing deposit:', error_1);
                            swal({
                                type: 'error',
                                title: i18n.t('depositsPage.withdrawError'),
                                text: error_1 instanceof Error ? error_1.message : String(error_1)
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            this.lockedForm = false;
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            }); };
            _this.createDeposit = function (amount, term) { return __awaiter(_this, void 0, void 0, function () {
                var blockchainHeight_2, amountToDeposit, fee, neededAmount, termToDeposit, destinationAddress, mixinToSendWith, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, 3, 4]);
                            this.lockedForm = true;
                            return [4 /*yield*/, blockchainExplorer.getHeight()];
                        case 1:
                            blockchainHeight_2 = _a.sent();
                            amountToDeposit = new JSBigInt(amount).multiply(new JSBigInt(Math.pow(10, config.coinUnitPlaces)));
                            fee = new JSBigInt(config.coinFee);
                            neededAmount = amountToDeposit.add(fee);
                            if (neededAmount > wallet.availableAmount(blockchainHeight_2)) {
                                console.log('Not enough money to deposit');
                                return [2 /*return*/];
                            }
                            termToDeposit = term > 12 ? 12 * config.depositMinTermBlock : term * config.depositMinTermBlock;
                            destinationAddress = wallet.getPublicAddress();
                            mixinToSendWith = config.defaultMixin;
                            // Get all blocked deposit indices to filter randomOuts-------- <---------- WIP
                            /*const blockedIndex = this.deposits
                              .filter(deposit => deposit.getStatus(this.blockchainHeight) === 'Locked')
                              .map(deposit => deposit.outputIndex);
                            */
                            TransactionsExplorer_1.TransactionsExplorer.createTx([{ address: destinationAddress, amount: amountToDeposit }], "", wallet, blockchainHeight_2, function (amounts, numberOuts) {
                                return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                            }, function (amount, feesAmount) {
                                if (amount + feesAmount > wallet.availableAmount(blockchainHeight_2)) {
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
                                else if (amount < config.depositMinAmountCoin * Math.pow(10, config.coinUnitPlaces)) {
                                    swal({
                                        type: 'error',
                                        title: i18n.t('depositsPage.createDeposit.amountError'),
                                        confirmButtonText: 'OK'
                                    });
                                    throw '';
                                }
                                return Promise.resolve();
                            }, mixinToSendWith, "", 0, "deposit", termToDeposit).then(function (rawTxData) {
                                // console.log(JSON.stringify(rawTxData, null, 2));
                                blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
                                    //save the tx private key
                                    wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);
                                    //force a mempool check so the user is up to date
                                    var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                                    if (watchdog !== null)
                                        watchdog.checkMempool();
                                    // Success
                                    swal({
                                        type: 'success',
                                        title: i18n.t('depositsPage.createDeposit.createSuccess'),
                                        html: "TxHash:<br>\n                <a href=\"".concat(config.mainnetExplorerUrlHash.replace('{ID}', rawTxData.raw.hash), "\" \n                target=\"_blank\" class=\"tx-hash-value\">").concat(rawTxData.raw.hash, "</a>")
                                    });
                                    var promise = Promise.resolve();
                                    promise.then(function () {
                                        console.log('Deposit successfully submitted to the blockchain');
                                    });
                                }).catch(function (error) {
                                    console.error('Transaction creation error:', error);
                                    // Wait a short moment to ensure all console logs are printed
                                    setTimeout(function () {
                                        swal({
                                            type: 'error',
                                            title: i18n.t('sendPage.transferExceptionModal.title'),
                                            html: i18n.t('sendPage.transferExceptionModal.content', {
                                                details: error instanceof Error ? error.message : JSON.stringify(error)
                                            }),
                                            confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                                        });
                                    }, 100);
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
                            return [3 /*break*/, 4];
                        case 2:
                            error_2 = _a.sent();
                            console.error('Error creating deposit:', error_2);
                            swal({
                                type: 'error',
                                title: i18n.t('depositsPage.createError'),
                                text: error_2 instanceof Error ? error_2.message : String(error_2)
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            this.lockedForm = false;
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            }); };
            // Store the instance reference
            DepositsView.currentInstance = _this;
            _this.isWalletSyncing = true;
            _this.isDepositDisabled = true;
            _this.isWithdrawDisabled = true;
            _this.ticker = config.coinSymbol;
            AppState_1.AppState.enableLeftMenu();
            // Initialize the modal method here
            _this.showCreateDepositModal = function () {
                // Reset values before showing modal
                _this.depositAmount = 0;
                _this.depositTerm = config.depositMinTermMonth; // default initial term
                // Calculate max amount once to ensure consistency
                var maxAmount = _this.maxDepositAmount;
                swal({
                    title: i18n.t('depositsPage.createDeposit.title'),
                    html: "\n          <div class=\"deposit-form\" style=\"width: 100%; max-width: 400px; margin: 0 auto;\">\n            <div class=\"input-group\" style=\"margin-bottom: 20px;\">\n              <input id=\"depositAmount\" type=\"number\" min=\"".concat(config.depositMinAmountCoin, "\" step=\"1\" max=\"").concat(maxAmount, "\" pattern=\"\\d*\" class=\"swal2-input\" \n                placeholder=\"").concat(i18n.t('depositsPage.createDeposit.amount'), "\"\n                onkeypress=\"return event.charCode >= 48 && event.charCode <= 57\"\n                style=\"width: 100%; max-width: 300px; margin: 8px auto;\">\n              <p style=\"text-align: center; color: #666; margin: 4px 0 0 0; font-size: 0.9em; cursor: pointer;\" id=\"maxAmountText\">\n                ").concat(i18n.t('depositsPage.createDeposit.maxAmount', { amount: maxAmount }), "\n              </p>\n            </div>\n            <div class=\"input-group\">\n              <input id=\"depositTerm\" type=\"number\" min=\"").concat(config.depositMinTermMonth, "\" max=\"").concat(config.depositMaxTermMonth, "\" step=\"1\" pattern=\"\\d*\" class=\"swal2-input\" \n                placeholder=\"").concat(i18n.t('depositsPage.createDeposit.term'), "\"\n                onkeypress=\"return event.charCode >= 48 && event.charCode <= 57\"\n                style=\"width: 100%; max-width: 300px; margin: 8px auto;\">\n            </div>\n            <p style=\"text-align: center; color: #666; margin: 10px 0 0 0; font-size: 1em; font-weight: bold;\" id=\"rewardText\">\n              ").concat(i18n.t('depositsPage.createDeposit.rewardAtTerm', { reward: '0' }), "\n            </p>\n          </div>\n        "),
                    showCancelButton: true,
                    confirmButtonText: i18n.t('depositsPage.createDeposit.confirm'),
                    cancelButtonText: i18n.t('depositsPage.createDeposit.cancel'),
                    onOpen: function () {
                        var _a;
                        // Add click event handler to the maximum amount text
                        (_a = document.getElementById('maxAmountText')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                            var depositAmountInput = document.getElementById('depositAmount');
                            if (depositAmountInput) {
                                depositAmountInput.value = maxAmount.toString();
                                // Update reward info based on the new amount value
                                updateRewardInfo();
                            }
                        });
                        // Add input event listener to update reward information when deposit amount changes
                        var depositAmountInput = document.getElementById('depositAmount');
                        var depositTermInput = document.getElementById('depositTerm');
                        if (depositAmountInput) {
                            depositAmountInput.addEventListener('input', function () {
                                updateRewardInfo();
                            });
                        }
                        // Add input event listener for term changes as well
                        if (depositTermInput) {
                            depositTermInput.addEventListener('input', function () {
                                updateRewardInfo();
                            });
                        }
                        // Function to update the reward calculation
                        function updateRewardInfo() {
                            var amount = parseInt(document.getElementById('depositAmount').value) || 0;
                            var term = parseInt(document.getElementById('depositTerm').value) || 0;
                            var aprIndex = 0;
                            if (amount >= 20000) {
                                aprIndex = 2;
                            }
                            else if (amount >= 10000) {
                                aprIndex = 1;
                            }
                            // Calculate interest using the InterestCalculator class
                            var termBlocks = term * config.depositMinTermBlock; // Convert term (months) to blocks
                            // Get current blockchain height for interest calculation
                            blockchainExplorer.getHeight().then(function (height) {
                                // Calculate the interest using our Interest class
                                var reward = Interest_1.InterestCalculator.calculateInterest(amount * Math.pow(10, config.coinUnitPlaces), // Convert to atomic units
                                termBlocks, height) / Math.pow(10, config.coinUnitPlaces); // Convert back to human-readable amount
                                // Update reward text
                                var rewardText = document.getElementById('rewardText');
                                if (rewardText) {
                                    // First format with full decimal places
                                    var rewardFixed = reward.toFixed(config.coinUnitPlaces); // 6 decimals
                                    // Remove trailing zeros using a for loop (up to 4 times)
                                    for (var i = 0; i < 4; i++) {
                                        if (rewardFixed.endsWith('0')) {
                                            rewardFixed = rewardFixed.slice(0, -1);
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    rewardText.textContent = i18n.t('depositsPage.createDeposit.rewardAtTerm', { reward: rewardFixed });
                                }
                            }).catch(function (error) {
                                console.log('Failed to get blockchain height:', error);
                                // Fallback to the old calculation method if we can't get the height
                                var aprRate = config.depositRateV3[aprIndex];
                                var adjustedRate = aprRate + (term - 1) * 0.001;
                                var reward = amount * term * adjustedRate / 12;
                                // Update reward text
                                var rewardText = document.getElementById('rewardText');
                                if (rewardText) {
                                    var rewardFixed = reward.toFixed(config.coinUnitPlaces);
                                    for (var i = 0; i < 4; i++) {
                                        if (rewardFixed.endsWith('0')) {
                                            rewardFixed = rewardFixed.slice(0, -1);
                                        }
                                        else {
                                            break;
                                        }
                                    }
                                    rewardText.textContent = i18n.t('depositsPage.createDeposit.rewardAtTerm', { reward: rewardFixed });
                                }
                            });
                        }
                        // Initialize the reward display when the modal opens
                        updateRewardInfo();
                    },
                    preConfirm: function () {
                        var amountInput = document.getElementById('depositAmount').value;
                        var termInput = document.getElementById('depositTerm').value;
                        // Clean and validate amount
                        var cleanAmount = amountInput.replace(/[^0-9]/g, '');
                        var amount = parseInt(cleanAmount);
                        // Clean and validate term
                        var cleanTerm = termInput.replace(/[^0-9]/g, '');
                        var term = parseInt(cleanTerm);
                        // Validate amount
                        if (isNaN(amount) || amount < 1 || !Number.isInteger(amount) || amount > maxAmount) {
                            swal({
                                title: i18n.t('depositsPage.createDeposit.amountError'),
                                type: 'error',
                                confirmButtonText: 'OK'
                            });
                            return false;
                        }
                        // Validate term
                        if (isNaN(term) || term < 1 || term > 12 || !Number.isInteger(term)) {
                            swal({
                                title: i18n.t('depositsPage.createDeposit.termError'),
                                type: 'error',
                                confirmButtonText: 'OK'
                            });
                            return false;
                        }
                        // Store values directly on the instance using our static reference
                        if (DepositsView.currentInstance) {
                            DepositsView.currentInstance.depositAmount = amount;
                            DepositsView.currentInstance.depositTerm = term;
                        }
                        return true;
                    }
                }).then(function (result) {
                    if (result && result.value) {
                        // After initial modal confirmation, show password prompt
                        return swal({
                            title: i18n.t('depositsPage.confirmDeposit.title'),
                            text: i18n.t('depositsPage.confirmDeposit.message', {
                                amount: _this.depositAmount,
                                term: _this.depositTerm
                            }),
                            input: 'password',
                            showCancelButton: true,
                            confirmButtonText: i18n.t('depositsPage.confirmDeposit.confirm'),
                            cancelButtonText: i18n.t('depositsPage.confirmDeposit.cancel')
                        });
                    }
                }).then(function (result) {
                    if (result && result.value) {
                        var savePassword = result.value;
                        // Show loading state
                        swal({
                            type: 'info',
                            title: i18n.t('global.loading'),
                            onOpen: function () {
                                swal.showLoading();
                            }
                        });
                        // Verify password using WalletRepository
                        return WalletRepository_1.WalletRepository.getLocalWalletWithPassword(savePassword)
                            .then(function (wallet) {
                            if (wallet !== null) {
                                // Password is correct, proceed with deposit creation
                                swal.close();
                                return _this.createDeposit(_this.depositAmount, _this.depositTerm);
                            }
                            else {
                                // Password is incorrect
                                return swal({
                                    type: 'error',
                                    title: i18n.t('global.invalidPasswordModal.title'),
                                    text: i18n.t('global.invalidPasswordModal.content'),
                                    confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText')
                                });
                            }
                        })
                            .catch(function (error) {
                            console.error('Error validating password:', error);
                            return swal({
                                type: 'error',
                                title: i18n.t('global.error'),
                                text: i18n.t('global.invalidPasswordModal.content')
                            });
                        });
                    }
                }).catch(function (error) {
                    console.error('Error in deposit modal:', error);
                });
            };
            _this.intervalRefresh = setInterval(function () {
                _this.refresh();
            }, 3 * 1000);
            _this.refresh();
            // Initialize ticker from store
            Translations_1.tickerStore.initialize().then(function () {
                _this.ticker = Translations_1.tickerStore.currentTicker;
                // Subscribe to ticker changes
                _this.unsubscribeTicker = Translations_1.tickerStore.subscribe(function () {
                    _this.ticker = Translations_1.tickerStore.currentTicker;
                });
            });
            return _this;
        }
        DepositsView.prototype.reset = function () {
            this.lockedForm = false;
            this.openAliasValid = false;
        };
        // Add this as a class property
        DepositsView.currentInstance = null;
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
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "walletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "unlockedWalletAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "lastPending", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "currentScanBlock", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], DepositsView.prototype, "isWalletSyncing", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], DepositsView.prototype, "openAliasValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(Math.pow(10, config.coinUnitPlaces))
        ], DepositsView.prototype, "currencyDivider", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "maxDepositAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], DepositsView.prototype, "isDepositDisabled", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], DepositsView.prototype, "isWithdrawDisabled", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], DepositsView.prototype, "depositPending", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "totalLifetimeDeposit", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "totalLifetimeInterest", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "totalCashedOutInterest", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "futureInterestLocked", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "futureInterestUnlocked", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], DepositsView.prototype, "earliestUnlockableDate", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], DepositsView.prototype, "earliestUnlockableIsPast", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], DepositsView.prototype, "ticker", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], DepositsView.prototype, "depositAmount", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(1)
        ], DepositsView.prototype, "depositTerm", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(new JSBigInt(window.config.coinFee))
        ], DepositsView.prototype, "coinFee", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)()
        ], DepositsView.prototype, "showCreateDepositModal", void 0);
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
