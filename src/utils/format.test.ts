import { describe, expect, it } from 'vitest';
import { kr } from '../engine/money.ts';
import { formatKr, formatSignedKr, headlinePhrase } from './format.ts';

describe('format', () => {
  it('formats whole kroner with grouping', () => {
    expect(formatKr(kr(8430))).toBe('8\u00a0430');
  });

  it('formats signed deltas', () => {
    expect(formatSignedKr(kr(1200))).toBe('+1\u00a0200');
    expect(formatSignedKr(kr(-500))).toBe('−500');
    expect(formatSignedKr(kr(0))).toBe('0');
  });

  it('builds tabloid headlines', () => {
    expect(headlinePhrase(kr(8430), 'H')).toContain('8\u00a0430');
    expect(headlinePhrase(kr(-12700), 'SV')).toContain('Skattesmellen');
  });
});
