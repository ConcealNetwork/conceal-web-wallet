/*
 * Copyright (c) 2022, Conceal Devs
 * Copyright (c) 2022, Conceal Network
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

import {KeysRepository} from "../model/KeysRepository";
import {Wallet} from "../model/Wallet";
import {BlockchainExplorerProvider} from "../providers/BlockchainExplorerProvider";
import {Mnemonic} from "../model/Mnemonic";
import {Translations} from "../model/Translations";
import {MnemonicLang} from "../model/MnemonicLang";
import {BlockchainExplorer, RawDaemon_Out} from "../model/blockchain/BlockchainExplorer";
import {Cn, CnUtils, CnNativeBride, CnRandom} from "../model/Cn";
import {AppState} from "../model/AppState";
import {DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {TransactionsExplorer} from "../model/TransactionsExplorer";
import {WalletWatchdog} from "../model/WalletWatchdog";
import {Transaction, TransactionIn} from "../model/Transaction";

let blockchainExplorer : BlockchainExplorer = BlockchainExplorerProvider.getInstance();

export class Api {

	mnemonicPhrase = "";
	importHeight = 0;

	constructor() {
	}

	importWalletFromKeys(publicAddress: string, viewOnly: boolean, privateViewKey: string, privateSpendKey: string, password: string){
		let self = this;
		blockchainExplorer.getHeight().then(function(currentHeight){
			let newWallet = new Wallet();
			if(viewOnly){
				let decodedPublic = Cn.decode_address(publicAddress.trim());
				newWallet.keys = {
					priv:{
						spend:'',
						view:privateViewKey.trim()
					},
					pub:{
						spend:decodedPublic.spend,
						view:decodedPublic.view,
					}
				};
			} else {
				//console.log(1);
				let viewkey = privateViewKey.trim();
				if(viewkey === '') {
					viewkey = Cn.generate_keys(CnUtils.cn_fast_hash(privateSpendKey.trim())).sec;
				}
				//console.log(1, viewkey);
				newWallet.keys = KeysRepository.fromPriv(privateSpendKey.trim(), viewkey);
				//console.log(1);
			}

			self.importHeightValidator();

			let height = self.importHeight;//never trust a perfect value from the user
			if(height >= currentHeight){
				height = currentHeight-1;
			}
			height = height - 10;

			if(height < 0)height = 0;
			if(height > currentHeight)height = currentHeight;
			newWallet.lastHeight = height;
			newWallet.creationHeight = newWallet.lastHeight;

			AppState.openWallet(newWallet, password);
			return true;
		});
	}

	
	importWalletFromMnemonic(mnemonicPhrase: string, language: string = "auto", password: string) {
		let self = this;
		blockchainExplorer.getHeight().then(function (currentHeight) {
			let newWallet = new Wallet();

			let mnemonic = mnemonicPhrase.trim();
			// let current_lang = 'english';
			let current_lang = 'english';

			if (language === 'auto') {
				let detectedLang = Mnemonic.detectLang(mnemonicPhrase.trim());
				if (detectedLang !== null)
					current_lang = detectedLang;
			} else
				current_lang = language;

			let mnemonic_decoded = Mnemonic.mn_decode(mnemonic, current_lang);
			if (mnemonic_decoded !== null) {
				let keys = Cn.create_address(mnemonic_decoded);

				let newWallet = new Wallet();
				newWallet.keys = KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);

				let height = self.importHeight - 10;
				if (height < 0) height = 0;
				if (height > currentHeight) height = currentHeight;

				newWallet.lastHeight = height;
				newWallet.creationHeight = newWallet.lastHeight;
				AppState.openWallet(newWallet, password);
				return true;
			} else {
				console.log("Invalid phrase");
				return false;
			}

		});
	}

	generateWallet(walletPassword: string) {
		let self = this;
		setTimeout(function(){
			blockchainExplorer.getHeight().then(function(currentHeight){
				let seed = CnNativeBride.sc_reduce32(CnRandom.rand_32());
				let keys = Cn.create_address(seed);

				let newWallet = new Wallet();
				newWallet.keys = KeysRepository.fromPriv(keys.spend.sec, keys.view.sec);
				let height = currentHeight - 10;
				if(height < 0)height = 0;
				newWallet.lastHeight = height;
				newWallet.creationHeight = height;

				Translations.getLang().then(function(userLang : string){
					let langToExport = 'english';
					for(let lang of MnemonicLang.getLangs()){
						if(lang.shortLang === userLang){
							langToExport = lang.name;
							break;
						}
					}
					let phrase = Mnemonic.mn_encode(newWallet.keys.priv.spend, langToExport);
					if(phrase !== null)
						self.mnemonicPhrase = phrase;

				});

				AppState.openWallet(newWallet, walletPassword);				
			});
		},0);
		return true;
	}

	getMnemonicOfNewWallet() {
		return this.mnemonicPhrase;
	}

	// Maybe pass wallet as a pararm? To be define later after testing
//	send(wallet: Wallet, amountToSend: string, destinationAddress: string, paymentId: string) {
	send(amountToSend: string, destinationAddress: string, paymentId: string) {
		let self = this;
		let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);

		blockchainExplorer.getHeight().then(function (blockchainHeight: number) {
			let amount = parseFloat(amountToSend);
			if (destinationAddress !== null) {
				//todo use BigInteger
				if (amount * Math.pow(10, config.coinUnitPlaces) > wallet.availableAmount(blockchainHeight)) {
					console.log("Amount higher than the funds")
					return;
				}
				//TODO use biginteger
				let amountToSend = amount * Math.pow(10, config.coinUnitPlaces);
				let mixinToSendWith: number = config.defaultMixin;
				
				TransactionsExplorer.createTx([{address: destinationAddress, amount: amountToSend}], paymentId, wallet, blockchainHeight,
					function (amounts: number[], numberOuts: number): Promise<RawDaemon_Out[]> {
						return blockchainExplorer.getRandomOuts(amounts, numberOuts);
					}
					, function (amount: number, feesAmount: number): Promise<void> {
						if (amount + feesAmount > wallet.availableAmount(blockchainHeight)) {
							console.log("Amount higher than the funds");
							throw 'Amount higher than the funds';
						}

						return new Promise<void>(function (resolve, reject) {
						});
					},
					mixinToSendWith).then(function (rawTxData: { raw: { hash: string, prvkey: string, raw: string }, signed: any }) {
					blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
						//save the tx private key
						wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);

						//force a mempool check so the user is up to date
						let watchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name);
						if (watchdog !== null)
							watchdog.checkMempool();

					}).catch(function (data: any) {
						console.log("Generic error while sending funds: ", data);
					});
				}).catch(function (error: any) {
					//console.log(error);
					if (error && error !== '') {
						if (typeof error === 'string')
							console.log("Generic error while sending funds: ", error);
						else
							console.log("Generic error while sending funds: ", JSON.stringify(error));
					}
				});
			} else {
				console.log("Invalid amount");
			}
		});
	}
	
	refresh(callback: any){
		let self = this;
		blockchainExplorer.getHeight().then(function(height : number){
			callback(height);
		});
	}

	getTxDetails(transaction : Transaction){
		let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);

		let explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
		let explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
		let fees = 0;
		if(transaction.getAmount() < 0)
			fees = (transaction.fees / Math.pow(10, config.coinUnitPlaces));
		
		let paymentId = '';
		if(transaction.paymentId !== ''){
			paymentId = transaction.paymentId;
		}

		let txPrivKeyMessage = '';
		let txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
		if(txPrivKey !== null){
			txPrivKeyMessage = txPrivKey;
		}

		return {
			fees: fees,
			paymentId: paymentId,
			txPrivKeyMessage: txPrivKeyMessage,
			txUrl: explorerUrlHash.replace('{ID}', transaction.hash),
			blockUrl: explorerUrlBlock.replace('{ID}', ''+transaction.blockHeight)
		}
	}

	getTransactions() {
		let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);

		return wallet.txsMem.concat(wallet.getTransactionsCopy().reverse())
	}


	importHeightValidator(){
		if((<any>this.importHeight) === '')this.importHeight = 0;
		if(this.importHeight < 0){
			this.importHeight = 0;
		}
		this.importHeight = parseInt(''+this.importHeight);
	}
}