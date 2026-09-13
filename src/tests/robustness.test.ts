import { describe, expect, it } from 'vitest';
import { calculateAll, sanitizeProfile } from '../engine/index.ts';
import type { DataBundle } from '../engine/resolve.ts';
import type { UserProfile } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { FIXTURES, profile } from './fixtures.ts';
import { AP_EMPTY, SYNTHETIC, SYNTHETIC_PROPOSED } from './synthetic-rules.ts';

const data: DataBundle = { proposed: SYNTHETIC_PROPOSED, adopted: SYNTHETIC, parties: [AP_EMPTY] };

function everyNumberIsFinite(value: unknown): boolean {
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(everyNumberIsFinite);
  if (value && typeof value === 'object') return Object.values(value).every(everyNumberIsFinite);
  return true;
}

describe('input robustness', () => {
  const garbage = [
    { name: 'NaN wages', p: profile({ adults: [{ ...FIXTURES.medianSingle!.adults[0], wageIncome: Number.NaN as never }] }) },
    { name: 'negative wealth', p: profile({ wealth: { ...FIXTURES.medianSingle!.wealth, debt: -5 as never } }) },
    { name: 'Infinity spend', p: profile({ consumption: { ...FIXTURES.student!.consumption, spend: { ...FIXTURES.student!.consumption.spend, food: Number.POSITIVE_INFINITY as never } } }) },
    { name: 'absurd wages', p: profile({ adults: [{ ...FIXTURES.medianSingle!.adults[0], wageIncome: 1e300 as never }] }) },
    { name: 'string fields', p: { ...profile(), adults: [{ wageIncome: '600000', studyMonths: '3', isStudent: 'yes' }] } as unknown as UserProfile },
    { name: 'missing nested objects', p: { version: 1, mode: 'person', adults: [{}] } as unknown as UserProfile },
    { name: 'children out of range', p: profile({ childrenAges: [-3, 2.6, 40, Number.NaN] }) },
    { name: 'study months out of range', p: profile({ adults: [{ ...FIXTURES.student!.adults[0], studyMonths: 99 }] }) },
  ];

  it.each(garbage)('$name never throws and never yields a non-finite number', ({ p }) => {
    const results = calculateAll(p, DEFAULT_TOGGLES, data);
    expect(results).toHaveLength(1);
    expect(everyNumberIsFinite(results)).toBe(true);
    for (const r of results) expect(Number.isSafeInteger(r.headline)).toBe(true);
  });

  it('sanitizeProfile clamps and coerces', () => {
    const p = sanitizeProfile({ ...profile(), childrenAges: [-3, 2.6, 40, Number.NaN], adults: [{ ...FIXTURES.student!.adults[0], studyMonths: 99 }] });
    expect(p.childrenAges).toEqual([3]);
    expect(p.adults[0].studyMonths).toBe(11);
    const s = sanitizeProfile({ ...profile(), adults: [{ wageIncome: '600000', isStudent: 'yes' }] } as unknown as UserProfile);
    expect(s.adults[0].wageIncome).toBe(600_000);
    expect(s.adults[0].isStudent).toBe(false);
  });
});
