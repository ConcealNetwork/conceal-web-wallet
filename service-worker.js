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
    "revision": "9ebc7df1decf7aa026fb6c982d7094dc"
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
    "revision": "beb5825333a3382c13fb95f320179187"
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
    "revision": "d7f18b8b9f48aa6b24ec424eb13d9430"
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
    "revision": "67a582366edae346b7aa0fb14be03348"
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
    "revision": "bf06ac5b16fb1f754c5190c6e4a688a6"
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
    "revision": "9e834f89e7006e2250f1b2c853419adb"
  },
  {
    "url": "model/blockchain/BlockchainExplorer.js",
    "revision": "f38ab86de3e385035147b61190c1e1ff"
  },
  {
    "url": "model/blockchain/BlockchainExplorerRPCDaemon.js",
    "revision": "7de1ec969190fe9bd4a90116f912a00c"
  },
  {
    "url": "model/Cn.js",
    "revision": "e7457ac5daab7a3f1c1613e40aab8017"
  },
  {
    "url": "model/CoinUri.js",
    "revision": "81ba037d5d8678f5628947e361db4ee3"
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
    "revision": "066e2872e83418cf4109205c35c5185d"
  },
  {
    "url": "model/MnemonicLang.js",
    "revision": "1890f0331734c9849be70ac51f17aea9"
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
    "revision": "d6398ec8645f6f0d1a56a7e83c3ef12e"
  },
  {
    "url": "model/Storage.js",
    "revision": "121f097e08b94d86f07c0f990a15f8e7"
  },
  {
    "url": "model/Transaction.js",
    "revision": "c1cf24325e30302692105ee3f5118425"
  },
  {
    "url": "model/TransactionsExplorer.js",
    "revision": "00e3d02550f09aa6fedf9e24eeed283e"
  },
  {
    "url": "model/Translations.js",
    "revision": "6cd6934dceadd3c97599bc093207fd06"
  },
  {
    "url": "model/Wallet.js",
    "revision": "307f9b9134f37192e044b644f33ede90"
  },
  {
    "url": "model/WalletRepository.js",
    "revision": "682b945de2dc0ed7b7571fbe8d235673"
  },
  {
    "url": "model/WalletWatchdog.js",
    "revision": "8eab97988ef47cbd6bcfa720dbcf6a1f"
  },
  {
    "url": "pages/account.html",
    "revision": "7acea2bcf6eddb28bd33a979f97676d1"
  },
  {
    "url": "pages/account.js",
    "revision": "43f1014e86cbe0cf0f6cdbb83fd17484"
  },
  {
    "url": "pages/changeWalletPassword.html",
    "revision": "cf44f48e8c60b3c2e19e22e825a89724"
  },
  {
    "url": "pages/changeWalletPassword.js",
    "revision": "209e1aee68c4cb853808ad3ef749655c"
  },
  {
    "url": "pages/createWallet.html",
    "revision": "413543ffbf94919ce6b5be51d309bc55"
  },
  {
    "url": "pages/createWallet.js",
    "revision": "6e676b0cec377d46ec6662a51e338a7b"
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
    "revision": "d65ed68add23b8d8fa95033bdb37467e"
  },
  {
    "url": "pages/export.html",
    "revision": "0829e8dcf1a904dbbe1be305abf85900"
  },
  {
    "url": "pages/export.js",
    "revision": "c98a20e14d0b544d7ab944f88ae1b84f"
  },
  {
    "url": "pages/import.html",
    "revision": "e44b3574cd9ac9e0f3986489a5d63881"
  },
  {
    "url": "pages/import.js",
    "revision": "27d9140b3940e24c404c3662c80ba651"
  },
  {
    "url": "pages/importFromFile.html",
    "revision": "b824f9fc68ce358032faecd70b0e099b"
  },
  {
    "url": "pages/importFromFile.js",
    "revision": "b24a0750c6b96402dd85efe97452626e"
  },
  {
    "url": "pages/importFromKeys.html",
    "revision": "1388fc183805920f522c5cb26e3c2714"
  },
  {
    "url": "pages/importFromKeys.js",
    "revision": "c24c27a0e6be26f13f6de05884f0220c"
  },
  {
    "url": "pages/importFromMnemonic.html",
    "revision": "367f09264b3c3008ee0eda752d4a0ea7"
  },
  {
    "url": "pages/importFromMnemonic.js",
    "revision": "0f3be1232e6b0151c8824ab1e8b1b3c3"
  },
  {
    "url": "pages/importFromQr.html",
    "revision": "172fc490fa9a97ed146895e0f35aeedc"
  },
  {
    "url": "pages/importFromQr.js",
    "revision": "705dfbea523bdf751443b54b5cd52ce4"
  },
  {
    "url": "pages/index.html",
    "revision": "2f2e89f17de02566e8d5d45958ee66af"
  },
  {
    "url": "pages/index.js",
    "revision": "de8be9509c880a31f151a32abf395288"
  },
  {
    "url": "pages/network.html",
    "revision": "e1c7512601077d7698bf66cb46aacc46"
  },
  {
    "url": "pages/network.js",
    "revision": "b789e1979c1610739ff53448f12e28ef"
  },
  {
    "url": "pages/privacyPolicy.html",
    "revision": "2a584b7cf7785deb243838da29e8ae07"
  },
  {
    "url": "pages/privacyPolicy.js",
    "revision": "cd3c961feb5b983889b21edeaf20afbd"
  },
  {
    "url": "pages/receive.html",
    "revision": "4f8afcc46a986402e665b511a2a270fa"
  },
  {
    "url": "pages/receive.js",
    "revision": "29fc7c0c469ffd9181ad8760c78e0132"
  },
  {
    "url": "pages/send.html",
    "revision": "c6d2866f5ca70815a64aaa47c30645cc"
  },
  {
    "url": "pages/send.js",
    "revision": "dbf3240bc1c5369f6b548eb9c5c4358e"
  },
  {
    "url": "pages/settings.html",
    "revision": "8d2635b4eb7524a9a03ce3b9e5919954"
  },
  {
    "url": "pages/settings.js",
    "revision": "2dfab3dc42086d117dfc5049a568d7ab"
  },
  {
    "url": "pages/support.html",
    "revision": "176f4e685f5634390560f31aed1a4311"
  },
  {
    "url": "pages/support.js",
    "revision": "4cb168e6fc83406bfb2a0adaf05259ad"
  },
  {
    "url": "pages/termsOfUse.html",
    "revision": "d245c225ede186bbb931f7da7c0bc1fa"
  },
  {
    "url": "pages/termsOfUse.js",
    "revision": "3e3524cae093fb1a0690ab73155cf729"
  },
  {
    "url": "providers/BlockchainExplorerProvider.js",
    "revision": "9f947d6474de6463752cb8022bfea26d"
  },
  {
    "url": "service-worker-raw.js",
    "revision": "3f7443e2724e74587330aff15f93149e"
  },
  {
    "url": "translations/de.json",
    "revision": "977bc0673124175eb3416839949960bc"
  },
  {
    "url": "translations/en.json",
    "revision": "c79847e76d0c77d7fd820ea9b85967c2"
  },
  {
    "url": "translations/es.json",
    "revision": "3ead0718ee73076d960fb34e94f2f727"
  },
  {
    "url": "translations/fa.json",
    "revision": "aa1ef146eadabb2f4e6d3d72ccada01d"
  },
  {
    "url": "translations/fr.json",
    "revision": "540aa9d82c99aaf00482b3b845f37366"
  },
  {
    "url": "translations/gr.json",
    "revision": "a273f8ffb81a7ff6c181cec7642c7ca8"
  },
  {
    "url": "translations/hu.json",
    "revision": "ad5be31d2bd5ac913f2acc16653ffa7c"
  },
  {
    "url": "translations/it.json",
    "revision": "ade147949edba636f160d41871192561"
  },
  {
    "url": "translations/ko.json",
    "revision": "f926095549c203dfc13f4c9dfa874f88"
  },
  {
    "url": "translations/pl.json",
    "revision": "b4b808fc5c3b5f2eb6a46de0c3c38005"
  },
  {
    "url": "translations/ru.json",
    "revision": "7d2da5801606fa7cfdcd4474345a7180"
  },
  {
    "url": "translations/sr.json",
    "revision": "4473f4efa09d11acfb349b9ea58cfec6"
  },
  {
    "url": "translations/uk.json",
    "revision": "7db64342a7f47ec236dcc672695945db"
  },
  {
    "url": "translations/zh.json",
    "revision": "9aed92cc46ae8a883c0adb322e9eadaa"
  },
  {
    "url": "utils/Url.js",
    "revision": "9e38cba47fd1a3b558d77a98ee51dccd"
  },
  {
    "url": "workers/TransferProcessing.js",
    "revision": "4d25ca3593a2a6bce67f392923e48a4d"
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
