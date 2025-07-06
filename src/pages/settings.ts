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

import {DestructableView} from "../lib/numbersLab/DestructableView";
import {VueVar, VueWatched} from "../lib/numbersLab/VueAnnotate";
import {TransactionsExplorer} from "../model/TransactionsExplorer";
import {WalletRepository} from "../model/WalletRepository";
import {DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {Constants} from "../model/Constants";
import {Wallet} from "../model/Wallet";
import {AppState} from "../model/AppState";
import {Storage} from "../model/Storage";
import {Translations, tickerStore} from "../model/Translations";
import {BlockchainExplorerProvider} from "../providers/BlockchainExplorerProvider";
import {BlockchainExplorer, RawDaemon_Out} from "../model/blockchain/BlockchainExplorer";
import {WalletWatchdog} from "../model/WalletWatchdog";

let wallet : Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);
let blockchainExplorer: BlockchainExplorer = BlockchainExplorerProvider.getInstance();
let walletWatchdog : WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name,'default', false);

class SettingsView extends DestructableView{
	@VueVar(10) readSpeed !: number;
	@VueVar(false) checkMinerTx !: boolean;

	@VueVar(false) customNode !: boolean;
	@VueVar('https://node.conceal.network/') nodeUrl !: string;

	@VueVar(0) creationHeight !: number;
	@VueVar(0) scanHeight !: number;

	@VueVar(-1) maxHeight !: number;
	@VueVar('en') language !: string;

	@VueVar(0) nativeVersionCode !: number;
	@VueVar('') nativeVersionNumber !: string;

  @VueVar(false) optimizeIsNeeded !: boolean;
  @VueVar(false) optimizeLoading !: boolean;

	@VueVar(false) useShortTicker !: boolean;
	@VueVar('') currentTicker !: string;
	@VueVar(config) config !: any;

	private unsubscribeTicker: (() => void) | null = null;

	constructor(container : string) {
		super(container);
		let self = this;
		this.readSpeed = wallet.options.readSpeed;
		this.checkMinerTx = wallet.options.checkMinerTx;

		// Sync custom node setting from storage to ensure consistency
		Storage.getItem('customNodeUrl', null).then(customNodeUrl => {
			if (customNodeUrl) {
				this.customNode = true;
				this.nodeUrl = customNodeUrl;
				// Update wallet options to match storage
				wallet.options.customNode = true;
				wallet.options.nodeUrl = customNodeUrl;
			} else {
				this.customNode = wallet.options.customNode;
				this.nodeUrl = wallet.options.nodeUrl;
			}
		}).catch(() => {
			this.customNode = wallet.options.customNode;
			this.nodeUrl = wallet.options.nodeUrl;
		});

		this.creationHeight = wallet.creationHeight;
		this.scanHeight = wallet.lastHeight;

		// Initialize ticker from store
		tickerStore.initialize().then(() => {
			this.useShortTicker = tickerStore.useShortTicker;
			this.currentTicker = tickerStore.currentTicker;
			
			// Subscribe to ticker changes
			this.unsubscribeTicker = tickerStore.subscribe((useShortTicker) => {
				this.useShortTicker = useShortTicker;
				this.currentTicker = tickerStore.currentTicker;
			});
		});

		this.checkOptimization();

		blockchainExplorer.getHeight().then(function (height: number) {
			self.maxHeight = height;
    }).catch((err: any) => {
      // do nothing
    });

		Translations.getLang().then((userLang : string) => {
			this.language = userLang;
    }).catch((err: any) => {
      console.error("Error trying to get user language", err);
    });

		if(typeof (<any>window).cordova !== 'undefined' && typeof (<any>window).cordova.getAppVersion !== 'undefined') {
			(<any>window).cordova.getAppVersion.getVersionNumber().then((version : string) => {
				this.nativeVersionNumber = version;
			});
			(<any>window).cordova.getAppVersion.getVersionCode().then((version : number) => {
				this.nativeVersionCode = version;
			});
		}
	}

	@VueWatched()
	languageWatch() {
		Translations.setBrowserLang(this.language);
		Translations.loadLangTranslation(this.language);
	}

	deleteWallet() {
		swal({
			title: i18n.t('settingsPage.deleteWalletModal.title'),
			html: i18n.t('settingsPage.deleteWalletModal.content'),
			showCancelButton: true,
			confirmButtonText: i18n.t('settingsPage.deleteWalletModal.confirmText'),
			cancelButtonText: i18n.t('settingsPage.deleteWalletModal.cancelText'),
		}).then((result:any) => {
			if (result.value) {
				AppState.disconnect();
				DependencyInjectorInstance().register(Wallet.name, undefined,'default');
				WalletRepository.deleteLocalCopy();
				window.location.href = '#index';
			}
		});
	}

	resetWallet() {
		swal({
			title: i18n.t('settingsPage.resetWalletModal.title'),
			html: i18n.t('settingsPage.resetWalletModal.content'),
			showCancelButton: true,
			confirmButtonText: i18n.t('settingsPage.resetWalletModal.confirmText'),
			cancelButtonText: i18n.t('settingsPage.resetWalletModal.cancelText'),
		}).then((result:any) => {
			if (result.value) {
        walletWatchdog.stop();
        wallet.clearTransactions();
        wallet.resetScanHeight();
        walletWatchdog.start();
				window.location.href = '#account';
			}
		});
	}

  checkOptimization = () => {
    blockchainExplorer.getHeight().then((blockchainHeight: number) => {
      let optimizeInfo = wallet.optimizationNeeded(blockchainHeight, config.optimizeThreshold);
      this.optimizeIsNeeded = optimizeInfo.isNeeded;
    }).catch((err: any) => {
      console.error("Error in checkOptimization, calling getHeight", err);
    });
  }

  optimizeWallet = () => {
    this.optimizeLoading = true; // set loading state to true
    blockchainExplorer.getHeight().then((blockchainHeight: number) => {
      let optimizeInfo = wallet.optimizationNeeded(blockchainHeight, config.optimizeThreshold);

      if (optimizeInfo.isNeeded) {
        wallet.createFusionTransaction(blockchainHeight, config.optimizeThreshold, blockchainExplorer,
          function (amounts: number[], numberOuts: number): Promise<RawDaemon_Out[]> {
            return blockchainExplorer.getRandomOuts(amounts, numberOuts);
          }).then((processedOuts: number) => {
            let watchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name);
            //force a mempool check so the user is up to date
            if (watchdog !== null) {
              watchdog.checkMempool();
            }
            this.optimizeLoading = false; // set loading state to false
            setTimeout(() => {
              this.checkOptimization(); // check if optimization is still needed
            }, 1000);  
          }).catch((err) => {
            console.log(err);
            this.optimizeLoading = false; // set loading state to false
            setTimeout(() => {
              this.checkOptimization(); // check if optimization is still needed
            }, 1000);  
          });
      } else {
        swal({
          title: i18n.t('settingsPage.optimizeWalletModal.title'),
          html: i18n.t('settingsPage.optimizeWalletModal.content'),
          confirmButtonText: i18n.t('settingsPage.optimizeWalletModal.confirmText'),
          showCancelButton: false
        }).then((result:any) => {
          this.optimizeLoading = false;
        });    
      }
    }).catch((err: any) => {
      console.error("Error in optimizeWallet, calling getHeight", err);
    });
  }

	@VueWatched()	readSpeedWatch(){this.updateWalletOptions();}
	@VueWatched()	checkMinerTxWatch(){this.updateWalletOptions();}
	//@VueWatched()	customNodeWatch(){this.updateConnectionSettings();}
	//@VueWatched()	nodeUrlWatch(){this.updateConnectionSettings();}

	@VueWatched()	creationHeightWatch() {
		if(this.creationHeight < 0)this.creationHeight = 0;
		if(this.creationHeight > this.maxHeight && this.maxHeight !== -1)this.creationHeight = this.maxHeight;
	}
	@VueWatched()	scanHeightWatch() {
		if(this.scanHeight < 0)this.scanHeight = 0;
		if(this.scanHeight > this.maxHeight && this.maxHeight !== -1)this.scanHeight = this.maxHeight;
	}

	@VueWatched()
	useShortTickerWatch() {
		tickerStore.setTickerPreference(this.useShortTicker);
	}

	private updateWalletOptions() {
		let options = wallet.options;
		options.readSpeed = this.readSpeed;
		options.checkMinerTx = this.checkMinerTx;
		wallet.options = options;
    walletWatchdog.setupWorkers();
		walletWatchdog.signalWalletUpdate();
	}

	updateWalletSettings() {
		wallet.creationHeight = this.creationHeight;
		wallet.lastHeight = this.scanHeight;
		walletWatchdog.signalWalletUpdate();
	}

	updateConnectionSettings() {
		let options = wallet.options;
		let oldCustomNode = options.customNode;
		let oldNodeUrl = options.nodeUrl;
		
		options.customNode = this.customNode;
		options.nodeUrl = this.nodeUrl;
		wallet.options = options;

    if (options.customNode) {
      Storage.setItem('customNodeUrl', options.nodeUrl);
    } else {
      Storage.remove('customNodeUrl');
    }

    // Update wallet watchdog with new options
    walletWatchdog.setupWorkers();
    walletWatchdog.signalWalletUpdate();

    // Reset nodes if custom node setting changed (enabled/disabled)
    // This ensures proper switching between custom and random nodes
    if (oldCustomNode !== this.customNode) {
      console.log('Custom node setting changed, resetting nodes...');
      // Reset the node connection workers with new values
      // This will automatically clean up and reinitialize the session
      BlockchainExplorerProvider.getInstance().resetNodes();
    } else if (this.customNode && oldNodeUrl !== this.nodeUrl) {
      // Only reset if custom node URL changed (when using custom node)
      console.log('Custom node URL changed, resetting nodes...');
      BlockchainExplorerProvider.getInstance().resetNodes();
    } else {
      console.log('Node configuration unchanged, skipping node reset');
    }
	}

	destruct = (): Promise<void> => {
		// Cleanup ticker subscription
		if (this.unsubscribeTicker) {
			this.unsubscribeTicker();
		}
		return super.destruct();
	}
}


if(wallet !== null && blockchainExplorer !== null)
	new SettingsView('#app');
else
	window.location.href = '#index';
