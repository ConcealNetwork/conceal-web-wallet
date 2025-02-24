/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
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

import {Transaction, TransactionIn, TransactionOut, Deposit, Withdrawal} from "./Transaction";
import {DependencyInjectorInstance} from "../lib/numberslab/DependencyInjector";
import {BlockchainExplorer, RawDaemon_Out} from "./blockchain/BlockchainExplorer";
import {TransactionsExplorer} from "./TransactionsExplorer";
import {KeysRepository, UserKeys} from "./KeysRepository";
import {Observable} from "../lib/numberslab/Observable";
import {Cn, CnNativeBride, CnTransactions} from "./Cn";
import {Constants} from "./Constants";
import {MathUtil} from "./MathUtil";

type RawOutForTx = {
	keyImage: string,
	amount: number,
	public_key: string,
	index: number,
	global_index: number,
	tx_pub_key: string
};

interface IOptimizeInfo {
  numOutputs: number;
  isNeeded: boolean;
}   

export type RawWalletOptions = {
	checkMinerTx?:boolean,
	readSpeed:number,
	customNode?:boolean,
	nodeUrl:string
}

export class WalletOptions{
	checkMinerTx:boolean = false;
	readSpeed:number = 10;
	customNode:boolean = false;
	nodeUrl:string = 'https://node.conceal.network:16000/';

	static fromRaw(raw : RawWalletOptions){
		let options = new WalletOptions();

		if(typeof raw.checkMinerTx !== 'undefined')options.checkMinerTx = raw.checkMinerTx;
		if(typeof raw.readSpeed !== 'undefined')options.readSpeed = raw.readSpeed;
		if(typeof raw.customNode !== 'undefined')options.customNode = raw.customNode;
		if(typeof raw.nodeUrl !== 'undefined')options.nodeUrl = raw.nodeUrl;

		return options;
	}

	exportToJson() : RawWalletOptions{
		let data : RawWalletOptions = {
			readSpeed:this.readSpeed,
			checkMinerTx:this.checkMinerTx,
			customNode:this.customNode,
			nodeUrl:this.nodeUrl
		};
		return data;
	}
}

export type RawWallet = {
  deposits: any[],
  withdrawals: any[],
  transactions : any[],
	txPrivateKeys?:any,
	lastHeight : number,
	encryptedKeys?:string|Array<number>,
	nonce:string,
	keys?:UserKeys,
	creationHeight?:number,
	options?:RawWalletOptions,
	coinAddressPrefix?:any,
}
export type RawFullyEncryptedWallet = {
	data:number[],
	nonce:string
}

export class Wallet extends Observable {
	private _lastHeight : number = 0;

	private transactions : Transaction[] = [];
  private withdrawals : Withdrawal[] = [];
  private deposits : Deposit[] = [];
  private keyLookupMap: Map<string, Transaction> = new Map<string, Transaction>();
  private txLookupMap: Map<string, Transaction> = new Map<string, Transaction>();
	txsMem : Transaction[] = [];
	private modified = true;
  private modifiedTS: Date = new Date();
	creationHeight : number = 0;
	txPrivateKeys : {[id: string]: string} = {};
	coinAddressPrefix:any = config.addressPrefix;

	keys !: UserKeys;

	private _options : WalletOptions = new WalletOptions();

  signalChanged = () => {
    this.modifiedTS = new Date();
    this.modified = true;
  }

	exportToRaw = (): RawWallet => {
		let deposits : any[] = [];
		let withdrawals : any[] = [];
		let transactions : any[] = [];

		for (let deposit of this.deposits ){
			deposits.push(deposit.export());
		}
		for (let withdrawal of this.withdrawals ){
			withdrawals.push(withdrawal.export());
		}
		for (let transaction of this.transactions ){
			transactions.push(transaction.export());
		}

		let data : RawWallet = {
			deposits: deposits,
			withdrawals: withdrawals,
			transactions: transactions,
			txPrivateKeys:this.txPrivateKeys,
			lastHeight: this._lastHeight,
			nonce:'',
			options : this._options,
			coinAddressPrefix:this.coinAddressPrefix
		};

		data.keys = this.keys;

		if(this.creationHeight !== 0) { 
      data.creationHeight = this.creationHeight;
    }

		return data;
	}

	static loadFromRaw(raw : RawWallet): Wallet {
    let wallet = new Wallet();
		wallet.transactions = [];
		wallet.withdrawals = [];
		wallet.deposits = [];
    wallet.keyLookupMap.clear();
    wallet.txLookupMap.clear();

    if (raw.deposits) {
      for (let rawDeposit of raw.deposits) {
        let deposit = Deposit.fromRaw(rawDeposit);
        wallet.deposits.push(deposit);
      }
    }

    if (raw.withdrawals) {
      for (let rawWithdrawal of raw.withdrawals) {
        let withdrawal = Withdrawal.fromRaw(rawWithdrawal);
        wallet.withdrawals.push(withdrawal);
      }
    }

    if (raw.transactions) {
      for (let rawTransac of raw.transactions) {
        let transaction = Transaction.fromRaw(rawTransac);
        wallet.transactions.push(transaction);
        wallet.txLookupMap.set(transaction.hash, transaction);
        wallet.keyLookupMap.set(transaction.txPubKey, transaction);
      }
    }

		wallet._lastHeight = raw.lastHeight;
		if (typeof raw.encryptedKeys === 'string' && raw.encryptedKeys !== '') {
			if (raw.encryptedKeys.length === 128) {
				let privView = raw.encryptedKeys.substr(0, 64);
				let privSpend = raw.encryptedKeys.substr(64, 64);
				wallet.keys = KeysRepository.fromPriv(privSpend, privView);
			} else {
				let privView = raw.encryptedKeys.substr(0, 64);
				let pubViewKey = raw.encryptedKeys.substr(64, 64);
				let pubSpendKey = raw.encryptedKeys.substr(128, 64);

				wallet.keys = {
					pub:{
						view:pubViewKey,
						spend:pubSpendKey
					},
					priv:{
						view:privView,
						spend:'',
					}
				};
			}
		} else if (typeof raw.keys !== 'undefined') {
			wallet.keys = raw.keys;
		}
		if(typeof raw.creationHeight !== 'undefined') wallet.creationHeight = raw.creationHeight;

		if(typeof raw.options !== 'undefined') wallet._options = WalletOptions.fromRaw(raw.options);
		if(typeof raw.txPrivateKeys !== 'undefined') wallet.txPrivateKeys = raw.txPrivateKeys;

		if(typeof raw.coinAddressPrefix !== 'undefined') wallet.coinAddressPrefix = raw.coinAddressPrefix;
		else wallet.coinAddressPrefix = config.addressPrefix;

		if(typeof raw.coinAddressPrefix !== 'undefined') wallet.coinAddressPrefix = raw.coinAddressPrefix;
		else wallet.coinAddressPrefix = config.addressPrefix;

		wallet.recalculateKeyImages();
		return wallet;
	}

	isViewOnly = () => {
		return this.keys.priv.spend === '';
	}

	get lastHeight(): number {
		return this._lastHeight;
	}

	set lastHeight(value: number) {
		let modified = value !== this._lastHeight;
		this._lastHeight = value;
		if(modified) {
      this.notify();
    }
	}

	get options(): WalletOptions {
		return this._options;
	}

	set options(value: WalletOptions) {
		this._options = value;
    this.signalChanged();
	}

	getAll = (forceReload = false): Transaction[] => {
		return this.transactions.slice();
	}

	getAllOuts = (): TransactionOut[] => {
		let alls = this.getAll();
		let outs : TransactionOut[] = [];
		for(let tr of alls){
			outs.push.apply(outs, tr.outs);
		}
		return outs;
	}

	addNew = (transaction : Transaction | null, replace = true) => {
    if (transaction) {
      let exist = this.findWithTxPubKey(transaction.txPubKey); 

      if (!exist || replace) {
        if (!exist) {
          this.keyLookupMap.set(transaction.txPubKey, transaction);
          this.txLookupMap.set(transaction.hash, transaction);
          this.transactions.push(transaction);
        } else {
          for(let tr = 0; tr < this.transactions.length; ++tr) {
            if(this.transactions[tr].txPubKey === transaction.txPubKey) {
              this.keyLookupMap.set(transaction.txPubKey, transaction);
              this.txLookupMap.set(transaction.hash, transaction);
              this.transactions[tr] = transaction;
            }
          }
        }

        // remove from unconfirmed
        let existMem = this.findMemWithTxPubKey(transaction.txPubKey);
        if (existMem) {
          let trIndex = this.txsMem.indexOf(existMem);
          if(trIndex != -1) {
            this.txsMem.splice(trIndex, 1);
          }
        }

        // finalize the add tx function
        this.recalculateKeyImages();
        this.signalChanged();
        this.notify();
      }
    }
	}

  addDeposits = (deposits: Deposit[]) => {
    for(let i = 0; i < deposits.length; ++i) {
      this.addDeposit(deposits[i]);
    }
  }

  addDeposit = (deposit: Deposit) => {
    let foundMatch = false;

    for(let i = 0; i < this.deposits.length; ++i) {
      if (this.deposits[i].amount == deposit.amount) {
        if (this.deposits[i].outputIndex == deposit.outputIndex) {
          this.deposits[i]  = deposit;
          foundMatch = true;
          break;
        }
      }
    }  

    if (!foundMatch)  {
      this.deposits.push(deposit);
    }

    this.signalChanged();
    this.notify();
  }

  addWithdrawals = (withdrawals: Withdrawal[]) => {
    for(let i = 0; i < withdrawals.length; ++i) {
      this.addWithdrawal(withdrawals[i]);
    }
  }

  addWithdrawal = (withdrawal: Withdrawal) => {
    let foundMatch = false;

    for(let i = 0; i < this.deposits.length; ++i) {
      if (this.deposits[i].amount == withdrawal.amount) {
        if (this.deposits[i].outputIndex == withdrawal.outputIndex) {
          this.deposits[i].spentTx = withdrawal.txHash;
          break;
        }
      }
    }

    for(let i = 0; i < this.withdrawals.length; ++i) {
      if (this.withdrawals[i].amount == withdrawal.amount) {
        if (this.withdrawals[i].outputIndex == withdrawal.outputIndex) {
          this.withdrawals[i]  = withdrawal;
          foundMatch = true;
          break;
        }
      }
    }  

    if (!foundMatch)  {
      this.withdrawals.push(withdrawal);
    }

    this.signalChanged();
    this.notify();
  }

  addNewMemTx = (transaction : Transaction, replace = true) => {
    let modified: boolean = false;
    let foundTx: boolean = false;

    for (let i = 0; i < this.txsMem.length; ++i) {
      if (this.txsMem[i].hash === transaction.hash) {
        if (replace) {
          this.txsMem[i] = transaction;
          modified = true;
        }
        foundTx = true;
      }
    }

    if (!foundTx) {
      this.txsMem.push(transaction);
      modified = true;
    }
    
    if (modified) {
      this.signalChanged();
    }
  }

  clearMemTx = () => {
    this.txsMem = [];
  }

	findWithTxPubKey = (pubKey : string): Transaction | null => {
    let transaction: Transaction | undefined = this.keyLookupMap.get(pubKey); 

    if (transaction !== undefined) {
      return transaction;
    } else {
      return null;
    }
	}

	findWithTxHash = (hash : string): Transaction | null => {
    let transaction: Transaction | undefined = this.txLookupMap.get(hash); 

    if (transaction !== undefined) {
      return transaction;
    } else {
      return null;
    }
	}

  findMemWithTxPubKey = (pubKey : string): Transaction | null => {
		for(let tr of this.txsMem)
			if(tr.txPubKey === pubKey)
				return tr;
		return null;
	}

	findTxPrivateKeyWithHash = (hash : string): string | null => {
		if(typeof this.txPrivateKeys[hash] !== 'undefined')
			return this.txPrivateKeys[hash];
		return null;
	}

	addTxPrivateKeyWithTxHash = (txHash : string, txPrivKey : string): void => {
		this.txPrivateKeys[txHash] = txPrivKey;
    this.signalChanged();
	}

	getTransactionKeyImages = () => {
		return this.keyImages;
	}

	getTransactionOutIndexes = () => {
		return this.txOutIndexes;
	}

	getOutWithGlobalIndex = (index : number): TransactionOut | null => {
		for(let tx of this.transactions){
			for(let out of tx.outs){
				if(out.globalIndex === index)
					return out;
			}
		}
		return null;
	}

	private keyImages : string[] = [];
	private txOutIndexes : number[] = [];
	private recalculateKeyImages(){
		let keys : string[] = [];
		let indexes : number[] = [];
		for (let transaction of this.transactions) {
			for (let out of transaction.outs) {
				if (out.keyImage !== null && out.keyImage !== '')
					keys.push(out.keyImage);
				if (out.globalIndex !== 0)
					indexes.push(out.globalIndex);
			}
		}
		this.keyImages = keys;
		this.txOutIndexes = indexes;
	}

	getTransactionsCopy = (): Transaction[] => {
		let news: any[] = [];
		for(let transaction of this.transactions){
			news.push(Transaction.fromRaw(transaction.export()));
		}
    news.sort((a,b) =>{
      return a.timestamp - b.timestamp;
    })    
		return news;
	}

	getDepositsCopy = (): Deposit[] => {
		let news: any[] = this.deposits.slice();		

    news.sort((a,b) =>{
      return a.timestamp - b.timestamp;
    })    
		return news;
	}

	getWithdrawalsCopy = (): Deposit[] => {
		let news: any[] = this.withdrawals.slice();

    news.sort((a,b) =>{
      return a.timestamp - b.timestamp;
    })    
		return news;
	}

  get amount() : number{
		return this.availableAmount(-1);
	}

	availableAmount = (currentBlockHeight : number = -1) : number => {
		let amount = 0;
		for (let transaction of this.transactions) {
			if (!transaction.isFullyChecked())
				continue;

			if (transaction.isConfirmed(currentBlockHeight) || currentBlockHeight === -1) {      
				for (let nout of transaction.outs) {
          if (nout.type !== "03") {
            amount += nout.amount;
          }
				}
      }

			for(let nin of transaction.ins){
        if (nin.type !== "03") {
          amount -= nin.amount;
        }
			}
		}

		for (let transaction of this.txsMem) {
			if (transaction.isConfirmed(currentBlockHeight) || currentBlockHeight === -1) {
				for (let nout of transaction.outs) {
          if (nout.type !== "03") {
					  amount += nout.amount;
          }
				}
      }

			for(let nin of transaction.ins){
        if (nin.type !== "03") {
          amount -= nin.amount;
        }
			}
		}

		return amount;
	}

  lockedDeposits = (currHeight: number) : number => {
    let amount = 0;
		for (let deposit of this.deposits) {
			//if (!deposit.tx?.isFullyChecked()) {
		  //  continue;
      //}

      if ((deposit.blockHeight + deposit.term) > currHeight) {
        amount += deposit.amount;
      }
		}

		return amount;
  }    

  unlockedDeposits = (currHeight: number) : number => {
    let amount = 0;
		for (let deposit of this.deposits) {
			//if (!deposit.tx?.isFullyChecked()) {
			//	continue;
      //}

      if (deposit.blockHeight + (deposit.term) <= currHeight) {
        if (!deposit.spentTx) {
          amount += deposit.amount;
        }
      }
		}

		return amount;
  }    

  hasBeenModified = (): Boolean => {
		return this.modified;
	}

  modifiedTimestamp = (): Date => {
    return this.modifiedTS;
  }

	getPublicAddress = () => {
		return Cn.pubkeys_to_string(this.keys.pub.spend, this.keys.pub.view);
	}

	recalculateIfNotViewOnly = () => {
		if(!this.isViewOnly()) {
			for(let tx of this.transactions){
				let needDerivation = false;
				for(let out of tx.outs) {
					if (out.keyImage === '') {
						needDerivation = true;
						break;
					}
				}

				if(needDerivation) {
					let derivation = '';
					try {
						derivation = CnNativeBride.generate_key_derivation(tx.txPubKey, this.keys.priv.view);
					} catch (e) {
						continue;
					}
					for (let out of tx.outs) {
						if (out.keyImage === '') {
							let m_key_image = CnTransactions.generate_key_image_helper({
								view_secret_key: this.keys.priv.view,
								spend_secret_key: this.keys.priv.spend,
								public_spend_key: this.keys.pub.spend,
							}, tx.txPubKey, out.outputIdx, derivation);

							out.keyImage = m_key_image.key_image;
							out.ephemeralPub = m_key_image.ephemeral_pub;
              this.signalChanged();
						}
					}
				}
			}

			if (this.modified) {
				this.recalculateKeyImages();
      }

			for (let iTx = 0; iTx < this.transactions.length; ++iTx) {
				for(let iIn = 0; iIn < this.transactions[iTx].ins.length; ++iIn){
					let vin = this.transactions[iTx].ins[iIn];

					if(vin.amount < 0) {
						if (this.keyImages.indexOf(vin.keyImage) != -1) {
							//logDebugMsg('found in', vin);
							let walletOuts = this.getAllOuts();
							for (let ut of walletOuts) {
								if (ut.keyImage == vin.keyImage) {
									this.transactions[iTx].ins[iIn].amount = ut.amount;
									this.transactions[iTx].ins[iIn].keyImage = ut.keyImage;

									this.signalChanged();
									break;
								}
							}
						}else{
							this.transactions[iTx].ins.splice(iIn,1);
							--iIn;
						}
					}
				}

				if(this.transactions[iTx].outs.length === 0 && this.transactions[iTx].ins.length === 0){
					this.transactions.splice(iTx, 1);
					--iTx;
				}
			}

		}
	}

  optimizationNeeded = (blockchainHeight: number, threshhold: number): IOptimizeInfo => {
    let unspentOuts: RawOutForTx[] = TransactionsExplorer.formatWalletOutsForTx(this, blockchainHeight);
    let counter: number = 0;    

    // first sort the outs in ascending order
    unspentOuts.sort((a,b) => (a.amount > b.amount) ? 1 : ((b.amount > a.amount) ? -1 : 0));
    logDebugMsg("unspentOuts", unspentOuts.length);

    for (let i = 0; i < unspentOuts.length; i++) {
      if ((unspentOuts[i].amount < (threshhold * Math.pow(10, config.coinUnitPlaces))) && (counter < config.optimizeOutputs)) {
        counter++;
      } else {
        break;
      }
    }  

    return {
      numOutputs: unspentOuts.length,
      isNeeded: counter >= config.optimizeOutputs 
    }
  }

  optimize = (blockchainHeight: number, threshhold: number, blockchainExplorer: BlockchainExplorer, obtainMixOutsCallback: (amounts: number[], numberOuts: number) => Promise<RawDaemon_Out[]>) => {
		return new Promise<number>((resolve, reject) => {
			let unspentOuts: RawOutForTx[] = TransactionsExplorer.formatWalletOutsForTx(this, blockchainHeight);
      let stillData = unspentOuts.length >= config.optimizeOutputs;
			let neededFee = new JSBigInt((<any>window).config.coinFee);
      let iteration = 0;

      //selecting outputs to fit the desired amount (totalAmount);
      function pop_random_value(list: any[]) {
        let idx = Math.floor(MathUtil.randomFloat() * list.length);
        let val = list[idx];
        list.splice(idx, 1);
        return val;
      }

      (async () => {
        // first sort the outs in ascending order only once
        unspentOuts.sort((a,b) => (a.amount > b.amount) ? 1 : ((b.amount > a.amount) ? -1 : 0));
        let processedOuts = 0;

        while ((stillData && ((iteration * config.optimizeOutputs) < unspentOuts.length)) && (iteration < 5)) {
          let dsts: { address: string, amount: number }[] = [];
          let totalAmountWithoutFee = new JSBigInt(0);
          let counter = 0;
          
          for (let i = iteration * config.optimizeOutputs; i < unspentOuts.length; i++) {
            if ((unspentOuts[i].amount < (threshhold * Math.pow(10, config.coinUnitPlaces))) && (counter < config.optimizeOutputs)) {
              processedOuts++;
              counter++;
            } else {
              stillData = counter >= config.optimizeOutputs;
              break;
            }
          }

          if (stillData) {
            let usingOuts: RawOutForTx[] = [];
            let usingOuts_amount = new JSBigInt(0);
            let unusedOuts = unspentOuts.slice(iteration * config.optimizeOutputs, (iteration * config.optimizeOutputs) + counter);

            for (let i = 0; i < unusedOuts.length; i++) {
              totalAmountWithoutFee = totalAmountWithoutFee.add(unusedOuts[i].amount);
            }  
        
            if (totalAmountWithoutFee < this.availableAmount(blockchainHeight)) {
              // substract fee from the amount we have available              
              let totalAmount = totalAmountWithoutFee.subtract(neededFee);

              if (totalAmount > 0) {
                dsts.push({
                  address: this.getPublicAddress(),
                  amount: new JSBigInt(totalAmount)
                });

                while ((usingOuts_amount.compare(totalAmount) < 0) && (unusedOuts.length > 0)) {
                  let out = pop_random_value(unusedOuts);
                  usingOuts.push(out);
                  usingOuts_amount = usingOuts_amount.add(out.amount);
                }
                                
                let amounts: number[] = [];
                for (let l = 0; l < usingOuts.length; l++) {
                  amounts.push(usingOuts[l].amount);
                }      

                let nbOutsNeeded: number = config.defaultMixin + 1;
                let lotsMixOuts: any[] = await obtainMixOutsCallback(amounts, nbOutsNeeded);

                let data = await TransactionsExplorer.createRawTx(dsts, this, false, usingOuts, false, lotsMixOuts, config.defaultMixin, neededFee, '', '', 0);
                await blockchainExplorer.sendRawTx(data.raw.raw);
                this.addTxPrivateKeyWithTxHash(data.raw.hash, data.raw.prvkey);
                logDebugMsg('optimization done', processedOuts);
                iteration++;
              }
            } else {
              stillData = false;
            }
          }
        }

        // we modifed the wallet, mark it
        this.signalChanged();

        // finished here
        resolve(processedOuts);
      })().catch(err => {
        reject(err);
      });
    });
  }

  clearTransactions = () => {
    this.txsMem = [];
    this.deposits = [];
    this.withdrawals = [];
    this.transactions = [];
    this.txLookupMap.clear();
    this.keyLookupMap.clear();
    this.recalculateKeyImages;
    this.notify();
  }

  resetScanHeight = () => {
    this.lastHeight = this.creationHeight;
    this.signalChanged();
    this.notify();
  }
}
