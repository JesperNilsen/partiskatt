import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { bracketTax, computeIncomeTax, computeWealthTax, thresholdsOf } from '../engine/index.ts';
import { kr } from '../engine/money.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import type { AnyRule, FormulaParams, Kroner } from '../types/index.ts';
import { adult, wealth } from './fixtures.ts';

const rs = resolveBaseline(ADOPTED_2026);

function incomeTax(wage: number): number {
  return computeIncomeTax(adult({ wageIncome: kr(wage) }), 0, rs).reduce((s, c) => s + c.amount, 0);
}

function wealthTax(bank: number, adults: 1 | 2 = 1): number {
  return computeWealthTax(wealth({ bankDeposits: kr(bank) }), adults, rs).amount;
}

const incomeRules = [...rs.rules.values()].filter((r) => r.id.startsWith('income.'));
const wealthRules = [...rs.rules.values()].filter((r) => r.id.startsWith('wealth.'));

function grid(rules: AnyRule[]): { rule: string; t: Kroner }[] {
  return rules.flatMap((r) => thresholdsOf(r.id, r.params).map((t) => ({ rule: r.id, t })));
}

describe('threshold matrix (adopted 2026)', () => {
  it('declares thresholds for every income rule that has one', () => {
    expect(grid(incomeRules).length).toBeGreaterThan(5);
  });

  it.each(grid(incomeRules))('$rule: income tax is monotone around $t', ({ t }) => {
    const a = incomeTax(t - 1);
    const b = incomeTax(t);
    const c = incomeTax(t + 1);
    expect(b).toBeGreaterThanOrEqual(a);
    expect(c).toBeGreaterThanOrEqual(b);
  });

  it.each(grid(wealthRules))('$rule: wealth tax is monotone around $t', ({ t }) => {
    for (const adults of [1, 2] as const) {
      const a = wealthTax(t - 1, adults);
      const b = wealthTax(t, adults);
      const c = wealthTax(t + 1, adults);
      expect(b).toBeGreaterThanOrEqual(a);
      expect(c).toBeGreaterThanOrEqual(b);
    }
  });

  it('bracket tax: the marginal rate right above each threshold is the declared bracket rate', () => {
    const { brackets } = ADOPTED_2026.rules.find((r) => r.id === 'income.bracketTax')!
      .params as FormulaParams['income.bracketTax'];
    for (const b of brackets) {
      const step = 1_000;
      const marginal = bracketTax(kr(b.threshold + step), rs).amount - bracketTax(kr(b.threshold), rs).amount;
      expect(Math.abs(marginal - (step * b.rateBp) / 10_000)).toBeLessThanOrEqual(1);
    }
    expect(bracketTax(kr(brackets[0]!.threshold - 1), rs).amount).toBe(0);
  });

  it('wealth tax: 1 % above the allowance, 1,1 % above tier 2, doubled thresholds for couples', () => {
    expect(wealthTax(1_900_000)).toBe(0);
    expect(wealthTax(1_900_000 + 100_000)).toBe(1_000);
    expect(wealthTax(21_500_000 + 100_000) - wealthTax(21_500_000)).toBe(1_100);
    expect(wealthTax(3_800_000, 2)).toBe(0);
    expect(wealthTax(3_800_000 + 100_000, 2)).toBe(1_000);
  });

  it('social security: zero at the lower threshold, phase-in caps the full rate just above it', () => {
    const comps = (wage: number) =>
      computeIncomeTax(adult({ wageIncome: kr(wage) }), 0, rs).find((c) => c.formulaId === 'income.socialSecurity')!;
    expect(comps(99_650).amount).toBe(0);
    expect(comps(100_650).amount).toBe(250);
    expect(comps(600_000).amount).toBe(45_600);
  });
});
