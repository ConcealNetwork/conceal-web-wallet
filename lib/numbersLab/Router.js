/*
 * Copyright 2018 NumbersLab - https://github.com/NumbersLab
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
define(["require", "exports", "./Logger", "./DestructableView", "./Context", "../config/allowedPages"], function (require, exports, Logger_1, DestructableView_1, Context_1, allowedPages_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Router = void 0;
    var Router = /** @class */ (function () {
        function Router(routerBaseHtmlRelativity, routerBaseRelativity) {
            if (routerBaseHtmlRelativity === void 0) { routerBaseHtmlRelativity = './'; }
            if (routerBaseRelativity === void 0) { routerBaseRelativity = '../'; }
            this.currentPage = null;
            this.routerBaseHtmlRelativity = './';
            this.routerBaseJsRelativity = '../';
            this.urlPrefix = '!';
            var self = this;
            this.routerBaseHtmlRelativity = routerBaseHtmlRelativity;
            this.routerBaseJsRelativity = routerBaseRelativity;
            this.changePage(Router.extractPageFromUrl());
        }
        /**
         * Get the current page from the url or fallback on index
         * @returns {any}
         */
        Router.extractPageFromUrl = function () {
            var pageName = 'index';
            if (window.location.hash.indexOf('#!') != -1) {
                pageName = window.location.hash.slice(2);
            }
            else if (window.location.hash.indexOf('#') != -1) {
                pageName = window.location.hash.slice(1);
            }
            return encodeURIComponent(pageName);
        };
        Router.prototype.changePageFromHash = function () {
            this.changePage(Router.extractPageFromUrl());
        };
        /**
         * Change the current page by loading the new content in the same page,
         * Update the browser history
         * @param {string} completeNewPageName
         */
        Router.prototype.changePage = function (completeNewPageName_1) {
            return __awaiter(this, arguments, void 0, function (completeNewPageName, replaceState) {
                var self, newPageName, isValid, currentView, promiseDestruct;
                if (replaceState === void 0) { replaceState = false; }
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            self = this;
                            newPageName = completeNewPageName;
                            if (newPageName.indexOf('?') !== -1) {
                                newPageName = newPageName.slice(0, newPageName.indexOf('?'));
                            }
                            if (!(0, allowedPages_1.isAllowedException)(completeNewPageName)) return [3 /*break*/, 2];
                            return [4 /*yield*/, (0, allowedPages_1.validateExceptionsIntegrity)()];
                        case 1:
                            isValid = _a.sent();
                            Logger_1.Logger.debug(this, 'Exception validation - URL: {url}, Is Valid: {isValid}', {
                                url: completeNewPageName,
                                isValid: isValid
                            });
                            if (!isValid) {
                                Logger_1.Logger.error(this, 'Exceptions integrity check failed');
                                this.changePage('index', true);
                                return [2 /*return*/];
                            }
                            return [3 /*break*/, 3];
                        case 2:
                            if (!(0, allowedPages_1.isAllowedPage)(newPageName)) {
                                Logger_1.Logger.error(this, 'Attempted to access unauthorized page: {page}', {
                                    page: newPageName
                                });
                                this.changePage('index', true);
                                return [2 /*return*/];
                            }
                            _a.label = 3;
                        case 3:
                            Logger_1.Logger.info(this, 'Changing page to {newPage} from {oldPage}', {
                                newPage: completeNewPageName,
                                oldPage: this.currentPage
                            });
                            $('#pageLoading').show();
                            currentView = DestructableView_1.DestructableView.getCurrentAppView();
                            if (currentView !== null) {
                                promiseDestruct = currentView.destruct();
                                currentView = null;
                                DestructableView_1.DestructableView.setCurrentAppView(null);
                            }
                            else {
                                promiseDestruct = Promise.resolve();
                            }
                            //we wait the promise of destruction in case of something that could take time
                            promiseDestruct.then(function () {
                                self.currentPage = completeNewPageName;
                                Logger_1.Logger.debug(self, 'Changing to page ' + self.currentPage);
                                // If it's an allowed exception, use the decoded page name for loading content
                                var pageToLoad = newPageName;
                                if ((0, allowedPages_1.isAllowedException)(completeNewPageName)) {
                                    var decodedHash = decodeURIComponent(window.location.hash);
                                    pageToLoad = decodedHash.split('?')[0].replace('#', '');
                                }
                                var promiseContent = self.loadContent(self.routerBaseHtmlRelativity + 'pages/' + pageToLoad + '.html');
                                var jsContentPath = self.routerBaseJsRelativity + 'pages/' + pageToLoad + '.js';
                                Promise.all([promiseContent]).then(function (data) {
                                    var content = data[0];
                                    self.injectNewPage(content, jsContentPath);
                                }).catch(function (error) {
                                    $('#pageLoading').hide();
                                });
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Inject the content in the current page
         * @param content
         * @param jsContentPath
         */
        Router.prototype.injectNewPage = function (content, jsContentPath) {
            var _a;
            // Double-check security - validate jsContentPath
            if (jsContentPath !== null) {
                var pageName = (_a = jsContentPath.split('/').pop()) === null || _a === void 0 ? void 0 : _a.replace('.js', '');
                if (!pageName || (!(0, allowedPages_1.isAllowedPage)(pageName) && !(0, allowedPages_1.isAllowedException)(window.location.hash))) {
                    Logger_1.Logger.error(this, 'Attempted to inject unauthorized page: {page}', {
                        page: pageName
                    });
                    return;
                }
                else if ((0, allowedPages_1.isAllowedException)(window.location.hash)) {
                    // For allowed exceptions, decode the URL but keep the query parameters
                    var decodedHash = decodeURIComponent(window.location.hash);
                    var actualPageName = decodedHash.split('?')[0].replace('#', '');
                    // Keep the original hash with query parameters for the page to use
                    window.location.hash = decodedHash;
                    jsContentPath = this.routerBaseJsRelativity + 'pages/' + actualPageName + '.js';
                }
            }
            $('#page').hide().html(content);
            if (jsContentPath !== null) {
                this.unloadRequirejs(jsContentPath);
                this.unloadRequirejs(jsContentPath.replace(this.routerBaseJsRelativity, ''));
                requirejs([jsContentPath], function (App) {
                    $('#page').show();
                    $('#pageLoading').hide();
                }, function (err) {
                    $('#page').show();
                    $('#pageLoading').hide();
                });
            }
        };
        /**
         * Load the content of an url and return it with a Promise
         * @param {string} url
         * @returns {Promise<string>}
         */
        Router.prototype.loadContent = function (url) {
            var _this = this;
            return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var response, html, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fetch(url)];
                        case 1:
                            response = _a.sent();
                            if (!response.ok) {
                                throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                            }
                            return [4 /*yield*/, response.text()];
                        case 2:
                            html = _a.sent();
                            resolve(html);
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _a.sent();
                            console.error("Failed to load content from %s: %s", url, error_1.message);
                            reject();
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        };
        /**
         * Unload data from RequireJs to be able to reinject the page
         * @param moduleName
         */
        Router.prototype.unloadRequirejs = function (moduleName) {
            //console.log('unload '+moduleName);
            var context = Context_1.Context.getGlobalContext()['requirejs'].s.contexts['_'];
            //console.log('unload', moduleName, context.defined[moduleName], context.defined);
            if (typeof context.defined[moduleName] !== 'undefined') {
                delete context.defined[moduleName];
            }
            if (typeof context.urlFetched[moduleName] !== 'undefined') {
                delete context.urlFetched[moduleName];
            }
            var scripts = document.getElementsByTagName('script');
            for (var i = scripts.length - 1; i >= 0; i--) {
                var script = scripts[i];
                if (script.getAttribute('data-requiremodule') === moduleName) {
                    if (script.parentNode !== null) {
                        script.parentNode.removeChild(script);
                    }
                    break;
                }
            }
        };
        return Router;
    }());
    exports.Router = Router;
});
