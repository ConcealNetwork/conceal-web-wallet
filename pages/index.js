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
define(["require", "exports", "../model/WalletRepository", "../lib/numbersLab/DependencyInjector", "../lib/numbersLab/VueAnnotate", "../lib/numbersLab/DestructableView", "../model/Wallet", "../model/AppState"], function (require, exports, WalletRepository_1, DependencyInjector_1, VueAnnotate_1, DestructableView_1, Wallet_1, AppState_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var wallet = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false);
    if (wallet !== null) {
        window.location.href = '#account';
    }
    var IndexView = /** @class */ (function (_super) {
        __extends(IndexView, _super);
        function IndexView(container) {
            var _this = _super.call(this, container) || this;
            _this.isWalletLoaded = (0, DependencyInjector_1.DependencyInjectorInstance)().getInstance(Wallet_1.Wallet.name, 'default', false) !== null;
            WalletRepository_1.WalletRepository.hasOneStored().then(function (status) {
                _this.hasLocalWallet = status;
            });
            // this.importWallet();
            AppState_1.AppState.disableLeftMenu();
            return _this;
        }
        IndexView.prototype.destruct = function () {
            return _super.prototype.destruct.call(this);
        };
        IndexView.prototype.loadWallet = function () {
            AppState_1.AppState.askUserOpenWallet();
        };
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], IndexView.prototype, "hasLocalWallet", void 0);
        __decorate([
            (0, VueAnnotate_1.VueVar)(false)
        ], IndexView.prototype, "isWalletLoaded", void 0);
        return IndexView;
    }(DestructableView_1.DestructableView));
    var newIndexView = new IndexView('#app');
});
/*
function readFile(fileEnty:any){
    //console.log(fileEnty);
}

function writeFile(fileEntry, dataObj) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            //console.log("Successful file write...");
            readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            //console.log("Failed file write: " + e.toString());
        };

        // If data object is not passed in,
        // create a new Blob instead.
        if (!dataObj) {
            dataObj = new Blob(['some file data'], { type: 'text/plain' });
        }

        fileWriter.write(dataObj);
    });
}

function onErrorCreateFile(error){
    alert('onErrorCreateFile:'+JSON.stringify(error));
}
function onErrorLoadFs(error){
    alert('onErrorLoadFs:'+JSON.stringify(error));
}


window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs : any) {

    //console.log('file system open: ' + fs.name);
    fs.root.getFile(cordova.file.documentsDirectory+"newPersistentFile.txt", { create: true, exclusive: false }, function (fileEntry : any) {

        //console.log("fileEntry is file?" + fileEntry.isFile.toString());
        // fileEntry.name == 'someFile.txt'
        // fileEntry.fullPath == '/someFile.txt'
        writeFile(fileEntry, null);

    }, onErrorCreateFile);

}, onErrorLoadFs);

*/ 
