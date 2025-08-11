"use strict";
//export {};
var myGlobal = typeof window !== 'undefined' ? window : self;
myGlobal.config = {
    debug: false,
    apiUrl: [
        "https://ccxapi.conceal.network/api/"
    ],
    nodeList: [
        //"https://seed1.conceal.network/daemon/",  this node url is temporary disabled
        "https://seed2.conceal.network/daemon/",
        "https://seed3.conceal.network/daemon/"
    ],
    publicNodes: "https://explorer.conceal.network/pool",
    mainnetExplorerUrl: "https://explorer.conceal.network/",
    mainnetExplorerUrlHash: "https://explorer.conceal.network/index.html?hash={ID}#blockchain_transaction",
    mainnetExplorerUrlBlock: "https://explorer.conceal.network/index.html?hash={ID}#blockchain_block",
    testnetExplorerUrl: "https://explorer.testnet.conceal.network/",
    testnetExplorerUrlHash: "https://explorer.testnet.conceal.network/index.html?hash={ID}#blockchain_transaction",
    testnetExplorerUrlBlock: "https://explorer.testnet.conceal.network/index.html?hash={ID}#blockchain_block",
    testnet: false,
    coinUnitPlaces: 6,
    coinDisplayUnitPlaces: 6,
    txMinConfirms: 10,
    txCoinbaseMinConfirms: 10,
    addressPrefix: 0x7AD4,
    integratedAddressPrefix: 0x7AD5,
    subAddressPrefix: 0x7AD6,
    addressPrefixTestnet: 0x7AD4,
    integratedAddressPrefixTestnet: 0x7AD5,
    subAddressPrefixTestnet: 0x7AD6,
    UPGRADE_HEIGHT_V4: 45000,
    // Fees
    coinFee: new JSBigInt('1000'),
    minimumFee_V2: new JSBigInt('1000'), // used for fusion tx
    remoteNodeFee: new JSBigInt('10000'),
    feePerKB: new JSBigInt('1000'), //for testnet its not used, as fee is dynamic.
    dustThreshold: new JSBigInt('10'), //used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
    defaultMixin: 5, // default value mixin
    optimizeOutputs: 100, // Qty of outputs we consider for the need of optimization, 100 to be like C++ ...might be too big to handle
    optimizeThreshold: 100, // amount of CCX in units we consider as the threshold for optimization. 100 to be like C++ ...might be too small...open for discussion
    messageTxAmount: new JSBigInt('100'), // amount sent to the receiver of the message needed so we have at least one output for them, 100 to be like C++ ...open for discussion
    maxMessageSize: 260, // maximum lenght of the message
    cryptonoteMemPoolTxLifetime: (60 * 60 * 12), // 12 hours
    // Fusion
    fusionTxMinInOutCountRatio: 4,
    maxFusionOutputs: 8,
    idleTimeout: 30,
    idleWarningDuration: 20,
    syncBlockCount: 300, // how many block we sync at once for a single remote node
    maxBlockQueue: 10, // how many watchdog blocks can be max in the queue before waiting
    maxRemoteNodes: 8, // what is the max remote nodes we use in a sync process
    maxWorkerCores: 8, // max cores that the workers can use. If lower they will use numberOfCores - 1
    coinSymbol: 'CCX',
    coinSymbolShort: '₡',
    openAliasPrefix: "ccx",
    coinName: 'Conceal',
    coinUriPrefix: 'conceal:',
    donationAddress: 'ccx7V4LeUXy2eZ9waDXgsLS7Uc11e2CpNSCWVdxEqSRFAm6P6NQhSb7XMG1D6VAZKmJeaJP37WYQg84zbNrPduTX2whZ5pacfj',
    avgBlockTime: 120,
    maxBlockNumber: 500000000,
    depositMinAmountCoin: 1,
    depositMinTermMonth: 1,
    depositMinTermBlock: 21900,
    depositMaxTermMonth: 12,
    depositSmallWithdrawFee: 10,
    depositRateV3: [0.029, 0.039, 0.049], // Define deposit rates for different tiers	
    PRETTY_AMOUNTS: [
        1, 2, 3, 4, 5, 6, 7, 8, 9,
        10, 20, 30, 40, 50, 60, 70, 80, 90,
        100, 200, 300, 400, 500, 600, 700, 800, 900,
        1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
        10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000,
        100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000,
        1000000, 2000000, 3000000, 4000000, 5000000, 6000000, 7000000, 8000000, 9000000,
        10000000, 20000000, 30000000, 40000000, 50000000, 60000000, 70000000, 80000000, 90000000,
        100000000, 200000000, 300000000, 400000000, 500000000, 600000000, 700000000, 800000000, 900000000,
        1000000000, 2000000000, 3000000000, 4000000000, 5000000000, 6000000000, 7000000000, 8000000000, 9000000000,
        10000000000, 20000000000, 30000000000, 40000000000, 50000000000, 60000000000, 70000000000, 80000000000, 90000000000,
        100000000000, 200000000000, 300000000000, 400000000000, 500000000000, 600000000000, 700000000000, 800000000000, 900000000000,
        1000000000000, 2000000000000, 3000000000000, 4000000000000, 5000000000000, 6000000000000, 7000000000000, 8000000000000, 9000000000000,
        10000000000000, 20000000000000, 30000000000000, 40000000000000, 50000000000000, 60000000000000, 70000000000000, 80000000000000, 90000000000000,
        100000000000000, 200000000000000, 300000000000000, 400000000000000, 500000000000000, 600000000000000, 700000000000000, 800000000000000, 900000000000000,
        1000000000000000, 2000000000000000, 3000000000000000, 4000000000000000, 5000000000000000, 6000000000000000, 7000000000000000, 8000000000000000, 9000000000000000,
        10000000000000000, 20000000000000000, 30000000000000000, 40000000000000000, 50000000000000000, 60000000000000000, 70000000000000000, 80000000000000000, 90000000000000000,
        100000000000000000, 200000000000000000, 300000000000000000, 400000000000000000, 500000000000000000, 600000000000000000, 700000000000000000, 800000000000000000, 900000000000000000,
        1000000000000000000, 2000000000000000000, 3000000000000000000, 4000000000000000000, 5000000000000000000, 6000000000000000000, 7000000000000000000, 8000000000000000000, 9000000000000000000,
        10000000000000000000
    ],
};
function logDebugMsg() {
    var data = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        data[_i] = arguments[_i];
    }
    if (config.debug) {
        if (data.length > 1) {
            console.log(data[0], data.slice(1));
        }
        else {
            console.log(data[0]);
        }
    }
}
// log debug messages if debug is set to true
myGlobal.logDebugMsg = logDebugMsg;
