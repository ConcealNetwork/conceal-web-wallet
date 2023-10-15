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
    exports.decode = exports.encode = void 0;
    var MSB = 0x80;
    var REST = 0x7f;
    var MSBALL = ~REST;
    var INT = Math.pow(2, 31);
    var TWO_POWER_SEVEN = Math.pow(2, 7);
    exports.encode = function (num, out, offset) {
        if (out === void 0) { out = []; }
        if (offset === void 0) { offset = 0; }
        if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
            exports.encode.bytes = 0;
            throw new RangeError('Could not encode varint');
        }
        var oldOffset = offset;
        while (num >= INT) {
            out[offset++] = (num & 0xff) | MSB;
            num /= 128;
        }
        while (num & MSBALL) {
            out[offset++] = (num & 0xff) | MSB;
            num >>>= 7;
        }
        out[offset] = num | 0;
        exports.encode.bytes = offset - oldOffset + 1;
        return out;
    };
    exports.decode = function (buf, offset) {
        if (offset === void 0) { offset = 0; }
        var res = 0, shift = 1, counter = offset, b;
        var l = Math.pow(TWO_POWER_SEVEN, buf.length - offset < 8 ? (buf.length - offset) * 7 : 49);
        do {
            if (shift > l) {
                exports.decode.bytes = 0;
                throw new RangeError('Could not decode varint');
            }
            b = buf[counter++];
            res += (b & REST) * shift;
            shift = shift * TWO_POWER_SEVEN;
        } while (b >= MSB);
        exports.decode.bytes = counter - offset;
        return res;
    };
});
