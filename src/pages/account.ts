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

import {VueClass, VueRequireFilter, VueVar} from "../lib/numbersLab/VueAnnotate";
import {DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {Wallet} from "../model/Wallet";
import {DestructableView} from "../lib/numbersLab/DestructableView";
import {Constants} from "../model/Constants";
import {AppState} from "../model/AppState";
import {Transaction, TransactionIn} from "../model/Transaction";
import {RawDaemon_Out} from "../model/blockchain/BlockchainExplorer";
import {WalletWatchdog} from "../model/WalletWatchdog";

let wallet : Wallet = DependencyInjectorInstance().getInstance(Wallet.name,'default', false);
let blockchainExplorer = DependencyInjectorInstance().getInstance(Constants.BLOCKCHAIN_EXPLORER);
let walletWatchdog : WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name,'default', false);

class AccountView extends DestructableView{
	@VueVar([]) transactions !: Transaction[];
	@VueVar(0) lastBlockLoading !: number;
	@VueVar(0) processingQueue !: number;
	@VueVar(0) walletAmount !: number;
	@VueVar(0) unlockedWalletAmount !: number;
	@VueVar(0) allTransactionsCount !: number;  
	@VueVar(0) pagesCount !: number;
	@VueVar(0) txPerPage !: number;
	@VueVar(0) ticker !: string;

	@VueVar(0) currentScanBlock !: number;
	@VueVar(0) blockchainHeight !: number;
	@VueVar(Math.pow(10, config.coinUnitPlaces)) currencyDivider !: number;

	@VueVar(false) isWalletProcessing !: boolean;  
  @VueVar(false) optimizeIsNeeded !: boolean;
  @VueVar(false) optimizeLoading !: boolean;
	@VueVar(false) isWalletSyncing !: boolean;
	@VueVar(0) optimizeOutputs !: number;
  
	intervalRefresh : NodeJS.Timer;
  refreshTimestamp: Date;
  lastPending: number;

	constructor(container : string) {
		super(container);

    this.refreshTimestamp = new Date(0);
    this.ticker = config.coinSymbol;
    this.lastPending = 0;
    this.pagesCount = 1;
    this.txPerPage = 200;
  	this.checkOptimization();
		AppState.enableLeftMenu();

		this.intervalRefresh = setInterval(() => {
			this.refresh();
		}, 1 * 1000);

		this.refresh();
	}

	destruct = (): Promise<void> => {
		clearInterval(this.intervalRefresh);
		return super.destruct();
	}

	refresh = () => {
		blockchainExplorer.getHeight().then((height : number) => {
			this.blockchainHeight = height;
		});

		this.refreshWallet();
	}

	checkOptimization = () => {
    blockchainExplorer.getHeight().then((blockchainHeight: number) => {
      let optimizeInfo = wallet.optimizationNeeded(blockchainHeight, config.optimizeThreshold);
      logDebugMsg("optimizeInfo.numOutputs", optimizeInfo.numOutputs);
      logDebugMsg('optimizeInfo.isNeeded', optimizeInfo.isNeeded);
      this.optimizeIsNeeded = optimizeInfo.isNeeded;
      if(optimizeInfo.isNeeded) {
        this.optimizeOutputs = optimizeInfo.numOutputs;
      }
    });
  }

  optimizeWallet = () => {
    this.optimizeLoading = true; // set loading state to true

    blockchainExplorer.getHeight().then((blockchainHeight: number) => {
      wallet.optimize(blockchainHeight, config.optimizeThreshold, blockchainExplorer,
        function (amounts: number[], numberOuts: number): Promise<RawDaemon_Out[]> {
          return blockchainExplorer.getRandomOuts(amounts, numberOuts);
        }).then((processedOuts: number) => {
          let watchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name);
          logDebugMsg("processedOuts", processedOuts);
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
		if(transaction.getAmount() < 0)
			feesHtml = `<div>`+i18n.t('accountPage.txDetails.feesOnTx')+`: `+(transaction.fees / Math.pow(10, config.coinUnitPlaces))+`</a></div>`;
		let paymentId = '';
		if(transaction.paymentId !== ''){
			paymentId = `<div>`+i18n.t('accountPage.txDetails.paymentId')+`: `+transaction.paymentId+`</a></div>`;
		}

		let txPrivKeyMessage = '';
		let txPrivKey = wallet.findTxPrivateKeyWithHash(transaction.hash);
		if(txPrivKey !== null){
			txPrivKeyMessage = `<div>`+i18n.t('accountPage.txDetails.txPrivKey')+`: `+txPrivKey+`</a></div>`;
		}

		swal({
			title:i18n.t('accountPage.txDetails.title'),
			html:`
        <div class="tl" >
          <div>`+i18n.t('accountPage.txDetails.txHash')+`: <a href="`+explorerUrlHash.replace('{ID}', transaction.hash)+`" target="_blank">`+transaction.hash+`</a></div>
          `+paymentId+`
          `+feesHtml+`
          `+txPrivKeyMessage+`
          <div>`+i18n.t('accountPage.txDetails.blockHeight')+`: <a href="`+explorerUrlBlock.replace('{ID}', ''+transaction.blockHeight)+`" target="_blank">`+transaction.blockHeight+`</a></div>
        </div>`
		});
	}

	refreshWallet = (forceRedraw: boolean = false) => {
    let oldIsWalletSyncing = this.isWalletSyncing;
    let timeDiff: number = new Date().getTime() - this.refreshTimestamp.getTime();
    this.processingQueue = walletWatchdog.getBlockList().getSize(); 
    this.lastBlockLoading = walletWatchdog.getLastBlockLoading();
    this.currentScanBlock = wallet.lastHeight;    

    this.isWalletSyncing = (wallet.lastHeight + 2) < this.blockchainHeight;
    this.isWalletProcessing = this.isWalletSyncing || (walletWatchdog.getBlockList().getTxQueue().getSize() > 0);

    if (oldIsWalletSyncing && !this.isWalletSyncing) {
      this.checkOptimization();
    }

    if ((((this.refreshTimestamp < wallet.modifiedTimestamp()) || (this.lastPending > 0)) && (timeDiff > 500)) || forceRedraw) {   
      logDebugMsg("refreshWallet", this.currentScanBlock);

      this.walletAmount = wallet.amount;
      this.unlockedWalletAmount = wallet.unlockedAmount(this.currentScanBlock);
      this.lastPending = this.walletAmount - this.unlockedWalletAmount;

      if ((this.refreshTimestamp < wallet.modifiedTimestamp()) || forceRedraw) {
        let allTransactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse()); 
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
}

if (wallet !== null && blockchainExplorer !== null)
	new AccountView('#app');
else
	window.location.href = '#index';