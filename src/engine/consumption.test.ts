import { describe, expect, it } from 'vitest';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { consumption } from '../tests/fixtures.ts';
import { computeConsumptionTaxes } from './consumption.ts';
import { resolveBaseline } from './resolve.ts';

/**
 * Direct engine test for `computeConsumptionTaxes`, called with an explicit `Consumption`
 * input rather than through a seeded `ConsumptionProfileId` — lane L1 is changing the
 * `PROFILE_SEEDS` in parallel, so a profile-seed-based test here would be a merge hazard.
 */
const rs = resolveBaseline(ADOPTED_2026);

describe('computeConsumptionTaxes', () => {
  it('one outside-Europe flight is a flat 350 kr duty with no VAT added on top', () => {
    // src/data/baseline/2026/adopted.ts:220-222 excise.flightOther: ratePerUnit 350 kr/unit
    // src/engine/formulas.ts VAT_ON_EXCISE.flightOther === null -> no VAT is layered on the duty
    // excise = 1 unit * 350 kr/unit = 350; vatOnExcise = 0 (no VAT category); amount = 350 + 0 = 350
    const c = consumption({}, { flightOther: 1 });
    const components = computeConsumptionTaxes(c, rs, rs);
    const duty = components.find((x) => x.id === 'excise.flightOther');
    expect(duty).toBeDefined();
    expect(duty!.inputs.mengde).toBe(1);
    expect(duty!.inputs.avgift).toBe(350);
    expect(duty!.inputs.mvaPaaAvgiftBp).toBe(0);
    expect(duty!.inputs.mvaPaaAvgift).toBe(0);
    expect(duty!.amount).toBe(350);

    // No other spend or units were set, so every other component is zero.
    for (const other of components) {
      if (other.id === 'excise.flightOther') continue;
      expect(other.amount).toBe(0);
    }
  });
});
