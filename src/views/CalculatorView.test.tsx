// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DATA_BUNDLE } from '../data/index.ts';
import { calculateParty, headlineGate } from '../engine/index.ts';
import { AppProvider, useApp } from '../state/app.tsx';
import type { UserProfile, Wealth } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { CalculatorView } from './CalculatorView.tsx';

afterEach(cleanup);

/** Renders the real calculator inside the real provider and exposes the live profile. */
function renderCalculator() {
  const seen: { profile: UserProfile | null } = { profile: null };
  function Probe() {
    seen.profile = useApp().profile;
    return null;
  }
  render(
    <AppProvider>
      <CalculatorView />
      <Probe />
    </AppProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Avanserte felt' }));
  return seen;
}

/** A party whose net wealth tax enters the default headline. */
const wealthParty = DATA_BUNDLE.parties.find((p) =>
  p.deltas.some((d) => d.id === 'wealth.netWealthTax' && headlineGate(d, DEFAULT_TOGGLES).ok),
)!;

function wealthTax(profile: UserProfile) {
  const r = calculateParty(profile, wealthParty.id, DATA_BUNDLE, DEFAULT_TOGGLES);
  const c = r.components.find((d) => d.category === 'wealth-tax');
  if (!c) throw new Error('no wealth-tax component');
  return { adopted: c.ref, party: c.alt };
}

const FIELDS: ReadonlyArray<[string, keyof Wealth]> = [
  ['#wealth-secondary', 'secondaryHomeValue'],
  ['#wealth-other', 'otherTaxableWealth'],
];

describe('CalculatorView: wealth fields the engine already models', () => {
  it('a party changes the net wealth tax in the default headline', () => {
    expect(wealthParty).toBeDefined();
  });

  for (const [selector, key] of FIELDS) {
    it(`${key}: the input reaches the profile and moves the wealth tax`, () => {
      const seen = renderCalculator();
      const before = wealthTax(seen.profile!);
      const input = document.querySelector<HTMLInputElement>(selector);
      expect(input, `${selector} is rendered`).not.toBeNull();
      fireEvent.change(input!, { target: { value: '20000000' } });
      expect(seen.profile!.wealth[key]).toBe(20_000_000);
      const after = wealthTax(seen.profile!);
      expect(after.adopted).toBeGreaterThan(before.adopted);
      expect(after.party - after.adopted).not.toBe(before.party - before.adopted);
    });
  }

  it('the calculator wires the loaded data into the toggles', async () => {
    renderCalculator();
    expect(await screen.findByText(/Gjelder 4 regler merket usikre/)).toBeTruthy();
    expect((screen.getByLabelText(/Ta med usikre forslag/) as HTMLInputElement).disabled).toBe(false);
  });

  it('the segmented "person / husholdning" control reports aria-pressed and toggles it on click', () => {
    renderCalculator();
    const person = screen.getByRole('button', { name: 'Én person' });
    const household = screen.getByRole('button', { name: 'Husholdning' });
    expect(person.getAttribute('aria-pressed')).toBe('true');
    expect(household.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(household);
    expect(person.getAttribute('aria-pressed')).toBe('false');
    expect(household.getAttribute('aria-pressed')).toBe('true');
  });

  it('the «what can be edited» claim in MethodView and METHODOLOGY.md matches the rendered fields', () => {
    renderCalculator();
    const words: Record<number, string> = { 8: 'åtte', 10: 'ti' };
    const spend = document.querySelectorAll('input[id^="spend-"]').length;
    const units = document.querySelectorAll('input[id^="units-"]').length;
    const claim = `alle ${words[spend]} kategorier og alle ${words[units]} fysiske mengder`;
    for (const file of ['src/views/MethodView.tsx', 'METHODOLOGY.md']) {
      const text = readFileSync(file, 'utf8').replace(/\s+/g, ' ');
      expect(text, `${file} states exactly what the calculator lets you edit`).toContain(claim);
      expect(text).not.toContain('Alle verdier kan endres');
    }
  });
});

describe('CalculatorView: «Priser: 2026 / 2022» (L7, D4)', () => {
  const button = (year: string) => screen.getByRole('button', { name: year }) as HTMLButtonElement;

  it('starts in 2026 prices and re-seeds the chosen profile in 2022 prices', () => {
    const seen = renderCalculator();
    expect(screen.getByRole('group', { name: 'Priser' })).toBeTruthy();
    expect(button('2026').getAttribute('aria-pressed')).toBe('true');
    expect(button('2022').getAttribute('aria-pressed')).toBe('false');
    // «Typisk», one adult: 44 700 kr food in 2022; x 1,25 = 55 875 -> 55 900 in 2026.
    expect(seen.profile!.consumption.spend.food).toBe(55_900);

    fireEvent.click(button('2022'));
    expect(seen.profile!.priceYear).toBe(2022);
    expect(seen.profile!.consumptionProfileId).toBe('typisk');
    expect(seen.profile!.consumption.spend.food).toBe(44_700);
    expect(button('2022').getAttribute('aria-pressed')).toBe('true');
  });

  it('is disabled with a reason once the user has typed their own spend, and never touches it', () => {
    const seen = renderCalculator();
    fireEvent.change(document.querySelector<HTMLInputElement>('#spend-food')!, { target: { value: '70000' } });
    expect(seen.profile!.consumptionProfileId).toBe('custom');
    const typed = seen.profile!.consumption;

    expect(button('2022').disabled).toBe(true);
    expect(button('2026').disabled).toBe(true);
    expect(screen.getByText(/Du har skrevet inn egne beløp/)).toBeTruthy();
    fireEvent.click(button('2022'));
    expect(seen.profile!.priceYear).toBe(2026);
    expect(seen.profile!.consumption).toEqual(typed);
    expect(seen.profile!.consumption.spend.food).toBe(70_000);
  });
});
