/*
 * Copyright (c) 2018 Gnock
 * Copyright (c) 2018-2019 The Masari Project
 * Copyright (c) 2018-2020 The Karbo developers
 * Copyright (c) 2018-2023 Conceal Community, Conceal.Network & Conceal Devs
 * Copyright (c) 2022, The Karbo Developers
 * Copyright (c) 2022, Conceal Devs
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
import {BlockchainExplorerProvider} from "../providers/BlockchainExplorerProvider";
import {NdefMessage, Nfc} from "../model/Nfc";
import {BlockchainExplorer, RawDaemon_Out} from "../model/blockchain/BlockchainExplorer";
import {Cn} from "../model/Cn";
import {WalletWatchdog} from "../model/WalletWatchdog";

let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);
let blockchainExplorer: BlockchainExplorer = BlockchainExplorerProvider.getInstance();

AppState.enableLeftMenu();

class SendView extends DestructableView {
  @VueVar('') destinationAddressUser !: string;
  @VueVar('') destinationAddress !: string;
  @VueVar(false) destinationAddressValid !: boolean;
  @VueVar('0') amountToSend !: string;
  @VueVar(false) lockedForm !: boolean;
  @VueVar(true) amountToSendValid !: boolean;
  @VueVar('') paymentId !: string;
  @VueVar('') message !: string;
  @VueVar(true) paymentIdValid !: boolean;
  @VueVar(true) messageValid !: boolean;
  @VueVar('5') mixIn !: string;
  @VueVar(true) mixinIsValid !: boolean;
  @VueVar(0) maxMessageSize !: number;

  @VueVar(null) domainAliasAddress !: string | null;
  @VueVar(null) txDestinationName !: string | null;
  @VueVar(null) txDescription !: string | null;
  @VueVar(true) openAliasValid !: boolean;

  @VueVar(false) qrScanning !: boolean;
  @VueVar(false) nfcAvailable !: boolean;

  @VueVar(false) optimizeIsNeeded !: boolean;
  @VueVar(false) optimizeLoading !: boolean;
	@VueVar(false) isWalletSyncing !: boolean;
	@VueVar(0) optimizeOutputs !: number;

  @Autowire(Nfc.name) nfc !: Nfc;

  private oldIsWalletSyncing: boolean;
  private qrReader: QRReader | null = null;
	private intervalRefresh : NodeJS.Timer;
  private timeoutResolveAlias = 0;
  private blockchainHeight: number;
  private redirectUrlAfterSend: string | null = null;

  ndefListener : ((data: NdefMessage)=>void)|null = null;

  constructor(container: string) {
    super(container);
    let sendAddress = Url.getHashSearchParameter('address');
    let amount = Url.getHashSearchParameter('amount');
    let destinationName = Url.getHashSearchParameter('destName');
    let description = Url.getHashSearchParameter('txDesc');
    let redirect = Url.getHashSearchParameter('redirect');
    if (sendAddress !== null) this.destinationAddressUser = sendAddress.substr(0, 256);
    if (amount !== null) this.amountToSend = amount;
    if (destinationName !== null) this.txDestinationName = destinationName.substr(0, 256);
    if (description !== null) this.txDescription = description.substr(0, 256);
    if (redirect !== null) this.redirectUrlAfterSend = decodeURIComponent(redirect);
    this.maxMessageSize = config.maxMessageSize;
    this.oldIsWalletSyncing = true;
    this.isWalletSyncing = true;
    this.blockchainHeight = -1;
    this.checkOptimization();

    this.nfcAvailable = this.nfc.has;
		this.intervalRefresh = setInterval(() => {
			this.refresh();
		}, 1 * 1000);

		this.refresh();
  }

	refresh = () => {
		blockchainExplorer.getHeight().then((height : number) => {
			this.blockchainHeight = height;
      this.isWalletSyncing = (wallet.lastHeight + 2) < this.blockchainHeight;

      if ((this.oldIsWalletSyncing !== this.isWalletSyncing) && !this.isWalletSyncing) {
        this.checkOptimization();
      }
      
      this.oldIsWalletSyncing = this.isWalletSyncing;
		}).catch((err: any) => {
      // in case of error do nothing
    });
	}

  reset() {
    this.lockedForm = false;
    this.destinationAddressUser = '';
    this.destinationAddress = '';
    this.amountToSend = '0';
    this.destinationAddressValid = false;
    this.openAliasValid = false;
    this.qrScanning = false;
    this.amountToSendValid = false;
    this.domainAliasAddress = null;
    this.txDestinationName = null;
    this.txDescription = null;

    this.stopScan();
  }

  startNfcScan(){
    let self = this;
    if(this.ndefListener === null) {
      this.ndefListener = function (data: NdefMessage) {
        if (data.text)
          self.handleScanResult(data.text.content);
        swal.close();
      };
      this.nfc.listenNdef(this.ndefListener);
      swal({
        title:  i18n.t('sendPage.waitingNfcModal.title'),
        html: i18n.t('sendPage.waitingNfcModal.content'),
        onOpen: () => {
          swal.showLoading();
        },
        onClose: () => {
          this.stopNfcScan();
        }
      }).then((result : any) => {
        // do nothing
      });
    }
  }

  stopNfcScan(){
    if(this.ndefListener !== null)
      this.nfc.removeNdef(this.ndefListener);
    this.ndefListener = null;
  }

  initQr() {
    this.stopScan();
    this.qrReader = new QRReader();
    this.qrReader.init('/lib/');
  }

  startScan() {
    let self = this;
    if(typeof window.QRScanner !== 'undefined') {
      window.QRScanner.scan(function (err : any, result : any){
        if (err) {
          if(err.name === 'SCAN_CANCELED'){

          }else{
            alert(JSON.stringify(err));
          }
        } else {
          self.handleScanResult(result);
        }
      });

      window.QRScanner.show();
      $('body').addClass('transparent');
      $('#appContent').hide();
      $('#nativeCameraPreview').show();
    }else {
      this.initQr();
      if (this.qrReader) {
        this.qrScanning = true;
        this.qrReader.scan(function (result: string) {
          self.qrScanning = false;
          self.handleScanResult(result);
        });
      }
    }
  }

  handleScanResult(result : string){
    //console.log('Scan result:', result);
    let self = this;
    let parsed = false;
    try {
      let txDetails = CoinUri.decodeTx(result);
      if (txDetails !== null) {
        self.destinationAddressUser = txDetails.address;
        if (typeof txDetails.description !== 'undefined') self.txDescription = txDetails.description;
        if (typeof txDetails.recipientName !== 'undefined') self.txDestinationName = txDetails.recipientName;
        if (typeof txDetails.amount !== 'undefined') {
          self.amountToSend = txDetails.amount;
          self.lockedForm = true;
        }
        if(typeof txDetails.paymentId !== 'undefined')self.paymentId = txDetails.paymentId;
        parsed = true;
      }
    } catch (e) {
    }

    try {
      let txDetails = CoinUri.decodeWallet(result);
      if (txDetails !== null) {
        self.destinationAddressUser = txDetails.address;
        parsed = true;
      }
    } catch (e) {
    }

    if (!parsed)
      self.destinationAddressUser = result;
    self.stopScan();
  }

  stopScan() {
    if(typeof window.QRScanner !== 'undefined') {
      window.QRScanner.cancelScan(function (status:any){
        //console.log(status);
      });
      window.QRScanner.hide();
      $('body').removeClass('transparent');
      $('#appContent').show();
      $('#nativeCameraPreview').hide();
    }else {
      if (this.qrReader !== null) {
        this.qrReader.stop();
        this.qrReader = null;
        this.qrScanning = false;
      }
    }

  }

  destruct = (): Promise<void> => {
    clearInterval(this.intervalRefresh[Symbol.toPrimitive]());
    this.stopScan();
    this.stopNfcScan();
    swal.close();
    return super.destruct();
  }

  send = () => {
    let self = this;
    blockchainExplorer.getHeight().then(function (blockchainHeight: number) {
      let amount = parseFloat(self.amountToSend);
      if (self.destinationAddress !== null) {
        //todo use BigInteger
        if (amount * Math.pow(10, config.coinUnitPlaces) > wallet.unlockedAmount(blockchainHeight)) {
          swal({
            type: 'error',
            title: i18n.t('sendPage.notEnoughMoneyModal.title'),
            text: i18n.t('sendPage.notEnoughMoneyModal.content'),
            confirmButtonText: i18n.t('sendPage.notEnoughMoneyModal.confirmText'),
          });
          return;
        }

        //TODO use biginteger
        let amountToSend = amount * Math.pow(10, config.coinUnitPlaces);
        let destinationAddress = self.destinationAddress;

        swal({
          title: i18n.t('sendPage.creatingTransferModal.title'),
          html: i18n.t('sendPage.creatingTransferModal.content'),
          onOpen: () => {
            swal.showLoading();
          }
        });

        let mixinToSendWith: number = config.defaultMixin;

        TransactionsExplorer.createTx([{address: destinationAddress, amount: amountToSend}], self.paymentId, wallet, blockchainHeight,
          function (amounts: number[], numberOuts: number): Promise<RawDaemon_Out[]> {
            return blockchainExplorer.getRandomOuts(amounts, numberOuts);
          }
          , function (amount: number, feesAmount: number): Promise<void> {
            if (amount + feesAmount > wallet.unlockedAmount(blockchainHeight)) {
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
                    amount:amount / Math.pow(10, config.coinUnitPlaces),
                    fees:feesAmount / Math.pow(10, config.coinUnitPlaces),
                    total:(amount+feesAmount) / Math.pow(10, config.coinUnitPlaces),
                  }),
                  showCancelButton: true,
                  confirmButtonText: i18n.t('sendPage.confirmTransactionModal.confirmText'),
                  cancelButtonText: i18n.t('sendPage.confirmTransactionModal.cancelText'),
                }).then(function (result: any) {
                  if (result.dismiss) {
                    reject('');
                  } else {
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
              }, 1);
            });
          },
          mixinToSendWith, self.message, 0).then(function (rawTxData: { raw: { hash: string, prvkey: string, raw: string }, signed: any }) {

          blockchainExplorer.sendRawTx(rawTxData.raw.raw).then(function () {
            //save the tx private key
            wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);

            //force a mempool check so the user is up to date
            let watchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name);
            if (watchdog !== null)
              watchdog.checkMempool();

            let promise = Promise.resolve();
            if (destinationAddress === 'ccx7NzuofXxcypov8Yqm2A118xT17HereBFjp3RScjzM7wncf8BRcnHZbACy63sWD71L7NmkJRgQKXFE3weCfAh31RAVFHgttf' ||
                destinationAddress === 'ccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj' ||
                destinationAddress === 'ccx7YZ4RC97fqMh1bmzrFtDoSSiEgvEYzhaLE53SR9bh4QrDBUhGUH3TCmXqv8MTLjJDtnCeeaT5bLC2ZSzp3ZmQ19DoiPLLXS') {
              promise = swal({
                type: 'success',
                title: i18n.t('sendPage.thankYouDonationModal.title'),
                text: i18n.t('sendPage.thankYouDonationModal.content'),
                confirmButtonText: i18n.t('sendPage.thankYouDonationModal.confirmText'),
                onClose: () => {
                  window.location.href = '#!account';
                }
              });
            } else
              promise = swal({
                type: 'success',
                title: i18n.t('sendPage.transferSentModal.title'),
                confirmButtonText: i18n.t('sendPage.transferSentModal.confirmText'),
                onClose: () => {
                  window.location.href = '#!account';
                }
              });

            promise.then(function () {
              if (self.redirectUrlAfterSend !== null) {
                window.location.href = self.redirectUrlAfterSend.replace('{TX_HASH}', rawTxData.raw.hash);
              }
            });
          }).catch(function (data: any) {
            swal({
              type: 'error',
              title: i18n.t('sendPage.transferExceptionModal.title'),
              html: i18n.t('sendPage.transferExceptionModal.content', {details: JSON.stringify(data)}),
              confirmButtonText: i18n.t('sendPage.transferExceptionModal.confirmText'),
            });
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
      } else {
        swal({
          type: 'error',
          title: i18n.t('sendPage.invalidAmountModal.title'),
          html: i18n.t('sendPage.invalidAmountModal.content'),
          confirmButtonText: i18n.t('sendPage.invalidAmountModal.confirmText'),
        });
      }
		}).catch((err: any) => {
      console.error("Error trying to send funds", err);
    });
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
		}).catch((err: any) => {
      console.error("Error in checkOptimization, calling getHeight", err);
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
          console.log("processedOuts", processedOuts);
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
    }).catch((err: any) => {
      console.error("Error in optimizeWallet, calling getHeight", err);
    });
  }

  @VueWatched()
  destinationAddressUserWatch() {
    if (this.destinationAddressUser.indexOf('.') !== -1) {
      let self = this;
      if (this.timeoutResolveAlias !== 0)
        clearTimeout(this.timeoutResolveAlias);

      this.timeoutResolveAlias = <any>setTimeout(function () {
        blockchainExplorer.resolveOpenAlias(self.destinationAddressUser).then(function (data: { address: string, name: string | null }) {
          try {
            Cn.decode_address(data.address);
            self.txDestinationName = data.name;
            self.destinationAddress = data.address;
            self.domainAliasAddress = data.address;
            self.destinationAddressValid = true;
            self.openAliasValid = true;
          } catch (e) {
            self.destinationAddressValid = false;
            self.openAliasValid = false;
          }
          self.timeoutResolveAlias = 0;
        }).catch(function () {
          self.openAliasValid = false;
          self.timeoutResolveAlias = 0;
        });
      }, 400);
    } else {
      this.openAliasValid = true;
      try {
        Cn.decode_address(this.destinationAddressUser);
        this.destinationAddressValid = true;
        this.destinationAddress = this.destinationAddressUser;
      } catch (e) {
        this.destinationAddressValid = false;
      }
    }
  }

  @VueWatched()
  amountToSendWatch() {
    try {
      this.amountToSendValid = !isNaN(parseFloat(this.amountToSend));
    } catch (e) {
      this.amountToSendValid = false;
    }
  }

  @VueWatched()
  paymentIdWatch() {
    try {
      this.paymentIdValid = this.paymentId.length === 0 ||
        (this.paymentId.length === 16 && (/^[0-9a-fA-F]{16}$/.test(this.paymentId))) ||
        (this.paymentId.length === 64 && (/^[0-9a-fA-F]{64}$/.test(this.paymentId)))
      ;
    } catch (e) {
      this.paymentIdValid = false;
    }
  }

  @VueWatched()
  messageWatch() {
    try {
      this.messageValid = (this.message.length === 0) || (this.message.length <= config.maxMessageSize);
    } catch (e) {
      this.messageValid = false;
    }
  }

  @VueWatched()
  mixinWatch() {
    try {
      this.mixinIsValid = !isNaN(parseFloat(this.mixIn));

      let mixin: number =  parseFloat(this.mixIn);
      if (mixin > 10 || (mixin < 3 && mixin !== 0))
        this.mixinIsValid = false;

    } catch (e) {
      this.mixinIsValid = false;
    }
  }
}



if (wallet !== null && blockchainExplorer !== null)
  new SendView('#app');
else {
  AppState.askUserOpenWallet(false).then(function () {
    wallet = DependencyInjectorInstance().getInstance(Wallet.name, 'default', false);
    if (wallet === null)
      throw 'e';
    new SendView('#app');
  }).catch(function () {
    window.location.href = '#index';
  });
}



