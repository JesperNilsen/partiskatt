import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { wealth } from '../tests/fixtures.ts';
import { kr } from './money.ts';
import { resolveBaseline } from './resolve.ts';
import { computeWealthTax } from './wealth-tax.ts';

/**
 * Q-007: nothing pins down the pro-rata debt allocation across asset classes, or the
 * per-class discount applied to it, in `computeWealthTax` (src/engine/wealth-tax.ts:33-47).
 * `src/tests/invariants.test.ts` only checks that components sum to `net`, which is blind to
 * an internal formula error here (e.g. allocating debt by net instead of gross value, or
 * discounting the wrong classes) as long as the total still balances.
 */
const rs = resolveBaseline(ADOPTED_2026);

describe('computeWealthTax', () => {
  it('allocates debt pro rata across classes and discounts it per class (Q-007)', () => {
    // src/data/baseline/2026/adopted.ts:161-170 wealth.valuation:
    //   primaryHomeBp 25 % (below the 14M threshold), secondaryHomeBp 100 %,
    //   listedSharesBp 80 %, bankDepositsBp 100 %, otherBp 70 %
    //   debtReductionApplies: secondaryHome false, listedShares true, other true
    // src/data/baseline/2026/adopted.ts:150-159 wealth.netWealthTax (single):
    //   allowance 1 900 000, tier2Threshold 21 500 000, tier1RateBp 1 %, tier2RateBp 1.1 %
    const w = wealth({
      primaryHomeValue: kr(2_000_000),
      secondaryHomeValue: kr(3_000_000),
      listedShares: kr(5_000_000),
      bankDeposits: kr(1_000_000),
      otherTaxableWealth: kr(2_000_000),
      debt: kr(6_000_000),
    });

    // taxableAssets = 2 000 000*25% + 3 000 000*100% + 5 000 000*80% + 1 000 000*100% + 2 000 000*70%
    //              =    500 000    +   3 000 000    +   4 000 000    +   1 000 000    +   1 400 000
    //              = 9 900 000
    // grossAssets (undiscounted, for the pro-rata split) = 2 000 000+3 000 000+5 000 000+1 000 000+2 000 000
    //            = 13 000 000
    //
    // Debt reduction only applies to listedShares and other (secondaryHome's flag is false):
    //   listedShares: allocated = round(6 000 000 * 5 000 000 / 13 000 000) = round(2 307 692.31) = 2 307 692
    //                 reduction = allocated - round(allocated * 80%) = 2 307 692 - round(1 846 153.6)
    //                           = 2 307 692 - 1 846 154 = 461 538
    //   other:        allocated = round(6 000 000 * 2 000 000 / 13 000 000) = round(923 076.92) = 923 077
    //                 reduction = allocated - round(allocated * 70%) = 923 077 - round(646 153.9)
    //                           = 923 077 - 646 154 = 276 923
    //   gjeldsreduksjon = 461 538 + 276 923 = 738 461
    //
    // deductibleDebt = 6 000 000 - 738 461 = 5 261 539
    // nettoformue = 9 900 000 - 5 261 539 = 4 638 461
    //
    // tier1Base = min(max(0, 4 638 461 - 1 900 000), max(0, 21 500 000 - 1 900 000))
    //           = min(2 738 461, 19 600 000) = 2 738 461
    // tier2Base = max(0, 4 638 461 - 21 500 000) = 0
    // amount = round(2 738 461 * 1%) + round(0 * 1.1%) = round(27 384.61) = 27 385
    const c = computeWealthTax(w, 1, rs);
    expect(c.inputs.skattepliktigFormue).toBe(9_900_000);
    expect(c.inputs.bruttoformue).toBe(13_000_000);
    expect(c.inputs.gjeldsreduksjon).toBe(738_461);
    expect(c.inputs.nettoformue).toBe(4_638_461);
    expect(c.amount).toBe(27_385);
  });
});
