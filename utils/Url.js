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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Url = void 0;
    var Url = /** @class */ (function () {
        function Url() {
        }
        Url.transformSearchParametersToAssocArray = function (prmstr) {
            var params = {};
            var prmarr = prmstr.split("&");
            for (var i = 0; i < prmarr.length; i++) {
                var tmparr = prmarr[i].split("=");
                if (typeof params[tmparr[0]] !== 'undefined') {
                    if (!Array.isArray(params[tmparr[0]]))
                        params[tmparr[0]] = [params[tmparr[0]]];
                    params[tmparr[0]].push(tmparr[1]);
                }
                else
                    params[tmparr[0]] = tmparr[1];
            }
            return params;
        };
        Url.getSearchParameters = function () {
            var paramsStart = window.location.href.indexOf('?');
            if (paramsStart != -1) {
                var paramsEnd = window.location.href.indexOf('#', paramsStart);
                paramsEnd = paramsEnd == -1 ? window.location.href.length : paramsEnd;
                return Url.transformSearchParametersToAssocArray(window.location.href.substring(paramsStart + 1, paramsEnd));
            }
            return {};
        };
        Url.getHashSearchParameters = function () {
            var paramsStart = window.location.hash.indexOf('?');
            if (paramsStart != -1) {
                return Url.transformSearchParametersToAssocArray(window.location.hash.substring(paramsStart + 1, window.location.hash.length));
            }
            return {};
        };
        Url.getHashSearchParameter = function (parameterName, defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var parameters = this.getHashSearchParameters();
            if (typeof parameters[parameterName] !== 'undefined')
                return parameters[parameterName];
            return defaultValue;
        };
        return Url;
    }());
    exports.Url = Url;
});
