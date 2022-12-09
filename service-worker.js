"use strict";
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
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');
workbox.precaching.precacheAndRoute([
  {
    "url": "api.html",
    "revision": "41b3bc679d6e2c8e31b1a8ec298b22f0"
  },
  {
    "url": "api.js",
    "revision": "9d76ce35b4a493232c5d76f2f86e1942"
  },
  {
    "url": "assets/css/font-awesome.css",
    "revision": "c495654869785bc3df60216616814ad1"
  },
  {
    "url": "assets/css/font-awesome.min.css",
    "revision": "269550530cc127b6aa5a35925a7de6ce"
  },
  {
    "url": "assets/css/main.css",
    "revision": "8118f245d51728ee3cb6e1baa04f437b"
  },
  {
    "url": "assets/img/coin_white.png",
    "revision": "93c52631254cd9ca88557a97392a932f"
  },
  {
    "url": "assets/img/favicon.ico",
    "revision": "8eaba0b398c7a3ea468c98af1e89540b"
  },
  {
    "url": "assets/img/icons/icon-128x128.png",
    "revision": "0b53abe284523b3920da9b5edb9d874f"
  },
  {
    "url": "assets/img/icons/icon-144x144.png",
    "revision": "d525d04fcfd108a387444f091ef1aa18"
  },
  {
    "url": "assets/img/icons/icon-152x152.png",
    "revision": "9ca297b44a222e10ddddbfb27c316bad"
  },
  {
    "url": "assets/img/icons/icon-192x192.png",
    "revision": "42a900c73e0ca15228efbafb7df92b69"
  },
  {
    "url": "assets/img/icons/icon-256x256.png",
    "revision": "82cea28b358e6e4a6d974b7792e020ae"
  },
  {
    "url": "assets/img/icons/icon-402x402.png",
    "revision": "ecb719039eb6fbb9608de68f632dab18"
  },
  {
    "url": "assets/img/logo_vertical.png",
    "revision": "93c52631254cd9ca88557a97392a932f"
  },
  {
    "url": "assets/img/logo.png",
    "revision": "93c52631254cd9ca88557a97392a932f"
  },
  {
    "url": "assets/img/logoQrCode.jpg",
    "revision": "9ab90027c5a4cdc7b4549034caf96682"
  },
  {
    "url": "assets/img/logoQrCode.png",
    "revision": "6cc6dd0ae778e4517e2b58499c747cd3"
  },
  {
    "url": "assets/img/qrcode.png",
    "revision": "ea3dd867bcfafd6dca686b79674dd7e0"
  },
  {
    "url": "config.js",
    "revision": "0d11546637244acfdb10b10d4d237936"
  },
  {
    "url": "d/vue-i118n.js",
    "revision": "5e60d2e13017ae982538f352d04a961c"
  },
  {
    "url": "filters/Filters.js",
    "revision": "b8b234d18f7d8fb44c4f71044491ad29"
  },
  {
    "url": "index.html",
    "revision": "2bc42675414310b8039eb47d5f615bdf"
  },
  {
    "url": "index.js",
    "revision": "be8581c7570fd5a4bb315abd38576265"
  },
  {
    "url": "lib/base58.js",
    "revision": "3d523c0162d6911fd675c9ed1b7389a8"
  },
  {
    "url": "lib/biginteger.js",
    "revision": "f5a873c5716a9d3481501cad3f3e5ca7"
  },
  {
    "url": "lib/cn_utils_native.js",
    "revision": "94d65c88ed19007552b6593fa6fc68d1"
  },
  {
    "url": "lib/cn_utils.js",
    "revision": "931c90bcc1519d2476e75e2d6b42870a"
  },
  {
    "url": "lib/crypto.js",
    "revision": "d51c76b2e08308f8cca1f68c5c298a6f"
  },
  {
    "url": "lib/decoder.min.js",
    "revision": "d4b1f18a71eb23433107d044eedffaa9"
  },
  {
    "url": "lib/FileSaver.min.js",
    "revision": "e8fdc5ad52084fa417f1fec6b6de3b29"
  },
  {
    "url": "lib/jquery-3.2.1.min.js",
    "revision": "c9f5aeeca3ad37bf2aa006139b935f0a"
  },
  {
    "url": "lib/jspdf.min.js",
    "revision": "27385efc6fa2eccc9dde7da0081b1a98"
  },
  {
    "url": "lib/kjua-0.1.1.min.js",
    "revision": "ca69d4f40f8c17ff592123dc35c1ea18"
  },
  {
    "url": "lib/mnemonic.js",
    "revision": "f30940176ec1e71b5a5f0c9b784a98b9"
  },
  {
    "url": "lib/nacl-fast-cn.js",
    "revision": "1fe1387eb865d9e843697a9d315d95b1"
  },
  {
    "url": "lib/nacl-fast.js",
    "revision": "a9c5b4bca7d2aa621a86d5085ce65d03"
  },
  {
    "url": "lib/nacl-fast.min.js",
    "revision": "72444801c9affc1654ef12860c67e976"
  },
  {
    "url": "lib/nacl-util.min.js",
    "revision": "c7b843b9e9b5aad102c855c600c7edc8"
  },
  {
    "url": "lib/nacl.js",
    "revision": "bf72b0a25fc3edf0c1a638aa43642714"
  },
  {
    "url": "lib/nacl.min.js",
    "revision": "d8eaf281c8890a60ebe82840456edc33"
  },
  {
    "url": "lib/numbersLab/Context.js",
    "revision": "884ca8e806f9d384611fb0ba25b398ef"
  },
  {
    "url": "lib/numbersLab/DependencyInjector.js",
    "revision": "84faea338105a5214c5148bb0f337c5c"
  },
  {
    "url": "lib/numbersLab/DestructableView.js",
    "revision": "6afa1f777849c59e67a42f94f0c8464d"
  },
  {
    "url": "lib/numbersLab/Logger.js",
    "revision": "8a2dcc2a9c3af93c3d6c81d0f2e7681a"
  },
  {
    "url": "lib/numbersLab/Observable.js",
    "revision": "1e189f8ed916542f76b022cc2a248a47"
  },
  {
    "url": "lib/numbersLab/Router.js",
    "revision": "ab372d549e7e8a7b32da2b2b1996a206"
  },
  {
    "url": "lib/numbersLab/VueAnnotate.js",
    "revision": "373137597222838c73d5552e7552b08b"
  },
  {
    "url": "lib/polyfills/core.min.js",
    "revision": "6ff449122255e7a91fb884ea7016c601"
  },
  {
    "url": "lib/polyfills/crypto.js",
    "revision": "13647291f45a582eee64e000b09d9567"
  },
  {
    "url": "lib/polyfills/textEncoding/encoding-indexes.js",
    "revision": "50f27403be5972eae4831f5b69db1f80"
  },
  {
    "url": "lib/polyfills/textEncoding/encoding.js",
    "revision": "cfc731bd62baec239b2c4daf33b5e810"
  },
  {
    "url": "lib/require.js",
    "revision": "bebd45d1f406bbe61424136b03e50895"
  },
  {
    "url": "lib/sha3.js",
    "revision": "9f298ac7e4ee707645a8d711f3ed916b"
  },
  {
    "url": "lib/sweetalert2.js",
    "revision": "4b69bbd418e85d6efdac5630ed40d76e"
  },
  {
    "url": "lib/vue-i18n.js",
    "revision": "7d220253d58eb13939d24b1b7eb2d884"
  },
  {
    "url": "lib/vue.min.js",
    "revision": "5283b86cbf48a538ee3cbebac633ccd4"
  },
  {
    "url": "manifest.json",
    "revision": "5d91e91213013f75e5e3c2d4a5918ac7"
  },
  {
    "url": "model/AppState.js",
    "revision": "3fe1415e64b86bd8f4a3e6951fe8981a"
  },
  {
    "url": "model/blockchain/BlockchainExplorer.js",
    "revision": "4c5f54978a36f58b757edcee7966fd9b"
  },
  {
    "url": "model/blockchain/BlockchainExplorerRPCDaemon.js",
    "revision": "6b0843e122980daf9f48e78fd6d4bd37"
  },
  {
    "url": "model/Cn.js",
    "revision": "3ffc883be0d7acea4e20f940bf7b6417"
  },
  {
    "url": "model/CoinUri.js",
    "revision": "d2d519118955da95a6ce6f102c61cf0b"
  },
  {
    "url": "model/Constants.js",
    "revision": "8acf6d5f8d2a68ea372d2d91d3c427ac"
  },
  {
    "url": "model/Functions.js",
    "revision": "9c22c2480507da70340c9b27d9c9119c"
  },
  {
    "url": "model/KeysRepository.js",
    "revision": "c9a201b23d69a0c9f0292a192a52da9d"
  },
  {
    "url": "model/MathUtil.js",
    "revision": "1dafc5a68cf404bfdc7846d634797282"
  },
  {
    "url": "model/Mnemonic.js",
    "revision": "83a96b38d502c9192477ff0f568f6945"
  },
  {
    "url": "model/MnemonicLang.js",
    "revision": "8b6d66c821c1e04f954c99c3757b6075"
  },
  {
    "url": "model/Nfc.js",
    "revision": "ca17ec627c5d9601bd25739ec3cc8c34"
  },
  {
    "url": "model/Password.js",
    "revision": "7d20fa7546897358d43a821b0bc8adb1"
  },
  {
    "url": "model/QRReader.js",
    "revision": "dad18501e542b58402ce5d54fa7b072b"
  },
  {
    "url": "model/Storage.js",
    "revision": "39e0693482284ed1beabf1ac048f7791"
  },
  {
    "url": "model/Transaction.js",
    "revision": "c1cf24325e30302692105ee3f5118425"
  },
  {
    "url": "model/TransactionsExplorer.js",
    "revision": "3104666c98e367dc833e128d6a76f4ca"
  },
  {
    "url": "model/Translations.js",
    "revision": "6cd6934dceadd3c97599bc093207fd06"
  },
  {
    "url": "model/Wallet.js",
    "revision": "ddcbd7292bb2b0647f72f3198b158815"
  },
  {
    "url": "model/WalletRepository.js",
    "revision": "11536d9f1da86f3b1d331028c1aa913d"
  },
  {
    "url": "model/WalletWatchdog.js",
    "revision": "d208146cec3e6a4e253d543029f08c4a"
  },
  {
    "url": "pages/account.html",
    "revision": "f54ad9e48a3b5dfb26cbca45287b35bd"
  },
  {
    "url": "pages/account.js",
    "revision": "eebdf2d70f6bbc99d10cb5cc1fa009e2"
  },
  {
    "url": "pages/changeWalletPassword.html",
    "revision": "cf44f48e8c60b3c2e19e22e825a89724"
  },
  {
    "url": "pages/changeWalletPassword.js",
    "revision": "caccd06a3029d4f3c9afe2880cd2b174"
  },
  {
    "url": "pages/createWallet.html",
    "revision": "413543ffbf94919ce6b5be51d309bc55"
  },
  {
    "url": "pages/createWallet.js",
    "revision": "ebf7e171b95d21b85a21fcfe294f76c0"
  },
  {
    "url": "pages/disconnect.html",
    "revision": "d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    "url": "pages/disconnect.js",
    "revision": "3594698740c48755bfb42a88ac737180"
  },
  {
    "url": "pages/donate.html",
    "revision": "dbfa50c567e6b47ad5c463cbafe3a5ae"
  },
  {
    "url": "pages/donate.js",
    "revision": "f3b91d98886b1832f2546d5bbacf078f"
  },
  {
    "url": "pages/export.html",
    "revision": "0829e8dcf1a904dbbe1be305abf85900"
  },
  {
    "url": "pages/export.js",
    "revision": "a795ec5439ede9dcefaf81d930b9a594"
  },
  {
    "url": "pages/import.html",
    "revision": "e44b3574cd9ac9e0f3986489a5d63881"
  },
  {
    "url": "pages/import.js",
    "revision": "84f02034ef92f0bc0c8be5b9974c350b"
  },
  {
    "url": "pages/importFromFile.html",
    "revision": "b824f9fc68ce358032faecd70b0e099b"
  },
  {
    "url": "pages/importFromFile.js",
    "revision": "d2f16c2eca0b70c39ee9e8a32d496aa7"
  },
  {
    "url": "pages/importFromKeys.html",
    "revision": "af4f0ed3a45c6cd994e9a000bf4397de"
  },
  {
    "url": "pages/importFromKeys.js",
    "revision": "0a0d736614fdec95d3eabf79ad1dddce"
  },
  {
    "url": "pages/importFromMnemonic.html",
    "revision": "367f09264b3c3008ee0eda752d4a0ea7"
  },
  {
    "url": "pages/importFromMnemonic.js",
    "revision": "f6f7e542cbfa34a6d3d046cb80a56a4f"
  },
  {
    "url": "pages/importFromQr.html",
    "revision": "172fc490fa9a97ed146895e0f35aeedc"
  },
  {
    "url": "pages/importFromQr.js",
    "revision": "a3daa209d210f7c7d1836fb0f157ad7d"
  },
  {
    "url": "pages/index.html",
    "revision": "2f2e89f17de02566e8d5d45958ee66af"
  },
  {
    "url": "pages/index.js",
    "revision": "44fe87058e5c8f0d634571acf76273ad"
  },
  {
    "url": "pages/network.html",
    "revision": "1fdea30266d0779652847d8cc9c7fadf"
  },
  {
    "url": "pages/network.js",
    "revision": "7084f167b0a163a345bd097c55864fae"
  },
  {
    "url": "pages/privacyPolicy.html",
    "revision": "2a584b7cf7785deb243838da29e8ae07"
  },
  {
    "url": "pages/privacyPolicy.js",
    "revision": "d6ceeaeccd8de4ef2001a301b0337715"
  },
  {
    "url": "pages/receive.html",
    "revision": "4f8afcc46a986402e665b511a2a270fa"
  },
  {
    "url": "pages/receive.js",
    "revision": "9f31c337c6f84fef72fd27f1a679d7fc"
  },
  {
    "url": "pages/send.html",
    "revision": "b293a5c99b55f91376c9a37b7b534573"
  },
  {
    "url": "pages/send.js",
    "revision": "e8af3125d813eeafd1a0d6be91c628c2"
  },
  {
    "url": "pages/settings.html",
    "revision": "e00921c9b681b01d8b35b108ff23e4e7"
  },
  {
    "url": "pages/settings.js",
    "revision": "169fad1b5f309fb18c1e280263c69d0a"
  },
  {
    "url": "pages/support.html",
    "revision": "176f4e685f5634390560f31aed1a4311"
  },
  {
    "url": "pages/support.js",
    "revision": "7f0c6f3dd035c44a802f7fa464e8931d"
  },
  {
    "url": "pages/termsOfUse.html",
    "revision": "d245c225ede186bbb931f7da7c0bc1fa"
  },
  {
    "url": "pages/termsOfUse.js",
    "revision": "45ca19345556e8f2454f167710183aa4"
  },
  {
    "url": "providers/BlockchainExplorerProvider.js",
    "revision": "588cb87114efa79bd6511bc197dbc49f"
  },
  {
    "url": "service-worker-raw.js",
    "revision": "3f7443e2724e74587330aff15f93149e"
  },
  {
    "url": "translations/de.json",
    "revision": "3214a353d93d4bc6ef5bef1d1b188bae"
  },
  {
    "url": "translations/en.json",
    "revision": "17d8da6aca8c14df3a578fbff8e27843"
  },
  {
    "url": "translations/es.json",
    "revision": "a6b30e3bb5c953ac40e2f17181bdbdb6"
  },
  {
    "url": "translations/fa.json",
    "revision": "3138ff1ac30b221c23cb91e4aa088528"
  },
  {
    "url": "translations/fr.json",
    "revision": "4b4a66a46c279ba081c8ca5af6596e13"
  },
  {
    "url": "translations/gr.json",
    "revision": "e75a156aac2dc8b9108c6fd15a85a594"
  },
  {
    "url": "translations/hu.json",
    "revision": "aba7c35446be1e123784187ef4e616d6"
  },
  {
    "url": "translations/it.json",
    "revision": "60af08a81a4782b778db5c2698424838"
  },
  {
    "url": "translations/ko.json",
    "revision": "0b6a282381215c03c7f203dbbbd494d9"
  },
  {
    "url": "translations/pl.json",
    "revision": "84048f6e642175b978286a0522a07e1f"
  },
  {
    "url": "translations/ru.json",
    "revision": "99dd49e5651c8575132c7bbd6012e0b3"
  },
  {
    "url": "translations/sr.json",
    "revision": "ea34f6e436aa8767a40e6b6671493c89"
  },
  {
    "url": "translations/uk.json",
    "revision": "8cc443bc5d79d9212625863249694039"
  },
  {
    "url": "translations/zh.json",
    "revision": "12ca69bc1dd16328a06aa723284e58ed"
  },
  {
    "url": "utils/Url.js",
    "revision": "49f1aa1b3729b2f5e19d742da52c03e0"
  },
  {
    "url": "workers/TransferProcessing.js",
    "revision": "c2da1477e4e08863c03acc07bf257ec5"
  },
  {
    "url": "workers/TransferProcessingEntrypoint.js",
    "revision": "a5245276b3005b7f1fc44b91b42d326e"
  }
]);
self.addEventListener('message', function (event) {
    if (!event.data) {
        return;
    }
    switch (event.data) {
        case 'force-activate':
            self.skipWaiting();
            self.clients.claim();
            self.clients.matchAll().then(function (clients) {
                clients.forEach(function (client) { return client.postMessage('reload-window-update'); });
            });
            break;
        default:
            // NOOP
            break;
    }
});
