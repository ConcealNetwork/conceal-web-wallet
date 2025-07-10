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

import {Router} from "./lib/numbersLab/Router";
import {Mnemonic} from "./model/Mnemonic";
import {DestructableView} from "./lib/numbersLab/DestructableView";
import {VueClass, VueVar, VueWatched} from "./lib/numbersLab/VueAnnotate";
import {Storage} from "./model/Storage";
import {Translations} from "./model/Translations";
import {Transaction} from "./model/Transaction";
import { initializeMessageMenu } from "./lib/numbersLab/messageClick";

//========================================================
//bridge for cnUtil with the new mnemonic class
//========================================================
(<any>window).mn_random = Mnemonic.mn_random;
(<any>window).mn_encode = Mnemonic.mn_encode;
(<any>window).mn_decode = Mnemonic.mn_decode;

//========================================================
//====================Translation code====================
//========================================================
const i18n = new VueI18n({
	locale: 'en',
	fallbackLocale: 'en',
});
(<any>window).i18n = i18n;

let browserUserLang = ''+(navigator.language || (<any>navigator).userLanguage);
browserUserLang = browserUserLang.toLowerCase().split('-')[0];

// Create a promise that resolves when i18n is ready
const i18nReadyPromise = new Promise<void>((resolve) => {
	Storage.getItem('user-lang', browserUserLang).then(function(userLang : string) {
		if (userLang) {
			Translations.loadLangTranslation(userLang).catch(err => {
				console.error(`Failed to load '${userLang}' language`, err);
				return Translations.loadLangTranslation('en');
			
			}).catch(err => {
				console.error("Failed to load 'en' language", err);
			}).finally(() => {
				resolve();
			});
		} else {
			resolve();
		}
	});
});

(window as any).i18nReadyPromise = i18nReadyPromise;
(window as any).safeSwal = function(options: any) {
	return i18nReadyPromise.then(() => {
		return swal(options);
	});
};


//========================================================
//====================Generic design======================
//========================================================

@VueClass()
class MenuView extends Vue{
	isMenuHidden : boolean = false;

	constructor(containerName:any,vueData:any=null){
		super(vueData);
		this.isMenuHidden = $('body').hasClass('menuHidden');
		if($('body').hasClass('menuDisabled'))
			this.isMenuHidden = true;
		this.update();
	}

	toggle(){
		if($('body').hasClass('menuDisabled'))
			this.isMenuHidden = true;
		else
			this.isMenuHidden = !this.isMenuHidden;

		this.update();
	}
	update(){
		if(this.isMenuHidden)
			$('body').addClass('menuHidden');
		else
			$('body').removeClass('menuHidden');
	}
}
let menuView = new MenuView('#menu');

$('#menu a').on('click',function(event:Event){
	menuView.toggle();
});
$('#menu').on('click',function(event:Event){
	event.stopPropagation();
});

$('#topBar .toggleMenu').on('click',function(event:Event){
	menuView.toggle();
	event.stopPropagation();
	return false;
});

$(window).click(function() {
	menuView.isMenuHidden = true;
	$('body').addClass('menuHidden');
});

//mobile swipe
let pageWidth = window.innerWidth || document.body.clientWidth;
let treshold = Math.max(1,Math.floor(0.2 * (pageWidth)));
let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;

const gestureZone : HTMLElement= $('body')[0];

gestureZone.addEventListener('touchstart', function(event : TouchEvent) {
	touchstartX = event.changedTouches[0].screenX;
	touchstartY = event.changedTouches[0].screenY;
}, false);

gestureZone.addEventListener('touchend', function(event : TouchEvent) {
	touchendX = event.changedTouches[0].screenX;
	touchendY = event.changedTouches[0].screenY;
	handleGesture(event);
}, false);

const limit = 0.8; // Add this constant before handleGesture function

function handleGesture(e : Event) {
	let x = touchendX - touchstartX;
	let y = touchendY - touchstartY;
	let xy = Math.abs(x / y);
	let yx = Math.abs(y / x);
	if (Math.abs(x) > treshold) {   // || Math.abs(y) > treshold      ----- >   do we care about y other than a big diagonal swipe already taken into account by xy and yx ?
		if (yx <= limit) {
			if (x < 0) {
				//left
				if(!menuView.isMenuHidden)
					menuView.toggle();
			} else {
				//right
				if(menuView.isMenuHidden)
					menuView.toggle();
			}
		}
		if (xy <= limit) {
			if (y < 0) {
				//top
			} else {
				//bottom
			}
		}
	} else {
		//tap
	}
}
//Collapse the menu after clicking on a menu item
function navigateToPage(page: string) {
	window.location.hash = `!${page}`;
  }

function isMobileDevice() {
	return window.innerWidth <= 600; // Adjust this breakpoint as needed
  }
  
  // Select all menu items
  const menuItems = document.querySelectorAll('#menu a[href^="#!"]');
  
  menuItems.forEach(item => {
	item.addEventListener('click', (event) => {
	  // Prevent the default action
	  event.preventDefault();
  
	  const target = (event.currentTarget as HTMLAnchorElement).getAttribute('href');
  
	  if (target) {
		// Remove the "#!" from the beginning of the href
		const page = target.substring(2);
		navigateToPage(page);
  
		// Toggle the menu off only on mobile devices
		if (isMobileDevice() && !menuView.isMenuHidden) {
		  menuView.toggle();
		}
	  }
	});
  });



@VueClass()
class CopyrightView extends Vue{

	@VueVar('en') language !: string;

	constructor(containerName:any,vueData:any=null){
		super(vueData);

		Translations.getLang().then((userLang : string) => {
			this.language = userLang;
		});
	}

	@VueWatched()
	languageWatch(){
		Translations.setBrowserLang(this.language);
		Translations.loadLangTranslation(this.language).catch(err => {
      console.error(`Failed to load "${this.language}" language`, err);
    });
	}
}
let copyrightView = new CopyrightView('#copyright');

//========================================================
//==================Loading the right page================
//========================================================

let isCordovaApp = document.URL.indexOf('http://') === -1
	&& document.URL.indexOf('https://') === -1;

let promiseLoadingReady : Promise<void>;

window.native = false;
if(isCordovaApp){
	window.native = true;
	$('body').addClass('native');

	let promiseLoadingReadyResolve : null|Function = null;
	let promiseLoadingReadyReject : null|Function = null;
	promiseLoadingReady = new Promise<void>(function(resolve, reject){
		promiseLoadingReadyResolve = resolve;
		promiseLoadingReadyReject = reject;
	});
	let cordovaJs = document.createElement('script');
	cordovaJs.type = 'text/javascript';
	cordovaJs.src = 'cordova.js';
	document.body.appendChild(cordovaJs);

	let timeoutCordovaLoad = setTimeout(function(){
		if(promiseLoadingReadyResolve)
			promiseLoadingReadyResolve();
	}, 10*1000);
	document.addEventListener('deviceready', function(){
		if(promiseLoadingReadyResolve)
			promiseLoadingReadyResolve();
		clearInterval(timeoutCordovaLoad);
	}, false);

}else
	promiseLoadingReady = Promise.resolve();

promiseLoadingReady.then(function(){
	let router = new Router('./','../../');
	window.onhashchange = function () {
		router.changePageFromHash();
	};
	
	// Initialize message menu after the page is ready
	initializeMessageMenu();
});

//========================================================
//==================Service worker for web================
//========================================================
//only install the service on web platforms and not native

console.log(`%c                                            
 .d8888b.  888                       888    
d88P  Y88b 888                       888    
Y88b.      888                       888    This is a browser feature intended for 
 "Y888b.   888888  .d88b.  88888b.   888    developers. If someone told you to copy-paste 
    "Y88b. 888    d88""88b 888 "88b  888    something here to enable a feature 
      "888 888    888  888 888  888  Y8P    or "hack" someone\'s account, it is a 
Y88b  d88P Y88b.  Y88..88P 888 d88P         scam and will give them access to your 
 "Y8888P"   "Y888  "Y88P"  88888P"   888    Conceal Network Wallet!
                           888              
                           888              
                           888              

IA Self-XSS scam tricks you into compromising your wallet by claiming to provide a way to log into someone else's wallet, or some other kind of reward, after pasting a special code or link into your web browser.`, "font-family:monospace")

if (!isCordovaApp && 'serviceWorker' in navigator) {
	// Flag to prevent showing the same update multiple times
	let updateModalShown = false;
	
	const showRefreshUI = function(registration : any){
		// Prevent showing the same update multiple times
		if (updateModalShown) {
			return;
		}
		updateModalShown = true;
		
		// Use safeSwal which automatically waits for i18n
		(window as any).safeSwal({
			type:'info',
			title:i18n.t('global.newVersionModal.title'),
			html:i18n.t('global.newVersionModal.content'),
			confirmButtonText:i18n.t('global.newVersionModal.confirmText'),
			showCancelButton: true,
			cancelButtonText:i18n.t('global.newVersionModal.cancelText'),
		}).then(function(value : any){
			if(!value.dismiss){
				registration.waiting.postMessage('force-activate');
			} else {
				// Reset flag when user cancels so they can see it again later
				updateModalShown = false;
			}
		});
	};

	const onNewServiceWorker = function(registration:any, callback : Function){
		if (registration.waiting) {
			// SW is waiting to activate. Can occur if multiple clients open and
			// one of the clients is refreshed.
			return callback();
		}

		const listenInstalledStateChange = () => {
			registration.installing.addEventListener('statechange', (event : Event) => {
				if ((<any>event.target).state === 'installed') {
					// A new service worker is available, inform the user
					callback();
				}
			});
		};

		if (registration.installing) {
			return listenInstalledStateChange();
		}

		// We are currently controlled so a new SW may be found...
		// Add a listener in case a new SW is found,
		registration.addEventListener('updatefound', listenInstalledStateChange);
	};

	navigator.serviceWorker.addEventListener('message', (event) => {
		if (!event.data) {
			return;
		}

		switch (event.data) {
			case 'reload-window-update':
				window.location.reload();
				break;
			default:
				// NOOP
				break;
		}
	});

	navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
		// Track updates to the Service Worker.
		if (!navigator.serviceWorker.controller) {
			// The window client isn't currently controlled so it's a new service
			// worker that will activate immediately
			return;
		}

		//console.log('on new service worker');
		onNewServiceWorker(registration, () => {
			showRefreshUI(registration);
		});
	});
}
