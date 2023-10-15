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
'use strict'
 
export class JSChaCha8 {
  private rounds: number;
  private sigma: any[];
  private keystream: any[];
  private byteCounter: number;
  private param: any[];
   
  constructor (bufKey: Uint8Array, bufNonce: Uint8Array, counter?: number) {
    if (typeof counter === 'undefined') {
      counter = 0
    }
  
    if (!(bufKey instanceof Uint8Array) || bufKey.length !== 32) {
      throw new Error('Key should be 32 byte buffer!')
    }
  
    if (!(bufNonce instanceof Uint8Array) || bufNonce.length !== 12) {
      throw new Error('Nonce should be 12 byte buffer!')
    }
  
    const key = new Uint8Array(bufKey)
    const nonce = new Uint8Array(bufNonce)
    const dummyArray = new Uint8Array([0,0,0,0,0,0,0,0]);
  
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
    ]
  
    // init 64 byte keystream block //
    this.keystream = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];
  
    // internal byte counter //
    this.byteCounter = 0      
  }

  getBuffer = (size: number): Buffer => {
    return Buffer.alloc(size);
   }
  
  /*
   * Little-endian to uint 32 bytes
   *
   * @param {Uint8Array|[number]} data
   * @param {number} index
   * @return {number}
   * @private
   */
  private get32 = (data: Uint8Array, index: number): number => {
    return data[index++] ^ (data[index++] << 8) ^ (data[index++] << 16) ^ (data[index] << 24);
  }

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
  private quarterround = (output: any[], a: number, b: number, c: number, d: number) => {
    output[d] = this.rotl(output[d] ^ (output[a] += output[b]), 16)
    output[b] = this.rotl(output[b] ^ (output[c] += output[d]), 12)
    output[d] = this.rotl(output[d] ^ (output[a] += output[b]), 8)
    output[b] = this.rotl(output[b] ^ (output[c] += output[d]), 7)

    // JavaScript hack to make UINT32 :) //
    output[a] >>>= 0
    output[b] >>>= 0
    output[c] >>>= 0
    output[d] >>>= 0
  }


  private chacha = () => {
    const mix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let b = 0;
  
    // copy param array to mix //
    for (let i = 0; i < 16; i++) {
      mix[i] = this.param[i];
    }
  
    // mix rounds //
    for (let i = 0; i < this.rounds; i += 2) {
      this.quarterround(mix, 0, 4, 8, 12);
      this.quarterround(mix, 1, 5, 9, 13);
      this.quarterround(mix, 2, 6, 10, 14);
      this.quarterround(mix, 3, 7, 11, 15);
  
      this.quarterround(mix, 0, 5, 10, 15);
      this.quarterround(mix, 1, 6, 11, 12);
      this.quarterround(mix, 2, 7, 8, 13);
      this.quarterround(mix, 3, 4, 9, 14);
    }
  
    for (let i = 0; i < 16; i++) {
      // add
      mix[i] += this.param[i]
  
      // store keystream
      this.keystream[b++] = mix[i] & 0xFF
      this.keystream[b++] = (mix[i] >>> 8) & 0xFF
      this.keystream[b++] = (mix[i] >>> 16) & 0xFF
      this.keystream[b++] = (mix[i] >>> 24) & 0xFF
    }
  }  

  /**
   * Cyclic left rotation
   *
   * @param {number} data
   * @param {number} shift
   * @return {number}
   * @private
   */
  private rotl = (data: any, shift: number) => {
    return ((data << shift) | (data >>> (32 - shift)))
  }

  /**
   *  Encrypt data with key and nonce
   *
   * @param {Buffer} data
   * @return {Buffer}
   */
  encrypt = (data: Uint8Array): Uint8Array => {
    return this.update(data);
  }

  /**
   *  Decrypt data with key and nonce
   *
   * @param {Buffer} data
   * @return {Buffer}
   */
  decrypt = (data: Uint8Array): Uint8Array => {
    return this.update(data);
  }

  /**
   *  Encrypt or Decrypt data with key and nonce
   *
   * @param {Uint8Array} data
   * @return {Uint8Array}
   * @private
   */
  private update = (data: Uint8Array): Uint8Array =>  {
    if (!(data instanceof Uint8Array) || data.length === 0) {
      throw new Error('Data should be type of bytes (Uint8Array) and not empty!')
    }

    var output = new Uint8Array(data.length)

    // core function, build block and xor with input data //
    for (var i = 0; i < data.length; i++) {
      if (this.byteCounter === 0 || this.byteCounter === 64) {
        // generate new block //

        this.chacha()
        // counter increment //
        this.param[12]++

        // reset internal counter //
        this.byteCounter = 0
      }

      output[i] = data[i] ^ this.keystream[this.byteCounter++]
    }

    return output
  }
}