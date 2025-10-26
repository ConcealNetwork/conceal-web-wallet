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
define(["require", "exports", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DestructableView", "../model/KeysRepository", "../model/Wallet", "../model/Password", "../providers/BlockchainExplorerProvider", "../model/Mnemonic", "../model/AppState", "../model/WalletRepository", "../model/Translations", "../model/MnemonicLang", "../model/Cn"], function (require, exports, VueAnnotate_1, DestructableView_1, KeysRepository_1, Wallet_1, Password_1, BlockchainExplorerProvider_1, Mnemonic_1, AppState_1, WalletRepository_1, Translations_1, MnemonicLang_1, Cn_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var CreateViewWallet = /** @class */ (function (_super) {
        __extends(CreateViewWallet, _super);
        function CreateViewWallet(container) {
            var _this = _super.call(this, container) || this;
            _this.generateWallet();
            AppState_1.AppState.enableLeftMenu();
            return _this;
        }
        CreateViewWallet.prototype.destruct = function () {
            return _super.prototype.destruct.call(this);
        };
        CreateViewWallet.prototype.generateWallet = function () {
            return __awaiter(this, void 0, void 0, function () {
                var self;
                return __generator(this, function (_a) {
                    self = this;
                    setTimeout(function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var currentHeight, seed, keys, newWallet, height, userLang, langToExport, _i, _a, lang, phrase, err_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        $("#pageLoading").show();
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 5, , 6]);
                                        return [4 /*yield*/, blockchainExplorer.initialize()];
                                    case 2:
                                        _b.sent();
                                        return [4 /*yield*/, blockchainExplorer.getHeight()];
                                    case 3:
                                        currentHeight = _b.sent();
                                        $("#pageLoading").hide();
                                        seed = Cn_1.CnNativeBride.sc_reduce32(Cn_1.CnRandom.rand_32());
                                        keys = Cn_1.Cn.create_address(seed);
                                        newWallet = new Wallet_1.Wallet();
                                        newWallet.keys = KeysRepository_1.KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);
                                        height = currentHeight - 10;
                                        if (height < 0)
                                            height = 0;
                                        newWallet.lastHeight = height;
                                        newWallet.creationHeight = height;
                                        self.newWallet = newWallet;
                                        return [4 /*yield*/, Translations_1.Translations.getLang()];
                                    case 4:
                                        userLang = _b.sent();
                                        langToExport = "english";
                                        for (_i = 0, _a = MnemonicLang_1.MnemonicLang.getLangs(); _i < _a.length; _i++) {
                                            lang = _a[_i];
                                            if (lang.shortLang === userLang) {
                                                langToExport = lang.name;
                                                break;
                                            }
                                        }
                                        phrase = Mnemonic_1.Mnemonic.mn_encode(newWallet.keys.priv.spend, langToExport);
                                        if (phrase !== null)
                                            self.mnemonicPhrase = phrase;
                                        setTimeout(function () {
                                            self.step = 1;
                                        }, 2000);
                                        return [3 /*break*/, 6];
                                    case 5:
                                        err_1 = _b.sent();
                                        console.log("Wallet generation failed:", err_1);
                                        $("#pageLoading").hide();
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        });
                    }, 0);
                    return [2 /*return*/];
                });
            });
        };
        CreateViewWallet.prototype.walletPasswordWatch = function () {
            if (!Password_1.Password.checkPasswordConstraints(this.walletPassword, false)) {
                this.insecurePassword = true;
            }
            else
                this.insecurePassword = false;
        };
        CreateViewWallet.prototype.stepWatch = function () {
            $("html, body").animate({ scrollTop: 0 }, "fast");
        };
        CreateViewWallet.prototype.forceInsecurePasswordCheck = function () {
            var self = this;
            /*swal({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    type: 'warning',
                    showCancelButton: true,
                    reverseButtons:true,
                    confirmButtonText: 'Yes'
                }).then((result:{value:boolean}) => {
                    if (result.value) {*/
            self.forceInsecurePassword = true;
            // }
            // });
        };
        CreateViewWallet.prototype.exportStep = function () {
            if (this.walletPassword !== "" && (!this.insecurePassword || this.forceInsecurePassword)) {
                this.step = 2;
            }
        };
        CreateViewWallet.prototype.downloadBackup = function () {
            if (this.newWallet !== null)
                WalletRepository_1.WalletRepository.downloadEncryptedPdf(this.newWallet);
            this.walletBackupMade = true;
        };
        CreateViewWallet.prototype.finish = function () {
            if (this.newWallet !== null) {
                AppState_1.AppState.openWallet(this.newWallet, this.walletPassword);
                window.location.href = "#account";
            }
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], CreateViewWallet.prototype, "step", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("")
        ], CreateViewWallet.prototype, "walletPassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("")
        ], CreateViewWallet.prototype, "walletPassword2", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], CreateViewWallet.prototype, "insecurePassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], CreateViewWallet.prototype, "forceInsecurePassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], CreateViewWallet.prototype, "walletBackupMade", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(null)
        ], CreateViewWallet.prototype, "newWallet", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)("")
        ], CreateViewWallet.prototype, "mnemonicPhrase", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], CreateViewWallet.prototype, "walletPasswordWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], CreateViewWallet.prototype, "stepWatch", null);
        return CreateViewWallet;
    }(DestructableView_1.DestructableView));
    new CreateViewWallet("#app");
});
