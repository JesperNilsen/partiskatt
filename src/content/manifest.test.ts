import { describe, expect, it } from 'vitest';
import { groupManifest, SOURCE_MANIFEST } from './manifest.ts';

describe('SOURCE_MANIFEST', () => {
  it('loads archived primary sources', () => {
    expect(SOURCE_MANIFEST.length).toBeGreaterThan(0);
    expect(SOURCE_MANIFEST.some((e) => e.id === 'lovdata-skattevedtak-2026')).toBe(true);
  });
});

describe('groupManifest', () => {
  it('separates baseline, party budgets and blocked entries', () => {
    const groups = groupManifest(SOURCE_MANIFEST);
    expect(groups.baseline.length).toBeGreaterThan(0);
    expect(groups.partyBudgets.length).toBe(9);
    expect(groups.blocked.every((e) => e.status === 'blocked')).toBe(true);
    expect(groups.partyBudgets.some((e) => e.party === 'H')).toBe(true);
  });
});
