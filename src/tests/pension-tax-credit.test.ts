import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, DATA_BUNDLE, PROPOSED_2026 } from '../data/index.ts';
import {
  paramsOf,
  computeIncomeTax,
  computeScenario,
  pensionTaxCredit,
  resolveBaseline,
  resolveRuleSet,
  sanitizeProfile,
  thresholdsOf,
} from '../engine/index.ts';
import { kr } from '../engine/money.ts';
import type { ResolvedRuleSet } from '../engine/rule-set.ts';
import type { Adult, Component, FormulaParams, Toggles, UserProfile } from '../types/index.ts';
import { DEFAULT_TOGGLES, PARTY_IDS } from '../types/index.ts';
import { FIXTURES, adult, profile } from './fixtures.ts';

/**
 * Skattefradrag for pensjonsinntekt (sktl. § 16-1), adopted 2026 after the June 2026 change:
 * max 39 100 kr, −19,1 % of pension between 294 200 and 437 100 kr, −6 % above 437 100 kr, never more
 * than skatt på alminnelig inntekt + trinnskatt + trygdeavgift (§ 16-1 sjette ledd).
 * Expected values below are worked by hand in the comments (mulBp rounds half away from zero).
 */
const adopted = resolveBaseline(ADOPTED_2026);
const proposed = resolveBaseline(PROPOSED_2026);
const NO_CAP = kr(10_000_000);

function lines(a: Adult, rs: ResolvedRuleSet = adopted, index = 0) {
  const cs = computeIncomeTax(a, index, rs);
  const get = (id: string): Component => cs.find((c) => c.formulaId === id)!;
  const credit = get('income.pensionTaxCredit');
  const paid = cs.filter((c) => c.direction === 'paid').reduce((s, c) => s + c.amount, 0);
  const received = cs.filter((c) => c.direction === 'received').reduce((s, c) => s + c.amount, 0);
  return { credit, paid, taxAfter: paid - received };
}

describe('pension tax credit — parameters', () => {
  it('adopted 2026 is the June 2026 value; proposed is Prop. 1 LS', () => {
    const p = (set: typeof ADOPTED_2026) =>
      set.rules.find((r) => r.id === 'income.pensionTaxCredit')!.params as FormulaParams['income.pensionTaxCredit'];
    expect(p(ADOPTED_2026)).toEqual({ max: 39_100, threshold1: 294_200, rate1Bp: 1_910, threshold2: 437_100, rate2Bp: 600 });
    expect(p(PROPOSED_2026)).toEqual({ max: 37_100, threshold1: 284_950, rate1Bp: 1_670, threshold2: 436_050, rate2Bp: 600 });
  });

  it('declares trinn 1 and trinn 2 as thresholds', () => {
    const p = ADOPTED_2026.rules.find((r) => r.id === 'income.pensionTaxCredit')!.params as FormulaParams['income.pensionTaxCredit'];
    expect(thresholdsOf('income.pensionTaxCredit', p)).toEqual([294_200, 437_100]);
  });
});

describe('pension tax credit — phase-out bands (cap lifted)', () => {
  const credit = (pension: number) => pensionTaxCredit(kr(pension), NO_CAP, kr(0), adopted).amount;

  it('below and at trinn 1: the full 39 100 kr', () => {
    expect(credit(1)).toBe(39_100);
    expect(credit(200_000)).toBe(39_100);
    expect(credit(294_200)).toBe(39_100);
  });

  it('between trinn 1 and trinn 2: 19,1 % of pension over 294 200 kr', () => {
    // 39 100 − 0,191 × (400 000 − 294 200) = 39 100 − 20 207,8 → 39 100 − 20 208 = 18 892
    expect(credit(400_000)).toBe(18_892);
    // 39 100 − 0,191 × 142 900 = 39 100 − 27 293,9 → 39 100 − 27 294 = 11 806
    expect(credit(437_100)).toBe(11_806);
  });

  it('above trinn 2: 19,1 % of the band plus 6 % of pension over 437 100 kr, never below 0', () => {
    // 39 100 − 27 294 − 0,06 × (500 000 − 437 100) = 39 100 − 27 294 − 3 774 = 8 032
    expect(credit(500_000)).toBe(8_032);
    // gone at 437 100 + 11 806 / 0,06 ≈ 633 867
    expect(credit(640_000)).toBe(0);
    expect(credit(2_000_000)).toBe(0);
  });

  it('no pension, no credit', () => {
    expect(credit(0)).toBe(0);
  });

  it('proposed (Prop. 1 LS): 16,7 % over 284 950 kr', () => {
    // 37 100 − 0,167 × (300 000 − 284 950) = 37 100 − 2 513,35 → 37 100 − 2 513 = 34 587
    expect(pensionTaxCredit(kr(300_000), NO_CAP, kr(0), proposed).amount).toBe(34_587);
  });
});

describe('pension tax credit — in the income tax of one adult (adopted)', () => {
  it('is its own received direct-tax component', () => {
    const { credit } = lines(adult({ pensionIncome: kr(300_000) }));
    expect(credit.id).toBe('income.pensionTaxCredit#0');
    expect(credit.direction).toBe('received');
    expect(credit.category).toBe('direct-tax');
    expect(credit.label).toBe('Skattefradrag for pensjonsinntekt');
  });

  it('cap binds below trinn 1: a 200 000 kr pension pays no income tax', () => {
    // minstefradrag 40 % = 80 000, capped at 75 400 → alminnelig inntekt 124 600; − personfradrag 114 540
    // = 10 060 × 22 % = 2 213; trinnskatt 0 (under 226 100); trygdeavgift 5,1 % × 200 000 = 10 200;
    // sum 12 413 < 39 100, so the credit is the whole tax.
    const { credit, paid, taxAfter } = lines(adult({ pensionIncome: kr(200_000) }));
    expect(paid).toBe(12_413);
    expect(credit.amount).toBe(12_413);
    expect(credit.inputs.fradragEtterNedtrapping).toBe(39_100);
    expect(taxAfter).toBe(0);
  });

  it('the gate-3 pensioner (300 000 kr, between trinn 1 and 2): phased-out credit, cap does not bind', () => {
    // skatt alminnelig inntekt (300 000 − 75 400 − 114 540) × 22 % = 24 213; trinnskatt 73 900 × 1,7 % = 1 256;
    // trygdeavgift 15 300; sum 40 769. Credit 39 100 − 0,191 × 5 800 (1 108) = 37 992 < 40 769.
    const p = FIXTURES.singlePensioner!;
    const { credit, paid, taxAfter } = lines(p.adults[0]);
    expect(paid).toBe(40_769);
    expect(credit.amount).toBe(37_992);
    expect(credit.amount).toBeLessThan(credit.inputs.skattForFradrag!);
    expect(taxAfter).toBe(2_777);
  });

  it('above trinn 2 (500 000 kr pension): credit 8 032, tax after credit 94 516', () => {
    const { credit, paid, taxAfter } = lines(adult({ pensionIncome: kr(500_000) }));
    expect(paid).toBe(102_548);
    expect(credit.amount).toBe(8_032);
    expect(taxAfter).toBe(94_516);
  });

  it('wage + pension: phase-out on pension only, cap is the whole income tax (approximation, METHODOLOGY)', () => {
    // pension 50 000 < trinn 1 → full 39 100; the adult's tax on 650 000 kr is far above it.
    const { credit, paid } = lines(adult({ wageIncome: kr(600_000), pensionIncome: kr(50_000) }));
    expect(credit.amount).toBe(39_100);
    expect(credit.inputs.skattForFradrag).toBe(paid);
  });

  it('wage only: no credit', () => {
    expect(lines(adult({ wageIncome: kr(600_000) })).credit.amount).toBe(0);
  });

  it('jobbfradrag is set off first; together they never take the tax below zero', () => {
    const on: Toggles = { ...DEFAULT_TOGGLES, includeUncertain: true };
    const h = resolveRuleSet('h', DATA_BUNDLE, on).ruleSet;
    const a = adult({ wageIncome: kr(100_000), pensionIncome: kr(150_000) });
    const cs = computeIncomeTax(a, 0, h);
    const job = cs.find((c) => c.formulaId === 'income.workTaxCredit')!.amount;
    const { credit, paid, taxAfter } = lines(a, h);
    expect(job).toBe(4_300);
    expect(credit.amount).toBe(paid - job);
    expect(credit.inputs.skattForFradrag).toBe(paid - job);
    expect(taxAfter).toBe(0);
  });
});

describe('pension tax credit — households', () => {
  it('adult 2 with pension gets the credit; adult 1 with wage only gets none', () => {
    const p = profile({
      mode: 'household',
      adults: [adult({ wageIncome: kr(600_000) }), adult({ pensionIncome: kr(300_000) })],
    });
    const s = computeScenario(sanitizeProfile(p), adopted, adopted);
    const byId = new Map(s.components.map((c) => [c.id, c]));
    expect(byId.get('income.pensionTaxCredit#0')!.amount).toBe(0);
    expect(byId.get('income.pensionTaxCredit#1')!.amount).toBe(37_992);
    const single = computeScenario(sanitizeProfile(profile({ adults: [adult({ wageIncome: kr(600_000) })] })), adopted, adopted);
    // Adult 2 adds the taxes on the pension minus the credit: −40 769 + 37 992 = −2 777.
    expect(s.net - single.net).toBe(-2_777);
  });
});

describe('pension tax credit — net after tax never falls when pension rises (signed sums)', () => {
  /** Pension + signed sum of every non-employer component (taxes paid negative, credits positive). */
  const netAfterTax = (p: UserProfile, rs: ResolvedRuleSet, pension: number) =>
    pension + computeScenario(sanitizeProfile(p), rs, rs).net;

  const ruleSets: [string, ResolvedRuleSet][] = [
    ['adopted', adopted],
    ['proposed', proposed],
    ...PARTY_IDS.map((id): [string, ResolvedRuleSet] => [id, resolveRuleSet(id, DATA_BUNDLE, DEFAULT_TOGGLES).ruleSet]),
  ];
  const shapes: [string, (pension: number) => UserProfile][] = [
    ['pension only', (pension) => profile({ adults: [adult({ pensionIncome: kr(pension) })] })],
    ['wage 300 000 + pension', (pension) => profile({ adults: [adult({ wageIncome: kr(300_000), pensionIncome: kr(pension) })] })],
    [
      'adult 2 pension',
      (pension) =>
        profile({ mode: 'household', adults: [adult({ wageIncome: kr(500_000) }), adult({ pensionIncome: kr(pension) })] }),
    ],
  ];

  it.each(ruleSets)('%s: +1 000 kr pension never lowers net income, 0 – 800 000 kr', (_name, rs) => {
    for (const [shape, make] of shapes) {
      let prev = netAfterTax(make(0), rs, 0);
      for (let pension = 1_000; pension <= 800_000; pension += 1_000) {
        const next = netAfterTax(make(pension), rs, pension);
        expect({ shape, pension, drop: Math.min(0, next - prev) }).toEqual({ shape, pension, drop: 0 });
        prev = next;
      }
    }
  });

  it.each(ruleSets)('%s: monotone around the credit thresholds (t − 1, t, t + 1)', (_name, rs) => {
    const params = rs.rules.get('income.pensionTaxCredit')!.params as FormulaParams['income.pensionTaxCredit'];
    const make = shapes[0]![1];
    for (const t of thresholdsOf('income.pensionTaxCredit', params)) {
      const [a, b, c] = [t - 1, t, t + 1].map((x) => netAfterTax(make(x), rs, x));
      expect(b!).toBeGreaterThanOrEqual(a!);
      expect(c!).toBeGreaterThanOrEqual(b!);
    }
  });
});

describe('pension credit in the method texts', () => {
  it('MethodView and METHODOLOGY.md state the adopted amount, thresholds and rates read from the rule', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const p = paramsOf(adopted, 'income.pensionTaxCredit');
    const krText = (v: number) => `${v.toLocaleString('nb-NO').replace(/\s/g, ' ')} kr`;
    const pctText = (bp: number) => `${(bp / 100).toLocaleString('nb-NO')} %`;
    const claims = [krText(p.max), krText(p.threshold1), krText(p.threshold2), pctText(p.rate1Bp), pctText(p.rate2Bp)];
    expect(claims).toEqual(['39 100 kr', '294 200 kr', '437 100 kr', '19,1 %', '6 %']);
    for (const file of ['src/views/MethodView.tsx', 'METHODOLOGY.md']) {
      const text = readFileSync(join(root, file), 'utf8').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
      for (const claim of claims) expect(text, `${file}: ${claim}`).toContain(claim);
      expect(text, file).toMatch(/Skattefradrag for pensjonsinntekt/);
      expect(text, file).toMatch(/uføretrygd/i);
    }
  });
});
