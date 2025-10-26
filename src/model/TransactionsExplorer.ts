/**
 *	   Copyright (c) 2018, Gnock
 *     Copyright (c) 2014-2018, MyMonero.com
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Masari Project
 *     Copyright (c) 2022, The Karbo Developers
 *     Copyright (c) 2022 - 2025, Conceal Devs
 *     Copyright (c) 2022 - 2025, Conceal Network
 *
 *     All rights reserved.
 *     Redistribution and use in source and binary forms, with or without modification,
 *     are permitted provided that the following conditions are met:
 *
 *     ==> Redistributions of source code must retain the above copyright notice,
 *         this list of conditions and the following disclaimer.
 *     ==> Redistributions in binary form must reproduce the above copyright notice,
 *         this list of conditions and the following disclaimer in the documentation
 *         and/or other materials provided with the distribution.
 *     ==> Neither the name of Qwertycoin nor the names of its contributors
 *         may be used to endorse or promote products derived from this software
 *          without specific prior written permission.
 *
 *     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 *     "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 *     LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 *     A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *     CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *     EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *     PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *     PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *     LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *     NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Declare global config type
declare var config: {
  debug: boolean;
  apiUrl: string[];
  nodeList: string[];
  publicNodes: string;
  mainnetExplorerUrl: string;
  mainnetExplorerUrlHash: string;
  mainnetExplorerUrlBlock: string;
  testnetExplorerUrl: string;
  testnetExplorerUrlHash: string;
  testnetExplorerUrlBlock: string;
  testnet: boolean;
  coinUnitPlaces: number;
  txMinConfirms: number;
  txCoinbaseMinConfirms: number;
  coinFee: number;
  maxBlockNumber: number;
  depositMinTermBlock: number;
  depositMaxTermMonth: number;
  depositRateV3: number[];
  depositHeightV3: number;
  [key: string]: any;
};

import { Wallet } from "./Wallet";
import { MathUtil } from "./MathUtil";
import { JSChaCha8 } from "./ChaCha8";
import { Cn, CnNativeBride, CnRandom, CnTransactions, CnUtils } from "./Cn";
import { RawDaemon_Transaction, RawDaemon_Out } from "./blockchain/BlockchainExplorer";
import { Transaction, TransactionData, Deposit, TransactionIn, TransactionOut } from "./Transaction";
import { InterestCalculator } from "./Interest";
import { Currency } from "./Currency";
import { decode as varintDecode } from "./Varint";

export const TX_EXTRA_PADDING_MAX_COUNT = 255;
export const TX_EXTRA_NONCE_MAX_COUNT = 255;

export const TX_EXTRA_TAG_PADDING = 0x00;
export const TX_EXTRA_TAG_PUBKEY = 0x01;
export const TX_EXTRA_NONCE = 0x02;
export const TX_EXTRA_MERGE_MINING_TAG = 0x03;
export const TX_EXTRA_MESSAGE_TAG = 0x04;
export const TX_EXTRA_MYSTERIOUS_MINERGATE_TAG = 0xde;

export const TX_EXTRA_NONCE_PAYMENT_ID = 0x00;
export const TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID = 0x01;

export const TX_EXTRA_TTL = 0x05;

export const TX_EXTRA_MESSAGE_CHECKSUM_SIZE = 4;

type RawOutForTx = {
  keyImage: string;
  amount: number;
  public_key: string;
  index: number;
  global_index: number;
  tx_pub_key: string;
  type?: string;
  required_signatures?: number;
  keys: string[];
};

type TxExtra = {
  type: number;
  data: number[];
};

export class TransactionsExplorer {
  static parseExtra(oExtra: number[]): TxExtra[] {
    let extra = oExtra.slice();
    let extras: TxExtra[] = [];
    let hasFoundPubKey = false;

    while (extra.length > 0) {
      try {
        let extraSize = 0;
        let startOffset = 0;

        if (extra[0] === TX_EXTRA_NONCE || extra[0] === TX_EXTRA_MERGE_MINING_TAG || extra[0] === TX_EXTRA_MYSTERIOUS_MINERGATE_TAG) {
          extraSize = extra[1];
          startOffset = 2;
        } else if (extra[0] === TX_EXTRA_TAG_PUBKEY) {
          extraSize = 32;
          startOffset = 1;
          hasFoundPubKey = true;
        } else if (extra[0] === TX_EXTRA_MESSAGE_TAG) {
          extraSize = extra[1];
          startOffset = 2;
        } else if (extra[0] === TX_EXTRA_TTL) {
          extraSize = extra[1];
          startOffset = 2;
        } else if (extra[0] === TX_EXTRA_TAG_PADDING) {
          // do nothing
        }

        if (extraSize === 0) {
          if (!hasFoundPubKey) {
            throw "Invalid extra size " + extra[0];
          }
          break;
        }

        if (startOffset > 0 && extraSize > 0) {
          let data = extra.slice(startOffset, startOffset + extraSize);
          extras.push({
            type: extra[0],
            data: data,
          });
          extra = extra.slice(startOffset + extraSize);
        } else if (!extraSize) {
          logDebugMsg("Corrupt extra skipping it...");
          break;
        }
      } catch (err) {
        logDebugMsg("Error in parsing extra", err);
        break;
      }
    }

    // extras array
    return extras;
  }

  static isMinerTx(rawTransaction: RawDaemon_Transaction) {
    if (!Array.isArray(rawTransaction.vout) || rawTransaction.vin.length > 0) {
      return false;
    }

    if (!Array.isArray(rawTransaction.vout) || rawTransaction.vout.length === 0) {
      console.error("Weird tx !", rawTransaction);
      return false;
    }

    try {
      return rawTransaction.vout[0].amount !== 0;
    } catch (err) {
      return false;
    }
  }

  static ownsTx(rawTransaction: RawDaemon_Transaction, wallet: Wallet): Boolean {
    let tx_pub_key = "";

    let txExtras = [];
    try {
      let hexExtra: number[] = [];
      let uint8Array = CnUtils.hextobin(rawTransaction.extra);

      for (let i = 0; i < uint8Array.byteLength; i++) {
        hexExtra[i] = uint8Array[i];
      }

      txExtras = this.parseExtra(hexExtra);
    } catch (e) {
      console.error("Error when scanning transaction on block " + rawTransaction.height, e);
      return false;
    }

    for (let extra of txExtras) {
      if (extra.type === TX_EXTRA_TAG_PUBKEY) {
        for (let i = 0; i < 32; ++i) {
          tx_pub_key += String.fromCharCode(extra.data[i]);
        }
        break;
      }
    }

    if (tx_pub_key === "") {
      console.error(`tx_pub_key === null`, rawTransaction.height, rawTransaction.hash);
      return false;
    }

    tx_pub_key = CnUtils.bintohex(tx_pub_key);

    let derivation = null;
    try {
      derivation = CnNativeBride.generate_key_derivation(tx_pub_key, wallet.keys.priv.view);
    } catch (e) {
      console.error("UNABLE TO CREATE DERIVATION", e);
      return false;
    }

    if (!derivation) {
      console.error("UNABLE TO CREATE DERIVATION");
      return false;
    }

    let keyIndex: number = 0;
    for (let iOut = 0; iOut < rawTransaction.vout.length; iOut++) {
      let out = rawTransaction.vout[iOut];
      let txout_k = out.target.data;
      if (out.target.type == "02" && typeof txout_k.key !== "undefined") {
        let publicEphemeral = CnNativeBride.derive_public_key(derivation, keyIndex, wallet.keys.pub.spend);
        if (txout_k.key == publicEphemeral) {
          logDebugMsg("Found our tx...");
          return true;
        }
        ++keyIndex;
      } else if (out.target.type == "03" && typeof txout_k.keys !== "undefined") {
        for (let iKey = 0; iKey < txout_k.keys.length; iKey++) {
          let key = txout_k.keys[iKey];
          let publicEphemeral = CnNativeBride.derive_public_key(derivation, iOut, wallet.keys.pub.spend);
          if (key == publicEphemeral) {
            return true;
          }
          ++keyIndex;
        }
      }
    }

    //check if no read only wallet
    if (wallet.keys.priv.spend !== null && wallet.keys.priv.spend !== "") {
      let keyImages = wallet.getTransactionKeyImages();
      for (let iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
        let vin = rawTransaction.vin[iIn];
        if (vin.value && keyImages.indexOf(vin.value.k_image) !== -1) {
          let walletOuts = wallet.getAllOuts();
          for (let ut of walletOuts) {
            if (ut.keyImage == vin.value.k_image) {
              return true;
            }
          }
        }
      }
    } else {
      let txOutIndexes = wallet.getTransactionOutIndexes();
      for (let iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
        let vin = rawTransaction.vin[iIn];

        if (!vin.value) {
          continue;
        }

        let absoluteOffets = vin.value.key_offsets.slice();
        for (let i = 1; i < absoluteOffets.length; ++i) {
          absoluteOffets[i] += absoluteOffets[i - 1];
        }

        let ownTx = -1;
        for (let index of absoluteOffets) {
          if (txOutIndexes.indexOf(index) !== -1) {
            ownTx = index;
            break;
          }
        }

        if (ownTx !== -1) {
          let txOut = wallet.getOutWithGlobalIndex(ownTx);

          if (txOut !== null) {
            return true;
          }
        }
      }
    }

    return false;
  }

  static decryptMessage(index: number, txPubKey: string, recepientSecretSpendKey: string, rawMessage: string): string | any {
    let decryptedMessage: string = "";
    let mlen: number = rawMessage.length / 2;

    if (mlen < TX_EXTRA_MESSAGE_CHECKSUM_SIZE) {
      return null;
    }

    let derivation: string;
    try {
      derivation = CnNativeBride.generate_key_derivation(txPubKey, recepientSecretSpendKey);
    } catch (e) {
      console.error("UNABLE TO CREATE DERIVATION", e);
      return null;
    }

    let magick1: string = "80";
    let magick2: string = "00";
    let keyData: string = derivation + magick1 + magick2;

    let hash: string = CnUtils.cn_fast_hash(keyData);
    let hashBuf: Uint8Array = CnUtils.hextobin(hash);

    let nonceBuf = new Uint8Array(12);
    for (let i = 0; i < 12; i++) {
      nonceBuf.set([index / 0x100 ** i], 11 - i);
    }

    // make a binary array out of raw message
    let rawMessArr = CnUtils.hextobin(rawMessage);

    // typescripted chacha
    const cha = new JSChaCha8(hashBuf, nonceBuf);
    let _buf = cha.decrypt(rawMessArr);

    // decode the buffer from chacha8 with text decoder
    decryptedMessage = new TextDecoder().decode(_buf);

    mlen -= TX_EXTRA_MESSAGE_CHECKSUM_SIZE;
    for (let i = 0; i < TX_EXTRA_MESSAGE_CHECKSUM_SIZE; i++) {
      if (_buf[mlen + i] != 0) {
        return null;
      }
    }

    return decryptedMessage.slice(0, -TX_EXTRA_MESSAGE_CHECKSUM_SIZE);
  }

  static parse(rawTransaction: RawDaemon_Transaction, wallet: Wallet): TransactionData | null {
    let transactionData: TransactionData | null = null;
    let transaction: Transaction | null = null;
    let withdrawals: Deposit[] = [];
    let deposits: Deposit[] = [];

    let tx_pub_key = "";
    let paymentId: string | null = null;
    let rawMessage: string = "";
    let ttl: number = 0;

    let txExtras = [];
    try {
      let hexExtra: number[] = [];
      let uint8Array = CnUtils.hextobin(rawTransaction.extra);

      for (let i = 0; i < uint8Array.byteLength; i++) {
        hexExtra[i] = uint8Array[i];
      }

      txExtras = this.parseExtra(hexExtra);
    } catch (e) {
      console.error("Error when scanning transaction on block " + rawTransaction.height, e);
      return null;
    }

    for (let extra of txExtras) {
      if (extra.type === TX_EXTRA_TAG_PUBKEY) {
        for (let i = 0; i < 32; ++i) {
          tx_pub_key += String.fromCharCode(extra.data[i]);
        }
        break;
      }
    }

    if (tx_pub_key === "") {
      console.error(`tx_pub_key === null`, rawTransaction.height, rawTransaction.hash);
      return null;
    }

    tx_pub_key = CnUtils.bintohex(tx_pub_key);
    let encryptedPaymentId: string | null = null;
    let extraIndex: number = 0;

    for (let extra of txExtras) {
      if (extra.type === TX_EXTRA_NONCE) {
        if (extra.data[0] === TX_EXTRA_NONCE_PAYMENT_ID) {
          paymentId = "";
          for (let i = 1; i < extra.data.length; ++i) {
            paymentId += String.fromCharCode(extra.data[i]);
          }
          paymentId = CnUtils.bintohex(paymentId);
          //break;
        } else if (extra.data[0] === TX_EXTRA_NONCE_ENCRYPTED_PAYMENT_ID) {
          encryptedPaymentId = "";
          for (let i = 1; i < extra.data.length; ++i) {
            encryptedPaymentId += String.fromCharCode(extra.data[i]);
          }
          encryptedPaymentId = CnUtils.bintohex(encryptedPaymentId);
          //break;
        }
      } else if (extra.type === TX_EXTRA_MESSAGE_TAG) {
        // TODO: Only extract message if not a remote node fee transaction
        for (let i = 0; i < extra.data.length; ++i) {
          rawMessage += String.fromCharCode(extra.data[i]);
        }
        rawMessage = CnUtils.bintohex(rawMessage);
      } else if (extra.type === TX_EXTRA_TTL) {
        let rawTTL: string = "";
        for (let i = 0; i < extra.data.length; ++i) {
          rawTTL += String.fromCharCode(extra.data[i]);
        }
        let ttlStr = CnUtils.bintohex(rawTTL);
        let uint8Array = CnUtils.hextobin(ttlStr);
        ttl = varintDecode(uint8Array);
      }
      extraIndex++;
    }

    let derivation = null;
    try {
      derivation = CnNativeBride.generate_key_derivation(tx_pub_key, wallet.keys.priv.view);
    } catch (e) {
      console.error("UNABLE TO CREATE DERIVATION", e);
      return null;
    }

    let outs: TransactionOut[] = [];
    let ins: TransactionIn[] = [];

    for (let iOut = 0; iOut < rawTransaction.vout.length; iOut++) {
      let out = rawTransaction.vout[iOut];
      let txout_k = out.target.data;
      let amount: number = 0;
      try {
        amount = out.amount;
      } catch (e) {
        console.error(e);
        continue;
      }

      let output_idx_in_tx = iOut;
      let generated_tx_pubkey = CnNativeBride.derive_public_key(derivation, output_idx_in_tx, wallet.keys.pub.spend);

      // check if generated public key matches the current output's key
      let mine_output: boolean = false;
      if (out.target.type == "02" && typeof txout_k.key !== "undefined") {
        mine_output = txout_k.key == generated_tx_pubkey;
      } else if (out.target.type == "03" && typeof txout_k.keys !== "undefined") {
        for (let iKey = 0; iKey < txout_k.keys.length; iKey++) {
          if (txout_k.keys[iKey] == generated_tx_pubkey) {
            mine_output = true;
          }
        }
      }

      if (mine_output) {
        let transactionOut = new TransactionOut();
        if (typeof rawTransaction.global_index_start !== "undefined")
          transactionOut.globalIndex = rawTransaction.output_indexes[output_idx_in_tx];
        else transactionOut.globalIndex = output_idx_in_tx;
        transactionOut.amount = amount;

        if (out.target.type == "02" && typeof txout_k.key !== "undefined") {
          transactionOut.pubKey = txout_k.key;
          transactionOut.type = "02";
        } else if (out.target.type == "03" && typeof txout_k.keys !== "undefined") {
          transactionOut.pubKey = generated_tx_pubkey; // assume
          transactionOut.type = "03";

          if (out.target.data && out.target.data.term) {
            let deposit = new Deposit();
            if (typeof rawTransaction.height !== "undefined") deposit.blockHeight = rawTransaction.height;
            if (typeof rawTransaction.hash !== "undefined") deposit.txHash = rawTransaction.hash;
            if (typeof rawTransaction.ts !== "undefined") deposit.timestamp = rawTransaction.ts;
            deposit.amount = transactionOut.amount;
            deposit.term = out.target.data.term;
            if (rawTransaction.output_indexes && typeof rawTransaction.output_indexes[iOut] !== "undefined") {
              deposit.globalOutputIndex = rawTransaction.output_indexes[iOut];
            } else {
              deposit.globalOutputIndex = output_idx_in_tx;
            }
            deposit.indexInVout = iOut;
            // Extract keys from the transaction output target data
            if (out.target.data.keys && Array.isArray(out.target.data.keys)) {
              deposit.keys = out.target.data.keys;
            }
            deposit.txPubKey = tx_pub_key; // Reuse the already extracted transaction public key
            // Calculate the interest for this deposit
            deposit.interest = InterestCalculator.calculateInterest(deposit.amount, deposit.term, deposit.blockHeight);
            deposits.push(deposit);
          }
        }
        transactionOut.outputIdx = output_idx_in_tx;
        /*
         if (!minerTx) {
           transactionOut.rtcOutPk = rawTransaction.rct_signatures.outPk[output_idx_in_tx];
           transactionOut.rtcMask = rawTransaction.rct_signatures.ecdhInfo[output_idx_in_tx].mask;
           transactionOut.rtcAmount = rawTransaction.rct_signatures.ecdhInfo[output_idx_in_tx].amount;
         }
         */
        if (wallet.keys.priv.spend !== null && wallet.keys.priv.spend !== "") {
          let m_key_image = CnTransactions.generate_key_image_helper(
            {
              view_secret_key: wallet.keys.priv.view,
              spend_secret_key: wallet.keys.priv.spend,
              public_spend_key: wallet.keys.pub.spend,
            },
            tx_pub_key,
            output_idx_in_tx,
            derivation
          );

          transactionOut.keyImage = m_key_image.key_image;
          transactionOut.ephemeralPub = m_key_image.ephemeral_pub;
        }

        outs.push(transactionOut);
      } //  if (mine_output)
    }

    //check if no read only wallet
    if (wallet.keys.priv.spend !== null && wallet.keys.priv.spend !== "") {
      let keyImages = wallet.getTransactionKeyImages();
      for (let iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
        let vin = rawTransaction.vin[iIn];
        let wasAdded = false;

        if (vin.value && vin.value.k_image && keyImages.indexOf(vin.value.k_image) !== -1) {
          let walletOuts = wallet.getAllOuts();

          for (let ut of walletOuts) {
            if (wasAdded) {
              console.log(ut.keyImage, "=", vin.value.k_image);
            }

            if (ut.keyImage == vin.value.k_image) {
              let transactionIn = new TransactionIn();
              transactionIn.amount = ut.amount;
              transactionIn.keyImage = ut.keyImage;

              // check if its a withdrawal
              if (vin.type == "03") {
                if (vin.value && vin.value.term) {
                  let withdrawal = new Deposit();
                  withdrawal.globalOutputIndex = vin.value && vin.value.outputIndex ? vin.value.outputIndex : 0;
                  if (typeof rawTransaction.height !== "undefined") withdrawal.blockHeight = rawTransaction.height;
                  if (typeof rawTransaction.hash !== "undefined") withdrawal.txHash = rawTransaction.hash;
                  if (typeof rawTransaction.ts !== "undefined") withdrawal.timestamp = rawTransaction.ts;
                  withdrawal.term = vin.value && vin.value.term ? vin.value.term : 0;
                  withdrawal.amount = transactionIn.amount;
                  withdrawals.push(withdrawal);
                  wasAdded = true;
                }
              }

              ins.push(transactionIn);
              break;
            }
          }
        }

        // add the withdrawal if it was not yet processed
        if (!wasAdded && vin.type == "03") {
          let transactionIn = new TransactionIn();
          transactionIn.type = "03"; // Set type explicitly for withdrawal
          transactionIn.term = vin.value && vin.value.term ? vin.value.term : 0;
          if (vin.value && vin.value.amount) {
            transactionIn.amount = parseInt(vin.value.amount);
          }
          // Add the transaction input to the array
          ins.push(transactionIn);

          let withdrawal = new Deposit();
          if (typeof rawTransaction.ts !== "undefined") withdrawal.timestamp = rawTransaction.ts;
          if (typeof rawTransaction.hash !== "undefined") withdrawal.txHash = rawTransaction.hash;
          if (typeof rawTransaction.height !== "undefined") withdrawal.blockHeight = rawTransaction.height;
          if (vin.value && vin.value.amount) withdrawal.amount = parseInt(vin.value?.amount);
          withdrawal.globalOutputIndex = vin.value && vin.value.outputIndex ? vin.value.outputIndex : 0;
          withdrawal.term = vin.value && vin.value.term ? vin.value.term : 0;
          withdrawals.push(withdrawal);
          wasAdded = true;
        }
      }
    } else {
      let txOutIndexes = wallet.getTransactionOutIndexes();
      for (let iIn = 0; iIn < rawTransaction.vin.length; ++iIn) {
        let vin = rawTransaction.vin[iIn];

        if (!vin.value) continue;

        let absoluteOffets = vin.value.key_offsets.slice();
        for (let i = 1; i < absoluteOffets.length; ++i) {
          absoluteOffets[i] += absoluteOffets[i - 1];
        }

        let ownTx = -1;
        for (let index of absoluteOffets) {
          if (txOutIndexes.indexOf(index) !== -1) {
            ownTx = index;
            break;
          }
        }

        if (ownTx !== -1) {
          let txOut = wallet.getOutWithGlobalIndex(ownTx);
          if (txOut !== null) {
            let transactionIn = new TransactionIn();
            transactionIn.amount = -txOut.amount;
            transactionIn.keyImage = txOut.keyImage;

            // check if its a withdrawal
            if (vin.type == "03") {
              if (vin.value && vin.value.term) {
              }
            }

            ins.push(transactionIn);
          }
        }
      }
    }

    if (outs.length > 0 || ins.length) {
      transactionData = new TransactionData();
      transaction = new Transaction();

      if (typeof rawTransaction.height !== "undefined") transaction.blockHeight = rawTransaction.height;
      if (typeof rawTransaction.ts !== "undefined") transaction.timestamp = rawTransaction.ts;
      if (typeof rawTransaction.hash !== "undefined") transaction.hash = rawTransaction.hash;

      transaction.txPubKey = tx_pub_key;

      if (paymentId !== null) transaction.paymentId = paymentId;
      if (encryptedPaymentId !== null) {
        transaction.paymentId = Cn.decrypt_payment_id(encryptedPaymentId, tx_pub_key, wallet.keys.priv.view);
      }

      if (rawTransaction.vin[0].type === "ff") {
        transaction.fees = 0;
      } else {
        transaction.fees = rawTransaction.fee;
      }

      transaction.fusion =
        rawTransaction.vin.length > Currency.fusionTxMinInputCount &&
        rawTransaction.vout.length <= config.maxFusionOutputs &&
        rawTransaction.vin.length / rawTransaction.vout.length > config.fusionTxMinInOutCountRatio &&
        rawTransaction.vin.some((vin) => vin.type != "03") &&
        rawTransaction.vout.some((vout) => vout.target.type != "03") &&
        (transaction.fees === 0 || transaction.fees === parseInt(config.minimumFee_V2));

      // fill the transaction info
      transaction.outs = outs;
      transaction.ins = ins;

      // assing transaction, deposits etc... to wrapper
      transactionData.transaction = transaction;
      transactionData.withdrawals = withdrawals;
      transactionData.deposits = deposits;

      if (rawMessage !== "") {
        // decode message
        try {
          let message: string = this.decryptMessage(extraIndex, tx_pub_key, wallet.keys.priv.spend, rawMessage);
          transaction.message = message;
        } catch (e) {
          console.error("ERROR IN DECRYPTING MESSAGE: ", e);
        }
      }
    }
    if (transaction && typeof ttl !== "undefined") {
      transaction.ttl = ttl;
    }
    return transactionData;
  }

  static formatWalletOutsForTx(wallet: Wallet, blockchainHeight: number): RawOutForTx[] {
    let allOuts = [];
    let unspentOuts = [];

    //rct=rct_outpk + rct_mask + rct_amount
    // {"amount"          , out.amount},
    // {"public_key"      , out.out_pub_key},
    // {"index"           , out.out_index},
    // {"global_index"    , out.global_index},
    // {"rct"             , rct},
    // {"tx_id"           , out.tx_id},
    // {"tx_hash"         , tx.hash},
    // {"tx_prefix_hash"  , tx.prefix_hash},
    // {"tx_pub_key"      , tx.tx_pub_key},
    // {"timestamp"       , static_cast<uint64_t>(out.timestamp)},
    // {"height"          , tx.height},
    // {"spend_key_images", json::array()}

    for (let tr of wallet.getAll()) {
      //todo improve to take into account miner tx ... well, if the user is smart enough to mine, he should be able to toggle the "Read miner tx" option in settings.
      //only add outs unlocked
      if (!tr.isConfirmed(blockchainHeight - 2)) {
        // -2 extra buffer
        continue;
      }
      for (let out of tr.outs) {
        // Skip type "03" outputs (deposit outputs) for regular transactions
        // These should only be used for withdrawals, not regular sends
        if (out.type === "03") {
          continue;
        }

        allOuts.push({
          keyImage: out.keyImage,
          amount: out.amount,
          public_key: out.pubKey,
          index: out.outputIdx,
          global_index: out.globalIndex,
          tx_pub_key: tr.txPubKey,
          keys: [],
        });
      }
    }
    // Create a set of all key images that have been spent (used as inputs)
    const spentKeyImages = new Set<string>();
    for (let tr of wallet.getAll().concat(wallet.txsMem)) {
      for (let i of tr.ins) {
        if (i.keyImage) {
          spentKeyImages.add(i.keyImage);
        }
      }
    }
    // Filter out outputs that have already been spent
    unspentOuts = allOuts.filter((out) => !spentKeyImages.has(out.keyImage));
    return unspentOuts;
  }

  static createRawTx(
    dsts: { address: string; amount: number }[],
    wallet: Wallet,
    rct: boolean,
    usingOuts: RawOutForTx[],
    pid_encrypt: boolean,
    mix_outs: any[] = [],
    mixin: number,
    neededFee: number,
    payment_id: string,
    message: string,
    ttl: number,
    transactionType: string,
    term: number
  ): Promise<{
    raw: { hash: string; prvkey: string; raw: string };
    signed: any;
  }> {
    return new Promise<{
      raw: { hash: string; prvkey: string; raw: string };
      signed: any;
    }>(function (resolve, reject) {
      let signed;
      try {
        //need to get viewkey for encrypting here, because of splitting and sorting
        let realDestViewKey = undefined;
        if (pid_encrypt) {
          realDestViewKey = Cn.decode_address(dsts[0].address).view;
        }
        // getting message destination address for encrypting here, before splitting and sorting
        let messageTo = undefined;
        if (message) {
          messageTo = dsts[0].address;
        }

        //let splittedDsts = CnTransactions.decompose_tx_destinations(dsts, rct);
        let splittedDsts;
        if (transactionType === "deposit") {
          // For deposit transactions, keep the first destination intact. At this stage, dsts[0].amount is the deposit amount. and will be type "03"
          let depositDst = dsts[0];
          let otherDsts = dsts.slice(1);

          // Only decompose the non-deposit destinations, those destinations will be type "02"
          let decomposedOtherDsts = CnTransactions.decompose_tx_destinations(otherDsts, rct);

          // Combine back with the deposit destination first
          splittedDsts = [depositDst].concat(decomposedOtherDsts); //then we could sort the splittedDsts by amount ?
        } else {
          // Regular transaction - decompose all destinations
          splittedDsts = CnTransactions.decompose_tx_destinations(dsts, rct);
        }

        signed = CnTransactions.create_transaction(
          {
            spend: wallet.keys.pub.spend,
            view: wallet.keys.pub.view,
          },
          {
            spend: wallet.keys.priv.spend,
            view: wallet.keys.priv.view,
          },
          splittedDsts,
          wallet.getPublicAddress(),
          usingOuts,
          mix_outs,
          mixin,
          neededFee,
          payment_id,
          pid_encrypt,
          realDestViewKey,
          0,
          rct,
          message,
          messageTo,
          ttl,
          transactionType,
          term
        );

        logDebugMsg("signed tx: ", signed);
        //console.log('Pre-serialization transaction:', JSON.stringify(signed, null, 2));
        let raw_tx_and_hash = CnTransactions.serialize_tx_with_hash(signed);
        //console.log('Serialized transaction structure:', JSON.stringify(raw_tx_and_hash, null, 2));
        resolve({ raw: raw_tx_and_hash, signed: signed });
      } catch (e) {
        reject("Failed to create transaction: " + e);
      }
    });
  }

  static createTx(
    userDestinations: { address: string; amount: number }[],
    userPaymentId: string = "",
    wallet: Wallet,
    blockchainHeight: number,
    obtainMixOutsCallback: (amounts: number[], numberOuts: number) => Promise<RawDaemon_Out[]>,
    confirmCallback: (amount: number, feesAmount: number) => Promise<void>,
    mixin: number = config.defaultMixin,
    message: string = "",
    ttl: number = 0,
    transactionType: string = "regular",
    term: number = 0
  ): Promise<{
    raw: { hash: string; prvkey: string; raw: string };
    signed: any;
  }> {
    return new Promise<{
      raw: { hash: string; prvkey: string; raw: string };
      signed: any;
    }>(function (resolve, reject) {
      let neededFee = new JSBigInt((<any>window).config.coinFee);

      let pid_encrypt = false; //don't encrypt payment ID unless we find an integrated one

      let totalAmountWithoutFee = new JSBigInt(0);
      let paymentIdIncluded = 0;

      let paymentId = "";
      let dsts: { address: string; amount: number }[] = [];

      for (let dest of userDestinations) {
        totalAmountWithoutFee = totalAmountWithoutFee.add(dest.amount);
        let target = Cn.decode_address(dest.address);
        if (target.intPaymentId !== null) {
          ++paymentIdIncluded;
          paymentId = target.intPaymentId;
          pid_encrypt = true;
        }

        dsts.push({
          address: dest.address,
          amount: new JSBigInt(dest.amount),
        });
      }

      if (paymentIdIncluded > 1) {
        reject("multiple_payment_ids");
        return;
      }

      if (paymentId !== "" && userPaymentId !== "") {
        reject("address_payment_id_conflict_user_payment_id");
        return;
      }

      if (totalAmountWithoutFee.compare(0) <= 0) {
        reject("negative_amount");
        return;
      }

      if (paymentId === "" && userPaymentId !== "") {
        if (userPaymentId.length <= 16 && /^[0-9a-fA-F]+$/.test(userPaymentId)) {
          userPaymentId = ("0000000000000000" + userPaymentId).slice(-16);
        }
        // now double check if ok
        if (
          (userPaymentId.length !== 16 && userPaymentId.length !== 64) ||
          (!/^[0-9a-fA-F]{16}$/.test(userPaymentId) && !/^[0-9a-fA-F]{64}$/.test(userPaymentId))
        ) {
          reject("invalid_payment_id");
          return;
        }

        pid_encrypt = userPaymentId.length === 16;
        paymentId = userPaymentId;
      }

      let unspentOuts: RawOutForTx[] = TransactionsExplorer.formatWalletOutsForTx(wallet, blockchainHeight);

      let usingOuts: RawOutForTx[] = [];
      let usingOuts_amount = new JSBigInt(0);
      let unusedOuts = unspentOuts.slice(0);

      let totalAmount = totalAmountWithoutFee.add(neededFee) /*.add(chargeAmount)*/;
      //selecting outputs to fit the desired amount (totalAmount);
      function pop_random_value(list: any[]) {
        let idx = Math.floor(MathUtil.randomFloat() * list.length);
        let val = list[idx];
        list.splice(idx, 1);
        return val;
      }

      while (usingOuts_amount.compare(totalAmount) < 0 && unusedOuts.length > 0) {
        let out = pop_random_value(unusedOuts);
        usingOuts.push(out);
        usingOuts_amount = usingOuts_amount.add(out.amount);
      }

      logDebugMsg("Selected outs:", usingOuts);
      logDebugMsg(
        "using amount of " +
          usingOuts_amount +
          " for sending " +
          totalAmountWithoutFee +
          " with fees of " +
          neededFee / Math.pow(10, config.coinUnitPlaces) +
          " CCX"
      );

      confirmCallback(totalAmountWithoutFee, neededFee).then(function () {
        if (usingOuts_amount.compare(totalAmount) < 0) {
          logDebugMsg(
            "Not enough spendable outputs / balance too low (have " +
              Cn.formatMoneyFull(usingOuts_amount) +
              " but need " +
              Cn.formatMoneyFull(totalAmount) +
              " (estimated fee " +
              Cn.formatMoneyFull(neededFee) +
              " CCX included)"
          );
          // return;
          reject({ error: "balance_too_low" });
          return;
        } else if (usingOuts_amount.compare(totalAmount) > 0) {
          let changeAmount = usingOuts_amount.subtract(totalAmount);
          if (ttl > 0) {
            changeAmount = changeAmount.add(neededFee);
          }
          //add entire change for rct
          logDebugMsg("1) Sending change of " + Cn.formatMoneySymbol(changeAmount) + " to " + wallet.getPublicAddress());
          dsts.push({
            address: wallet.getPublicAddress(),
            amount: changeAmount,
          });
        }

        /* Not applicable for CCX

             else if (usingOuts_amount.compare(totalAmount) === 0) {

           //create random destination to keep 2 outputs always in case of 0 change

           let fakeAddress = Cn.create_address(CnRandom.random_scalar()).public_addr;
           logDebugMsg("Sending 0 CCX to a fake address to keep tx uniform (no change exists): " + fakeAddress);
           dsts.push({
             address: fakeAddress,
             amount: 0
           });
         }
         */

        logDebugMsg("destinations", dsts);

        let amounts: number[] = [];
        for (let l = 0; l < usingOuts.length; l++) {
          amounts.push(usingOuts[l].amount);
        }
        let nbOutsNeeded: number = mixin + 1;

        // Request nbOutsNeeded mixouts for each output (including duplicates)
        let nbOutsRequested: number = nbOutsNeeded + 3; // Request 3 more to account for potentialduplicates
        obtainMixOutsCallback(amounts, nbOutsRequested).then(function (lotsMixOuts: any[]) {
          logDebugMsg("------------------------------mix_outs");
          logDebugMsg("amounts", amounts);
          logDebugMsg("lots_mix_outs", lotsMixOuts);
          // 1. Check for duplicates and remove them
          const removedDuplicateMixOuts = TransactionsExplorer.removeDuplicateMixOuts(lotsMixOuts);

          // 2. Shuffle and select exactly nbOutsNeeded mixouts per amount
          const selectedMixOuts = TransactionsExplorer.selectMixOuts(removedDuplicateMixOuts, usingOuts, nbOutsNeeded);

          // 3. Validate that we have enough mixouts for each input
          const validation = TransactionsExplorer.validateMixOutsForInputs(usingOuts, selectedMixOuts, mixin);
          if (!validation.valid) {
            reject(new Error(validation.reason));
            return;
          }

          TransactionsExplorer.createRawTx(
            dsts,
            wallet,
            false,
            usingOuts,
            pid_encrypt,
            selectedMixOuts,
            mixin,
            neededFee,
            paymentId,
            message,
            ttl,
            transactionType,
            term
          )
            .then(function (data: { raw: { hash: string; prvkey: string; raw: string }; signed: any }) {
              resolve(data);
            })
            .catch(function (e) {
              reject(e);
            });
        });
      });
    });
  }

  static createWithdrawTx(
    deposit: Deposit,
    wallet: Wallet,
    blockchainHeight: number,
    obtainMixOutsCallback: (amounts: number[], numberOuts: number) => Promise<RawDaemon_Out[]>,
    confirmCallback: (amount: number, feesAmount: number) => Promise<void>,
    mixin: number = 0,
    paymentId: string = "",
    message: string = "",
    ttl: number = 0,
    transactionType: string = "withdraw",
    term: number = 0
  ): Promise<{
    raw: { hash: string; prvkey: string; raw: string };
    signed: any;
  }> {
    return new Promise<{
      raw: { hash: string; prvkey: string; raw: string };
      signed: any;
    }>((resolve, reject) => {
      let lockedAmount = deposit.amount;
      let totalInterest = deposit.interest;
      let totalAmount = lockedAmount + totalInterest;
      let pid_encrypt = false; // don't encrypt payment ID for withdrawals
      let paymentId = "";

      // Check if the deposit is unlocked
      if (deposit.unlockHeight > blockchainHeight) {
        reject(new Error("Deposit is still locked"));
        return;
      }

      logDebugMsg("Withdrawing deposit with amount", totalAmount);

      // For withdrawals, we want a small fee for the transaction
      let neededFee = new JSBigInt(config.depositSmallWithdrawFee);
      let totalAmountWithoutFee = new JSBigInt(totalAmount);

      if (lockedAmount < 1) {
        reject(new Error("such a deposit cannot could not have been created"));
        return;
      }

      confirmCallback(totalAmountWithoutFee.subtract(neededFee), neededFee)
        .then(() => {
          let usingOuts: RawOutForTx[] = [];

          // Create the multisignature input for the deposit
          let depositOutput: RawOutForTx = {
            keyImage: "", // Not needed for deposit withdrawal
            amount: deposit.amount,
            public_key: deposit.keys[0], // to be corrected
            index: deposit.indexInVout,
            global_index: deposit.globalOutputIndex,
            tx_pub_key: deposit.txPubKey,
            type: "input_to_deposit_key", // Specify this is a deposit key input
            required_signatures: 1, // We know this is a single-signature deposit
            keys: [deposit.keys[0]], // Add the single key from deposit
          };
          usingOuts.push(depositOutput);

          let changeAmount = totalAmountWithoutFee.subtract(neededFee);
          let dsts: { address: string; amount: number }[] = [];

          logDebugMsg("Sending withdrawn amount of " + Cn.formatMoneySymbol(changeAmount) + " to " + wallet.getPublicAddress());
          dsts.push({
            address: wallet.getPublicAddress(),
            amount: changeAmount,
          });

          logDebugMsg("destinations", dsts);

          let amounts: number[] = [];
          for (let l = 0; l < usingOuts.length; l++) {
            amounts.push(usingOuts[l].amount);
          }
          let nbOutsNeeded: number = mixin + 1;

          obtainMixOutsCallback(amounts, nbOutsNeeded)
            .then(function (lotsMixOuts: any[]) {
              logDebugMsg("------------------------------mix_outs");
              logDebugMsg("amounts", amounts);
              logDebugMsg("lots_mix_outs", lotsMixOuts);

              TransactionsExplorer.createRawTx(
                dsts,
                wallet,
                false,
                usingOuts,
                pid_encrypt,
                lotsMixOuts,
                mixin,
                neededFee,
                paymentId,
                message,
                ttl,
                "withdraw",
                deposit.term
              )
                .then(function (data: { raw: { hash: string; prvkey: string; raw: string }; signed: any }) {
                  resolve(data);
                })
                .catch(function (e) {
                  reject(e);
                });
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Validates that we have enough valid decoys for each input
   * This ensures we have the required number of mixins (default 5) for each input
   */
  static validateMixOutsForInputs(
    usingOuts: RawOutForTx[],
    mixOuts: any[], // Full mix_outs structure from daemon
    mixin: number
  ): { valid: boolean; reason: string } {
    // Check that we have one mixout group per output
    if (mixOuts.length !== usingOuts.length) {
      return {
        valid: false,
        reason: "Wrong number of mixout groups provided",
      };
    }

    // Check each output has enough mixouts
    for (let i = 0; i < usingOuts.length; i++) {
      const out = usingOuts[i];
      const mixOutGroup = mixOuts[i];

      if (!mixOutGroup || mixOutGroup.amount !== out.amount) {
        return {
          valid: false,
          reason: "Mixout group mismatch",
        };
      }

      const availableMixouts = mixOutGroup.outs.length;
      const requiredMixouts = mixin + 1;

      if (availableMixouts < requiredMixouts) {
        return {
          valid: false,
          reason: "Not enough mixouts available, try smaller amount",
        };
      }
    }

    return {
      valid: true,
      reason: "All outputs have sufficient mixouts",
    };
  }

  /**
   * Selects the required number of mixouts for each input from the daemon-provided mixouts
   * Shuffles the available mixouts for additional entropy before selection
   */
  static selectMixOuts(mixOuts: any[], usingOuts: RawOutForTx[], nbOutsNeeded: number): any[] {
    const selectedMixOuts: any[] = [];
    const usedGlobalIndices: Set<number> = new Set();

    // Process outputs in order, using the corresponding mixout group for each
    for (let i = 0; i < usingOuts.length; i++) {
      const out = usingOuts[i];
      const mixOutGroup = mixOuts[i]; // Use the mixout group at the same index

      if (mixOutGroup && mixOutGroup.amount === out.amount && mixOutGroup.outs.length > 0) {
        // Filter out already used global indices to ensure uniqueness
        const availableMixouts = mixOutGroup.outs.filter((mixout: any) => !usedGlobalIndices.has(mixout.global_index));

        if (availableMixouts.length < nbOutsNeeded) {
          console.log(
            `Warning: Not enough unique mixouts for output ${i} (amount ${out.amount}). Need ${nbOutsNeeded}, have ${availableMixouts.length}`
          );
        }

        // Shuffle the available mixouts for additional entropy
        const shuffledMixouts = [...availableMixouts];
        for (let j = shuffledMixouts.length - 1; j > 0; j--) {
          const k = Math.floor(MathUtil.randomFloat() * (j + 1));
          [shuffledMixouts[j], shuffledMixouts[k]] = [shuffledMixouts[k], shuffledMixouts[j]];
        }

        // Select the first nbOutsNeeded mixouts from the shuffled array
        const selectedMixouts = shuffledMixouts.slice(0, nbOutsNeeded);

        // Mark these global indices as used
        for (const mixout of selectedMixouts) {
          usedGlobalIndices.add(mixout.global_index);
        }

        // Add to selected mixouts (one entry per output)
        selectedMixOuts.push({
          amount: out.amount,
          outs: selectedMixouts,
        });
      } else {
        console.error(`Error: No valid mixout group found for output ${i} (amount ${out.amount})`);
      }
    }

    return selectedMixOuts;
  }

  static removeDuplicateMixOuts(mixOuts: any[]): any[] {
    // First loop: remove duplicates within each object
    for (let i = 0; i < mixOuts.length; i++) {
      const group = mixOuts[i];
      const seenInThisGroup: Set<number> = new Set();
      const uniqueOuts: any[] = [];

      for (const mixout of group.outs) {
        if (!seenInThisGroup.has(mixout.global_index)) {
          seenInThisGroup.add(mixout.global_index);
          uniqueOuts.push(mixout);
        }
      }

      mixOuts[i] = {
        amount: group.amount,
        outs: uniqueOuts,
      };
    }

    // Second loop: if a global index appears in multiple objects, remove it from the object with more mixouts
    const globalIndexCounts: Map<number, number[]> = new Map();

    // Count which objects contain each global index
    for (let i = 0; i < mixOuts.length; i++) {
      for (const mixout of mixOuts[i].outs) {
        if (!globalIndexCounts.has(mixout.global_index)) {
          globalIndexCounts.set(mixout.global_index, []);
        }
        globalIndexCounts.get(mixout.global_index)!.push(i);
      }
    }

    // Remove duplicates across objects
    for (const [globalIndex, objectIndices] of Array.from(globalIndexCounts.entries())) {
      if (objectIndices.length > 1) {
        // Find the object with the most mixouts
        let maxMixouts = 0;
        let objectToRemoveFrom = objectIndices[0];

        for (const objectIndex of objectIndices) {
          if (mixOuts[objectIndex].outs.length > maxMixouts) {
            maxMixouts = mixOuts[objectIndex].outs.length;
            objectToRemoveFrom = objectIndex;
          }
        }

        // Remove this global index from the object with MORE mixouts
        // This leaves the duplicate in the object with fewer mixouts
        mixOuts[objectToRemoveFrom].outs = mixOuts[objectToRemoveFrom].outs.filter((mixout: any) => mixout.global_index !== globalIndex);
      }
    }

    return mixOuts;
  }
}
