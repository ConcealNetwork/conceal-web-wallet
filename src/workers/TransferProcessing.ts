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
    } else if (event.type === 'screen') {
      let readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
      let rawTransactions: RawDaemon_Transaction[] = event.transactions;
      let maxBlockNumber: number = event.maxBlock;
      let startBlockNumber: number = typeof event.startBlock !== 'undefined' ? event.startBlock : 0;
      let shardIndex: number = typeof event.shardIndex !== 'undefined' ? event.shardIndex : 0;
      let currentWallet: Wallet | null = Wallet.loadFromRaw(event.wallet);
      let hashes: string[] = [];

      if (!currentWallet) {
        postMessage('missing_wallet');
        return;
      }

      for (let rawTransaction of rawTransactions) {
        if (!rawTransaction?.height) {
          continue;
        }

        if (!readMinersTx && TransactionsExplorer.isMinerTx(rawTransaction)) {
          continue;
        }

        try {
          if (TransactionsExplorer.ownsTx(rawTransaction, currentWallet)) {
            if (rawTransaction.hash) {
              hashes.push(rawTransaction.hash);
            }
          }
        } catch (err) {
          console.error(
            'Failed to screen ownsTx for tx:',
            rawTransaction.hash ?? rawTransaction,
            err
          );
        }
      }

      postMessage({
        type: 'screened',
        startBlock: startBlockNumber,
        maxHeight: maxBlockNumber,
        shardIndex: shardIndex,
        hashes: hashes,
      });
    } else if (event.type === 'process') {
      logDebugMsg(`process new transactions...`);

      let readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
      let rawTransactions: RawDaemon_Transaction[] = event.transactions;
      let maxBlockNumber: number = event.maxBlock;
      let startBlockNumber: number = typeof event.startBlock !== "undefined" ? event.startBlock : 0;
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

      const addedHashes = new Set<string>();

      // Two passes: merge each owned tx into the worker wallet so later spends
      // (same batch) see key images; second pass catches receive-before-spend ordering.
      for (let pass = 0; pass < 2; pass++) {
        for (let rawTransaction of rawTransactions) {
          if (!rawTransaction?.height) {
            continue;
          }

          if (rawTransaction.hash && addedHashes.has(rawTransaction.hash)) {
            continue;
          }

          if (!readMinersTx && TransactionsExplorer.isMinerTx(rawTransaction)) {
            continue;
          }

          try {
            if (TransactionsExplorer.ownsTx(rawTransaction, currentWallet)) {
              let txData = TransactionsExplorer.parse(rawTransaction, currentWallet);

              if (txData && txData.transaction) {
                currentWallet.addNew(txData.transaction);
                currentWallet.addDeposits(txData.deposits);
                currentWallet.addWithdrawals(txData.withdrawals);
                transactions.push(txData.export());
              }

              if (rawTransaction.hash) {
                addedHashes.add(rawTransaction.hash);
              }
            }
          } catch (err) {
            console.error(
              "Failed to process ownsTx for tx:",
              rawTransaction.hash ?? rawTransaction,
              err
            );
          }
        }
      }

      postMessage({
        type: "processed",
        startBlock: startBlockNumber,
        maxHeight: maxBlockNumber,
        transactions: transactions,
      });
	  }
  } catch(err: any) {
    reportError(err);
  } 
};

postMessage('ready');