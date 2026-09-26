import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, DATA_BUNDLE, partyOf } from '../data/index.ts';
import { calculateParty } from '../engine/index.ts';
import { kr } from '../engine/money.ts';
import type { FormulaParams, PartyId } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { adult, profile, wealth } from './fixtures.ts';

/**
 * L13 (2026-09-26): each party is compared against the ADOPTED 2026 system, so a parameter the party
 * does not touch must stay at its adopted value. These pin the fixes where a rule had been built from
 * the Prop. 1 LS values (trinn 4–5 at 16,7 / 17,7 pst., the 10 mill. primary-home limit) and where
 * Høyre's reversal of the government's trygdeavgift cut was missing.
 */
function kept(party: PartyId, p: ReturnType<typeof profile>, componentId: string): number {
  const res = calculateParty(p, party, DATA_BUNDLE, DEFAULT_TOGGLES);
  const c = res.components.find((x) => x.id === componentId);
  if (!c) throw new Error(`${party}: missing component ${componentId}`);
  return c.keptDelta;
}

const wage = (amount: number) => profile({ adults: [adult({ wageIncome: kr(amount) })] });

const adoptedBrackets = (ADOPTED_2026.rules.find((r) => r.id === 'income.bracketTax')!.params as FormulaParams['income.bracketTax']).brackets;

describe('untouched parameters stay at adopted values (L13)', () => {
  it('H reverses the government trygdeavgift cut: 7,7 pst. on wages, 0,1 pst. of wage less kept', () => {
    expect(kept('h', wage(600_000), 'income.socialSecurity#0')).toBe(-600);
    expect(kept('h', wage(300_000), 'income.socialSecurity#0')).toBe(-300);
  });

  it('FrP: trinn 4–5 unchanged, so the bracket delta is the same below and above trinn 4', () => {
    const below = kept('frp', wage(900_000), 'income.bracketTax#0');
    expect(below).toBe(3_601); // trinn 1: 92 200 × 1,7 pst. + trinn 2: 406 750 × 0,5 pst.
    expect(kept('frp', wage(1_200_000), 'income.bracketTax#0')).toBe(below);
    expect(kept('frp', wage(1_600_000), 'income.bracketTax#0')).toBe(below);
  });

  it('Sp: only the trinn-4 threshold moves (960 000), at the adopted 16,8 pst.; trinn 5 unchanged', () => {
    const expected = -Math.round((980_100 - 960_000) * (0.168 - 0.137));
    expect(kept('sp', wage(1_200_000), 'income.bracketTax#0')).toBe(expected);
    expect(kept('sp', wage(1_600_000), 'income.bracketTax#0')).toBe(expected);
  });

  it('FrP and Sp encode adopted trinn 4–5 rates', () => {
    for (const id of ['frp', 'sp'] as const) {
      const rule = partyOf(id).deltas.find((d) => d.id === 'income.bracketTax');
      const { brackets } = rule!.params as FormulaParams['income.bracketTax'];
      expect(brackets.slice(3).map((b) => b.rateBp), id).toEqual(adoptedBrackets.slice(3).map((b) => b.rateBp));
    }
  });

  it('Sp home valuation: a 12 mill. home pays no more wealth tax than adopted (only the 2 mill. bunnfradrag bites)', () => {
    const home = profile({ adults: [adult()], wealth: wealth({ primaryHomeValue: kr(12_000_000) }) });
    // 12 mill. × 25 pst. = 3 mill.; bunnfradrag 1,9 → 2,0 mill. at 1 pst. = 1 000 kr less tax.
    expect(kept('sp', home, 'wealth.netWealthTax')).toBe(1_000);
  });

  it('H lists jobbfradrag and pensjonsfradrag as unquantified proposals', () => {
    const titles = partyOf('h').unquantified.map((u) => u.title);
    expect(titles.some((t) => /jobbfradrag/i.test(t))).toBe(true);
    expect(titles.some((t) => /pensjonsfradrag/i.test(t))).toBe(true);
  });
});
