/**
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2020, The Masari Project
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VueFilterHashrate = exports.VueFilterFiat = exports.VueFilterPiconero = exports.VueFilterSatoshis = void 0;
    function VueFilterSatoshis(value) {
        return '₿ ' + value.toFixed(8);
    }
    exports.VueFilterSatoshis = VueFilterSatoshis;
    function VueFilterPiconero(value) {
        return value.toFixed(12);
    }
    exports.VueFilterPiconero = VueFilterPiconero;
    function VueFilterFiat(value, currency) {
        if (currency == 'usd' || currency == 'aud' || currency == 'cad' || currency == 'nzd') {
            return '$ ' + value.toFixed(2);
        }
        if (currency == 'eur') {
            return '€ ' + value.toFixed(2);
        }
        if (currency == 'jpy') {
            return '¥ ' + value.toFixed(2);
        }
        if (currency == 'gbp') {
            return '£ ' + value.toFixed(2);
        }
        if (currency == 'chf') {
            return 'Fr. ' + value.toFixed(2);
        }
        if (currency == 'sek') {
            return 'kr ' + value.toFixed(2);
        }
        if (currency == 'czk') {
            return 'CZK ' + value.toFixed(2);
        }
        if (currency == 'eth') {
            return 'Ξ ' + value.toFixed(2);
        }
        if (currency == 'ltc') {
            return 'Ł ' + value.toFixed(2);
        }
    }
    exports.VueFilterFiat = VueFilterFiat;
    function VueFilterHashrate(hashrate) {
        var i = 0;
        var byteUnits = ['H', 'kH', 'MH', 'GH', 'TH', 'PH', 'EH', 'ZH', 'YH'];
        while (hashrate > 1000) {
            hashrate = hashrate / 1000;
            i++;
        }
        return hashrate.toFixed(2) + byteUnits[i];
    }
    exports.VueFilterHashrate = VueFilterHashrate;
});
