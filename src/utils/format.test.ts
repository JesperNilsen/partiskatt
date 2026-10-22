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

  it('builds neutral, symmetric headlines', () => {
    expect(headlinePhrase(kr(8430), 'H')).toBe('Med H har du 8\u00a0430 kroner mer igjen i året.');
    expect(headlinePhrase(kr(-12700), 'SV')).toBe('Med SV har du 12\u00a0700 kroner mindre igjen i året.');
    // A gain and a loss differ only in «mer» / «mindre»: no outcome gets a loaded word of its own.
    expect(headlinePhrase(kr(-500), 'X').replace('mindre', 'mer')).toBe(headlinePhrase(kr(500), 'X'));
    expect(headlinePhrase(kr(0), 'V')).toBe('V gir samme resultat som referansen.');
  });
});
