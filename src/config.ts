let global : any = typeof window !== 'undefined' ? window : self;
global.config = {
	apiUrl:typeof window !== 'undefined' && window.location ? window.location.href.substr(0,window.location.href.lastIndexOf('/')+1)+'api/' : 'https://wallet.karbo.org/api/',
	mainnetExplorerUrl: "http://explorer.karbowanec.com/",
	mainnetExplorerUrlHash: "https://explorer.karbowanec.com/transaction.html?hash={ID}",
	mainnetExplorerUrlBlock: "https://explorer.karbowanec.com/block.html?hash={ID}",
	testnetExplorerUrl: "http://testnet.karbo.org/",
	testnetExplorerUrlHash: "http://testnet.karbo.org/transaction.html?hash={ID}",
	testnetExplorerUrlBlock: "http://testnet.karbo.org/block.html?hash={ID}",
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
	coinFee: new JSBigInt('100000000000'),
	feePerKB: new JSBigInt('100000000000'), //for testnet its not used, as fee is dynamic.
	dustThreshold: new JSBigInt('100000000'),//used for choosing outputs/change - we decompose all the way down if the receiver wants now regardless of threshold
	defaultMixin: 0, // default value mixin

	idleTimeout: 30,
	idleWarningDuration: 20,

	coinSymbol: 'KRB',
	openAliasPrefix: "krb",
	coinName: 'Karbo',
	coinUriPrefix: 'karbowanec:',
	avgBlockTime: 240,
	maxBlockNumber: 500000000,
};