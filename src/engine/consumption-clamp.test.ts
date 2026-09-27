import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { PROFILE_SEEDS, consumptionFor } from '../data/consumption-profiles.ts';
import { withRuleParams } from '../data/gate3.ts';
import { FIXTURES, consumption } from '../tests/fixtures.ts';
import { SYNTHETIC } from '../tests/synthetic-rules.ts';
import type { Consumption, VatCategory } from '../types/index.ts';
import { EXCISE_GOODS, PRICE_YEARS, VAT_CATEGORIES } from '../types/index.ts';
import { computeConsumptionTaxes } from './consumption.ts';
import { VAT_ON_EXCISE } from './formulas.ts';
import { ZERO, add, netOfGross, pct, unitsTimesRate } from './money.ts';
import { resolveBaseline } from './resolve.ts';
import { paramsOf } from './rule-set.ts';

const rs = resolveBaseline(ADOPTED_2026);

/** The three VAT categories an excise good is layered on (fuel, electricity, alcoholTobacco). */
const EXCISABLE_CATS = VAT_CATEGORIES.filter(
  (c): c is Exclude<VatCategory, 'exempt'> => c !== 'exempt' && EXCISE_GOODS.some((g) => VAT_ON_EXCISE[g] === c),
);

/**
 * The unclamped margin `netOfGross(spend, refRate) - refExcise` for one category, computed
 * independently of `computeConsumptionTaxes` so this test does not just re-run the code under
 * test. A negative value here means the clamp in `consumption.ts` would have to fire.
 */
function unclampedMargin(consumption: Consumption, cat: Exclude<VatCategory, 'exempt'>): number {
  const refRateBp = paramsOf(rs, `vat.${cat}`).rateBp;
  let refExcise = ZERO;
  for (const good of EXCISE_GOODS) {
    if (VAT_ON_EXCISE[good] !== cat) continue;
    refExcise = add(refExcise, unitsTimesRate(consumption.units[good], paramsOf(rs, `excise.${good}`).ratePerUnit));
  }
  return netOfGross(consumption.spend[cat], refRateBp) - refExcise;
}

describe('L1: the max0 clamp on the VAT base does not fire on real data', () => {
  it('the three seed profiles (nøktern/typisk/høy), at 1 and at 2 adults + 2 children, in both price years', () => {
    // L7: the 2026 uplift LOWERS fuel and electricity spend (factors below 1) while the units,
    // and so the reference excise, stay put — the margin is thinnest there, so both years run.
    for (const priceYear of PRICE_YEARS) {
      for (const seed of PROFILE_SEEDS) {
        for (const [adults, children] of [
          [1, 0],
          [2, 2],
        ] as const) {
          const c = consumptionFor(seed.id, adults, children, priceYear);
          for (const cat of EXCISABLE_CATS) {
            expect(unclampedMargin(c, cat), `${priceYear} ${seed.id} ${adults}a${children}b ${cat}`).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  it('the five gate-3 fixtures in src/tests/fixtures.ts', () => {
    for (const [name, profile] of Object.entries(FIXTURES)) {
      for (const cat of EXCISABLE_CATS) {
        expect(unclampedMargin(profile.consumption, cat), `${name} ${cat}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('does fire on the e2e advanced-fields case, harmlessly', () => {
    // e2e/calculator-inputs.spec.ts sets #units-petrolLitre to 5000,5 on top of a seeded
    // profile's ordinary spend.fuel: the implied duty then dwarfs the ex-VAT spend, so the
    // margin goes negative and the engine's max0 floors the base at 0 instead of throwing.
    const c = consumptionFor('typisk', 1, 0, 2026);
    c.units.petrolLitre = 5000.5;
    expect(unclampedMargin(c, 'fuel')).toBeLessThan(0);
  });
});

describe('L1: a synthetic vat.fuel change moves the VAT line, the excise line, and the total consistently', () => {
  it('reference (spend basis) is held fixed; only the rs vat.fuel rate moves', () => {
    // Numbers hand-picked so every intermediate value is an exact integer.
    const cons = consumption({ fuel: 9_000 }, { petrolLitre: 200 });
    const reference = resolveBaseline(SYNTHETIC); // vat.fuel 25 %, excise.petrolLitre 5,5 kr/l
    const bumped = resolveBaseline(withRuleParams(SYNTHETIC, 'vat.fuel', { rateBp: pct(30) }));

    const before = computeConsumptionTaxes(cons, reference, reference);
    const after = computeConsumptionTaxes(cons, bumped, reference);

    const vatBefore = before.find((c) => c.id === 'vat.fuel')!.amount;
    const vatAfter = after.find((c) => c.id === 'vat.fuel')!.amount;
    const exciseBefore = before.find((c) => c.id === 'excise.petrolLitre')!.amount;
    const exciseAfter = after.find((c) => c.id === 'excise.petrolLitre')!.amount;
    const totalBefore = before.reduce((s, c) => s + c.amount, 0);
    const totalAfter = after.reduce((s, c) => s + c.amount, 0);

    // netOfGross(9_000, 25 %) = 9_000 * 10_000 / 12_500 = 7_200
    // refExcise = round(200 l * 5,5 kr/l) = 1_100 (reference is SYNTHETIC throughout, so this
    //   is unaffected by the vat.fuel bump on `bumped`)
    // netBase = max0(7_200 - 1_100) = 6_100
    // vat.fuel @25 % = round(6_100 * 0.25) = 1_525; @30 % = round(6_100 * 0.30) = 1_830
    expect(vatAfter - vatBefore).toBe(1_830 - 1_525);
    // The excise duty itself (1_100) does not move with a VAT-rate change; only its
    // vatOnExcise layer does: @25 % = round(1_100 * 0.25) = 275; @30 % = round(1_100 * 0.30) = 330
    expect(exciseAfter - exciseBefore).toBe(330 - 275);
    // Every other category has zero spend/units and is untouched, so the total moves by
    // netOfGross(spend, ref) * Δrate = 7_200 * 0.05 = 360, i.e. exactly (305 + 55).
    expect(totalAfter - totalBefore).toBe(360);
    expect(totalAfter - totalBefore).toBe(vatAfter - vatBefore + (exciseAfter - exciseBefore));
  });
});
