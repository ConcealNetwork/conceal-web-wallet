/*
 * Copyright (c) 2022 - 2025, Conceal Network, Conceal Devs
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

import { DestructableView } from "../lib/numbersLab/DestructableView";
import { VueRequireFilter, VueVar, VueWatched } from "../lib/numbersLab/VueAnnotate";
import { TransactionsExplorer } from "../model/TransactionsExplorer";
import { Autowire, DependencyInjectorInstance } from "../lib/numbersLab/DependencyInjector";
import { Wallet } from "../model/Wallet";
import { Url } from "../utils/Url";
import { CoinUri } from "../model/CoinUri";
import { QRReader } from "../model/QRReader";
import { AppState } from "../model/AppState";
import { Transaction, TransactionIn } from "../model/Transaction";
import { BlockchainExplorerProvider } from "../providers/BlockchainExplorerProvider";
import { NdefMessage, Nfc } from "../model/Nfc";
import { BlockchainExplorer, RawDaemon_Out } from "../model/blockchain/BlockchainExplorer";
import { Cn } from "../model/Cn";
import { WalletWatchdog } from "../model/WalletWatchdog";

let wallet: Wallet = DependencyInjectorInstance().getInstance(Wallet.name, "default", false);
let blockchainExplorer: BlockchainExplorer = BlockchainExplorerProvider.getInstance();

class MessagesView extends DestructableView {
  @VueVar([]) transactions!: Transaction[];
  @VueVar("") messageFilter!: string;
  @VueVar(0) blockchainHeight!: number;
  @VueVar("") destinationAddressUser!: string;
  @VueVar("") destinationAddress!: string;
  @VueVar(false) destinationAddressValid!: boolean;
  @VueVar("") message!: string;
  @VueVar(true) messageValid!: boolean;
  @VueVar(false) lockedForm!: boolean;
  @VueVar(0) maxMessageSize!: number;
  @VueVar(0) ttl!: number;
  @VueVar(0) cryptonoteMemPoolTxLifetime!: number;
  @VueVar(null) domainAliasAddress!: string | null;
  @VueVar(null) txDestinationName!: string | null;
  @VueVar(null) txDescription!: string | null;
  @VueVar(false) isWalletSyncing!: boolean;
  @VueVar(true) openAliasValid!: boolean;

  @VueVar(false) qrScanning!: boolean;
  @VueVar(false) nfcAvailable!: boolean;

  @VueVar(false) formatMessage!: boolean;
  @VueVar("messageHistory") activeTab!: "messageHistory" | "sendMessage";
  @Autowire(Nfc.name) nfc!: Nfc;

  readonly refreshInterval = 500;

  private intervalRefresh: NodeJS.Timeout;

  private qrReader: QRReader | null = null;
  private timeoutResolveAlias = 0;
  private redirectUrlAfterSend: string | null = null;

  ndefListener: ((data: NdefMessage) => void) | null = null;

  constructor(container: string) {
    super(container);

    this.maxMessageSize = config.maxMessageSize;
    this.isWalletSyncing = true;
    this.cryptonoteMemPoolTxLifetime = config.cryptonoteMemPoolTxLifetime;
    AppState.enableLeftMenu();

    this.nfcAvailable = this.nfc.has;
    this.intervalRefresh = setInterval(() => {
      this.refresh();
    }, 3 * 1000);

    this.refresh();
  }

  destruct = (): Promise<void> => {
    clearInterval(this.intervalRefresh);
    return super.destruct();
  };

  refresh = () => {
    blockchainExplorer
      .getHeight()
      .then((height: number) => {
        this.isWalletSyncing = wallet.lastHeight + 2 < height;
        this.blockchainHeight = height;
        this.refreshWallet();
      })
      .catch((err: any) => {
        this.refreshWallet();
      });
  };

  refreshWallet = (forceRedraw: boolean = false) => {
    let allTransactions = wallet.txsMem.concat(wallet.getTransactionsCopy().reverse());

    this.transactions = allTransactions.filter((tx) => {
      return tx.message;
    });
  };

  reset() {
    this.lockedForm = false;
    this.destinationAddressUser = "";
    this.destinationAddress = "";
    this.destinationAddressValid = false;
    this.openAliasValid = false;
    this.qrScanning = false;
    this.domainAliasAddress = null;
    this.txDestinationName = null;
    this.txDescription = null;
    this.ttl = 0;
    this.message = "";

    this.stopScan();
  }

  startNfcScan() {
    let self = this;
    if (this.ndefListener === null) {
      this.ndefListener = function (data: NdefMessage) {
        if (data.text) self.handleScanResult(data.text.content);
        swal.close();
      };
      this.nfc.listenNdef(this.ndefListener);
      swal({
        title: i18n.t("sendPage.waitingNfcModal.title"),
        html: i18n.t("sendPage.waitingNfcModal.content"),
        onOpen: () => {
          swal.showLoading();
        },
        onClose: () => {
          this.stopNfcScan();
        },
      }).then((result: any) => {
        // do nothing
      });
    }
  }

  stopNfcScan() {
    if (this.ndefListener !== null) this.nfc.removeNdef(this.ndefListener);
    this.ndefListener = null;
  }

  initQr() {
    this.stopScan();
    this.qrReader = new QRReader();
    this.qrReader.init("/lib/");
  }

  startScan() {
    let self = this;
    if (typeof window.QRScanner !== "undefined") {
      window.QRScanner.scan(function (err: any, result: any) {
        if (err) {
          if (err.name === "SCAN_CANCELED") {
          } else {
            alert(JSON.stringify(err));
          }
        } else {
          self.handleScanResult(result);
        }
      });

      window.QRScanner.show();
      $("body").addClass("transparent");
      $("#appContent").hide();
      $("#nativeCameraPreview").show();
    } else {
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

  handleScanResult(result: string) {
    //console.log('Scan result:', result);
    let self = this;
    let parsed = false;
    try {
      let txDetails = CoinUri.decodeTx(result);
      if (txDetails !== null) {
        self.destinationAddressUser = txDetails.address;
        if (typeof txDetails.description !== "undefined") self.txDescription = txDetails.description;
        if (typeof txDetails.recipientName !== "undefined") self.txDestinationName = txDetails.recipientName;
        parsed = true;
      }
    } catch (e) {}

    try {
      let txDetails = CoinUri.decodeWallet(result);
      if (txDetails !== null) {
        self.destinationAddressUser = txDetails.address;
        parsed = true;
      }
    } catch (e) {}

    if (!parsed) self.destinationAddressUser = result;
    self.stopScan();
  }

  stopScan() {
    if (typeof window.QRScanner !== "undefined") {
      window.QRScanner.cancelScan(function (status: any) {
        //console.log(status);
      });
      window.QRScanner.hide();
      $("body").removeClass("transparent");
      $("#appContent").show();
      $("#nativeCameraPreview").hide();
    } else {
      if (this.qrReader !== null) {
        this.qrReader.stop();
        this.qrReader = null;
        this.qrScanning = false;
      }
    }
  }

  send = () => {
    let self = this;
    blockchainExplorer
      .getHeight()
      .then(function (blockchainHeight: number) {
        if (self.destinationAddress !== null) {
          let destinationAddress = self.destinationAddress;
          let amountToSend = config.messageTxAmount;

          let ttl = self.ttl ? self.ttl : 0;
          swal({
            title: i18n.t("sendPage.creatingTransferModal.title"),
            html: i18n.t("sendPage.creatingTransferModal.content"),
            onOpen: () => {
              swal.showLoading();
            },
          });

          let mixinToSendWith: number = config.defaultMixin;

          let destination: any[] = [{ address: destinationAddress, amount: amountToSend }];

          // Get fee address from session node for remote node fee
          blockchainExplorer
            .getSessionNodeFeeAddress()
            .then((remoteFeeAddress: string) => {
              if (remoteFeeAddress !== wallet.getPublicAddress() && ttl === 0) {
                if (remoteFeeAddress !== "") {
                  destination.push({
                    address: remoteFeeAddress,
                    amount: config.remoteNodeFee,
                  });
                } else {
                  destination.push({
                    address: config.donationAddress,
                    amount: config.remoteNodeFee,
                  });
                }
              }

              TransactionsExplorer.createTx(
                destination,
                "",
                wallet,
                blockchainHeight,
                function (amounts: number[], numberOuts: number): Promise<RawDaemon_Out[]> {
                  return blockchainExplorer.getRandomOuts(amounts, numberOuts);
                },
                function (amount: number, feesAmount: number): Promise<void> {
                  if (amount + feesAmount > wallet.availableAmount(blockchainHeight)) {
                    swal({
                      type: "error",
                      title: i18n.t("sendPage.notEnoughMoneyModal.title"),
                      text: i18n.t("sendPage.notEnoughMoneyModal.content"),
                      confirmButtonText: i18n.t("sendPage.notEnoughMoneyModal.confirmText"),
                      onOpen: () => {
                        swal.hideLoading();
                      },
                    });
                    throw "";
                  }

                  return new Promise<void>(function (resolve, reject) {
                    setTimeout(function () {
                      //prevent bug with swal when code is too fast
                      let feeInfo = "";
                      if (remoteFeeAddress !== wallet.getPublicAddress() && ttl === 0) {
                        feeInfo =
                          '<br><br><span style="font-size: 0.8em; font-style: italic; color: #666;">' +
                          "(" +
                          i18n.t("sendPage.confirmTransactionModal.remoteNodeFee", {
                            fee: config.remoteNodeFee / Math.pow(10, config.coinUnitPlaces),
                            symbol: config.coinSymbol,
                          }) +
                          ")" +
                          "</span>";
                      }

                      swal({
                        title: i18n.t("sendPage.confirmTransactionModal.title"),
                        html:
                          i18n.t("sendPage.confirmTransactionModal.content", {
                            amount: amount / Math.pow(10, config.coinUnitPlaces),
                            fees: feesAmount / Math.pow(10, config.coinUnitPlaces),
                            total: (amount + feesAmount) / Math.pow(10, config.coinUnitPlaces),
                          }) + feeInfo,
                        showCancelButton: true,
                        confirmButtonText: i18n.t("sendPage.confirmTransactionModal.confirmText"),
                        cancelButtonText: i18n.t("sendPage.confirmTransactionModal.cancelText"),
                      })
                        .then(function (result: any) {
                          if (result.dismiss) {
                            reject("");
                          } else {
                            swal({
                              title: i18n.t("sendPage.finalizingTransferModal.title"),
                              html: i18n.t("sendPage.finalizingTransferModal.content"),
                              onOpen: () => {
                                swal.showLoading();
                              },
                            });
                            resolve();
                          }
                        })
                        .catch(reject);
                    }, 1);
                  });
                },
                mixinToSendWith,
                self.message,
                ttl
              )
                .then(function (rawTxData: { raw: { hash: string; prvkey: string; raw: string }; signed: any }) {
                  blockchainExplorer
                    .sendRawTx(rawTxData.raw.raw)
                    .then(function () {
                      //save the tx private key
                      wallet.addTxPrivateKeyWithTxHash(rawTxData.raw.hash, rawTxData.raw.prvkey);

                      //force a mempool check so the user is up to date
                      let watchdog: WalletWatchdog = DependencyInjectorInstance().getInstance(WalletWatchdog.name);
                      if (watchdog !== null) watchdog.checkMempool();

                      let promise = Promise.resolve();
                      promise = swal({
                        type: "success",
                        title: i18n.t("sendPage.transferSentModal.title"),
                        confirmButtonText: i18n.t("sendPage.transferSentModal.confirmText"),
                        onClose: () => {
                          window.location.href = "#!account";
                        },
                      });

                      promise.then(function () {
                        if (self.redirectUrlAfterSend !== null) {
                          window.location.href = self.redirectUrlAfterSend.replace("{TX_HASH}", rawTxData.raw.hash);
                        }
                      });
                    })
                    .catch(function (data: any) {
                      swal({
                        type: "error",
                        title: i18n.t("sendPage.transferExceptionModal.title"),
                        html: i18n.t("sendPage.transferExceptionModal.content", { details: JSON.stringify(data) }),
                        confirmButtonText: i18n.t("sendPage.transferExceptionModal.confirmText"),
                      });
                    });
                  swal.close();
                })
                .catch(function (error: any) {
                  //console.log(error);
                  if (error && error !== "") {
                    if (typeof error === "string")
                      swal({
                        type: "error",
                        title: i18n.t("sendPage.transferExceptionModal.title"),
                        html: i18n.t("sendPage.transferExceptionModal.content", { details: error }),
                        confirmButtonText: i18n.t("sendPage.transferExceptionModal.confirmText"),
                      });
                    else
                      swal({
                        type: "error",
                        title: i18n.t("sendPage.transferExceptionModal.title"),
                        html: i18n.t("sendPage.transferExceptionModal.content", { details: JSON.stringify(error) }),
                        confirmButtonText: i18n.t("sendPage.transferExceptionModal.confirmText"),
                      });
                  }
                });
            })
            .catch((err: any) => {
              console.error("Error getting session node fee address", err);
            });
        } else {
          swal({
            type: "error",
            title: i18n.t("sendPage.invalidAmountModal.title"),
            html: i18n.t("sendPage.invalidAmountModal.content"),
            confirmButtonText: i18n.t("sendPage.invalidAmountModal.confirmText"),
          });
        }
      })
      .catch((err: any) => {
        console.error("Error trying to send funds", err);
      });
  };

  @VueWatched()
  destinationAddressUserWatch() {
    if (this.destinationAddressUser.indexOf(".") !== -1) {
      let self = this;
      if (this.timeoutResolveAlias !== 0) clearTimeout(this.timeoutResolveAlias);

      this.timeoutResolveAlias = <any>setTimeout(function () {
        blockchainExplorer
          .resolveOpenAlias(self.destinationAddressUser)
          .then(function (data: { address: string; name: string | null }) {
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
          })
          .catch(function () {
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
  messageWatch() {
    try {
      this.messageValid = this.message.length === 0 || this.message.length <= config.maxMessageSize;
    } catch (e) {
      this.messageValid = false;
    }
  }

  @VueWatched()
  activeTabWatch() {
    // Reset TTL to 0 when switching to sendMessage tab
    if (this.activeTab === "sendMessage") {
      this.ttl = 0;
    }
  }

  formatMessageText(text: string): string {
    if (!text) return "";

    // Define colors based on active tab
    const codeColors =
      this.activeTab === "messageHistory"
        ? {
            bg: "#2d3748",
            textCode: "#fafafa",
            textBold: "#fafafa",
            border: "#D9DCE7",
          } // Dark theme for history
        : {
            bg: "#424242",
            textCode: "#fafafa",
            textBold: "#2d3748",
            border: "#000",
          }; // Light theme for send message

    // Replace **text** with <b>text</b> (bold) - no spaces between asterisks and text
    let formatted = text.replace(
      /\*\*([^*\s][^*]*[^*\s])\*\*/g,
      `<span style="font-weight: bold; color: ${codeColors.textBold}; text-shadow: 0px 0px 1px ${codeColors.textBold}">$1</span>`
    );
    // Replace *text* with <i>text</i> (italic) - no spaces between asterisks and text
    formatted = formatted.replace(/\*([^*\s][^*]*[^*\s])\*/g, "<i>$1</i>");
    // Replace `text` with variable styling based on active tab
    formatted = formatted.replace(
      /`([^`]+)`/g,
      `<span style="background-color: ${codeColors.bg}; color: ${codeColors.textCode}; padding: 1px 3px; border-radius: 3px; border: 1px solid ${codeColors.border}; font-family: monospace; font-size: 0.9em;">$1</span>`
    );
    // Replace "* " with bullet point
    formatted = formatted.replace(/\*\s/g, "&nbsp;&nbsp•&nbsp");
    // Replace any two spaces with <br>
    formatted = formatted.replace(/  /g, "<br>");

    return formatted;
  }

  formatTTL(minutes: number): string {
    if (minutes === 0) {
      return "00:00 (no TTL)";
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  getTTLCountdown(transaction: Transaction): string {
    if (!transaction.ttl || transaction.ttl === 0 || transaction.blockHeight !== 0) {
      return "";
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const remainingSeconds = transaction.ttl - currentTimestamp;

    if (remainingSeconds <= 0) {
      return "Expired";
    }

    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  markMessageSeen(txHash: string) {
    if (this.transactions.find((tx) => tx.hash === txHash)?.messageViewed === false) {
      wallet.updateTransactionFlags(txHash, { messageViewed: true });
    }
  }

  get filteredTransactions(): Transaction[] {
    let filtered = this.transactions;

    // Filter out expired TTL transactions
    filtered = filtered.filter((tx) => {
      if (tx.ttl > 0) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        return currentTimestamp < tx.ttl; // Keep only non-expired TTL transactions
      }
      return true; // Keep non-TTL transactions
    });

    // Apply message filter if set
    if (!this.messageFilter) {
      return filtered;
    }

    const searchText = this.messageFilter.toLowerCase();
    return filtered.filter((tx) => tx.message && tx.message.toLowerCase().includes(searchText));
  }

  get showPreview(): boolean {
    return this.message.includes("  ") || this.message.includes("*") || this.message.includes("`");
  }
}

if (wallet !== null && blockchainExplorer !== null) new MessagesView("#app");
else {
  AppState.askUserOpenWallet(false)
    .then(function () {
      wallet = DependencyInjectorInstance().getInstance(Wallet.name, "default", false);
      if (wallet === null) throw "e";
      new MessagesView("#app");
    })
    .catch(function () {
      window.location.href = "#index";
    });
}
