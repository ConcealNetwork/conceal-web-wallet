/* tslint:disable */
/* eslint-disable */

/**
 * Verifies a ring signature.
 *
 * Port of `crypto::check_ring_signature`.
 */
export function check_ring_signature(prefix_hash_hex: string, key_image_hex: string, pubs_hex: string[], sigs_hex: string[]): boolean;

/**
 * Verifies a standard CryptoNote signature.
 *
 * Port of `crypto::check_signature`.
 */
export function check_signature(prefix_hash_hex: string, pub_hex: string, sig_hex: string): boolean;

/**
 * Verifies a CryptoNote signature in transaction-proof mode (wallet `checkTxProof`).
 *
 * Challenge binds `prefix_hash`, derivation `D`, tx public key `R`, and output key `A`
 * (`A` is not mixed into `X`/`Y`; it is accepted for API parity with the wallet).
 * Uses `Y = c·D + r·G` like `CnNativeBride.checkTxProof`. Invalid hex → `false`.
 */
export function check_tx_proof(prefix_hash_hex: string, r_pub_hex: string, a_pub_hex: string, d_pub_hex: string, sig_hex: string): boolean;

/**
 * cn_fast_hash: Keccak-256 of hex-decoded input.
 * Matches `CnUtils.cn_fast_hash(hex)` in Cn.ts.
 */
export function cn_fast_hash(data_hex: string): string;

/**
 * create_address: full wallet key generation from a 32-byte reduced seed.
 * Returns `{spend:{sec,pub}, view:{sec,pub}, public_addr}`.
 * Matches `Cn.create_address(seed)` for 64-char hex input.
 */
export function create_address(seed_hex: string): any;

/**
 * decode_address: validate and extract spend/view public keys from an address string.
 * Returns `{spend: hex, view: hex, intPaymentId: null}`.
 * Matches `Cn.decode_address(address)`.
 */
export function decode_address(address: string): any;

/**
 * derive_public_key: base_pub + derivation_to_scalar(derivation, index) × B.
 * Matches `CnNativeBride.derive_public_key(derivation, index, pub)`.
 */
export function derive_public_key(derivation_hex: string, out_index: number, base_pub_hex: string): string;

/**
 * derive_secret_key: sc_add(base_sec, derivation_to_scalar(derivation, index)).
 * Matches `CnNativeBride.derive_secret_key(derivation, index, sec)`.
 */
export function derive_secret_key(derivation_hex: string, out_index: number, base_sec_hex: string): string;

/**
 * ge_add: point_a + point_b (Edwards addition).
 */
export function ge_add(a_hex: string, b_hex: string): string;

/**
 * ge_frombytes_vartime: validate and canonicalise a compressed Edwards point.
 */
export function ge_frombytes_vartime(point_hex: string): string;

/**
 * ge_mul8: multiply point by cofactor 8.
 */
export function ge_mul8(point_hex: string): string;

/**
 * ge_p3_tobytes: alias for ge_tobytes.
 */
export function ge_p3_tobytes(point_hex: string): string;

/**
 * ge_scalarmult: point × scalar.
 */
export function ge_scalarmult(point_hex: string, scalar_hex: string): string;

/**
 * ge_scalarmult_base: scalar × base point.  Returns compressed public key hex.
 * Also serves as `sec_key_to_pub` — matches nacl.ll.ge_scalarmult_base behaviour.
 */
export function ge_scalarmult_base(scalar_hex: string): string;

/**
 * ge_tobytes / ge_p3_tobytes: returns the compressed point (validates it is on curve).
 */
export function ge_tobytes(point_hex: string): string;

/**
 * generate_key_derivation: 8 × (sec_scalar × pub_point).
 * Matches `CnNativeBride.generate_key_derivation(pub, sec)`.
 */
export function generate_key_derivation(pub_hex: string, sec_hex: string): string;

/**
 * Computes a CryptoNote key image: `sec × hash_to_ec(pub)` using the internal `ge_p3`
 * from [`hash_to_ec160`], then compresses to 32 bytes.
 *
 * Port of conceal-core `crypto_ops::generate_key_image`.
 * Wallet equivalent: `CnNativeBride.generate_key_image_2(pub, sec)`.
 *
 * # Parameters
 * - `pub_hex` — 64-char hex (32-byte public key).
 * - `sec_hex` — 64-char hex (32-byte secret key; must be canonical per `sc_check`).
 *
 * # Returns
 * 64-char hex key image.
 *
 * # Errors
 * Invalid hex length/content, or non-canonical `sec_hex`.
 */
export function generate_key_image(pub_hex: string, sec_hex: string): string;

/**
 * generate_keys: sec = sc_reduce32(seed), pub = ge_scalarmult_base(sec).
 * Returns `{sec: hex, pub: hex}`.  Matches `Cn.generate_keys(seed)`.
 */
export function generate_keys(seed_hex: string): any;

/**
 * Ring signature for one input: one 128-char hex signature per ring member.
 *
 * Port of `crypto::generate_ring_signature`. `key_image` must match `sec` at
 * `sec_index` (`generate_key_image(pub, sec)`). `pubs_hex` is the ring public keys.
 *
 * # Parameters
 * - `prefix_hash_hex` — 64-char hex message hash.
 * - `key_image_hex` — 64-char hex key image.
 * - `pubs_hex` — array of 64-char hex public keys (ring size = length).
 * - `sec_hex` — 64-char hex secret for the real input at `sec_index`.
 * - `sec_index` — index of the signing key in `pubs_hex`.
 *
 * # Returns
 * Array of 128-char hex signatures (length = ring size).
 */
export function generate_ring_signature(prefix_hash_hex: string, key_image_hex: string, pubs_hex: string[], sec_hex: string, sec_index: number): Array<any>;

/**
 * Standard CryptoNote signature (`c || r`), 128-char hex.
 *
 * Port of `crypto::generate_signature`. `prefix_hash` is typically a transaction
 * or block hash; `pub` / `sec` must be a matching key pair.
 *
 * # Parameters
 * - `prefix_hash_hex` — 64-char hex (32-byte hash).
 * - `pub_hex` — 64-char hex spend/output public key.
 * - `sec_hex` — 64-char hex secret key (canonical scalar).
 *
 * # Returns
 * 128-char hex signature.
 */
export function generate_signature(prefix_hash_hex: string, pub_hex: string, sec_hex: string): string;

/**
 * Deprecated alias for [`hash_to_ec32`]. Prefer `hash_to_ec32` or `hash_to_ec160` explicitly.
 */
export function hash_to_ec(pub_hex: string): string;

/**
 * Maps a public key to an Edwards point: `ge_mul8(ge_fromfe(cn_fast_hash(pub)))`.
 *
 * # Parameters
 * - `pub_hex` — 64-char hex (32-byte public key).
 *
 * # Returns
 * 320-char hex: 160-byte `ge_p3` (`STRUCT_SIZES.GE_P3` in the web wallet).
 *
 * # When to use
 * Ring signatures and other code that passes a **`ge_p3` buffer** into `ge_scalarmult`
 * (wallet `CnUtils.hash_to_ec` / `CnNativeBride.hash_to_ec`).
 */
export function hash_to_ec160(pub_hex: string): string;

/**
 * Same curve map as [`hash_to_ec160`], but returns a **32-byte compressed** point.
 *
 * # Parameters
 * - `pub_hex` — 64-char hex (32-byte public key).
 *
 * # Returns
 * 64-char hex compressed Edwards point (`ge_p3_tobytes` of the internal `ge_p3`).
 *
 * # When to use
 * `ge_double_scalarmult_postcomp_vartime`, key-image helpers, and any API that expects
 * a normal 32-byte point (wallet `CnNativeBride.hash_to_ec_2`).
 */
export function hash_to_ec32(pub_hex: string): string;

/**
 * hash_to_scalar: cn_fast_hash then sc_reduce32.
 * Matches `Cn.hash_to_scalar(hex)` in Cn.ts.
 */
export function hash_to_scalar(data_hex: string): string;

/**
 * sc_0: returns a zero scalar (32 zero bytes as hex).
 */
export function sc_0(): string;

/**
 * sc_add: (a + b) mod l.
 */
export function sc_add(a_hex: string, b_hex: string): string;

/**
 * sc_check: returns true if the scalar is canonical (< group order l).
 */
export function sc_check(hex: string): boolean;

/**
 * sc_mulsub: (c - a*b) mod l.
 */
export function sc_mulsub(a_hex: string, b_hex: string, c_hex: string): string;

/**
 * sc_reduce32: reduce a 32-byte scalar mod the Ed25519 group order.
 */
export function sc_reduce32(hex: string): string;

/**
 * sc_sub: (a - b) mod l.
 */
export function sc_sub(a_hex: string, b_hex: string): string;

/**
 * One WASM call: `generate_key_derivation` then `derive_public_key` for each output.
 * `output_indices[i]` is the derivation index; `output_keys_hex[i]` is the on-chain key (64 hex).
 */
export function scan_receive_outputs(tx_pub_hex: string, view_sec_hex: string, spend_pub_hex: string, output_indices: Uint32Array, output_keys_hex: string[]): boolean;

/**
 * Batch receive scan: one WASM call for many transactions (shared view/spend keys).
 *
 * `tx_offsets.len() == tx_pub_hex.len() + 1`; slice `i` is
 * `output_indices[tx_offsets[i]..tx_offsets[i+1]]`. Empty `tx_pub_hex[i]` → `0`.
 * Returns `1` / `0` per tx (`Vec<u32>` for wasm-bindgen; map to boolean in JS).
 */
export function scan_receive_outputs_batch(view_sec_hex: string, spend_pub_hex: string, tx_pub_hex: string[], output_indices: Uint32Array, output_keys_hex: string[], tx_offsets: Uint32Array): Uint32Array;
