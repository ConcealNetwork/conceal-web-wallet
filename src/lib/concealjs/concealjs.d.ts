type ConcealJsGlobal = {
  crypto: typeof import("./wasm/crypto/crypto");
  cypher: typeof import("./wasm/cypher/cypher");
  mnemonic: typeof import("./js/mnemonic");
  cnutils: typeof import("./js/cnutils");
  random: typeof import("./js/random");
  cn: typeof import("./js/cn");
  transactions: typeof import("./js/transactions");
  sha3_384: typeof import("./js/tiers/sha3").sha3_384;
};

declare global {
  const concealjs: ConcealJsGlobal;

  interface Window {
    concealjs: ConcealJsGlobal;
  }
}

export {};
