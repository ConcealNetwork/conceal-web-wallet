//export {};
let myGlobal : any = typeof window !== 'undefined' ? window : self;
myGlobal.config = {
  debug: false,
	apiUrl: [
        "https://ccxapi.conceal.network/api/"
    ],
    nodeList: [
        "https://seed1.conceal.network/daemon/",
        "https://seed2.conceal.network/daemon/",
        "https://seed3.conceal.network/daemon/"
    ],
	nodeUrl: "",
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
	feePerKB: new JSBigInt('1000'), //for testnet its not used, as fee is dynamic.
	dustThreshold: new JSBigInt('10'),//used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	defaultMixin: 5, // default value mixin
  optimizeOutputs: 10, // how many outputs we put into a fusion tx

	idleTimeout: 30,
	idleWarningDuration: 20,
	syncBlockCount: 1000,

	coinSymbol: 'CCX',
	openAliasPrefix: "ccx",
	coinName: 'Conceal',
	coinUriPrefix: 'conceal:',

	avgBlockTime: 120,
	maxBlockNumber: 500000000,
};
let randInt = Math.floor(Math.random() * Math.floor(config.nodeList.length));
config.nodeUrl = config.nodeList[randInt];


function logDebugMsg(...data: any[]) {
  if (config.debug) {
    if (data.length > 1) {
      console.log(data[0], data.slice(1));
    } else {
      console.log(data[0]);
    }
  }
}

// log debug messages if debug is set to true
myGlobal.logDebugMsg = logDebugMsg;
