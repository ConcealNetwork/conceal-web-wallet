/*
 * Copyright 2018 NumbersLab - https://github.com/NumbersLab
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {Logger} from "./Logger";
import {DestructableView} from "./DestructableView";
import {Context} from "./Context";
import { isAllowedPage, isAllowedException, validateExceptionsIntegrity } from '../config/allowedPages';

export class Router {
	currentPage: string | null = null;

	routerBaseHtmlRelativity = './';
	routerBaseJsRelativity = '../';

	urlPrefix = '!';

	constructor(routerBaseHtmlRelativity  : string = './', routerBaseRelativity : string = '../') {
		let self = this;
		this.routerBaseHtmlRelativity = routerBaseHtmlRelativity;
		this.routerBaseJsRelativity = routerBaseRelativity;
		
		this.changePage(Router.extractPageFromUrl());
	}

	/**
	 * Get the current page from the url or fallback on index
	 * @returns {any}
	 */
	static extractPageFromUrl() {
		let pageName = 'index';
		if (window.location.hash.indexOf('#!') != -1) {
			pageName = window.location.hash.slice(2);
		} else if (window.location.hash.indexOf('#') != -1) {
			pageName = window.location.hash.slice(1);
		}
		return encodeURIComponent(pageName);
	}

	changePageFromHash(){
		this.changePage(Router.extractPageFromUrl());
	}

	/**
	 * Change the current page by loading the new content in the same page,
	 * Update the browser history
	 * @param {string} completeNewPageName
	 */
	async changePage(completeNewPageName: string, replaceState: boolean = false) {
		let self = this;
		
		// Extract the base page name without query parameters
		let newPageName = completeNewPageName;
		if (newPageName.indexOf('?') !== -1) {
			newPageName = newPageName.slice(0, newPageName.indexOf('?'));
		}

		// If it's an exception, validate its integrity
		if (isAllowedException(completeNewPageName)) {
			const isValid = await validateExceptionsIntegrity();
			Logger.debug(this, 'Exception validation - URL: {url}, Is Valid: {isValid}', {
				url: completeNewPageName,
				isValid: isValid
			});
			if (!isValid) {
				Logger.error(this, 'Exceptions integrity check failed');
				this.changePage('index', true);
				return;
			}
		}
		// For regular pages, just check if they're allowed
		else if (!isAllowedPage(newPageName)) {
			Logger.error(this, 'Attempted to access unauthorized page: {page}', {
				page: newPageName
			});
			this.changePage('index', true);
			return;
		}

		Logger.info(this, 'Changing page to {newPage} from {oldPage}', {
			newPage: completeNewPageName,
			oldPage: this.currentPage
		});

		$('#pageLoading').show();

		let currentView = DestructableView.getCurrentAppView();
		let promiseDestruct: Promise<void>;
		if (currentView !== null) {
			promiseDestruct = currentView.destruct();
			currentView = null;
			DestructableView.setCurrentAppView(null);
		} else {
			promiseDestruct = Promise.resolve();
		}

		//we wait the promise of destruction in case of something that could take time
		promiseDestruct.then(function () {
			self.currentPage = completeNewPageName;

			Logger.debug(self, 'Changing to page '+self.currentPage);

			// If it's an allowed exception, use the decoded page name for loading content
			let pageToLoad = newPageName;
			if (isAllowedException(completeNewPageName)) {
				const decodedHash = decodeURIComponent(window.location.hash);
				pageToLoad = decodedHash.split('?')[0].replace('#', '');
			}

			let promiseContent = self.loadContent(self.routerBaseHtmlRelativity+'pages/' + pageToLoad + '.html');
			let jsContentPath = self.routerBaseJsRelativity+'pages/' + pageToLoad + '.js';

			Promise.all([promiseContent]).then(function (data: string[]) {
				let content = data[0];
				self.injectNewPage(content, jsContentPath);
			}).catch(function (error) {
				$('#pageLoading').hide();
			});
		});
	}

	/**
	 * Inject the content in the current page
	 * @param content
	 * @param jsContentPath
	 */
	injectNewPage(content: string, jsContentPath: string | null) {
		// Double-check security - validate jsContentPath
		if (jsContentPath !== null) {
			const pageName = jsContentPath.split('/').pop()?.replace('.js', '');
			if (!pageName || (!isAllowedPage(pageName) && !isAllowedException(window.location.hash))) {
				Logger.error(this, 'Attempted to inject unauthorized page: {page}', {
					page: pageName
				});
				return;
			} else if (isAllowedException(window.location.hash)) {
				// For allowed exceptions, decode the URL but keep the query parameters
				const decodedHash = decodeURIComponent(window.location.hash);
				const actualPageName = decodedHash.split('?')[0].replace('#', '');
				// Keep the original hash with query parameters for the page to use
				window.location.hash = decodedHash;
				jsContentPath = this.routerBaseJsRelativity + 'pages/' + actualPageName + '.js';
			}
		}

		$('#page').hide().html(content);
		if (jsContentPath !== null) {
			this.unloadRequirejs(jsContentPath);
			this.unloadRequirejs(jsContentPath.replace(this.routerBaseJsRelativity, ''));
			requirejs([jsContentPath], function (App) {
				$('#page').show();
				$('#pageLoading').hide();
			}, function (err) {
				$('#page').show();
				$('#pageLoading').hide();
			});
		}
	}

	/**
	 * Load the content of an url and return it with a Promise
	 * @param {string} url
	 * @returns {Promise<string>}
	 */
	loadContent(url: string): Promise<string> {
		return new Promise<string>(async (resolve, reject) => {
			try {
				const response = await fetch(url);
				
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
				
				const html = await response.text();
				resolve(html);
			} catch (error: any) {
				console.error("Failed to load content from %s: %s", url, error.message);
				reject();
			}
		});
	}


	/**
	 * Unload data from RequireJs to be able to reinject the page
	 * @param moduleName
	 */
	unloadRequirejs(moduleName: string) {
		//console.log('unload '+moduleName);
		let context = Context.getGlobalContext()['requirejs'].s.contexts['_'];

		//console.log('unload', moduleName, context.defined[moduleName], context.defined);
		if (typeof context.defined[moduleName] !== 'undefined') {
			delete context.defined[moduleName];
		}
		if (typeof context.urlFetched[moduleName] !== 'undefined') {
			delete context.urlFetched[moduleName];
		}
		let scripts = document.getElementsByTagName('script');
		for (let i = scripts.length - 1; i >= 0; i--) {
			let script = scripts[i];
			if (script.getAttribute('data-requiremodule') === moduleName) {
				if (script.parentNode !== null) {
					script.parentNode.removeChild(script);
				}
				break;
			}
		}
	}

}