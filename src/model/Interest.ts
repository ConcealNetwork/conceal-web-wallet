/*
 * Copyright (c) 2018-2025 Conceal Community, Conceal.Network & Conceal Devs
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

// Declare global config type
declare var config: {
  depositMinTermBlock: number;
  depositHeightV3: number;
  depositHeightV4: number;
  coinUnitPlaces: number;
  depositRateV3: number[];
  investmentMq?: number;
  weeklyBaseInterest?: number;
  weeklyInterestIncrement?: number;
  [key: string]: any;
};

// Declare global logDebugMsg function
declare function logDebugMsg(...args: any[]): void;

/**
 * InterestCalculator - Utility class to calculate interest for deposits
 * Implements the same logic as the C++ code in the blockchain
 */
export class InterestCalculator {
  // Constants from C++ implementation
  private static readonly DEPOSIT_MIN_TERM = 5040; // One week
  private static readonly DEPOSIT_MAX_TERM = 12 * 21900; // One year
  private static readonly DEPOSIT_MAX_TERM_V1 = 64800 * 20; // Five years
  private static readonly DEPOSIT_MIN_TERM_V3 = 21900; // One month
  private static readonly DEPOSIT_MAX_TERM_V3 = 12 * 21900; // One year
  private static readonly DEPOSIT_HEIGHT_V3 = 413400; // Height when V3 deposit rates were activated
  private static readonly DEPOSIT_HEIGHT_V4 = 1162162; // Height when deposit terms were enforced
  private static readonly DEPOSIT_MIN_TOTAL_RATE_FACTOR = 0; // Constant rate
  private static readonly DEPOSIT_MAX_TOTAL_RATE = 4; // Legacy deposits
  private static readonly BLOCK_WITH_MISSING_INTEREST = 425799; // Block with special handling

  /**
   * Calculates interest for a deposit based on amount, term, and lock height
   * @param amount - Amount of the deposit in atomic units
   * @param term - Term of the deposit in blocks
   * @param lockHeight - Block height when the deposit was made
   * @returns The calculated interest amount in atomic units
   */
  public static calculateInterest(amount: number, term: number, lockHeight: number): number {
    const m_coin = Math.pow(10, config.coinUnitPlaces); // Amount divider to get human-readable amounts
    
    // Special case handling for block with missing interest
    if (lockHeight === this.BLOCK_WITH_MISSING_INTEREST) {
      lockHeight = lockHeight + term;
    }

    // Check if this is a V3 deposit (monthly term)
    if (term % this.DEPOSIT_MIN_TERM_V3 === 0 && lockHeight > (config.depositHeightV3 || this.DEPOSIT_HEIGHT_V3)) {
      return this.calculateInterestV3(amount, term);
    }

    // Check if this is a V2 deposit (investment or weekly)
    if (term % 64800 === 0 || term % this.DEPOSIT_MIN_TERM === 0) {
      return this.calculateInterestV2(amount, term);
    }

    // If we reach here, it's a V1 deposit (fallback, should not happen in current Conceal)
    logDebugMsg("Warning: Using legacy V1 interest calculation");
    
    const m_depositMaxTerm = this.DEPOSIT_MAX_TERM_V1;

    const a = term * this.DEPOSIT_MAX_TOTAL_RATE - this.DEPOSIT_MIN_TOTAL_RATE_FACTOR;
    // In JS we don't need mul128/div128 as JS Numbers can handle larger values
    let interestAmount = (amount * a) / (100 * m_depositMaxTerm);
    
    // Early deposit multiplier
    const END_MULTIPLIER_BLOCK = 1000000; // Placeholder - need actual value
    const MULTIPLIER_FACTOR = 3; // Placeholder - need actual value
    
    if (lockHeight <= END_MULTIPLIER_BLOCK) {
      interestAmount = interestAmount * MULTIPLIER_FACTOR;
    }
    
    return Math.floor(interestAmount);
  }

  /**
   * Calculates interest for V3 deposits (monthly terms)
   * @param amount - Amount of the deposit in atomic units
   * @param term - Term of the deposit in blocks
   * @returns The calculated interest amount in atomic units
   */
  private static calculateInterestV3(amount: number, term: number): number {
    const m_coin = Math.pow(10, config.coinUnitPlaces);
    
    const amount4Humans = amount / m_coin;
    
    // Base interest rates depending on amount tiers
    let baseInterest = config.depositRateV3[0] || 0.029; // Basic rate for amounts < 10000
       
      // Use config values as primary source
      if (amount4Humans  >= 10000) {
        baseInterest = config.depositRateV3[1] || 0.039; // Medium rate for amounts between 10000-20000
      } else if (amount4Humans >= 20000) {
        baseInterest = config.depositRateV3[2] || 0.049; // Highest rate for amounts >= 20000
      }
    
    
    // Calculate months
    let months = term / this.DEPOSIT_MIN_TERM_V3;
    if (months > 12) {
      months = 12; // Cap at 12 months
    }
    
    // Calculate effective annual rate with term bonus
    const ear = baseInterest + (months - 1) * 0.001;
    
    // Calculate effective interest rate for the period
    const eir = (ear / 12) * months;
    
    // Calculate interest
    const interest = amount * eir;
    
    return Math.floor(interest);
  }

  /**
   * Calculates interest for V2 deposits (investment or weekly terms)
   * @param amount - Amount of the deposit in atomic units
   * @param term - Term of the deposit in blocks
   * @returns The calculated interest amount in atomic units
   */
  private static calculateInterestV2(amount: number, term: number): number {
    const m_coin = Math.pow(10, config.coinUnitPlaces);
    
    // Investment term (64800 blocks - quarterly)
    if (term % 64800 === 0) {
      const amount4Humans = amount / m_coin;
      
      // Quantity tier bonus - exact same tiers as in C++ code
      let qTier = 1;
      if (amount4Humans > 110000 && amount4Humans < 180000) qTier = 1.01;
      if (amount4Humans >= 180000 && amount4Humans < 260000) qTier = 1.02;
      if (amount4Humans >= 260000 && amount4Humans < 350000) qTier = 1.03;
      if (amount4Humans >= 350000 && amount4Humans < 450000) qTier = 1.04;
      if (amount4Humans >= 450000 && amount4Humans < 560000) qTier = 1.05;
      if (amount4Humans >= 560000 && amount4Humans < 680000) qTier = 1.06;
      if (amount4Humans >= 680000 && amount4Humans < 810000) qTier = 1.07;
      if (amount4Humans >= 810000 && amount4Humans < 950000) qTier = 1.08;
      if (amount4Humans >= 950000 && amount4Humans < 1100000) qTier = 1.09;
      if (amount4Humans >= 1100000 && amount4Humans < 1260000) qTier = 1.1;
      if (amount4Humans >= 1260000 && amount4Humans < 1430000) qTier = 1.11;
      if (amount4Humans >= 1430000 && amount4Humans < 1610000) qTier = 1.12;
      if (amount4Humans >= 1610000 && amount4Humans < 1800000) qTier = 1.13;
      if (amount4Humans >= 1800000 && amount4Humans < 2000000) qTier = 1.14;
      if (amount4Humans > 2000000) qTier = 1.15;
      
      // Investment calculation - same as C++ implementation
      const mq = config.investmentMq || 1.4473; // From C++ code, use config if available
      const termQuarters = term / 64800;
      const m8 = 100.0 * Math.pow(1.0 + (mq / 100.0), termQuarters) - 100.0;
      const m5 = termQuarters * 0.5;
      const m7 = m8 * (1 + (m5 / 100));
      const rate = m7 * qTier;
      const interest = amount * (rate / 100);
      
      return Math.floor(interest);
    }
    
    // Weekly deposits (5040 blocks)
    if (term % this.DEPOSIT_MIN_TERM === 0) {
      const weeks = term / this.DEPOSIT_MIN_TERM;
      // Use config values if available, otherwise fall back to hardcoded values
      const baseInterest = config.weeklyBaseInterest || 0.0696; // Base weekly interest rate
      const interestPerWeek = config.weeklyInterestIncrement || 0.0002; // Additional interest per week
      const interestRate = baseInterest + (weeks * interestPerWeek);
      const interest = amount * ((weeks * interestRate) / 100);
      
      return Math.floor(interest);
    }
    
    return 0;
  }
} 