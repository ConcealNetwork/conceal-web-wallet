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
define(["require", "exports", "./Storage"], function (require, exports, Storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Translations = exports.tickerStore = exports.TickerStore = void 0;
    // Ticker store class to manage ticker state
    var TickerStore = /** @class */ (function () {
        function TickerStore() {
            this._useShortTicker = false;
            this.listeners = new Set();
            // Private constructor for singleton
        }
        TickerStore.getInstance = function () {
            if (!TickerStore.instance) {
                TickerStore.instance = new TickerStore();
            }
            return TickerStore.instance;
        };
        // Initialize the store
        TickerStore.prototype.initialize = function () {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = this;
                            return [4 /*yield*/, Storage_1.Storage.getItem("useShortTicker", false)];
                        case 1:
                            _a._useShortTicker = _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        Object.defineProperty(TickerStore.prototype, "useShortTicker", {
            // Get current ticker preference
            get: function () {
                return this._useShortTicker;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(TickerStore.prototype, "currentTicker", {
            // Get current ticker symbol
            get: function () {
                return this._useShortTicker ? config.coinSymbolShort : config.coinSymbol;
            },
            enumerable: false,
            configurable: true
        });
        // Set ticker preference and notify listeners
        TickerStore.prototype.setTickerPreference = function (useShortTicker) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._useShortTicker = useShortTicker;
                            return [4 /*yield*/, Storage_1.Storage.setItem("useShortTicker", useShortTicker)];
                        case 1:
                            _a.sent();
                            this.notifyListeners();
                            return [2 /*return*/];
                    }
                });
            });
        };
        // Subscribe to ticker changes
        TickerStore.prototype.subscribe = function (listener) {
            var _this = this;
            this.listeners.add(listener);
            // Return unsubscribe function
            return function () { return _this.listeners.delete(listener); };
        };
        TickerStore.prototype.notifyListeners = function () {
            var _this = this;
            this.listeners.forEach(function (listener) { return listener(_this._useShortTicker); });
        };
        return TickerStore;
    }());
    exports.TickerStore = TickerStore;
    // Export singleton instance
    exports.tickerStore = TickerStore.getInstance();
    var Translations = /** @class */ (function () {
        function Translations() {
        }
        Translations.getBrowserLang = function () {
            var browserUserLang = "" + (navigator.language || navigator.userLanguage);
            browserUserLang = browserUserLang.toLowerCase().split("-")[0];
            return browserUserLang;
        };
        Translations.getLang = function () {
            return Storage_1.Storage.getItem("user-lang", Translations.getBrowserLang());
        };
        Translations.setBrowserLang = function (lang) {
            Storage_1.Storage.setItem("user-lang", lang);
        };
        Translations.getTickerPreference = function () {
            return exports.tickerStore.initialize().then(function () { return exports.tickerStore.useShortTicker; });
        };
        Translations.setTickerPreference = function (useShortTicker) {
            return exports.tickerStore.setTickerPreference(useShortTicker);
        };
        Translations.getCurrentTicker = function () {
            return exports.tickerStore.currentTicker;
        };
        Translations.loadLangTranslation = function (lang) {
            var _this = this;
            //console.log('setting lang to '+lang);
            var promise;
            if (typeof Translations.storedTranslations[lang] !== "undefined")
                promise = Promise.resolve(Translations.storedTranslations[lang]);
            else
                promise = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var response, data, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                return [4 /*yield*/, fetch("./translations/" + lang + ".json")];
                            case 1:
                                response = _a.sent();
                                if (!response.ok) {
                                    throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                                }
                                return [4 /*yield*/, response.json()];
                            case 2:
                                data = _a.sent();
                                Translations.storedTranslations[lang] = data;
                                resolve(data);
                                return [3 /*break*/, 4];
                            case 3:
                                error_1 = _a.sent();
                                console.error("Failed to load translation for %s: %s", lang, error_1.message);
                                reject();
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
            promise.then(function (data) {
                if (typeof data.date !== "undefined")
                    i18n.setDateTimeFormat(lang, data.date);
                if (typeof data.number !== "undefined")
                    i18n.setNumberFormat(lang, data.number);
                if (typeof data.messages !== "undefined")
                    i18n.setLocaleMessage(lang, data.messages);
                i18n.locale = lang;
                $("title").html(data.website.title);
                $('meta[property="og:title"]').attr("content", data.website.title);
                $('meta[property="twitter:title"]').attr("content", data.website.title);
                $('meta[name="description"]').attr("content", data.website.description);
                $('meta[property="og:description"]').attr("content", data.website.description);
                $('meta[property="twitter:description"]').attr("content", data.website.description);
                var htmlDocument = document.querySelector("html");
                if (htmlDocument !== null)
                    htmlDocument.setAttribute("lang", lang);
            });
            return promise;
        };
        Translations.storedTranslations = {};
        return Translations;
    }());
    exports.Translations = Translations;
});
