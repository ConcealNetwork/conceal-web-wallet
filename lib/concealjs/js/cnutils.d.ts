/**
 * @param {string} hex
 * @returns {Uint8Array}
 */
export function hextobin(hex: string): Uint8Array;
/**
 * @param {Uint8Array | string} bin
 * @returns {string}
 */
export function bintohex(bin: Uint8Array | string): string;
/**
 * @param {string} hex
 * @returns {string}
 */
export function swapEndian(hex: string): string;
/**
 * @param {string} string
 * @returns {string}
 */
export function swapEndianC(string: string): string;
/**
 * @param {number | string} integer
 * @returns {string}
 */
export function d2h(integer: number | string): string;
/**
 * @param {number | string} integer
 * @returns {string}
 */
export function d2s(integer: number | string): string;
/**
 * @param {string} hex
 * @returns {number}
 */
export function h2d(hex: string): number;
/**
 * @param {number} integer
 * @returns {string}
 */
export function d2b(integer: number): string;
/**
 * @param {string} pub
 * @param {string} sec
 * @returns {string}
 */
export function ge_scalarmult(pub: string, sec: string): string;
/**
 * @param {string} p1
 * @param {string} p2
 * @returns {string}
 */
export function ge_add(p1: string, p2: string): string;
/**
 * @param {string} point
 * @returns {string}
 */
export function ge_neg(point: string): string;
/**
 * @param {string} point1
 * @param {string} point2
 * @returns {string}
 */
export function ge_sub(point1: string, point2: string): string;
/**
 * @param {string} sec
 * @returns {string}
 */
export function sec_key_to_pub(sec: string): string;
/**
 * @param {string} hex
 * @returns {boolean}
 */
export function valid_hex(hex: string): boolean;
/**
 * @param {string} sec
 * @returns {string}
 */
export function ge_scalarmult_base(sec: string): string;
/**
 * @param {string} derivation
 * @param {number} output_index
 * @returns {string}
 */
export function derivation_to_scalar(derivation: string, output_index: number): string;
/**
 * @param {number | string} i
 * @returns {string}
 */
export function encode_varint(i: number | string): string;
/**
 * @param {number | string} i
 * @returns {string}
 */
export function encode_varint_term(i: number | string): string;
/**
 * Keccak-256 of hex-decoded input (`CnUtils.cn_fast_hash` / wallet `keccak_256`).
 *
 * @param {string} input - Even-length hex string.
 * @returns {string} 64-char lowercase hex digest.
 */
export function cn_fast_hash(input: string): string;
/**
 * @param {string} hex1
 * @param {string} hex2
 * @returns {string}
 */
export function hex_xor(hex1: string, hex2: string): string;
/**
 * @param {string} str
 * @param {string} char
 * @returns {string}
 */
export function trimRight(str: string, char: string): string;
/**
 * @param {string} str
 * @param {number} len
 * @param {string} char
 * @returns {string}
 */
export function padLeft(str: string, len: number, char: string): string;
/**
 * @param {string} c
 * @param {string} P
 * @param {string} r
 * @returns {string}
 */
export function ge_double_scalarmult_base_vartime(c: string, P: string, r: string): string;
/**
 * `r·hash_to_ec32(P) + c·I` (wallet postcomp path; needs 32-byte compressed `Pb`).
 *
 * @param {string} r - 64-char hex scalar.
 * @param {string} P - 64-char hex public key (compressed point input to `hash_to_ec32`).
 * @param {string} c - 64-char hex scalar.
 * @param {string} I - 64-char hex point.
 * @returns {string} 64-char hex point.
 */
export function ge_double_scalarmult_postcomp_vartime(r: string, P: string, c: string, I: string): string;
/**
 * @param {number | string} amount
 * @returns {import('./tiers/biginteger.js').JSBigInt[]}
 */
export function decompose_amount_into_digits(amount: number | string): any[];
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
export function decode_rct_ecdh(ecdh: RctEcdh, key: string): RctEcdh;
/**
 * @param {RctEcdh} ecdh
 * @param {string} key
 * @returns {RctEcdh}
 */
export function encode_rct_ecdh(ecdh: RctEcdh, key: string): RctEcdh;
/** @type {Readonly<{ EC_POINT: number }>} */
export const STRUCT_SIZES: Readonly<{
    EC_POINT: number;
}>;
export type RctEcdh = {
    mask: string;
    amount: string;
};
