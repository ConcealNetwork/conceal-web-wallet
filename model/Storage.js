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
    exports.Storage = void 0;
    var LocalStorage = /** @class */ (function () {
        function LocalStorage() {
        }
        LocalStorage.prototype.setItem = function (key, value) {
            window.localStorage.setItem(key, value);
            return Promise.resolve();
        };
        LocalStorage.prototype.getItem = function (key, defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            var value = window.localStorage.getItem(key);
            if (value === null)
                return Promise.resolve(defaultValue);
            return Promise.resolve(value);
        };
        LocalStorage.prototype.keys = function () {
            var keys = [];
            for (var i = 0; i < window.localStorage.length; ++i) {
                var k = window.localStorage.key(i);
                if (k !== null)
                    keys.push(k);
            }
            return Promise.resolve(keys);
        };
        LocalStorage.prototype.remove = function (key) {
            window.localStorage.removeItem(key);
            return Promise.resolve();
        };
        LocalStorage.prototype.clear = function () {
            window.localStorage.clear();
            return Promise.resolve();
        };
        return LocalStorage;
    }());
    var NativeStorageWrap = /** @class */ (function () {
        function NativeStorageWrap() {
        }
        NativeStorageWrap.prototype.setItem = function (key, value) {
            return new Promise(function (resolve, reject) {
                if (window.NativeStorage)
                    window.NativeStorage.setItem(key, value, function () {
                        resolve();
                    }, function (error) {
                        reject();
                    });
                else
                    reject();
            });
        };
        NativeStorageWrap.prototype.getItem = function (key, defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            return new Promise(function (resolve, reject) {
                if (window.NativeStorage)
                    window.NativeStorage.getItem(key, function () {
                        resolve();
                    }, function (error) {
                        if (error.code === 2)
                            resolve(defaultValue);
                        reject();
                    });
                else
                    reject();
            });
        };
        NativeStorageWrap.prototype.keys = function () {
            return new Promise(function (resolve, reject) {
                if (window.NativeStorage)
                    window.NativeStorage.keys(function (keys) {
                        resolve(keys);
                    }, function (error) {
                        reject();
                    });
                else
                    reject();
            });
        };
        NativeStorageWrap.prototype.remove = function (key) {
            return new Promise(function (resolve, reject) {
                if (window.NativeStorage)
                    window.NativeStorage.remove(key, function () {
                        resolve();
                    }, function (error) {
                        if (error.code === 2 || error.code === 3 || error.code === 4)
                            resolve();
                        reject();
                    });
                else
                    reject();
            });
        };
        NativeStorageWrap.prototype.clear = function () {
            return new Promise(function (resolve, reject) {
                if (window.NativeStorage)
                    window.NativeStorage.clear(function () {
                        resolve();
                    }, function (error) {
                        reject();
                    });
                else
                    reject();
            });
        };
        return NativeStorageWrap;
    }());
    var Storage = /** @class */ (function () {
        function Storage() {
        }
        Storage.clear = function () {
            return Storage._storage.clear();
        };
        Storage.getItem = function (key, defaultValue) {
            if (defaultValue === void 0) { defaultValue = null; }
            return Storage._storage.getItem(key, defaultValue);
        };
        Storage.keys = function () {
            return Storage._storage.keys();
        };
        Storage.remove = function (key) {
            return Storage._storage.remove(key);
        };
        Storage.removeItem = function (key) {
            return Storage._storage.remove(key);
        };
        Storage.setItem = function (key, value) {
            return Storage._storage.setItem(key, value);
        };
        Storage._storage = new LocalStorage();
        return Storage;
    }());
    exports.Storage = Storage;
    if (window.NativeStorage) {
        Storage._storage = new NativeStorageWrap();
    }
});
