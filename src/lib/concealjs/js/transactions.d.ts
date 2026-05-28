/**
 * @typedef {Object} TxExtra
 * @property {number} type - Extra field tag byte.
 * @property {number[]} data - Payload bytes.
 */
/**
 * @typedef {Object} TxVout
 * @property {string} type - Output target type (`"02"` = key, `"03"` = tagged keys).
 * @property {string} [key] - On-chain output public key (type `"02"`).
 * @property {string[]} [keys] - On-chain keys (type `"03"`).
 */
/**
 * @typedef {Object} TxVin
 * @property {string} [k_image] - Key image hex (spend detection).
 * @property {number[]} [key_offsets] - Relative ring offsets (view-only spend detection).
 */
/**
 * @typedef {Object} TxScanInput
 * @property {string} extraHex - Transaction `extra` field as hex.
 * @property {TxVout[]} vouts - Outputs to scan for incoming funds.
 * @property {TxVin[]} [vins] - Inputs for spend / view-only detection.
 */
/**
 * @typedef {Object} TxScanContext
 * @property {string} viewSecretHex - 64-char hex view secret key.
 * @property {string} spendPublicHex - 64-char hex spend public key.
 * @property {string} [spendSecretHex] - Spend secret when wallet can sign; enables key-image path.
 * @property {string[]} [ownedKeyImages] - Key images known to belong to this wallet (spend path).
 * @property {number[]} [knownGlobalOutputIndexes] - Global output indexes owned (view-only path).
 */
/**
 * @typedef {Object} ReceiveOutputChecks
 * @property {number[]} indices - Derivation indices for `derive_public_key`.
 * @property {string[]} keys - On-chain output public keys (64-char hex).
 */
/**
 * Parse transaction extra bytes into tagged chunks (CryptoNote tx_extra).
 *
 * @param {number[] | Uint8Array} oExtra - Raw extra field bytes.
 * @returns {TxExtra[]}
 */
export function parseTxExtra(oExtra: number[] | Uint8Array): TxExtra[];
/**
 * Extract the transaction public key from `extra` hex (first `TX_EXTRA_TAG_PUBKEY`).
 *
 * @param {string} extraHex - Transaction extra field as hex.
 * @returns {string | null} 64-char hex tx public key, or `null` if missing.
 */
export function extractTxPublicKey(extraHex: string): string | null;
/**
 * Build flat derivation-index / on-chain-key lists for receive scanning.
 * Matches `TransactionsExplorer.ownsTx` vout index rules (type `"02"` vs `"03"`).
 *
 * @param {TxVout[]} vouts
 * @returns {ReceiveOutputChecks}
 */
export function buildReceiveOutputChecks(vouts: TxVout[]): ReceiveOutputChecks;
/**
 * Scan vouts for an incoming transfer (single WASM call).
 *
 * @param {string} txPubHex - 64-char hex transaction public key.
 * @param {string} viewSecHex - 64-char hex view secret key.
 * @param {string} spendPubHex - 64-char hex spend public key.
 * @param {TxVout[]} vouts
 * @returns {boolean}
 */
export function scanReceiveOutputs(txPubHex: string, viewSecHex: string, spendPubHex: string, vouts: TxVout[]): boolean;
/**
 * Scan vins for spend ownership (JS-only; wallet supplies context sets).
 *
 * @param {TxVin[]} vins
 * @param {TxScanContext} ctx
 * @returns {boolean}
 */
export function scanSpendInputs(vins: TxVin[], ctx: TxScanContext): boolean;
/**
 * Returns whether the wallet owns this transaction (receive or spend).
 *
 * @param {TxScanInput} tx
 * @param {TxScanContext} ctx
 * @returns {boolean}
 */
export function ownsTx(tx: TxScanInput, ctx: TxScanContext): boolean;
/**
 * Batch `ownsTx` — one WASM receive scan for the whole array, then spend checks in JS.
 *
 * @param {TxScanInput[]} txs
 * @param {TxScanContext} ctx
 * @returns {boolean[]}
 */
export function ownsTxBatch(txs: TxScanInput[], ctx: TxScanContext): boolean[];
export const TX_EXTRA_TAG_PADDING: 0;
export const TX_EXTRA_TAG_PUBKEY: 1;
export const TX_EXTRA_NONCE: 2;
export const TX_EXTRA_MERGE_MINING_TAG: 3;
export const TX_EXTRA_MESSAGE_TAG: 4;
export const TX_EXTRA_MYSTERIOUS_MINERGATE_TAG: 222;
export const TX_EXTRA_TTL: 5;
export type TxExtra = {
    /**
     * - Extra field tag byte.
     */
    type: number;
    /**
     * - Payload bytes.
     */
    data: number[];
};
export type TxVout = {
    /**
     * - Output target type (`"02"` = key, `"03"` = tagged keys).
     */
    type: string;
    /**
     * - On-chain output public key (type `"02"`).
     */
    key?: string;
    /**
     * - On-chain keys (type `"03"`).
     */
    keys?: string[];
};
export type TxVin = {
    /**
     * - Key image hex (spend detection).
     */
    k_image?: string;
    /**
     * - Relative ring offsets (view-only spend detection).
     */
    key_offsets?: number[];
};
export type TxScanInput = {
    /**
     * - Transaction `extra` field as hex.
     */
    extraHex: string;
    /**
     * - Outputs to scan for incoming funds.
     */
    vouts: TxVout[];
    /**
     * - Inputs for spend / view-only detection.
     */
    vins?: TxVin[];
};
export type TxScanContext = {
    /**
     * - 64-char hex view secret key.
     */
    viewSecretHex: string;
    /**
     * - 64-char hex spend public key.
     */
    spendPublicHex: string;
    /**
     * - Spend secret when wallet can sign; enables key-image path.
     */
    spendSecretHex?: string;
    /**
     * - Key images known to belong to this wallet (spend path).
     */
    ownedKeyImages?: string[];
    /**
     * - Global output indexes owned (view-only path).
     */
    knownGlobalOutputIndexes?: number[];
};
export type ReceiveOutputChecks = {
    /**
     * - Derivation indices for `derive_public_key`.
     */
    indices: number[];
    /**
     * - On-chain output public keys (64-char hex).
     */
    keys: string[];
};
