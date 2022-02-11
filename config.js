"use strict";
//export {};
var global = typeof window !== 'undefined' ? window : self;
global.config = {
    apiUrl: [
        "https://ccxapi.conceal.network/api/"
    ],
    nodeList: [
        "https://ccxapi.conceal.network/daemon/"
    ],
    nodeUrl: "",
    mainnetExplorerUrl: "https://explorer.conceal.network/",
    mainnetExplorerUrlHash: "https://explorer.conceal.network/index.html?hash={ID}#blockchain_transaction",
    mainnetExplorerUrlBlock: "https://explorer.conceal.network/index.html?hash={ID}#blockchain_block",
    testnetExplorerUrl: "http://explorer.testnet.conceal.network/",
    testnetExplorerUrlHash: "https://explorer.testnet.conceal.network/index.html?hash={ID}#blockchain_transaction",
    testnetExplorerUrlBlock: "https://explorer.testnet.conceal.network/index.html?hash={ID}#blockchain_block",
    testnet: false,
    coinUnitPlaces: 6,
    coinDisplayUnitPlaces: 6,
    txMinConfirms: 10,
    txCoinbaseMinConfirms: 10,
    addressPrefix: 31444,
    integratedAddressPrefix: 31445,
    subAddressPrefix: 31446,
    addressPrefixTestnet: 31444,
    integratedAddressPrefixTestnet: 31445,
    subAddressPrefixTestnet: 31446,
    coinFee: new JSBigInt('1000'),
    feePerKB: new JSBigInt('1000'),
    dustThreshold: new JSBigInt('10'),
    defaultMixin: 5,
    idleTimeout: 30,
    idleWarningDuration: 20,
    syncBlockCount: 50,
    coinSymbol: 'CCX',
    openAliasPrefix: "ccx",
    coinName: 'Conceal',
    coinUriPrefix: 'conceal:',
    avgBlockTime: 120,
    maxBlockNumber: 500000000,
};
var randInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
config.nodeUrl = config.nodeList[randInt];
