/**
 * Keccak-256 with CryptoNote padding (not SHA3-256). Returns a lowercase hex digest.
 *
 * @param {Uint8Array | string | ArrayBuffer} message
 * @returns {string}
 */
export const keccak_256: any;
/**
 * SHA3-384 (NIST padding, not Keccak-384). Returns a lowercase hex digest (96 characters).
 *
 * @param {Uint8Array | string | ArrayBuffer} message
 * @returns {string}
 */
export const sha3_384: any;
export default _sha3Methods;
declare const _sha3Methods: {};
