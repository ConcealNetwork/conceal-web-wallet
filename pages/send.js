/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
 * Copyright (c) 2022, The Karbo Developers
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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/TransactionsExplorer", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../utils/Url", "../model/CoinUri", "../model/QRReader", "../model/AppState", "../providers/BlockchainExplorerProvider", "../model/Nfc", "../model/Cn", "../model/WalletWatchdog"], function (require, exports, DestructableView_1, VueAnnotate_1, TransactionsExplorer_1, DependencyInjector_1, Wallet_1, Url_1, CoinUri_1, QRReader_1, AppState_1, BlockchainExplorerProvider_1, Nfc_1, Cn_1, WalletWatchdog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, "default", false);
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    AppState_1.AppState.enableLeftMenu();
    var SendView = /** @class */ (function (_super) {
        __extends(SendView, _super);
        function SendView(container) {
            var _this = _super.call(this, container) || this;
            _this.qrReader = null;
            _this.timeoutResolveAlias = 0;
            _this.redirectUrlAfterSend = null;
            _this.ndefListener = null;
            _this.refresh = function () {
                blockchainExplorer
                    .getHeight()
                    .then(function (height) {
                    _this.blockchainHeight = height;
                    _this.isWalletSyncing = wallet.lastHeight + 2 < _this.blockchainHeight;
                    if (_this.oldIsWalletSyncing !== _this.isWalletSyncing && !_this.isWalletSyncing) {
                        _this.checkOptimization();
                    }
                    _this.oldIsWalletSyncing = _this.isWalletSyncing;
                })
                    .catch(function (err) {
                    // in case of error do nothing
                });
            };
            _this.destruct = function () {
                clearInterval(_this.intervalRefresh);
                _this.stopScan();
                _this.stopNfcScan();
                swal.close();
                return _super.prototype.destruct.call(_this);
            };
            _this.send = function () {
                var self = _this;
                blockchainExplorer
                    .getHeight()
                    .then(function (blockchainHeight) {
                    return __awaiter(this, void 0, void 0, function () {
                        var amount, amountToSend, destinationAddress_1, mixinToSendWith_1, destination_1;
                        return __generator(this, function (_a) {
                            amount = parseFloat(self.amountToSend);
                            if (self.destinationAddress !== null) {
                                //todo use BigInteger
                                if (amount * Math.pow(10, config.coinUnitPlaces) > wallet.availableAmount(blockchainHeight)) {
                                    swal({
                                        type: "error",
                                        title: i18n.t("sendPage.notEnoughMoneyModal.title"),
                                        text: i18n.t("sendPage.notEnoughMoneyModal.content"),
                                        confirmButtonText: i18n.t("sendPage.notEnoughMoneyModal.confirmText"),
                                    });
                                    return [2 /*return*/];
                                }
                                amountToSend = amount * Math.pow(10, config.coinUnitPlaces);
                                destinationAddress_1 = self.destinationAddress;
                                swal({
                                    title: i18n.t("sendPage.creatingTransferModal.title"),
                                    html: i18n.t("sendPage.creatingTransferModal.content"),
                                    onOpen: function () {
                                        swal.showLoading();
                                    },
                                });
                                mixinToSendWith_1 = config.defaultMixin;
                                destination_1 = [{ address: destinationAddress_1, amount: amountToSend }];
                                // Get fee address from session node for remote node fee
                                blockchainExplorer
                                    .getSessionNodeFeeAddress()
                                    .then(function (remoteFeeAddress) {
                                    if (remoteFeeAddress !== wallet.getPublicAddress()) {
                                        if (remoteFeeAddress !== "") {
                                            destination_1.push({
                                                address: remoteFeeAddress,
                                                amount: config.remoteNodeFee,
                                            });
                                        }
                                        else {
                                            destination_1.push({
                                                address: config.donationAddress,
                                                amount: config.remoteNodeFee,
                                            });
                                        }
                                    }
                                    TransactionsExplorer_1.TransactionsExplorer.createTx(destination_1, self.paymentId, wallet, blockchainHeight, function (amounts, numberOuts) {
                                        return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                                    }, function (amount, feesAmount) {
                                        if (amount + feesAmount > wallet.availableAmount(blockchainHeight)) {
                                            swal({
                                                type: "error",
                                                title: i18n.t("sendPage.notEnoughMoneyModal.title"),
                                                text: i18n.t("sendPage.notEnoughMoneyModal.content"),
                                                confirmButtonText: i18n.t("sendPage.notEnoughMoneyModal.confirmText"),
                                                onOpen: function () {
                                                    swal.hideLoading();
                                                },
                                            });
                                            throw "";
                                        }
                                        return new Promise(function (resolve, reject) {
                                            setTimeout(function () {
                                                //prevent bug with swal when code is too fast
                                                var feeInfo = "";
                                                if (remoteFeeAddress !== wallet.getPublicAddress()) {
                                                    feeInfo =
                                                        '<br><br><span style="font-size: 0.8em; font-style: italic; color: #666;">' +
                                                            "(" +
                                                            i18n.t("sendPage.confirmTransactionModal.remoteNodeFee", {
                                                                fee: config.remoteNodeFee / Math.pow(10, config.coinUnitPlaces),
                                                                symbol: config.coinSymbol,
                                                            }) +
                                                            ")" +
                                                            "</span>";
                                                }
                                                swal({
                                                    title: i18n.t("sendPage.confirmTransactionModal.title"),
                                                    html: i18n.t("sendPage.confirmTransactionModal.content", {
                                                        amount: amount / Math.pow(10, config.coinUnitPlaces),
                                                        fees: feesAmount / Math.pow(10, config.coinUnitPlaces),
                                                        total: (amount + feesAmount) / Math.pow(10, config.coinUnitPlaces),
                                                    }) + feeInfo,
                                                    showCancelButton: true,
                                                    confirmButtonText: i18n.t("sendPage.confirmTransactionModal.confirmText"),
                                                    cancelButtonText: i18n.t("sendPage.confirmTransactionModal.cancelText"),
                                                })
                                                    .then(function (result) {
                                                    if (result.dismiss) {
                                                        reject("");
                                                    }
                                                    else {
                                                        swal({
                                                            title: i18n.t("sendPage.finalizingTransferModal.title"),
                                                            html: i18n.t("sendPage.finalizingTransferModal.content"),
                                                            onOpen: function () {
                                                                swal.showLoading();
                                                            },
                                                        });
                                                        resolve();
                                                    }
                                                })
                                                    .catch(reject);
                                            }, 1);
                                        });
                                    }, mixinToSendWith_1, self.message, 0, "regular", 0)
                                        .then(function (rawTxData) {
                                        blockchainExplorer
                                            .sendRawTx(rawTxData.raw.raw)
                                            .then(function () {
                                            //save the tx private key
                                            wallet.addTxPrivateKeyWithTxHashAndFusion(rawTxData.raw.hash, rawTxData.raw.prvkey, false);
                                            //force a mempool check so the user is up to date
                                            var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                                            if (watchdog !== null)
                                                watchdog.checkMempool();
                                            var promise = Promise.resolve();
                                            if (destinationAddress_1 ===
                                                "ccx7NzuofXxcypov8Yqm2A118xT17HereBFjp3RScjzM7wncf8BRcnHZbACy63sWD71L7NmkJRgQKXFE3weCfAh31RAVFHgttf" ||
                                                destinationAddress_1 ===
                                                    "ccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj" ||
                                                destinationAddress_1 ===
                                                    "ccx7YZ4RC97fqMh1bmzrFtDoSSiEgvEYzhaLE53SR9bh4QrDBUhGUH3TCmXqv8MTLjJDtnCeeaT5bLC2ZSzp3ZmQ19DoiPLLXS") {
                                                promise = swal({
                                                    type: "success",
                                                    title: i18n.t("sendPage.thankYouDonationModal.title"),
                                                    text: i18n.t("sendPage.thankYouDonationModal.content"),
                                                    confirmButtonText: i18n.t("sendPage.thankYouDonationModal.confirmText"),
                                                    onClose: function () {
                                                        window.location.href = "#!account";
                                                    },
                                                });
                                            }
                                            else
                                                promise = swal({
                                                    type: "success",
                                                    title: i18n.t("sendPage.transferSentModal.title"),
                                                    confirmButtonText: i18n.t("sendPage.transferSentModal.confirmText"),
                                                    onClose: function () {
                                                        window.location.href = "#!account";
                                                    },
                                                });
                                            promise.then(function () {
                                                if (self.redirectUrlAfterSend !== null) {
                                                    window.location.href = window.encodeURIComponent(self.redirectUrlAfterSend.replace("{TX_HASH}", rawTxData.raw.hash));
                                                }
                                            });
                                        })
                                            .catch(function (error) {
                                            //console.log(error);
                                            if (error && error !== "") {
                                                var errorMessage = "";
                                                var errorTitle = i18n.t("sendPage.transferExceptionModal.title");
                                                if (typeof error === "string") {
                                                    errorMessage = error;
                                                }
                                                else if (error instanceof Error) {
                                                    errorMessage = error.message;
                                                }
                                                else {
                                                    errorMessage = JSON.stringify(error);
                                                }
                                                swal({
                                                    type: "error",
                                                    title: errorTitle,
                                                    html: i18n.t("sendPage.transferExceptionModal.content", { details: errorMessage }),
                                                    confirmButtonText: i18n.t("sendPage.transferExceptionModal.confirmText"),
                                                });
                                            }
                                        });
                                        swal.close();
                                    })
                                        .catch(function (error) {
                                        //console.log(error);
                                        if (error && error !== "") {
                                            var errorMessage = "";
                                            var errorTitle = i18n.t("sendPage.transferExceptionModal.title");
                                            if (typeof error === "string") {
                                                errorMessage = error;
                                            }
                                            else if (error instanceof Error) {
                                                errorMessage = error.message;
                                            }
                                            else {
                                                errorMessage = JSON.stringify(error);
                                            }
                                            swal({
                                                type: "error",
                                                title: errorTitle,
                                                html: i18n.t("sendPage.transferExceptionModal.content", {
                                                    details: errorMessage,
                                                }),
                                                confirmButtonText: i18n.t("sendPage.transferExceptionModal.confirmText"),
                                            });
                                        }
                                    });
                                })
                                    .catch(function (err) {
                                    console.error("Error getting session node fee address", err);
                                });
                            }
                            else {
                                swal({
                                    type: "error",
                                    title: i18n.t("sendPage.invalidAmountModal.title"),
                                    html: i18n.t("sendPage.invalidAmountModal.content"),
                                    confirmButtonText: i18n.t("sendPage.invalidAmountModal.confirmText"),
                                });
                            }
                            return [2 /*return*/];
                        });
                    });
                })
                    .catch(function (err) {
                    console.error("Error trying to send funds", err);
                });
            };
            _this.checkOptimization = function () {
                blockchainExplorer
                    .getHeight()
                    .then(function (blockchainHeight) {
                    var optimizeInfo = wallet.optimizationNeeded(blockchainHeight, config.optimizeThreshold);
                    logDebugMsg("optimizeInfo.numOutputs", optimizeInfo.numOutputs);
                    logDebugMsg("optimizeInfo.isNeeded", optimizeInfo.isNeeded);
                    _this.optimizeIsNeeded = optimizeInfo.isNeeded;
                    _this.showOptimizePanel = optimizeInfo.isNeeded;
                    if (optimizeInfo.isNeeded) {
                        _this.optimizeOutputs = optimizeInfo.numOutputs;
                        // Hide the panel after 20 seconds
                        setTimeout(function () {
                            _this.showOptimizePanel = false;
                        }, 20000);
                    }
                })
                    .catch(function (err) {
                    console.error("Error in checkOptimization, calling getHeight", err);
                });
            };
            _this.optimizeWallet = function () {
                _this.optimizeLoading = true; // set loading state to true
                blockchainExplorer
                    .getHeight()
                    .then(function (blockchainHeight) {
                    wallet
                        .createFusionTransaction(blockchainHeight, config.optimizeThreshold, blockchainExplorer, function (amounts, numberOuts) {
                        return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                    })
                        .then(function (processedOuts) {
                        var watchdog = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(WalletWatchdog_1.WalletWatchdog.name);
                        console.log("processedOuts", processedOuts);
                        //force a mempool check so the user is up to date
                        if (watchdog !== null) {
                            watchdog.checkMempool();
                        }
                        _this.optimizeLoading = false; // set loading state to false
                        setTimeout(function () {
                            _this.checkOptimization(); // check if optimization is still needed
                        }, 1000);
                    })
                        .catch(function (err) {
                        console.log(err);
                        _this.optimizeLoading = false; // set loading state to false
                        setTimeout(function () {
                            _this.checkOptimization(); // check if optimization is still needed
                        }, 1000);
                    });
                })
                    .catch(function (err) {
                    console.error("Error in optimizeWallet, calling getHeight", err);
                });
            };
            var sendAddress = Url_1.Url.getHashSearchParameter("address");
            var amount = Url_1.Url.getHashSearchParameter("amount");
            var destinationName = Url_1.Url.getHashSearchParameter("destName");
            var description = Url_1.Url.getHashSearchParameter("txDesc");
            var redirect = Url_1.Url.getHashSearchParameter("redirect");
            if (sendAddress !== null)
                _this.destinationAddressUser = sendAddress.substr(0, 256);
            if (amount !== null)
                _this.amountToSend = amount;
            if (destinationName !== null)
                _this.txDestinationName = destinationName.substr(0, 256);
            if (description !== null)
                _this.txDescription = description.substr(0, 256);
            if (redirect !== null)
                _this.redirectUrlAfterSend = decodeURIComponent(redirect);
            _this.maxMessageSize = config.maxMessageSize;
            _this.oldIsWalletSyncing = true;
            _this.isWalletSyncing = true;
            _this.blockchainHeight = -1;
            _this.checkOptimization();
            _this.nfcAvailable = _this.nfc.has;
            _this.intervalRefresh = setInterval(function () {
                _this.refresh();
            }, 1 * 1000);
            _this.refresh();
            return _this;
        }
        SendView.prototype.reset = function () {
            this.lockedForm = false;
            this.destinationAddressUser = "";
            this.destinationAddress = "";
            this.amountToSend = "0";
            this.destinationAddressValid = false;
            this.openAliasValid = false;
            this.qrScanning = false;
            this.amountToSendValid = false;
            this.domainAliasAddress = null;
            this.txDestinationName = null;
            this.txDescription = null;
            this.stopScan();
        };
        SendView.prototype.startNfcScan = function () {
            var _this = this;
            var self = this;
            if (this.ndefListener === null) {
                this.ndefListener = function (data) {
                    if (data.text)
                        self.handleScanResult(data.text.content);
                    swal.close();
                };
                this.nfc.listenNdef(this.ndefListener);
                swal({
                    title: i18n.t("sendPage.waitingNfcModal.title"),
                    html: i18n.t("sendPage.waitingNfcModal.content"),
                    onOpen: function () {
                        swal.showLoading();
                    },
                    onClose: function () {
                        _this.stopNfcScan();
                    },
                }).then(function (result) {
                    // do nothing
                });
            }
        };
        SendView.prototype.stopNfcScan = function () {
            if (this.ndefListener !== null)
                this.nfc.removeNdef(this.ndefListener);
            this.ndefListener = null;
        };
        SendView.prototype.initQr = function () {
            this.stopScan();
            this.qrReader = new QRReader_1.QRReader();
            this.qrReader.init("/lib/");
        };
        SendView.prototype.startScan = function () {
            var self = this;
            if (typeof window.QRScanner !== "undefined") {
                window.QRScanner.scan(function (err, result) {
                    if (err) {
                        if (err.name === "SCAN_CANCELED") {
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
                $("body").addClass("transparent");
                $("#appContent").hide();
                $("#nativeCameraPreview").show();
            }
            else {
                this.initQr();
                if (this.qrReader) {
                    this.qrScanning = true;
                    this.qrReader.scan(function (result) {
                        self.qrScanning = false;
                        self.handleScanResult(result);
                    });
                }
            }
        };
        SendView.prototype.handleScanResult = function (result) {
            //console.log('Scan result:', result);
            var self = this;
            var parsed = false;
            try {
                var txDetails = CoinUri_1.CoinUri.decodeTx(result);
                if (txDetails !== null) {
                    self.destinationAddressUser = txDetails.address;
                    if (typeof txDetails.description !== "undefined")
                        self.txDescription = txDetails.description;
                    if (typeof txDetails.recipientName !== "undefined")
                        self.txDestinationName = txDetails.recipientName;
                    if (typeof txDetails.amount !== "undefined") {
                        self.amountToSend = txDetails.amount;
                        self.lockedForm = true;
                    }
                    if (typeof txDetails.paymentId !== "undefined")
                        self.paymentId = txDetails.paymentId;
                    parsed = true;
                }
            }
            catch (e) { }
            try {
                var txDetails = CoinUri_1.CoinUri.decodeWallet(result);
                if (txDetails !== null) {
                    self.destinationAddressUser = txDetails.address;
                    parsed = true;
                }
            }
            catch (e) { }
            if (!parsed)
                self.destinationAddressUser = result;
            self.stopScan();
        };
        SendView.prototype.stopScan = function () {
            if (typeof window.QRScanner !== "undefined") {
                window.QRScanner.cancelScan(function (status) {
                    //console.log(status);
                });
                window.QRScanner.hide();
                $("body").removeClass("transparent");
                $("#appContent").show();
                $("#nativeCameraPreview").hide();
            }
            else {
                if (this.qrReader !== null) {
                    this.qrReader.stop();
                    this.qrReader = null;
                    this.qrScanning = false;
                }
            }
        };
        SendView.prototype.destinationAddressUserWatch = function () {
            if (this.destinationAddressUser.indexOf(".") !== -1) {
                var self_1 = this;
                if (this.timeoutResolveAlias !== 0)
                    clearTimeout(this.timeoutResolveAlias);
                this.timeoutResolveAlias = setTimeout(function () {
                    blockchainExplorer
                        .resolveOpenAlias(self_1.destinationAddressUser)
                        .then(function (data) {
                        try {
                            Cn_1.Cn.decode_address(data.address);
                            self_1.txDestinationName = data.name;
                            self_1.destinationAddress = data.address;
                            self_1.domainAliasAddress = data.address;
                            self_1.destinationAddressValid = true;
                            self_1.openAliasValid = true;
                        }
                        catch (e) {
                            self_1.destinationAddressValid = false;
                            self_1.openAliasValid = false;
                        }
                        self_1.timeoutResolveAlias = 0;
                    })
                        .catch(function () {
                        self_1.openAliasValid = false;
                        self_1.timeoutResolveAlias = 0;
                    });
                }, 400);
            }
            else {
                this.openAliasValid = true;
                try {
                    Cn_1.Cn.decode_address(this.destinationAddressUser);
                    this.destinationAddressValid = true;
                    this.destinationAddress = this.destinationAddressUser;
                }
                catch (e) {
                    this.destinationAddressValid = false;
                }
            }
        };
        SendView.prototype.amountToSendWatch = function () {
            // Allow only numbers and at most one dot
            this.amountToSend = this.amountToSend.replace(/[^0-9.]/g, "").replace(/(\\..*)\\./g, "$1");
            try {
                this.amountToSendValid = !isNaN(parseFloat(this.amountToSend));
            }
            catch (e) {
                this.amountToSendValid = false;
            }
        };
        SendView.prototype.paymentIdWatch = function () {
            try {
                this.paymentIdValid =
                    this.paymentId.length === 0 ||
                        (this.paymentId.length === 16 && /^[0-9a-fA-F]{16}$/.test(this.paymentId)) ||
                        (this.paymentId.length === 64 && /^[0-9a-fA-F]{64}$/.test(this.paymentId));
            }
            catch (e) {
                this.paymentIdValid = false;
            }
        };
        SendView.prototype.messageWatch = function () {
            try {
                this.messageValid = this.message.length === 0 || this.message.length <= config.maxMessageSize;
            }
            catch (e) {
                this.messageValid = false;
            }
        };
        SendView.prototype.mixinWatch = function () {
            try {
                this.mixinIsValid = !isNaN(parseFloat(this.mixIn));
                var mixin = parseFloat(this.mixIn);
                if (mixin > 10 || (mixin < 3 && mixin !== 0))
                    this.mixinIsValid = false;
            }
            catch (e) {
                this.mixinIsValid = false;
            }
        };
        SendView.prototype.onAmountFocus = function () {
            if (!this)
                return; // Safety check
            this.amountPlaceholder = "";
            if (this.amountToSend === "0")
                this.amountToSend = "";
        };
        SendView.prototype.onAmountBlur = function () {
            if (!this)
                return; // Safety check
            if (this.amountToSend === "")
                this.amountToSend = "0";
            this.amountPlaceholder = "0";
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)("")
        ], SendView.prototype, "destinationAddressUser", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("")
        ], SendView.prototype, "destinationAddress", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SendView.prototype, "destinationAddressValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("0")
        ], SendView.prototype, "amountToSend", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SendView.prototype, "lockedForm", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], SendView.prototype, "amountToSendValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("")
        ], SendView.prototype, "paymentId", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("")
        ], SendView.prototype, "message", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], SendView.prototype, "paymentIdValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], SendView.prototype, "messageValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("5")
        ], SendView.prototype, "mixIn", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], SendView.prototype, "mixinIsValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], SendView.prototype, "maxMessageSize", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], SendView.prototype, "domainAliasAddress", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], SendView.prototype, "txDestinationName", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], SendView.prototype, "txDescription", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(true)
        ], SendView.prototype, "openAliasValid", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SendView.prototype, "qrScanning", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SendView.prototype, "nfcAvailable", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SendView.prototype, "optimizeIsNeeded", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SendView.prototype, "optimizeLoading", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], SendView.prototype, "isWalletSyncing", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], SendView.prototype, "optimizeOutputs", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("0")
        ], SendView.prototype, "amountPlaceholder", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], SendView.prototype, "showOptimizePanel", void 0);
        __decorate([
            (0, DependencyInjector_1.Autowire)(Nfc_1.Nfc.name)
        ], SendView.prototype, "nfc", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SendView.prototype, "destinationAddressUserWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SendView.prototype, "amountToSendWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SendView.prototype, "paymentIdWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SendView.prototype, "messageWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], SendView.prototype, "mixinWatch", null);
        return SendView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null && blockchainExplorer !== null)
        new SendView("#app");
    else {
        AppState_1.AppState.askUserOpenWallet(false)
            .then(function () {
            wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, "default", false);
            if (wallet === null)
                throw "e";
            new SendView("#app");
        })
            .catch(function () {
            window.location.href = "#index";
        });
    }
});
