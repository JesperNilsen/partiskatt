import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { GATE3_TOLERANCE_KR } from '../data/gate3.ts';
import { sourceOf } from '../data/index.ts';
import { computeScenario, sanitizeProfile } from '../engine/calculate-scenario.ts';
import { kr } from '../engine/money.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import type { ScenarioResult } from '../types/index.ts';
import { adult, profile } from './fixtures.ts';

/**
 * Standing reference anchor (audit pointer E2, 2026-10-20): Finansdepartementet's own worked
 * example, Prop. 1 LS (2026–2027) Tabell 2.1 «Beregnet skatt for noen utvalgte lønnsinntekter.
 * 2026-regler» (archived text, ~line 2045), against the engine's ADOPTED_2026 rules.
 *
 * The printed table is read out of the archived text, not retyped here, so a transcription slip
 * cannot make the anchor agree with the engine. It is an outside judge for the income-tax rules
 * (alminnelig inntekt, trinnskatt, trygdeavgift) at three single-earner wages. It says nothing
 * about pension, wealth, consumption taxes or any party rule.
 *
 * Tabell 3.1 of the same Prop. («Anslåtte fordelingsvirkninger» of the 2027 pension-credit change)
 * is deliberately NOT encoded: it prints LOTTE microsimulation averages over income bands for a
 * 2027 proposal, with no household the engine could be asked to reproduce.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = 'prop1ls-2026-2027';
const TEXT = readFileSync(join(ROOT, sourceOf(SRC).textFile!), 'utf8');

const WAGES = [200_000, 650_000, 1_000_000] as const;

/** One printed row: its label and the three printed whole-kroner values (one per wage). */
interface Row {
  label: string;
  values: number[];
}

/** The table block between its caption and its «Kilde:» line, as label + 3 values per row. */
function printedTable(): Row[] {
  const start = TEXT.indexOf('Tabell 2.1 Beregnet skatt for noen utvalgte lønnsinntekter. 2026-regler');
  expect(start, 'Tabell 2.1 caption not found in the archived Prop. 1 LS text').toBeGreaterThan(-1);
  const end = TEXT.indexOf('Kilde: Finansdepartementet', start);
  const rows: Row[] = [];
  for (const line of TEXT.slice(start, end).split('\n').slice(1)) {
    const cells = line.trim().split(/\s{2,}/);
    if (cells.length !== 4) continue;
    const values = cells.slice(1).map((c) => (/^\d{1,3}( \d{3})*$/.test(c) ? Number(c.replace(/ /g, '')) : NaN));
    if (values.some(Number.isNaN)) continue; // the «(pst. av lønnsinntekt)» row
    rows.push({ label: cells[0]!.replace(/^- |^= /, ''), values });
  }
  return rows;
}

const TABLE = printedTable();
const printed = (labelStart: string): number[] => {
  const row = TABLE.find((r) => r.label.startsWith(labelStart));
  expect(row, `no printed row «${labelStart}»`).toBeDefined();
  return row!.values;
};

const rs = resolveBaseline(ADOPTED_2026);
const engine = (wage: number): ScenarioResult =>
  computeScenario(sanitizeProfile(profile({ adults: [adult({ wageIncome: kr(wage) })] })), rs, rs);
const component = (r: ScenarioResult, formulaId: string) => r.components.find((c) => c.formulaId === formulaId)!;

describe('Prop. 1 LS 2026–27 Tabell 2.1 — the printed table is read correctly', () => {
  it('yields all 13 numeric rows, the wages, and the three printed totals', () => {
    expect(TABLE).toHaveLength(13);
    expect(printed('Lønnsinntekt')).toEqual([...WAGES]);
    expect(printed('Samlet skatt')).toEqual([15_200, 160_983, 305_870]);
  });
});

describe('Prop. 1 LS 2026–27 Tabell 2.1 — ADOPTED_2026 reproduces the printed 2026 tax', () => {
  // One entry per printed component: 9 are the headline taxes the app adds up (3 wages × 3 taxes);
  // the deductions, the taxable base and the five bracket lines are checked too.
  const cases: { row: string; read: (r: ScenarioResult) => number }[] = [
    { row: 'Minstefradrag', read: (r) => component(r, 'income.generalRate').inputs.minstefradrag! },
    { row: 'Personfradrag', read: (r) => component(r, 'income.generalRate').inputs.personfradrag! },
    { row: 'Skattbar alminnelig inntekt', read: (r) => component(r, 'income.generalRate').inputs.grunnlag! },
    { row: 'Skatt på alminnelig inntekt', read: (r) => component(r, 'income.generalRate').amount },
    { row: 'Trygdeavgift', read: (r) => component(r, 'income.socialSecurity').amount },
    ...[1, 2, 3, 4, 5].map((n) => ({
      row: `Trinn ${n} (`,
      read: (r: ScenarioResult) => component(r, 'income.bracketTax').inputs[`trinn${n}Skatt`]!,
    })),
    { row: 'Samlet trinnskatt', read: (r) => component(r, 'income.bracketTax').amount },
  ];

  for (const { row, read } of cases) {
    it(`${row.replace(/ \($/, '')} is exact at 200 000 / 650 000 / 1 000 000`, () => {
      expect(WAGES.map((w) => read(engine(w)))).toEqual(printed(row));
    });
  }

  it('Samlet skatt is within the gate-3 tolerance (the Prop. sums unrounded parts)', () => {
    const total = (r: ScenarioResult) =>
      component(r, 'income.generalRate').amount + component(r, 'income.bracketTax').amount + component(r, 'income.socialSecurity').amount;
    WAGES.forEach((w, i) => {
      const gap = total(engine(w)) - printed('Samlet skatt')[i]!;
      expect(Math.abs(gap), `wage ${w}: engine ${total(engine(w))} vs printed ${printed('Samlet skatt')[i]}`).toBeLessThanOrEqual(
        GATE3_TOLERANCE_KR,
      );
    });
  });
});

describe('Prop. 1 LS 2026–27 Tabell 2.1 — printed rates and thresholds equal the rule parameters', () => {
  // The table's row labels carry the parameters. Trinn 5 prints 0 in every column (no wage reaches
  // 1 467 200), so only its label can anchor that rate and threshold.
  const bp = (s: string) => Math.round(Number(s.replace(',', '.')) * 100);
  const nok = (s: string) => Number(s.replace(/ /g, ''));
  const rule = (id: string) => ADOPTED_2026.rules.find((r) => r.id === id)!.params as Record<string, any>;
  const label = (labelStart: string) => TABLE.find((r) => r.label.startsWith(labelStart))!.label;

  it('alminnelig inntekt and trygdeavgift rates', () => {
    expect(bp(/\(([\d,]+) pst\.\)/.exec(label('Skatt på alminnelig inntekt'))![1]!)).toBe(rule('income.generalRate').rateBp);
    expect(bp(/\(([\d,]+) pst\.\)/.exec(label('Trygdeavgift'))![1]!)).toBe(rule('income.socialSecurity').wageRateBp);
  });

  it('trinnskatt rate and threshold, all five trinn', () => {
    const brackets = rule('income.bracketTax').brackets as { threshold: number; rateBp: number }[];
    expect(brackets).toHaveLength(5);
    [1, 2, 3, 4, 5].forEach((n, i) => {
      const m = /\(([\d,]+) pst\. over ([\d ]+)\)/.exec(label(`Trinn ${n} (`));
      expect(m, `Trinn ${n} label`).not.toBeNull();
      expect({ threshold: brackets[i]!.threshold, rateBp: brackets[i]!.rateBp }, `Trinn ${n}`).toEqual({
        threshold: nok(m![2]!),
        rateBp: bp(m![1]!),
      });
    });
  });
});
