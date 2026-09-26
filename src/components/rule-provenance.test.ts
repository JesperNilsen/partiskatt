import { describe, expect, it } from 'vitest';
import { SYNTHETIC_PROVENANCE } from '../tests/synthetic-rules.ts';
import { effectiveDateNote } from './rule-provenance.ts';

describe('effectiveDateNote (mid-year rules, decision 1 2026-09-25)', () => {
  it('is undefined for a rule effective at the start of the year (the default)', () => {
    expect(SYNTHETIC_PROVENANCE.effectiveDate).toBe('2026-01-01');
    expect(effectiveDateNote(SYNTHETIC_PROVENANCE)).toBeUndefined();
  });

  it('is undefined when there is no provenance to read a date from', () => {
    expect(effectiveDateNote(null)).toBeUndefined();
  });

  it('names the Norwegian date and the full-year framing for a mid-year rule', () => {
    const midYear = { ...SYNTHETIC_PROVENANCE, effectiveDate: '2026-03-01' };
    expect(effectiveDateNote(midYear)).toBe('gjelder fra 1. mars; vist som helårseffekt');
  });

  it('is driven by the date, not a fixed month name', () => {
    const august = { ...SYNTHETIC_PROVENANCE, effectiveDate: '2026-08-01' };
    expect(effectiveDateNote(august)).toBe('gjelder fra 1. august; vist som helårseffekt');
  });
});
