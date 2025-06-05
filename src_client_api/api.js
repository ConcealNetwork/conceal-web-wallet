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

// Load environment variables if available
try {
	require('dotenv').config();
} catch (e) {
	console.log('dotenv not available, using default values');
}

var ConcealAPI = new function(){

	this.ready = false;
	this.apiDomain = 'http://localhost:38090';
	this.timeoutErrorTime = 10000;
	this.timeoutError = 10000;
	this.apiIntegrityHash = process.env.API_INTEGRITY_HASH || 'sha384-akR4d4WI0aBIvwvuucK9YnuVVRJrj+riPGFT2l9zCHty3n71nJ60rUqm0rjG67Z4';

	var self = this;

	this.promisesResolves = {};
	this.promisesReject = {};

	this.iframe = null;
	this.popupParameters = undefined;
	// this.popupParameters = "menubar=no, status=no, scrollbars=no, menubar=no, width=200, height=100";

	this.registerPromise = function(eventName, resolve, reject){
		this.promisesReject[eventName] = reject;
		this.promisesResolves[eventName] = resolve;
	};

	this.unregisterPromise = function(eventName){
		if(typeof this.promisesReject[eventName] !== 'undefined') delete this.promisesReject[eventName];
		if(typeof this.promisesResolves[eventName] !== 'undefined') delete this.promisesResolves[eventName];
	};

	this.init  = function(){
		window.addEventListener('message', function(e){
			if(e.origin === self.apiDomain){
				console.log(e);
				var eventType = e.data.type;
				var eventData = e.data.payload;
				console.log('event type:',eventType);
				// if(eventType === 'ready'){
					self.promisesResolves[eventType](eventData);
					self.unregisterPromise(eventType);
				// }
			}
		});

		return new Promise(function(resolve, reject){
			self.registerPromise('ready', resolve, reject);
			var ifrm = document.createElement("iframe");
			ifrm.setAttribute("src", self.apiDomain+"/api.html");
			ifrm.setAttribute("integrity", self.apiIntegrityHash);
			ifrm.setAttribute("crossorigin", "anonymous");
			ifrm.style.width = "0";
			ifrm.style.height = "0";
			ifrm.style.display = 'none';

			self.timeoutError = setTimeout(function(){
				self.promisesReject['ready'](eventData);
				self.unregisterPromise('ready');
			},self.timeoutErrorTime);

			ifrm.addEventListener('load', function(){
				console.log('Iframe loaded successfully - integrity check passed');
				clearTimeout(self.timeoutError);
				self.timeoutError = 0;
			});

			self.iframe = ifrm;
			document.body.appendChild(ifrm);
		});
	};

	this.hasWallet = function(){
		return new Promise(function(resolve, reject){
			self.registerPromise('hasWallet', resolve, reject);
			self.iframe.contentWindow.postMessage('hasWallet', '*');
		});
	};

	this.makeTransfer = function(options){
		var url = this.apiDomain+'/#!send?';
		if(typeof options.amount !== 'undefined')url += 'amount='+options.amount+'&';
		if(typeof options.address !== 'undefined')url += 'address='+options.address+'&';
		if(typeof options.description !== 'undefined')url += 'txDesc='+options.description+'&';
		if(typeof options.destName !== 'undefined')url += 'destName='+options.destName+'&';

		window.open(url,"Conceal Network",this.popupParameters);

		return Promise.resolve();
	};

};