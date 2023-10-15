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
            var self = this;
            setTimeout(function () {
                blockchainExplorer.getHeight().then(function (currentHeight) {
                    var seed = Cn_1.CnNativeBride.sc_reduce32(Cn_1.CnRandom.rand_32());
                    var keys = Cn_1.Cn.create_address(seed);
                    var newWallet = new Wallet_1.Wallet();
                    newWallet.keys = KeysRepository_1.KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);
                    var height = currentHeight - 10;
                    if (height < 0)
                        height = 0;
                    newWallet.lastHeight = height;
                    newWallet.creationHeight = height;
                    self.newWallet = newWallet;
                    Translations_1.Translations.getLang().then(function (userLang) {
                        var langToExport = 'english';
                        for (var _i = 0, _a = MnemonicLang_1.MnemonicLang.getLangs(); _i < _a.length; _i++) {
                            var lang = _a[_i];
                            if (lang.shortLang === userLang) {
                                langToExport = lang.name;
                                break;
                            }
                        }
                        var phrase = Mnemonic_1.Mnemonic.mn_encode(newWallet.keys.priv.spend, langToExport);
                        if (phrase !== null)
                            self.mnemonicPhrase = phrase;
                    });
                    setTimeout(function () {
                        self.step = 1;
                    }, 2000);
                });
            }, 0);
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
            if (this.walletPassword !== '' && (!this.insecurePassword || this.forceInsecurePassword)) {
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
                window.location.href = '#account';
            }
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], CreateViewWallet.prototype, "step", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
        ], CreateViewWallet.prototype, "walletPassword", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)('')
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
            (0, VueAnnotate_1.VueVar)('')
        ], CreateViewWallet.prototype, "mnemonicPhrase", void 0);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], CreateViewWallet.prototype, "walletPasswordWatch", null);
        __decorate([
            (0, VueAnnotate_1.VueWatched)()
        ], CreateViewWallet.prototype, "stepWatch", null);
        return CreateViewWallet;
    }(DestructableView_1.DestructableView));
    new CreateViewWallet('#app');
});
