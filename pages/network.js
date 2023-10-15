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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
define(["require", "exports", "../lib/numbersLab/DestructableView", "../lib/numbersLab/VueAnnotate", "../model/AppState", "../providers/BlockchainExplorerProvider", "../filters/Filters"], function (require, exports, DestructableView_1, VueAnnotate_1, AppState_1, BlockchainExplorerProvider_1, Filters_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    AppState_1.AppState.enableLeftMenu();
    var blockchainExplorer = BlockchainExplorerProvider_1.BlockchainExplorerProvider.getInstance();
    var NetworkView = /** @class */ (function (_super) {
        __extends(NetworkView, _super);
        function NetworkView(container) {
            var _this = _super.call(this, container) || this;
            _this.intervalRefreshStat = 0;
            var self = _this;
            _this.intervalRefreshStat = setInterval(function () {
                self.refreshStats();
            }, 30 * 1000);
            _this.refreshStats();
            return _this;
        }
        NetworkView.prototype.destruct = function () {
            clearInterval(this.intervalRefreshStat);
            return _super.prototype.destruct.call(this);
        };
        NetworkView.prototype.refreshStats = function () {
            var _this = this;
            blockchainExplorer.getNetworkInfo().then(function (info) {
                _this.nodeList = __spreadArray([], info.nodes, true);
                _this.networkDifficulty = info.difficulty;
                _this.networkHashrate = (0, Filters_1.VueFilterHashrate)(info.difficulty / config.avgBlockTime);
                _this.blockchainHeight = info.height;
                _this.lastReward = info.reward / Math.pow(10, config.coinUnitPlaces);
                _this.ticker = config.coinSymbol;
                _this.lastBlockFound = info.timestamp;
            }).catch(function (err) {
                // do nothing
            });
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], NetworkView.prototype, "networkHashrate", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], NetworkView.prototype, "blockchainHeight", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], NetworkView.prototype, "networkDifficulty", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], NetworkView.prototype, "lastReward", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], NetworkView.prototype, "lastBlockFound", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)([])
        ], NetworkView.prototype, "nodeList", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(0)
        ], NetworkView.prototype, "ticker", void 0);
        NetworkView = __decorate([
            (0, VueAnnotate_1.VueRequireFilter)('hashrate', Filters_1.VueFilterHashrate)
        ], NetworkView);
        return NetworkView;
    }(DestructableView_1.DestructableView));
    new NetworkView('#app');
});
