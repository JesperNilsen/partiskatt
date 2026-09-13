import { describe, expect, it } from 'vitest';
import { calculateAll, calculateParty, compareScenarios, computeScenario, sanitizeProfile } from '../engine/index.ts';
import { kr, pct } from '../engine/money.ts';
import type { DataBundle } from '../engine/resolve.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import type { DataStatus, PartyRuleSet, Toggles } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { FIXTURES } from './fixtures.ts';
import { ADOPTED_2026 } from '../data/baseline/2026/adopted.ts';
import { AP_EMPTY, SYNTHETIC_PROPOSED, rule } from './synthetic-rules.ts';

const adopted = resolveBaseline(ADOPTED_2026);
const fixtures = Object.entries(FIXTURES);

function bundle(...parties: PartyRuleSet[]): DataBundle {
  return { proposed: SYNTHETIC_PROPOSED, adopted: ADOPTED_2026, parties: [AP_EMPTY, ...parties] };
}

describe('scenario invariants', () => {
  it.each(fixtures)('%s: components sum to net, every amount is a non-negative safe integer', (_name, p) => {
    const s = computeScenario(sanitizeProfile(p), adopted, adopted);
    let net = 0;
    for (const c of s.components) {
      expect(Number.isSafeInteger(c.amount)).toBe(true);
      expect(c.amount).toBeGreaterThanOrEqual(0);
      if (c.category !== 'employer') net += c.direction === 'received' ? c.amount : -c.amount;
    }
    expect(s.net).toBe(net);
  });

  it.each(fixtures)('%s: component ids are unique', (_name, p) => {
    const s = computeScenario(sanitizeProfile(p), adopted, adopted);
    expect(new Set(s.components.map((c) => c.id)).size).toBe(s.components.length);
  });

  it.each(fixtures)('%s: comparing a scenario with itself is all zero', (_name, p) => {
    const s = computeScenario(sanitizeProfile(p), adopted, adopted);
    for (const d of compareScenarios(s, s)) expect(d.keptDelta).toBe(0);
  });

  it.each(fixtures)('%s: Ap is 0 by construction', (_name, p) => {
    const r = calculateParty(p, 'ap', bundle(), DEFAULT_TOGGLES);
    expect(r.headline).toBe(0);
    expect(r.monthly).toBe(0);
    expect(r.appliedRuleCount).toBe(0);
    expect(r.excluded).toHaveLength(0);
  });
});

describe('party overlay and headline gate', () => {
  const higherAllowance = (overrides: { status?: DataStatus; uncertain?: boolean } = {}) =>
    rule('income.personalAllowance', { amount: kr(124_540) }, { label: 'Personfradrag 124 540', ...overrides });
  const party = (deltas: PartyRuleSet['deltas']): PartyRuleSet => ({
    id: 'h',
    year: 2026,
    base: 'proposed',
    deltas,
    reviewed: {},
    unquantified: [],
  });

  it('a confirmed change to personfradrag is worth exactly 22 % of the increase', () => {
    const r = calculateParty(FIXTURES.medianSingle!, 'h', bundle(party([higherAllowance()])), DEFAULT_TOGGLES);
    expect(r.headline).toBe(2_200);
    expect(r.monthly).toBe(183);
    expect(r.byGroup).toEqual({ direct: 2_200, consumption: 0, benefit: 0 });
    expect(r.appliedRuleCount).toBe(1);
    expect(r.employerDelta).toBeNull();
    const c = r.components.find((d) => d.formulaId === 'income.generalRate');
    expect(c?.keptDelta).toBe(2_200);
    expect(c?.inputsAlt.personfradrag).toBe(124_540);
  });

  it.each(['not-reviewed', 'unquantified', 'not-applicable'] as const)('status %s is excluded from the headline', (status) => {
    const r = calculateParty(FIXTURES.medianSingle!, 'h', bundle(party([higherAllowance({ status })])), DEFAULT_TOGGLES);
    expect(r.headline).toBe(0);
    expect(r.appliedRuleCount).toBe(0);
    expect(r.excluded).toHaveLength(1);
    expect(r.excluded[0]?.status).toBe(status);
  });

  it('uncertain rules need the toggle', () => {
    const data = bundle(party([higherAllowance({ uncertain: true })]));
    expect(calculateParty(FIXTURES.medianSingle!, 'h', data, DEFAULT_TOGGLES).headline).toBe(0);
    const on: Toggles = { ...DEFAULT_TOGGLES, includeUncertain: true };
    expect(calculateParty(FIXTURES.medianSingle!, 'h', data, on).headline).toBe(2_200);
  });

  it('employer contribution never touches the headline and only shows with the toggle', () => {
    const cheaper = rule(
      'employer.contribution',
      { rateBp: pct(13.1), extraRateBp: pct(0), extraThreshold: kr(850_000) },
      { label: 'AGA 13,1 %' },
    );
    const data = bundle(party([cheaper]));
    const off = calculateParty(FIXTURES.medianSingle!, 'h', data, DEFAULT_TOGGLES);
    expect(off.headline).toBe(0);
    expect(off.employerDelta).toBeNull();
    expect(off.excluded).toHaveLength(1);
    expect(off.components.some((d) => d.group === 'employer')).toBe(false);
    const on = calculateParty(FIXTURES.medianSingle!, 'h', data, { ...DEFAULT_TOGGLES, includeEmployerContribution: true });
    expect(on.headline).toBe(0);
    // 600 000 × (14,1 % − 13,1 %) = 6 000 less paid by the employer.
    expect(on.employerDelta).toBe(6_000);
    expect(on.components.some((d) => d.group === 'employer')).toBe(true);
  });

  it('unquantified proposals are listed, never summed', () => {
    const p: PartyRuleSet = {
      ...party([]),
      unquantified: [
        {
          category: 'direct-tax',
          title: 'Fjerne formuesskatt på arbeidende kapital',
          status: 'unquantified',
          reason: 'Ingen sats i dokumentet.',
          provenance: ADOPTED_2026.rules[0]!.provenance,
        },
      ],
    };
    const r = calculateParty(FIXTURES.homeownerWithWealth!, 'h', bundle(p), DEFAULT_TOGGLES);
    expect(r.headline).toBe(0);
    expect(r.excluded.map((e) => e.status)).toEqual(['unquantified']);
  });

  it('calculateAll sorts best headline first and includes every party in the bundle', () => {
    const rich = party([higherAllowance()]);
    const worse: PartyRuleSet = {
      ...party([rule('income.personalAllowance', { amount: kr(104_540) }, { label: 'Personfradrag 104 540' })]),
      id: 'frp',
    };
    const all = calculateAll(FIXTURES.medianSingle!, DEFAULT_TOGGLES, bundle(rich, worse));
    expect(all.map((r) => r.party)).toEqual(['h', 'ap', 'frp']);
    expect(all.map((r) => r.headline)).toEqual([2_200, 0, -2_200]);
  });
});
