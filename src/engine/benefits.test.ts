import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { adult, profile } from '../tests/fixtures.ts';
import { computeBenefits } from './benefits.ts';
import { resolveBaseline } from './resolve.ts';

/**
 * Q-006: `computeBenefits` grants `extendedSingleParentPerMonth` when
 * `profile.adults.length === 1 && profile.childrenAges.length > 0`
 * (src/engine/benefits.ts:16-17). No fixture in `src/tests/fixtures.ts` had a single adult
 * with children before this file, so the branch was uncovered by `npm run check` even though
 * it is worth ~30 000 kr/year.
 *
 * Decision 2026-09-25 (docs/sprint-2026-09.md): mid-year rules are encoded as full-year
 * rates, so the childBenefit rates below apply for the whole year, not pro-rated.
 */
const rs = resolveBaseline(ADOPTED_2026);

describe('computeBenefits', () => {
  it('single parent with one child under 6 and one child from 6 gets the extended rate (Q-006)', () => {
    // src/data/baseline/2026/adopted.ts:259-264 benefit.childBenefit:
    //   under6PerMonth 2 012, from6PerMonth 2 012, ageCutoff 6, extendedSingleParentPerMonth 2 572
    // childrenAges [4, 10]: age 4 < 6 -> under = 1; age 10 >= 6 -> from = 1
    // singleParent = adults.length === 1 && childrenAges.length > 0 -> true -> extended = 2 572
    // annual = 12 * (1 * 2 012 + 1 * 2 012 + 2 572) = 12 * 6 596 = 79 152
    const p = profile({ adults: [adult()], childrenAges: [4, 10] });
    const [cb] = computeBenefits(p, rs);
    expect(cb!.id).toBe('benefit.childBenefit');
    expect(cb!.inputs.barnUnderAldersgrense).toBe(1);
    expect(cb!.inputs.barnOverAldersgrense).toBe(1);
    expect(cb!.inputs.utvidetEnsligPerMnd).toBe(2_572);
    expect(cb!.amount).toBe(79_152);
  });

  it('two adults with the same two children get no extended rate', () => {
    // singleParent is false with two adults -> extended = 0
    // annual = 12 * (1 * 2 012 + 1 * 2 012) = 12 * 4 024 = 48 288
    const p = profile({ mode: 'household', adults: [adult(), adult()], childrenAges: [4, 10] });
    const [cb] = computeBenefits(p, rs);
    expect(cb!.inputs.utvidetEnsligPerMnd).toBe(0);
    expect(cb!.amount).toBe(48_288);
  });
});
