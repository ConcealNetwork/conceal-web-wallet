/**
 * CCX address encoding for view-only and integrated addresses.
 *
 * **Hybrid tier:** this module is the zero-init JavaScript path — no WASM load,
 * no `await init()`. Algorithms mirror the canonical Rust implementation in
 * `rust/crypto/src/address.rs` (same varint prefix, Keccak checksum, base58).
 *
 * When the WASM `crypto` module is already loaded, `crypto.encode_address`,
 * `crypto.encode_integrated_address`, and `crypto.decode_address` expose the
 * same behavior via Rust. Use this namespace for view-only wallets that only
 * hold public keys; use `crypto.create_address` for seed-based key generation.
 *
 * @module address
 */
/** CCX mainnet public address prefix. */
export declare const ADDRESS_PREFIX = 31444;
/** CCX mainnet integrated address prefix. */
export declare const INTEGRATED_ADDRESS_PREFIX = 31445;
/** CCX mainnet subaddress prefix. */
export declare const SUBADDRESS_PREFIX = 31446;
/** Address checksum length in bytes (8 hex chars). */
export declare const ADDRESS_CHECKSUM_SIZE = 4;
/** Integrated payment ID length in bytes (16 hex chars). */
export declare const INTEGRATED_ID_SIZE = 8;
/**
 * Encode a standard CCX address from spend + view public keys.
 *
 * @param {string} spendPub - 64-char hex spend public key.
 * @param {string} viewPub - 64-char hex view public key.
 * @returns {string} Base58 CCX address.
 */
export declare function encode_address(spendPub: string, viewPub: string): string;
/**
 * Encode a CCX integrated address (embeds an 8-byte payment ID).
 *
 * @param {string} spendPub - 64-char hex spend public key.
 * @param {string} viewPub - 64-char hex view public key.
 * @param {string} paymentId - 16-char hex payment ID.
 * @returns {string} Base58 CCX integrated address.
 */
export declare function encode_integrated_address(spendPub: string, viewPub: string, paymentId: string): string;
/**
 * Decode a CCX address (standard, integrated, or subaddress) to its spend +
 * view public keys, plus the embedded payment ID for integrated addresses.
 * Validates the network prefix and the Keccak-256 checksum.
 *
 * Canonical logic lives in Rust (`address::decode_address_full`); this JS copy
 * avoids WASM init for view-only / address-only call sites.
 *
 * @param {string} address - Base58 CCX address.
 * @returns {{ spend: string, view: string, intPaymentId: string | null }}
 */
export declare function decode_address(address: string): {
    spend: string;
    view: string;
    intPaymentId: string | null;
};
export { decode as base58_decode, encode as base58_encode } from "./base58.js";
