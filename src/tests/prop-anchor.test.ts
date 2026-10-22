import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, sourceOf } from '../data/index.ts';
import { GATE3_TOLERANCE_KR } from '../data/gate3.ts';
import { computeIncomeTax } from '../engine/income-tax.ts';
import { kr, pct } from '../engine/money.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import { paramsOf } from '../engine/rule-set.ts';
import type { AnyRule, BaselineRuleSet } from '../types/index.ts';
import { adult } from './fixtures.ts';

/**
 * Standing outside anchor: Prop. 1 LS (2026–2027) Tabell 2.1 «Beregnet skatt for noen utvalgte
 * lønnsinntekter. 2026-regler» (PDF p49). Finansdepartementet's own worked examples for a wage earner
 * with standard deductions, at 200 000, 650 000 and 1 000 000 kr. The rows are parsed from the archived
 * text, not typed here, so a re-archived or edited source changes what the test demands.
 *
 * Rounding order. The Prop computes every tax unrounded, prints each row rounded, and rounds each
 * total from the unrounded sum: at 650 000 kr, 96 747,2 + 49 400 + 1 567,4 + 13 268 = 160 982,6 → 160 983.
 * The engine rounds once per tax and once per bracket (mulBp), then sums whole kroner:
 * 96 747 + 49 400 + 1 567 + 13 268 = 160 982. So every component row must match exactly, while the two
 * totals («Samlet trinnskatt», «Samlet skatt») may differ by the accumulated rounding, which this test
 * bounds at GATE3_TOLERANCE_KR — the same 1 kr operator gate 3 uses against Skatteetaten.
 *
 * Tabell 3.1 (pension tax credit, PDF p81) is deliberately not encoded: it prints LOTTE averages over
 * ~826 000 people banded by gross income INCLUDING wage, capital and benefit income, so no single
 * profile reproduces a row (a pure pensioner at the band mean gets ~770 / ~10 kr where the table
 * prints −600 / −200). It is a population statistic, not a worked example.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = 'prop1ls-2026-2027';
const TEXT = readFileSync(join(ROOT, sourceOf(SRC).textFile!), 'utf8');
const PAGES = (TEXT.endsWith('\f') ? TEXT.slice(0, -1) : TEXT).split('\f');
const TABLE_TITLE = 'Tabell 2.1 Beregnet skatt for noen utvalgte lønnsinntekter. 2026-regler. Kroner';
const TABLE_PAGE = 49;

type Row = { label: string; cells: string[] };

/** The table's rows: label, then one cell per wage column (columns are separated by 2+ spaces). */
function parseTabell21(text: string): Row[] {
  const start = text.indexOf(TABLE_TITLE);
  if (start < 0) throw new Error('Tabell 2.1 finnes ikke i den arkiverte teksten');
  const end = text.indexOf('Kilde: Finansdepartementet.', start);
  return text
    .slice(start + TABLE_TITLE.length, end)
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => {
      const [label, ...cells] = l.split(/\s{2,}/);
      return { label: label!.replace(/^[-=]\s*/, ''), cells };
    });
}

const toKr = (cell: string): number => {
  if (!/^\d{1,3}( \d{3})*$/.test(cell)) throw new Error(`ikke et kronebeløp: «${cell}»`);
  return Number(cell.replace(/ /g, ''));
};
const toPct = (s: string): number => Number(s.replace(',', '.'));

interface Table {
  wages: number[];
  rows: Map<string, number[]>;
  shareOfWage: number[];
  generalRatePct: number;
  wageRatePct: number;
  brackets: { trinn: number; ratePct: number; threshold: number }[];
}

function readTable(): Table {
  const parsed = parseTabell21(TEXT);
  const rows = new Map<string, number[]>();
  let shareOfWage: number[] = [];
  let generalRatePct = NaN;
  let wageRatePct = NaN;
  const brackets: Table['brackets'] = [];
  for (const { label, cells } of parsed) {
    if (label === '(pst. av lønnsinntekt)') {
      shareOfWage = cells.map((c) => toPct(/^\(([\d,]+) pst\.\)$/.exec(c)![1]!));
      continue;
    }
    const general = /^Skatt på alminnelig inntekt \(([\d,]+) pst\.\)$/.exec(label);
    const trygd = /^Trygdeavgift \(([\d,]+) pst\.\)$/.exec(label);
    const trinn = /^Trinn (\d) \(([\d,]+) pst\. over ([\d ]+)\)$/.exec(label);
    let key = label;
    if (general) [key, generalRatePct] = ['Skatt på alminnelig inntekt', toPct(general[1]!)];
    if (trygd) [key, wageRatePct] = ['Trygdeavgift', toPct(trygd[1]!)];
    if (trinn) {
      key = `Trinn ${trinn[1]}`;
      brackets.push({ trinn: Number(trinn[1]), ratePct: toPct(trinn[2]!), threshold: toKr(trinn[3]!) });
    }
    rows.set(key, cells.map(toKr));
  }
  return { wages: rows.get('Lønnsinntekt') ?? [], rows, shareOfWage, generalRatePct, wageRatePct, brackets };
}

const TABLE = readTable();

/** Row label → the engine figure it is compared with, and whether it is a component (exact) or a total (±tolerance). */
const COMPONENT_ROWS = [
  'Minstefradrag',
  'Personfradrag',
  'Skattbar alminnelig inntekt',
  'Skatt på alminnelig inntekt',
  'Trygdeavgift',
  'Trinn 1',
  'Trinn 2',
  'Trinn 3',
  'Trinn 4',
  'Trinn 5',
] as const;
const TOTAL_ROWS = ['Samlet trinnskatt', 'Samlet skatt'] as const;

function engineRows(set: BaselineRuleSet, wage: number): Record<string, number> {
  const rs = resolveBaseline(set);
  const comps = computeIncomeTax(adult({ wageIncome: kr(wage) }), 0, rs);
  const byFormula = (id: string) => comps.find((c) => c.formulaId === id)!;
  const general = byFormula('income.generalRate');
  const bracket = byFormula('income.bracketTax');
  const trygd = byFormula('income.socialSecurity');
  const out: Record<string, number> = {
    Minstefradrag: general.inputs.minstefradrag!,
    Personfradrag: general.inputs.personfradrag!,
    'Skattbar alminnelig inntekt': general.inputs.grunnlag!,
    'Skatt på alminnelig inntekt': general.amount,
    Trygdeavgift: trygd.amount,
    'Samlet trinnskatt': bracket.amount,
    'Samlet skatt': general.amount + bracket.amount + trygd.amount,
  };
  for (let n = 1; n <= 5; n++) out[`Trinn ${n}`] = bracket.inputs[`trinn${n}Skatt`]!;
  return out;
}

/** Every disagreement between a rule set and Tabell 2.1, as readable lines; empty = anchored. */
function mismatches(set: BaselineRuleSet): string[] {
  const out: string[] = [];
  TABLE.wages.forEach((wage, col) => {
    const got = engineRows(set, wage);
    for (const row of COMPONENT_ROWS) {
      const want = TABLE.rows.get(row)![col]!;
      if (got[row] !== want) out.push(`${wage}: ${row} motor ${got[row]} ≠ Prop ${want}`);
    }
    for (const row of TOTAL_ROWS) {
      const want = TABLE.rows.get(row)![col]!;
      if (Math.abs(got[row]! - want) > GATE3_TOLERANCE_KR) out.push(`${wage}: ${row} motor ${got[row]} vs Prop ${want} (> ${GATE3_TOLERANCE_KR} kr)`);
    }
    const share = Math.round((got['Samlet skatt']! / wage) * 1000) / 10;
    if (share !== TABLE.shareOfWage[col]) out.push(`${wage}: pst. av lønnsinntekt ${share} ≠ ${TABLE.shareOfWage[col]}`);
  });
  return out;
}

function withRule(set: BaselineRuleSet, rule: AnyRule): BaselineRuleSet {
  return { ...set, rules: set.rules.map((r) => (r.id === rule.id ? rule : r)) };
}

describe('Prop. 1 LS (2026–2027) Tabell 2.1 parsed from the archived text', () => {
  it('sits on PDF p49 and parses to 3 wage columns × 13 rows plus the share row', () => {
    expect(PAGES[TABLE_PAGE - 1]).toContain(TABLE_TITLE);
    expect(TABLE.wages).toEqual([200_000, 650_000, 1_000_000]);
    expect([...TABLE.rows.keys()]).toEqual(['Lønnsinntekt', ...COMPONENT_ROWS, ...TOTAL_ROWS]);
    for (const [label, cells] of TABLE.rows) expect(cells, label).toHaveLength(3);
    expect(TABLE.shareOfWage).toHaveLength(3);
  });

  it('the parsed table is internally consistent (a misread column cannot pass)', () => {
    TABLE.wages.forEach((wage, col) => {
      const v = (row: string) => TABLE.rows.get(row)![col]!;
      expect(Math.max(0, wage - v('Minstefradrag') - v('Personfradrag')), `${wage} grunnlag`).toBe(v('Skattbar alminnelig inntekt'));
      const trinn = [1, 2, 3, 4, 5].reduce((s, n) => s + v(`Trinn ${n}`), 0);
      expect(Math.abs(trinn - v('Samlet trinnskatt')), `${wage} trinnskatt`).toBeLessThanOrEqual(GATE3_TOLERANCE_KR);
      const total = v('Skatt på alminnelig inntekt') + v('Trygdeavgift') + v('Samlet trinnskatt');
      expect(Math.abs(total - v('Samlet skatt')), `${wage} samlet`).toBeLessThanOrEqual(GATE3_TOLERANCE_KR);
    });
  });

  it("the rates and thresholds printed in the row labels are ADOPTED_2026's", () => {
    const rs = resolveBaseline(ADOPTED_2026);
    expect(pct(TABLE.generalRatePct)).toBe(paramsOf(rs, 'income.generalRate').rateBp);
    expect(pct(TABLE.wageRatePct)).toBe(paramsOf(rs, 'income.socialSecurity').wageRateBp);
    const brackets = paramsOf(rs, 'income.bracketTax').brackets;
    expect(TABLE.brackets.map((b) => ({ threshold: b.threshold, rateBp: pct(b.ratePct) }))).toEqual(
      brackets.map((b) => ({ threshold: b.threshold as number, rateBp: b.rateBp })),
    );
  });
});

describe('the engine on ADOPTED_2026 reproduces Tabell 2.1', () => {
  it('every component row exactly, both totals within GATE3_TOLERANCE_KR, the share row to 0,1 pst.', () => {
    expect(mismatches(ADOPTED_2026)).toEqual([]);
  });

  it('the rounding order is the only gap: at 650 000 kr the Prop total is 1 kr above the engine', () => {
    const got = engineRows(ADOPTED_2026, 650_000);
    expect(TABLE.rows.get('Samlet skatt')![1]! - got['Samlet skatt']!).toBe(1);
  });

  it('can fail: personfradrag +10 kr breaks the anchor in the rows it feeds', () => {
    const rs = resolveBaseline(ADOPTED_2026);
    const nudged = withRule(ADOPTED_2026, {
      ...rs.rules.get('income.personalAllowance')!,
      params: { amount: kr(paramsOf(rs, 'income.personalAllowance').amount + 10) },
    } as AnyRule);
    const out = mismatches(nudged);
    expect(out).toContain('650000: Personfradrag motor 114550 ≠ Prop 114540');
    expect(out).toContain('1000000: Skatt på alminnelig inntekt motor 173745 ≠ Prop 173747');
    // 200 000 kr has no taxable ordinary income either way: only its personfradrag row moves.
    expect(out.filter((l) => l.startsWith('200000:'))).toEqual(['200000: Personfradrag motor 114550 ≠ Prop 114540']);
  });

  it('can fail: a trinn 3 threshold 50 kr off breaks the trinn 3 row at 1 000 000 kr', () => {
    const rs = resolveBaseline(ADOPTED_2026);
    const b = paramsOf(rs, 'income.bracketTax').brackets;
    const nudged = withRule(ADOPTED_2026, {
      ...rs.rules.get('income.bracketTax')!,
      params: { brackets: b.map((x, i) => (i === 2 ? { ...x, threshold: kr(x.threshold + 50) } : x)) },
    } as AnyRule);
    expect(mismatches(nudged).some((l) => l.startsWith('1000000: Trinn 3'))).toBe(true);
  });
});
