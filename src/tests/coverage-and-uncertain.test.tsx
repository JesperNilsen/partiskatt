// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PartyCard } from '../components/PartyCard.tsx';
import { leftOut, offsetWarnings, partyRuleRows, UNCERTAIN_APPLIED_REASON } from '../components/rule-provenance.ts';
import { DATA_BUNDLE } from '../data/index.ts';
import { calculateParty } from '../engine/index.ts';
import { kr, sum } from '../engine/money.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import type { PartyId, Toggles, UserProfile } from '../types/index.ts';
import { formatSignedKr } from '../utils/format.ts';
import { adult, profile, wealth } from './fixtures.ts';

/**
 * 2026-11-16: uncertain proposals count by default and each card says what they contribute; the
 * coverage label counts everything left out; a card warns when a left-out proposal pulls against
 * a counted one. Before this, Høyre showed a loss for a wage earner because its jobbfradrag was
 * off by default, and MDG's higher wealth-tax allowance showed without the cut in valuation
 * discounts that goes with it.
 */

afterEach(cleanup);

const OFF: Toggles = { ...DEFAULT_TOGGLES, includeUncertain: false };

const wageEarner = profile({ adults: [adult({ wageIncome: kr(650_000) })] });
const sharesOnly = profile({
  adults: [adult({ wageIncome: kr(1_500_000) })],
  wealth: wealth({ listedShares: kr(10_000_000) }),
});
const sharesAndHome = profile({
  adults: [adult({ wageIncome: kr(1_500_000) })],
  wealth: wealth({ listedShares: kr(10_000_000), primaryHomeValue: kr(12_000_000) }),
});

const run = (p: UserProfile, party: PartyId, toggles: Toggles = DEFAULT_TOGGLES) =>
  calculateParty(p, party, DATA_BUNDLE, toggles);

describe('uncertain proposals count by default', () => {
  it('the default toggles include them', () => {
    expect(DEFAULT_TOGGLES.includeUncertain).toBe(true);
  });

  it('H, 650 000 kr wage: the jobbfradrag is in the number, and the result says how much it is', () => {
    const on = run(wageEarner, 'h');
    const off = run(wageEarner, 'h', OFF);
    expect(on.uncertainShare).toBe(4_300);
    expect(on.headline - off.headline).toBe(4_300);
    expect(on.headline).toBeGreaterThan(0);
    expect(off.headline).toBeLessThan(0);
  });

  it('uncertainShare is null with the toggle off and for a party with no uncertain proposal', () => {
    expect(run(wageEarner, 'h', OFF).uncertainShare).toBeNull();
    expect(run(wageEarner, 'r').uncertainShare).toBeNull();
  });

  it('uncertainShare is 0 when the uncertain proposal does not touch the household (SV, no children)', () => {
    expect(run(wageEarner, 'sv').uncertainShare).toBe(0);
  });

  it('an uncertain rule in the number carries the assumption note on its row', () => {
    const rows = partyRuleRows(run(wageEarner, 'h')).applied.filter((r) => r.uncertain);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row.reason).toBe(UNCERTAIN_APPLIED_REASON);
    const certain = partyRuleRows(run(wageEarner, 'h')).applied.filter((r) => !r.uncertain);
    for (const row of certain) expect(row.reason).toBeUndefined();
  });
});

describe('coverage label counts every proposal left out', () => {
  it('H: three unquantified by default; five, no longer all unquantified, with uncertain off', () => {
    expect(leftOut(run(wageEarner, 'h'))).toEqual({ count: 3, allUnquantified: true });
    expect(leftOut(run(wageEarner, 'h', OFF))).toEqual({ count: 5, allUnquantified: false });
  });

  it('the count equals the rows listed under «Ikke medregnet i hovedtallet»', () => {
    for (const toggles of [DEFAULT_TOGGLES, OFF]) {
      for (const party of DATA_BUNDLE.parties) {
        const result = run(sharesAndHome, party.id, toggles);
        expect(leftOut(result).count, party.id).toBe(partyRuleRows(result).excluded.length);
      }
    }
  });
});

describe('warning when a left-out proposal pulls against a counted one', () => {
  it('MDG with taxable wealth: the cut in valuation discounts is flagged against the wealth-tax line', () => {
    const result = run(sharesAndHome, 'mdg');
    const wealthLine = sum(
      result.components.filter((c) => c.formulaId === 'wealth.netWealthTax').map((c) => c.keptDelta),
    );
    expect(wealthLine).toBeGreaterThan(0);
    expect(offsetWarnings(result)).toEqual([
      {
        title: 'Verdsettelsesrabattene i formuesskatten kuttes',
        componentLabel: 'Formuesskatt',
        counted: wealthLine,
      },
    ]);
  });

  it('MDG without wealth: no warning, because the counted line does not move the number', () => {
    expect(offsetWarnings(run(wageEarner, 'mdg'))).toEqual([]);
  });

  it('KrF: flagged only when the home is worth more than 8 mill. kr', () => {
    expect(offsetWarnings(run(sharesAndHome, 'krf')).map((w) => w.title)).toEqual([
      'Boliger med verdi over 8 mill. kr verdsettes med 100 pst.',
    ]);
    expect(offsetWarnings(run(sharesOnly, 'krf'))).toEqual([]);
  });

  it('every offsets reference names a component the engine produces', () => {
    const produced = new Set(run(sharesAndHome, 'ap').components.map((c) => c.formulaId));
    for (const party of DATA_BUNDLE.parties) {
      for (const u of party.unquantified) {
        if (u.offsets) expect(produced.has(u.offsets.component), `${party.id}: ${u.title}`).toBe(true);
      }
    }
  });
});

describe('PartyCard shows it', () => {
  it('H card: label, the uncertain share line, and «regler» spelled right', () => {
    const { container } = render(<PartyCard result={run(wageEarner, 'h')} rank={1} expanded onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: /3 forslag fra H er ikke tallfestet/ }).textContent).toBe(
      '3 forslag ikke tallfestet',
    );
    expect(container.querySelector('.party-card__uncertain')?.textContent).toBe(
      `Av dette: ${formatSignedKr(kr(4_300))} kr/år fra usikre forslag, som bygger på en antagelse.`,
    );
    expect(container.querySelector('.party-card__meta')?.textContent).toContain('6 regler inngår i beregningen');
    expect(container.textContent).not.toContain('regeler');
  });

  it('H card with uncertain off: the label counts all five and no share line is shown', () => {
    const { container } = render(<PartyCard result={run(wageEarner, 'h', OFF)} rank={9} />);
    expect(screen.getByRole('button', { name: '5 forslag fra H er ikke med i hovedtallet. Vis dem.' }).textContent).toBe(
      '5 forslag ikke medregnet',
    );
    expect(container.querySelector('.party-card__uncertain')).toBeNull();
  });

  it('MDG card with wealth: the incomplete-number note is visible on the collapsed card', () => {
    render(<PartyCard result={run(sharesAndHome, 'mdg')} rank={1} />);
    const note = screen.getByRole('note');
    expect(note.textContent).toContain('Ufullstendig tall.');
    expect(note.textContent).toContain('Endringen i formuesskatt er regnet med');
    expect(note.textContent).toContain('«Verdsettelsesrabattene i formuesskatten kuttes» trekker motsatt vei');
  });

  it('a card with nothing to flag has no note', () => {
    render(<PartyCard result={run(wageEarner, 'mdg')} rank={6} />);
    expect(screen.queryByRole('note')).toBeNull();
  });
});
