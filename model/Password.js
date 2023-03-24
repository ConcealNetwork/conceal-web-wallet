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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Password = void 0;
    var Password = /** @class */ (function () {
        function Password() {
        }
        Password.checkPasswordConstraints = function (password, raiseError) {
            if (raiseError === void 0) { raiseError = true; }
            var anUpperCase = /[A-Z]/;
            var aLowerCase = /[a-z]/;
            var aNumber = /[0-9]/;
            var aSpecial = /[!|@|'|"|#|$|%|^|&|*|(|)|-|_]/;
            var numUpper = 0;
            var numLower = 0;
            var numNums = 0;
            var numSpecials = 0;
            for (var i = 0; i < password.length; i++) {
                if (anUpperCase.test(password[i]))
                    numUpper++;
                else if (aLowerCase.test(password[i]))
                    numLower++;
                else if (aNumber.test(password[i]))
                    numNums++;
                else if (aSpecial.test(password[i]))
                    numSpecials++;
            }
            if (password.length < 8 || numUpper < 1 || numLower < 1 || numNums < 1 || numSpecials < 1) {
                if (raiseError) {
                    swal({
                        type: 'error',
                        title: i18n.t('global.passwordNotComplexEnoughModal.title'),
                        text: i18n.t('global.passwordInvalidRequirements'),
                        confirmButtonText: i18n.t('global.passwordNotComplexEnoughModal.confirmText'),
                    });
                }
                return false;
            }
            return true;
        };
        return Password;
    }());
    exports.Password = Password;
});
