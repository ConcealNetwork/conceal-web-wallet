"use strict";
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
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
workbox.precaching.precacheAndRoute([{"revision":"608d12f44c72b15d13959b539521b820","url":"api.html"},{"revision":"2ace1a08b832583ede8e92a678fc43d4","url":"api.js"},{"revision":"c495654869785bc3df60216616814ad1","url":"assets/css/font-awesome.css"},{"revision":"269550530cc127b6aa5a35925a7de6ce","url":"assets/css/font-awesome.min.css"},{"revision":"46dfdcc8d3c2d3010c62d808b243d31a","url":"assets/css/main.css"},{"revision":"93c52631254cd9ca88557a97392a932f","url":"assets/img/coin_white.png"},{"revision":"8eaba0b398c7a3ea468c98af1e89540b","url":"assets/img/favicon.ico"},{"revision":"0b53abe284523b3920da9b5edb9d874f","url":"assets/img/icons/icon-128x128.png"},{"revision":"d525d04fcfd108a387444f091ef1aa18","url":"assets/img/icons/icon-144x144.png"},{"revision":"9ca297b44a222e10ddddbfb27c316bad","url":"assets/img/icons/icon-152x152.png"},{"revision":"42a900c73e0ca15228efbafb7df92b69","url":"assets/img/icons/icon-192x192.png"},{"revision":"82cea28b358e6e4a6d974b7792e020ae","url":"assets/img/icons/icon-256x256.png"},{"revision":"ecb719039eb6fbb9608de68f632dab18","url":"assets/img/icons/icon-402x402.png"},{"revision":"93c52631254cd9ca88557a97392a932f","url":"assets/img/logo_vertical.png"},{"revision":"93c52631254cd9ca88557a97392a932f","url":"assets/img/logo.png"},{"revision":"9ab90027c5a4cdc7b4549034caf96682","url":"assets/img/logoQrCode.jpg"},{"revision":"6cc6dd0ae778e4517e2b58499c747cd3","url":"assets/img/logoQrCode.png"},{"revision":"ea3dd867bcfafd6dca686b79674dd7e0","url":"assets/img/qrcode.png"},{"revision":"a0b33372c3627b3cb27b36bf51df0386","url":"config.js"},{"revision":"5e60d2e13017ae982538f352d04a961c","url":"d/vue-i118n.js"},{"revision":"7440253b50b99e7db2c87bc67c8b2ab4","url":"filters/Filters.js"},{"revision":"14c1e423a60aaf3c97d9e248626f41b5","url":"index.html"},{"revision":"ae6f8a6748bc3edb4447fd398347c084","url":"index.js"},{"revision":"3d523c0162d6911fd675c9ed1b7389a8","url":"lib/base58.js"},{"revision":"f5a873c5716a9d3481501cad3f3e5ca7","url":"lib/biginteger.js"},{"revision":"94d65c88ed19007552b6593fa6fc68d1","url":"lib/cn_utils_native.js"},{"revision":"3edfe20f27a092062598a3e9c5339ae0","url":"lib/cn_utils.js"},{"revision":"11a0cf7cfcac544b5d109c16aedeec9d","url":"lib/crypto.js"},{"revision":"d4b1f18a71eb23433107d044eedffaa9","url":"lib/decoder.min.js"},{"revision":"e8fdc5ad52084fa417f1fec6b6de3b29","url":"lib/FileSaver.min.js"},{"revision":"c9f5aeeca3ad37bf2aa006139b935f0a","url":"lib/jquery-3.2.1.min.js"},{"revision":"27385efc6fa2eccc9dde7da0081b1a98","url":"lib/jspdf.min.js"},{"revision":"ca69d4f40f8c17ff592123dc35c1ea18","url":"lib/kjua-0.1.1.min.js"},{"revision":"f30940176ec1e71b5a5f0c9b784a98b9","url":"lib/mnemonic.js"},{"revision":"1fe1387eb865d9e843697a9d315d95b1","url":"lib/nacl-fast-cn.js"},{"revision":"a9c5b4bca7d2aa621a86d5085ce65d03","url":"lib/nacl-fast.js"},{"revision":"72444801c9affc1654ef12860c67e976","url":"lib/nacl-fast.min.js"},{"revision":"c7b843b9e9b5aad102c855c600c7edc8","url":"lib/nacl-util.min.js"},{"revision":"bf72b0a25fc3edf0c1a638aa43642714","url":"lib/nacl.js"},{"revision":"d8eaf281c8890a60ebe82840456edc33","url":"lib/nacl.min.js"},{"revision":"884ca8e806f9d384611fb0ba25b398ef","url":"lib/numbersLab/Context.js"},{"revision":"0f2ca514ba8f5023dc6ee9ad2fab8e05","url":"lib/numbersLab/DependencyInjector.js"},{"revision":"6afa1f777849c59e67a42f94f0c8464d","url":"lib/numbersLab/DestructableView.js"},{"revision":"8a2dcc2a9c3af93c3d6c81d0f2e7681a","url":"lib/numbersLab/Logger.js"},{"revision":"1e189f8ed916542f76b022cc2a248a47","url":"lib/numbersLab/Observable.js"},{"revision":"83d33c315fe345abc04493787df1f6b2","url":"lib/numbersLab/Router.js"},{"revision":"3cd9b12b078fbaee4eb9b0c01428f540","url":"lib/numbersLab/VueAnnotate.js"},{"revision":"6ff449122255e7a91fb884ea7016c601","url":"lib/polyfills/core.min.js"},{"revision":"13647291f45a582eee64e000b09d9567","url":"lib/polyfills/crypto.js"},{"revision":"50f27403be5972eae4831f5b69db1f80","url":"lib/polyfills/textEncoding/encoding-indexes.js"},{"revision":"cfc731bd62baec239b2c4daf33b5e810","url":"lib/polyfills/textEncoding/encoding.js"},{"revision":"bebd45d1f406bbe61424136b03e50895","url":"lib/require.js"},{"revision":"9f298ac7e4ee707645a8d711f3ed916b","url":"lib/sha3.js"},{"revision":"4b69bbd418e85d6efdac5630ed40d76e","url":"lib/sweetalert2.js"},{"revision":"7d220253d58eb13939d24b1b7eb2d884","url":"lib/vue-i18n.js"},{"revision":"31161aac8807443448ecfa5162111438","url":"lib/vue.min.js"},{"revision":"5d91e91213013f75e5e3c2d4a5918ac7","url":"manifest.json"},{"revision":"0c9335d2da7ce36018874090b564cfd7","url":"model/Api.js"},{"revision":"024b2fb9a07a5f9c30db1a6cd3873870","url":"model/AppState.js"},{"revision":"df07fd4bf68fc0d598808ffa7ffe8e80","url":"model/blockchain/BlockchainExplorer.js"},{"revision":"87d1a7c4d30bd5eab69aa6cc309d9b33","url":"model/blockchain/BlockchainExplorerRPCDaemon.js"},{"revision":"81d41d3cc39e7d0077528e94cc502ec4","url":"model/ChaCha8.js"},{"revision":"67d1ac6bf41938de292e5ffbc8859f9d","url":"model/Cn.js"},{"revision":"e36273952db5e1f467cbd4fd07716107","url":"model/CoinUri.js"},{"revision":"c4eea9adc1b590842df5134c4f29c146","url":"model/Constants.js"},{"revision":"9c22c2480507da70340c9b27d9c9119c","url":"model/Functions.js"},{"revision":"f5d5eb9df2b29f84e63796980c887a1f","url":"model/KeysRepository.js"},{"revision":"d6d4f6454d3a7f55f86cfa51812954d3","url":"model/MathUtil.js"},{"revision":"f0cf6e5b3b52dc6cca8ecf76a0e42760","url":"model/Mnemonic.js"},{"revision":"670ec0fe92754db2ff4f61d14e69a7b9","url":"model/MnemonicLang.js"},{"revision":"ca17ec627c5d9601bd25739ec3cc8c34","url":"model/Nfc.js"},{"revision":"5525ec49866a5a8a20c9a1a7701b207d","url":"model/Password.js"},{"revision":"899bdb34b170151e3fb443222abe3d65","url":"model/QRReader.js"},{"revision":"3d75e12c98b3f690e62351f43b54a741","url":"model/Storage.js"},{"revision":"5517a26550420ea17e250ecc1f8e29ae","url":"model/StorageOld.js"},{"revision":"0fc197f601eed29240fd563341086688","url":"model/Transaction.js"},{"revision":"db919d1b96332f241a91e637a45a285e","url":"model/TransactionsExplorer.js"},{"revision":"bcc4ad9ee2a03ae4226c59cc3e6b180c","url":"model/Translations.js"},{"revision":"44177c60c65db68b02923194c45dd97c","url":"model/Varint.js"},{"revision":"f512806d94df3ba3fc4344435b4a73bf","url":"model/Wallet.js"},{"revision":"e25a744efbcc8a713859293007672ecf","url":"model/WalletRepository.js"},{"revision":"b8ac5c60482b1ca6b12f438db2b321e6","url":"model/WalletWatchdog.js"},{"revision":"7d399141f5cf8ab824b002e91f8ea27f","url":"pages/account.html"},{"revision":"094e696c75d219d2e1749bfd4efe66dc","url":"pages/account.js"},{"revision":"cf44f48e8c60b3c2e19e22e825a89724","url":"pages/changeWalletPassword.html"},{"revision":"2f033472e67d9e0069d261fba0726cb1","url":"pages/changeWalletPassword.js"},{"revision":"413543ffbf94919ce6b5be51d309bc55","url":"pages/createWallet.html"},{"revision":"c9b277d848f26089e620ba914e8cae86","url":"pages/createWallet.js"},{"revision":"564c72bcce4c549788c6e0fa2bd889d3","url":"pages/deposits.html"},{"revision":"dde19e6dcc18c43a39bebbc7426d3997","url":"pages/deposits.js"},{"revision":"d41d8cd98f00b204e9800998ecf8427e","url":"pages/disconnect.html"},{"revision":"a97764bbd8a54623aadfcaef59700682","url":"pages/disconnect.js"},{"revision":"dbfa50c567e6b47ad5c463cbafe3a5ae","url":"pages/donate.html"},{"revision":"a0ecbbba9c5c5425c2a8a90421c786a1","url":"pages/donate.js"},{"revision":"0829e8dcf1a904dbbe1be305abf85900","url":"pages/export.html"},{"revision":"ae325f75f976714207f363430ec39a0a","url":"pages/export.js"},{"revision":"e44b3574cd9ac9e0f3986489a5d63881","url":"pages/import.html"},{"revision":"696e3cd76c17a8b5b8ca61f5b21d6b2d","url":"pages/import.js"},{"revision":"b824f9fc68ce358032faecd70b0e099b","url":"pages/importFromFile.html"},{"revision":"4c5a5289780852e5325d4c191dfd324c","url":"pages/importFromFile.js"},{"revision":"af4f0ed3a45c6cd994e9a000bf4397de","url":"pages/importFromKeys.html"},{"revision":"85ab96b795f227d502799efa065eaf13","url":"pages/importFromKeys.js"},{"revision":"367f09264b3c3008ee0eda752d4a0ea7","url":"pages/importFromMnemonic.html"},{"revision":"9f5a232253f5777fb32a8417d2625d65","url":"pages/importFromMnemonic.js"},{"revision":"172fc490fa9a97ed146895e0f35aeedc","url":"pages/importFromQr.html"},{"revision":"6298263962e84bcd1217d9ed52a85605","url":"pages/importFromQr.js"},{"revision":"736a1f2492940dd933074d3f9c1bbad5","url":"pages/index.html"},{"revision":"6659a6a77131c072bde6536dda90692f","url":"pages/index.js"},{"revision":"7fd65a0d4388f5c415a9d825a66c4999","url":"pages/messages.html"},{"revision":"9f9dac2e12ca2aea8b0460aed07a755a","url":"pages/messages.js"},{"revision":"ce284ad7dae77fe479541b54a9660e96","url":"pages/network.html"},{"revision":"e490a35bd4af48626c75840a75770674","url":"pages/network.js"},{"revision":"6b9078e65a28fd5b0079c149c7a3642c","url":"pages/privacyPolicy.html"},{"revision":"d6ceeaeccd8de4ef2001a301b0337715","url":"pages/privacyPolicy.js"},{"revision":"4f8afcc46a986402e665b511a2a270fa","url":"pages/receive.html"},{"revision":"20c25966fe49236b767d524b6d1721b4","url":"pages/receive.js"},{"revision":"469f939c2d7a08f29927e5e4b6913649","url":"pages/send.html"},{"revision":"43e0523a011136d0cd4e4f205c80685f","url":"pages/send.js"},{"revision":"6d3ad8fddd9df8a197a881952a91dd86","url":"pages/settings.html"},{"revision":"a4da13f3f615f3767c6f84c9ada97799","url":"pages/settings.js"},{"revision":"176f4e685f5634390560f31aed1a4311","url":"pages/support.html"},{"revision":"7f0c6f3dd035c44a802f7fa464e8931d","url":"pages/support.js"},{"revision":"d245c225ede186bbb931f7da7c0bc1fa","url":"pages/termsOfUse.html"},{"revision":"45ca19345556e8f2454f167710183aa4","url":"pages/termsOfUse.js"},{"revision":"2e07b1afc37824b9ff4c3807f53c42fb","url":"providers/BlockchainExplorerProvider.js"},{"revision":"91b8fb3557f50ec4d949e4779f4c0599","url":"translations/de.json"},{"revision":"5d29ef0e5897d4766be743af0798c9c9","url":"translations/en.json"},{"revision":"47ae9c437271f0b60e01693fd6498e10","url":"translations/es.json"},{"revision":"4a11e793dbc91b173a4c87a61bbe510f","url":"translations/fa.json"},{"revision":"7b7be41a2cee2eb5df8d8093e31ad905","url":"translations/fr.json"},{"revision":"623290ad8c699b646b7b36bab0372c85","url":"translations/gr.json"},{"revision":"03253f9a9d37e75217e1ad7c4e02573a","url":"translations/hu.json"},{"revision":"490de9d878b9975d3544f9a5e6b9ac68","url":"translations/it.json"},{"revision":"2c38730456c3b2b6eb4daff41aafb968","url":"translations/ko.json"},{"revision":"333ab0f6a7402dc085c55ac8de70b017","url":"translations/pl.json"},{"revision":"f343407d06def3c4dda57f7c71646008","url":"translations/ru.json"},{"revision":"85c2dfd209295de9895321b51cad1832","url":"translations/sr.json"},{"revision":"2938b564e1b5deaa144af8a6dc386b00","url":"translations/uk.json"},{"revision":"630198cd00e7bece82b0a129bec82a3e","url":"translations/zh.json"},{"revision":"871a72da2a5aceea2a12e6b41d78c2ec","url":"utils/Url.js"},{"revision":"a77ba82950627b7c4180110f1c46c454","url":"workers/ParseTransactions.js"},{"revision":"0f9d11e1f33c825e5a99b33bfc201327","url":"workers/ParseTransactionsEntrypoint.js"},{"revision":"c4592b1be69c5b06e166c2c2355f7f82","url":"workers/TransferProcessing.js"},{"revision":"a5245276b3005b7f1fc44b91b42d326e","url":"workers/TransferProcessingEntrypoint.js"}]);
self.addEventListener('message', function (event) {
    if (!event.data) {
        return;
    }
    switch (event.data) {
        case 'force-activate':
            self.skipWaiting();
            self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (clients) {
                clients.forEach(function (client) {
                    client.focus();
                    client.postMessage('reload-window-update');
                });
            });
            break;
        default:
            // NOOP
            break;
    }
});
