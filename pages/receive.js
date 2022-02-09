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
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
define(["require", "exports", "../lib/numbersLab/DependencyInjector", "../model/Wallet", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/CoinUri", "../model/Nfc", "../model/Cn"], function (require, exports, DependencyInjector_1, Wallet_1, DestructableView_1, VueAnnotate_1, CoinUri_1, Nfc_1, Cn_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = DependencyInjector_1.DependencyInjectorInstance().getInstance(Wallet_1.Wallet.name, 'default', false);
    function setTextInClipboard(inputId) {
        /*let inputElement : HTMLInputElement = <HTMLInputElement>document.getElementById(inputId);
        let textarea : HTMLInputElement = <HTMLInputElement> document.getElementById('clipboardTextarea');
        if(textarea !== null && inputElement !== null) {
            textarea.value = inputElement.value;
            textarea.select();
        }
        try {
            document.execCommand('copy');
        } catch (err) {
        }*/
        var inputElement = document.getElementById(inputId);
        if (inputElement !== null) {
            inputElement.select();
        }
        try {
            document.execCommand('copy');
        }
        catch (err) {
        }
    }
    var AccountView = /** @class */ (function (_super) {
        __extends(AccountView, _super);
        function AccountView(container) {
            var _this = _super.call(this, container) || this;
            _this.hasNfc = _this.nfc.has;
            _this.hasWritableNfc = _this.nfc.writableNfc;
            _this.rawAddress = wallet.getPublicAddress();
            _this.address = wallet.getPublicAddress();
            _this.generateQrCode();
            return _this;
        }
        AccountView.prototype.stringToHex = function (str) {
            var hex = '';
            for (var i = 0; i < str.length; i++) {
                hex += '' + str.charCodeAt(i).toString(16);
            }
            return hex;
        };
        AccountView.prototype.amountWatch = function () {
            var parsedAmount = parseFloat(this.amount);
            if (!isNaN(parsedAmount)) {
                if (this.amount.indexOf('.') !== -1 && ('' + parsedAmount).indexOf('.') === -1)
                    this.amount = '' + parsedAmount + '.';
                else
                    this.amount = '' + parsedAmount;
            }
            else
                this.amount = '';
        };
        AccountView.prototype.paymentIdWatch = function () {
            if (this.paymentId !== '' && this.paymentId.length <= 8) {
                var paymentId8 = ('00000000' + this.stringToHex(this.paymentId)).slice(-16);
                //console.log(paymentId8+'==>'+this.stringToHex(this.paymentId));
                this.address = Cn_1.Cn.get_account_integrated_address(wallet.getPublicAddress(), paymentId8);
            }
            else
                this.address = wallet.getPublicAddress();
        };
        AccountView.prototype.generateQrCode = function () {
            var el = kjua({
                text: this.getAddressEncoded(),
                image: document.getElementById('qrCodeLogo'),
                size: 300,
                mode: 'image',
                mSize: 10,
                mPosX: 50,
                mPosY: 50,
            });
            $('#qrCodeContainer').html(el);
        };
        AccountView.prototype.getAddressEncoded = function () {
            return CoinUri_1.CoinUri.encodeTx(this.address, this.paymentId !== '' ? this.paymentId : null, this.amount !== '' ? this.amount : null, this.recipientName !== '' ? this.recipientName : null, this.txDescription !== '' ? this.txDescription : null);
        };
        AccountView.prototype.setInClipboard = function (inputId) {
            if (inputId === void 0) { inputId = 'rawAddress'; }
            setTextInClipboard(inputId);
        };
        AccountView.prototype.writeOnNfc = function () {
            var _this = this;
            swal({
                title: i18n.t('receivePage.waitingNfcToWriteModal.title'),
                html: i18n.t('receivePage.waitingNfcToWriteModal.content'),
                onOpen: function () {
                    swal.showLoading();
                },
                onClose: function () {
                    _this.nfc.cancelWriteNdef();
                }
            }).then(function (result) {
            });
            this.nfc.writeNdef({
                lang: 'en',
                content: this.getAddressEncoded()
            }).then(function () {
                swal({
                    type: 'success',
                    title: i18n.t('receivePage.waitingNfcToWriteModal.titleSuccess'),
                });
            }).catch(function (data) {
                if (data === 'tag_capacity') {
                    swal({
                        type: 'error',
                        title: i18n.t('receivePage.nfcErrorModal.titleInsufficientCapacity'),
                    });
                }
                else {
                    alert('Unknown error:' + JSON.stringify(data));
                    swal.close();
                }
                _this.nfc.cancelWriteNdef();
            });
        };
        AccountView.prototype.shareWithNfc = function () {
            var _this = this;
            swal({
                title: 'Sharing your payment address',
                html: 'Bring closer the other device to share your public information',
                onOpen: function () {
                    swal.showLoading();
                },
                onClose: function () {
                    _this.nfc.unshareNdef();
                }
            }).then(function (result) {
            });
            this.nfc.shareNdef({
                lang: 'en',
                content: this.getAddressEncoded()
            }).then(function () {
                swal({
                    type: 'success',
                    title: 'Information shared',
                });
                _this.nfc.unshareNdef();
            }).catch(function () {
                _this.nfc.unshareNdef();
            });
        };
        AccountView.prototype.destruct = function () {
            this.nfc.unshareNdef();
            this.nfc.cancelWriteNdef();
            swal.close();
            return _super.prototype.destruct.call(this);
        };
        __decorate([
            VueAnnotate_1.VueVar('')
        ], AccountView.prototype, "rawAddress", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], AccountView.prototype, "address", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], AccountView.prototype, "paymentId", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], AccountView.prototype, "amount", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], AccountView.prototype, "recipientName", void 0);
        __decorate([
            VueAnnotate_1.VueVar('')
        ], AccountView.prototype, "txDescription", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], AccountView.prototype, "hasNfc", void 0);
        __decorate([
            VueAnnotate_1.VueVar(false)
        ], AccountView.prototype, "hasWritableNfc", void 0);
        __decorate([
            DependencyInjector_1.Autowire(Nfc_1.Nfc.name)
        ], AccountView.prototype, "nfc", void 0);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], AccountView.prototype, "amountWatch", null);
        __decorate([
            VueAnnotate_1.VueWatched()
        ], AccountView.prototype, "paymentIdWatch", null);
        return AccountView;
    }(DestructableView_1.DestructableView));
    if (wallet !== null)
        new AccountView('#app');
    else
        window.location.href = '#index';
});
