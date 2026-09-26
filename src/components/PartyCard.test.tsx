// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { calculateAll } from '../engine/index.ts';
import { DATA_BUNDLE } from '../data/index.ts';
import { adult, profile } from '../tests/fixtures.ts';
import { kr } from '../engine/money.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { PartyCard, topReasons } from './PartyCard.tsx';
import { formatSignedKr } from '../utils/format.ts';

describe('PartyCard', () => {
  it('shows reference note for Ap and ranks headline', () => {
    const results = calculateAll(
      profile({ adults: [adult({ wageIncome: kr(600_000) })] }),
      DEFAULT_TOGGLES,
      DATA_BUNDLE,
    );
    const ap = results.find((r) => r.party === 'ap');
    expect(ap).toBeDefined();
    if (!ap) return;

    render(<PartyCard result={ap} rank={5} />);
    expect(screen.getByText(/Referanseparti/i)).toBeTruthy();
  });
});

describe('topReasons', () => {
  it('sums per-adult components into one line per label (no duplicate lines)', () => {
    const results = calculateAll(
      profile({ adults: [adult({ wageIncome: kr(600_000) }), adult({ wageIncome: kr(600_000) })] }),
      DEFAULT_TOGGLES,
      DATA_BUNDLE,
    );
    const sv = results.find((r) => r.party === 'sv');
    if (!sv) throw new Error('sv missing');
    const perAdult = sv.components.filter((c) => c.id.startsWith('income.generalRate#'));
    expect(perAdult.length).toBe(2);
    const lines = topReasons(sv);
    expect(new Set(lines).size).toBe(lines.length);
    const label = perAdult[0]?.label;
    const total = perAdult.reduce((s, c) => s + c.keptDelta, 0);
    expect(lines).toContain(`${label}: ${formatSignedKr(kr(total))} kr`);
  });
});
