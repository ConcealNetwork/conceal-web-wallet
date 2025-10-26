/*
 * Copyright (c) 2025 Conceal Community, Conceal.Network & Conceal Devs
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Size constants for transaction components (in bytes)
const KEY_IMAGE_SIZE = 32; // sizeof(crypto::KeyImage)
const OUTPUT_KEY_SIZE = 32; // sizeof(decltype(KeyOutput::key))
const AMOUNT_SIZE = 10; // sizeof(uint64_t) + 2 for varint
const GLOBAL_INDEXES_VECTOR_SIZE_SIZE = 1; // sizeof(uint8_t) for varint
const GLOBAL_INDEXES_INITIAL_VALUE_SIZE = 4; // sizeof(uint32_t) for varint
const GLOBAL_INDEXES_DIFFERENCE_SIZE = 4; // sizeof(uint32_t) for varint
const SIGNATURE_SIZE = 64; // sizeof(crypto::Signature)
const EXTRA_TAG_SIZE = 1; // sizeof(uint8_t)
const INPUT_TAG_SIZE = 1; // sizeof(uint8_t)
const OUTPUT_TAG_SIZE = 1; // sizeof(uint8_t)
const PUBLIC_KEY_SIZE = 32; // sizeof(crypto::PublicKey)
const TRANSACTION_VERSION_SIZE = 1; // sizeof(uint8_t)
const TRANSACTION_UNLOCK_TIME_SIZE = 8; // sizeof(uint64_t)
const CRYPTONOTE_BLOCK_GRANTED_FULL_REWARD_ZONE = 100000;

export class Currency {
  //Fusion
  public static fusionTxMaxSize = (CRYPTONOTE_BLOCK_GRANTED_FULL_REWARD_ZONE * 30) / 100;
  public static fusionTxMinInputCount = 12; // 12 is the default value in C++
  public static fusionTxMaxInputCount = 100; // 100 is the default value in C++
  public static fusionTxMinInOutCountRatio = 4;

  /**
   * Checks if an amount is applicable in a fusion transaction input.
   * @param amount The amount to check.
   * @param threshold The threshold amount for fusion.
   * @param height The current blockchain height.
   * @returns { applicable: boolean; amountPowerOfTen?: number }
   */
  public static isAmountApplicableInFusionTransactionInput = (
    amount: number,
    threshold: number,
    height: number
  ): { applicable: boolean; amountPowerOfTen?: number } => {
    if (amount >= threshold) {
      return { applicable: false };
    }

    if (height < config.UPGRADE_HEIGHT_V4 && amount < config.dustThreshold) {
      return { applicable: false };
    }

    const PRETTY_AMOUNTS = config.PRETTY_AMOUNTS;
    let idx = PRETTY_AMOUNTS.findIndex((a) => a >= amount);

    if (idx === -1 || PRETTY_AMOUNTS[idx] !== amount) {
      return { applicable: false };
    }

    const amountPowerOfTen = Math.floor(idx / 9);

    return { applicable: true, amountPowerOfTen };
  };

  /**
   * Calculates the approximate maximum number of inputs that can fit in a transaction of given size.
   * @param transactionSize The total size of the transaction in bytes
   * @param outputCount The number of outputs in the transaction
   * @param mixinCount The number of mixins per input
   * @returns The approximate maximum number of inputs that can fit
   */
  public static getApproximateMaximumInputCount = (transactionSize: number, outputCount: number, mixinCount: number): number => {
    // Calculate sizes of different transaction components
    const outputsSize = outputCount * (OUTPUT_TAG_SIZE + OUTPUT_KEY_SIZE + AMOUNT_SIZE);
    const headerSize = TRANSACTION_VERSION_SIZE + TRANSACTION_UNLOCK_TIME_SIZE + EXTRA_TAG_SIZE + PUBLIC_KEY_SIZE;
    const inputSize =
      INPUT_TAG_SIZE +
      AMOUNT_SIZE +
      KEY_IMAGE_SIZE +
      SIGNATURE_SIZE +
      GLOBAL_INDEXES_VECTOR_SIZE_SIZE +
      GLOBAL_INDEXES_INITIAL_VALUE_SIZE +
      mixinCount * (GLOBAL_INDEXES_DIFFERENCE_SIZE + SIGNATURE_SIZE);

    // Calculate and return the maximum number of inputs that can fit
    return Math.floor((transactionSize - headerSize - outputsSize) / inputSize);
  };

  public static getApproximateTransactionSize = (inputCount: number, outputCount: number, mixinCount: number): number => {
    // Calculate sizes of different transaction components
    const outputsSize = outputCount * (OUTPUT_TAG_SIZE + OUTPUT_KEY_SIZE + AMOUNT_SIZE);
    const headerSize = TRANSACTION_VERSION_SIZE + TRANSACTION_UNLOCK_TIME_SIZE + EXTRA_TAG_SIZE + PUBLIC_KEY_SIZE;
    const inputSize =
      INPUT_TAG_SIZE +
      AMOUNT_SIZE +
      KEY_IMAGE_SIZE +
      SIGNATURE_SIZE +
      GLOBAL_INDEXES_VECTOR_SIZE_SIZE +
      GLOBAL_INDEXES_INITIAL_VALUE_SIZE +
      mixinCount * (GLOBAL_INDEXES_DIFFERENCE_SIZE + SIGNATURE_SIZE);

    // Return total approximate size
    return headerSize + inputCount * inputSize + outputsSize;
  };
}
