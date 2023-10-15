define(["require", "exports", "../model/TransactionsExplorer", "../model/Wallet", "../model/Mnemonic"], function (require, exports, TransactionsExplorer_1, Wallet_1, Mnemonic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //bridge for cnUtil with the new mnemonic class
    self.mn_random = Mnemonic_1.Mnemonic.mn_random;
    self.mn_decode = Mnemonic_1.Mnemonic.mn_decode;
    self.mn_encode = Mnemonic_1.Mnemonic.mn_encode;
    onmessage = function (data) {
        // if(data.isTrusted){
        var event = data.data;
        try {
            if (event.type === 'initWallet') {
                postMessage({ type: 'readyWallet' });
            }
            else if (event.type === 'process') {
                logDebugMsg("process new transactions...");
                var readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
                var rawTransactions = event.transactions;
                var maxBlockNumber = event.maxBlock;
                var currentWallet = null;
                var transactions = [];
                // get the current wallet from even parameters
                currentWallet = Wallet_1.Wallet.loadFromRaw(event.wallet);
                // log any raw transactions that need to be processed
                logDebugMsg("rawTransactions", rawTransactions);
                if (!currentWallet) {
                    logDebugMsg("Wallet is missing...");
                    postMessage('missing_wallet');
                    return;
                }
                for (var _i = 0, rawTransactions_1 = rawTransactions; _i < rawTransactions_1.length; _i++) {
                    var rawTransaction = rawTransactions_1[_i];
                    if (rawTransaction) {
                        if (rawTransaction.height) {
                            if (!readMinersTx && TransactionsExplorer_1.TransactionsExplorer.isMinerTx(rawTransaction)) {
                                continue;
                            }
                            try {
                                // parse the transaction to see if we need to include it in the wallet
                                if (TransactionsExplorer_1.TransactionsExplorer.ownsTx(rawTransaction, currentWallet)) {
                                    transactions.push(rawTransaction);
                                    logDebugMsg("pushed tx to transactions[]");
                                }
                            }
                            catch (err) {
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
        }
        catch (err) {
            reportError(err);
        }
    };
    postMessage('ready');
});
