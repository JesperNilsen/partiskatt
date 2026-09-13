import { describe, expect, it } from 'vitest';
import { computeScenario, sanitizeProfile } from '../engine/index.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import type { ScenarioResult } from '../types/index.ts';
import { FIXTURES } from './fixtures.ts';
import { SYNTHETIC } from './synthetic-rules.ts';

const rs = resolveBaseline(SYNTHETIC);

function amount(s: ScenarioResult, id: string): number {
  const c = s.components.find((x) => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c.amount;
}

/**
 * Hand-computed against the synthetic rule set (see synthetic-rules.ts). These numbers are
 * arithmetic checks of the engine, not tax facts; the adopted-system fixtures are compared
 * with Skatteetaten's calculator separately (operator gate 3).
 */
describe('fixture profiles under the synthetic rule set', () => {
  it('median single, 600 000 in wages, 6 000 union fee', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.medianSingle!), rs, rs);
    // minstefradrag 46 % → capped at 92 000; alminnelig 600 000 − 92 000 − 6 000 = 502 000;
    // − personfradrag 100 000 = 402 000 × 22 % = 88 440
    expect(amount(s, 'income.generalRate#0')).toBe(88_440);
    // trinnskatt: 100 000 × 1,7 % + 300 000 × 4 % = 1 700 + 12 000
    expect(amount(s, 'income.bracketTax#0')).toBe(13_700);
    // trygdeavgift 7,7 % × 600 000 (cap 125 000 does not bind)
    expect(amount(s, 'income.socialSecurity#0')).toBe(46_200);
    // VAT: food 50 000 × 15/115 = 6 522; general 120 000 × 25/125 = 24 000; transport 10 000 × 12/112 = 1 071;
    // electricity 15 000 × 0,2 = 3 000; fuel 12 000 × 0,2 = 2 400
    expect(amount(s, 'vat.food')).toBe(6_522);
    expect(amount(s, 'vat.general')).toBe(24_000);
    expect(amount(s, 'vat.transportServices')).toBe(1_071);
    expect(amount(s, 'vat.electricity')).toBe(3_000);
    expect(amount(s, 'vat.fuel')).toBe(2_400);
    // petrol 600 l × 5,50 = 3 300 + 25 % VAT = 4 125; power 12 000 kWh × 0,1669 = 2 002,8 → 2 003 + 25 % = 2 504
    expect(amount(s, 'excise.petrolLitre')).toBe(4_125);
    expect(amount(s, 'excise.kwh')).toBe(2_504);
    // employer 14,1 % × 600 000
    expect(amount(s, 'employer.contribution#0')).toBe(84_600);
    expect(amount(s, 'benefit.childBenefit')).toBe(0);
    expect(amount(s, 'wealth.netWealthTax')).toBe(0);
    expect(s.net).toBe(-(88_440 + 13_700 + 46_200 + 6_522 + 24_000 + 1_071 + 3_000 + 2_400 + 4_125 + 2_504));
  });

  it('student, 150 000 in wages, ten months of support', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.student!), rs, rs);
    // minstefradrag 69 000; alminnelig 81 000 < personfradrag → 0
    expect(amount(s, 'income.generalRate#0')).toBe(0);
    expect(amount(s, 'income.bracketTax#0')).toBe(0);
    // 7,7 % × 150 000 = 11 550 < cap 25 % × 50 000 = 12 500
    expect(amount(s, 'income.socialSecurity#0')).toBe(11_550);
    // 10 × 14 000 = 140 000 × 40 % grant share
    expect(amount(s, 'benefit.studentSupport#0')).toBe(56_000);
  });

  it('two earners, two kids, a mortgaged home', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.twoEarnersTwoKids!), rs, rs);
    // 12 × (2 000 + 1 800), no single-parent supplement
    expect(amount(s, 'benefit.childBenefit')).toBe(45_600);
    // home 6 000 000 × 25 % = 1 500 000 + bank 400 000 = 1 900 000; debt 4 000 000 fully deductible → net 0
    expect(amount(s, 'wealth.netWealthTax')).toBe(0);
    expect(s.components.filter((c) => c.formulaId === 'income.generalRate')).toHaveLength(2);
    // 700 000 wage: trinn 1 1 700 + trinn 2 16 000 = 17 700 (trinn 3 starts at 700 000, base 0)
    expect(amount(s, 'income.bracketTax#0')).toBe(17_700);
  });

  it('single parent gets the extended child benefit', () => {
    const p = sanitizeProfile({ ...FIXTURES.medianSingle!, childrenAges: [4] });
    const s = computeScenario(p, rs, rs);
    expect(amount(s, 'benefit.childBenefit')).toBe(12 * (2_000 + 1_800));
  });

  it('homeowner with wealth: valuation, high-value step and debt reduction on shares', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.homeownerWithWealth!), rs, rs);
    const c = s.components.find((x) => x.id === 'wealth.netWealthTax')!;
    // 10 000 000 × 25 % + 2 000 000 × 70 % = 3 900 000
    expect(c.inputs.primaerboligSkattepliktig).toBe(3_900_000);
    expect(c.inputs.aksjerSkattepliktig).toBe(1_600_000);
    // gross 17 500 000; debt share on shares 5 000 000 × 2/17,5 = 571 429, reduced by 20 % → 114 286
    expect(c.inputs.gjeldsreduksjon).toBe(114_286);
    // taxable 3 900 000 + 3 000 000 + 1 600 000 + 500 000 = 9 000 000 − (5 000 000 − 114 286) = 4 114 286
    expect(c.inputs.nettoformue).toBe(4_114_286);
    // (4 114 286 − 1 760 000) × 1 % = 23 543
    expect(c.amount).toBe(23_543);
    // interest 120 000 reduces alminnelig inntekt: 850 000 − 92 000 − 120 000 − 100 000 = 538 000 × 22 %
    expect(amount(s, 'income.generalRate#0')).toBe(118_360);
  });

  it('high earner: fourth bracket, VAT-free flight duties, extra employer contribution', () => {
    const s = computeScenario(sanitizeProfile(FIXTURES.highEarner!), rs, rs);
    // trinn: 100 000 × 1,7 % + 400 000 × 4 % + 300 000 × 13,7 % + 500 000 × 16,7 % = 1 700 + 16 000 + 41 100 + 83 500
    expect(amount(s, 'income.bracketTax#0')).toBe(142_300);
    expect(amount(s, 'excise.flightEurope')).toBe(1_200);
    expect(amount(s, 'excise.flightOther')).toBe(1_200);
    // 60 l × 60 = 3 600 + 25 % VAT
    expect(amount(s, 'excise.wineLitre')).toBe(4_500);
    // 14,1 % × 1 500 000 + 5 % × 650 000 = 211 500 + 32 500
    expect(amount(s, 'employer.contribution#0')).toBe(244_000);
  });
});
