import { describe, expect, it } from 'vitest';
import { SYNTHETIC_PROVENANCE } from '../tests/synthetic-rules.ts';
import { effectiveDateNote, midYearShare } from './rule-provenance.ts';

describe('effectiveDateNote (mid-year rules, decision 1 2026-09-25; D2 2026-09-27)', () => {
  it('is undefined for a rule effective at the start of the year (the default)', () => {
    expect(SYNTHETIC_PROVENANCE.effectiveDate).toBe('2026-01-01');
    expect(effectiveDateNote(SYNTHETIC_PROVENANCE)).toBeUndefined();
  });

  it('is undefined when there is no provenance to read a date from', () => {
    expect(effectiveDateNote(null)).toBeUndefined();
  });

  it('names the Norwegian date and the full-year framing for a mid-year rule', () => {
    const midYear = { ...SYNTHETIC_PROVENANCE, effectiveDate: '2026-03-01' };
    expect(effectiveDateNote(midYear)).toBe('gjelder fra 1. mars; hovedtallet viser helårseffekt');
  });

  it('is driven by the date, not a fixed month name', () => {
    const august = { ...SYNTHETIC_PROVENANCE, effectiveDate: '2026-08-01' };
    expect(effectiveDateNote(august)).toBe('gjelder fra 1. august; hovedtallet viser helårseffekt');
  });
});

describe('midYearShare (D2 2026-09-27: the "i 2026" fraction)', () => {
  it('calendar rule: (13 − month) / 12 from the 1st, e.g. 1 September → 4/12', () => {
    expect(midYearShare('vat.food', '2026-09-01')).toBeCloseTo(4 / 12, 10);
  });

  it('calendar rule: 1 January is the whole year (12/12)', () => {
    expect(midYearShare('vat.food', '2026-01-01')).toBeCloseTo(1, 10);
  });

  it('benefit.studentSupport follows the disbursement calendar (11 months, no July): 1 August → 5/11', () => {
    expect(midYearShare('benefit.studentSupport', '2026-08-01')).toBeCloseTo(5 / 11, 10);
  });

  it('benefit.studentSupport: 1 February → 10/11 (Feb–Jun = 5, Aug–Dec = 5)', () => {
    expect(midYearShare('benefit.studentSupport', '2026-02-01')).toBeCloseTo(10 / 11, 10);
  });

  it('a date that is not the 1st is prorated by days, not whole months', () => {
    // 15 September 2026 through 31 December inclusive = 108 days, out of 365 (2026 is not a leap year).
    expect(midYearShare('vat.food', '2026-09-15')).toBeCloseTo(108 / 365, 10);
  });
});
