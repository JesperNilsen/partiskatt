import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  EXCISE_COMPONENTS_2026,
  GROWTH_2027_BP,
  indexKroner,
  indexPrinted,
  type GrowthKind,
} from '../data/baseline/2027/reference.ts';
import { ADOPTED_2026, PROPOSED_2027, REFERENCE_2027, sourceOf } from '../data/index.ts';
import { anchorInText, parsePageRefs } from '../data/provenance.ts';
import { FORMULA_IDS } from '../engine/formulas.ts';
import { kr, krPerUnit, pct } from '../engine/money.ts';
import type { FormulaId } from '../types/index.ts';

/**
 * The 2027 referansesystem convention (Prop. 1 LS (2026–2027) §2.9.1 PDF p73, growth PDF p79) is
 * checked against every amount the Prop says moves «i tråd med referansen» or that it prints as the
 * reference plus a stated real change. The 2026 and 2027 numbers are anchored on their pages in the
 * archived text; the convention must reproduce each one, and plausible wrong conventions must not.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = 'prop1ls-2026-2027';
const TEXT = readFileSync(join(ROOT, sourceOf(SRC).textFile!), 'utf8');
const PAGES = (TEXT.endsWith('\f') ? TEXT.slice(0, -1) : TEXT).split('\f');
const onPage = (page: number, anchor: string) => anchorInText(anchor, PAGES[page - 1] ?? '');
const byId = (set: { rules: readonly { id: string; params: unknown }[] }, id: FormulaId) => set.rules.find((r) => r.id === id)!;

interface Convention {
  growth: Record<GrowthKind, number>;
  unit: number;
}
const PROP: Convention = { growth: { ...GROWTH_2027_BP }, unit: 50 };

/** [what, 2026 amount, factor, 2027 reference amount, page, anchor(s) proving both numbers]. */
const KRONER_CASES: ReadonlyArray<readonly [string, number, GrowthKind, number, number, readonly string[]]> = [
  ['trinn 1', 226_100, 'wage', 235_150, 26, ['226 100 kr 235 150 kr']],
  ['trinn 2', 318_300, 'wage', 331_050, 26, ['318 300 kr 331 050 kr']],
  ['trinn 3', 725_050, 'wage', 754_050, 26, ['725 050 kr 754 050 kr']],
  ['trinn 4', 980_100, 'wage', 1_019_300, 26, ['980 100 kr 1 019 300 kr']],
  ['trinn 5', 1_467_200, 'wage', 1_525_900, 26, ['1 467 200 kr 1 525 900 kr']],
  ['minstefradrag lønn, øvre grense', 95_700, 'wage', 99_550, 27, ['95 700 kr 99 550 kr']],
  ['minstefradrag pensjon, øvre grense', 75_400, 'pension', 77_950, 27, ['75 400 kr 77 950 kr']],
  ['fagforeningsfradrag (prisjustert)', 8_700, 'cpi', 8_950, 28, ['8 700 kr 8 950 kr']],
  ['skattefri nettoinntekt, enslig', 163_750, 'wage', 170_300, 28, ['163 750 kr 170 300 kr']],
  ['skattefri nettoinntekt, gift', 151_350, 'wage', 157_400, 28, ['151 350 kr 157 400 kr']],
  ['skattebegrensning, beløpsgrense ektepar', 302_700, 'wage', 314_800, 82, ['fra 302 700 kroner til 314 800']],
  ['arbeidsfradrag unge, maks', 125_000, 'wage', 130_000, 29, ['125 000 kr 130 000 kr']],
  ['arbeidsfradrag unge, nedtrapping', 345_000, 'wage', 358_800, 29, ['345 000 kr 358 800 kr']],
  // Printed as «reference + stated real change»: 306 250 is 2 200 «utover referansen», 457 550 is 5 800 over.
  ['pensjonsfradrag trinn 1 (306 250 − 2 200)', 294_200, 'pension', 306_250 - 2_200, 81, ['(til 306 250 kroner)', 'med 2 200 kroner utover']],
  ['pensjonsfradrag trinn 2 (457 550 − 5 800)', 437_100, 'pension', 457_550 - 5_800, 81, ['(til 457 550 kroner)', 'trinn 2 med 5 800 kroner']],
];

/** [what, 2026 printed, 2027 printed (= reference), page, anchor]: excise at Tabell 1.6 precision, KPI 2,7 pst. */
const EXCISE_CASES: ReadonlyArray<readonly [string, number, number, number, string]> = [
  ['øl 3,7–4,7 vol.pst. (kr/l, 2 des.)', 2_420, 2_485, 31, '24,20 24,85'],
  ['vin (kr per vol.pst., 2 des.)', 541, 556, 31, '5,41 5,56'],
  ['brennevin (kr per vol.pst., 2 des.)', 923, 948, 31, '9,23 9,48'],
  ['sigaretter (kr per 100 stk.)', 331, 340, 31, '331 340'],
  ['snus (kr per 100 g)', 102, 105, 31, '102 105'],
  ['elavgift (øre/kWh, 2 des.)', 713, 732, 34, '7,13 7,32'],
  ['flypassasjeravgift lav', 61, 63, 35, '61 63'],
  ['flypassasjeravgift høy', 350, 359, 35, '350 359'],
  // «redusere veibruksavgift på mineralolje med 0,50 kroner per liter etter prisjustering» (PDF p167): 1,84 + 0,50.
  ['veibruksavgift mineralolje (1,84 + 0,50)', 228, 184 + 50, 167, 'mineralolje med 0,50 kroner per liter etter pris-'],
];

function kronerMismatches(c: Convention): string[] {
  return KRONER_CASES.filter(([, from, kind, to]) => indexKroner(from, c.growth[kind], c.unit) !== to).map(
    ([what, from, kind, to]) => `${what}: ${from} → ${indexKroner(from, c.growth[kind], c.unit)} ≠ ${to}`,
  );
}

function exciseMismatches(growthBp: number): string[] {
  return EXCISE_CASES.filter(([, from, to]) => indexPrinted(from, growthBp) !== to).map(([what]) => what);
}

describe('the referansesystem convention reproduces the Prop', () => {
  it('growth factors are the ones §1.4 prints (PDF p79), CPI also on PDF p25', () => {
    expect(onPage(79, 'lønnsvekst fra 2026 til 2027 på 4,0 pst.')).toBe(true);
    expect(onPage(79, 'pensjonsvekst på 3,35 pst.')).toBe(true);
    expect(onPage(25, 'konsumprisveksten til 2,7 pst.')).toBe(true);
    expect(GROWTH_2027_BP).toEqual({ wage: 400, pension: 335, cpi: 270 });
  });

  it('every 2026 and 2027 number in the cases is printed on its page', () => {
    for (const [what, , , , page, anchors] of KRONER_CASES) for (const a of anchors) expect(onPage(page, a), `${what}: «${a}» p${page}`).toBe(true);
    for (const [what, , , page, anchor] of EXCISE_CASES) expect(onPage(page, anchor), `${what}: «${anchor}» p${page}`).toBe(true);
  });

  it('kroner amounts: × (1 + growth), nearest 50 kr, reproduce all 15', () => {
    expect(kronerMismatches(PROP)).toEqual([]);
  });

  it('excise components: × 1,027 at the printed precision reproduce all 9', () => {
    expect(exciseMismatches(GROWTH_2027_BP.cpi)).toEqual([]);
  });

  it('can fail: another rounding unit misses printed amounts', () => {
    for (const unit of [1, 10, 100, 1_000]) expect(kronerMismatches({ ...PROP, unit }).length, `unit ${unit}`).toBeGreaterThan(0);
  });

  it('can fail: swapping the factors misses printed amounts', () => {
    const wrong: Convention[] = [
      { ...PROP, growth: { ...PROP.growth, wage: GROWTH_2027_BP.pension } },
      { ...PROP, growth: { ...PROP.growth, pension: GROWTH_2027_BP.wage } },
      { ...PROP, growth: { ...PROP.growth, cpi: GROWTH_2027_BP.wage } },
      { ...PROP, growth: { ...PROP.growth, wage: 390 } },
    ];
    for (const c of wrong) expect(kronerMismatches(c).length, JSON.stringify(c.growth)).toBeGreaterThan(0);
    expect(exciseMismatches(GROWTH_2027_BP.wage).length).toBeGreaterThan(0);
  });

  it('can fail: rounding the composite engine rate instead of the printed component misses wine', () => {
    // 64,92 kr/l × 1,027 = 66,67 kr/l; the printed 5,41 → 5,56 per vol.pst. gives 66,72.
    expect(Math.round(6492 * 1.027) / 100).toBe(66.67);
    expect((indexPrinted(541, GROWTH_2027_BP.cpi) * 12) / 100).toBe(66.72);
  });
});

describe('REFERENCE_2027', () => {
  it('is a complete 2027 rule set with id «reference»', () => {
    expect(REFERENCE_2027.id).toBe('reference');
    expect(REFERENCE_2027.year).toBe(2027);
    expect(REFERENCE_2027.rules.map((r) => r.id)).toEqual([...FORMULA_IDS]);
  });

  it('the excise components compose to exactly the ADOPTED_2026 rates', () => {
    for (const [id, parts] of Object.entries(EXCISE_COMPONENTS_2026)) {
      const composed = parts.reduce((s, c) => s + c.printed * c.unit, 0);
      expect(composed, id).toBe((byId(ADOPTED_2026, id as FormulaId).params as { ratePerUnit: number }).ratePerUnit);
    }
  });

  // Hand-typed from the convention, independent of the builder.
  const EXPECTED: Partial<Record<FormulaId, unknown>> = {
    'income.bracketTax': {
      brackets: [
        { threshold: kr(235_150), rateBp: pct(1.7) },
        { threshold: kr(331_050), rateBp: pct(4) },
        { threshold: kr(754_050), rateBp: pct(13.7) },
        { threshold: kr(1_019_300), rateBp: pct(16.8) },
        { threshold: kr(1_525_900), rateBp: pct(17.8) },
      ],
    },
    'income.socialSecurity': { wageRateBp: pct(7.6), pensionRateBp: pct(5.1), lowerThreshold: kr(103_650), phaseInRateBp: pct(25) },
    'income.personalAllowance': { amount: kr(119_100) },
    'income.minimumDeductionWage': { rateBp: pct(46), max: kr(99_550), min: kr(0) },
    'income.minimumDeductionPension': { rateBp: pct(40), max: kr(77_950), min: kr(0) },
    'income.unionFeeDeduction': { max: kr(8_950) },
    'income.workTaxCredit': { amountPerWorker: kr(0) },
    'income.pensionTaxCredit': { max: kr(40_400), threshold1: kr(304_050), rate1Bp: pct(19.1), threshold2: kr(451_750), rate2Bp: pct(6) },
    'wealth.netWealthTax': {
      single: { allowance: kr(1_976_000), tier2Threshold: kr(22_360_000) },
      couple: { allowance: kr(3_952_000), tier2Threshold: kr(44_720_000) },
      tier1RateBp: pct(1),
      tier2RateBp: pct(1.1),
    },
    'excise.petrolLitre': { ratePerUnit: krPerUnit(7.77) },
    'excise.dieselLitre': { ratePerUnit: krPerUnit(6.88) },
    'excise.kwh': { ratePerUnit: krPerUnit(0.0732) },
    'excise.flightEurope': { ratePerUnit: krPerUnit(63) },
    'excise.flightOther': { ratePerUnit: krPerUnit(359) },
    'excise.beerLitre': { ratePerUnit: krPerUnit(24.85) },
    'excise.wineLitre': { ratePerUnit: krPerUnit(66.72) },
    'excise.spiritsLitre': { ratePerUnit: krPerUnit(379.2) },
    'excise.cigarette': { ratePerUnit: krPerUnit(3.4) },
    'excise.snusGram': { ratePerUnit: krPerUnit(1.05) },
  };

  it('every indexed amount is the hand-computed reference value', () => {
    for (const [id, params] of Object.entries(EXPECTED)) expect(byId(REFERENCE_2027, id as FormulaId).params, id).toEqual(params);
    const valuation = byId(REFERENCE_2027, 'wealth.valuation').params as Record<string, unknown>;
    expect(valuation).toEqual({ ...(byId(ADOPTED_2026, 'wealth.valuation').params as object), primaryHomeHighValueThreshold: kr(14_560_000) });
  });

  it('rates, benefits and the employer contribution are carried from ADOPTED_2026 unchanged', () => {
    const carried = FORMULA_IDS.filter((id) => !(id in EXPECTED) && id !== 'wealth.valuation');
    expect(carried.sort()).toEqual(
      ['benefit.childBenefit', 'benefit.studentSupport', 'employer.contribution', 'income.generalRate', ...FORMULA_IDS.filter((id) => id.startsWith('vat.'))].sort(),
    );
    for (const id of carried) expect(byId(REFERENCE_2027, id).params, id).toEqual(byId(ADOPTED_2026, id).params);
  });

  it('the proposal departs from the reference in exactly the rules the Prop calls changes', () => {
    const differ = FORMULA_IDS.filter((id) => JSON.stringify(byId(PROPOSED_2027, id).params) !== JSON.stringify(byId(REFERENCE_2027, id).params));
    // Trygdeavgift (7,6 → 7,4 pst. and the frikort limit held nominal), personfradrag (+1 080 kr real),
    // pension credit (+2 200 / +5 800 over the reference), wealth limits held nominal + bunnfradrag
    // raised, primary-home limit held nominal, and diesel (CO2 up 0,59, veibruk down 0,50 kr/l after
    // price adjustment: +0,09 kr/l on fossil diesel; the Prop's «om lag uendret» refers to the blend).
    expect(differ).toEqual([
      'income.socialSecurity',
      'income.personalAllowance',
      'income.pensionTaxCredit',
      'wealth.netWealthTax',
      'wealth.valuation',
      'excise.dieselLitre',
    ]);
  });

  it('every rule cites the Prop with an anchor on a cited page', () => {
    for (const r of REFERENCE_2027.rules) {
      expect(r.provenance.sourceId, r.id).toBe(SRC);
      const pages = parsePageRefs(r.provenance.pageOrTable);
      expect(pages, `${r.id}: ${r.provenance.pageOrTable}`).not.toBeNull();
      expect(pages!.some((p) => onPage(p, r.provenance.anchor)), `${r.id}: «${r.provenance.anchor}» not on ${r.provenance.pageOrTable}`).toBe(true);
    }
  });

  it('the two wealth rules carry the factor as a labelled assumption', () => {
    for (const id of ['wealth.netWealthTax', 'wealth.valuation'] as const) {
      const r = byId(REFERENCE_2027, id) as (typeof REFERENCE_2027.rules)[number];
      expect(r.provenance.method.startsWith('ANTAKELSE'), id).toBe(true);
      expect(r.provenance.confidence).toBe('low');
      expect(r.note).toMatch(/antakelse/);
    }
  });
});
