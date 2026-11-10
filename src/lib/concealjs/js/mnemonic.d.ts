/**
 * Mnemonic encoding/decoding for Conceal Network.
 *
 * Extracted from crypto_utils.js (paperwallet reference) and rewritten as a
 * clean ES module.  Plain JS is ~2.8× faster than Rust WASM for this
 * string-heavy operation (WASM boundary overhead dominates computation time).
 *
 * Public API:
 *   mn_encode(seed_hex, wordset_name?) → mnemonic string
 *   mn_decode(mnemonic, wordset_name?) → seed hex string
 *   mn_random(bits)                   → random seed hex (Web Crypto)
 */
/**
 * Encodes a 64-char hex private spend key into a mnemonic phrase.
 *
 * Each 8 hex characters (4 bytes) produce 3 words; a final checksum word is
 * appended for wordsets that have `prefix_len > 0` (all except Electrum).
 * The result is a space-separated string of 25 words for English/Japanese
 * or 24 words for Electrum.
 *
 * @param {string} str - 64-character hex string (32-byte private key).
 * @param {'english' | 'spanish' | 'portuguese' | 'japanese' | 'electrum'} [wordset_name='english'] - Wordset to use.
 * @returns {string} Space-separated mnemonic phrase.
 * @throws {Error} If the wordset is unknown, or `str` is not a 64-char hex string.
 */
declare function mn_encode(str: string, wordset_name?: 'english' | 'spanish' | 'portuguese' | 'japanese' | 'electrum'): string;
/**
 * Decodes a mnemonic phrase back into a 64-char hex private spend key.
 *
 * Validates the checksum word (for wordsets with `prefix_len > 0`) and
 * throws a descriptive error if the phrase is malformed or unverifiable.
 * Only the first `prefix_len` characters of each word are significant;
 * full words are accepted and compared by prefix.
 *
 * @param {string} str - Space-separated mnemonic phrase (25 words for English).
 * @param {'english' | 'spanish' | 'portuguese' | 'japanese' | 'electrum'} [wordset_name='english'] - Wordset to use.
 * @returns {string} 64-character lowercase hex string (32-byte private key).
 * @throws {Error} If the wordset is unknown, too few words are given, a word
 *   is unrecognised, or the checksum word does not match.
 */
declare function mn_decode(str: string, wordset_name?: 'english' | 'spanish' | 'portuguese' | 'japanese' | 'electrum'): string;
/**
 * Generates a cryptographically random seed as a lowercase hex string.
 *
 * Uses `globalThis.crypto.getRandomValues` (Web Crypto) — works in browsers,
 * Node 20+, and Web Workers alike.  Retries up to 5 times before throwing if
 * the CSPRNG returns all-zero output.
 *
 * The returned value is raw entropy and is NOT automatically reduced
 * modulo the Ed25519 group order.  Pass it through `crypto.sc_reduce32`
 * before using it as a private key.
 *
 * @param {number} bits - Number of random bits to generate.  Must be a
 *   positive integer multiple of 32, at most 524288 (the Web Crypto
 *   `getRandomValues` 65536-byte limit); typically `256` for a 32-byte seed.
 * @returns {string} Lowercase hex string of length `bits / 4`.
 * @throws {Error} If `bits` is not a positive integer multiple of 32 up to
 *   524288, or if the environment does not support the Web Crypto API, or if
 *   random generation fails.
 */
declare function mn_random(bits: number): string;
export { mn_decode, mn_encode, mn_random };
