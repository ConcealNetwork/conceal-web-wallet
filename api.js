/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2025 Conceal Community, Conceal.Network & Conceal Devs
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
define(["require", "exports", "./model/WalletRepository"], function (require, exports, WalletRepository_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // List of allowed parent origins
    var ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'https://wallet.conceal.network',
        'https://wws.conceal.network'
    ];
    function sendMessageToParent(type, data) {
        // Get the parent origin from referrer or use the production URL as fallback
        var parentOrigin = document.referrer ?
            new URL(document.referrer).origin :
            ALLOWED_ORIGINS[1]; // wallet.conceal.network
        // Only send message if the origin is in our allowed list
        if (ALLOWED_ORIGINS.includes(parentOrigin)) {
            window.parent.postMessage({
                type: type,
                payload: data
            }, parentOrigin);
        }
        else {
            console.warn('Attempted to send message to non-allowed origin:', parentOrigin);
        }
    }
    window.addEventListener('message', function (e) {
        // Verify the origin of the message for security
        if (!ALLOWED_ORIGINS.includes(e.origin)) {
            console.warn('Received message from non-allowed origin:', e.origin);
            return;
        }
        // Process the message only if it comes from an allowed origin
        if (e.data == 'hasWallet') {
            sendMessageToParent('hasWallet', WalletRepository_1.WalletRepository.hasOneStored());
        }
    });
    sendMessageToParent('ready', null);
});
