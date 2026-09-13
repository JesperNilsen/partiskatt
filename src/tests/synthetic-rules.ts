import { kr, krPerUnit, pct } from '../engine/money.ts';
import type { BaselineRuleSet, FormulaId, FormulaParams, PartyRuleSet, Provenance, Rule } from '../types/index.ts';

export const SYNTHETIC_PROVENANCE: Provenance = {
  sourceId: 'synthetic',
  sourceUrl: 'about:blank',
  pageOrTable: 'n/a',
  anchor: 'syntetisk regelsett for tester',
  method: 'Runde tall valgt for å gjøre forventede verdier regnbare for hånd.',
  confidence: 'high',
  lastChecked: '2026-09-13',
  effectiveDate: '2026-01-01',
};

export function rule<F extends FormulaId>(
  id: F,
  params: FormulaParams[F],
  overrides: Partial<Omit<Rule<F>, 'id' | 'params'>> = {},
): Rule<F> {
  return {
    id,
    params,
    status: 'confirmed',
    uncertain: false,
    label: id,
    provenance: SYNTHETIC_PROVENANCE,
    ...overrides,
  };
}

/** Round-number rule set; the hand-computed expectations in profiles.test.ts depend on these values. */
export const SYNTHETIC: BaselineRuleSet = {
  id: 'adopted',
  year: 2026,
  rules: [
    rule('income.generalRate', { rateBp: pct(22) }),
    rule('income.bracketTax', {
      brackets: [
        { threshold: kr(200_000), rateBp: pct(1.7) },
        { threshold: kr(300_000), rateBp: pct(4) },
        { threshold: kr(700_000), rateBp: pct(13.7) },
        { threshold: kr(1_000_000), rateBp: pct(16.7) },
        { threshold: kr(1_500_000), rateBp: pct(17.7) },
      ],
    }),
    rule('income.socialSecurity', {
      wageRateBp: pct(7.7),
      pensionRateBp: pct(5.1),
      lowerThreshold: kr(100_000),
      phaseInRateBp: pct(25),
    }),
    rule('income.personalAllowance', { amount: kr(100_000) }),
    rule('income.minimumDeductionWage', { rateBp: pct(46), max: kr(92_000), min: kr(4_000) }),
    rule('income.minimumDeductionPension', { rateBp: pct(40), max: kr(73_000), min: kr(4_000) }),
    rule('income.unionFeeDeduction', { max: kr(8_000) }),
    rule('wealth.netWealthTax', {
      single: { allowance: kr(1_760_000), tier2Threshold: kr(20_700_000) },
      couple: { allowance: kr(3_520_000), tier2Threshold: kr(41_400_000) },
      tier1RateBp: pct(1),
      tier2RateBp: pct(1.1),
    }),
    rule('wealth.valuation', {
      primaryHomeBp: pct(25),
      primaryHomeHighValueThreshold: kr(10_000_000),
      primaryHomeHighValueBp: pct(70),
      secondaryHomeBp: pct(100),
      listedSharesBp: pct(80),
      bankDepositsBp: pct(100),
      otherBp: pct(100),
      debtReductionApplies: { secondaryHome: false, listedShares: true, other: false },
    }),
    rule('vat.food', { rateBp: pct(15) }),
    rule('vat.general', { rateBp: pct(25) }),
    rule('vat.transportServices', { rateBp: pct(12) }),
    rule('vat.electricity', { rateBp: pct(25) }),
    rule('vat.fuel', { rateBp: pct(25) }),
    rule('vat.alcoholTobacco', { rateBp: pct(25) }),
    rule('vat.flights', { rateBp: pct(12) }),
    rule('excise.petrolLitre', { ratePerUnit: krPerUnit(5.5) }),
    rule('excise.dieselLitre', { ratePerUnit: krPerUnit(4.5) }),
    rule('excise.kwh', { ratePerUnit: krPerUnit(0.1669) }),
    rule('excise.flightEurope', { ratePerUnit: krPerUnit(100) }),
    rule('excise.flightOther', { ratePerUnit: krPerUnit(300) }),
    rule('excise.beerLitre', { ratePerUnit: krPerUnit(30) }),
    rule('excise.wineLitre', { ratePerUnit: krPerUnit(60) }),
    rule('excise.spiritsLitre', { ratePerUnit: krPerUnit(300) }),
    rule('excise.cigarette', { ratePerUnit: krPerUnit(3) }),
    rule('excise.snusGram', { ratePerUnit: krPerUnit(1) }),
    rule('benefit.childBenefit', {
      under6PerMonth: kr(2_000),
      from6PerMonth: kr(1_800),
      ageCutoff: 6,
      extendedSingleParentPerMonth: kr(1_800),
    }),
    rule('benefit.studentSupport', { basicSupportPerMonth: kr(14_000), grantShareBp: pct(40) }),
    rule('employer.contribution', { rateBp: pct(14.1), extraRateBp: pct(5), extraThreshold: kr(850_000) }),
  ],
};

export const SYNTHETIC_PROPOSED: BaselineRuleSet = { ...SYNTHETIC, id: 'proposed' };

/** Ap has no alternative budget: zero deltas by construction. */
export const AP_EMPTY: PartyRuleSet = {
  id: 'ap',
  year: 2026,
  base: 'proposed',
  deltas: [],
  reviewed: {},
  unquantified: [],
};
