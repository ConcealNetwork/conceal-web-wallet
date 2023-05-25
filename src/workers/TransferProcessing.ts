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

let walletKeys: any = null;

onmessage = function (data: MessageEvent) {
	// if(data.isTrusted){
	let event: any = data.data;
  try {
    if (event.type === 'initWallet') {
      walletKeys = event.keys;
      postMessage({ type: 'readyWallet'	});
    } else if (event.type === 'process') {
      logDebugMsg(`process new transactions...`);

      if (walletKeys === null) {
        logDebugMsg(`Wallet keys are missing...`);
        postMessage('missing_wallet_keys');
        return;
      }

      let readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
      let rawTransactions: RawDaemon_Transaction[] = event.transactions;
      let transactions: any[] = [];
      let maxHeight: number = -1;

      // log any raw transactions that need to be processed
      logDebugMsg(`rawTransactions`, rawTransactions);

      for (let rawTransaction of rawTransactions) {
        if (rawTransaction) {
          if (rawTransaction.height) {
            maxHeight = Math.max(rawTransaction.height, maxHeight);

            if (!readMinersTx && TransactionsExplorer.isMinerTx(rawTransaction)) {
              continue;
            }

            // parse the transaction to see if we need to include it in the wallet
            if (TransactionsExplorer.ownsTx(rawTransaction, walletKeys)) {              
              transactions.push(rawTransaction);
              logDebugMsg(`pushed tx to transactions[]`);
            }
          }
        }
      }

      postMessage({
        type: 'processed',
        maxHeight: maxHeight,
        transactions: transactions
      });
	  }
  } catch(err: any) {
    reportError(err);
  } 
};

postMessage('ready');