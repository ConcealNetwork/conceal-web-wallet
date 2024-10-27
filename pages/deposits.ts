/*
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

import {DestructableView} from "../lib/numbersLab/DestructableView";
import {VueRequireFilter, VueVar, VueWatched} from "../lib/numbersLab/VueAnnotate";
import {TransactionsExplorer} from "../model/TransactionsExplorer";
import {Autowire, DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {Wallet} from "../model/Wallet";
import {Url} from "../utils/Url";
import {CoinUri} from "../model/CoinUri";
import {QRReader} from "../model/QRReader";
import {AppState} from "../model/AppState";
import {Transaction, TransactionIn, Deposit} from "../model/Transaction";
import {BlockchainExplorerProvider} from "../providers/BlockchainExplorerProvider";
import {NdefMessage, Nfc} from "../model/Nfc";
import {BlockchainExplorer, RawDaemon_Out} from "../model/blockchain/BlockchainExplorer";
import {Cn} from "../model/Cn";
import {WalletWatchdog} from "../model/WalletWatchdog";

let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);
let blockchainExplorer: BlockchainExplorer = BlockchainExplorerProvider.getInstance();

class DepositsView extends DestructableView {
	@VueVar([]) deposits !: Deposit[];
  @VueVar(0) blockchainHeight !: number;
  @VueVar(false) lockedForm !: boolean;

	@VueVar(false) isWalletSyncing !: boolean;
  @VueVar(true) openAliasValid !: boolean;
  @VueVar(Math.pow(10, config.coinUnitPlaces)) currencyDivider !: number;

  readonly refreshInterval = 500;
	private intervalRefresh : NodeJS.Timeout;
  private qrReader: QRReader | null = null;
  private timeoutResolveAlias = 0;
  private redirectUrlAfterSend: string | null = null;

  ndefListener : ((data: NdefMessage)=>void)|null = null;

  constructor(container : string) {
		super(container);

    this.isWalletSyncing = true;
		AppState.enableLeftMenu();

		this.intervalRefresh = setInterval(() => {
			this.refresh();
		}, 3 * 1000);

		this.refresh();
	}

	destruct = (): Promise<void> => {
		clearInterval(this.intervalRefresh);
		return super.destruct();
	}

	refresh = () => {
		blockchainExplorer.getHeight().then((height : number) => {
      this.isWalletSyncing = (wallet.lastHeight + 2) < height;
			this.blockchainHeight = height;
      this.refreshWallet();
    }).catch((err: any) => {
      this.refreshWallet();
    });
	}

	refreshWallet = (forceRedraw: boolean = false) => {
    this.deposits = wallet.getDepositsCopy().reverse();
	}
  
  reset() {
    this.lockedForm = false;
    this.openAliasValid = false;  
  }

  moreInfoOnDeposit = (deposit: Deposit) => {
		let explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
		let explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
		let status = 'Locked';

    let creatingTimestamp = 0;
    let spendingTimestamp = 0;
    let spendingHeight = 0

    let creationTx = wallet.findWithTxHash(deposit.txHash);
    let spendingTx = wallet.findWithTxHash(deposit.spentTx);

    if (creationTx) {
      creatingTimestamp = creationTx.timestamp;
    }

    if (spendingTx) {
      spendingTimestamp = spendingTx.timestamp;
      spendingHeight = spendingTx.blockHeight;
    }

    if ((deposit.blockHeight + deposit.term) <= this.blockchainHeight) {
      if (deposit.spentTx) {
        status = 'Spent'
      } else {
        status = 'Unlocked'
      }
    }

		swal({
			title:i18n.t('depositsPage.depositDetails.title'),
      customClass:'swal-wide',
			html:`
        <div class="tl" >
          <div><span class="txDetailsLabel">` + i18n.t('depositsPage.depositDetails.txHash') + `</span>:<span class="txDetailsValue"><a href="` + explorerUrlHash.replace('{ID}', deposit.txHash) + `" target="_blank">`+ deposit.txHash + `</a></span></div>
          <div><span class="txDetailsLabel">` + i18n.t('depositsPage.depositDetails.spendingTx') + `</span>:<span class="txDetailsValue"><a href="` + explorerUrlHash.replace('{ID}', deposit.spentTx) + `" target="_blank">`+ deposit.spentTx + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.status') + `</span>:<span class="txDetailsValue">`+ status +`</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.amount')+`</span>:<span class="txDetailsValue">` + (deposit.amount / Math.pow(10, config.coinUnitPlaces)) + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.term')+`</span>:<span class="txDetailsValue">` + deposit.term + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.creationHeight')+`</span>:<span class="txDetailsValue">` + deposit.blockHeight + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.creationTime')+`</span>:<span class="txDetailsValue">` + new Date(creatingTimestamp * 1000).toDateString() + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.unlockHeight')+`</span>:<span class="txDetailsValue">` + (deposit.blockHeight + deposit.term) + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.spendingTime')+`</span>:<span class="txDetailsValue">` + new Date(spendingTimestamp * 1000).toDateString() + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.spendingHeight')+`</span>:<span class="txDetailsValue">` + spendingHeight + `</a></span></div>
        </div>`
		});
	}  
}

if (wallet !== null && blockchainExplorer !== null)
  new DepositsView('#app');
else {
  AppState.askUserOpenWallet(false).then(function () {
    wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);
    if (wallet === null)
      throw 'e';
    new DepositsView('#app');
  }).catch(function () {
    window.location.href = '#index';
  });
}