define(["require", "exports"], function (require, exports) {
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
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.JSChaCha8 = void 0;
    var JSChaCha8 = /** @class */ (function () {
        function JSChaCha8(bufKey, bufNonce, counter) {
            var _this = this;
            this.getBuffer = function (size) {
                return Buffer.alloc(size);
            };
            /*
             * Little-endian to uint 32 bytes
             *
             * @param {Uint8Array|[number]} data
             * @param {number} index
             * @return {number}
             * @private
             */
            this.get32 = function (data, index) {
                return data[index++] ^ (data[index++] << 8) ^ (data[index++] << 16) ^ (data[index] << 24);
            };
            /*
             * The basic operation of the ChaCha algorithm is the quarter round.
             * It operates on four 32-bit unsigned integers, denoted a, b, c, and d.
             *
             * @param {Array} output
             * @param {number} a
             * @param {number} b
             * @param {number} c
             * @param {number} d
             * @private
             */
            this.quarterround = function (output, a, b, c, d) {
                output[d] = _this.rotl(output[d] ^ (output[a] += output[b]), 16);
                output[b] = _this.rotl(output[b] ^ (output[c] += output[d]), 12);
                output[d] = _this.rotl(output[d] ^ (output[a] += output[b]), 8);
                output[b] = _this.rotl(output[b] ^ (output[c] += output[d]), 7);
                // JavaScript hack to make UINT32 :) //
                output[a] >>>= 0;
                output[b] >>>= 0;
                output[c] >>>= 0;
                output[d] >>>= 0;
            };
            this.chacha = function () {
                var mix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                var b = 0;
                // copy param array to mix //
                for (var i = 0; i < 16; i++) {
                    mix[i] = _this.param[i];
                }
                // mix rounds //
                for (var i = 0; i < _this.rounds; i += 2) {
                    _this.quarterround(mix, 0, 4, 8, 12);
                    _this.quarterround(mix, 1, 5, 9, 13);
                    _this.quarterround(mix, 2, 6, 10, 14);
                    _this.quarterround(mix, 3, 7, 11, 15);
                    _this.quarterround(mix, 0, 5, 10, 15);
                    _this.quarterround(mix, 1, 6, 11, 12);
                    _this.quarterround(mix, 2, 7, 8, 13);
                    _this.quarterround(mix, 3, 4, 9, 14);
                }
                for (var i = 0; i < 16; i++) {
                    // add
                    mix[i] += _this.param[i];
                    // store keystream
                    _this.keystream[b++] = mix[i] & 0xFF;
                    _this.keystream[b++] = (mix[i] >>> 8) & 0xFF;
                    _this.keystream[b++] = (mix[i] >>> 16) & 0xFF;
                    _this.keystream[b++] = (mix[i] >>> 24) & 0xFF;
                }
            };
            /**
             * Cyclic left rotation
             *
             * @param {number} data
             * @param {number} shift
             * @return {number}
             * @private
             */
            this.rotl = function (data, shift) {
                return ((data << shift) | (data >>> (32 - shift)));
            };
            /**
             *  Encrypt data with key and nonce
             *
             * @param {Buffer} data
             * @return {Buffer}
             */
            this.encrypt = function (data) {
                return _this.update(data);
            };
            /**
             *  Decrypt data with key and nonce
             *
             * @param {Buffer} data
             * @return {Buffer}
             */
            this.decrypt = function (data) {
                return _this.update(data);
            };
            /**
             *  Encrypt or Decrypt data with key and nonce
             *
             * @param {Uint8Array} data
             * @return {Uint8Array}
             * @private
             */
            this.update = function (data) {
                if (!(data instanceof Uint8Array) || data.length === 0) {
                    throw new Error('Data should be type of bytes (Uint8Array) and not empty!');
                }
                var output = new Uint8Array(data.length);
                // core function, build block and xor with input data //
                for (var i = 0; i < data.length; i++) {
                    if (_this.byteCounter === 0 || _this.byteCounter === 64) {
                        // generate new block //
                        _this.chacha();
                        // counter increment //
                        _this.param[12]++;
                        // reset internal counter //
                        _this.byteCounter = 0;
                    }
                    output[i] = data[i] ^ _this.keystream[_this.byteCounter++];
                }
                return output;
            };
            if (typeof counter === 'undefined') {
                counter = 0;
            }
            if (!(bufKey instanceof Uint8Array) || bufKey.length !== 32) {
                throw new Error('Key should be 32 byte buffer!');
            }
            if (!(bufNonce instanceof Uint8Array) || bufNonce.length !== 12) {
                throw new Error('Nonce should be 12 byte buffer!');
            }
            var key = new Uint8Array(bufKey);
            var nonce = new Uint8Array(bufNonce);
            var dummyArray = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
            this.rounds = 8;
            this.sigma = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574]; // expand 32-byte k
            // param construction
            this.param = [
                this.sigma[0],
                this.sigma[1],
                this.sigma[2],
                this.sigma[3],
                // key
                this.get32(key, 0),
                this.get32(key, 4),
                this.get32(key, 8),
                this.get32(key, 12),
                this.get32(key, 16),
                this.get32(key, 20),
                this.get32(key, 24),
                this.get32(key, 28),
                this.get32(dummyArray, 0),
                this.get32(dummyArray, 4),
                // nonce
                this.get32(nonce, 0),
                this.get32(nonce, 4),
            ];
            // init 64 byte keystream block //
            this.keystream = [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ];
            // internal byte counter //
            this.byteCounter = 0;
        }
        return JSChaCha8;
    }());
    exports.JSChaCha8 = JSChaCha8;
});
