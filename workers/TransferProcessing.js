define(["require", "exports", "../model/TransactionsExplorer", "../model/Wallet", "../model/Mnemonic"], function (require, exports, TransactionsExplorer_1, Wallet_1, Mnemonic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //bridge for cnUtil with the new mnemonic class
    self.mn_random = Mnemonic_1.Mnemonic.mn_random;
    self.mn_decode = Mnemonic_1.Mnemonic.mn_decode;
    self.mn_encode = Mnemonic_1.Mnemonic.mn_encode;
    onmessage = function (data) {
        var _a;
        // if(data.isTrusted){
        var event = data.data;
        try {
            if (event.type === 'initWallet') {
                postMessage({ type: 'readyWallet' });
            }
            else if (event.type === 'screen') {
                var readMinersTx = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
                var rawTransactions = event.transactions;
                var maxBlockNumber = event.maxBlock;
                var startBlockNumber = typeof event.startBlock !== 'undefined' ? event.startBlock : 0;
                var shardIndex = typeof event.shardIndex !== 'undefined' ? event.shardIndex : 0;
                var currentWallet = Wallet_1.Wallet.loadFromRaw(event.wallet);
                var hashes = [];
                if (!currentWallet) {
                    postMessage('missing_wallet');
                    return;
                }
                try {
                    hashes = TransactionsExplorer_1.TransactionsExplorer.screenShardForOwnedHashes(rawTransactions, currentWallet, readMinersTx);
                }
                catch (err) {
                    console.error('Failed to screen shard:', err);
                }
                postMessage({
                    type: 'screened',
                    startBlock: startBlockNumber,
                    maxHeight: maxBlockNumber,
                    shardIndex: shardIndex,
                    hashes: hashes,
                });
            }
            else if (event.type === 'process') {
                logDebugMsg("process new transactions...");
                var readMinersTx_1 = typeof event.readMinersTx !== 'undefined' && event.readMinersTx;
                var screenedOwned_1 = typeof event.screenedOwned !== 'undefined' && event.screenedOwned;
                var rawTransactions = event.transactions;
                var maxBlockNumber = event.maxBlock;
                var startBlockNumber = typeof event.startBlock !== "undefined" ? event.startBlock : 0;
                var currentWallet_1 = null;
                var transactions_1 = [];
                // get the current wallet from even parameters
                currentWallet_1 = Wallet_1.Wallet.loadFromRaw(event.wallet);
                // log any raw transactions that need to be processed
                logDebugMsg("rawTransactions", rawTransactions);
                if (!currentWallet_1) {
                    logDebugMsg("Wallet is missing...");
                    postMessage('missing_wallet');
                    return;
                }
                var addedHashes_1 = new Set();
                var tryProcessTx = function (rawTransaction) {
                    if (!(rawTransaction === null || rawTransaction === void 0 ? void 0 : rawTransaction.height)) {
                        return;
                    }
                    if (rawTransaction.hash && addedHashes_1.has(rawTransaction.hash)) {
                        return;
                    }
                    if (!readMinersTx_1 && TransactionsExplorer_1.TransactionsExplorer.isMinerTx(rawTransaction)) {
                        return;
                    }
                    var isOwned = screenedOwned_1 || TransactionsExplorer_1.TransactionsExplorer.ownsTx(rawTransaction, currentWallet_1);
                    if (!isOwned) {
                        return;
                    }
                    var txData = TransactionsExplorer_1.TransactionsExplorer.parse(rawTransaction, currentWallet_1);
                    if (txData && txData.transaction) {
                        currentWallet_1.addNew(txData.transaction);
                        currentWallet_1.addDeposits(txData.deposits);
                        currentWallet_1.addWithdrawals(txData.withdrawals);
                        transactions_1.push(txData.export());
                    }
                    if (rawTransaction.hash) {
                        addedHashes_1.add(rawTransaction.hash);
                    }
                };
                // Two passes: merge each owned tx into the worker wallet so later spends
                // (same batch) see key images; second pass catches receive-before-spend ordering.
                for (var pass = 0; pass < 2; pass++) {
                    for (var _i = 0, rawTransactions_1 = rawTransactions; _i < rawTransactions_1.length; _i++) {
                        var rawTransaction = rawTransactions_1[_i];
                        try {
                            tryProcessTx(rawTransaction);
                        }
                        catch (err) {
                            console.error("Failed to process tx:", (_a = rawTransaction.hash) !== null && _a !== void 0 ? _a : rawTransaction, err);
                        }
                    }
                }
                postMessage({
                    type: "processed",
                    startBlock: startBlockNumber,
                    maxHeight: maxBlockNumber,
                    transactions: transactions_1,
                });
            }
        }
        catch (err) {
            reportError(err);
        }
    };
    postMessage('ready');
});
