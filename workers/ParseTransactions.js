define(["require", "exports", "../model/Wallet", "../model/TransactionsExplorer"], function (require, exports, Wallet_1, TransactionsExplorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    onmessage = function (data) {
        // if(data.isTrusted){
        var event = data.data;
        try {
            if (event.type === 'initWallet') {
                postMessage({ type: 'readyWallet' });
            }
            else if (event.type === 'process') {
                var readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
                var rawTransactions = event.transactions;
                var maxBlockNumber = event.maxBlock;
                var currentWallet = null;
                var transactions = [];
                if (rawTransactions.length > 0) {
                    currentWallet = Wallet_1.Wallet.loadFromRaw(event.wallet);
                    logDebugMsg("process new transactions...");
                    if (currentWallet === null) {
                        logDebugMsg("Wallet is missing...");
                        postMessage('missing_wallet');
                        return;
                    }
                    // log any raw transactions that need to be processed
                    logDebugMsg("rawTransactions", rawTransactions);
                    for (var _i = 0, rawTransactions_1 = rawTransactions; _i < rawTransactions_1.length; _i++) {
                        var rawTransaction = rawTransactions_1[_i];
                        if (rawTransaction) {
                            if (rawTransaction.height) {
                                if (!readMinersTx && TransactionsExplorer_1.TransactionsExplorer.isMinerTx(rawTransaction)) {
                                    continue;
                                }
                                try {
                                    // parse the raw transaction to include it into the wallet
                                    var txData = TransactionsExplorer_1.TransactionsExplorer.parse(rawTransaction, currentWallet);
                                    if (txData && txData.transaction) {
                                        currentWallet.addNew(txData.transaction);
                                        transactions.push(txData.export());
                                    }
                                }
                                catch (err) {
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
        }
        catch (err) {
            reportError(err);
        }
    };
    postMessage('ready');
});
