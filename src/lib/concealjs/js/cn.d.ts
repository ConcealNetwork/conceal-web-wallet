/**
 * @typedef {Object} KeyPair
 * @property {string} sec - 64-character hex secret key.
 * @property {string} pub - 64-character hex public key.
 */
/**
 * Generate a random spend/view-style key pair from secure entropy.
 * @returns {KeyPair}
 */
export function random_keypair(): KeyPair;
/**
 * Undo `crypto.derive_public_key`: recover the base public key from a derived one.
 *
 * @param {string} derivation - 64-character hex derivation (32-byte EC point).
 * @param {number} out_index - Output index passed to derivation_to_scalar.
 * @param {string} pub - 64-character hex derived public key.
 * @returns {string} Base public key hex (64 characters).
 * @throws {Error} If `derivation` or `pub` is not 64 hex characters.
 */
export function underive_public_key(derivation: string, out_index: number, pub: string): string;
export type KeyPair = {
    /**
     * - 64-character hex secret key.
     */
    sec: string;
    /**
     * - 64-character hex public key.
     */
    pub: string;
};
