declare var config : {
  debug: boolean,
	apiUrl:string[],
	nodeList: string[],
	nodeUrl: string,
	mainnetExplorerUrl: string,
	mainnetExplorerUrlHash: string,
	mainnetExplorerUrlBlock: string,
	testnetExplorerUrl: string,
	testnetExplorerUrlHash: string,
	testnetExplorerUrlBlock: string,
	testnet: boolean,
	coinUnitPlaces: number,
  optimizeOutputs: number,
  optimizeThreshold: number,
	txMinConfirms: number,         // corresponds to CRYPTONOTE_DEFAULT_TX_SPENDABLE_AGE in Monero
	txCoinbaseMinConfirms: number, // corresponds to CRYPTONOTE_MINED_MONEY_UNLOCK_WINDOW in Monero
	coinSymbol: string,
	openAliasPrefix: string,
	coinName: string,
	coinUriPrefix: string,
	addressPrefix: number,
	integratedAddressPrefix: number,
	addressPrefixTestnet: number,
	integratedAddressPrefixTestnet: number,
	subAddressPrefix: number,
	subAddressPrefixTestnet: number,
	feePerKB: any,
	dustThreshold: any,
	defaultMixin: number, // default mixin
	txChargeAddress: string,
	idleTimeout: number,
	idleWarningDuration: number,
	syncBlockCount: number,
  maxRemoteNodes: number
	maxBlockNumber: number,
	avgBlockTime: number
};