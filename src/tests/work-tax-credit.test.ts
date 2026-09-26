import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, DATA_BUNDLE, PROPOSED_2026 } from '../data/index.ts';
import { calculateAll, calculateParty, computeIncomeTax, resolveBaseline, resolveRuleSet } from '../engine/index.ts';
import { kr } from '../engine/money.ts';
import { createProfile } from '../state/profile.ts';
import type { Adult, Component, Toggles, UserProfile } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { FIXTURES, adult, profile } from './fixtures.ts';

/**
 * L14 (Jesper 2026-09-26): Høyre's jobbfradrag is a flat 4 300 kr tax reduction per adult with wage
 * income, capped at that adult's income tax, and marked uncertain (counts only with «usikre forslag»).
 */
const ON: Toggles = { ...DEFAULT_TOGGLES, includeUncertain: true };
const OFF: Toggles = DEFAULT_TOGGLES;

/** The app's default profile (typisk consumption) with the given adults. */
function appProfile(first: Partial<Adult>, second?: Partial<Adult>): UserProfile {
  const base = createProfile();
  const a = (x: Partial<Adult>): Adult => ({ ...base.adults[0], ...x });
  return second ? { ...base, mode: 'household', adults: [a(first), a(second)] } : { ...base, adults: [a(first)] };
}

const headline = (p: UserProfile, toggles: Toggles, party: 'h' | 'frp' = 'h') =>
  calculateParty(p, party, DATA_BUNDLE, toggles).headline;

/** H's income-tax components for one adult, with the uncertain rules on. */
function hIncomeTax(a: Adult): { credit: number; taxBeforeCredit: number } {
  const rs = resolveRuleSet('h', DATA_BUNDLE, ON).ruleSet;
  const cs = computeIncomeTax(a, 0, rs);
  const credit = cs.find((c) => c.formulaId === 'income.workTaxCredit')!;
  expect(credit.direction).toBe('received');
  const paid = cs.filter((c: Component) => c.direction === 'paid').reduce((s, c) => s + c.amount, 0);
  return { credit: credit.amount, taxBeforeCredit: paid };
}

describe('H jobbfradrag (flat 4 300 kr, uncertain)', () => {
  it('toggle off: H headline unchanged from main (−691 at 600 000 kr wage, default profile)', () => {
    expect(headline(appProfile({ wageIncome: kr(600_000) }), OFF)).toBe(-691);
  });

  it.each([300_000, 600_000, 1_200_000])('single adult %i kr wage: toggle on adds exactly 4 300 kr to H', (wage) => {
    const p = appProfile({ wageIncome: kr(wage) });
    expect(headline(p, ON) - headline(p, OFF)).toBe(4_300);
  });

  it('two working adults: 8 600 kr; one working + one pension-only: 4 300 kr', () => {
    const both = appProfile({ wageIncome: kr(600_000) }, { wageIncome: kr(450_000) });
    expect(headline(both, ON) - headline(both, OFF)).toBe(8_600);
    const mixed = appProfile({ wageIncome: kr(600_000) }, { pensionIncome: kr(450_000) });
    expect(headline(mixed, ON) - headline(mixed, OFF)).toBe(4_300);
  });

  it('pension-only and zero-income adults get no credit', () => {
    for (const a of [adult({ pensionIncome: kr(400_000) }), adult()]) {
      expect(hIncomeTax(a).credit).toBe(0);
      const p = profile({ adults: [a] });
      expect(headline(p, ON)).toBe(headline(p, OFF));
    }
  });

  it('small wage: the credit is capped at the income tax, so tax never goes negative', () => {
    // 160 000 kr under H: no tax on general income (below minstefradrag + personfradrag), no trinnskatt,
    // trygdeavgift = 25 pst. × (160 000 − 150 000) = 2 500 kr → credit 2 500, tax after credit 0.
    const small = hIncomeTax(adult({ wageIncome: kr(160_000) }));
    expect(small.taxBeforeCredit).toBe(2_500);
    expect(small.credit).toBe(2_500);
    // 50 000 kr: no tax at all, so no credit.
    const tiny = hIncomeTax(adult({ wageIncome: kr(50_000) }));
    expect(tiny.taxBeforeCredit).toBe(0);
    expect(tiny.credit).toBe(0);
    for (const wage of [1, 50_000, 150_000, 150_001, 160_000, 165_000, 170_000, 200_000, 600_000]) {
      const r = hIncomeTax(adult({ wageIncome: kr(wage) }));
      expect(r.credit, `${wage}`).toBeLessThanOrEqual(4_300);
      expect(r.taxBeforeCredit - r.credit, `${wage}`).toBeGreaterThanOrEqual(0);
    }
    expect(hIncomeTax(adult({ wageIncome: kr(600_000) })).credit).toBe(4_300);
  });

  it('adopted and proposed have no jobbfradrag: 0 kr, so every other party is untouched', () => {
    for (const set of [ADOPTED_2026, PROPOSED_2026]) {
      expect(set.rules.find((r) => r.id === 'income.workTaxCredit')!.params).toEqual({ amountPerWorker: 0 });
      const rs = resolveBaseline(set);
      for (const p of Object.values(FIXTURES)) {
        p.adults.forEach((a, i) => {
          const c = computeIncomeTax(a, i, rs).find((x) => x.formulaId === 'income.workTaxCredit')!;
          expect(c.amount).toBe(0);
        });
      }
    }
    const profiles = [...Object.values(FIXTURES), appProfile({ wageIncome: kr(600_000) }, { wageIncome: kr(300_000) })];
    for (const p of profiles) {
      for (const r of calculateAll(p, ON, DATA_BUNDLE)) {
        const deltas = r.components.filter((c) => c.formulaId === 'income.workTaxCredit');
        const total = deltas.reduce((s, c) => s + c.keptDelta, 0);
        if (r.party !== 'h') expect(total, r.party).toBe(0);
      }
    }
  });

  it('single 600 000 kr: with the toggle on, only H moves (the other uncertain rules need wealth or children)', () => {
    const p = appProfile({ wageIncome: kr(600_000) });
    const off = calculateAll(p, OFF, DATA_BUNDLE);
    const on = calculateAll(p, ON, DATA_BUNDLE);
    const moved = on.filter((r) => off.find((o) => o.party === r.party)!.headline !== r.headline).map((r) => r.party);
    expect(moved).toEqual(['h']);
  });
});

describe('jobbfradrag assumption in the method texts', () => {
  it('MethodView and METHODOLOGY.md state the encoded amount and the cap', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
    const rule = DATA_BUNDLE.parties.find((p) => p.id === 'h')!.deltas.find((d) => d.id === 'income.workTaxCredit')!;
    const amount = (rule.params as { amountPerWorker: number }).amountPerWorker.toLocaleString('nb-NO').replace(/\s/g, ' ');
    for (const file of ['src/views/MethodView.tsx', 'METHODOLOGY.md']) {
      const text = readFileSync(join(root, file), 'utf8').replace(/\s+/g, ' ');
      expect(text, file).toContain(`flat skattereduksjon på ${amount} kr per voksen med lønnsinntekt`);
      expect(text, file).toMatch(/trinnskatt og trygdeavgift/);
    }
  });
});
