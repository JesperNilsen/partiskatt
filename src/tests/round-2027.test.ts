import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, AP_2027, PROPOSED_2027, ROUND_2027_BUNDLE, sourceOf } from '../data/index.ts';
import { FORMULA_IDS } from '../engine/formulas.ts';
import { calculateParty } from '../engine/calculate-scenario.ts';
import { resolveRuleSet } from '../engine/resolve.ts';
import { anchorInText, parsePageRefs } from '../data/provenance.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { kr } from '../engine/money.ts';
import { adult, FIXTURES, profile } from './fixtures.ts';

/**
 * 2027 round, stage 1: the government's proposal (Prop. 1 LS (2026–2027)) against the 2026 budget as
 * ADOPTED. The document prints both years side by side, so the proposal's «2026» column must equal
 * ADOPTED_2026 — checked here rule by rule, in both directions.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = 'prop1ls-2026-2027';
const TEXT = readFileSync(join(ROOT, sourceOf(SRC).textFile!), 'utf8');
const PAGES = (TEXT.endsWith('\f') ? TEXT.slice(0, -1) : TEXT).split('\f');
const byId = (set: { rules: readonly { id: string }[] }, id: string) => set.rules.find((r) => r.id === id)!;

describe('PROPOSED_2027 shape', () => {
  it('is a complete 2027 rule set, one rule per formula', () => {
    expect(PROPOSED_2027.year).toBe(2027);
    expect(PROPOSED_2027.rules.map((r) => r.id)).toEqual([...FORMULA_IDS]);
  });

  it('every rule it changes moves from exactly the adopted 2026 value; every other rule equals adopted', () => {
    let changed = 0;
    for (const r of PROPOSED_2027.rules) {
      const adopted = byId(ADOPTED_2026, r.id) as typeof r;
      if (r.baselineParams) {
        changed += 1;
        expect(r.baselineParams, `${r.id}: baselineParams`).toEqual(adopted.params);
        expect(r.params, `${r.id}: marked changed but equals 2026`).not.toEqual(adopted.params);
      } else {
        expect(r.params, `${r.id}: carried`).toEqual(adopted.params);
      }
    }
    // 18 rules move in Tabell 1.5/1.6; a lower count means a change was dropped.
    expect(changed).toBe(18);
  });

  it('the two benefit rules are carried unreviewed, because Prop. 1 LS does not state them', () => {
    const unreviewed = PROPOSED_2027.rules.filter((r) => r.status === 'not-reviewed').map((r) => r.id);
    expect(unreviewed.sort()).toEqual(['benefit.childBenefit', 'benefit.studentSupport']);
    expect(PROPOSED_2027.rules.filter((r) => r.status !== 'not-reviewed').every((r) => r.status === 'estimated')).toBe(true);
  });
});

describe('PROPOSED_2027 provenance against the archived text', () => {
  const cited = PROPOSED_2027.rules.filter((r) => r.provenance.sourceId === SRC);

  it('cites the proposal for every rule that Prop. 1 LS states', () => {
    expect(cited.length).toBe(FORMULA_IDS.length - 2);
  });

  for (const r of cited) {
    it(`${r.id}: anchor occurs on a cited page`, () => {
      const pages = parsePageRefs(r.provenance.pageOrTable);
      expect(pages, r.provenance.pageOrTable).not.toBeNull();
      const found = pages!.some((p) => anchorInText(r.provenance.anchor, PAGES[p - 1] ?? ''));
      expect(found, `«${r.provenance.anchor}» not on ${r.provenance.pageOrTable}`).toBe(true);
    });
  }

  it('the anchor test can fail', () => {
    expect(anchorInText('114 540 kr 120 181 kr', PAGES[26] ?? '')).toBe(false);
    expect(anchorInText('114 540 kr 120 180 kr', PAGES[26] ?? '')).toBe(true);
  });

  // Hand-typed from Tabell 1.5/1.6, independent of the data file: each number must be on its page.
  const NUMBERS: ReadonlyArray<readonly [number, readonly string[]]> = [
    [26, ['235 150 kr', '331 050 kr', '754 050 kr', '1 019 300 kr', '1 525 900 kr', '7,4 pst.', '99 650 kr']],
    [27, ['120 180 kr', '99 550 kr', '77 950 kr', '40 750 kr', '306 250 kr', '457 550 kr']],
    [28, ['8 950 kr']],
    [29, ['1 990 000 kr', '21,5 mill. kr']],
    [31, ['24,20 24,85', '5,41 5,56', '9,23 9,48', '331 340', '102 105']],
    [33, ['3,77 3,37', '2,28 1,84']],
    [34, ['3,80 4,40', '4,42 5,13', '7,13 7,32']],
    [35, ['61 63', '350 359']],
  ];
  for (const [page, nums] of NUMBERS) {
    it(`PDF p${page} contains the 2027 numbers the data encodes`, () => {
      for (const n of nums) expect(anchorInText(n, PAGES[page - 1]!), `${n} on p${page}`).toBe(true);
    });
  }


  // The same numbers, typed again from the tables, must be what the data encodes (kroner, whole).
  const ENCODED: ReadonlyArray<readonly [string, readonly number[]]> = [
    ['income.bracketTax', [235_150, 331_050, 754_050, 1_019_300, 1_525_900]],
    ['income.personalAllowance', [120_180]],
    ['income.minimumDeductionWage', [99_550]],
    ['income.minimumDeductionPension', [77_950]],
    ['income.unionFeeDeduction', [8_950]],
    ['income.pensionTaxCredit', [40_750, 306_250, 457_550]],
    ['wealth.netWealthTax', [1_990_000, 3_980_000, 21_500_000, 43_000_000]],
  ];
  it('the encoded kroner amounts are the ones printed in the tables', () => {
    for (const [id, nums] of ENCODED) {
      const json = JSON.stringify(byId(PROPOSED_2027, id));
      for (const n of nums) expect(json, `${id} ${n}`).toContain(String(n));
    }
  });

  it('composite excise rates equal the sum / product of the stated components', () => {
    const rate = (id: string) => (byId(PROPOSED_2027, id) as unknown as { params: { ratePerUnit: number } }).params.ratePerUnit;
    const kronerOf = (id: string) => rate(id) / 10_000;
    expect(kronerOf('excise.petrolLitre')).toBeCloseTo(3.37 + 4.4, 6);
    expect(kronerOf('excise.dieselLitre')).toBeCloseTo(1.84 + 5.13, 6);
    expect(kronerOf('excise.wineLitre')).toBeCloseTo(5.56 * 12, 6);
    expect(kronerOf('excise.spiritsLitre')).toBeCloseTo(9.48 * 40, 6);
    expect(kronerOf('excise.cigarette')).toBeCloseTo(3.4, 6);
    expect(kronerOf('excise.snusGram')).toBeCloseTo(1.05, 6);
  });
});

describe('2027 round engine', () => {
  const ap = () => calculateParty(profile({ adults: [adult({ wageIncome: kr(500_000) })] }), 'ap', ROUND_2027_BUNDLE, DEFAULT_TOGGLES);

  it('lays Ap over the proposal, not over adopted 2026', () => {
    const rs = resolveRuleSet('ap', ROUND_2027_BUNDLE, DEFAULT_TOGGLES).ruleSet;
    expect(rs.rules.get('income.personalAllowance')).toBe(byId(PROPOSED_2027, 'income.personalAllowance'));
    expect(AP_2027.year).toBe(2027);
    expect(AP_2027.deltas).toHaveLength(0);
  });

  it('500 000 kr wage, no consumption: tax saving matches an independent hand calculation', () => {
    // 2026: minstefradrag 95 700; (500 000 − 95 700 − 114 540) × 22 % = 63 747,2; trinn 1 567,4 + 7 268;
    //       trygdeavgift 38 000                                                  → 110 582,6
    // 2027: minstefradrag 99 550; (500 000 − 99 550 − 120 180) × 22 % = 61 659,4; trinn 1 630,3 + 6 758;
    //       trygdeavgift 37 000                                                  → 107 047,7
    const headline = ap().headline as number;
    expect(Math.abs(headline - 3_534.9)).toBeLessThan(2);
  });

  it('a pure wage earner is better off, and the reference is the 2026 system (zero change against itself)', () => {
    for (const key of ['medianSingle', 'twoEarnersTwoKids', 'highEarner']) {
      const res = calculateParty(FIXTURES[key]!, 'ap', ROUND_2027_BUNDLE, DEFAULT_TOGGLES);
      expect(res.headline as number, key).not.toBe(0);
    }
    // The 2026 bundle keeps Ap at zero by construction; only the 2027 round moves it.
    const zero = calculateParty(FIXTURES.medianSingle!, 'ap', { ...ROUND_2027_BUNDLE, proposed: ROUND_2027_BUNDLE.adopted, partyBase: 'adopted' }, DEFAULT_TOGGLES);
    expect(zero.headline as number).toBe(0);
  });
});
