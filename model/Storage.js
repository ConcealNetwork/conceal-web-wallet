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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Storage = void 0;
    var IndexedDBStorage = /** @class */ (function () {
        function IndexedDBStorage() {
            var _this = this;
            this.dbName = 'mydb';
            this.storeName = 'storage';
            this.ready = new Promise(function (resolve, reject) {
                var request = indexedDB.open(_this.dbName);
                request.onupgradeneeded = function (event) {
                    _this.db = event.target.result;
                    _this.db.createObjectStore(_this.storeName, { keyPath: 'key' });
                };
                request.onsuccess = function (event) {
                    _this.db = event.target.result;
                    resolve();
                };
                request.onerror = function (event) {
                    reject(event.target.error);
                };
            });
        }
        IndexedDBStorage.prototype.setItem = function (key, value) {
            return __awaiter(this, void 0, void 0, function () {
                var transaction, store;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ready];
                        case 1:
                            _a.sent();
                            transaction = this.db.transaction(this.storeName, 'readwrite');
                            store = transaction.objectStore(this.storeName);
                            return [4 /*yield*/, store.put({ key: key, value: value })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        IndexedDBStorage.prototype.getItem = function (key_1) {
            return __awaiter(this, arguments, void 0, function (key, defaultValue) {
                var _this = this;
                if (defaultValue === void 0) { defaultValue = null; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ready];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, new Promise(function (resolve, reject) {
                                    var transaction = _this.db.transaction(_this.storeName, 'readonly');
                                    var store = transaction.objectStore(_this.storeName);
                                    var request = store.get(key);
                                    request.onsuccess = function () {
                                        var result = request.result ? request.result.value : defaultValue;
                                        resolve(result);
                                    };
                                    request.onerror = function (event) {
                                        reject(event.target.error);
                                    };
                                })];
                    }
                });
            });
        };
        IndexedDBStorage.prototype.keys = function () {
            return __awaiter(this, void 0, void 0, function () {
                var transaction, store, keys;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ready];
                        case 1:
                            _a.sent();
                            transaction = this.db.transaction(this.storeName, 'readonly');
                            store = transaction.objectStore(this.storeName);
                            return [4 /*yield*/, store.getAllKeys()];
                        case 2:
                            keys = _a.sent();
                            return [2 /*return*/, keys];
                    }
                });
            });
        };
        IndexedDBStorage.prototype.remove = function (key) {
            return __awaiter(this, void 0, void 0, function () {
                var transaction, store;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ready];
                        case 1:
                            _a.sent();
                            transaction = this.db.transaction(this.storeName, 'readwrite');
                            store = transaction.objectStore(this.storeName);
                            return [4 /*yield*/, store.delete(key)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        IndexedDBStorage.prototype.clear = function () {
            return __awaiter(this, void 0, void 0, function () {
                var transaction, store;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.ready];
                        case 1:
                            _a.sent();
                            transaction = this.db.transaction(this.storeName, 'readwrite');
                            store = transaction.objectStore(this.storeName);
                            return [4 /*yield*/, store.clear()];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        return IndexedDBStorage;
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
        Storage._storage = new IndexedDBStorage();
        return Storage;
    }());
    exports.Storage = Storage;
});
