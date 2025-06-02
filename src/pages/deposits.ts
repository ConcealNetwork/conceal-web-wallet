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
import {InterestCalculator} from "../model/Interest";

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
  @VueVar(false) isWithdrawDisabled !: boolean;

  @VueVar(0) totalLifetimeDeposit !: number;
  @VueVar(0) totalLifetimeInterest !: number;
  @VueVar(0) totalCashedOutInterest !: number;
  @VueVar(0) futureInterestLocked !: number;
  @VueVar(0) futureInterestUnlocked !: number;
  @VueVar('') earliestUnlockableDate !: string;
  @VueVar(false) earliestUnlockableIsPast !: boolean;
  @VueVar(0) ticker !: string;

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
  @VueVar() showCreateDepositModal !: () => void;

  constructor(container : string) {
		super(container);

    // Store the instance reference
    DepositsView.currentInstance = this;
    
    this.isWalletSyncing = true;
    this.isDepositDisabled = true;
    this.isWithdrawDisabled = true;
    this.ticker = config.coinSymbol;
		AppState.enableLeftMenu();

    // Initialize the modal method here
    this.showCreateDepositModal = () => {
      // Reset values before showing modal
      this.depositAmount = 0;
      this.depositTerm = config.depositMinTermMonth;  // default initial term
      
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
            <p style="text-align: center; color: #666; margin: 10px 0 0 0; font-size: 1em; font-weight: bold;" id="rewardText">
              ${i18n.t('depositsPage.createDeposit.rewardAtTerm', { reward: '0' })}
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: i18n.t('depositsPage.createDeposit.confirm'),
        cancelButtonText: i18n.t('depositsPage.createDeposit.cancel'),
        onOpen: () => {
          // Add click event handler to the maximum amount text
          document.getElementById('maxAmountText')?.addEventListener('click', () => {
            let depositAmountInput = document.getElementById('depositAmount') as HTMLInputElement;
            if (depositAmountInput) {
              depositAmountInput.value = maxAmount.toString();
              // Update reward info based on the new amount value
              updateRewardInfo();
            }
          });
          
          // Add input event listener to update reward information when deposit amount changes
          let depositAmountInput = document.getElementById('depositAmount') as HTMLInputElement;
          let depositTermInput = document.getElementById('depositTerm') as HTMLInputElement;
          
          if (depositAmountInput) {
            depositAmountInput.addEventListener('input', () => {
              updateRewardInfo();
            });
          }
          
          // Add input event listener for term changes as well
          if (depositTermInput) {
            depositTermInput.addEventListener('input', () => {
              updateRewardInfo();
            });
          }
          
          // Function to update the reward calculation
          function updateRewardInfo() {
            let amount = parseInt((document.getElementById('depositAmount') as HTMLInputElement).value) || 0;
            let term = parseInt((document.getElementById('depositTerm') as HTMLInputElement).value) || 0;
            
            let aprIndex = 0;
            
            if (amount >= 20000) {
              aprIndex = 2;
            } else if (amount >= 10000) {
              aprIndex = 1;
            }
            
            // Calculate interest using the InterestCalculator class
            const termBlocks = term * config.depositMinTermBlock; // Convert term (months) to blocks
            
            // Get current blockchain height for interest calculation
            blockchainExplorer.getHeight().then((height: number) => {
              // Calculate the interest using our Interest class
              let reward = InterestCalculator.calculateInterest(
                amount * Math.pow(10, config.coinUnitPlaces), // Convert to atomic units
                termBlocks, 
                height
              ) / Math.pow(10, config.coinUnitPlaces); // Convert back to human-readable amount
              
              // Update reward text
              let rewardText = document.getElementById('rewardText');
              if (rewardText) {
                // First format with full decimal places
                let rewardFixed = reward.toFixed(config.coinUnitPlaces); // 6 decimals
                
                // Remove trailing zeros using a for loop (up to 4 times)
                for (let i = 0; i < 4; i++) {
                  if (rewardFixed.endsWith('0')) {
                    rewardFixed = rewardFixed.slice(0, -1);
                  } else {
                    break;
                  }
                }
                            
                rewardText.textContent = i18n.t('depositsPage.createDeposit.rewardAtTerm', { reward: rewardFixed });
              }
            }).catch((error) => {
              console.log('Failed to get blockchain height:', error);
              // Fallback to the old calculation method if we can't get the height
              let aprRate = (config as any).depositRateV3[aprIndex];
              let adjustedRate = aprRate + (term - 1) * 0.001;
              let reward = amount * term * adjustedRate / 12;
              
              // Update reward text
              let rewardText = document.getElementById('rewardText');
              if (rewardText) {
                let rewardFixed = reward.toFixed(config.coinUnitPlaces);
                for (let i = 0; i < 4; i++) {
                  if (rewardFixed.endsWith('0')) {
                    rewardFixed = rewardFixed.slice(0, -1);
                  } else {
                    break;
                  }
                }
                rewardText.textContent = i18n.t('depositsPage.createDeposit.rewardAtTerm', { reward: rewardFixed });
              }
            });
          }
          
          // Initialize the reward display when the modal opens
          updateRewardInfo();
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

          return true;
        }
      }).then((result) => {
        if (result && result.value) {          
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
    };

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
      this.isWithdrawDisabled = this.isWalletSyncing;
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

      // Recap calculations
      this.totalLifetimeDeposit = this.deposits.reduce((sum, d) => sum + d.amount, 0);
      this.totalLifetimeInterest = this.deposits.reduce((sum, d) => sum + d.interest, 0);
      const future = wallet.futureDepositInterest(this.currentScanBlock);
      this.totalCashedOutInterest = future.spent;
      this.futureInterestLocked = future.locked;
      this.futureInterestUnlocked = future.unlocked;
      // Earliest unlockable
      const earliest = wallet.earliestUnlockableDeposit(this.currentScanBlock);
      if (earliest) {
        const unlockTimestamp = (earliest.timestamp + (earliest.term * 120)) * 1000;
        this.earliestUnlockableDate = new Date(unlockTimestamp).toLocaleDateString();
        const now = Date.now();
        this.earliestUnlockableIsPast = unlockTimestamp < now;
      } else {
        this.earliestUnlockableDate = '-';
        this.earliestUnlockableIsPast = false;
      }
    }

    this.refreshTimestamp = new Date();
	}
  
  reset() {
    this.lockedForm = false;
    this.openAliasValid = false;  
  }

  moreInfoOnDeposit = (deposit: Deposit) => {
		let explorerUrlHash = config.testnet ? config.testnetExplorerUrlHash : config.mainnetExplorerUrlHash;
		let explorerUrlBlock = config.testnet ? config.testnetExplorerUrlBlock : config.mainnetExplorerUrlBlock;
		let status = deposit.getStatus(this.blockchainHeight);

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
/*
    if ((deposit.blockHeight + deposit.term) <= this.blockchainHeight) {
      if (deposit.spentTx) {
        status = 'Spent'
      } else {
        status = 'Unlocked'
      }
    }
*/
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
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.unlockHeight')+`</span>:<span class="txDetailsValue">` + (deposit.unlockHeight) + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.interest')+`</span>:<span class="txDetailsValue">` + (deposit.interest / Math.pow(10, config.coinUnitPlaces)) + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.spendingTime')+`</span>:<span class="txDetailsValue">` + (spendingTimestamp == 0 ? "unspent" : new Date(spendingTimestamp * 1000).toDateString()) + `</a></span></div>
          <div><span class="txDetailsLabel">`+i18n.t('depositsPage.depositDetails.spendingHeight')+`</span>:<span class="txDetailsValue">` + (spendingHeight == 0 ? "unspent" : spendingHeight) + `</a></span></div>
        </div>`
		});
	}  

  withdrawDeposit = async (deposit: Deposit) => {
    try {
      this.lockedForm = true;
      // Find deposit by txHash and outputIndex (natural unique identifiers)
      const foundDeposit = this.deposits.find(d => 
        d.txHash === deposit.txHash && 
        d.globalOutputIndex === deposit.globalOutputIndex
      );
      if (!foundDeposit || foundDeposit.withdrawPending || foundDeposit.isSpent()) {
        swal({
          type: 'error',
          title: i18n.t('depositsPage.withdrawError'),
          text: i18n.t('depositsPage.withdrawPending')
        });
        return;
      }
      const blockchainHeight = await blockchainExplorer.getHeight();
      
      let mixinToSendWith: number = config.defaultMixin;

      TransactionsExplorer.createWithdrawTx(foundDeposit, wallet, blockchainHeight,
          function (amounts: number[], numberOuts: number): Promise<RawDaemon_Out[]> {
            // For withdrawals, we don't need mixins, so return empty array
            return Promise.resolve([]);
          }
          , function (amount: number, feesAmount: number): Promise<void> {
            if (feesAmount > wallet.availableAmount(blockchainHeight)) {
              swal({
                type: 'error',
                title: i18n.t('sendPage.notEnoughMoneyModal.title'),
                text: i18n.t('sendPage.notEnoughMoneyModal.content'),
                confirmButtonText: i18n.t('sendPage.notEnoughMoneyModal.confirmText'),
                onOpen: () => {
                  swal.hideLoading();
                }
              });
              throw '';
            }

            return new Promise<void>(function (resolve, reject) {
              
              setTimeout(function () {//prevent bug with swal when code is too fast
                swal({
                  title: i18n.t('sendPage.confirmTransactionModal.title'),
                  html: i18n.t('sendPage.confirmTransactionModal.content', {
                    amount: (amount + feesAmount) / Math.pow(10, config.coinUnitPlaces),
                    fees: feesAmount / Math.pow(10, config.coinUnitPlaces),
                    total: amount  / Math.pow(10, config.coinUnitPlaces),
                  }),
                  showCancelButton: true,
                  confirmButtonText: i18n.t('sendPage.confirmTransactionModal.confirmText'),
                  cancelButtonText: i18n.t('sendPage.confirmTransactionModal.cancelText'),
                }).then(function (result: any) {
                  if (result.dismiss) {
                    reject('');
                  } else {
                    foundDeposit.withdrawPending = true;   
                    wallet.addDeposit(foundDeposit); // Update the deposit in the wallet

                    swal({
                      title: i18n.t('sendPage.finalizingTransferModal.title'),
                      html: i18n.t('sendPage.finalizingTransferModal.content'),
                      onOpen: () => {
                        swal.showLoading();
                      }
                    });
                    resolve();
                  }
                }).catch(reject);
              }, 500);
            });
          },
          mixinToSendWith, "", "", 0, "withdraw", foundDeposit.term).then(function (rawTxData: { raw: { hash: string, prvkey: string, raw: string }, signed: any }) {
          
          //console.log('Raw transaction data:', rawTxData.raw.raw);

            blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
              setTimeout(() => {
              //save the tx private key
              wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);

              //force a mempool check so the user is up to date
              let watchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name);
              if (watchdog !== null)
                watchdog.checkMempool();
        
              // Success
              swal({
                type: 'success',
                title: i18n.t('depositsPage.createDeposit.withdrawSuccess'),
                html: `TxHash:<br>
                <a href="${config.mainnetExplorerUrlHash.replace('{ID}', rawTxData.raw.hash)}" 
                target="_blank" class="tx-hash-value">${rawTxData.raw.hash}</a>`
              });
              let promise = Promise.resolve();
              promise.then(function () {
                console.log('Withdrawal successfully submitted to the blockchain');
              });
              }, 5);
            }).catch(function (data: any) {
              setTimeout(() => {
                foundDeposit.withdrawPending = false;   
                wallet.addDeposit(foundDeposit);
              swal({
                type: 'error',
                title: i18n.t('sendPage.transferExceptionModal.title'),
                html: i18n.t('sendPage.transferExceptionModal.content', {details: JSON.stringify(data)}),
                confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
              });
              }, 5);
            });

          swal.close();
        }).catch((error) => {
          setTimeout(() => {
          if (error && error !== '') {
            if (typeof error === 'string')
              swal({
                type: 'error',
                title: i18n.t('sendPage.transferExceptionModal.title'),
                html: i18n.t('sendPage.transferExceptionModal.content', {details: error}),
                confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
              });
            else
              swal({
                type: 'error',
                title: i18n.t('sendPage.transferExceptionModal.title'),
                html: i18n.t('sendPage.transferExceptionModal.content', {details: JSON.stringify(error)}),
                confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
              });
          }
        }, 100);
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

  createDeposit = async (amount: number, term: number) => {
    try {
      this.lockedForm = true;
      const blockchainHeight = await blockchainExplorer.getHeight();
          // Convert amount to atomic units
      const amountToDeposit = new JSBigInt(amount).multiply(new JSBigInt(Math.pow(10, config.coinUnitPlaces)));
      const fee = new JSBigInt(config.coinFee);
      const neededAmount = amountToDeposit.add(fee);
      if ( neededAmount > wallet.availableAmount(blockchainHeight)) {
        console.log('Not enough money to deposit');
        return;
      }
      const termToDeposit = term > 12 ? 12 * config.depositMinTermBlock : term * config.depositMinTermBlock;
      // Use the wallet's own address for deposits
      const destinationAddress = wallet.getPublicAddress();

      // let mixinToSendWith: number = config.defaultMixin;

      let mixinToSendWith: number = config.defaultMixin;

      // Get all blocked deposit indices to filter randomOuts-------- <---------- WIP
      /*const blockedIndex = this.deposits
        .filter(deposit => deposit.getStatus(this.blockchainHeight) === 'Locked')
        .map(deposit => deposit.outputIndex);
      */
        TransactionsExplorer.createTx([{address: destinationAddress, amount: amountToDeposit}], "", wallet, blockchainHeight,
          function (amounts: number[], numberOuts: number): Promise<RawDaemon_Out[]> {
            return blockchainExplorer.getRandomOuts(amounts, numberOuts);
          }
          , function (amount: number, feesAmount: number): Promise<void> {
            if (amount + feesAmount > wallet.availableAmount(blockchainHeight)) {
              swal({
                type: 'error',
                title: i18n.t('sendPage.notEnoughMoneyModal.title'),
                text: i18n.t('sendPage.notEnoughMoneyModal.content'),
                confirmButtonText: i18n.t('sendPage.notEnoughMoneyModal.confirmText'),
                onOpen: () => {
                  swal.hideLoading();
                }
              });
              throw '';
            }
            return Promise.resolve();
          },
          mixinToSendWith, "", 0, "deposit", termToDeposit).then(function (rawTxData: { raw: { hash: string, prvkey: string, raw: string }, signed: any }) {
            // console.log(JSON.stringify(rawTxData, null, 2));
            blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
              //save the tx private key
              wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);

              //force a mempool check so the user is up to date
              let watchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name);
              if (watchdog !== null)
                watchdog.checkMempool();
        
              // Success
              swal({
                type: 'success',
                title: i18n.t('depositsPage.createDeposit.createSuccess'),
                html: `TxHash:<br>
                <a href="${config.mainnetExplorerUrlHash.replace('{ID}', rawTxData.raw.hash)}" 
                target="_blank" class="tx-hash-value">${rawTxData.raw.hash}</a>`
              });
              let promise = Promise.resolve();
              promise.then(function () {
                console.log('Deposit successfully submitted to the blockchain');
              });
            }).catch((error) => {
              console.error('Transaction creation error:', error);
              // Wait a short moment to ensure all console logs are printed
              setTimeout(() => {
                swal({
                  type: 'error',
                  title: i18n.t('sendPage.transferExceptionModal.title'),
                  html: i18n.t('sendPage.transferExceptionModal.content', {
                    details: error instanceof Error ? error.message : JSON.stringify(error)
                  }),
                  confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
                });
              }, 100);
            });

        
          swal.close();
        }).catch(function (error: any) {
          //console.log(error);
          if (error && error !== '') {
            if (typeof error === 'string')
              swal({
                type: 'error',
                title: i18n.t('sendPage.transferExceptionModal.title'),
                html: i18n.t('sendPage.transferExceptionModal.content', {details: error}),
                confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
              });
            else
              swal({
                type: 'error',
                title: i18n.t('sendPage.transferExceptionModal.title'),
                html: i18n.t('sendPage.transferExceptionModal.content', {details: JSON.stringify(error)}),
                confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
              });
          }
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