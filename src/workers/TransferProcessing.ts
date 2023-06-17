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
      let transactions: any[] = [];
      let walletKeys: any = null;
      walletKeys = event.keys;

      // log any raw transactions that need to be processed
      logDebugMsg(`rawTransactions`, rawTransactions);

      if (walletKeys === null) {
        logDebugMsg(`Wallet keys are missing...`);
        postMessage('missing_wallet_keys');
        return;
      }

      for (let rawTransaction of rawTransactions) {
        if (rawTransaction) {
          if (rawTransaction.height) {
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
        maxHeight: maxBlockNumber,
        transactions: transactions
      });
	  }
  } catch(err: any) {
    reportError(err);
  } 
};

postMessage('ready');