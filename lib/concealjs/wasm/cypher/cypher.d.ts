/* tslint:disable */
/* eslint-disable */

/**
 * ChaCha12 stream cipher (12 rounds).
 *
 * Same interface as `chacha8` but with 12 rounds.
 */
export function chacha12(key: Uint8Array, nonce: Uint8Array, data: Uint8Array): Uint8Array;

/**
 * ChaCha20 stream cipher (20 rounds, IETF variant).
 *
 * Same interface as `chacha8` and `chacha12`.
 */
export function chacha20(key: Uint8Array, nonce: Uint8Array, data: Uint8Array): Uint8Array;

/**
 * ChaCha8 stream cipher (8 rounds).
 *
 * Encrypts or decrypts `data` using `key` (32 bytes) and `nonce` (12 bytes).
 * Returns ciphertext/plaintext or an error if sizes are wrong.
 */
export function chacha8(key: Uint8Array, nonce: Uint8Array, data: Uint8Array): Uint8Array;
