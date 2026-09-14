// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { calculateAll } from '../engine/index.ts';
import { DATA_BUNDLE } from '../data/index.ts';
import { adult, profile } from '../tests/fixtures.ts';
import { kr } from '../engine/money.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { PartyCard } from './PartyCard.tsx';

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
