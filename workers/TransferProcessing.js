define(["require", "exports", "../model/TransactionsExplorer", "../model/Wallet", "../model/Mnemonic"], function (require, exports, TransactionsExplorer_1, Wallet_1, Mnemonic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //bridge for cnUtil with the new mnemonic class
    self.mn_random = Mnemonic_1.Mnemonic.mn_random;
    self.mn_decode = Mnemonic_1.Mnemonic.mn_decode;
    self.mn_encode = Mnemonic_1.Mnemonic.mn_encode;
    var currentWallet = null;
    onmessage = function (data) {
        // if(data.isTrusted){
        var event = data.data;
        if (event.type === 'initWallet') {
            currentWallet = Wallet_1.Wallet.loadFromRaw(event.wallet);
            postMessage('readyWallet');
        }
        else if (event.type === 'process') {
            logDebugMsg("process new transactions...");
            if (typeof event.wallet !== 'undefined') {
                currentWallet = Wallet_1.Wallet.loadFromRaw(event.wallet);
            }
            if (currentWallet === null) {
                logDebugMsg("Wallet is missing...");
                postMessage('missing_wallet');
                return;
            }
            var readMinersTx = typeof currentWallet.options.checkMinerTx !== 'undefined' && currentWallet.options.checkMinerTx;
            var rawTransactions = event.transactions;
            var transactions = [];
            // log any raw transactions that need to be processed
            logDebugMsg("rawTransactions", rawTransactions);
            for (var _i = 0, rawTransactions_1 = rawTransactions; _i < rawTransactions_1.length; _i++) {
                var rawTransaction = rawTransactions_1[_i];
                if (!readMinersTx && TransactionsExplorer_1.TransactionsExplorer.isMinerTx(rawTransaction)) {
                    continue;
                }
                var transaction = TransactionsExplorer_1.TransactionsExplorer.parse(rawTransaction, currentWallet);
                if (transaction !== null) {
                    logDebugMsg("parsed tx ".concat(transaction['hash'], " from rawTransaction"));
                }
                if (transaction !== null) {
                    currentWallet.addNew(transaction);
                    logDebugMsg("Added tx ".concat(transaction.hash, " to currentWallet"));
                    transactions.push(transaction.export());
                    logDebugMsg("pushed tx ".concat(transaction.hash, " to transactions[]"));
                }
            }
            postMessage({
                type: 'processed',
                transactions: transactions
            });
        }
        // let transaction = TransactionsExplorer.parse(rawTransaction, height, this.wallet);
        // }else {
        // 	console.warn('Non trusted data', data.data, JSON.stringify(data.data));
        // }
    };
    postMessage('ready');
});
