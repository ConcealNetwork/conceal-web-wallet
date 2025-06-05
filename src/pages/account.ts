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

import {VueClass, VueRequireFilter, VueVar, VueWatched} from "../lib/numbersLab/VueAnnotate";
import {DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {Wallet} from "../model/Wallet";
import {DestructableView} from "../lib/numbersLab/DestructableView";
import {Constants} from "../model/Constants";
import {AppState} from "../model/AppState";
import {Transaction, TransactionIn} from "../model/Transaction";
import {RawDaemon_Out} from "../model/blockchain/BlockchainExplorer";
import {WalletWatchdog} from "../model/WalletWatchdog";
import {CnUtils} from "../model/Cn";
import {Translations, tickerStore} from "../model/Translations";


let wallet : Wallet = DependencyInjectorInstance().getInstance(Wallet.name,'default', false);
let blockchainExplorer = DependencyInjectorInstance().getInstance(Constants.BLOCKCHAIN_EXPLORER);
let walletWatchdog : WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name,'default', false);

class AccountView extends DestructableView{
	@VueVar([]) transactions !: Transaction[];
  	@VueVar('') txFilter !: string;
	@VueVar(0) lastBlockLoading !: number;
	@VueVar(0) processingTxQueue !: number;
	@VueVar(0) processingQueue !: number;
	@VueVar(0) walletAmount !: number;
	@VueVar(0) unlockedWalletAmount !: number;
	@VueVar(0) depositedWalletAmount !: number;
	@VueVar(0) withdrawableWalletAmount !: number;
  @VueVar(0) futureLockedInterest !: number;
  @VueVar(0) futureUnlockedInterest !: number;
	@VueVar(0) allTransactionsCount !: number;
	@VueVar(0) pagesCount !: number;
	@VueVar(0) txPerPage !: number;
	@VueVar('') ticker !: string;
	@VueVar(false) private useShortTicker !: boolean;

	@VueVar(0) currentScanBlock !: number;
	@VueVar(0) blockchainHeight !: number;
	@VueVar(Math.pow(10, config.coinUnitPlaces)) currencyDivider !: number;

	@VueVar(false) isWalletProcessing !: boolean;
  	@VueVar(false) optimizeIsNeeded !: boolean;
  	@VueVar(false) optimizeLoading !: boolean;
	@VueVar(false) isWalletSyncing !: boolean;
	@VueVar(0) optimizeOutputs !: number;
  @VueVar(false) showDepositsFuture!: boolean;
  @VueVar(false) showWithdrawableFuture!: boolean;

  @VueVar(false) private isInitialized: boolean = false;
	@VueVar(0) private messagesCountRecord: number = 0;

  readonly refreshInterval = 500;
	private intervalRefresh : NodeJS.Timeout;
  private refreshTimestamp: Date;
  private oldTxFilter: string;
  private lastPending: number;
  private initMessagesCount: number = wallet.txsMem.concat(wallet.getTransactionsCopy()).filter(tx => tx.message).length;

	private unsubscribeTicker: (() => void) | null = null;

	@VueVar(false) showOptimizePanel!: boolean;
	private optimizePanelTimeout: NodeJS.Timeout | null = null;

	constructor(container : string) {
		super(container);

    this.refreshTimestamp = new Date(0);

    this.lastPending = 0;
    this.pagesCount = 1;
    this.txPerPage = 200;
    this.oldTxFilter = '';
    this.txFilter = '';

    // Initialize ticker from store
    tickerStore.initialize().then(() => {
      this.useShortTicker = tickerStore.useShortTicker;
      this.ticker = tickerStore.currentTicker;
      
      // Subscribe to ticker changes
      this.unsubscribeTicker = tickerStore.subscribe((useShortTicker) => {
        this.useShortTicker = useShortTicker;
        this.ticker = tickerStore.currentTicker;
      });
    });
    this.checkOptimization();
		AppState.enableLeftMenu();

		this.intervalRefresh = setInterval(() => {
			this.refresh();
		}, 1 * 1000);

		this.refresh();

		this.showOptimizePanel = false;

		(window as any).accountView = this;
	}

	destruct = (): Promise<void> => {
    // Cleanup ticker subscription
    if (this.unsubscribeTicker) {
      this.unsubscribeTicker();
    }
    if (this.optimizePanelTimeout) clearTimeout(this.optimizePanelTimeout);
    clearInterval(this.intervalRefresh);
		return super.destruct();
  }

	refresh = () => {
		blockchainExplorer.getHeight().then((height : number) => {
			this.blockchainHeight = height;
      this.refreshWallet();
      this.updateMessageNotifications();
    }).catch((err: any) => {
      this.refreshWallet();
    });
	}
	
        onFilterChanged = () => {
    this.refreshWallet();		
  }

	checkOptimization = () => {
    blockchainExplorer.getHeight()
      .then((blockchainHeight: number) => {
        try {
          let optimizeInfo = wallet.optimizationNeeded(blockchainHeight, config.optimizeThreshold);
          
          this.optimizeIsNeeded = optimizeInfo.isNeeded;
          if(optimizeInfo.isNeeded) {
            this.optimizeOutputs = optimizeInfo.numOutputs;
            this.showOptimizePanel = true;
            if (this.optimizePanelTimeout) clearTimeout(this.optimizePanelTimeout);
            this.optimizePanelTimeout = setTimeout(() => {
              this.showOptimizePanel = false;
            }, 20000);
          } else {
            this.showOptimizePanel = false;
            if (this.optimizePanelTimeout) clearTimeout(this.optimizePanelTimeout);
          }
        } catch (innerError) {
          if (innerError === null) return;
          throw innerError;
        }
      })
      .catch((err: any) => {
        if (err === null) return;
        console.error("Error in checkOptimization:", err);
      });
  }

  optimizeWallet = () => {
    this.optimizeLoading = true; // set loading state to true

    blockchainExplorer.getHeight().then((blockchainHeight: number) => {
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
          console.error("optimize error:", err);
          this.optimizeLoading = false; // set loading state to false
          setTimeout(() => {
            this.checkOptimization(); // check if optimization is still needed
          }, 1000);  
        });      
    }).catch((err: any) => {
      console.error("Error in optimizeWallet, trying to call getHeight", err);
    });
  }

  increasePageCount = () => {
    ++this.pagesCount;
    this.refreshWallet(true);
  }

	moreInfoOnTx = (transaction : Transaction) => {
		let explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
		let explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
		let feesHtml = '';
		if (transaction.fees > 0) {
			feesHtml = `<div><span class="txDetailsLabel">`+i18n.t('accountPage.txDetails.feesOnTx')+`</span>:<span class="txDetailsValue">`+(transaction.fees / Math.pow(10, config.coinUnitPlaces))+`</a></span></div>`;
    }
		let paymentId = '';
		if (transaction.paymentId) {
			paymentId = `<div><span class="txDetailsLabel">`+i18n.t('accountPage.txDetails.paymentId')+`</span>:<span class="txDetailsValue">`+transaction.paymentId+`</a></span></div>`;
		}

		let txPrivKeyMessage = '';
		let txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
		if (txPrivKey) {
			txPrivKeyMessage = `<div><span class="txDetailsLabel">`+i18n.t('accountPage.txDetails.txPrivKey')+`</span>:<span class="txDetailsValue">`+txPrivKey+`</a></span></div>`;
		}
    let messageText = '';
    if (transaction.message) {
      messageText = `<div><span class="txDetailsLabel">`+i18n.t('accountPage.txDetails.message')+`</span>:<span class="txDetailsValue">` + transaction.message + `</span>`;
    }

		swal({
			title:i18n.t('accountPage.txDetails.title'),
      customClass:'swal-wide',
			html:`
        <div class="tl" >
          <div><span class="txDetailsLabel">`+i18n.t('accountPage.txDetails.txHash')+`</span>:<span class="txDetailsValue"><a href="`+explorerUrlHash.replace('{ID}', transaction.hash)+`" target="_blank">`+transaction.hash+`</a></span></div>
          `+paymentId+`
          `+feesHtml+`
          `+txPrivKeyMessage+`
          <div><span class="txDetailsLabel">`+i18n.t('accountPage.txDetails.blockHeight')+`</span>:<span class="txDetailsValue"><a href="`+explorerUrlBlock.replace('{ID}', ''+transaction.blockHeight)+`" target="_blank">`+transaction.blockHeight+`</a></span></div>
          `+(transaction.fusion ? '<div><span class="txDetailsLabel">Fusion:</span><span class="txDetailsValue">true</span></div>' : '')+`
          `+messageText+`          
        </div>`
		});
	}

	refreshWallet = (forceRedraw: boolean = false) => {
    let filterChanged = false;
    let oldIsWalletSyncing = this.isWalletSyncing;
    let timeDiff: number = new Date().getTime() - this.refreshTimestamp.getTime();
    this.processingTxQueue = walletWatchdog.getBlockList().getTxQueue().getSize();
    this.processingQueue = walletWatchdog.getBlockList().getSize();
    this.lastBlockLoading = walletWatchdog.getLastBlockLoading();
    this.currentScanBlock = wallet.lastHeight;    

    this.isWalletSyncing = (wallet.lastHeight + 2) < this.blockchainHeight;
    this.isWalletProcessing = this.isWalletSyncing || (walletWatchdog.getBlockList().getTxQueue().hasData());
    
    if (oldIsWalletSyncing && !this.isWalletSyncing) {
      this.checkOptimization();
    }

    if (this.oldTxFilter !== this.txFilter) {
      timeDiff = 2 * this.refreshInterval;
      this.oldTxFilter = this.txFilter;
      filterChanged = true;
    }

    if ((((this.refreshTimestamp < wallet.modifiedTimestamp()) || (this.lastPending > 0)) && (timeDiff > this.refreshInterval)) || forceRedraw || filterChanged) {
      logDebugMsg("refreshWallet", this.currentScanBlock);      

      this.walletAmount = wallet.amount;
      this.unlockedWalletAmount = wallet.availableAmount(this.currentScanBlock);
      this.depositedWalletAmount = wallet.lockedDeposits(this.currentScanBlock);
      this.withdrawableWalletAmount = wallet.unlockedDeposits(this.currentScanBlock);
      this.lastPending = this.walletAmount - this.unlockedWalletAmount;
      this.futureLockedInterest = wallet.futureDepositInterest(this.currentScanBlock).locked;
      this.futureUnlockedInterest = wallet.futureDepositInterest(this.currentScanBlock).unlocked;

      if ((this.refreshTimestamp < wallet.modifiedTimestamp()) || forceRedraw || filterChanged) {
        let allTransactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());

        if (this.txFilter) {
          allTransactions = allTransactions.filter(tx => {
            return (tx.hash.toUpperCase().includes(this.txFilter.toUpperCase()) ||
                    tx.paymentId.toUpperCase().includes(this.txFilter.toUpperCase()) ||
                    tx.getAmount().toString().toUpperCase().includes(this.txFilter.toUpperCase()));
          });
        }

        this.transactions = allTransactions.slice(0, this.pagesCount * this.txPerPage);
        this.allTransactionsCount = allTransactions.length;

        if (!this.isWalletSyncing) {
          this.checkOptimization();
        }
      }

      // set new refresh timestamp to
      this.refreshTimestamp = new Date();
    }
	}

  download = () => {
    // credit: https://www.bitdegree.org/learn/javascript-download
    let text = JSON.stringify(this.transactions);
    let filename = 'cats.json';
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
    document.body.removeChild(element);     
  }  

  private updateMessageNotifications() {
    if (!this.isInitialized) {
        this.initMessagesCount = wallet.txsMem.concat(wallet.getTransactionsCopy()).filter(tx => tx.message).length;
        this.isInitialized = true;
    } else {
        let previousMessagesCount = this.initMessagesCount;
        let currentMessagesCount = wallet.txsMem.concat(wallet.getTransactionsCopy()).filter(tx => tx.message).length;
        let newMessagesCount = currentMessagesCount - previousMessagesCount;
        
        if (newMessagesCount > this.messagesCountRecord) {
            const messageItem = document.querySelector('#menu a[href="#!messages"]');
            if (messageItem) {
                const messageText = messageItem.querySelector('span:last-child');
                if (messageText && messageText.textContent) {
                    messageItem.classList.add('font-bold');
                    if (messageText.textContent.includes('(+')) {
                        messageText.textContent = messageText.textContent.split('(')[0] + `(+${newMessagesCount})`;
                    } else {
                        messageText.textContent += ` (+${newMessagesCount})`;
                    }
                }
                this.messagesCountRecord = newMessagesCount;
            }
        }
    }
  }

}

if (wallet !== null && blockchainExplorer !== null)
	new AccountView('#app');
else
	window.location.href = '#index';
