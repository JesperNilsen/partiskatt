// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Route, Router, useLocation } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { kr } from '../engine/money.ts';
import { AppProvider, useApp } from '../state/app.tsx';
import { createProfile, hasNoIncome, profileReducer } from '../state/profile.ts';
import type { Adult, PartyResult, UserProfile } from '../types/index.ts';
import { CalculatorView } from './CalculatorView.tsx';
import { ResultsView } from './ResultsView.tsx';

afterEach(cleanup);

const NO_INCOME_NOTICE = 'Ingen inntekt lagt inn: tallene viser bare avgifter, ytelser og eventuell formuesskatt.';

/** The calculator and the results page behind the real provider, on an in-memory router. */
function renderApp(startPath: string) {
  const memory = memoryLocation({ path: startPath, record: true });
  const seen: { path: string; profile: UserProfile | null; results: PartyResult[] | null; submitted: boolean } = {
    path: startPath,
    profile: null,
    results: null,
    submitted: false,
  };
  function Probe() {
    const [path] = useLocation();
    const app = useApp();
    seen.path = path;
    seen.profile = app.profile;
    seen.results = app.results;
    seen.submitted = app.submitted;
    return null;
  }
  render(
    <AppProvider>
      <Router hook={memory.hook}>
        <Route path="/" component={CalculatorView} />
        <Route path="/resultat" component={ResultsView} />
        <Probe />
      </Router>
    </AppProvider>,
  );
  return { seen, memory };
}

function input(selector: string): HTMLInputElement {
  const found = document.querySelector<HTMLInputElement>(selector);
  if (!found) throw new Error(`${selector} is not rendered`);
  return found;
}

async function submit() {
  const button = screen.getByRole('button', { name: 'Se resultat' }) as HTMLButtonElement;
  await waitFor(() => expect(button.disabled).toBe(false));
  fireEvent.click(button);
  await screen.findByRole('heading', { name: 'Alle ni partier' });
}

describe('ResultsView: /resultat needs a submitted form, not a non-empty profile', () => {
  it('a fresh session redirects /resultat to the calculator, although the profile already carries consumption', async () => {
    const { seen, memory } = renderApp('/resultat');
    await waitFor(() => expect(seen.path).toBe('/'));
    expect(memory.history).toEqual(['/resultat', '/']);
    expect(seen.submitted).toBe(false);
    expect(Object.values(seen.profile!.consumption.spend).some((v) => v > 0)).toBe(true);
    expect(screen.getByRole('button', { name: 'Se resultat' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Alle ni partier' })).toBeNull();
  });

  it('a wage typed but never submitted still redirects', async () => {
    const { seen, memory } = renderApp('/');
    fireEvent.change(input('#wage-0'), { target: { value: '550000' } });
    act(() => memory.navigate('/resultat'));
    await waitFor(() => expect(seen.path).toBe('/'));
    expect(seen.submitted).toBe(false);
  });

  it('the submit button works for a profile with no income at all, and the flag then holds for the session', async () => {
    const { seen, memory } = renderApp('/');
    await submit();
    expect(seen.path).toBe('/resultat');
    expect(seen.submitted).toBe(true);
    expect(seen.results).toHaveLength(9);

    // Back to the calculator and straight to /resultat by URL: no redirect once submitted.
    fireEvent.click(screen.getByRole('link', { name: 'Endre inndata' }));
    await waitFor(() => expect(seen.path).toBe('/'));
    act(() => memory.navigate('/resultat'));
    expect(await screen.findByRole('heading', { name: 'Alle ni partier' })).toBeTruthy();
    expect(seen.path).toBe('/resultat');
  });
});

describe('ResultsView: the no-income notice', () => {
  it('zero income with two children: a result with the notice, styled as a banner', async () => {
    const { seen } = renderApp('/');
    fireEvent.click(screen.getByRole('button', { name: 'Legg til barn' }));
    fireEvent.click(screen.getByRole('button', { name: 'Legg til barn' }));
    expect(seen.profile!.childrenAges).toHaveLength(2);
    await submit();
    const notice = screen.getByText(NO_INCOME_NOTICE);
    expect(notice.closest('.banner')?.classList.contains('banner--notice')).toBe(true);
    // Barnetrygd is still in the numbers: the notice does not replace the result.
    expect(seen.results!.some((r) => r.components.some((c) => c.category === 'benefit' && c.ref > 0))).toBe(true);
  });

  for (const [field, value] of [
    ['#wage-0', '550000'],
    ['#pension-0', '300000'],
  ] as const) {
    it(`no notice once ${field} has income`, async () => {
      renderApp('/');
      fireEvent.change(input(field), { target: { value } });
      await submit();
      expect(screen.queryByText(NO_INCOME_NOTICE)).toBeNull();
    });
  }

  it('no notice with capital income only', async () => {
    renderApp('/');
    fireEvent.click(screen.getByRole('button', { name: 'Avanserte felt' }));
    fireEvent.change(input('#capital-0'), { target: { value: '40000' } });
    await submit();
    expect(screen.queryByText(NO_INCOME_NOTICE)).toBeNull();
  });

  it('household: income for the second adult alone is enough to drop the notice', async () => {
    renderApp('/');
    fireEvent.click(screen.getByRole('button', { name: 'Husholdning' }));
    fireEvent.change(input('#pension-1'), { target: { value: '250000' } });
    await submit();
    expect(screen.queryByText(NO_INCOME_NOTICE)).toBeNull();
  });

  it('the notice follows the profile: clearing the only income brings it back', async () => {
    const { memory } = renderApp('/');
    fireEvent.change(input('#wage-0'), { target: { value: '550000' } });
    await submit();
    expect(screen.queryByText(NO_INCOME_NOTICE)).toBeNull();
    act(() => memory.navigate('/'));
    fireEvent.change(input('#wage-0'), { target: { value: '' } });
    await submit();
    expect(screen.getByText(NO_INCOME_NOTICE)).toBeTruthy();
  });
});

describe('hasNoIncome', () => {
  const withAdults = (...patches: Partial<Adult>[]): UserProfile => {
    let p = profileReducer(createProfile(), { type: 'mode', mode: patches.length > 1 ? 'household' : 'person' });
    patches.forEach((patch, index) => {
      p = profileReducer(p, { type: 'adult', index, patch });
    });
    return p;
  };

  it('reads wage, pension and capital income of every adult', () => {
    expect(hasNoIncome(createProfile())).toBe(true);
    expect(hasNoIncome(withAdults({ wageIncome: kr(1) }))).toBe(false);
    expect(hasNoIncome(withAdults({ pensionIncome: kr(1) }))).toBe(false);
    expect(hasNoIncome(withAdults({ capitalIncome: kr(1) }))).toBe(false);
    expect(hasNoIncome(withAdults({}, { pensionIncome: kr(1) }))).toBe(false);
    expect(hasNoIncome(withAdults({}, {}))).toBe(true);
  });

  it('deductions, student months and wealth are not income', () => {
    const p = withAdults({ interestExpense: kr(20_000), unionFee: kr(5_000), isStudent: true, studyMonths: 11 });
    expect(hasNoIncome({ ...p, wealth: { ...p.wealth, bankDeposits: kr(2_000_000) } })).toBe(true);
  });
});
