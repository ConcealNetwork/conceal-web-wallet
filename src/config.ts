//export {};
let global : any = typeof window !== 'undefined' ? window : self;
global.config = {
	apiUrl: [
        "https://wallet.karbo.org/api/"
    ],
    nodeList: [
        "https://karbo.club/services/node_web/"
    ],
	nodeUrl: "",
	mainnetExplorerUrl: "http://explorer.karbowanec.com/",
	mainnetExplorerUrlHash: "http://explorer.karbowanec.com/?hash={ID}#blockchain_transaction",
	mainnetExplorerUrlBlock: "http://explorer.karbowanec.com/?hash={ID}#blockchain_block",
	testnetExplorerUrl: "http://testnet.karbo.org/",
	testnetExplorerUrlHash: "http://testnet.karbo.org/?hash={ID}#blockchain_transaction",
	testnetExplorerUrlBlock: "http://testnet.karbo.org/?hash={ID}#blockchain_block",
	testnet: false,
    coinUnitPlaces: 12,
    coinDisplayUnitPlaces: 2,
	txMinConfirms: 10,
	txCoinbaseMinConfirms: 10,
	addressPrefix: 111,
	integratedAddressPrefix: 112,
	addressPrefixTestnet: 111,
	integratedAddressPrefixTestnet: 112,
	subAddressPrefix: 113,
	subAddressPrefixTestnet: 113,
	coinFee: new JSBigInt('10000000000'),
	feePerKB: new JSBigInt('10000000000'), //for testnet its not used, as fee is dynamic.
	dustThreshold: new JSBigInt('100000000'),//used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	defaultMixin: 0, // default value mixin

	idleTimeout: 30,
	idleWarningDuration: 20,
	syncBlockCount: 50,

	coinSymbol: 'KRB',
	openAliasPrefix: "krb",
	coinName: 'Karbo',
	coinUriPrefix: 'karbowanec:',
	avgBlockTime: 240,
	maxBlockNumber: 500000000,
};
let randInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
config.nodeUrl = config.nodeList[randInt];
