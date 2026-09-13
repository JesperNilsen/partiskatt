declare const kronerBrand: unique symbol;
declare const bpBrand: unique symbol;
declare const rateBrand: unique symbol;

/** Whole Norwegian kroner, always a safe integer. Construct only via engine/money.ts. */
export type Kroner = number & { readonly [kronerBrand]: true };
/** Basis points: 1 % = 100 bp. Integer. */
export type Bp = number & { readonly [bpBrand]: true };
/**
 * Duty per unit of a good (litre, kWh, passenger, gram …) in ten-thousandths of a
 * krone (0.1669 kr/kWh → 1669). Integer. Fine enough for every quoted Norwegian rate.
 */
export type RatePerUnit = number & { readonly [rateBrand]: true };
