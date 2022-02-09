/**
 *	   Copyright (c) 2018, Gnock
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Masari Project
 *     Copyright (c) 2014-2018, MyMonero.com
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
define(["require", "exports", "./Mnemonic"], function (require, exports, Mnemonic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CnTransactions = exports.Cn = exports.CnNativeBride = exports.CnUtils = exports.CnRandom = exports.CnVars = void 0;
    var HASH_STATE_BYTES = 200;
    var HASH_SIZE = 32;
    var ADDRESS_CHECKSUM_SIZE = 4;
    var INTEGRATED_ID_SIZE = 8;
    var ENCRYPTED_PAYMENT_ID_TAIL = 141;
    var CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX = config.addressPrefix;
    var CRYPTONOTE_PUBLIC_INTEGRATED_ADDRESS_BASE58_PREFIX = config.integratedAddressPrefix;
    var CRYPTONOTE_PUBLIC_SUBADDRESS_BASE58_PREFIX = config.subAddressPrefix;
    if (config.testnet === true) {
        CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX = config.addressPrefixTestnet;
        CRYPTONOTE_PUBLIC_INTEGRATED_ADDRESS_BASE58_PREFIX = config.integratedAddressPrefixTestnet;
        CRYPTONOTE_PUBLIC_SUBADDRESS_BASE58_PREFIX = config.subAddressPrefixTestnet;
    }
    var UINT64_MAX = new JSBigInt(2).pow(64);
    var CURRENT_TX_VERSION = 1;
    var OLD_TX_VERSION = 1;
    var TX_EXTRA_NONCE_MAX_COUNT = 255;
    var TX_EXTRA_TAGS = {
        PADDING: '00',
        PUBKEY: '01',
        NONCE: '02',
        MERGE_MINING: '03',
        ADDITIONAL_PUBKEY: '04'
    };
    var TX_EXTRA_NONCE_TAGS = {
        PAYMENT_ID: '00',
        ENCRYPTED_PAYMENT_ID: '01'
    };
    var KEY_SIZE = 32;
    var STRUCT_SIZES = {
        GE_P3: 160,
        GE_P2: 120,
        GE_P1P1: 160,
        GE_CACHED: 160,
        EC_SCALAR: 32,
        EC_POINT: 32,
        KEY_IMAGE: 32,
        GE_DSMP: 160 * 8,
        SIGNATURE: 64 // ec_scalar * 2
    };
    var CnVars;
    (function (CnVars) {
        var RCT_TYPE;
        (function (RCT_TYPE) {
            RCT_TYPE[RCT_TYPE["Null"] = 0] = "Null";
            RCT_TYPE[RCT_TYPE["Full"] = 1] = "Full";
            RCT_TYPE[RCT_TYPE["Simple"] = 2] = "Simple";
            RCT_TYPE[RCT_TYPE["FullBulletproof"] = 3] = "FullBulletproof";
            RCT_TYPE[RCT_TYPE["SimpleBulletproof"] = 4] = "SimpleBulletproof";
        })(RCT_TYPE = CnVars.RCT_TYPE || (CnVars.RCT_TYPE = {}));
        CnVars.H = "8b655970153799af2aeadc9ff1add0ea6c7251d54154cfa92c173a0dd39c1f94"; //base H for amounts
        CnVars.l = JSBigInt("7237005577332262213973186563042994240857116359379907606001950938285454250989"); //curve order (not RCT specific)
        CnVars.I = "0100000000000000000000000000000000000000000000000000000000000000"; //identity element
        CnVars.Z = "0000000000000000000000000000000000000000000000000000000000000000"; //zero scalar
        //H2 object to speed up some operations
        CnVars.H2 = ["8b655970153799af2aeadc9ff1add0ea6c7251d54154cfa92c173a0dd39c1f94", "8faa448ae4b3e2bb3d4d130909f55fcd79711c1c83cdbccadd42cbe1515e8712",
            "12a7d62c7791654a57f3e67694ed50b49a7d9e3fc1e4c7a0bde29d187e9cc71d", "789ab9934b49c4f9e6785c6d57a498b3ead443f04f13df110c5427b4f214c739",
            "771e9299d94f02ac72e38e44de568ac1dcb2edc6edb61f83ca418e1077ce3de8", "73b96db43039819bdaf5680e5c32d741488884d18d93866d4074a849182a8a64",
            "8d458e1c2f68ebebccd2fd5d379f5e58f8134df3e0e88cad3d46701063a8d412", "09551edbe494418e81284455d64b35ee8ac093068a5f161fa6637559177ef404",
            "d05a8866f4df8cee1e268b1d23a4c58c92e760309786cdac0feda1d247a9c9a7", "55cdaad518bd871dd1eb7bc7023e1dc0fdf3339864f88fdd2de269fe9ee1832d",
            "e7697e951a98cfd5712b84bbe5f34ed733e9473fcb68eda66e3788df1958c306", "f92a970bae72782989bfc83adfaa92a4f49c7e95918b3bba3cdc7fe88acc8d47",
            "1f66c2d491d75af915c8db6a6d1cb0cd4f7ddcd5e63d3ba9b83c866c39ef3a2b", "3eec9884b43f58e93ef8deea260004efea2a46344fc5965b1a7dd5d18997efa7",
            "b29f8f0ccb96977fe777d489d6be9e7ebc19c409b5103568f277611d7ea84894", "56b1f51265b9559876d58d249d0c146d69a103636699874d3f90473550fe3f2c",
            "1d7a36575e22f5d139ff9cc510fa138505576b63815a94e4b012bfd457caaada", "d0ac507a864ecd0593fa67be7d23134392d00e4007e2534878d9b242e10d7620",
            "f6c6840b9cf145bb2dccf86e940be0fc098e32e31099d56f7fe087bd5deb5094", "28831a3340070eb1db87c12e05980d5f33e9ef90f83a4817c9f4a0a33227e197",
            "87632273d629ccb7e1ed1a768fa2ebd51760f32e1c0b867a5d368d5271055c6e", "5c7b29424347964d04275517c5ae14b6b5ea2798b573fc94e6e44a5321600cfb",
            "e6945042d78bc2c3bd6ec58c511a9fe859c0ad63fde494f5039e0e8232612bd5", "36d56907e2ec745db6e54f0b2e1b2300abcb422e712da588a40d3f1ebbbe02f6",
            "34db6ee4d0608e5f783650495a3b2f5273c5134e5284e4fdf96627bb16e31e6b", "8e7659fb45a3787d674ae86731faa2538ec0fdf442ab26e9c791fada089467e9",
            "3006cf198b24f31bb4c7e6346000abc701e827cfbb5df52dcfa42e9ca9ff0802", "f5fd403cb6e8be21472e377ffd805a8c6083ea4803b8485389cc3ebc215f002a",
            "3731b260eb3f9482e45f1c3f3b9dcf834b75e6eef8c40f461ea27e8b6ed9473d", "9f9dab09c3f5e42855c2de971b659328a2dbc454845f396ffc053f0bb192f8c3",
            "5e055d25f85fdb98f273e4afe08464c003b70f1ef0677bb5e25706400be620a5", "868bcf3679cb6b500b94418c0b8925f9865530303ae4e4b262591865666a4590",
            "b3db6bd3897afbd1df3f9644ab21c8050e1f0038a52f7ca95ac0c3de7558cb7a", "8119b3a059ff2cac483e69bcd41d6d27149447914288bbeaee3413e6dcc6d1eb",
            "10fc58f35fc7fe7ae875524bb5850003005b7f978c0c65e2a965464b6d00819c", "5acd94eb3c578379c1ea58a343ec4fcff962776fe35521e475a0e06d887b2db9",
            "33daf3a214d6e0d42d2300a7b44b39290db8989b427974cd865db011055a2901", "cfc6572f29afd164a494e64e6f1aeb820c3e7da355144e5124a391d06e9f95ea",
            "d5312a4b0ef615a331f6352c2ed21dac9e7c36398b939aec901c257f6cbc9e8e", "551d67fefc7b5b9f9fdbf6af57c96c8a74d7e45a002078a7b5ba45c6fde93e33",
            "d50ac7bd5ca593c656928f38428017fc7ba502854c43d8414950e96ecb405dc3", "0773e18ea1be44fe1a97e239573cfae3e4e95ef9aa9faabeac1274d3ad261604",
            "e9af0e7ca89330d2b8615d1b4137ca617e21297f2f0ded8e31b7d2ead8714660", "7b124583097f1029a0c74191fe7378c9105acc706695ed1493bb76034226a57b",
            "ec40057b995476650b3db98e9db75738a8cd2f94d863b906150c56aac19caa6b", "01d9ff729efd39d83784c0fe59c4ae81a67034cb53c943fb818b9d8ae7fc33e5",
            "00dfb3c696328c76424519a7befe8e0f6c76f947b52767916d24823f735baf2e", "461b799b4d9ceea8d580dcb76d11150d535e1639d16003c3fb7e9d1fd13083a8",
            "ee03039479e5228fdc551cbde7079d3412ea186a517ccc63e46e9fcce4fe3a6c", "a8cfb543524e7f02b9f045acd543c21c373b4c9b98ac20cec417a6ddb5744e94",
            "932b794bf89c6edaf5d0650c7c4bad9242b25626e37ead5aa75ec8c64e09dd4f", "16b10c779ce5cfef59c7710d2e68441ea6facb68e9b5f7d533ae0bb78e28bf57",
            "0f77c76743e7396f9910139f4937d837ae54e21038ac5c0b3fd6ef171a28a7e4", "d7e574b7b952f293e80dde905eb509373f3f6cd109a02208b3c1e924080a20ca",
            "45666f8c381e3da675563ff8ba23f83bfac30c34abdde6e5c0975ef9fd700cb9", "b24612e454607eb1aba447f816d1a4551ef95fa7247fb7c1f503020a7177f0dd",
            "7e208861856da42c8bb46a7567f8121362d9fb2496f131a4aa9017cf366cdfce", "5b646bff6ad1100165037a055601ea02358c0f41050f9dfe3c95dccbd3087be0",
            "746d1dccfed2f0ff1e13c51e2d50d5324375fbd5bf7ca82a8931828d801d43ab", "cb98110d4a6bb97d22feadbc6c0d8930c5f8fc508b2fc5b35328d26b88db19ae",
            "60b626a033b55f27d7676c4095eababc7a2c7ede2624b472e97f64f96b8cfc0e", "e5b52bc927468df71893eb8197ef820cf76cb0aaf6e8e4fe93ad62d803983104",
            "056541ae5da9961be2b0a5e895e5c5ba153cbb62dd561a427bad0ffd41923199", "f8fef05a3fa5c9f3eba41638b247b711a99f960fe73aa2f90136aeb20329b888"];
    })(CnVars = exports.CnVars || (exports.CnVars = {}));
    var CnRandom;
    (function (CnRandom) {
        // Generate a 256-bit / 64-char / 32-byte crypto random
        function rand_32() {
            return Mnemonic_1.Mnemonic.mn_random(256);
        }
        CnRandom.rand_32 = rand_32;
        // Generate a 128-bit / 32-char / 16-byte crypto random
        function rand_16() {
            return Mnemonic_1.Mnemonic.mn_random(128);
        }
        CnRandom.rand_16 = rand_16;
        // Generate a 64-bit / 16-char / 8-byte crypto random
        function rand_8() {
            return Mnemonic_1.Mnemonic.mn_random(64);
        }
        CnRandom.rand_8 = rand_8;
        function random_scalar() {
            //let rand = this.sc_reduce(mn_random(64 * 8));
            //return rand.slice(0, STRUCT_SIZES.EC_SCALAR * 2);
            return CnNativeBride.sc_reduce32(CnRandom.rand_32());
        }
        CnRandom.random_scalar = random_scalar;
    })(CnRandom = exports.CnRandom || (exports.CnRandom = {}));
    var CnUtils;
    (function (CnUtils) {
        function hextobin(hex) {
            if (hex.length % 2 !== 0)
                throw "Hex string has invalid length!";
            var res = new Uint8Array(hex.length / 2);
            for (var i = 0; i < hex.length / 2; ++i) {
                res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            }
            return res;
        }
        CnUtils.hextobin = hextobin;
        function bintohex(bin) {
            var out = [];
            if (typeof bin === 'string') {
                for (var i = 0; i < bin.length; ++i) {
                    out.push(("0" + bin[i].charCodeAt(0).toString(16)).slice(-2));
                }
            }
            else {
                for (var i = 0; i < bin.length; ++i) {
                    out.push(("0" + bin[i].toString(16)).slice(-2));
                }
            }
            return out.join("");
        }
        CnUtils.bintohex = bintohex;
        //switch byte order for hex string
        function swapEndian(hex) {
            if (hex.length % 2 !== 0) {
                return "length must be a multiple of 2!";
            }
            var data = "";
            for (var i = 1; i <= hex.length / 2; i++) {
                data += hex.substr(0 - 2 * i, 2);
            }
            return data;
        }
        CnUtils.swapEndian = swapEndian;
        //switch byte order charwise
        function swapEndianC(string) {
            var data = "";
            for (var i = 1; i <= string.length; i++) {
                data += string.substr(0 - i, 1);
            }
            return data;
        }
        CnUtils.swapEndianC = swapEndianC;
        //for most uses you'll also want to swapEndian after conversion
        //mainly to convert integer "scalars" to usable hexadecimal strings
        function d2h(integer) {
            if (typeof integer !== "string" && integer.toString().length > 15) {
                throw "integer should be entered as a string for precision";
            }
            var padding = "";
            for (var i = 0; i < 63; i++) {
                padding += "0";
            }
            return (padding + JSBigInt(integer).toString(16).toLowerCase()).slice(-64);
        }
        CnUtils.d2h = d2h;
        //integer (string) to scalar
        function d2s(integer) {
            if (typeof integer === "string") {
                return CnUtils.swapEndian(CnUtils.d2h(integer));
            }
            else {
                return CnUtils.swapEndian(CnUtils.d2h(integer.toString()));
            }
        }
        CnUtils.d2s = d2s;
        // hexadecimal to integer
        function h2d(hex) {
            /*let vali = 0;
            for (let j = 7; j >= 0; j--) {
                vali = (vali * 256 + test[j].charCodeAt(0));
            }
            return vali;*/
            // return JSBigInt.parse(test,16);
            // let bytes = Crypto.hextobin(test);
            // console.log('bytes',bytes, test,swapEndianC(test));
            // console.log(JSBigInt.parse(swapEndianC(test),16).valueOf());
            // console.log(JSBigInt.parse(test.substr(0,12),16).valueOf());
            var vali = 0;
            for (var j = 7; j >= 0; j--) {
                // console.log(vali,vali*256,bytes[j]);
                vali = (vali * 256 + parseInt(hex.slice(j * 2, j * 2 + 2), 16));
            }
            return vali;
        }
        CnUtils.h2d = h2d;
        function d2b(integer) {
            var integerStr = integer.toString();
            if (typeof integer !== "string" && integerStr.length > 15) {
                throw "integer should be entered as a string for precision";
            }
            var padding = "";
            for (var i = 0; i < 63; i++) {
                padding += "0";
            }
            var a = new JSBigInt(integerStr);
            if (a.toString(2).length > 64) {
                throw "amount overflows uint64!";
            }
            return CnUtils.swapEndianC((padding + a.toString(2)).slice(-64));
        }
        CnUtils.d2b = d2b;
        function ge_scalarmult(pub, sec) {
            if (pub.length !== 64 || sec.length !== 64) {
                throw "Invalid input length";
            }
            return CnUtils.bintohex(nacl.ll.ge_scalarmult(CnUtils.hextobin(pub), CnUtils.hextobin(sec)));
        }
        CnUtils.ge_scalarmult = ge_scalarmult;
        function ge_add(p1, p2) {
            if (p1.length !== 64 || p2.length !== 64) {
                throw "Invalid input length!";
            }
            return bintohex(nacl.ll.ge_add(hextobin(p1), hextobin(p2)));
        }
        CnUtils.ge_add = ge_add;
        //curve and scalar functions; split out to make their host functions cleaner and more readable
        //inverts X coordinate -- this seems correct ^_^ -luigi1111
        function ge_neg(point) {
            if (point.length !== 64) {
                throw "expected 64 char hex string";
            }
            return point.slice(0, 62) + ((parseInt(point.slice(62, 63), 16) + 8) % 16).toString(16) + point.slice(63, 64);
        }
        CnUtils.ge_neg = ge_neg;
        //order matters
        function ge_sub(point1, point2) {
            var point2n = CnUtils.ge_neg(point2);
            return CnUtils.ge_add(point1, point2n);
        }
        CnUtils.ge_sub = ge_sub;
        function sec_key_to_pub(sec) {
            if (sec.length !== 64) {
                throw "Invalid sec length";
            }
            return CnUtils.bintohex(nacl.ll.ge_scalarmult_base(hextobin(sec)));
        }
        CnUtils.sec_key_to_pub = sec_key_to_pub;
        function valid_hex(hex) {
            var exp = new RegExp("[0-9a-fA-F]{" + hex.length + "}");
            return exp.test(hex);
        }
        CnUtils.valid_hex = valid_hex;
        function ge_scalarmult_base(sec) {
            return CnUtils.sec_key_to_pub(sec);
        }
        CnUtils.ge_scalarmult_base = ge_scalarmult_base;
        function derivation_to_scalar(derivation, output_index) {
            var buf = "";
            if (derivation.length !== (STRUCT_SIZES.EC_POINT * 2)) {
                throw "Invalid derivation length!";
            }
            buf += derivation;
            var enc = CnUtils.encode_varint(output_index);
            if (enc.length > 10 * 2) {
                throw "output_index didn't fit in 64-bit varint";
            }
            buf += enc;
            return Cn.hash_to_scalar(buf);
        }
        CnUtils.derivation_to_scalar = derivation_to_scalar;
        function encode_varint(i) {
            var j = new JSBigInt(i);
            var out = '';
            // While i >= b10000000
            while (j.compare(0x80) >= 0) {
                // out.append i & b01111111 | b10000000
                out += ("0" + ((j.lowVal() & 0x7f) | 0x80).toString(16)).slice(-2);
                j = j.divide(new JSBigInt(2).pow(7));
            }
            out += ("0" + j.toJSValue().toString(16)).slice(-2);
            return out;
        }
        CnUtils.encode_varint = encode_varint;
        function cn_fast_hash(input) {
            if (input.length % 2 !== 0 || !CnUtils.valid_hex(input)) {
                throw "Input invalid";
            }
            //update to use new keccak impl (approx 45x faster)
            //let state = this.keccak(input, inlen, HASH_STATE_BYTES);
            //return state.substr(0, HASH_SIZE * 2);
            return keccak_256(CnUtils.hextobin(input));
        }
        CnUtils.cn_fast_hash = cn_fast_hash;
        function hex_xor(hex1, hex2) {
            if (!hex1 || !hex2 || hex1.length !== hex2.length || hex1.length % 2 !== 0 || hex2.length % 2 !== 0) {
                throw "Hex string(s) is/are invalid!";
            }
            var bin1 = hextobin(hex1);
            var bin2 = hextobin(hex2);
            var xor = new Uint8Array(bin1.length);
            for (var i = 0; i < xor.length; i++) {
                xor[i] = bin1[i] ^ bin2[i];
            }
            return bintohex(xor);
        }
        CnUtils.hex_xor = hex_xor;
        function trimRight(str, char) {
            while (str[str.length - 1] == char)
                str = str.slice(0, -1);
            return str;
        }
        CnUtils.trimRight = trimRight;
        function padLeft(str, len, char) {
            while (str.length < len) {
                str = char + str;
            }
            return str;
        }
        CnUtils.padLeft = padLeft;
        function ge_double_scalarmult_base_vartime(c, P, r) {
            if (c.length !== 64 || P.length !== 64 || r.length !== 64) {
                throw "Invalid input length!";
            }
            return bintohex(nacl.ll.ge_double_scalarmult_base_vartime(hextobin(c), hextobin(P), hextobin(r)));
        }
        CnUtils.ge_double_scalarmult_base_vartime = ge_double_scalarmult_base_vartime;
        function ge_double_scalarmult_postcomp_vartime(r, P, c, I) {
            if (c.length !== 64 || P.length !== 64 || r.length !== 64 || I.length !== 64) {
                throw "Invalid input length!";
            }
            var Pb = CnNativeBride.hash_to_ec_2(P);
            return bintohex(nacl.ll.ge_double_scalarmult_postcomp_vartime(hextobin(r), hextobin(Pb), hextobin(c), hextobin(I)));
        }
        CnUtils.ge_double_scalarmult_postcomp_vartime = ge_double_scalarmult_postcomp_vartime;
        function decompose_amount_into_digits(amount) {
            amount = amount.toString();
            var ret = [];
            while (amount.length > 0) {
                //check so we don't create 0s
                if (amount[0] !== "0") {
                    var digit = amount[0];
                    while (digit.length < amount.length) {
                        digit += "0";
                    }
                    ret.push(new JSBigInt(digit));
                }
                amount = amount.slice(1);
            }
            return ret;
        }
        CnUtils.decompose_amount_into_digits = decompose_amount_into_digits;
        function decode_rct_ecdh(ecdh, key) {
            var first = Cn.hash_to_scalar(key);
            var second = Cn.hash_to_scalar(first);
            return {
                mask: CnNativeBride.sc_sub(ecdh.mask, first),
                amount: CnNativeBride.sc_sub(ecdh.amount, second),
            };
        }
        CnUtils.decode_rct_ecdh = decode_rct_ecdh;
        function encode_rct_ecdh(ecdh, key) {
            var first = Cn.hash_to_scalar(key);
            var second = Cn.hash_to_scalar(first);
            return {
                mask: CnNativeBride.sc_add(ecdh.mask, first),
                amount: CnNativeBride.sc_add(ecdh.amount, second),
            };
        }
        CnUtils.encode_rct_ecdh = encode_rct_ecdh;
    })(CnUtils = exports.CnUtils || (exports.CnUtils = {}));
    var CnNativeBride;
    (function (CnNativeBride) {
        function sc_reduce32(hex) {
            var input = CnUtils.hextobin(hex);
            if (input.length !== 32) {
                throw "Invalid input length";
            }
            var mem = Module._malloc(32);
            Module.HEAPU8.set(input, mem);
            Module.ccall('sc_reduce32', 'void', ['number'], [mem]);
            var output = Module.HEAPU8.subarray(mem, mem + 32);
            Module._free(mem);
            return CnUtils.bintohex(output);
        }
        CnNativeBride.sc_reduce32 = sc_reduce32;
        function derive_secret_key(derivation, out_index, sec) {
            if (derivation.length !== 64 || sec.length !== 64) {
                throw "Invalid input length!";
            }
            var scalar_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            var scalar_b = CnUtils.hextobin(CnUtils.derivation_to_scalar(derivation, out_index));
            Module.HEAPU8.set(scalar_b, scalar_m);
            var base_m = Module._malloc(KEY_SIZE);
            Module.HEAPU8.set(CnUtils.hextobin(sec), base_m);
            var derived_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            Module.ccall("sc_add", "void", ["number", "number", "number"], [derived_m, base_m, scalar_m]);
            var res = Module.HEAPU8.subarray(derived_m, derived_m + STRUCT_SIZES.EC_SCALAR);
            Module._free(scalar_m);
            Module._free(base_m);
            Module._free(derived_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.derive_secret_key = derive_secret_key;
        function hash_to_ec(key) {
            if (key.length !== (KEY_SIZE * 2)) {
                throw "Invalid input length";
            }
            var h_m = Module._malloc(HASH_SIZE);
            var point_m = Module._malloc(STRUCT_SIZES.GE_P2);
            var point2_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
            var res_m = Module._malloc(STRUCT_SIZES.GE_P3);
            var hash = CnUtils.hextobin(CnUtils.cn_fast_hash(key));
            Module.HEAPU8.set(hash, h_m);
            Module.ccall("ge_fromfe_frombytes_vartime", "void", ["number", "number"], [point_m, h_m]);
            Module.ccall("ge_mul8", "void", ["number", "number"], [point2_m, point_m]);
            Module.ccall("ge_p1p1_to_p3", "void", ["number", "number"], [res_m, point2_m]);
            var res = Module.HEAPU8.subarray(res_m, res_m + STRUCT_SIZES.GE_P3);
            Module._free(h_m);
            Module._free(point_m);
            Module._free(point2_m);
            Module._free(res_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.hash_to_ec = hash_to_ec;
        //returns a 32 byte point via "ge_p3_tobytes" rather than a 160 byte "p3", otherwise same as above;
        function hash_to_ec_2(key) {
            if (key.length !== (KEY_SIZE * 2)) {
                throw "Invalid input length";
            }
            var h_m = Module._malloc(HASH_SIZE);
            var point_m = Module._malloc(STRUCT_SIZES.GE_P2);
            var point2_m = Module._malloc(STRUCT_SIZES.GE_P1P1);
            var res_m = Module._malloc(STRUCT_SIZES.GE_P3);
            var hash = CnUtils.hextobin(CnUtils.cn_fast_hash(key));
            var res2_m = Module._malloc(KEY_SIZE);
            Module.HEAPU8.set(hash, h_m);
            Module.ccall("ge_fromfe_frombytes_vartime", "void", ["number", "number"], [point_m, h_m]);
            Module.ccall("ge_mul8", "void", ["number", "number"], [point2_m, point_m]);
            Module.ccall("ge_p1p1_to_p3", "void", ["number", "number"], [res_m, point2_m]);
            Module.ccall("ge_p3_tobytes", "void", ["number", "number"], [res2_m, res_m]);
            var res = Module.HEAPU8.subarray(res2_m, res2_m + KEY_SIZE);
            Module._free(h_m);
            Module._free(point_m);
            Module._free(point2_m);
            Module._free(res_m);
            Module._free(res2_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.hash_to_ec_2 = hash_to_ec_2;
        function generate_key_image_2(pub, sec) {
            if (!pub || !sec || pub.length !== 64 || sec.length !== 64) {
                throw "Invalid input length";
            }
            var pub_m = Module._malloc(KEY_SIZE);
            var sec_m = Module._malloc(KEY_SIZE);
            Module.HEAPU8.set(CnUtils.hextobin(pub), pub_m);
            Module.HEAPU8.set(CnUtils.hextobin(sec), sec_m);
            if (Module.ccall("sc_check", "number", ["number"], [sec_m]) !== 0) {
                throw "sc_check(sec) != 0";
            }
            var point_m = Module._malloc(STRUCT_SIZES.GE_P3);
            var point2_m = Module._malloc(STRUCT_SIZES.GE_P2);
            var point_b = CnUtils.hextobin(CnNativeBride.hash_to_ec(pub));
            Module.HEAPU8.set(point_b, point_m);
            var image_m = Module._malloc(STRUCT_SIZES.KEY_IMAGE);
            Module.ccall("ge_scalarmult", "void", ["number", "number", "number"], [point2_m, sec_m, point_m]);
            Module.ccall("ge_tobytes", "void", ["number", "number"], [image_m, point2_m]);
            var res = Module.HEAPU8.subarray(image_m, image_m + STRUCT_SIZES.KEY_IMAGE);
            Module._free(pub_m);
            Module._free(sec_m);
            Module._free(point_m);
            Module._free(point2_m);
            Module._free(image_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.generate_key_image_2 = generate_key_image_2;
        //adds two scalars together
        function sc_add(scalar1, scalar2) {
            if (scalar1.length !== 64 || scalar2.length !== 64) {
                throw "Invalid input length!";
            }
            var scalar1_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            var scalar2_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            Module.HEAPU8.set(CnUtils.hextobin(scalar1), scalar1_m);
            Module.HEAPU8.set(CnUtils.hextobin(scalar2), scalar2_m);
            var derived_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            Module.ccall("sc_add", "void", ["number", "number", "number"], [derived_m, scalar1_m, scalar2_m]);
            var res = Module.HEAPU8.subarray(derived_m, derived_m + STRUCT_SIZES.EC_SCALAR);
            Module._free(scalar1_m);
            Module._free(scalar2_m);
            Module._free(derived_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.sc_add = sc_add;
        //subtracts one scalar from another
        function sc_sub(scalar1, scalar2) {
            if (scalar1.length !== 64 || scalar2.length !== 64) {
                throw "Invalid input length!";
            }
            var scalar1_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            var scalar2_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            Module.HEAPU8.set(CnUtils.hextobin(scalar1), scalar1_m);
            Module.HEAPU8.set(CnUtils.hextobin(scalar2), scalar2_m);
            var derived_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            Module.ccall("sc_sub", "void", ["number", "number", "number"], [derived_m, scalar1_m, scalar2_m]);
            var res = Module.HEAPU8.subarray(derived_m, derived_m + STRUCT_SIZES.EC_SCALAR);
            Module._free(scalar1_m);
            Module._free(scalar2_m);
            Module._free(derived_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.sc_sub = sc_sub;
        //res = c - (ab) mod l; argument names copied from the signature implementation
        function sc_mulsub(sigc, sec, k) {
            if (k.length !== KEY_SIZE * 2 || sigc.length !== KEY_SIZE * 2 || sec.length !== KEY_SIZE * 2 || !CnUtils.valid_hex(k) || !CnUtils.valid_hex(sigc) || !CnUtils.valid_hex(sec)) {
                throw "bad scalar";
            }
            var sec_m = Module._malloc(KEY_SIZE);
            Module.HEAPU8.set(CnUtils.hextobin(sec), sec_m);
            var sigc_m = Module._malloc(KEY_SIZE);
            Module.HEAPU8.set(CnUtils.hextobin(sigc), sigc_m);
            var k_m = Module._malloc(KEY_SIZE);
            Module.HEAPU8.set(CnUtils.hextobin(k), k_m);
            var res_m = Module._malloc(KEY_SIZE);
            Module.ccall("sc_mulsub", "void", ["number", "number", "number", "number"], [res_m, sigc_m, sec_m, k_m]);
            var res = Module.HEAPU8.subarray(res_m, res_m + KEY_SIZE);
            Module._free(k_m);
            Module._free(sec_m);
            Module._free(sigc_m);
            Module._free(res_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.sc_mulsub = sc_mulsub;
        function generate_ring_signature(prefix_hash, k_image, keys, sec, real_index) {
            if (k_image.length !== STRUCT_SIZES.KEY_IMAGE * 2) {
                throw "invalid key image length";
            }
            if (sec.length !== KEY_SIZE * 2) {
                throw "Invalid secret key length";
            }
            if (prefix_hash.length !== HASH_SIZE * 2 || !CnUtils.valid_hex(prefix_hash)) {
                throw "Invalid prefix hash";
            }
            if (real_index >= keys.length || real_index < 0) {
                throw "real_index is invalid";
            }
            var _ge_tobytes = Module.cwrap("ge_tobytes", "void", ["number", "number"]);
            var _ge_p3_tobytes = Module.cwrap("ge_p3_tobytes", "void", ["number", "number"]);
            var _ge_scalarmult_base = Module.cwrap("ge_scalarmult_base", "void", ["number", "number"]);
            var _ge_scalarmult = Module.cwrap("ge_scalarmult", "void", ["number", "number", "number"]);
            var _sc_add = Module.cwrap("sc_add", "void", ["number", "number", "number"]);
            var _sc_sub = Module.cwrap("sc_sub", "void", ["number", "number", "number"]);
            var _sc_mulsub = Module.cwrap("sc_mulsub", "void", ["number", "number", "number", "number"]);
            var _sc_0 = Module.cwrap("sc_0", "void", ["number"]);
            var _ge_double_scalarmult_base_vartime = Module.cwrap("ge_double_scalarmult_base_vartime", "void", ["number", "number", "number", "number"]);
            var _ge_double_scalarmult_precomp_vartime = Module.cwrap("ge_double_scalarmult_precomp_vartime", "void", ["number", "number", "number", "number", "number"]);
            var _ge_frombytes_vartime = Module.cwrap("ge_frombytes_vartime", "number", ["number", "number"]);
            var _ge_dsm_precomp = Module.cwrap("ge_dsm_precomp", "void", ["number", "number"]);
            var buf_size = STRUCT_SIZES.EC_POINT * 2 * keys.length;
            var buf_m = Module._malloc(buf_size);
            var sig_size = STRUCT_SIZES.SIGNATURE * keys.length;
            var sig_m = Module._malloc(sig_size);
            // Struct pointer helper functions
            function buf_a(i) {
                return buf_m + STRUCT_SIZES.EC_POINT * (2 * i);
            }
            function buf_b(i) {
                return buf_m + STRUCT_SIZES.EC_POINT * (2 * i + 1);
            }
            function sig_c(i) {
                return sig_m + STRUCT_SIZES.EC_SCALAR * (2 * i);
            }
            function sig_r(i) {
                return sig_m + STRUCT_SIZES.EC_SCALAR * (2 * i + 1);
            }
            var image_m = Module._malloc(STRUCT_SIZES.KEY_IMAGE);
            Module.HEAPU8.set(CnUtils.hextobin(k_image), image_m);
            var i;
            var image_unp_m = Module._malloc(STRUCT_SIZES.GE_P3);
            var image_pre_m = Module._malloc(STRUCT_SIZES.GE_DSMP);
            var sum_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            var k_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            var h_m = Module._malloc(STRUCT_SIZES.EC_SCALAR);
            var tmp2_m = Module._malloc(STRUCT_SIZES.GE_P2);
            var tmp3_m = Module._malloc(STRUCT_SIZES.GE_P3);
            var pub_m = Module._malloc(KEY_SIZE);
            var sec_m = Module._malloc(KEY_SIZE);
            Module.HEAPU8.set(CnUtils.hextobin(sec), sec_m);
            if (_ge_frombytes_vartime(image_unp_m, image_m) != 0) {
                throw "failed to call ge_frombytes_vartime";
            }
            _ge_dsm_precomp(image_pre_m, image_unp_m);
            _sc_0(sum_m);
            for (i = 0; i < keys.length; i++) {
                if (i === real_index) {
                    // Real key
                    var rand = CnRandom.random_scalar();
                    Module.HEAPU8.set(CnUtils.hextobin(rand), k_m);
                    _ge_scalarmult_base(tmp3_m, k_m);
                    _ge_p3_tobytes(buf_a(i), tmp3_m);
                    var ec = CnNativeBride.hash_to_ec(keys[i]);
                    Module.HEAPU8.set(CnUtils.hextobin(ec), tmp3_m);
                    _ge_scalarmult(tmp2_m, k_m, tmp3_m);
                    _ge_tobytes(buf_b(i), tmp2_m);
                }
                else {
                    Module.HEAPU8.set(CnUtils.hextobin(CnRandom.random_scalar()), sig_c(i));
                    Module.HEAPU8.set(CnUtils.hextobin(CnRandom.random_scalar()), sig_r(i));
                    Module.HEAPU8.set(CnUtils.hextobin(keys[i]), pub_m);
                    if (Module.ccall("ge_frombytes_vartime", "void", ["number", "number"], [tmp3_m, pub_m]) !== 0) {
                        throw "Failed to call ge_frombytes_vartime";
                    }
                    _ge_double_scalarmult_base_vartime(tmp2_m, sig_c(i), tmp3_m, sig_r(i));
                    _ge_tobytes(buf_a(i), tmp2_m);
                    var ec = CnNativeBride.hash_to_ec(keys[i]);
                    Module.HEAPU8.set(CnUtils.hextobin(ec), tmp3_m);
                    _ge_double_scalarmult_precomp_vartime(tmp2_m, sig_r(i), tmp3_m, sig_c(i), image_pre_m);
                    _ge_tobytes(buf_b(i), tmp2_m);
                    _sc_add(sum_m, sum_m, sig_c(i));
                }
            }
            var buf_bin = Module.HEAPU8.subarray(buf_m, buf_m + buf_size);
            var scalar = Cn.hash_to_scalar(prefix_hash + CnUtils.bintohex(buf_bin));
            Module.HEAPU8.set(CnUtils.hextobin(scalar), h_m);
            _sc_sub(sig_c(real_index), h_m, sum_m);
            _sc_mulsub(sig_r(real_index), sig_c(real_index), sec_m, k_m);
            var sig_data = CnUtils.bintohex(Module.HEAPU8.subarray(sig_m, sig_m + sig_size));
            var sigs = [];
            for (var k = 0; k < keys.length; k++) {
                sigs.push(sig_data.slice(STRUCT_SIZES.SIGNATURE * 2 * k, STRUCT_SIZES.SIGNATURE * 2 * (k + 1)));
            }
            Module._free(image_m);
            Module._free(image_unp_m);
            Module._free(image_pre_m);
            Module._free(sum_m);
            Module._free(k_m);
            Module._free(h_m);
            Module._free(tmp2_m);
            Module._free(tmp3_m);
            Module._free(buf_m);
            Module._free(sig_m);
            Module._free(pub_m);
            Module._free(sec_m);
            return sigs;
        }
        CnNativeBride.generate_ring_signature = generate_ring_signature;
        function generate_key_derivation(pub, sec) {
            var generate_key_derivation_bind = self.Module_native.cwrap('generate_key_derivation', null, ['number', 'number', 'number']);
            var pub_b = CnUtils.hextobin(pub);
            var sec_b = CnUtils.hextobin(sec);
            var Module_native = self.Module_native;
            var pub_m = Module_native._malloc(KEY_SIZE);
            Module_native.HEAPU8.set(pub_b, pub_m);
            var sec_m = Module_native._malloc(KEY_SIZE);
            Module_native.HEAPU8.set(sec_b, sec_m);
            var derivation_m = Module_native._malloc(KEY_SIZE);
            var r = generate_key_derivation_bind(pub_m, sec_m, derivation_m);
            Module_native._free(pub_m);
            Module_native._free(sec_m);
            var res = Module_native.HEAPU8.subarray(derivation_m, derivation_m + KEY_SIZE);
            Module_native._free(derivation_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.generate_key_derivation = generate_key_derivation;
        function derive_public_key(derivation, output_idx_in_tx, pubSpend) {
            var derive_public_key_bind = self.Module_native.cwrap('derive_public_key', null, ['number', 'number', 'number', 'number']);
            var derivation_b = CnUtils.hextobin(derivation);
            var pub_spend_b = CnUtils.hextobin(pubSpend);
            var Module_native = self.Module_native;
            var derivation_m = Module_native._malloc(KEY_SIZE);
            Module_native.HEAPU8.set(derivation_b, derivation_m);
            var pub_spend_m = Module_native._malloc(KEY_SIZE);
            Module_native.HEAPU8.set(pub_spend_b, pub_spend_m);
            var derived_key_m = Module_native._malloc(KEY_SIZE);
            var r = derive_public_key_bind(derivation_m, output_idx_in_tx, pub_spend_m, derived_key_m);
            Module_native._free(derivation_m);
            Module_native._free(pub_spend_m);
            var res = Module_native.HEAPU8.subarray(derived_key_m, derived_key_m + KEY_SIZE);
            Module_native._free(derived_key_m);
            return CnUtils.bintohex(res);
        }
        CnNativeBride.derive_public_key = derive_public_key;
    })(CnNativeBride = exports.CnNativeBride || (exports.CnNativeBride = {}));
    var Cn;
    (function (Cn) {
        function hash_to_scalar(buf) {
            var hash = CnUtils.cn_fast_hash(buf);
            var scalar = CnNativeBride.sc_reduce32(hash);
            return scalar;
        }
        Cn.hash_to_scalar = hash_to_scalar;
        function array_hash_to_scalar(array) {
            var buf = "";
            for (var i = 0; i < array.length; i++) {
                if (typeof array[i] !== "string") {
                    throw "unexpected array element";
                }
                buf += array[i];
            }
            return hash_to_scalar(buf);
        }
        Cn.array_hash_to_scalar = array_hash_to_scalar;
        /**
         * @deprecated CnNativeBride has a much faster version
         * @param pub
         * @param sec
         */
        function generate_key_derivation(pub, sec) {
            if (pub.length !== 64 || sec.length !== 64) {
                throw "Invalid input length";
            }
            var P = CnUtils.ge_scalarmult(pub, sec);
            return CnUtils.ge_scalarmult(P, CnUtils.d2s(8)); //mul8 to ensure group
        }
        Cn.generate_key_derivation = generate_key_derivation;
        /**
         * @deprecated CnNativeBride has a much faster version
         * @param derivation
         * @param out_index
         * @param pub
         */
        function derive_public_key(derivation, out_index, pub) {
            if (derivation.length !== 64 || pub.length !== 64) {
                throw "Invalid input length!";
            }
            var s = CnUtils.derivation_to_scalar(derivation, out_index);
            return CnUtils.bintohex(nacl.ll.ge_add(CnUtils.hextobin(pub), CnUtils.hextobin(CnUtils.ge_scalarmult_base(s))));
        }
        Cn.derive_public_key = derive_public_key;
        function generate_keys(seed) {
            if (seed.length !== 64)
                throw "Invalid input length!";
            var sec = CnNativeBride.sc_reduce32(seed);
            var pub = CnUtils.sec_key_to_pub(sec);
            return {
                sec: sec,
                pub: pub
            };
        }
        Cn.generate_keys = generate_keys;
        function random_keypair() {
            return Cn.generate_keys(CnRandom.rand_32());
        }
        Cn.random_keypair = random_keypair;
        function pubkeys_to_string(spend, view) {
            var prefix = CnUtils.encode_varint(CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX);
            var data = prefix + spend + view;
            var checksum = CnUtils.cn_fast_hash(data);
            return cnBase58.encode(data + checksum.slice(0, ADDRESS_CHECKSUM_SIZE * 2));
        }
        Cn.pubkeys_to_string = pubkeys_to_string;
        function create_address(seed) {
            var keys = {
                spend: {
                    sec: '',
                    pub: ''
                },
                view: {
                    sec: '',
                    pub: ''
                },
                public_addr: ''
            };
            var first;
            if (seed.length !== 64) {
                first = CnUtils.cn_fast_hash(seed);
            }
            else {
                first = seed; //only input reduced seeds or this will not give you the result you want
            }
            keys.spend = Cn.generate_keys(first);
            var second = seed.length !== 64 ? CnUtils.cn_fast_hash(first) : CnUtils.cn_fast_hash(keys.spend.sec);
            keys.view = Cn.generate_keys(second);
            keys.public_addr = Cn.pubkeys_to_string(keys.spend.pub, keys.view.pub);
            return keys;
        }
        Cn.create_address = create_address;
        function decode_address(address) {
            var dec = cnBase58.decode(address);
            console.log(dec, CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX, CRYPTONOTE_PUBLIC_INTEGRATED_ADDRESS_BASE58_PREFIX);
            var expectedPrefix = CnUtils.encode_varint(CRYPTONOTE_PUBLIC_ADDRESS_BASE58_PREFIX);
            var expectedPrefixInt = CnUtils.encode_varint(CRYPTONOTE_PUBLIC_INTEGRATED_ADDRESS_BASE58_PREFIX);
            var expectedPrefixSub = CnUtils.encode_varint(CRYPTONOTE_PUBLIC_SUBADDRESS_BASE58_PREFIX);
            var prefix = dec.slice(0, expectedPrefix.length);
            console.log(prefix, expectedPrefixInt, expectedPrefix);
            if (prefix !== expectedPrefix && prefix !== expectedPrefixInt && prefix !== expectedPrefixSub) {
                throw "Invalid address prefix";
            }
            dec = dec.slice(expectedPrefix.length);
            var spend = dec.slice(0, 64);
            var view = dec.slice(64, 128);
            var checksum = null;
            var expectedChecksum = null;
            var intPaymentId = null;
            if (prefix === expectedPrefixInt) {
                intPaymentId = dec.slice(128, 128 + (INTEGRATED_ID_SIZE * 2));
                checksum = dec.slice(128 + (INTEGRATED_ID_SIZE * 2), 128 + (INTEGRATED_ID_SIZE * 2) + (ADDRESS_CHECKSUM_SIZE * 2));
                expectedChecksum = CnUtils.cn_fast_hash(prefix + spend + view + intPaymentId).slice(0, ADDRESS_CHECKSUM_SIZE * 2);
            }
            else {
                checksum = dec.slice(128, 128 + (ADDRESS_CHECKSUM_SIZE * 2));
                expectedChecksum = CnUtils.cn_fast_hash(prefix + spend + view).slice(0, ADDRESS_CHECKSUM_SIZE * 2);
            }
            if (checksum !== expectedChecksum) {
                throw "Invalid checksum";
            }
            return {
                spend: spend,
                view: view,
                intPaymentId: intPaymentId
            };
        }
        Cn.decode_address = decode_address;
        function is_subaddress(addr) {
            var decoded = cnBase58.decode(addr);
            var subaddressPrefix = CnUtils.encode_varint(CRYPTONOTE_PUBLIC_SUBADDRESS_BASE58_PREFIX);
            var prefix = decoded.slice(0, subaddressPrefix.length);
            return (prefix === subaddressPrefix);
        }
        Cn.is_subaddress = is_subaddress;
        function valid_keys(view_pub, view_sec, spend_pub, spend_sec) {
            var expected_view_pub = CnUtils.sec_key_to_pub(view_sec);
            var expected_spend_pub = CnUtils.sec_key_to_pub(spend_sec);
            return (expected_spend_pub === spend_pub) && (expected_view_pub === view_pub);
        }
        Cn.valid_keys = valid_keys;
        function decrypt_payment_id(payment_id8, tx_public_key, acc_prv_view_key) {
            if (payment_id8.length !== 16)
                throw "Invalid input length2!";
            var key_derivation = Cn.generate_key_derivation(tx_public_key, acc_prv_view_key);
            var pid_key = CnUtils.cn_fast_hash(key_derivation + ENCRYPTED_PAYMENT_ID_TAIL.toString(16)).slice(0, INTEGRATED_ID_SIZE * 2);
            var decrypted_payment_id = CnUtils.hex_xor(payment_id8, pid_key);
            return decrypted_payment_id;
        }
        Cn.decrypt_payment_id = decrypt_payment_id;
        function get_account_integrated_address(address, payment_id8) {
            var decoded_address = decode_address(address);
            var prefix = CnUtils.encode_varint(CRYPTONOTE_PUBLIC_INTEGRATED_ADDRESS_BASE58_PREFIX);
            var data = prefix + decoded_address.spend + decoded_address.view + payment_id8;
            var checksum = CnUtils.cn_fast_hash(data);
            return cnBase58.encode(data + checksum.slice(0, ADDRESS_CHECKSUM_SIZE * 2));
        }
        Cn.get_account_integrated_address = get_account_integrated_address;
        function formatMoneyFull(units) {
            var unitsStr = (units).toString();
            var symbol = unitsStr[0] === '-' ? '-' : '';
            if (symbol === '-') {
                unitsStr = unitsStr.slice(1);
            }
            var decimal;
            if (unitsStr.length >= config.coinUnitPlaces) {
                decimal = unitsStr.substr(unitsStr.length - config.coinUnitPlaces, config.coinUnitPlaces);
            }
            else {
                decimal = CnUtils.padLeft(unitsStr, config.coinUnitPlaces, '0');
            }
            return symbol + (unitsStr.substr(0, unitsStr.length - config.coinUnitPlaces) || '0') + '.' + decimal;
        }
        Cn.formatMoneyFull = formatMoneyFull;
        function formatMoneyFullSymbol(units) {
            return Cn.formatMoneyFull(units) + ' ' + config.coinSymbol;
        }
        Cn.formatMoneyFullSymbol = formatMoneyFullSymbol;
        function formatMoney(units) {
            var f = CnUtils.trimRight(Cn.formatMoneyFull(units), '0');
            if (f[f.length - 1] === '.') {
                return f.slice(0, f.length - 1);
            }
            return f;
        }
        Cn.formatMoney = formatMoney;
        function formatMoneySymbol(units) {
            return Cn.formatMoney(units) + ' ' + config.coinSymbol;
        }
        Cn.formatMoneySymbol = formatMoneySymbol;
    })(Cn = exports.Cn || (exports.Cn = {}));
    var CnTransactions;
    (function (CnTransactions) {
        function commit(amount, mask) {
            if (!CnUtils.valid_hex(mask) || mask.length !== 64 || !CnUtils.valid_hex(amount) || amount.length !== 64) {
                throw "invalid amount or mask!";
            }
            var C = CnUtils.ge_double_scalarmult_base_vartime(amount, CnVars.H, mask);
            return C;
        }
        CnTransactions.commit = commit;
        function zeroCommit(amount) {
            if (!CnUtils.valid_hex(amount) || amount.length !== 64) {
                throw "invalid amount!";
            }
            var C = CnUtils.ge_double_scalarmult_base_vartime(amount, CnVars.H, CnVars.I);
            return C;
        }
        CnTransactions.zeroCommit = zeroCommit;
        function decodeRctSimple(rv, sk, i, mask, hwdev) {
            // CHECK_AND_ASSERT_MES(rv.type == RCTTypeSimple || rv.type == RCTTypeSimpleBulletproof, false, "decodeRct called on non simple rctSig");
            // CHECK_AND_ASSERT_THROW_MES(i < rv.ecdhInfo.size(), "Bad index");
            // CHECK_AND_ASSERT_THROW_MES(rv.outPk.size() == rv.ecdhInfo.size(), "Mismatched sizes of rv.outPk and rv.ecdhInfo");
            // console.log(i < rv.ecdhInfo.length ? undefined : 'Bad index');
            // console.log(rv.outPk.length == rv.ecdhInfo.length ? undefined : 'Mismatched sizes of rv.outPk and rv.ecdhInfo');
            if (hwdev === void 0) { hwdev = null; }
            //mask amount and mask
            // console.log('decode',rv.ecdhInfo[i], sk, h2d(rv.ecdhInfo[i].amount));
            var ecdh_info = CnUtils.decode_rct_ecdh(rv.ecdhInfo[i], sk);
            // console.log('ecdh_info',ecdh_info);
            // mask = ecdh_info.mask;
            var amount = ecdh_info.amount;
            var C = rv.outPk[i].mask;
            // console.log('amount', amount);
            // console.log('C', C);
            // DP("C");
            // DP(C);
            // key Ctmp;
            // addKeys2(Ctmp, mask, amount, H);
            // DP("Ctmp");
            // DP(Ctmp);
            // if (equalKeys(C, Ctmp) == false) {
            // 	CHECK_AND_ASSERT_THROW_MES(false, "warning, amount decoded incorrectly, will be unable to spend");
            // }
            return CnUtils.h2d(amount);
        }
        CnTransactions.decodeRctSimple = decodeRctSimple;
        function decode_ringct(rv, pub, sec, i, mask, amount, derivation) {
            if (derivation === null)
                derivation = CnNativeBride.generate_key_derivation(pub, sec); //[10;11]ms
            var scalar1 = CnUtils.derivation_to_scalar(derivation, i); //[0.2ms;1ms]
            try {
                // console.log(rv.type,'RCTTypeSimple='+RCTTypeSimple,'RCTTypeFull='+RCTTypeFull);
                switch (rv.type) {
                    case CnVars.RCT_TYPE.Simple:
                        amount = CnTransactions.decodeRctSimple(rv, scalar1, i, mask); //[5;10]ms
                        break;
                    case CnVars.RCT_TYPE.Full:
                        amount = CnTransactions.decodeRctSimple(rv, scalar1, i, mask);
                        break;
                    case CnVars.RCT_TYPE.SimpleBulletproof:
                        amount = CnTransactions.decodeRctSimple(rv, scalar1, i, mask);
                        break;
                    case CnVars.RCT_TYPE.FullBulletproof:
                        amount = CnTransactions.decodeRctSimple(rv, scalar1, i, mask);
                        break;
                    default:
                        console.log('Unsupported rc type', rv.type);
                        // cerr << "Unsupported rct type: " << rv.type << endl;
                        return false;
                }
            }
            catch (e) {
                console.error(e);
                console.log("Failed to decode input " + i);
                return false;
            }
            return amount;
        }
        CnTransactions.decode_ringct = decode_ringct;
        function generate_key_image_helper(ack, tx_public_key, real_output_index, recv_derivation) {
            if (recv_derivation === null)
                recv_derivation = CnNativeBride.generate_key_derivation(tx_public_key, ack.view_secret_key);
            // recv_derivation = CnUtilNative.generate_key_derivation(tx_public_key, ack.view_secret_key);
            // console.log('recv_derivation', recv_derivation);
            // CHECK_AND_ASSERT_MES(r, false, "key image helper: failed to generate_key_derivation(" << tx_public_key << ", " << ack.m_view_secret_key << ")");
            //
            // let start = Date.now();
            var in_ephemeral_pub = CnNativeBride.derive_public_key(recv_derivation, real_output_index, ack.public_spend_key);
            // let in_ephemeral_pub = CnUtilNative.derive_public_key(recv_derivation, real_output_index, ack.public_spend_key);
            // console.log('in_ephemeral_pub',in_ephemeral_pub);
            // CHECK_AND_ASSERT_MES(r, false, "key image helper: failed to derive_public_key(" << recv_derivation << ", " << real_output_index <<  ", " << ack.m_account_address.m_spend_public_key << ")");
            //
            var in_ephemeral_sec = CnNativeBride.derive_secret_key(recv_derivation, real_output_index, ack.spend_secret_key);
            // let in_ephemeral_sec = CnNativeBride.derive_secret_key(recv_derivation, real_output_index, ack.spend_secret_key);
            // console.log('in_ephemeral_sec',in_ephemeral_sec);
            // let ki = CnNativeBride.generate_key_image_2(in_ephemeral_pub, in_ephemeral_sec);
            var ki = CnNativeBride.generate_key_image_2(in_ephemeral_pub, in_ephemeral_sec);
            // let end = Date.now();
            // console.log(end-start);
            return {
                ephemeral_pub: in_ephemeral_pub,
                ephemeral_sec: in_ephemeral_sec,
                key_image: ki
            };
        }
        CnTransactions.generate_key_image_helper = generate_key_image_helper;
        //TODO duplicate above
        function generate_key_image_helper_rct(keys, tx_pub_key, out_index, enc_mask) {
            var recv_derivation = CnNativeBride.generate_key_derivation(tx_pub_key, keys.view.sec);
            if (!recv_derivation)
                throw "Failed to generate key image";
            var mask;
            if (enc_mask === CnVars.I) {
                // this is for ringct coinbase txs (rct type 0). they are ringct tx that have identity mask
                mask = enc_mask; // enc_mask is idenity mask returned by backend.
            }
            else {
                // for other ringct types or for non-ringct txs to this.
                var temp0 = CnUtils.derivation_to_scalar(recv_derivation, out_index);
                var temp1 = Cn.hash_to_scalar(temp0);
                mask = enc_mask ? CnNativeBride.sc_sub(enc_mask, temp1) : CnVars.I; //decode mask, or d2s(1) if no mask
            }
            var ephemeral_pub = CnNativeBride.derive_public_key(recv_derivation, out_index, keys.spend.pub);
            if (!ephemeral_pub)
                throw "Failed to generate key image";
            var ephemeral_sec = CnNativeBride.derive_secret_key(recv_derivation, out_index, keys.spend.sec);
            var image = CnNativeBride.generate_key_image_2(ephemeral_pub, ephemeral_sec);
            return {
                in_ephemeral: {
                    pub: ephemeral_pub,
                    sec: ephemeral_sec,
                    mask: mask
                },
                image: image
            };
        }
        CnTransactions.generate_key_image_helper_rct = generate_key_image_helper_rct;
        function estimateRctSize(inputs, mixin, outputs) {
            var size = 0;
            size += outputs * 6306;
            size += ((mixin + 1) * 4 + 32 + 8) * inputs; //key offsets + key image + amount
            size += 64 * (mixin + 1) * inputs + 64 * inputs; //signature + pseudoOuts/cc
            size += 74; //extra + whatever, assume long payment ID
            return size;
        }
        CnTransactions.estimateRctSize = estimateRctSize;
        function decompose_tx_destinations(dsts, rct) {
            var out = [];
            if (rct) {
                for (var i = 0; i < dsts.length; i++) {
                    out.push({
                        address: dsts[i].address,
                        amount: dsts[i].amount
                    });
                }
            }
            else {
                for (var i = 0; i < dsts.length; i++) {
                    var digits = CnUtils.decompose_amount_into_digits(dsts[i].amount);
                    for (var j = 0; j < digits.length; j++) {
                        if (digits[j].compare(0) > 0) {
                            out.push({
                                address: dsts[i].address,
                                amount: digits[j]
                            });
                        }
                    }
                }
            }
            return out.sort(function (a, b) {
                return a["amount"] - b["amount"];
            });
        }
        CnTransactions.decompose_tx_destinations = decompose_tx_destinations;
        function get_payment_id_nonce(payment_id, pid_encrypt) {
            if (payment_id.length !== 64 && payment_id.length !== 16) {
                throw "Invalid payment id";
            }
            var res = '';
            if (pid_encrypt) {
                res += TX_EXTRA_NONCE_TAGS.ENCRYPTED_PAYMENT_ID;
            }
            else {
                res += TX_EXTRA_NONCE_TAGS.PAYMENT_ID;
            }
            res += payment_id;
            return res;
        }
        CnTransactions.get_payment_id_nonce = get_payment_id_nonce;
        function abs_to_rel_offsets(offsets) {
            if (offsets.length === 0)
                return offsets;
            for (var i = offsets.length - 1; i >= 1; --i) {
                offsets[i] = new JSBigInt(offsets[i]).subtract(offsets[i - 1]).toString();
            }
            return offsets;
        }
        CnTransactions.abs_to_rel_offsets = abs_to_rel_offsets;
        //TODO merge
        function add_pub_key_to_extra(extra, pubkey) {
            if (pubkey.length !== 64)
                throw "Invalid pubkey length";
            // Append pubkey tag and pubkey
            extra += TX_EXTRA_TAGS.PUBKEY + pubkey;
            return extra;
        }
        CnTransactions.add_pub_key_to_extra = add_pub_key_to_extra;
        //TODO merge
        function add_additionnal_pub_keys_to_extra(extra, keys) {
            //do not add if there is no additional keys
            console.log('Add additionnal keys to extra', keys);
            if (keys.length === 0)
                return extra;
            extra += TX_EXTRA_TAGS.ADDITIONAL_PUBKEY;
            // Encode count of keys
            extra += ('0' + (keys.length).toString(16)).slice(-2);
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (key.length !== 64)
                    throw "Invalid pubkey length";
                extra += key;
            }
            return extra;
        }
        CnTransactions.add_additionnal_pub_keys_to_extra = add_additionnal_pub_keys_to_extra;
        //TODO merge
        function add_nonce_to_extra(extra, nonce) {
            // Append extra nonce
            if ((nonce.length % 2) !== 0) {
                throw "Invalid extra nonce";
            }
            if ((nonce.length / 2) > TX_EXTRA_NONCE_MAX_COUNT) {
                throw "Extra nonce must be at most " + TX_EXTRA_NONCE_MAX_COUNT + " bytes";
            }
            // Add nonce tag
            extra += TX_EXTRA_TAGS.NONCE;
            // Encode length of nonce
            extra += ('0' + (nonce.length / 2).toString(16)).slice(-2);
            // Write nonce
            extra += nonce;
            return extra;
        }
        CnTransactions.add_nonce_to_extra = add_nonce_to_extra;
        function serialize_tx(tx, headeronly) {
            if (headeronly === void 0) { headeronly = false; }
            //tx: {
            //  version: uint64,
            //  unlock_time: uint64,
            //  extra: hex,
            //  vin: [{amount: uint64, k_image: hex, key_offsets: [uint64,..]},...],
            //  vout: [{amount: uint64, target: {key: hex}},...],
            //  signatures: [[s,s,...],...]
            //}
            console.log('serialize tx ', JSON.parse(JSON.stringify(tx)));
            var buf = "";
            buf += CnUtils.encode_varint(tx.version);
            buf += CnUtils.encode_varint(tx.unlock_time);
            buf += CnUtils.encode_varint(tx.vin.length);
            var i, j;
            for (i = 0; i < tx.vin.length; i++) {
                var vin = tx.vin[i];
                console.log('start vin', vin);
                switch (vin.type) {
                    case "input_to_key":
                        buf += "02";
                        buf += CnUtils.encode_varint(vin.amount);
                        buf += CnUtils.encode_varint(vin.key_offsets.length);
                        console.log(vin.key_offsets, vin.key_offsets.length);
                        for (j = 0; j < vin.key_offsets.length; j++) {
                            console.log(j, vin.key_offsets[j]);
                            buf += CnUtils.encode_varint(vin.key_offsets[j]);
                        }
                        buf += vin.k_image;
                        break;
                    default:
                        throw "Unhandled vin type: " + vin.type;
                }
                console.log('end vin', vin);
            }
            console.log('serialize tx ', tx);
            buf += CnUtils.encode_varint(tx.vout.length);
            for (i = 0; i < tx.vout.length; i++) {
                var vout = tx.vout[i];
                buf += CnUtils.encode_varint(vout.amount);
                switch (vout.target.type) {
                    case "txout_to_key":
                        buf += "02";
                        buf += vout.target.data.key;
                        break;
                    default:
                        throw "Unhandled txout target type: " + vout.target.type;
                }
            }
            console.log('serialize tx ', tx);
            if (!CnUtils.valid_hex(tx.extra)) {
                throw "Tx extra has invalid hex";
            }
            console.log('serialize tx ', tx);
            buf += CnUtils.encode_varint(tx.extra.length / 2);
            buf += tx.extra;
            if (!headeronly) {
                if (tx.vin.length !== tx.signatures.length) {
                    throw "Signatures length != vin length";
                }
                for (i = 0; i < tx.vin.length; i++) {
                    for (j = 0; j < tx.signatures[i].length; j++) {
                        buf += tx.signatures[i][j];
                    }
                }
            }
            console.log('serialize tx ', buf);
            return buf;
        }
        CnTransactions.serialize_tx = serialize_tx;
        function serialize_tx_with_hash(tx) {
            var hashes = "";
            var buf = "";
            buf += CnTransactions.serialize_tx(tx, false);
            hashes += CnUtils.cn_fast_hash(buf);
            return {
                raw: buf,
                hash: hashes,
                prvkey: tx.prvkey
            };
        }
        CnTransactions.serialize_tx_with_hash = serialize_tx_with_hash;
        ;
        function serialize_rct_tx_with_hash(tx) {
            var hashes = "";
            var buf = "";
            buf += CnTransactions.serialize_tx(tx, true);
            hashes += CnUtils.cn_fast_hash(buf);
            var buf2 = CnTransactions.serialize_rct_base(tx.rct_signatures);
            hashes += CnUtils.cn_fast_hash(buf2);
            buf += buf2;
            var buf3 = serializeRangeProofs(tx.rct_signatures);
            //add MGs
            var p = tx.rct_signatures.p;
            if (p)
                for (var i = 0; i < p.MGs.length; i++) {
                    for (var j = 0; j < p.MGs[i].ss.length; j++) {
                        buf3 += p.MGs[i].ss[j][0];
                        buf3 += p.MGs[i].ss[j][1];
                    }
                    buf3 += p.MGs[i].cc;
                }
            hashes += CnUtils.cn_fast_hash(buf3);
            buf += buf3;
            var hash = CnUtils.cn_fast_hash(hashes);
            return {
                raw: buf,
                hash: hash,
                prvkey: tx.prvkey
            };
        }
        CnTransactions.serialize_rct_tx_with_hash = serialize_rct_tx_with_hash;
        function get_tx_prefix_hash(tx) {
            var prefix = CnTransactions.serialize_tx(tx, true);
            return CnUtils.cn_fast_hash(prefix);
        }
        CnTransactions.get_tx_prefix_hash = get_tx_prefix_hash;
        //xv: vector of secret keys, 1 per ring (nrings)
        //pm: matrix of pubkeys, indexed by size first
        //iv: vector of indexes, 1 per ring (nrings), can be a string
        //size: ring size
        //nrings: number of rings
        //extensible borromean signatures
        function genBorromean(xv, pm, iv, size, nrings) {
            if (xv.length !== nrings) {
                throw "wrong xv length " + xv.length;
            }
            if (pm.length !== size) {
                throw "wrong pm size " + pm.length;
            }
            for (var i = 0; i < pm.length; i++) {
                if (pm[i].length !== nrings) {
                    throw "wrong pm[" + i + "] length " + pm[i].length;
                }
            }
            if (iv.length !== nrings) {
                throw "wrong iv length " + iv.length;
            }
            for (var i = 0; i < iv.length; i++) {
                if (parseInt(iv[i]) >= size) {
                    throw "bad indices value at: " + i + ": " + iv[i];
                }
            }
            //signature struct
            var bb = {
                s: [],
                ee: ""
            };
            //signature pubkey matrix
            var L = [];
            //add needed sub vectors (1 per ring size)
            for (var i = 0; i < size; i++) {
                bb.s[i] = [];
                L[i] = [];
            }
            //compute starting at the secret index to the last row
            var index;
            var alpha = [];
            for (var i = 0; i < nrings; i++) {
                index = parseInt('' + iv[i]);
                alpha[i] = CnRandom.random_scalar();
                L[index][i] = CnUtils.ge_scalarmult_base(alpha[i]);
                for (var j = index + 1; j < size; j++) {
                    bb.s[j][i] = CnRandom.random_scalar();
                    var c = Cn.hash_to_scalar(L[j - 1][i]);
                    L[j][i] = CnUtils.ge_double_scalarmult_base_vartime(c, pm[j][i], bb.s[j][i]);
                }
            }
            //hash last row to create ee
            var ltemp = "";
            for (var i = 0; i < nrings; i++) {
                ltemp += L[size - 1][i];
            }
            bb.ee = Cn.hash_to_scalar(ltemp);
            //compute the rest from 0 to secret index
            for (var i = 0; i < nrings; i++) {
                var cc = bb.ee;
                var j = 0;
                for (j = 0; j < parseInt(iv[i]); j++) {
                    bb.s[j][i] = CnRandom.random_scalar();
                    var LL = CnUtils.ge_double_scalarmult_base_vartime(cc, pm[j][i], bb.s[j][i]);
                    cc = Cn.hash_to_scalar(LL);
                }
                bb.s[j][i] = CnNativeBride.sc_mulsub(xv[i], cc, alpha[i]);
            }
            return bb;
        }
        CnTransactions.genBorromean = genBorromean;
        //proveRange gives C, and mask such that \sumCi = C
        //   c.f. http://eprint.iacr.org/2015/1098 section 5.1
        //   and Ci is a commitment to either 0 or s^i, i=0,...,n
        //   thus this proves that "amount" is in [0, s^n] (we assume s to be 4) (2 for now with v2 txes)
        //   mask is a such that C = aG + bH, and b = amount
        //commitMaskObj = {C: commit, mask: mask}
        function proveRange(commitMaskObj, amount, nrings, enc_seed, exponent) {
            var size = 2;
            var C = CnVars.I; //identity
            var mask = CnVars.Z; //zero scalar
            var indices = CnUtils.d2b(amount); //base 2 for now
            var sig = {
                Ci: [],
                bsig: {
                    s: [],
                    ee: ''
                }
                //exp: exponent //doesn't exist for now
            };
            /*payload stuff - ignore for now
            seeds = new Array(3);
            for (let i = 0; i < seeds.length; i++){
              seeds[i] = new Array(1);
            }
            genSeeds(seeds, enc_seed);
            */
            var ai = [];
            var PM = [];
            for (var i = 0; i < size; i++) {
                PM[i] = [];
            }
            //start at index and fill PM left and right -- PM[0] holds Ci
            for (var i = 0; i < nrings; i++) {
                ai[i] = CnRandom.random_scalar();
                var j = parseInt(indices[i]);
                PM[j][i] = CnUtils.ge_scalarmult_base(ai[i]);
                while (j > 0) {
                    j--;
                    PM[j][i] = CnUtils.ge_add(PM[j + 1][i], CnVars.H2[i]); //will need to use i*2 for base 4 (or different object)
                }
                j = parseInt(indices[i]);
                while (j < size - 1) {
                    j++;
                    PM[j][i] = CnUtils.ge_sub(PM[j - 1][i], CnVars.H2[i]); //will need to use i*2 for base 4 (or different object)
                }
                mask = CnNativeBride.sc_add(mask, ai[i]);
            }
            /*
            * some more payload stuff here
            */
            //copy commitments to sig and sum them to commitment
            for (var i = 0; i < nrings; i++) {
                //if (i < nrings - 1) //for later version
                sig.Ci[i] = PM[0][i];
                C = CnUtils.ge_add(C, PM[0][i]);
            }
            /* exponent stuff - ignore for now
            if (exponent){
              n = JSBigInt(10);
              n = n.pow(exponent).toString();
              mask = sc_mul(mask, d2s(n)); //new sum
            }
            */
            sig.bsig = CnTransactions.genBorromean(ai, PM, indices, size, nrings);
            commitMaskObj.C = C;
            commitMaskObj.mask = mask;
            return sig;
        }
        CnTransactions.proveRange = proveRange;
        /*export function proveRangeBulletproof(commitMaskObj : {C:string,mask:string}, amount : string, nrings : number, enc_seed : number, exponent : number) : CnTransactions.RangeProveBulletproofSignature{
            let mask = CnRandom.random_scalar();
    
            let proof : CnTransactions.RangeProveBulletproofSignature = bulletproof_PROVE(amount, mask);
    
            CHECK_AND_ASSERT_THROW_MES(proof.V.length == 1, "V has not exactly one element");
            commitMaskObj.C = proof.V[0];
            commitMaskObj.mask = mask;
            return proof;
        }
        export function verBulletproof(proof : CnTransactions.RangeProveBulletproofSignature) : boolean{
            try { return bulletproof_VERIFY(proof); }
                // we can get deep throws from ge_frombytes_vartime if input isn't valid
            catch (e) { return false; }
        }*/
        // Gen creates a signature which proves that for some column in the keymatrix "pk"
        //   the signer knows a secret key for each row in that column
        // we presently only support matrices of 2 rows (pubkey, commitment)
        // this is a simplied MLSAG_Gen function to reflect that
        // because we don't want to force same secret column for all inputs
        function MLSAG_Gen(message, pk, xx, kimg, index) {
            var cols = pk.length; //ring size
            if (index >= cols) {
                throw "index out of range";
            }
            var rows = pk[0].length; //number of signature rows (always 2)
            if (rows !== 2) {
                throw "wrong row count";
            }
            for (var i_1 = 0; i_1 < cols; i_1++) {
                if (pk[i_1].length !== rows) {
                    throw "pk is not rectangular";
                }
            }
            if (xx.length !== rows) {
                throw "bad xx size";
            }
            var c_old = "";
            var alpha = [];
            var rv = {
                ss: [],
                cc: ''
            };
            for (var i_2 = 0; i_2 < cols; i_2++) {
                rv.ss[i_2] = [];
            }
            var toHash = []; //holds 6 elements: message, pubkey, dsRow L, dsRow R, commitment, ndsRow L
            toHash[0] = message;
            //secret index (pubkey section)
            alpha[0] = CnRandom.random_scalar(); //need to save alphas for later
            toHash[1] = pk[index][0]; //secret index pubkey
            toHash[2] = CnUtils.ge_scalarmult_base(alpha[0]); //dsRow L
            toHash[3] = CnNativeBride.generate_key_image_2(pk[index][0], alpha[0]); //dsRow R (key image check)
            //secret index (commitment section)
            alpha[1] = CnRandom.random_scalar();
            toHash[4] = pk[index][1]; //secret index commitment
            toHash[5] = CnUtils.ge_scalarmult_base(alpha[1]); //ndsRow L
            c_old = Cn.array_hash_to_scalar(toHash);
            var i = (index + 1) % cols;
            if (i === 0) {
                rv.cc = c_old;
            }
            while (i != index) {
                rv.ss[i][0] = CnRandom.random_scalar(); //dsRow ss
                rv.ss[i][1] = CnRandom.random_scalar(); //ndsRow ss
                //!secret index (pubkey section)
                toHash[1] = pk[i][0];
                toHash[2] = CnUtils.ge_double_scalarmult_base_vartime(c_old, pk[i][0], rv.ss[i][0]);
                toHash[3] = CnUtils.ge_double_scalarmult_postcomp_vartime(rv.ss[i][0], pk[i][0], c_old, kimg);
                //!secret index (commitment section)
                toHash[4] = pk[i][1];
                toHash[5] = CnUtils.ge_double_scalarmult_base_vartime(c_old, pk[i][1], rv.ss[i][1]);
                c_old = Cn.array_hash_to_scalar(toHash); //hash to get next column c
                i = (i + 1) % cols;
                if (i === 0) {
                    rv.cc = c_old;
                }
            }
            for (i = 0; i < rows; i++) {
                rv.ss[index][i] = CnNativeBride.sc_mulsub(c_old, xx[i], alpha[i]);
            }
            return rv;
        }
        CnTransactions.MLSAG_Gen = MLSAG_Gen;
        //prepares for MLSAG_Gen
        function proveRctMG(message, pubs, inSk, kimg, mask, Cout, index) {
            var cols = pubs.length;
            if (cols < 3) {
                throw "cols must be > 2 (mixin)";
            }
            var xx = [];
            var PK = [];
            //fill pubkey matrix (copy destination, subtract commitments)
            for (var i = 0; i < cols; i++) {
                PK[i] = [];
                PK[i][0] = pubs[i].dest;
                PK[i][1] = CnUtils.ge_sub(pubs[i].mask, Cout);
            }
            xx[0] = inSk.x;
            xx[1] = CnNativeBride.sc_sub(inSk.a, mask);
            return CnTransactions.MLSAG_Gen(message, PK, xx, kimg, index);
        }
        CnTransactions.proveRctMG = proveRctMG;
        function serialize_rct_base(rv) {
            var buf = "";
            buf += CnUtils.encode_varint(rv.type);
            buf += CnUtils.encode_varint(rv.txnFee);
            if (rv.type === 2) {
                for (var i = 0; i < rv.pseudoOuts.length; i++) {
                    buf += rv.pseudoOuts[i];
                }
            }
            if (rv.ecdhInfo.length !== rv.outPk.length) {
                throw "mismatched outPk/ecdhInfo!";
            }
            for (var i = 0; i < rv.ecdhInfo.length; i++) {
                buf += rv.ecdhInfo[i].mask;
                buf += rv.ecdhInfo[i].amount;
            }
            for (var i = 0; i < rv.outPk.length; i++) {
                buf += rv.outPk[i];
            }
            return buf;
        }
        CnTransactions.serialize_rct_base = serialize_rct_base;
        function serializeRangeProofs(rv) {
            var buf = "";
            var p = rv.p;
            if (p) {
                if (p.rangeSigs.length)
                    return CnTransactions.serializeRangeProofsClassic(rv);
                else if (p.bulletproofs.length)
                    return CnTransactions.serializeRangeProofsBulletproof(rv);
                else
                    throw new Error(' missing range proof or bulletproof range proof');
            }
            else
                throw new Error('invalid p signature');
            return buf;
        }
        CnTransactions.serializeRangeProofs = serializeRangeProofs;
        function serializeRangeProofsClassic(rv) {
            var buf = "";
            var p = rv.p;
            if (p && p.rangeSigs.length)
                for (var i = 0; i < p.rangeSigs.length; i++) {
                    for (var j = 0; j < p.rangeSigs[i].bsig.s.length; j++) {
                        for (var l = 0; l < p.rangeSigs[i].bsig.s[j].length; l++) {
                            buf += p.rangeSigs[i].bsig.s[j][l];
                        }
                    }
                    buf += p.rangeSigs[i].bsig.ee;
                    for (var j = 0; j < p.rangeSigs[i].Ci.length; j++) {
                        buf += p.rangeSigs[i].Ci[j];
                    }
                }
            else
                throw new Error('invalid p signature. missing range proof');
            return buf;
        }
        CnTransactions.serializeRangeProofsClassic = serializeRangeProofsClassic;
        function serializeRangeProofsBulletproof(rv) {
            var buf = "";
            var p = rv.p;
            if (p)
                for (var i = 0; i < p.bulletproofs.length; i++) {
                    throw new Error('bulletproof serialization not implemented');
                }
            else
                throw new Error('invalid p signature. missing bulletproof range proof');
            return buf;
        }
        CnTransactions.serializeRangeProofsBulletproof = serializeRangeProofsBulletproof;
        function get_pre_mlsag_hash(rv) {
            var hashes = "";
            hashes += rv.message;
            hashes += CnUtils.cn_fast_hash(CnTransactions.serialize_rct_base(rv));
            var buf = CnTransactions.serializeRangeProofs(rv);
            hashes += CnUtils.cn_fast_hash(buf);
            return CnUtils.cn_fast_hash(hashes);
        }
        CnTransactions.get_pre_mlsag_hash = get_pre_mlsag_hash;
        //message is normal prefix hash
        //inSk is vector of x,a
        //kimg is vector of kimg
        //destinations is vector of pubkeys (we skip and proxy outAmounts instead)
        //inAmounts is vector of strings
        //outAmounts is vector of strings
        //mixRing is matrix of pubkey, commit (dest, mask)
        //amountKeys is vector of scalars
        //indices is vector
        //txnFee is string
        function genRct(message, inSk, kimg, 
        /*destinations, */ inAmounts, outAmounts, mixRing, amountKeys, indices, txnFee, bulletproof) {
            if (bulletproof === void 0) { bulletproof = false; }
            console.log('MIXIN:', mixRing);
            if (outAmounts.length !== amountKeys.length) {
                throw "different number of amounts/amount_keys";
            }
            for (var i = 0; i < mixRing.length; i++) {
                if (mixRing[i].length <= indices[i]) {
                    throw "bad mixRing/index size";
                }
            }
            if (mixRing.length !== inSk.length) {
                throw "mismatched mixRing/inSk";
            }
            if (inAmounts.length !== inSk.length) {
                throw "mismatched inAmounts/inSk";
            }
            if (indices.length !== inSk.length) {
                throw "mismatched indices/inSk";
            }
            console.log('======t');
            var rv = {
                type: inSk.length === 1 ? CnVars.RCT_TYPE.Full : CnVars.RCT_TYPE.Simple,
                message: message,
                outPk: [],
                p: {
                    rangeSigs: [],
                    bulletproofs: [],
                    MGs: []
                },
                ecdhInfo: [],
                txnFee: txnFee.toString(),
                pseudoOuts: []
            };
            var sumout = CnVars.Z;
            var cmObj = {
                C: '',
                mask: ''
            };
            console.log('====a');
            var p = rv.p;
            if (p) {
                var nrings = 64; //for base 2/current
                //compute range proofs, etc
                for (var i = 0; i < outAmounts.length; i++) {
                    var teststart = new Date().getTime();
                    if (!bulletproof)
                        p.rangeSigs[i] = CnTransactions.proveRange(cmObj, outAmounts[i], nrings, 0, 0);
                    // else
                    // 	p.bulletproofs[i] = CnTransactions.proveRangeBulletproof(cmObj, outAmounts[i], nrings, 0, 0);
                    var testfinish = new Date().getTime() - teststart;
                    console.log("Time take for range proof " + i + ": " + testfinish);
                    rv.outPk[i] = cmObj.C;
                    sumout = CnNativeBride.sc_add(sumout, cmObj.mask);
                    rv.ecdhInfo[i] = CnUtils.encode_rct_ecdh({ mask: cmObj.mask, amount: CnUtils.d2s(outAmounts[i]) }, amountKeys[i]);
                }
                console.log('====a');
                //simple
                console.log('-----------rv type', rv.type);
                if (rv.type === CnVars.RCT_TYPE.Simple) {
                    var ai = [];
                    var sumpouts = CnVars.Z;
                    //create pseudoOuts
                    var i = 0;
                    for (; i < inAmounts.length - 1; i++) {
                        ai[i] = CnRandom.random_scalar();
                        sumpouts = CnNativeBride.sc_add(sumpouts, ai[i]);
                        rv.pseudoOuts[i] = commit(CnUtils.d2s(inAmounts[i]), ai[i]);
                    }
                    ai[i] = CnNativeBride.sc_sub(sumout, sumpouts);
                    rv.pseudoOuts[i] = commit(CnUtils.d2s(inAmounts[i]), ai[i]);
                    var full_message = CnTransactions.get_pre_mlsag_hash(rv);
                    for (var i_3 = 0; i_3 < inAmounts.length; i_3++) {
                        p.MGs.push(CnTransactions.proveRctMG(full_message, mixRing[i_3], inSk[i_3], kimg[i_3], ai[i_3], rv.pseudoOuts[i_3], indices[i_3]));
                    }
                }
                else {
                    var sumC = CnVars.I;
                    //get sum of output commitments to use in MLSAG
                    for (var i = 0; i < rv.outPk.length; i++) {
                        sumC = CnUtils.ge_add(sumC, rv.outPk[i]);
                    }
                    sumC = CnUtils.ge_add(sumC, CnUtils.ge_scalarmult(CnVars.H, CnUtils.d2s(rv.txnFee)));
                    var full_message = CnTransactions.get_pre_mlsag_hash(rv);
                    p.MGs.push(CnTransactions.proveRctMG(full_message, mixRing[0], inSk[0], kimg[0], sumout, sumC, indices[0]));
                }
            }
            return rv;
        }
        CnTransactions.genRct = genRct;
        function construct_tx(keys, sources, dsts, fee_amount /*JSBigInt*/, payment_id, pid_encrypt, realDestViewKey, unlock_time, rct) {
            if (unlock_time === void 0) { unlock_time = 0; }
            //we move payment ID stuff here, because we need txkey to encrypt
            var txkey = Cn.random_keypair();
            console.log(txkey);
            var extra = '';
            if (payment_id) {
                if (pid_encrypt && payment_id.length !== INTEGRATED_ID_SIZE * 2) {
                    throw "payment ID must be " + INTEGRATED_ID_SIZE + " bytes to be encrypted!";
                }
                console.log("Adding payment id: " + payment_id);
                if (pid_encrypt && realDestViewKey) { //get the derivation from our passed viewkey, then hash that + tail to get encryption key
                    var pid_key = CnUtils.cn_fast_hash(Cn.generate_key_derivation(realDestViewKey, txkey.sec) + ENCRYPTED_PAYMENT_ID_TAIL.toString(16)).slice(0, INTEGRATED_ID_SIZE * 2);
                    console.log("Txkeys:", txkey, "Payment ID key:", pid_key);
                    payment_id = CnUtils.hex_xor(payment_id, pid_key);
                }
                var nonce = CnTransactions.get_payment_id_nonce(payment_id, pid_encrypt);
                console.log("Extra nonce: " + nonce);
                extra = CnTransactions.add_nonce_to_extra(extra, nonce);
            }
            var tx = {
                unlock_time: unlock_time,
                version: rct ? CURRENT_TX_VERSION : OLD_TX_VERSION,
                extra: extra,
                prvkey: '',
                vin: [],
                vout: [],
                rct_signatures: {
                    ecdhInfo: [],
                    outPk: [],
                    pseudoOuts: [],
                    txnFee: '',
                    type: 0,
                },
                signatures: []
            };
            if (rct) {
                tx.rct_signatures = { ecdhInfo: [], outPk: [], pseudoOuts: [], txnFee: "", type: 0 };
            }
            else {
                tx.signatures = [];
            }
            tx.prvkey = txkey.sec;
            var in_contexts = [];
            var inputs_money = JSBigInt.ZERO;
            var i, j;
            console.log('Sources: ');
            //run the for loop twice to sort ins by key image
            //first generate key image and other construction data to sort it all in one go
            for (i = 0; i < sources.length; i++) {
                console.log(i + ': ' + Cn.formatMoneyFull(sources[i].amount));
                if (sources[i].real_out >= sources[i].outputs.length) {
                    throw "real index >= outputs.length";
                }
                // inputs_money = inputs_money.add(sources[i].amount);
                // sets res.mask among other things. mask is identity for non-rct transactions
                // and for coinbase ringct (type = 0) txs.
                var res = CnTransactions.generate_key_image_helper_rct(keys, sources[i].real_out_tx_key, sources[i].real_out_in_tx, sources[i].mask); //mask will be undefined for non-rct
                // in_contexts.push(res.in_ephemeral);
                // now we mark if this is ringct coinbase txs. such transactions
                // will have identity mask. Non-ringct txs will have  sources[i].mask set to null.
                // this only works if beckend will produce masks in get_unspent_outs for
                // coinbaser ringct txs.
                //is_rct_coinbases.push((sources[i].mask ? sources[i].mask === I : 0));
                console.log('res.in_ephemeral.pub', res, res.in_ephemeral.pub, sources, i);
                if (res.in_ephemeral.pub !== sources[i].outputs[sources[i].real_out].key) {
                    throw "in_ephemeral.pub != source.real_out.key";
                }
                sources[i].key_image = res.image;
                sources[i].in_ephemeral = res.in_ephemeral;
            }
            //sort ins
            sources.sort(function (a, b) {
                return JSBigInt.parse(a.key_image, 16).compare(JSBigInt.parse(b.key_image, 16)) * -1;
            });
            //copy the sorted sources data to tx
            for (i = 0; i < sources.length; i++) {
                inputs_money = inputs_money.add(sources[i].amount);
                in_contexts.push(sources[i].in_ephemeral);
                var input_to_key = {
                    type: "input_to_key",
                    amount: sources[i].amount,
                    k_image: sources[i].key_image,
                    key_offsets: [],
                };
                for (j = 0; j < sources[i].outputs.length; ++j) {
                    console.log('add to key offsets', sources[i].outputs[j].index, j, sources[i].outputs);
                    input_to_key.key_offsets.push(sources[i].outputs[j].index);
                }
                console.log('key offsets before abs', input_to_key.key_offsets);
                input_to_key.key_offsets = CnTransactions.abs_to_rel_offsets(input_to_key.key_offsets);
                console.log('key offsets after abs', input_to_key.key_offsets);
                tx.vin.push(input_to_key);
            }
            var outputs_money = JSBigInt.ZERO;
            var out_index = 0;
            var amountKeys = []; //rct only
            var num_stdaddresses = 0;
            var num_subaddresses = 0;
            var single_dest_subaddress = '';
            var unique_dst_addresses = {};
            for (i = 0; i < dsts.length; ++i) {
                if (new JSBigInt(dsts[i].amount).compare(0) < 0) {
                    throw "dst.amount < 0"; //amount can be zero if no change
                }
                var destKeys = Cn.decode_address(dsts[i].address);
                if (destKeys.view === keys.view.pub) //change address
                    continue;
                if (typeof unique_dst_addresses[dsts[i].address] === 'undefined') {
                    unique_dst_addresses[dsts[i].address] = 1;
                    if (Cn.is_subaddress(dsts[i].address)) {
                        ++num_subaddresses;
                        single_dest_subaddress = dsts[i].address;
                    }
                    else {
                        ++num_stdaddresses;
                    }
                }
            }
            console.log('Destinations resume:', unique_dst_addresses, num_stdaddresses, num_subaddresses);
            if (num_stdaddresses == 0 && num_subaddresses == 1) {
                var uniqueSubaddressDecoded = Cn.decode_address(single_dest_subaddress);
                txkey.pub = CnUtils.ge_scalarmult(uniqueSubaddressDecoded.spend, txkey.sec);
            }
            var additional_tx_keys = [];
            var additional_tx_public_keys = [];
            var need_additional_txkeys = num_subaddresses > 0 && (num_stdaddresses > 0 || num_subaddresses > 1);
            for (i = 0; i < dsts.length; ++i) {
                var destKeys = Cn.decode_address(dsts[i].address);
                var additional_txkey = { sec: '', pub: '' };
                if (need_additional_txkeys) {
                    additional_txkey = Cn.random_keypair();
                    if (Cn.is_subaddress(dsts[i].address)) {
                        // R = rD for subaddresses
                        additional_txkey.pub = CnUtils.ge_scalarmult(destKeys.spend, additional_txkey.sec);
                    }
                    else
                        additional_txkey.pub = CnUtils.ge_scalarmult_base(additional_txkey.sec);
                }
                var out_derivation = void 0;
                if (destKeys.view === keys.view.pub) {
                    out_derivation = Cn.generate_key_derivation(txkey.pub, keys.view.sec);
                }
                else {
                    if (Cn.is_subaddress(dsts[i].address) && need_additional_txkeys)
                        out_derivation = Cn.generate_key_derivation(destKeys.view, additional_txkey.sec);
                    else
                        out_derivation = Cn.generate_key_derivation(destKeys.view, txkey.sec);
                }
                if (need_additional_txkeys) {
                    additional_tx_public_keys.push(additional_txkey.pub);
                    additional_tx_keys.push(additional_txkey.sec);
                }
                if (rct) {
                    amountKeys.push(CnUtils.derivation_to_scalar(out_derivation, out_index));
                }
                var out_ephemeral_pub = Cn.derive_public_key(out_derivation, out_index, destKeys.spend);
                var out = {
                    amount: dsts[i].amount,
                    target: {
                        type: "txout_to_key",
                        data: {
                            key: out_ephemeral_pub
                        }
                    }
                };
                // txout_to_key
                tx.vout.push(out);
                ++out_index;
                outputs_money = outputs_money.add(dsts[i].amount);
            }
            // add pub key to extra after we know whether to use R = rG or R = rD
            tx.extra = CnTransactions.add_pub_key_to_extra(tx.extra, txkey.pub);
            tx.extra = CnTransactions.add_additionnal_pub_keys_to_extra(tx.extra, additional_tx_public_keys);
            if (outputs_money.add(fee_amount).compare(inputs_money) > 0) {
                throw "outputs money (" + Cn.formatMoneyFull(outputs_money) + ") + fee (" + Cn.formatMoneyFull(fee_amount) + ") > inputs money (" + Cn.formatMoneyFull(inputs_money) + ")";
            }
            if (!rct) {
                for (i = 0; i < sources.length; ++i) {
                    var src_keys = [];
                    for (j = 0; j < sources[i].outputs.length; ++j) {
                        src_keys.push(sources[i].outputs[j].key);
                    }
                    var sigs = CnNativeBride.generate_ring_signature(CnTransactions.get_tx_prefix_hash(tx), tx.vin[i].k_image, src_keys, in_contexts[i].sec, sources[i].real_out);
                    tx.signatures.push(sigs);
                }
            }
            else { //rct
                var txnFee = fee_amount;
                var keyimages = [];
                var inSk = [];
                var inAmounts = [];
                var mixRing = [];
                var indices = [];
                for (i = 0; i < tx.vin.length; i++) {
                    keyimages.push(tx.vin[i].k_image);
                    inSk.push({
                        x: in_contexts[i].sec,
                        a: in_contexts[i].mask,
                    });
                    inAmounts.push(tx.vin[i].amount);
                    if (in_contexts[i].mask !== CnVars.I) {
                        //if input is rct (has a valid mask), 0 out amount
                        tx.vin[i].amount = "0";
                    }
                    mixRing[i] = [];
                    for (j = 0; j < sources[i].outputs.length; j++) {
                        mixRing[i].push({
                            dest: sources[i].outputs[j].key,
                            mask: sources[i].outputs[j].commit,
                        });
                    }
                    indices.push(sources[i].real_out);
                }
                var outAmounts = [];
                for (i = 0; i < tx.vout.length; i++) {
                    outAmounts.push(tx.vout[i].amount);
                    tx.vout[i].amount = 0; //zero out all rct outputs
                }
                console.log('rc signature----');
                var tx_prefix_hash = CnTransactions.get_tx_prefix_hash(tx);
                console.log('rc signature----');
                tx.rct_signatures = CnTransactions.genRct(tx_prefix_hash, inSk, keyimages, /*destinations, */ inAmounts, outAmounts, mixRing, amountKeys, indices, txnFee);
            }
            console.log(tx);
            return tx;
        }
        CnTransactions.construct_tx = construct_tx;
        function create_transaction(pub_keys, sec_keys, dsts, outputs, mix_outs, fake_outputs_count, fee_amount /*JSBigInt*/, payment_id, pid_encrypt, realDestViewKey, unlock_time, rct) {
            if (mix_outs === void 0) { mix_outs = []; }
            if (unlock_time === void 0) { unlock_time = 0; }
            var i, j;
            if (dsts.length === 0) {
                throw 'Destinations empty';
            }
            if (mix_outs.length !== outputs.length && fake_outputs_count !== 0) {
                throw 'Wrong number of mix outs provided (' + outputs.length + ' outputs, ' + mix_outs.length + ' mix outs)';
            }
            for (i = 0; i < mix_outs.length; i++) {
                if ((mix_outs[i].outputs || []).length < fake_outputs_count) {
                    throw 'Not enough outputs to mix with';
                }
            }
            var keys = {
                view: {
                    pub: pub_keys.view,
                    sec: sec_keys.view
                },
                spend: {
                    pub: pub_keys.spend,
                    sec: sec_keys.spend
                }
            };
            if (!Cn.valid_keys(keys.view.pub, keys.view.sec, keys.spend.pub, keys.spend.sec)) {
                throw "Invalid secret keys!";
            }
            var needed_money = JSBigInt.ZERO;
            for (i = 0; i < dsts.length; ++i) {
                needed_money = needed_money.add(dsts[i].amount);
                if (needed_money.compare(UINT64_MAX) !== -1) {
                    throw "Output overflow!";
                }
            }
            var found_money = JSBigInt.ZERO;
            var sources = [];
            console.log('Selected transfers: ', outputs);
            for (i = 0; i < outputs.length; ++i) {
                found_money = found_money.add(outputs[i].amount);
                if (found_money.compare(UINT64_MAX) !== -1) {
                    throw "Input overflow!";
                }
                var src = {
                    outputs: [],
                    amount: '',
                    real_out_tx_key: '',
                    real_out: 0,
                    real_out_in_tx: 0,
                    mask: null,
                    key_image: '',
                    in_ephemeral: {
                        pub: '',
                        sec: '',
                        mask: ''
                    }
                };
                src.amount = new JSBigInt(outputs[i].amount).toString();
                if (mix_outs.length !== 0) {
                    // Sort fake outputs by global index
                    console.log('mix outs before sort', mix_outs[i].outputs);
                    mix_outs[i].outputs.sort(function (a, b) {
                        return new JSBigInt(a.global_index).compare(b.global_index);
                    });
                    j = 0;
                    console.log('mix outs sorted', mix_outs[i].outputs);
                    while ((src.outputs.length < fake_outputs_count) && (j < mix_outs[i].outputs.length)) {
                        var out = mix_outs[i].outputs[j];
                        console.log('chekcing mixin', out, outputs[i]);
                        if (out.global_index === outputs[i].global_index) {
                            console.log('got mixin the same as output, skipping');
                            j++;
                            continue;
                        }
                        var oe = {
                            index: out.global_index.toString(),
                            key: out.public_key,
                            commit: ''
                        };
                        /*
                        if (rct){
                            if (out.rct){
                                oe.commit = out.rct.slice(0,64); //add commitment from rct mix outs
                            } else {
                                if (outputs[i]['rct']) {throw "mix rct outs missing commit";}
                                oe.commit = zeroCommit(CnUtils.d2s(src.amount)); //create identity-masked commitment for non-rct mix input
                            }
                        }
    
                         */
                        src.outputs.push(oe);
                        j++;
                    }
                }
                var real_oe = {
                    index: new JSBigInt(outputs[i].global_index || 0).toString(),
                    key: outputs[i].public_key,
                    commit: '',
                };
                console.log('OUT FOR REAL:', outputs[i].global_index);
                /*
                if (rct){
                    if (outputs[i].rct) {
                        real_oe.commit = outputs[i].rct.slice(0,64); //add commitment for real input
                    } else {
                        console.log('ZERO COMMIT');
                        real_oe.commit = zeroCommit(CnUtils.d2s(src.amount)); //create identity-masked commitment for non-rct input
                    }
                }
    
                 */
                var real_index = src.outputs.length;
                for (j = 0; j < src.outputs.length; j++) {
                    if (new JSBigInt(real_oe.index).compare(src.outputs[j].index) < 0) {
                        real_index = j;
                        break;
                    }
                }
                // Add real_oe to outputs
                console.log('inserting real ouput at index', real_index, real_oe, outputs[i], i);
                src.outputs.splice(real_index, 0, real_oe);
                src.real_out_tx_key = outputs[i].tx_pub_key;
                // Real output entry index
                src.real_out = real_index;
                src.real_out_in_tx = outputs[i].index;
                console.log('check mask', outputs, rct, i);
                /*
                if (rct){
                    if (outputs[i].rct) {
                        src.mask = outputs[i].rct.slice(64,128); //encrypted or idenity mask for coinbase txs.
                    } else {
                        console.log('NULL MASK');
                        src.mask = null; //will be set by generate_key_image_helper_rct
                    }
                }
    
                 */
                sources.push(src);
            }
            console.log('sources: ', sources);
            var change = {
                amount: JSBigInt.ZERO
            };
            var cmp = needed_money.compare(found_money);
            if (cmp < 0) {
                change.amount = found_money.subtract(needed_money);
                if (change.amount.compare(fee_amount) !== 0) {
                    throw "early fee calculation != later";
                }
            }
            else if (cmp > 0) {
                throw "Need more money than found! (have: " + Cn.formatMoney(found_money) + " need: " + Cn.formatMoney(needed_money) + ")";
            }
            return CnTransactions.construct_tx(keys, sources, dsts, fee_amount, payment_id, pid_encrypt, realDestViewKey, unlock_time, rct);
        }
        CnTransactions.create_transaction = create_transaction;
    })(CnTransactions = exports.CnTransactions || (exports.CnTransactions = {}));
});
