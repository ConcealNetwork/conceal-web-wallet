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
import {WalletRepository} from "../model/WalletRepository";

let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);
let blockchainExplorer: BlockchainExplorer = BlockchainExplorerProvider.getInstance();

class DepositsView extends DestructableView {
	@VueVar([]) deposits !: Deposit[];
  @VueVar(0) blockchainHeight !: number;
  @VueVar(false) lockedForm !: boolean;
  @VueVar(0) walletAmount !: number;
  @VueVar(0) unlockedWalletAmount !: number;
  @VueVar(0) lastPending !: number;
  @VueVar(0) currentScanBlock !: number;
  
	@VueVar(false) isWalletSyncing !: boolean;
  @VueVar(true) openAliasValid !: boolean;
  @VueVar(Math.pow(10, config.coinUnitPlaces)) currencyDivider !: number;
  @VueVar(0) maxDepositAmount !: number;
  @VueVar(false) isDepositDisabled !: boolean;

  
  readonly refreshInterval = 500;
	private intervalRefresh : NodeJS.Timeout;
  private qrReader: QRReader | null = null;
  private timeoutResolveAlias = 0;
  private redirectUrlAfterSend: string | null = null;
  private refreshTimestamp: Date = new Date(0);

  ndefListener : ((data: NdefMessage)=>void)|null = null;

  // Add this as a class property
  private static currentInstance: DepositsView | null = null;

  // Add properties for deposit amount and term
  @VueVar(0) depositAmount !: number;
  @VueVar(1) depositTerm !: number;
  @VueVar(new JSBigInt((<any>window).config.coinFee)) coinFee !: typeof JSBigInt;

  constructor(container : string) {
		super(container);

    // Store the instance reference
    DepositsView.currentInstance = this;
    
    this.isWalletSyncing = true;
    this.isDepositDisabled = true;
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
      // Update isDepositDisabled based on syncing status and max amount
      this.isDepositDisabled = this.isWalletSyncing || this.maxDepositAmount < 1;    
    }).catch((err: any) => {
      this.refreshWallet();
    });
	}

	refreshWallet = (forceRedraw: boolean = false) => {
    this.deposits = wallet.getDepositsCopy().reverse();
    this.currentScanBlock = wallet.lastHeight;

    let timeDiff: number = new Date().getTime() - this.refreshTimestamp.getTime();
    
    if ((((this.refreshTimestamp < wallet.modifiedTimestamp()) || (this.lastPending > 0)) && (timeDiff > this.refreshInterval)) || forceRedraw /*|| filterChanged*/) {
      logDebugMsg("refreshWallet", this.currentScanBlock);      

      this.walletAmount = wallet.amount;
      this.unlockedWalletAmount = wallet.availableAmount(this.currentScanBlock);
      // Calculate the maximum deposit amount
      this.maxDepositAmount = Math.floor((this.unlockedWalletAmount - config.coinFee) / this.currencyDivider);

    }
    // Add test deposit for UI testing -------------------------------to be remove --- <
    let testDeposit = new Deposit();
    testDeposit.txHash = "test_tx_hash";
    testDeposit.outputIndex = 0;
    testDeposit.blockHeight = this.blockchainHeight - 100; // Set it 100 blocks in the past
    testDeposit.timestamp = Math.floor(Date.now() / 1000) - (60 * 60 * 24); // 24h ago
    testDeposit.amount = 1000000; // 1 CCX (6 decimals)
    testDeposit.term = 10;
    testDeposit.spentTx = "";
    this.deposits.push(testDeposit);

    this.refreshTimestamp = new Date();
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

  withdrawDeposit = async (deposit: Deposit) => {
    try {
      this.lockedForm = true;
      console.log('Withdrawing deposit:', deposit.txHash);
      
      // Simulate success
      swal({
        type: 'success',
        title: i18n.t('depositsPage.withdrawSuccess'),
        text: i18n.t('depositsPage.withdrawPending')
      });
    } catch (error: unknown) {
      console.error('Error withdrawing deposit:', error);
      swal({
        type: 'error',
        title: i18n.t('depositsPage.withdrawError'),
        text: error instanceof Error ? error.message : String(error)
      });
    } finally {
      this.lockedForm = false;
    }
  }

  showCreateDepositModal = () => {
    // Reset values before showing modal
    this.depositAmount = 0;
    this.depositTerm = config.depositMinTermMonth;  // default initial term
    //this.coinFee = new JSBigInt((<any>window).config.coinFee);
    
    // Calculate max amount once to ensure consistency
    let maxAmount = this.maxDepositAmount;

    swal({
      title: i18n.t('depositsPage.createDeposit.title'),
      html: `
        <div class="deposit-form" style="width: 100%; max-width: 400px; margin: 0 auto;">
          <div class="input-group" style="margin-bottom: 20px;">
            <input id="depositAmount" type="number" min="${config.depositMinAmountCoin}" step="1" max="${maxAmount}" pattern="\\d*" class="swal2-input" 
              placeholder="${i18n.t('depositsPage.createDeposit.amount')}"
              onkeypress="return event.charCode >= 48 && event.charCode <= 57"
              style="width: 100%; max-width: 300px; margin: 8px auto;">
            <p style="text-align: center; color: #666; margin: 4px 0 0 0; font-size: 0.9em; cursor: pointer;" id="maxAmountText">
              ${i18n.t('depositsPage.createDeposit.maxAmount', { amount: maxAmount })}
            </p>
          </div>
          <div class="input-group">
            <input id="depositTerm" type="number" min="${config.depositMinTermMonth}" max="${config.depositMaxTermMonth}" step="1" pattern="\\d*" class="swal2-input" 
              placeholder="${i18n.t('depositsPage.createDeposit.term')}"
              onkeypress="return event.charCode >= 48 && event.charCode <= 57"
              style="width: 100%; max-width: 300px; margin: 8px auto;">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: i18n.t('depositsPage.createDeposit.confirm'),
      cancelButtonText: i18n.t('depositsPage.createDeposit.cancel'),
      onOpen: () => {
        // Add click event handler to the maximum amount text
        document.getElementById('maxAmountText')?.addEventListener('click', () => {
          const depositAmountInput = document.getElementById('depositAmount') as HTMLInputElement;
          if (depositAmountInput) {
            depositAmountInput.value = maxAmount.toString();
          }
        });
      },
      preConfirm: () => {
        const amountInput = (document.getElementById('depositAmount') as HTMLInputElement).value;
        const termInput = (document.getElementById('depositTerm') as HTMLInputElement).value;
        
        // Clean and validate amount
        const cleanAmount = amountInput.replace(/[^0-9]/g, '');
        const amount = parseInt(cleanAmount);
        
        // Clean and validate term
        const cleanTerm = termInput.replace(/[^0-9]/g, '');
        const term = parseInt(cleanTerm);
        console.log('Available amount:', (this.unlockedWalletAmount - this.coinFee) / this.currencyDivider );
        // Validate amount
        if (isNaN(amount) || amount < 1 || !Number.isInteger(amount) || amount > maxAmount) {
          swal({
            title: i18n.t('depositsPage.createDeposit.amountError'),
            type: 'error',
            confirmButtonText: 'OK'
          });
          return false;
        }
        
        // Validate term
        if (isNaN(term) || term < 1 || term > 12 || !Number.isInteger(term)) {
          swal({
            title: i18n.t('depositsPage.createDeposit.termError'),
            type: 'error',
            confirmButtonText: 'OK'
          });
          return false;
        }
        
        // Store values directly on the instance using our static reference
        if (DepositsView.currentInstance) {
          DepositsView.currentInstance.depositAmount = amount;
          DepositsView.currentInstance.depositTerm = term;
        }
        
        console.log('Amount:', amount, "Term:", term);
        return true;
      }
    }).then((result) => {
      if (result && result.value) {
        console.log('Modal confirmed, using values:', this.depositAmount, this.depositTerm);
        
        // After initial modal confirmation, show password prompt
        return swal({
          title: i18n.t('depositsPage.confirmDeposit.title'),
          text: i18n.t('depositsPage.confirmDeposit.message', { 
            amount: this.depositAmount, 
            term: this.depositTerm 
          }),
          input: 'password',
          showCancelButton: true,
          confirmButtonText: i18n.t('depositsPage.confirmDeposit.confirm'),
          cancelButtonText: i18n.t('depositsPage.confirmDeposit.cancel')
        });
      }
    }).then((result: any) => {
      if (result && result.value) {
        let savePassword: string = result.value;
        
        // Show loading state
        swal({
          type: 'info',
          title: i18n.t('global.loading'),
          onOpen: () => {
            swal.showLoading();
          }
        });

        // Verify password using WalletRepository
        return WalletRepository.getLocalWalletWithPassword(savePassword)
          .then(wallet => {
            if (wallet !== null) {
              // Password is correct, proceed with deposit creation
              swal.close();
              return this.createDeposit(this.depositAmount, this.depositTerm);
            } else {
              // Password is incorrect
              return swal({
                type: 'error',
                title: i18n.t('global.invalidPasswordModal.title'),
                text: i18n.t('global.invalidPasswordModal.content'),
                confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText')
              });
            }
          })
          .catch(error => {
            console.error('Error validating password:', error);
            return swal({
              type: 'error',
              title: i18n.t('global.error'),
              text: i18n.t('global.invalidPasswordModal.content')
            });
          });
      }
    }).catch((error) => {
      console.error('Error in deposit modal:', error);
    });
  }

  createDeposit = async (amount: number, term: number) => {
    try {
      this.lockedForm = true;
      console.log('Creating deposit:', { amount, term });
      
      // Simulate success
      swal({
        type: 'success',
        title: i18n.t('depositsPage.createDeposit.createSuccess')
        /*text: i18n.t('depositsPage.createPending')*/
      });
    } catch (error: unknown) {
      console.error('Error creating deposit:', error);
      swal({
        type: 'error',
        title: i18n.t('depositsPage.createError'),
        text: error instanceof Error ? error.message : String(error)
      });
    } finally {
      this.lockedForm = false;
    }
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