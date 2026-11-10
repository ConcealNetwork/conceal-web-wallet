/**
 * Random hex entropy for Conceal Network.
 *
 * `rand*` helpers use the Web Crypto API via `mnemonic.mn_random`
 * (browsers, Node 20+, and Web Workers).
 * `random_scalar` additionally uses WASM `sc_reduce32` (canonical scalar mod *l*).
 *
 * @module random
 */
/**
 * 256-bit (32-byte) seed as a 64-character lowercase hex string.
 * @returns {string}
 */
export declare function rand32(): string;
/**
 * 128-bit (16-byte) value as a 32-character lowercase hex string.
 * @returns {string}
 */
export declare function rand16(): string;
/**
 * 64-bit (8-byte) value as a 16-character lowercase hex string.
 * @returns {string}
 */
export declare function rand8(): string;
/**
 * Random canonical Ed25519 scalar as 64-character lowercase hex.
 *
 * Equivalent to `crypto.sc_reduce32(rand32())` — same reduction used for
 * `generate_keys` secret keys.
 *
 * @returns {string}
 */
export declare function random_scalar(): string;
