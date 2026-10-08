import { describe, expect, it } from 'vitest';
import { FIXTURES, adult, profile } from '../tests/fixtures.ts';
import { OMISSIONS, omissionsFor } from './omissions.ts';

const ids = (p: Parameters<typeof omissionsFor>[0]) => omissionsFor(p).map((o) => o.id);

describe('omissions', () => {
  it('every omission has a unique id, a label and a caveat that says something', () => {
    expect(new Set(OMISSIONS.map((o) => o.id)).size).toBe(OMISSIONS.length);
    for (const o of OMISSIONS) {
      expect(o.label.trim().length).toBeGreaterThan(3);
      expect(o.caveat.trim().length).toBeGreaterThan(30);
    }
  });

  it('profile-specific caveats appear only when they apply, in both directions', () => {
    const wageOnly = ids(FIXTURES.medianSingle!);
    expect(wageOnly).not.toContain('graded-pension');
    expect(wageOnly).not.toContain('tax-limitation');
    expect(wageOnly).not.toContain('wage-and-pension');
    expect(wageOnly).not.toContain('cohabitant-ownership');
    expect(wageOnly).not.toContain('student-months');
    expect(ids(FIXTURES.highPensioner!)).toEqual(expect.arrayContaining(['graded-pension', 'tax-limitation']));
    expect(ids(FIXTURES.highPensioner!)).not.toContain('wage-and-pension');
    expect(ids(profile({ adults: [adult({ wageIncome: 400_000 as never, pensionIncome: 100_000 as never })] }))).toContain('wage-and-pension');
    expect(ids(FIXTURES.student!)).toContain('student-months');
    expect(ids(FIXTURES.twoEarnersTwoKids!)).toContain('cohabitant-ownership');
  });

  it('the always-on caveats reach everyone', () => {
    for (const p of Object.values(FIXTURES)) {
      expect(ids(p)).toEqual(expect.arrayContaining(['public-services', 'dynamic-effects', 'mid-year-rules']));
    }
  });
});
