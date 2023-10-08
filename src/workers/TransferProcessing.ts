import {TransactionsExplorer} from "../model/TransactionsExplorer";
import {Wallet, WalletOptions} from "../model/Wallet";
import {Mnemonic} from "../model/Mnemonic";
import {Transaction} from "../model/Transaction";
import {Constants} from "../model/Constants";
import {RawDaemon_Transaction} from "../model/blockchain/BlockchainExplorer";

//bridge for cnUtil with the new mnemonic class
(<any>self).mn_random = Mnemonic.mn_random;
(<any>self).mn_decode = Mnemonic.mn_decode;
(<any>self).mn_encode = Mnemonic.mn_encode;

onmessage = function (data: MessageEvent) {
	// if(data.isTrusted){
	let event: any = data.data;
  try {
    if (event.type === 'initWallet') {
      postMessage({ type: 'readyWallet'	});
    } else if (event.type === 'process') {
      logDebugMsg(`process new transactions...`);

      let readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
      let rawTransactions: RawDaemon_Transaction[] = event.transactions;
      let maxBlockNumber: number = event.maxBlock; 
      let currentWallet: Wallet | null = null;
      let transactions: any[] = [];

      // get the current wallet from even parameters
      currentWallet = Wallet.loadFromRaw(event.wallet);
      // log any raw transactions that need to be processed
      logDebugMsg(`rawTransactions`, rawTransactions);

      if (!currentWallet) {
        logDebugMsg(`Wallet is missing...`);
        postMessage('missing_wallet');
        return;
      }

      for (let rawTransaction of rawTransactions) {
        if (rawTransaction) {
          if (rawTransaction.height) {
            if (!readMinersTx && TransactionsExplorer.isMinerTx(rawTransaction)) {
              continue;
            }

            try {
              // parse the transaction to see if we need to include it in the wallet
              if (TransactionsExplorer.ownsTx(rawTransaction, currentWallet)) {              
                transactions.push(rawTransaction);
                logDebugMsg(`pushed tx to transactions[]`);
              }
            } catch(err) {
              console.error('Failed to process ownsTx for tx:', rawTransaction);
            }
          }
        }
      }

      postMessage({
        type: 'processed',
        maxHeight: maxBlockNumber,
        transactions: transactions
      });
	  }
  } catch(err: any) {
    reportError(err);
  } 
};

postMessage('ready');