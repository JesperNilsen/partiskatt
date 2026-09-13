import type { Bp, Kroner, RatePerUnit } from '../types/money.ts';

export const ZERO = 0 as Kroner;

function assertSafeInt(n: number, what: string): void {
  if (!Number.isSafeInteger(n)) throw new RangeError(`${what} må være et heltall, fikk ${String(n)}`);
}

/** Construct kroner from an integer literal or an already-rounded value. */
export function kr(n: number): Kroner {
  assertSafeInt(n, 'kroner');
  return n as Kroner;
}

export function bp(n: number): Bp {
  assertSafeInt(n, 'basispunkter');
  return n as Bp;
}

/** Percent with up to two decimals → basis points (22 → 2200, 7.7 → 770). */
export function pct(p: number): Bp {
  return bp(roundHalfAway(p * 100));
}

export function rate(n: number): RatePerUnit {
  assertSafeInt(n, 'sats per enhet');
  return n as RatePerUnit;
}

/** Kroner per unit with up to four decimals → RatePerUnit (3.53 kr/l → 35300; 0.1669 kr/kWh → 1669). */
export function krPerUnit(k: number): RatePerUnit {
  return rate(roundHalfAway(k * 10_000));
}

/** The single rounding rule: half away from zero. */
export function roundHalfAway(x: number): number {
  if (!Number.isFinite(x)) throw new RangeError(`kan ikke avrunde ${String(x)}`);
  const r = Math.floor(Math.abs(x) + 0.5);
  return x < 0 ? -r : r;
}

export function toKroner(x: number): Kroner {
  return roundHalfAway(x) as Kroner;
}

export function add(a: Kroner, b: Kroner): Kroner {
  return (a + b) as Kroner;
}

export function sub(a: Kroner, b: Kroner): Kroner {
  return (a - b) as Kroner;
}

export function neg(a: Kroner): Kroner {
  return (a === 0 ? 0 : -a) as Kroner;
}

export function sum(xs: Iterable<Kroner>): Kroner {
  let s = 0;
  for (const x of xs) s += x;
  return s as Kroner;
}

export function max0(a: Kroner): Kroner {
  return (a > 0 ? a : 0) as Kroner;
}

export function minK(a: Kroner, b: Kroner): Kroner {
  return (a < b ? a : b) as Kroner;
}

export function maxK(a: Kroner, b: Kroner): Kroner {
  return (a > b ? a : b) as Kroner;
}

/** amount × rate, rounded once. */
export function mulBp(amount: Kroner, rate: Bp): Kroner {
  return toKroner((amount * rate) / 10_000);
}

/** Tax share embedded in a gross (incl.-tax) amount: gross × r / (1 + r). */
export function shareOfGross(gross: Kroner, rate: Bp): Kroner {
  return toKroner((gross * rate) / (10_000 + rate));
}

/** Net-of-tax base of a gross amount: gross / (1 + r). */
export function netOfGross(gross: Kroner, rate: Bp): Kroner {
  return toKroner((gross * 10_000) / (10_000 + rate));
}

/** units × rate/unit → kroner, rounded once. */
export function unitsTimesRate(units: number, r: RatePerUnit): Kroner {
  if (!Number.isFinite(units) || units < 0) throw new RangeError(`ugyldig mengde ${String(units)}`);
  return toKroner((units * r) / 10_000);
}

/** Non-negative monthly figure from an annual one (presentation only). */
export function perMonth(annual: Kroner): Kroner {
  return toKroner(annual / 12);
}

/**
 * Coerce untrusted UI input to non-negative whole kroner.
 * NaN, negatives, strings and absurd values never reach the engine.
 */
export function sanitizeKroner(input: unknown, fallback = 0, cap = 1_000_000_000_000): Kroner {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n) || n < 0) return kr(fallback);
  return toKroner(Math.min(n, cap));
}

export function sanitizeUnits(input: unknown, fallback = 0, cap = 10_000_000): number {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.min(n, cap);
}
