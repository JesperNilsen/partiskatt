// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DATA_BUNDLE } from '../data/index.ts';
import { headlineGate, kr, paramsOf, resolveBaseline } from '../engine/index.ts';
import type { DataBundle } from '../engine/index.ts';
import { AppProvider, useApp } from '../state/app.tsx';
import { createProfile } from '../state/profile.ts';
import type { PartyResult, UserProfile } from '../types/index.ts';
import { DEFAULT_TOGGLES } from '../types/index.ts';
import { formatKr } from '../utils/format.ts';
import { CalculatorView } from '../views/CalculatorView.tsx';
import { AdultFields, clampStudyMonths, FULL_STUDY_YEAR_MONTHS, unionFeeCapOf } from './AdultFields.tsx';

afterEach(cleanup);

const CAPITAL_DISCLOSURE_LABEL = 'Kapitalinntekt, renter og fagforening';

/** The real calculator in the real provider; exposes the live profile and the results it computed. */
function renderCalculator() {
  const seen: { profile: UserProfile | null; results: PartyResult[] | null } = { profile: null, results: null };
  function Probe() {
    const app = useApp();
    seen.profile = app.profile;
    seen.results = app.results;
    return null;
  }
  render(
    <AppProvider>
      <CalculatorView />
      <Probe />
    </AppProvider>,
  );
  return seen;
}

function household() {
  fireEvent.click(screen.getByRole('button', { name: 'Husholdning' }));
}

function openAdvanced() {
  fireEvent.click(screen.getByRole('button', { name: 'Avanserte felt' }));
}

function el<T extends HTMLElement = HTMLInputElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`${selector} is not rendered`);
  return found;
}

/** The per-adult "Kapitalinntekt, renter og fagforening" disclosure button for one adult. */
function capitalToggle(index: number): HTMLElement {
  const block = el<HTMLElement>(`[data-adult="${index}"]`);
  return within(block).getByRole('button', { name: CAPITAL_DISCLOSURE_LABEL });
}

function openCapitalPanel(index: number) {
  fireEvent.click(capitalToggle(index));
}

/** Field ids inside one adult's block, in DOM order. */
function fieldIds(index: number): string[] {
  const block = el<HTMLElement>(`[data-adult="${index}"]`);
  const inputs = [...block.querySelectorAll('input')];
  return inputs.map((input) => input.id.replace(new RegExp(`-${index}$`), ''));
}

const ADOPTED_UNION_CAP = paramsOf(resolveBaseline(DATA_BUNDLE.adopted), 'income.unionFeeDeduction').max;

describe('AdultFields: both adults get the same fields', () => {
  it('with the capital panel open and both adults students, the two field sets are identical', () => {
    renderCalculator();
    household();
    fireEvent.click(el('#student-0'));
    fireEvent.click(el('#student-1'));
    openCapitalPanel(0);
    openCapitalPanel(1);

    const first = fieldIds(0);
    const second = fieldIds(1);
    expect(first).toEqual(['wage', 'pension', 'student', 'studyMonths', 'capital', 'interest', 'union']);
    expect(second).toEqual(first);
  });

  it('the capital/interest/union fields stay hidden until that adult’s own panel opens', () => {
    renderCalculator();
    household();
    expect(fieldIds(0)).toEqual(['wage', 'pension', 'student']);
    expect(fieldIds(1)).toEqual(['wage', 'pension', 'student']);
    openCapitalPanel(0);
    expect(fieldIds(0)).toEqual(['wage', 'pension', 'student', 'capital', 'interest', 'union']);
    expect(fieldIds(1)).toEqual(['wage', 'pension', 'student']);
  });

  it('the global "Avanserte felt" toggle no longer reveals capital/interest/union (L8)', () => {
    renderCalculator();
    household();
    openAdvanced();
    expect(document.querySelectorAll('#capital-0, #interest-0, #union-0, #capital-1, #interest-1, #union-1').length).toBe(0);
    // the toggle still governs wealth/units/scenario fields
    for (const id of ['#units-petrolLitre', '#wealth-secondary']) expect(el(id)).toBeTruthy();
  });

  it('person mode renders one adult only', () => {
    renderCalculator();
    expect(document.querySelector('[data-adult="1"]')).toBeNull();
    expect(document.querySelector('#union-1')).toBeNull();
  });
});

describe('AdultFields: capital/interest/union disclosure (L8)', () => {
  it('is collapsed by default for both adults, with aria-expanded false', () => {
    renderCalculator();
    household();
    expect(document.querySelectorAll('#capital-0, #capital-1').length).toBe(0);
    expect(capitalToggle(0).getAttribute('aria-expanded')).toBe('false');
    expect(capitalToggle(1).getAttribute('aria-expanded')).toBe('false');
  });

  it('opening one adult’s panel reveals only that adult’s fields and flips its own aria-expanded', () => {
    renderCalculator();
    household();
    openCapitalPanel(0);

    expect(el('#capital-0')).toBeTruthy();
    expect(el('#interest-0')).toBeTruthy();
    expect(el('#union-0')).toBeTruthy();
    expect(capitalToggle(0).getAttribute('aria-expanded')).toBe('true');

    // adult 2 is untouched
    expect(document.querySelectorAll('#capital-1, #interest-1, #union-1').length).toBe(0);
    expect(capitalToggle(1).getAttribute('aria-expanded')).toBe('false');
  });

  it('the two adults’ panels open independently of each other', () => {
    renderCalculator();
    household();
    openCapitalPanel(1);
    expect(el('#union-1')).toBeTruthy();
    expect(document.querySelector('#union-0')).toBeNull();

    openCapitalPanel(0);
    expect(el('#union-0')).toBeTruthy();
    expect(el('#union-1')).toBeTruthy();

    // closing adult 1's panel leaves adult 0's open
    openCapitalPanel(1);
    expect(document.querySelector('#union-1')).toBeNull();
    expect(el('#union-0')).toBeTruthy();
  });

  it('aria-controls names the panel that contains the fields', () => {
    renderCalculator();
    openCapitalPanel(0);
    const panelId = capitalToggle(0).getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
    expect(panel!.querySelector('#capital-0')).not.toBeNull();
  });
});

describe('AdultFields: household legends (L8)', () => {
  it('wraps each adult in a fieldset with its own legend, and a divider between them', () => {
    renderCalculator();
    household();
    const first = el<HTMLFieldSetElement>('fieldset[data-adult="0"]');
    const second = el<HTMLFieldSetElement>('fieldset[data-adult="1"]');
    expect(first.querySelector('legend')?.textContent).toBe('Voksen 1');
    expect(second.querySelector('legend')?.textContent).toBe('Voksen 2');
  });

  it('person mode needs no legend or fieldset', () => {
    renderCalculator();
    expect(document.querySelector('fieldset')).toBeNull();
    expect(document.querySelector('legend')).toBeNull();
    expect(el('[data-adult="0"]').tagName).toBe('DIV');
  });
});

describe('AdultFields: union fee', () => {
  it('the hint shows the cap read from the adopted rule', async () => {
    renderCalculator();
    openCapitalPanel(0);
    const hint = el<HTMLParagraphElement>('#union-0-hint');
    await waitFor(() => expect(hint.textContent).toContain(`${formatKr(ADOPTED_UNION_CAP)} kr`));
  });

  it('the cap follows the rule, not a number written in the component', () => {
    const adopted = {
      ...DATA_BUNDLE.adopted,
      rules: DATA_BUNDLE.adopted.rules.map((r) =>
        r.id === 'income.unionFeeDeduction' ? { ...r, params: { max: 12_345 } } : r,
      ),
    } as DataBundle['adopted'];
    const bundle: DataBundle = { ...DATA_BUNDLE, adopted };
    expect(unionFeeCapOf(bundle)).toBe(12_345);
    expect(unionFeeCapOf(DATA_BUNDLE)).toBe(ADOPTED_UNION_CAP);

    render(
      <AdultFields
        index={1}
        adult={createProfile().adults[0]}
        dispatch={() => {}}
        legend="Voksen 2"
        unionFeeCap={unionFeeCapOf(bundle)}
      />,
    );
    openCapitalPanel(1);
    expect(el('#union-1-hint').textContent).toContain(`${formatKr(kr(12_345))} kr`);
  });

  it('a fee typed for adult 2 reaches the engine result through the calculator’s own submit', async () => {
    const seen = renderCalculator();
    household();
    openCapitalPanel(1);
    fireEvent.change(el('#wage-1'), { target: { value: '600000' } });
    fireEvent.change(el('#union-1'), { target: { value: '20000' } });
    expect(seen.profile!.adults[1]?.unionFee).toBe(20_000);

    const submit = screen.getByRole('button', { name: 'Se resultat' });
    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);
    await waitFor(() => expect(seen.results).not.toBeNull());

    const results = seen.results!;
    for (const r of results) {
      const general = (i: number) => r.components.find((c) => c.formulaId === 'income.generalRate' && c.adultIndex === i)!;
      // The reference is the adopted rule set: the deduction is the fee, capped at the adopted cap.
      expect(general(1).inputsRef.fagforeningsfradrag, r.party).toBe(Math.min(20_000, ADOPTED_UNION_CAP));
      expect(general(0).inputsRef.fagforeningsfradrag, r.party).toBe(0);
    }

    // A party that removes the deduction in the default headline now moves adult 2's tax.
    const remover = DATA_BUNDLE.parties.find((p) =>
      p.deltas.some((d) => d.id === 'income.unionFeeDeduction' && headlineGate(d, DEFAULT_TOGGLES).ok),
    );
    expect(remover, 'some party changes the union-fee deduction in the default headline').toBeDefined();
    const result = results.find((r) => r.party === remover!.id)!;
    const general1 = result.components.find((c) => c.formulaId === 'income.generalRate' && c.adultIndex === 1)!;
    expect(general1.inputsAlt.fagforeningsfradrag).not.toBe(general1.inputsRef.fagforeningsfradrag);
    expect(general1.keptDelta).not.toBe(0);
  });
});

describe('AdultFields: pension', () => {
  it('both adults get «Alderspensjon og AFP» right after the wage field, with the «Ikke uføretrygd.» hint', () => {
    renderCalculator();
    household();
    for (const index of [0, 1] as const) {
      const ids = fieldIds(index);
      expect(ids.indexOf('pension'), `adult ${index}`).toBe(ids.indexOf('wage') + 1);
      expect(el(`label[for="pension-${index}"]`).textContent).toBe('Alderspensjon og AFP');
      expect(el(`#pension-${index}-hint`).textContent).toBe('Ikke uføretrygd.');
      expect(el(`#pension-${index}`).getAttribute('aria-describedby')).toContain(`pension-${index}-hint`);
    }
  });

  it('a pension typed for each adult lands on that adult only', () => {
    const seen = renderCalculator();
    household();
    fireEvent.change(el('#pension-0'), { target: { value: '300 000' } });
    expect(seen.profile!.adults[0]?.pensionIncome).toBe(300_000);
    expect(seen.profile!.adults[1]?.pensionIncome).toBe(0);
    fireEvent.change(el('#pension-1'), { target: { value: '180000' } });
    expect(seen.profile!.adults[1]?.pensionIncome).toBe(180_000);
    expect(seen.profile!.adults[0]?.pensionIncome).toBe(300_000);
    expect(seen.profile!.adults.map((a) => a.wageIncome)).toEqual([0, 0]);
  });

  it('adult 2’s pension reaches the engine through the calculator’s own submit and gets the pension credit', async () => {
    const seen = renderCalculator();
    household();
    fireEvent.change(el('#pension-1'), { target: { value: '300000' } });

    const submit = screen.getByRole('button', { name: 'Se resultat' });
    await waitFor(() => expect((submit as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(submit);
    await waitFor(() => expect(seen.results).not.toBeNull());

    for (const r of seen.results!) {
      const credit = (i: number) => r.components.find((c) => c.formulaId === 'income.pensionTaxCredit' && c.adultIndex === i);
      expect(credit(1)?.inputsRef.pensjon, r.party).toBe(300_000);
      expect(credit(1)?.ref, r.party).toBeGreaterThan(0);
      expect(credit(0)?.ref ?? 0, r.party).toBe(0);
    }
  });
});

describe('AdultFields: study months', () => {
  it(`ticking «student» defaults to ${FULL_STUDY_YEAR_MONTHS} months; the input clamps to 0–${FULL_STUDY_YEAR_MONTHS}`, () => {
    const seen = renderCalculator();
    household();
    expect(document.querySelector('#studyMonths-1')).toBeNull();
    fireEvent.click(el('#student-1'));
    expect(seen.profile!.adults[1]).toMatchObject({ isStudent: true, studyMonths: FULL_STUDY_YEAR_MONTHS });
    const months = el('#studyMonths-1');
    expect(months.value).toBe(String(FULL_STUDY_YEAR_MONTHS));

    for (const [typed, stored] of [
      ['6', 6],
      ['15', 11],
      ['-3', 0],
      ['', 0],
      ['11', 11],
    ] as const) {
      fireEvent.change(months, { target: { value: typed } });
      expect(seen.profile!.adults[1]?.studyMonths, `typed «${typed}»`).toBe(stored);
      expect(months.value).toBe(String(stored));
    }
    expect(seen.profile!.adults[0]).toMatchObject({ isStudent: false, studyMonths: 0 });

    fireEvent.click(el('#student-1'));
    expect(seen.profile!.adults[1]).toMatchObject({ isStudent: false, studyMonths: 0 });
    expect(document.querySelector('#studyMonths-1')).toBeNull();
  });

  it('the label states the full-time count', () => {
    renderCalculator();
    expect(el('#student-0').closest('label')!.textContent).toContain(`${FULL_STUDY_YEAR_MONTHS} måneder studiestøtte`);
  });

  it('clampStudyMonths', () => {
    expect(clampStudyMonths('4,4')).toBe(4);
    expect(clampStudyMonths('10.6')).toBe(11);
    expect(clampStudyMonths('abc')).toBe(0);
    expect(clampStudyMonths(99)).toBe(11);
    expect(clampStudyMonths(-1)).toBe(0);
    expect(clampStudyMonths(Number.NaN)).toBe(0);
  });
});
