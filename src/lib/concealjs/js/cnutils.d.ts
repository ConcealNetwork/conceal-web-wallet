/**
 * CryptoNote utility helpers from `CnUtils` in conceal-web-wallet `Cn.ts`.
 *
 * Pure hex/integer helpers and `cn_fast_hash` (Keccak-256 via `tiers/sha3.js`) run in
 * JavaScript; curve ops use `nacl.ll` (TweetNaCl CN extensions); scalar helpers and
 * `hash_to_ec32` / `hash_to_ec160` delegate to the Rust/WASM `crypto` module.
 *
 * @module cnutils
 */
/** @type {Readonly<{ EC_POINT: number }>} */
export declare const STRUCT_SIZES: Readonly<{
    EC_POINT: number;
}>;
/**
 * Decode a validated hex string to bytes.
 *
 * @param {string} hex - Validated hex string (`""` decodes to an empty array).
 * @returns {Uint8Array}
 * @throws {Error} If `hex` is not a string, contains non-hex characters, or has odd length.
 */
export declare function hextobin(hex: string): Uint8Array;
/**
 * @param {Uint8Array | string} bin
 * @returns {string}
 */
export declare function bintohex(bin: Uint8Array | string): string;
/**
 * Reverse the byte order of a hex string (little-endian ↔ big-endian).
 *
 * @param {string} hex - Even-length hex string.
 * @returns {string} Byte-swapped hex string.
 * @throws {TypeError} If `hex` is not a string.
 * @throws {Error} If `hex` contains non-hex characters or has odd length.
 */
export declare function swapEndian(hex: string): string;
/**
 * @param {string} string
 * @returns {string}
 */
export declare function swapEndianC(string: string): string;
/**
 * Format a non-negative integer as 64-char lowercase hex (big-endian).
 *
 * @param {number | string} integer - Non-negative integer (pass large values as strings).
 * @returns {string} 64-char lowercase hex.
 * @throws {TypeError} If `integer` is not a number or decimal string.
 * @throws {Error} If `integer` is negative or fractional, a number too large for exact formatting, or ≥ 2^256.
 */
export declare function d2h(integer: number | string): string;
/**
 * Format a non-negative integer as 64-char lowercase hex (little-endian).
 *
 * @param {number | string} integer - Non-negative integer (pass large values as strings).
 * @returns {string} 64-char lowercase hex.
 * @throws {TypeError} If `integer` is not a number or decimal string.
 * @throws {Error} If `integer` is negative or fractional, a number too large for exact formatting, or ≥ 2^256.
 */
export declare function d2s(integer: number | string): string;
/**
 * Decode 8 little-endian bytes (16 hex chars) to a JS number.
 *
 * @param {string} hex - Exactly 16 hex characters (8 bytes, little-endian order).
 * @returns {number} Unsigned integer value of those 8 bytes.
 * @throws {Error} If `hex` is not a 16-character hex string, or the value exceeds `Number.MAX_SAFE_INTEGER`.
 */
export declare function h2d(hex: string): number;
/**
 * Format a non-negative integer as a 64-bit little-endian bit-string.
 *
 * @param {number | string} integer - Non-negative integer (pass large values as strings).
 * @returns {string} 64-character bit-string.
 * @throws {TypeError} If `integer` is not a number or decimal string.
 * @throws {Error} If `integer` is negative or fractional, or a number too large for exact formatting, or overflows uint64.
 */
export declare function d2b(integer: number | string): string;
/**
 * @param {string} pub
 * @param {string} sec
 * @returns {string}
 */
export declare function ge_scalarmult(pub: string, sec: string): string;
/**
 * @param {string} p1
 * @param {string} p2
 * @returns {string}
 */
export declare function ge_add(p1: string, p2: string): string;
/**
 * Negate an Ed25519 compressed point by flipping the sign bit in the high
 * nibble of the last byte (`point[62]` ± 8).
 *
 * @param {string} point - 64-character compressed point hex.
 * @returns {string} 64-character hex encoding of `-point`.
 * @throws {Error} If `point` is not a 64-character hex string.
 */
export declare function ge_neg(point: string): string;
/**
 * Subtract two Ed25519 compressed points (`point1 - point2`).
 *
 * @param {string} point1 - 64-character compressed point hex.
 * @param {string} point2 - 64-character compressed point hex.
 * @returns {string} 64-character hex encoding of `point1 - point2`.
 * @throws {Error} If either point fails `ge_add` / `ge_neg` validation.
 */
export declare function ge_sub(point1: string, point2: string): string;
/**
 * @param {string} sec
 * @returns {string}
 */
export declare function sec_key_to_pub(sec: string): string;
/**
 * Whether `hex` is a string made only of hex characters (case-insensitive).
 * The empty string is valid. Does not check length parity.
 *
 * @param {unknown} hex
 * @returns {boolean} `false` for non-strings.
 */
export declare function valid_hex(hex: unknown): boolean;
/**
 * @param {string} sec
 * @returns {string}
 */
export declare function ge_scalarmult_base(sec: string): string;
/**
 * @param {string} derivation
 * @param {number | string} output_index - Varint input; see `encode_varint`.
 * @returns {string}
 * @throws {Error} If `derivation` is not 64 chars, or `output_index` fails `encode_varint`.
 */
export declare function derivation_to_scalar(derivation: string, output_index: number | string): string;
/**
 * Encode an unsigned CryptoNote varint as lowercase hex.
 *
 * @param {number | string} i - Integer in `[0, 2^64 - 1]`; pass values above
 * `Number.MAX_SAFE_INTEGER` as decimal strings.
 * @returns {string} Even-length lowercase hex.
 * @throws {Error} If `i` is missing, non-numeric, fractional, negative, an unsafe
 * JS number, or above uint64.
 */
export declare function encode_varint(i: number | string): string;
/**
 * Encode an unsigned CryptoNote term varint as lowercase hex.
 *
 * @param {number | string} i - Integer in `[0, 2^64 - 1]`; pass values above
 * `Number.MAX_SAFE_INTEGER` as decimal strings.
 * @returns {string} Even-length lowercase hex.
 * @throws {Error} If `i` is missing, non-numeric, fractional, negative, an unsafe
 * JS number, or above uint64.
 */
export declare function encode_varint_term(i: number | string): string;
/**
 * Keccak-256 of hex-decoded input (`CnUtils.cn_fast_hash` / wallet `keccak_256`).
 *
 * @param {string} input - Even-length hex string.
 * @returns {string} 64-char lowercase hex digest.
 */
export declare function cn_fast_hash(input: string): string;
/**
 * @param {string} hex1
 * @param {string} hex2
 * @returns {string}
 */
export declare function hex_xor(hex1: string, hex2: string): string;
/**
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export declare function trimRight(str: string, char: string): string;
/**
 * @param {string} str
 * @param {number} len
 * @param {string} char
 * @returns {string}
 */
export declare function padLeft(str: string, len: number, char: string): string;
/**
 * @param {string} c
 * @param {string} P
 * @param {string} r
 * @returns {string}
 */
export declare function ge_double_scalarmult_base_vartime(c: string, P: string, r: string): string;
/**
 * `r·hash_to_ec32(P) + c·I` (wallet postcomp path; needs 32-byte compressed `Pb`).
 *
 * @param {string} r - 64-char hex scalar.
 * @param {string} P - 64-char hex public key (compressed point input to `hash_to_ec32`).
 * @param {string} c - 64-char hex scalar.
 * @param {string} I - 64-char hex point.
 * @returns {string} 64-char hex point.
 */
export declare function ge_double_scalarmult_postcomp_vartime(r: string, P: string, c: string, I: string): string;
/**
 * Decompose a non-negative integer amount into power-of-ten digit components.
 *
 * @param {number | string} amount - Non-negative integer (or decimal string).
 * @returns {import('./tiers/biginteger.js').JSBigInt[]} Digit components, most significant first.
 * @throws {TypeError} If `amount` is not a number or decimal string.
 * @throws {Error} If `amount` is negative or fractional.
 */
export declare function decompose_amount_into_digits(amount: number | string): import('./tiers/biginteger.js').JSBigInt[];
export type RctEcdh = {
    mask: string;
    amount: string;
};
/**
 * @typedef {Object} RctEcdh
 * @property {string} mask
 * @property {string} amount
 */
/**
 * @param {RctEcdh} ecdh
 * @param {string} key
 * @returns {RctEcdh}
 */
export declare function decode_rct_ecdh(ecdh: RctEcdh, key: string): RctEcdh;
/**
 * @param {RctEcdh} ecdh
 * @param {string} key
 * @returns {RctEcdh}
 */
export declare function encode_rct_ecdh(ecdh: RctEcdh, key: string): RctEcdh;
