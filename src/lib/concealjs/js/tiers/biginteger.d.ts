/**
 * Minimal typings for the vendored JSBigInt (silentmatt biginteger 0.9.1).
 * Upstream `conceal-lib-js` ships an incomplete stub; this keeps `cnutils` resolvable.
 */
export declare class JSBigInt {
  constructor(n?: number | string, s?: number | string, token?: unknown);
  add(n: number | string | JSBigInt): JSBigInt;
  subtract(n: number | string | JSBigInt): JSBigInt;
  multiply(n: number | string | JSBigInt): JSBigInt;
  divide(n: number | string | JSBigInt): JSBigInt;
  remainder(n: number | string | JSBigInt): JSBigInt;
  compare(n: number | string | JSBigInt): number;
  equals(n: number | string | JSBigInt): boolean;
  toString(base?: number): string;
  toJSValue(): number;
}
