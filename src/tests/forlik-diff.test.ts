import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, ADOPTED_2026_ENCODED } from '../data/baseline/2026/adopted.ts';
import { deriveGate3 } from '../data/gate3.ts';
import { GATE3_RESULTS } from '../data/gate3-results.ts';
import { FORLIK_2026, NON_FORLIK_BASELINE_DIFFS, forlikModeledFormulaIds } from '../data/baseline/2026/forlik.ts';
import { PROPOSED_2026 } from '../data/baseline/2026/proposed.ts';
import { FORMULA_IDS } from '../engine/formulas.ts';
import { kr, krPerUnit, pct } from '../engine/money.ts';
import type { AnyRule, FormulaId, FormulaParams } from '../types/index.ts';

function ruleOf(set: { rules: readonly AnyRule[] }, id: FormulaId): AnyRule {
  const r = set.rules.find((x) => x.id === id);
  if (!r) throw new Error(`missing rule ${id}`);
  return r;
}

function ruleParams<F extends FormulaId>(set: { rules: readonly AnyRule[] }, id: F): FormulaParams[F] {
  return ruleOf(set, id).params as FormulaParams[F];
}

describe('forlik 2026 — 15 endrede regler', () => {
  it('lists exactly 15 forlik changes with ordinals 1–15', () => {
    expect(FORLIK_2026.changes).toHaveLength(15);
    expect(FORLIK_2026.changes.map((c) => c.ordinal)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it('marks 8 rules as not modeled in the MVP engine', () => {
    const unmodeled = FORLIK_2026.changes.filter((c) => !c.modeled);
    expect(unmodeled).toHaveLength(8);
    expect(unmodeled.every((c) => c.formulaId === undefined)).toBe(true);
  });

  it('maps 7 forlik param changes onto 6 formula ids', () => {
    expect(FORLIK_2026.changes.filter((c) => c.modeled)).toHaveLength(7);
    expect(forlikModeledFormulaIds()).toEqual([
      'income.bracketTax',
      'income.personalAllowance',
      'excise.petrolLitre',
      'excise.dieselLitre',
      'excise.kwh',
      'benefit.childBenefit',
    ]);
  });
});

describe('proposed vs adopted — forlik diff', () => {
  const modeledIds = new Set(forlikModeledFormulaIds());
  const nonForlikIds = new Set(NON_FORLIK_BASELINE_DIFFS.map((d) => d.formulaId));

  it('each modeled forlik change: adopted params differ from proposed', () => {
    for (const id of modeledIds) {
      expect(ruleOf(ADOPTED_2026, id).params).not.toEqual(ruleOf(PROPOSED_2026, id).params);
    }
  });

  it('all other formulas: adopted equals proposed (except documented non-forlik diffs)', () => {
    for (const id of FORMULA_IDS) {
      if (modeledIds.has(id) || nonForlikIds.has(id)) continue;
      expect(ruleOf(ADOPTED_2026, id).params).toEqual(ruleOf(PROPOSED_2026, id).params);
    }
  });

  it('non-forlik baseline diffs are exactly wealth.valuation and income.pensionTaxCredit today', () => {
    expect(NON_FORLIK_BASELINE_DIFFS.map((d) => d.formulaId)).toEqual(['wealth.valuation', 'income.pensionTaxCredit']);
    for (const { formulaId } of NON_FORLIK_BASELINE_DIFFS) {
      expect(ruleOf(ADOPTED_2026, formulaId).params).not.toEqual(ruleOf(PROPOSED_2026, formulaId).params);
    }
  });

  it('pension tax credit: Prop. 1 LS / desembervedtak → juni 2026 (39 100 kr, 19,1 pst over trinn 1)', () => {
    expect(ruleParams(PROPOSED_2026, 'income.pensionTaxCredit')).toEqual({
      max: kr(37_100),
      threshold1: kr(284_950),
      rate1Bp: pct(16.7),
      threshold2: kr(436_050),
      rate2Bp: pct(6),
    });
    expect(ruleParams(ADOPTED_2026, 'income.pensionTaxCredit')).toEqual({
      max: kr(39_100),
      threshold1: kr(294_200),
      rate1Bp: pct(19.1),
      threshold2: kr(437_100),
      rate2Bp: pct(6),
    });
  });

  it('1) trinnskatt trinn 4: 16,7 → 16,8 pst', () => {
    const adopted = ruleParams(ADOPTED_2026, 'income.bracketTax').brackets;
    const proposed = ruleParams(PROPOSED_2026, 'income.bracketTax').brackets;
    expect(proposed[3]?.rateBp).toBe(pct(16.7));
    expect(adopted[3]?.rateBp).toBe(pct(16.8));
    expect(proposed[3]?.threshold).toBe(adopted[3]?.threshold);
  });

  it('2) trinnskatt trinn 5: 17,7 → 17,8 pst', () => {
    const adopted = ruleParams(ADOPTED_2026, 'income.bracketTax').brackets;
    const proposed = ruleParams(PROPOSED_2026, 'income.bracketTax').brackets;
    expect(proposed[4]?.rateBp).toBe(pct(17.7));
    expect(adopted[4]?.rateBp).toBe(pct(17.8));
  });

  it('3) personfradrag: 114 210 → 114 540 kr', () => {
    expect(ruleParams(PROPOSED_2026, 'income.personalAllowance').amount).toBe(kr(114_210));
    expect(ruleParams(ADOPTED_2026, 'income.personalAllowance').amount).toBe(kr(114_540));
  });

  it('4) bensin (veibruk+CO2): 8,05 → 7,57 kr/l', () => {
    expect(ruleParams(PROPOSED_2026, 'excise.petrolLitre').ratePerUnit).toBe(krPerUnit(8.05));
    expect(ruleParams(ADOPTED_2026, 'excise.petrolLitre').ratePerUnit).toBe(krPerUnit(7.57));
  });

  it('5) diesel (veibruk+CO2): 7,42 → 6,70 kr/l', () => {
    expect(ruleParams(PROPOSED_2026, 'excise.dieselLitre').ratePerUnit).toBe(krPerUnit(7.42));
    expect(ruleParams(ADOPTED_2026, 'excise.dieselLitre').ratePerUnit).toBe(krPerUnit(6.7));
  });

  it('11) elavgift: 4,18 → 7,13 øre/kWh', () => {
    expect(ruleParams(PROPOSED_2026, 'excise.kwh').ratePerUnit).toBe(krPerUnit(0.0418));
    expect(ruleParams(ADOPTED_2026, 'excise.kwh').ratePerUnit).toBe(krPerUnit(0.0713));
  });

  it('13) barnetrygd: proposed nominell 1 968 → adopted 2 012 kr/mnd', () => {
    const prop = ruleParams(PROPOSED_2026, 'benefit.childBenefit');
    const ad = ruleParams(ADOPTED_2026, 'benefit.childBenefit');
    expect(prop.under6PerMonth).toBe(kr(1_968));
    expect(prop.from6PerMonth).toBe(kr(1_968));
    expect(ad.under6PerMonth).toBe(kr(2_012));
    expect(ad.from6PerMonth).toBe(kr(2_012));
  });

  it('no baseline rule is confirmed except via operator gate 3', () => {
    // Encoded rules are never confirmed by hand; the adopted set's statuses are exactly what
    // gate 3 derives from src/data/gate3-results.ts (empty today → all estimated).
    for (const r of [...PROPOSED_2026.rules, ...ADOPTED_2026_ENCODED.rules]) {
      expect(r.status).toBe('estimated');
    }
    const derived = new Map(deriveGate3(ADOPTED_2026_ENCODED, GATE3_RESULTS).map((v) => [v.id, v.status]));
    for (const r of ADOPTED_2026.rules) {
      expect(r.status).toBe(derived.get(r.id));
    }
  });
});
