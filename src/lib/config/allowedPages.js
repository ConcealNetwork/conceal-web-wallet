define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.allowedPages = void 0;
    exports.isAllowedPage = isAllowedPage;
    exports.allowedPages = [
        'index',
        'account',
        'send',
        'receive',
        'messages',
        'deposits',
        'export',
        'settings',
        'donate',
        'network',
        'disconnect',
        'createWallet',
        'import',
        'importFromKeys',
        'importFromFile',
        'importFromMnemonic',
        'termsOfUse',
        'privacyPolicy',
        'support',
    ];
    // Helper function to check if a page is allowed
    function isAllowedPage(page) {
        return exports.allowedPages.includes(page);
    }
});
