// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DATA_BUNDLE } from '../data/index.ts';
import type { DataBundle } from '../engine/index.ts';
import { calculateAll } from '../engine/index.ts';
import { kr, pct } from '../engine/money.ts';
import { toggleEffects, toggleSummary } from '../state/toggle-effects.ts';
import { adult, profile, wealth } from '../tests/fixtures.ts';
import { AP_EMPTY, SYNTHETIC, SYNTHETIC_PROPOSED, rule } from '../tests/synthetic-rules.ts';
import type { AnyRule, PartyRuleSet, Toggles } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { ScenarioToggles } from './ScenarioToggles.tsx';

afterEach(cleanup);

function party(deltas: AnyRule[]): PartyRuleSet {
  return { id: 'sv', year: 2026, base: 'proposed', deltas, reviewed: {}, unquantified: [] };
}

function bundle(deltas: AnyRule[]): DataBundle {
  return { proposed: SYNTHETIC_PROPOSED, adopted: SYNTHETIC, parties: [AP_EMPTY, party(deltas)] };
}

const plainDelta = rule('income.generalRate', { rateBp: pct(23) }, { status: 'estimated' });
const uncertainDelta = rule('income.generalRate', { rateBp: pct(23) }, { status: 'estimated', uncertain: true });
const employerDelta = rule(
  'employer.contribution',
  { rateBp: pct(12), extraRateBp: pct(5), extraThreshold: kr(850_000) },
  { status: 'estimated' },
);

function renderToggles(data: DataBundle | null, initial: Toggles = DEFAULT_TOGGLES) {
  const state = { toggles: initial };
  render(
    <ScenarioToggles
      bundle={data}
      toggles={initial}
      setToggles={(update) => {
        state.toggles = update(state.toggles);
      }}
    />,
  );
  return {
    state,
    uncertain: screen.getByLabelText(/Ta med usikre forslag/) as HTMLInputElement,
    employer: screen.getByLabelText(/Vis arbeidsgiveravgift/) as HTMLInputElement,
  };
}

describe('ScenarioToggles: disabled with a reason only when no loaded rule is affected', () => {
  it('synthetic data with no uncertain and no employer rule: both disabled, each with its reason', () => {
    const { uncertain, employer } = renderToggles(bundle([plainDelta]));
    expect(uncertain.disabled).toBe(true);
    expect(employer.disabled).toBe(true);
    expect(uncertain.getAttribute('aria-describedby')).toBe('toggle-uncertain-note');
    expect(screen.getByText(/Ingen regler i datagrunnlaget er merket usikre/)).toBeTruthy();
    expect(screen.getByText(/Ingen partier i datagrunnlaget endrer arbeidsgiveravgiften/)).toBeTruthy();
  });

  it('an uncertain rule that cannot enter the arithmetic (unquantified) does not enable the toggle', () => {
    const { uncertain } = renderToggles(bundle([{ ...uncertainDelta, status: 'unquantified' }]));
    expect(uncertain.disabled).toBe(true);
  });

  it('synthetic uncertain + employer rules: both enabled, and they dispatch', () => {
    const { uncertain, employer, state } = renderToggles(bundle([uncertainDelta, employerDelta]));
    expect(uncertain.disabled).toBe(false);
    expect(employer.disabled).toBe(false);
    expect(screen.getByText('Gjelder 1 regel merket usikre (SV).')).toBeTruthy();
    fireEvent.click(uncertain);
    fireEvent.click(employer);
    expect(state.toggles).toEqual({ includeUncertain: true, includeEmployerContribution: true });
  });

  it('while data loads (null) nothing is disabled and no note is shown', () => {
    const { uncertain, employer } = renderToggles(null);
    expect(uncertain.disabled).toBe(false);
    expect(employer.disabled).toBe(false);
    expect(document.querySelector('.scenario-toggle__note')).toBeNull();
  });
});

describe('ScenarioToggles with the loaded data (DATA_BUNDLE)', () => {
  const effects = toggleEffects(DATA_BUNDLE);

  it('«usikre forslag» is enabled: FrP, H and SV each carry an uncertain rule', () => {
    const { uncertain } = renderToggles(DATA_BUNDLE);
    expect(uncertain.disabled).toBe(false);
    expect(effects.includeUncertain.parties).toEqual(['h', 'frp', 'sv']);
    expect(effects.includeUncertain.ruleCount).toBe(3);
  });

  it('the enabled uncertain toggle really moves a result', () => {
    const rich = profile({
      mode: 'household',
      adults: [adult({ wageIncome: kr(700_000) }), adult({ wageIncome: kr(600_000) })],
      childrenAges: [3, 8],
      wealth: wealth({ bankDeposits: kr(40_000_000) }),
    });
    const off = calculateAll(rich, DEFAULT_TOGGLES, DATA_BUNDLE);
    const on = calculateAll(rich, { ...DEFAULT_TOGGLES, includeUncertain: true }, DATA_BUNDLE);
    // Every listed party gets its uncertain rule applied when the toggle is on …
    for (const id of effects.includeUncertain.parties) {
      const a = off.find((r) => r.party === id)!;
      const b = on.find((r) => r.party === id)!;
      expect(b.appliedRuleCount, `${id} applies one more rule`).toBe(a.appliedRuleCount + 1);
    }
    // … and at least one headline moves. (H's uncertain child-benefit rule equals the adopted
    // rate, so H's number does not move; FrP's wealth tax and SV's child benefit do.)
    const moved = effects.includeUncertain.parties.filter(
      (id) => off.find((r) => r.party === id)!.headline !== on.find((r) => r.party === id)!.headline,
    );
    expect(moved).toEqual(['frp', 'sv']);
  });

  it('«arbeidsgiveravgift» follows the data: disabled iff no party changes employer.contribution', () => {
    const changes = DATA_BUNDLE.parties.some((p) => p.deltas.some((d) => d.id === 'employer.contribution'));
    const { employer } = renderToggles(DATA_BUNDLE);
    expect(employer.disabled).toBe(!changes);
    // Today no party changes it (every party's `reviewed.employer` is no-change / not-applicable).
    expect(changes).toBe(false);
  });

  it('the results-page sentence matches the effects', () => {
    expect(toggleSummary(effects, DEFAULT_TOGGLES)).toBe(
      'Usikre forslag (3 regler) er av som standard og ikke regnet med. Ingen partier endrer arbeidsgiveravgiften.',
    );
    const none = toggleEffects(bundle([plainDelta]));
    expect(toggleSummary(none, DEFAULT_TOGGLES)).toBe(
      'Ingen regler er merket usikre. Ingen partier endrer arbeidsgiveravgiften.',
    );
  });
});
