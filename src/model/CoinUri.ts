/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
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

export class CoinUri{

	static coinTxPrefix = 'conceal.';							//legacy, used to be 'conceal:', but the char ':' was creating scanning issue
	static coinAddressPrefix = 'ccx7';							//coin Address prefix, to check address , without using coinTxPrefix
	static coinWalletPrefix = 'conceal.';						//legacy, used to be 'conceal:'
	static coinAddressLength = 98;

	static decodeTx(str : string) : {
		address:string,
		paymentId?:string,
		recipientName?:string,
		amount?:string,
		description?:string,
	}|null {
		if(str.startsWith(CoinUri.coinAddressPrefix)){			// legacy code use to check .coinTxPrefix
			let data = str 										//legacy .replace(this.coinTxPrefix,'');
			let temp = data.replace(/&/g, '?').trim();
			let exploded = temp.split('?');

			if(exploded.length == 0)
				throw 'missing_address';

			if(exploded[0].length !== this.coinAddressLength)
				throw 'invalid_address_length';

			let decodedUri : any = {
				address:exploded[0]
			};

			for(let i = 0; i < exploded.length; ++i){
				let optionParts = exploded[i].split('=');
				if(optionParts.length === 2){
					switch (optionParts[0].trim()){
						case 'payment_id':
							decodedUri.paymentId=optionParts[1];
							break;
						case 'tx_payment_id':
							decodedUri.paymentId=optionParts[1];
							break;
						case 'recipient_name':
							decodedUri.recipientName=optionParts[1];
							break;
						case 'amount':
							decodedUri.amount=optionParts[1];
							break;
						case 'tx_amount':
							decodedUri.amount=optionParts[1];
							break;
						case 'tx_description':
							decodedUri.description=optionParts[1];
							break;
						case 'label':
							decodedUri.description=optionParts[1];
							break;
					}
				}
			}
			return decodedUri;
		}
		throw 'missing_prefix';
	}

	static isTxValid(str : string){
		try{
			this.decodeTx(str);
			return true;
		}catch (e) {
			return false;
		}
	}

	static encodeTx(address : string, paymentId:string|null = null, amount : string|null=null, recipientName:string|null = null, description : string|null=null) : string{
		let encoded = address;					//legacy this.coinTxPrefix + address;
		if(address.length !== this.coinAddressLength)
			throw 'invalid_address_length';

		if(paymentId !== null) encoded += '?payment_id='+paymentId;
		if(amount !== null) encoded+= '?amount='+amount;
		if(recipientName !== null) encoded += '?recipient_name='+recipientName;
		if(description !== null) encoded += '?label='+description;
		return encoded;
	}

	static decodeWallet(str : string) : {
		address:string,
		spendKey?:string,
		viewKey?:string,
		mnemonicSeed?:string,
		height?:string,
		nonce?:string,
		encryptMethod?:string
	}{
		if(str.startsWith(CoinUri.coinWalletPrefix)){
			let data = str.replace(this.coinWalletPrefix,'').trim();
			let exploded = data.split('?');

			if(exploded.length == 0)
				throw 'missing_address';

			if(exploded[0].length !== this.coinAddressLength)
				throw 'invalid_address_length';

			let decodedUri : any = {
				address:exploded[0]
			};

			for(let i = 1; i < exploded.length; ++i){
				let optionParts = exploded[i].split('=');
				if(optionParts.length === 2){
					switch (optionParts[0].trim()){
						case 'spend_key':
							decodedUri.spendKey=optionParts[1];
							break;
						case 'view_key':
							decodedUri.viewKey=optionParts[1];
							break;
						case 'mnemonic_seed':
							decodedUri.mnemonicSeed=optionParts[1];
							break;
						case 'height':
							decodedUri.height=optionParts[1];
							break;
						case 'nonce':
							decodedUri.nonce=optionParts[1];
							break;
						case 'encrypt_method':
							decodedUri.encryptMethod=optionParts[1];
							break;
					}
				}
			}

			if(
				typeof decodedUri.mnemonicSeed !== 'undefined' ||
				typeof decodedUri.spendKey !== 'undefined' ||
				(typeof decodedUri.viewKey !== 'undefined' && typeof decodedUri.address !== 'undefined')
			) {
				return decodedUri;
			}else
				throw 'missing_seeds';
		}
		throw 'missing_prefix';
	}

	static isWalletValid(str : string){
		try{
			this.decodeWallet(str);
			return true;
		}catch (e) {
			return false;
		}
	}

	static encodeWalletKeys(address : string, spendKey : string, viewKey : string|null=null, height:number|null=null, encryptMethod:string|null=null,nonce:string|null=null){
		let encoded = this.coinWalletPrefix + address;
		if(address.length !== this.coinAddressLength)
			throw 'invalid_address_length';

		if(spendKey !== null) encoded += '?spend_key='+spendKey;
		if(viewKey !== null) encoded+= '?view_key='+viewKey;
		if(height !== null) encoded += '?height='+height;
		if(nonce !== null) encoded += '?nonce='+nonce;
		if(encryptMethod !== null) encoded += '?encrypt_method='+encryptMethod;
		return encoded;
	}



}