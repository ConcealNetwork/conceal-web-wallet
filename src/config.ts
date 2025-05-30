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

	coinFee: new JSBigInt('1000'),
	feePerKB: new JSBigInt('1000'), //for testnet its not used, as fee is dynamic.
	dustThreshold: new JSBigInt('10'),//used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	defaultMixin: 5, // default value mixin
  optimizeOutputs: 50, // how many outputs we put into a fusion tx, 100 to be like C++ but too big to handle
  optimizeThreshold: new JSBigInt('10'), // is the optimization threshold matching C++ defaultDustThreshold
  messageTxAmount: new JSBigInt('1000'), // the amount sent to the receiver of the message needed so we have at least one output for them
  maxMessageSize: 260, // maximum lenght of the message

	idleTimeout: 30,
	idleWarningDuration: 20,
	syncBlockCount: 300, // how many block we sync at once for a single remote node
	maxBlockQueue: 10, // how many watchdog blocks can be max in the queue before waiting
  maxRemoteNodes: 8, // what is the max remote nodes we use in a sync process
  maxWorkerCores: 8, // max cores that the workers can use. If lower they will use numberOfCores - 1

	coinSymbol: 'CCX',
	openAliasPrefix: "ccx",
	coinName: 'Conceal',
	coinUriPrefix: 'conceal:',

	avgBlockTime: 120,
	maxBlockNumber: 500000000,

	depositMinAmountCoin: 1,
	depositMinTermMonth: 1,
	depositMinTermBlock: 21900,
	depositMaxTermMonth: 12,
	depositSmallWithdrawFee: 10,
	depositRateV3: [0.029, 0.039, 0.049], // Define deposit rates for different tiers	
};

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
