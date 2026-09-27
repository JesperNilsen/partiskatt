// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { calculateAll } from '../engine/index.ts';
import { DATA_BUNDLE } from '../data/index.ts';
import { adult, FIXTURES, profile } from '../tests/fixtures.ts';
import { kr, toKroner } from '../engine/money.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import type { PartyResult } from '../types/index.ts';
import { PartyCard, topReasons } from './PartyCard.tsx';
import { formatSignedKr } from '../utils/format.ts';

afterEach(cleanup);

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

/** li whose `.rule-row__title` equals `title` (there are two lists, applied and excluded). */
function ruleRow(title: string): HTMLElement {
  const row = screen.getByText(title, { selector: '.rule-row__title' }).closest('li');
  if (!row) throw new Error(`no row for ${title}`);
  return row;
}

describe('"i 2026" line (D2, 2026-09-27)', () => {
  it('Sp: food VAT (1 September) shows the note and an "i 2026" figure at 4/12 of the annual delta', () => {
    const household = FIXTURES.twoEarnersTwoKids!;
    const results = calculateAll(household, DEFAULT_TOGGLES, DATA_BUNDLE);
    const sp = results.find((r) => r.party === 'sp');
    if (!sp) throw new Error('sp missing');
    const foodVat = sp.components.filter((c) => c.formulaId === 'vat.food');
    expect(foodVat.length).toBeGreaterThan(0);
    const annual = foodVat.reduce((s, c) => s + c.keptDelta, 0);
    expect(annual).not.toBe(0);
    const expectedMidYear = toKroner(annual * (4 / 12));

    render(<PartyCard result={sp} rank={1} expanded />);
    const row = ruleRow('Merverdiavgift næringsmidler 10 pst. fra 1. september 2026');
    const note = within(row).getByText(/gjelder fra 1\. september/, { selector: '.rule-row__effective' });
    expect(note.textContent).toBe(
      `gjelder fra 1. september; hovedtallet viser helårseffekt — i 2026: ${formatSignedKr(expectedMidYear)} kr`,
    );
  });

  it('a rule effective 1 January shows no "i 2026" line at all', () => {
    const household = FIXTURES.twoEarnersTwoKids!;
    const results = calculateAll(household, DEFAULT_TOGGLES, DATA_BUNDLE);
    const sp = results.find((r) => r.party === 'sp');
    if (!sp) throw new Error('sp missing');

    render(<PartyCard result={sp} rank={1} expanded />);
    // Sp's wealth-tax allowance rule is effective 1 January (the data-model default).
    const row = ruleRow('Bunnfradrag i formuesskatten 2 mill. kr (4 mill. kr for ektepar)');
    expect(row.querySelector('.rule-row__effective')).toBeNull();
  });

  it('SV: student support (1 August) uses 5/11 of the annual delta', () => {
    const studentHousehold = profile({
      adults: [adult({ wageIncome: kr(150_000), isStudent: true, studyMonths: 10 })],
    });
    const results = calculateAll(studentHousehold, DEFAULT_TOGGLES, DATA_BUNDLE);
    const sv = results.find((r) => r.party === 'sv');
    if (!sv) throw new Error('sv missing');
    const support = sv.components.filter((c) => c.formulaId === 'benefit.studentSupport');
    const annual = support.reduce((s, c) => s + c.keptDelta, 0);
    expect(annual).not.toBe(0);
    const expectedMidYear = toKroner(annual * (5 / 11));

    render(<PartyCard result={sv} rank={1} expanded />);
    const row = ruleRow('Studiestøtte: basisstøtte 16 686 kr/mnd i studieåret 2026–2027');
    const note = within(row).getByText(/gjelder fra 1\. august/, { selector: '.rule-row__effective' });
    expect(note.textContent).toBe(
      `gjelder fra 1. august; hovedtallet viser helårseffekt — i 2026: ${formatSignedKr(expectedMidYear)} kr`,
    );
  });
});

describe('coverage chip: "n forslag ikke tallfestet" (D3, 2026-09-27)', () => {
  function resultFor(party: string) {
    const r = calculateAll(FIXTURES.medianSingle!, DEFAULT_TOGGLES, DATA_BUNDLE).find((x) => x.party === party);
    if (!r) throw new Error(`no result for ${party}`);
    return r;
  }

  it('shows the right count for two different parties', () => {
    const sp = resultFor('sp');
    const r = resultFor('r');
    const spRender = render(<PartyCard result={sp} rank={1} />);
    expect(spRender.getByRole('button', { name: /forslag/ }).textContent).toBe('4 forslag ikke tallfestet');
    spRender.unmount();

    const rRender = render(<PartyCard result={r} rank={2} />);
    expect(rRender.getByRole('button', { name: /forslag/ }).textContent).toBe('6 forslag ikke tallfestet');
    rRender.unmount();
  });

  it('is absent for Ap (nothing unquantified)', () => {
    const ap = resultFor('ap');
    render(<PartyCard result={ap} rank={1} />);
    expect(screen.queryByText(/forslag ikke tallfestet/)).toBeNull();
  });

  it('clicking the chip expands the card and moves focus to the excluded list', () => {
    function Wrapper({ result }: { result: PartyResult }) {
      const [expanded, setExpanded] = useState(false);
      return (
        <PartyCard result={result} rank={1} expanded={expanded} onToggle={() => setExpanded((cur) => !cur)} />
      );
    }
    const sp = resultFor('sp');
    render(<Wrapper result={sp} />);

    expect(screen.queryByRole('heading', { name: 'Ikke medregnet i hovedtallet' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^\d+ forslag/ }));

    const heading = screen.getByRole('heading', { name: 'Ikke medregnet i hovedtallet' });
    expect(document.body.contains(heading)).toBe(true);
  });
});
