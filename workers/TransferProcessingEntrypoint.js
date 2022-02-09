"use strict";
importScripts('../lib/polyfills/core.min.js');
importScripts('../lib/polyfills/textEncoding/encoding-indexes.js');
importScripts('../lib/polyfills/textEncoding/encoding.js');
importScripts('../lib/polyfills/crypto.js');
importScripts('../lib/require.js');
importScripts('../lib/biginteger.js');
importScripts('../config.js');
importScripts('../lib/base58.js');
importScripts('../lib/crypto.js');
importScripts('../lib/nacl-fast.js');
importScripts('../lib/nacl-util.min.js');
importScripts('../lib/sha3.js');
try {
    importScripts('../lib/cn_utils_native.js');
    self.Module_native['onRuntimeInitialized'] = function () {
        requirejs(['./TransferProcessing.js'], function (App) { });
    };
}
catch (e) {
    setTimeout(function () {
        requirejs(['./TransferProcessing.js'], function (App) { });
    }, 5 * 1000);
}
