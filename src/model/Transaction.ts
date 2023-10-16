/**
 *	   Copyright (c) 2018, Gnock
 *     Copyright (c) 2018-2020, ExploShot
 *     Copyright (c) 2018-2020, The Qwertycoin Project
 *     Copyright (c) 2018-2020, The Masari Project
 *     Copyright (c) 2014-2018, MyMonero.com
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

export class TransactionOut {
    amount: number = 0;
    keyImage: string = '';
    outputIdx: number = 0;
    globalIndex: number = 0;
    type: string = '';
    term: number = 0;

    ephemeralPub: string = '';
    pubKey: string = '';
    rtcOutPk: string = '';
    rtcMask: string = '';
    rtcAmount: string = '';

    static fromRaw(raw: any) {
        let nout = new TransactionOut();
        nout.keyImage = raw.keyImage;
        nout.outputIdx = raw.outputIdx;
        nout.globalIndex = raw.globalIndex;
        nout.amount = raw.amount;
        nout.type = raw.type;
        nout.term = raw.term;

        if (typeof raw.ephemeralPub !== 'undefined') nout.ephemeralPub = raw.ephemeralPub;
        if (typeof raw.pubKey !== 'undefined') nout.pubKey = raw.pubKey;
        if (typeof raw.rtcOutPk !== 'undefined') nout.rtcOutPk = raw.rtcOutPk;
        if (typeof raw.rtcMask !== 'undefined') nout.rtcMask = raw.rtcMask;
        if (typeof raw.rtcAmount !== 'undefined') nout.rtcAmount = raw.rtcAmount;

        return nout;
    }

    export() {
        let data: any = {
            keyImage: this.keyImage,
            outputIdx: this.outputIdx,
            globalIndex: this.globalIndex,
            amount: this.amount,
            type: this.type,
            term: this.term,
        };
        if (this.rtcOutPk !== '') data.rtcOutPk = this.rtcOutPk;
        if (this.rtcMask !== '') data.rtcMask = this.rtcMask;
        if (this.rtcAmount !== '') data.rtcAmount = this.rtcAmount;
        if (this.ephemeralPub !== '') data.ephemeralPub = this.ephemeralPub;
        if (this.pubKey !== '') data.pubKey = this.pubKey;

        return data;
    }
}

export class TransactionIn {
    keyImage: string = '';
    //if < 0, means the in has been seen but not checked (view only wallet)
    amount: number = 0;
    type: string = '';

    static fromRaw(raw: any) {
        let nin = new TransactionIn();
        nin.keyImage = raw.keyImage;
        nin.amount = raw.amount;
        return nin;
    }

    export() {
        return {
            keyImage: this.keyImage,
            amount: this.amount,
        };
    }
}

export class Transaction {
    blockHeight: number = 0;
    txPubKey: string = '';
    hash: string = '';

    outs: TransactionOut[] = [];
    ins: TransactionIn[] = [];

    timestamp: number = 0;
    paymentId: string = '';
    fees: number = 0;

    message: string = '';
    
    static fromRaw(raw: any) {
      let transac = new Transaction();
      transac.blockHeight = raw.blockHeight;
      transac.txPubKey = raw.txPubKey;
      transac.timestamp = raw.timestamp;
      if (typeof raw.ins !== 'undefined') {
        let ins: TransactionIn[] = [];
        for (let rin of raw.ins) {
          ins.push(TransactionIn.fromRaw(rin));
        }
        transac.ins = ins;
      }
      if (typeof raw.outs !== 'undefined') {
        let outs: TransactionOut[] = [];
        for (let rout of raw.outs) {
          outs.push(TransactionOut.fromRaw(rout));
        }
        transac.outs = outs;
      }
      if (typeof raw.paymentId !== 'undefined') transac.paymentId = raw.paymentId;
      if (typeof raw.fees !== 'undefined') transac.fees = raw.fees;
      if (typeof raw.hash !== 'undefined') transac.hash = raw.hash;
      if (typeof raw.message !== 'undefined') transac.message = raw.message;
      return transac;
    }

    isDeposit() {
      for (let out of this.outs) {
        if (out.type == "03") {
          return true;
        }
      }

      return false;
    }

    isWithdraw() {
      for (let nin of this.ins) {
        if (nin.type == "03") {
          return true;
        }
      }

      return false;
    }

    export() {
      let data: any = {
          blockHeight: this.blockHeight,
          txPubKey: this.txPubKey,
          timestamp: this.timestamp,
          hash: this.hash,
      };
      if (this.ins.length > 0) {
          let rins: any[] = [];
          for (let nin of this.ins) {
              rins.push(nin.export());
          }
          data.ins = rins;
      }
      if (this.outs.length > 0) {
          let routs: any[] = [];
          for (let nout of this.outs) {
              routs.push(nout.export());
          }
          data.outs = routs;
      }
      if (this.paymentId !== '') data.paymentId = this.paymentId;
      if (this.message !== '') data.message = this.message;
      if (this.fees !== 0) data.fees = this.fees;
      return data;
    }

    getAmount() {
      let amount = 0;
      for (let out of this.outs) {
        amount += out.amount;
      }
      for (let nin of this.ins) {
        amount -= nin.amount;
      }
      return amount;
    }

    isCoinbase() {
        return this.outs.length == 1 && this.outs[0].rtcAmount === '';
    }

    isConfirmed(blockchainHeight: number) {
      if (this.blockHeight === 0) {
        return false;
      } else if (this.isCoinbase() && this.blockHeight + config.txCoinbaseMinConfirms < blockchainHeight) {
        return true;
      } else if (!this.isCoinbase() && this.blockHeight + config.txMinConfirms < blockchainHeight) {
        return true;
      }
      
      return false;
    }

    isFullyChecked() {
        if (this.getAmount() === 0) return false; //fusion
        for (let input of this.ins) {
            if (input.amount < 0)
                return false;
        }
        return true;
    }
}
