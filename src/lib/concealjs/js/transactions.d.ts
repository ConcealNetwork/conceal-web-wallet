/**
 * Transaction scan helpers — `ownsTx` workflow for wallet sync.
 *
 * Receive path: `scan_receive_outputs` per tx, or `scan_receive_outputs_batch` for `ownsTxBatch`.
 * Spend path: JS lookups on precomputed wallet context.
 *
 * @module transactions
 */
export declare const TX_EXTRA_TAG_PADDING = 0;
export declare const TX_EXTRA_TAG_PUBKEY = 1;
export declare const TX_EXTRA_NONCE = 2;
export declare const TX_EXTRA_MERGE_MINING_TAG = 3;
export declare const TX_EXTRA_MESSAGE_TAG = 4;
export declare const TX_EXTRA_MYSTERIOUS_MINERGATE_TAG = 222;
export declare const TX_EXTRA_TTL = 5;
export type TxExtra = {
    /**
     * - Extra field tag byte.
     */
    type: number;
    /**
     * - Payload bytes.
     */
    data: number[];
    /**
     * - True when the declared payload size exceeded the remaining bytes.
     */
    truncated?: boolean;
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
/**
 * @typedef {Object} TxExtra
 * @property {number} type - Extra field tag byte.
 * @property {number[]} data - Payload bytes.
 * @property {boolean} [truncated] - True when the declared payload size exceeded the remaining bytes.
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
 * Never throws on malformed input: a chunk whose declared size exceeds the
 * remaining bytes is returned clamped and flagged `truncated: true`.
 *
 * @param {number[] | Uint8Array} oExtra - Raw extra field bytes.
 * @returns {TxExtra[]}
 */
export declare function parseTxExtra(oExtra: number[] | Uint8Array): TxExtra[];
/**
 * Extract the transaction public key from `extra` hex (first `TX_EXTRA_TAG_PUBKEY`).
 *
 * @param {string} extraHex - Transaction extra field as hex.
 * @returns {string | null} 64-char hex tx public key, `null` if missing or invalid
 */
export declare function extractTxPublicKey(extraHex: string): string | null;
/**
 * Build flat derivation-index / on-chain-key lists for receive scanning.
 * Matches `TransactionsExplorer.ownsTx` vout index rules (type `"02"` vs `"03"`).
 *
 * Malformed output keys (not exactly 64 hex characters, case-insensitive) are
 * silently skipped. `keyIndex` always advances for every key slot — valid or
 * not — for both type `"02"` and `"03"`, matching the reference
 * (`TransactionsExplorer` derives with `iOut` and iterates all keys
 * unconditionally).
 *
 * @param {TxVout[]} vouts
 * @returns {ReceiveOutputChecks}
 */
export declare function buildReceiveOutputChecks(vouts: TxVout[]): ReceiveOutputChecks;
/**
 * Scan vouts for an incoming transfer (single WASM call).
 *
 * @param {string} txPubHex - 64-char hex transaction public key.
 * @param {string} viewSecHex - 64-char hex view secret key.
 * @param {string} spendPubHex - 64-char hex spend public key.
 * @param {TxVout[]} vouts
 * @returns {boolean}
 */
export declare function scanReceiveOutputs(txPubHex: string, viewSecHex: string, spendPubHex: string, vouts: TxVout[]): boolean;
/**
 * Scan vins for spend ownership (JS-only; wallet supplies context sets).
 *
 * @param {TxVin[]} vins
 * @param {TxScanContext} ctx
 * @returns {boolean}
 */
export declare function scanSpendInputs(vins: TxVin[], ctx: TxScanContext): boolean;
/**
 * Returns whether the wallet owns this transaction (receive or spend).
 *
 * @param {TxScanInput} tx
 * @param {TxScanContext} ctx
 * @returns {boolean}
 */
export declare function ownsTx(tx: TxScanInput, ctx: TxScanContext): boolean;
/**
 * Batch `ownsTx` — one WASM receive scan for the whole array, then spend checks in JS.
 *
 * @param {TxScanInput[]} txs
 * @param {TxScanContext} ctx
 * @returns {boolean[]}
 */
export declare function ownsTxBatch(txs: TxScanInput[], ctx: TxScanContext): boolean[];
export type TxSerializeVinTarget = {
    /**
     * - Input type (`"input_to_key"` or `"input_to_deposit_key"`).
     */
    type: string;
    /**
     * - Input amount (uint64; pass large values as strings).
     */
    amount?: number | string;
    /**
     * - Relative ring offsets (`input_to_key`).
     */
    key_offsets?: number[];
    /**
     * - 64-char hex key image (`input_to_key`).
     */
    k_image?: string;
    /**
     * - Global output index (uint32); required for `input_to_deposit_key`.
     */
    outputIndex?: number | string;
    /**
     * - Term in blocks (uint32; `0` = plain multisig); required for `input_to_deposit_key`.
     */
    term?: number | string;
    /**
     * - Expected signature count for `input_to_deposit_key`.
     */
    signatures?: number;
};
export type TxSerializeVoutTargetData = {
    /**
     * - 64-char hex output public key (`txout_to_key`).
     */
    key?: string;
    /**
     * - 64-char hex output keys (`txout_to_deposit_key`).
     */
    keys?: string[];
    /**
     * - Term in blocks (uint32; `0` = plain multisig); required for `txout_to_deposit_key`.
     */
    term?: number | string;
};
export type TxSerializeVoutTarget = {
    /**
     * - Target type (`"txout_to_key"` or `"txout_to_deposit_key"`).
     */
    type: string;
    /**
     * - Target payload.
     */
    data: TxSerializeVoutTargetData;
};
export type TxSerializeVout = {
    /**
     * - Output amount (uint64; pass large values as strings).
     */
    amount: number | string;
    /**
     * - Output target.
     */
    target: TxSerializeVoutTarget;
};
export type TxToSerialize = {
    /**
     * - Transaction version (uint64).
     */
    version: number | string;
    /**
     * - Unlock time / block height (uint64).
     */
    unlock_time: number | string;
    /**
     * - Transaction inputs.
     */
    vin: TxSerializeVinTarget[];
    /**
     * - Transaction outputs.
     */
    vout: TxSerializeVout[];
    /**
     * - `extra` field as an even-length hex string.
     */
    extra: string;
    /**
     * - Per-input ring signatures (omitted when serializing header only).
     */
    signatures: string[][];
};
export type TxSerializeWithHash = {
    /**
     * - Full serialized transaction hex (prefix + signatures).
     */
    raw: string;
    /**
     * - `cn_fast_hash` of the full serialized transaction.
     */
    hash: string;
};
/**
 * Serialize a CryptoNote transaction to broadcast-ready hex (non-RingCT / plain
 * ring-signature path only). Ported byte-for-byte from `CnTransactions.serialize_tx`
 * in conceal-web-wallet's `Cn.ts`.
 *
 * @param {TxToSerialize} tx - Transaction to serialize.
 * @param {boolean} [headerOnly] - When `true`, emit only the prefix (no signatures).
 * @returns {string} Serialized transaction hex.
 */
export declare function serializeTransaction(tx: TxToSerialize, headerOnly?: boolean): string;
/**
 * Compute the transaction prefix hash (`cn_fast_hash` of the header-only serialization).
 * Ported from `CnTransactions.get_tx_prefix_hash`.
 *
 * @param {TxToSerialize} tx - Transaction to hash.
 * @returns {string} 64-char hex prefix hash.
 */
export declare function getTransactionPrefixHash(tx: TxToSerialize): string;
/**
 * Serialize a transaction and compute its full hash.
 * Ported from `CnTransactions.serialize_tx_with_hash`.
 *
 * @param {TxToSerialize} tx - Transaction to serialize.
 * @returns {TxSerializeWithHash}
 */
export declare function serializeTransactionWithHash(tx: TxToSerialize): TxSerializeWithHash;
