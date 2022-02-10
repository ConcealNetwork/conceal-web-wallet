//export {};
let global : any = typeof window !== 'undefined' ? window : self;
global.config = {
	apiUrl: [
        "https://ccxapi.conceal.network/api"
    ],
    nodeList: [
        "https://ccxapi.conceal.network/nodes"
    ],
	nodeUrl: "https://ccxapi.conceal.network/daemon",
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
	integratedAddressPrefix: 31444,
	addressPrefixTestnet: 31444,
	integratedAddressPrefixTestnet: 31444,
	subAddressPrefix: 31444,
	subAddressPrefixTestnet: 31444,
	coinFee: new JSBigInt('1000'),
	feePerKB: new JSBigInt('1000'), //for testnet its not used, as fee is dynamic.
	dustThreshold: new JSBigInt('10'),//used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	defaultMixin: 0, // default value mixin

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
let randInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
config.nodeUrl = config.nodeList[randInt];
