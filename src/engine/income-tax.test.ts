import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { minimumDeduction, socialSecurity } from './income-tax.ts';
import { kr } from './money.ts';
import { resolveBaseline } from './resolve.ts';

/**
 * Q-005: `minimumDeduction` has a household-with-both-wage-and-pension branch
 * (`total = maxK(wagePart, minK(add(wagePart, pensionPart), w.max))`) that no fixture in
 * `src/tests/fixtures.ts` exercises (every fixture leaves `pensionIncome` at 0). Called
 * directly here, bypassing the UI and fixtures, against the adopted 2026 rule set.
 */
const rs = resolveBaseline(ADOPTED_2026);

describe('minimumDeduction', () => {
  it('with both wage and pension, caps the combined deduction at the wage ceiling (Q-005)', () => {
    // src/data/baseline/2026/adopted.ts:123-124 income.minimumDeductionWage: rateBp 46 %, max 95 700
    // src/data/baseline/2026/adopted.ts:138-139 income.minimumDeductionPension: rateBp 40 %, max 75 400
    // wagePart    = 46 % * 100 000 = 46 000 (under the 95 700 wage cap)
    // pensionPart = 40 % * 300 000 = 120 000, capped at the pension max -> 75 400
    // total = max(wagePart, min(wagePart + pensionPart, wageMax))
    //       = max(46 000, min(46 000 + 75 400 = 121 400, 95 700))
    //       = max(46 000, 95 700) = 95 700
    // (a naive sum of 121 400, uncapped, would also fail this assertion)
    const md = minimumDeduction(kr(100_000), kr(300_000), rs);
    expect(md.wagePart).toBe(46_000);
    expect(md.pensionPart).toBe(75_400);
    expect(md.total).toBe(95_700);
  });

  it('wage only: the deduction is simply the wage part', () => {
    // 46 % * 100 000 = 46 000, well under the 95 700 cap
    const md = minimumDeduction(kr(100_000), kr(0), rs);
    expect(md.wagePart).toBe(46_000);
    expect(md.pensionPart).toBe(0);
    expect(md.total).toBe(46_000);
  });
});

describe('socialSecurity', () => {
  it('sums the wage and pension rates when pension income is not zero', () => {
    // src/data/baseline/2026/adopted.ts:98-104 income.socialSecurity:
    //   wageRateBp 7.6 %, pensionRateBp 5.1 %, lowerThreshold 99 650, phaseInRateBp 25 %
    // full = 7.6 % * 100 000 + 5.1 % * 300 000 = 7 600 + 15 300 = 22 900
    // cap  = 25 % * max(0, (100 000 + 300 000) - 99 650) = 25 % * 300 350 = 75 087.5 -> 75 088
    //        (money.ts roundHalfAway rounds .5 away from zero)
    // amount = min(full, cap) = 22 900 (the ordinary rate applies, not the phase-in cap)
    const ss = socialSecurity(kr(100_000), kr(300_000), rs);
    expect(ss.full).toBe(22_900);
    expect(ss.cap).toBe(75_088);
    expect(ss.amount).toBe(22_900);
  });

  it('the phase-in cap binds just above the lower threshold, with pension income present', () => {
    // full = 7.6 % * 50 000 + 5.1 % * 60 000 = 3 800 + 3 060 = 6 860
    // cap  = 25 % * max(0, (50 000 + 60 000) - 99 650) = 25 % * 10 350 = 2 587.5 -> 2 588
    // amount = min(full, cap) = 2 588 (the phase-in cap binds, not the summed rate)
    const ss = socialSecurity(kr(50_000), kr(60_000), rs);
    expect(ss.full).toBe(6_860);
    expect(ss.cap).toBe(2_588);
    expect(ss.amount).toBe(2_588);
  });
});
