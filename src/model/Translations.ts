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

import {Storage} from "./Storage";


// Ticker store class to manage ticker state
export class TickerStore {
	private static instance: TickerStore;
	private _useShortTicker: boolean = false;
	private listeners: Set<(useShortTicker: boolean) => void> = new Set();

	private constructor() {
		// Private constructor for singleton
	}

	static getInstance(): TickerStore {
		if (!TickerStore.instance) {
			TickerStore.instance = new TickerStore();
		}
		return TickerStore.instance;
	}

	// Initialize the store
	async initialize(): Promise<void> {
		this._useShortTicker = await Storage.getItem('useShortTicker', false);
	}

	// Get current ticker preference
	get useShortTicker(): boolean {
		return this._useShortTicker;
	}

	// Get current ticker symbol
	get currentTicker(): string {
		return this._useShortTicker ? config.coinSymbolShort : config.coinSymbol;
	}

	// Set ticker preference and notify listeners
	async setTickerPreference(useShortTicker: boolean): Promise<void> {
		this._useShortTicker = useShortTicker;
		await Storage.setItem('useShortTicker', useShortTicker);
		this.notifyListeners();
	}

	// Subscribe to ticker changes
	subscribe(listener: (useShortTicker: boolean) => void): () => void {
		this.listeners.add(listener);
		// Return unsubscribe function
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		this.listeners.forEach(listener => listener(this._useShortTicker));
	}
}

// Export singleton instance
export const tickerStore = TickerStore.getInstance();

export class Translations{

	static getBrowserLang() : string{
		let browserUserLang = ''+(navigator.language || (<any>navigator).userLanguage);
		browserUserLang = browserUserLang.toLowerCase().split('-')[0];
		return browserUserLang;
	}

	static getLang() : Promise<string>{
		return Storage.getItem('user-lang', Translations.getBrowserLang());
	}

	static setBrowserLang(lang : string){
		Storage.setItem('user-lang', lang);
	}

	static getTickerPreference(): Promise<boolean> {
		return tickerStore.initialize().then(() => tickerStore.useShortTicker);
	}

	static setTickerPreference(useShortTicker: boolean) {
		return tickerStore.setTickerPreference(useShortTicker);
	}

	static getCurrentTicker(): string {
		return tickerStore.currentTicker;
	}

	static storedTranslations : any = {};

	static loadLangTranslation(lang : string) : Promise<void>{
		//console.log('setting lang to '+lang);
		let promise : Promise<{messages?: any, date?: string, number?: string }>;
		if(typeof Translations.storedTranslations[lang] !== 'undefined')
			promise = Promise.resolve(Translations.storedTranslations[lang]);
		else
			promise = new Promise<{messages?: any, date?: string, number?: string }>(function (resolve, reject) {
				$.ajax({
					url: './translations/' + lang + '.json'
				}).then(function (data: any) {
					if(typeof data === 'string')data = JSON.parse(data);
					Translations.storedTranslations[lang] = data;
					resolve(data);
				}).fail(function () {
					reject();
				});
			});

		promise.then(function(data: { website?:any,messages?: any, date?: string, number?: string }){
			if (typeof data.date !== 'undefined')
				i18n.setDateTimeFormat(lang, data.date);
			if (typeof data.number !== 'undefined')
				i18n.setNumberFormat(lang, data.number);
			if (typeof data.messages !== 'undefined')
				i18n.setLocaleMessage(lang, data.messages);

			i18n.locale = lang;

			$('title').html(data.website.title);
			$('meta[property="og:title"]').attr('content',data.website.title);
			$('meta[property="twitter:title"]').attr('content',data.website.title);

			$('meta[name="description"]').attr('content',data.website.description);
			$('meta[property="og:description"]').attr('content',data.website.description);
			$('meta[property="twitter:description"]').attr('content',data.website.description);


			let htmlDocument = document.querySelector('html');
			if (htmlDocument !== null)
				htmlDocument.setAttribute('lang', lang);
		});

		return (<any>promise);
	}

}