/**
 * CryptoNote block-based base58 (encode + decode), ported from the legacy
 * `cnBase58` implementation in `conceal-web-wallet`.
 *
 * Faithful translation of the canonical CryptoNote algorithm with one change:
 * the legacy `JSBigInt` arithmetic is replaced with native `BigInt` (no external
 * bigint dependency). Pure JS, no globals — runs identically in Node and the
 * browser without `await init()`.
 *
 * @module base58
 */
/**
 * Encode a hex string to a CryptoNote base58 string.
 *
 * @param {string} hex - Even-length hex string.
 * @returns {string} Base58 string (left-padded per block with `'1'`).
 */
export declare function encode(hex: string): string;
/**
 * Decode a CryptoNote base58 string to a hex string.
 *
 * @param {string} enc - Base58 string.
 * @returns {string} Even-length hex string.
 */
export declare function decode(enc: string): string;
