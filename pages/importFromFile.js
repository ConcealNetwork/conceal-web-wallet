/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
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
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/AppState", "../model/Password", "../providers/BlockchainExplorerProvider", "../model/WalletRepository"], function (require, exports, DestructableView_1, VueAnnotate_1, AppState_1, Password_1, BlockchainExplorerProvider_1, WalletRepository_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    AppState_1.AppState.enableLeftMenu();
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var ImportView = /** @class */ (function (_super) {
        __extends(ImportView, _super);
        function ImportView(container) {
            var _this = _super.call(this, container) || this;
            _this.rawFile = null;
            _this.invalidRawFile = false;
            return _this;
        }
        ImportView.prototype.formValid = function () {
            if (this.password != this.password2)
                return false;
            if (!(this.password !== '' && (!this.insecurePassword || this.forceInsecurePassword)))
                return false;
            if (this.rawFile === null)
                return false;
            return true;
        };
        ImportView.prototype.selectFile = function () {
            var self = this;
            var element = $('<input type="file">');
            self.invalidRawFile = true;
            self.fileSelected = false;
            element.on('change', function (event) {
                var files = event.target.files; // FileList object
                if (files.length > 0) {
                    self.fileName = files[0].name;
                    var fileReader_1 = new FileReader();
                    fileReader_1.onload = function () {
                        try {
                            if (typeof fileReader_1.result === "string") {
                                self.rawFile = JSON.parse(fileReader_1.result);
                            }
                            self.invalidRawFile = false;
                            self.fileSelected = true;
                        }
                        catch (e) {
                            self.invalidRawFile = true;
                            self.fileSelected = false;
                            swal({
                                type: 'error',
                                title: i18n.t('global.error'),
                                text: i18n.t('importFromFilePage.walletBlock.invalidFile'),
                                confirmButtonText: i18n.t('global.confirmText'),
                            });
                        }
                    };
                    fileReader_1.readAsText(files[0]);
                }
            });
            element.click();
        };
        ImportView.prototype.importWallet = function () {
            return __awaiter(this, void 0, void 0, function () {
                var self, currentHeight, newWallet, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            self = this;
                            $('#pageLoading').show();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 6, , 7]);
                            return [4 /*yield*/, blockchainExplorer.initialize()];
                        case 2:
                            _a.sent();
                            // Add a small delay to ensure nodes are fully ready
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                        case 3:
                            // Add a small delay to ensure nodes are fully ready
                            _a.sent();
                            return [4 /*yield*/, blockchainExplorer.getHeight()];
                        case 4:
                            currentHeight = _a.sent();
                            $('#pageLoading').hide();
                            // Small delay before wallet operations
                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                        case 5:
                            // Small delay before wallet operations
                            _a.sent();
                            newWallet = WalletRepository_1.WalletRepository.decodeWithPassword(self.rawFile, self.password);
                            if (newWallet !== null) {
                                newWallet.recalculateIfNotViewOnly();
                                AppState_1.AppState.openWallet(newWallet, self.password);
                                window.location.href = '#account';
                            }
                            else {
                                swal({
                                    type: 'error',
                                    title: i18n.t('global.invalidPasswordModal.title'),
                                    text: i18n.t('global.invalidPasswordModal.content'),
                                    confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText'),
                                });
                            }
                            console.log("Current height: ", currentHeight);
                            return [3 /*break*/, 7];
                        case 6:
                            err_1 = _a.sent();
                            console.log('Import wallet failed:', err_1);
                            $('#pageLoading').hide();
                            return [3 /*break*/, 7];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        ImportView.prototype.passwordWatch = function () {
            if (!Password_1.Password.checkPasswordConstraints(this.password, false)) {
                this.insecurePassword = true;
            }
            else
                this.insecurePassword = false;
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
            (0, VueAnnotate_1.VueVar)(false)
        ], ImportView.prototype, "fileSelected", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], ImportView.prototype, "fileName", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], ImportView.prototype, "passwordWatch", null);
        return ImportView;
    }(DestructableView_1.DestructableView));
    new ImportView('#app');
});
