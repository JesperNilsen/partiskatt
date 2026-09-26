// @vitest-environment jsdom
import { cleanup, fireEvent, render } from '@testing-library/react';
import { useReducer } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { DATA_BUNDLE } from '../data/index.ts';
import {
  calculateParty,
  computeScenario,
  headlineGate,
  resolveBaseline,
  sanitizeProfile,
} from '../engine/index.ts';
import { createProfile, profileReducer } from '../state/profile.ts';
import type { ExciseGood, UserProfile } from '../types/index.ts';
import { DEFAULT_TOGGLES, EXCISE_GOODS } from '../types/index.ts';
import { ExciseUnitsFields, parseUnits } from './ExciseUnitsFields.tsx';

afterEach(cleanup);

/** Renders the fields against the app's real reducer and reports every new profile. */
function renderWithReducer() {
  const seen: { profile: UserProfile } = { profile: createProfile() };
  function Harness() {
    const [profile, dispatch] = useReducer(profileReducer, undefined, createProfile);
    seen.profile = profile;
    return (
      <ExciseUnitsFields
        units={profile.consumption.units}
        onChange={(good, value) => dispatch({ type: 'units', good, value })}
      />
    );
  }
  const view = render(<Harness />);
  return { view, seen };
}

const adopted = resolveBaseline(DATA_BUNDLE.adopted);

function exciseAmount(profile: UserProfile, good: ExciseGood): number {
  const scenario = computeScenario(sanitizeProfile(profile), adopted, adopted);
  const c = scenario.components.find((x) => x.formulaId === `excise.${good}`);
  if (!c) throw new Error(`no excise component for ${good}`);
  return c.amount;
}

function input(view: ReturnType<typeof render>, good: ExciseGood): HTMLInputElement {
  const el = view.container.querySelector<HTMLInputElement>(`#units-${good}`);
  if (!el) throw new Error(`no input for ${good}`);
  return el;
}

describe('ExciseUnitsFields (Q-002)', () => {
  it('renders one labelled one-decimal input per excise good', () => {
    const { view } = renderWithReducer();
    for (const good of EXCISE_GOODS) {
      const el = input(view, good);
      expect(el.inputMode).toBe('decimal');
      expect(view.container.querySelector(`label[for="units-${good}"]`)).not.toBeNull();
    }
  });

  it('keeps one decimal and accepts a decimal comma', () => {
    expect(parseUnits('12,34')).toBe(12.3);
    expect(parseUnits('0.25')).toBe(0.3);
    expect(parseUnits('1 200,5')).toBe(1200.5);
    expect(parseUnits('')).toBe(0);
  });

  for (const good of EXCISE_GOODS) {
    it(`changing ${good} moves its excise component and marks the profile custom`, () => {
      const { view, seen } = renderWithReducer();
      const before = exciseAmount(seen.profile, good);
      const next = seen.profile.consumption.units[good] + 100.5;
      fireEvent.change(input(view, good), { target: { value: String(next).replace('.', ',') } });
      expect(seen.profile.consumption.units[good]).toBeCloseTo(Math.round(next * 10) / 10, 5);
      expect(seen.profile.consumptionProfileId).toBe('custom');
      expect(exciseAmount(seen.profile, good)).toBeGreaterThan(before);
    });
  }

  it('a unit change moves the headline of a party that changes that excise rate', () => {
    const party = DATA_BUNDLE.parties.find((p) =>
      p.deltas.some((d) => d.id === 'excise.petrolLitre' && headlineGate(d, DEFAULT_TOGGLES).ok),
    );
    expect(party, 'some party changes the petrol duty').toBeDefined();
    const { view, seen } = renderWithReducer();
    const before = calculateParty(seen.profile, party!.id, DATA_BUNDLE, DEFAULT_TOGGLES).headline;
    fireEvent.change(input(view, 'petrolLitre'), { target: { value: '2000' } });
    const after = calculateParty(seen.profile, party!.id, DATA_BUNDLE, DEFAULT_TOGGLES).headline;
    expect(after).not.toBe(before);
  });

  it('picking a consumption profile overwrites edited units again', () => {
    let profile = createProfile();
    profile = profileReducer(profile, { type: 'units', good: 'cigarette', value: 999.5 });
    expect(profile.consumptionProfileId).toBe('custom');
    profile = profileReducer(profile, { type: 'consumptionProfile', id: 'typisk' });
    expect(profile.consumption.units.cigarette).toBe(createProfile().consumption.units.cigarette);
  });
});
