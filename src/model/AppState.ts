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

import {DependencyInjectorInstance} from "../lib/numbersLab/DependencyInjector";
import {Wallet} from "./Wallet";
import {Transaction, Deposit} from "./Transaction";
import {BlockchainExplorerProvider} from "../providers/BlockchainExplorerProvider";
import {Observable} from "../lib/numbersLab/Observable";
import {WalletRepository} from "./WalletRepository";
import {BlockchainExplorer, RawDaemon_Transaction} from "./blockchain/BlockchainExplorer";
import {TransactionsExplorer} from "./TransactionsExplorer";
import {WalletWatchdog} from "./WalletWatchdog";

export class WalletWorker {
	wallet: Wallet;
	password: string;

	intervalSave = 0;

	constructor(wallet: Wallet, password: string) {
		this.wallet = wallet;
		this.password = password;
		let self: any = this;
		wallet.addObserver(Observable.EVENT_MODIFIED, function () {
			if (self.intervalSave === 0)
				self.intervalSave = setTimeout(function () {
					self.save();
					self.intervalSave = 0;
				}, 1000);
		});

		this.save();
	}

	save() {
		WalletRepository.save(this.wallet, this.password);
	}
}

export class AppState {

	static openWallet(wallet: Wallet, password: string) {
    let walletWorker = new WalletWorker(wallet, password);
    DependencyInjectorInstance().register(Wallet.name, wallet);
    let watchdog = BlockchainExplorerProvider.getInstance().start(wallet);
    DependencyInjectorInstance().register(WalletWatchdog.name, watchdog);
    DependencyInjectorInstance().register(WalletWorker.name, walletWorker);

    $('body').addClass('connected');
    if (wallet.isViewOnly()) {
      $('body').addClass('viewOnlyWallet');
    }  
	}

	static disconnect() {
		let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);
		let walletWorker: WalletWorker = DependencyInjectorInstance().getInstance(WalletWorker.name, 'default', false);
		let walletWatchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name, 'default', false);
		
    if (walletWatchdog !== null) {
			walletWatchdog.stop();
    }

    // Clean up the blockchain explorer session to ensure fresh node selection on next connection
    let blockchainExplorer = BlockchainExplorerProvider.getInstance();
    blockchainExplorer.cleanupSession();

		DependencyInjectorInstance().register(Wallet.name, undefined, 'default');
		DependencyInjectorInstance().register(WalletWorker.name, undefined, 'default');
		DependencyInjectorInstance().register(WalletWatchdog.name, undefined, 'default');
		$('body').removeClass('connected');
		$('body').removeClass('viewOnlyWallet');
	}

	private static leftMenuEnabled = false;

	static enableLeftMenu() {
		if (!this.leftMenuEnabled) {
			this.leftMenuEnabled = true;
			$('body').removeClass('menuDisabled');
		}
	}

	static disableLeftMenu() {
		if (this.leftMenuEnabled) {
			this.leftMenuEnabled = false;
			$('body').addClass('menuDisabled');
		}
	}

	static askUserOpenWallet(redirectToHome: boolean = true): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			swal({
				title: i18n.t('global.openWalletModal.title'),
				input: 'password',
				showCancelButton: true,
				confirmButtonText: i18n.t('global.openWalletModal.confirmText'),
				cancelButtonText: i18n.t('global.openWalletModal.cancelText'),
			}).then((result: any) => {
				$("#appLoader").addClass("appLoaderVisible");

				BlockchainExplorerProvider.getInstance().initialize().then(success => {
					$("#appLoader").removeClass("appLoaderVisible");
					
					setTimeout(() => { //for async
						if (result.value) {
							swal({
								type: 'info',
								title: i18n.t('global.loading'),
								onOpen: () => {
									swal.showLoading();
								}
							});

							const savePassword = result.value;
							const memoryWallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);

							if (memoryWallet === null) {
								// Migration and wallet loading logic
								WalletRepository.migrateWallet()
									.then(isSuccess => {
										return WalletRepository.getLocalWalletWithPassword(savePassword);
									})
									.then((wallet: Wallet | null) => {
										if (wallet !== null) {
											handleWalletLoading(wallet, savePassword, resolve, redirectToHome);
										} else {
											showInvalidPasswordError();
											reject();
										}
									})
									.catch(err => {
										console.error("Error loading wallet:", err);
										reject(err);
									});
							} else {
								swal.close();
								window.location.href = '#account';
								resolve();
							}
						} else {
							reject();
						}
					}, 1);
				}).catch(reject);
			}).catch(reject);
		});
	}
}

// Helper functions to improve readability
function handleWalletLoading(wallet: Wallet, savePassword: string, resolve: () => void, redirectToHome: boolean): void {
	wallet.recalculateIfNotViewOnly();
	updateWalletTransactions(wallet);
	swal.close();
	resolve();

	AppState.openWallet(wallet, savePassword);
	if (redirectToHome) {
		window.location.href = '#account';
	}
}

function showInvalidPasswordError(): void {
	swal({
		type: 'error',
		title: i18n.t('global.invalidPasswordModal.title'),
		text: i18n.t('global.invalidPasswordModal.content'),
		confirmButtonText: i18n.t('global.invalidPasswordModal.confirmText'),
		onOpen: () => {
			swal.hideLoading();
		}
	});
}

function updateWalletTransactions(wallet: Wallet): void {
	const blockchainHeightToRescanObj: Record<number, boolean> = {};
	
	for (const tx of wallet.getTransactionsCopy()) {
		if (tx.hash === '') {
			blockchainHeightToRescanObj[tx.blockHeight] = true;
		}
	}

	const blockchainHeightToRescan = Object.keys(blockchainHeightToRescanObj);
	if (blockchainHeightToRescan.length > 0) {
		const blockchainExplorer: BlockchainExplorer = BlockchainExplorerProvider.getInstance();
		
		const promisesBlocks = blockchainHeightToRescan.map(height => 
			blockchainExplorer.getTransactionsForBlocks(
				parseInt(height), 
				parseInt(height), 
				wallet.options.checkMinerTx
			)
		);

		Promise.all(promisesBlocks)
			.then((arrayOfTxs: Array<RawDaemon_Transaction[]>) => {
				arrayOfTxs.forEach(txs => {
					txs.forEach(rawTx => {
						const txData = TransactionsExplorer.parse(rawTx, wallet);
						if (txData?.transaction) {
							wallet.addNew(txData.transaction);
							wallet.addDeposits(txData.deposits);
							wallet.addWithdrawals(txData.withdrawals);
						}
					});
				});
			})
			.catch(console.error);
	}
}
