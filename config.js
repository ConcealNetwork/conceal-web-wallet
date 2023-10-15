"use strict";
//export {};
var myGlobal = typeof window !== 'undefined' ? window : self;
myGlobal.config = {
    debug: false,
    apiUrl: [
        "https://ccxapi.conceal.network/api/"
    ],
    nodeList: [
        "https://seed1.conceal.network/daemon/",
        "https://seed2.conceal.network/daemon/",
        "https://seed3.conceal.network/daemon/",
        "https://ccxapi.conceal.network/daemon/",
        "https://explorer.conceal.network/daemon/"
    ],
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
    coinFee: new JSBigInt('1000'),
    feePerKB: new JSBigInt('1000'),
    dustThreshold: new JSBigInt('10'),
    defaultMixin: 5,
    optimizeOutputs: 100,
    optimizeThreshold: 1,
    messageTxAmount: new JSBigInt('1000'),
    maxMessageSize: 260,
    idleTimeout: 30,
    idleWarningDuration: 20,
    syncBlockCount: 300,
    maxBlockQueue: 25,
    maxRemoteNodes: 8,
    maxWorkerCores: 8,
    coinSymbol: 'CCX',
    openAliasPrefix: "ccx",
    coinName: 'Conceal',
    coinUriPrefix: 'conceal:',
    avgBlockTime: 120,
    maxBlockNumber: 500000000,
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
