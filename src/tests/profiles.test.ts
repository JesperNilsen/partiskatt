import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { computeScenario, sanitizeProfile } from '../engine/index.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import type { ScenarioResult } from '../types/index.ts';
import { FIXTURES } from './fixtures.ts';

const rs = resolveBaseline(ADOPTED_2026);

function amount(s: ScenarioResult, id: string): number {
  const c = s.components.find((x) => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c.amount;
}

/**
 * Hand-computed against the adopted 2026 rule set (see data/baseline/2026/adopted.ts).
 * These numbers are arithmetic checks of the engine, not Skatteetaten-confirmed tax facts
 * (operator gate 3). All baseline rules are status `estimated` until Jesper cross-checks.
 */
describe('fixture profiles under adopted 2026', () => {
  it('median single, 600 000 in wages, 6 000 union fee', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.medianSingle!), rs, rs);
    expect(amount(s, 'income.generalRate#0')).toBe(84_427);
    expect(amount(s, 'income.bracketTax#0')).toBe(12_835);
    expect(amount(s, 'income.socialSecurity#0')).toBe(45_600);
    expect(amount(s, 'vat.food')).toBe(6_522);
    expect(amount(s, 'vat.general')).toBe(24_000);
    expect(amount(s, 'vat.transportServices')).toBe(1_071);
    // L1: the vat.electricity/vat.fuel base excludes the reference excise already carrying
    // its own VAT-on-duty line (excise.kwh/excise.petrolLitre below), re-derived by hand:
    // electricity: netOfGross(15_000, 25 %) = 15_000 * 10_000 / 12_500 = 12_000
    //   refExcise = round(12_000 kWh * 0.0713 kr/kWh) = round(855.6) = 856
    //   base = max0(12_000 - 856) = 11_144; vat = round(11_144 * 0.25) = round(2_786) = 2_786
    // fuel: netOfGross(12_000, 25 %) = 12_000 * 10_000 / 12_500 = 9_600
    //   refExcise = round(600 l * 7.57 kr/l) = round(4_542) = 4_542
    //   base = max0(9_600 - 4_542) = 5_058; vat = round(5_058 * 0.25) = round(1_264.5) = 1_265
    expect(amount(s, 'vat.electricity')).toBe(2_786);
    expect(amount(s, 'vat.fuel')).toBe(1_265);
    expect(amount(s, 'excise.petrolLitre')).toBe(5_678);
    expect(amount(s, 'excise.kwh')).toBe(1_070);
    expect(amount(s, 'employer.contribution#0')).toBe(84_600);
    expect(amount(s, 'benefit.childBenefit')).toBe(0);
    expect(amount(s, 'wealth.netWealthTax')).toBe(0);
    expect(s.net).toBe(-(84_427 + 12_835 + 45_600 + 6_522 + 24_000 + 1_071 + 2_786 + 1_265 + 5_678 + 1_070));
  });

  it('student, 150 000 in wages, ten months of support', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.student!), rs, rs);
    expect(amount(s, 'income.generalRate#0')).toBe(0);
    expect(amount(s, 'income.bracketTax#0')).toBe(0);
    expect(amount(s, 'income.socialSecurity#0')).toBe(11_400);
    expect(amount(s, 'benefit.studentSupport#0')).toBe(61_952);
  });

  it('two earners, two kids, a mortgaged home', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.twoEarnersTwoKids!), rs, rs);
    expect(amount(s, 'benefit.childBenefit')).toBe(48_288);
    expect(amount(s, 'wealth.netWealthTax')).toBe(0);
    expect(s.components.filter((c) => c.formulaId === 'income.generalRate')).toHaveLength(2);
    expect(amount(s, 'income.bracketTax#0')).toBe(16_835);
  });

  it('single parent gets the extended child benefit', () => {
    const p = sanitizeProfile({ ...FIXTURES.medianSingle!, childrenAges: [4] });
    const s = computeScenario(p, rs, rs);
    expect(amount(s, 'benefit.childBenefit')).toBe(12 * (2_012 + 2_572));
  });

  it('homeowner with wealth: valuation, high-value step and debt reduction on shares', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.homeownerWithWealth!), rs, rs);
    const c = s.components.find((x) => x.id === 'wealth.netWealthTax')!;
    expect(c.inputs.primaerboligSkattepliktig).toBe(3_000_000);
    expect(c.inputs.aksjerSkattepliktig).toBe(1_600_000);
    expect(c.inputs.gjeldsreduksjon).toBe(114_286);
    expect(c.inputs.nettoformue).toBe(3_214_286);
    expect(c.amount).toBe(13_143);
    expect(amount(s, 'income.generalRate#0')).toBe(114_347);
  });

  it('high earner: fourth bracket, VAT-free flight duties, no extra employer contribution', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.highEarner!), rs, rs);
    expect(amount(s, 'income.bracketTax#0')).toBe(140_450);
    expect(amount(s, 'excise.flightEurope')).toBe(732);
    expect(amount(s, 'excise.flightOther')).toBe(1_400);
    expect(amount(s, 'excise.wineLitre')).toBe(4_869);
    expect(amount(s, 'employer.contribution#0')).toBe(211_500);
    expect(amount(s, 'wealth.netWealthTax')).toBe(15_000);
  });
});
