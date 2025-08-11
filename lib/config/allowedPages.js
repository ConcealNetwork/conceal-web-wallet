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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.allowedExceptions = exports.allowedPages = exports.ALLOWED_EXCEPTIONS_INTEGRITY_HASH = void 0;
    exports.isAllowedPage = isAllowedPage;
    exports.isAllowedException = isAllowedException;
    exports.validateExceptionsIntegrity = validateExceptionsIntegrity;
    // The hash of allowedExceptions array, used for integrity validation
    exports.ALLOWED_EXCEPTIONS_INTEGRITY_HASH = 'sha384-8f59c6a2a7a81c7a22f46c9bbe2b5bbc014af6295d8c49639d686d1aa1b5b3cfb4736dc7b533eac4462601fc0d0f5620'; // This will be updated by build.js
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
        'importFromQr',
        'termsOfUse',
        'privacyPolicy',
        'support',
    ];
    // List of allowed exceptions for special URLs
    exports.allowedExceptions = [
        'send%3Faddress%3Dccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj'
    ];
    // Helper function to check if a page is allowed
    function isAllowedPage(page) {
        return exports.allowedPages.includes(page);
    }
    // Helper function to check if a URL is an allowed exception
    function isAllowedException(url) {
        return exports.allowedExceptions.includes(url);
    }
    // Helper function to validate the exceptions integrity
    function validateExceptionsIntegrity() {
        return __awaiter(this, void 0, void 0, function () {
            var exceptionsContent, currentHash;
            return __generator(this, function (_a) {
                exceptionsContent = exports.allowedExceptions.join('').replace(/['"]/g, '').replace(/,/g, '').trim();
                currentHash = "sha384-".concat(window.sha3_384(exceptionsContent));
                return [2 /*return*/, currentHash === exports.ALLOWED_EXCEPTIONS_INTEGRITY_HASH];
            });
        });
    }
});
