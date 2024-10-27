import {Constants} from "../model/Constants";
import {Transaction} from "../model/Transaction";
import {Wallet, WalletOptions} from "../model/Wallet";
import {TransactionData} from "../model/Transaction";
import {TransactionsExplorer} from "../model/TransactionsExplorer";
import {RawDaemon_Transaction} from "../model/blockchain/BlockchainExplorer";

onmessage = function (data: MessageEvent) {
	// if(data.isTrusted){
	let event: any = data.data;
  try {
    if (event.type === 'initWallet') {
      postMessage({ type: 'readyWallet'	});
    } else if (event.type === 'process') {
      let readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
      let rawTransactions: RawDaemon_Transaction[] = event.transactions;
      let maxBlockNumber: number = event.maxBlock; 
      let currentWallet: Wallet | null = null;
      let transactions = [];

      if (rawTransactions.length > 0) {
        currentWallet = Wallet.loadFromRaw(event.wallet);
        logDebugMsg(`process new transactions...`);

        if (currentWallet === null) {
          logDebugMsg(`Wallet is missing...`);
          postMessage('missing_wallet');
          return;
        }

        // log any raw transactions that need to be processed
        logDebugMsg(`rawTransactions`, rawTransactions);

        for (let rawTransaction of rawTransactions) {
          if (rawTransaction) {
            if (rawTransaction.height) {
              if (!readMinersTx && TransactionsExplorer.isMinerTx(rawTransaction)) {
                continue;
              }

              try {
                // parse the raw transaction to include it into the wallet
                let txData = TransactionsExplorer.parse(rawTransaction, currentWallet);

                if (txData && txData.transaction) {              
                  currentWallet.addNew(txData.transaction);
                  transactions.push(txData.export());
                }
              } catch(err) {
                console.error('Failed to parse tx:', rawTransaction);  
              }
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