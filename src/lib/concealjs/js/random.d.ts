/**
 * 256-bit (32-byte) seed as a 64-character lowercase hex string.
 * @returns {string}
 */
export function rand32(): string;
/**
 * 128-bit (16-byte) value as a 32-character lowercase hex string.
 * @returns {string}
 */
export function rand16(): string;
/**
 * 64-bit (8-byte) value as a 16-character lowercase hex string.
 * @returns {string}
 */
export function rand8(): string;
/**
 * Random canonical Ed25519 scalar as 64-character lowercase hex.
 *
 * Equivalent to `crypto.sc_reduce32(rand32())` — same reduction used for
 * `generate_keys` secret keys.
 *
 * @returns {string}
 */
export function random_scalar(): string;
