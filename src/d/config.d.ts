declare var config : {
  debug: boolean,
	apiUrl:string[],
	nodeList: string[],
  publicNodes: string,
	mainnetExplorerUrl: string,
	mainnetExplorerUrlHash: string,
	mainnetExplorerUrlBlock: string,
	testnetExplorerUrl: string,
	testnetExplorerUrlHash: string,
	testnetExplorerUrlBlock: string,
	testnet: boolean,
	coinUnitPlaces: number,
	//fee
	coinFee: typeof JSBigInt,
	remoteNodeFee: typeof JSBigInt,
	donationAddress: string,
	//fusion
  optimizeOutputs: number,
  optimizeThreshold: number,
  minimumFee_V2: number,
  fusionTxMinInOutCountRatio: number,
  maxFusionOutputs: number,
	//message
  messageTxAmount: any,
  maxMessageSize: number,
	txMinConfirms: number,         // corresponds to CRYPTONOTE_DEFAULT_TX_SPENDABLE_AGE in Monero
	txCoinbaseMinConfirms: number, // corresponds to CRYPTONOTE_MINED_MONEY_UNLOCK_WINDOW in Monero
	coinSymbol: string,
	coinSymbolShort: string,
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
  maxBlockQueue: number,
  maxRemoteNodes: number
  maxWorkerCores: number,
	maxBlockNumber: number,
	avgBlockTime: number,
	cryptonoteMemPoolTxLifetime: number,
	//deposit
	depositMinAmountCoin: number,
	depositMinTermMonth: number,
	depositMinTermBlock: number,
	depositMaxTermMonth: number,
	depositRateV3: number[],
	//Height references
	UPGRADE_HEIGHT_V4: number,
	//PRETTY_AMOUNTS
	PRETTY_AMOUNTS: number[],
};