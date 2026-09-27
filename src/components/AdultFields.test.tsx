// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

/** Field ids and label texts inside one adult's block, with the adult's own index and suffix removed. */
function fieldSet(index: number) {
  const block = el<HTMLDivElement>(`[data-adult="${index}"]`);
  const inputs = [...block.querySelectorAll('input')];
  return inputs.map((input) => {
    const label = block.querySelector(`label[for="${input.id}"]`) ?? input.closest('label');
    return {
      id: input.id.replace(new RegExp(`-${index}$`), ''),
      idEndsInIndex: input.id.endsWith(`-${index}`),
      label: (label?.textContent ?? '').replace(' (voksen 2)', ''),
      suffixed: (label?.textContent ?? '').includes(' (voksen 2)'),
    };
  });
}

const ADOPTED_UNION_CAP = paramsOf(resolveBaseline(DATA_BUNDLE.adopted), 'income.unionFeeDeduction').max;

describe('AdultFields: both adults get the same fields', () => {
  it('with advanced fields open and both adults students, the two field sets are identical', () => {
    renderCalculator();
    household();
    openAdvanced();
    fireEvent.click(el('#student-0'));
    fireEvent.click(el('#student-1'));

    const first = fieldSet(0);
    const second = fieldSet(1);
    expect(first.map((f) => f.id)).toEqual(['wage', 'student', 'studyMonths', 'capital', 'interest', 'union']);
    expect(second.map((f) => f.id)).toEqual(first.map((f) => f.id));
    expect(second.map((f) => f.label)).toEqual(first.map((f) => f.label));
    expect(first.every((f) => f.idEndsInIndex && !f.suffixed)).toBe(true);
    expect(second.every((f) => f.idEndsInIndex && f.suffixed)).toBe(true);
  });

  it('advanced fields stay hidden until the panel opens; the e2e ids are unchanged', () => {
    renderCalculator();
    household();
    expect(fieldSet(0).map((f) => f.id)).toEqual(['wage', 'student']);
    expect(fieldSet(1).map((f) => f.id)).toEqual(['wage', 'student']);
    openAdvanced();
    for (const id of ['#wage-0', '#units-petrolLitre', '#wealth-secondary']) expect(el(id)).toBeTruthy();
    expect(document.querySelectorAll('#capital-0, #interest-0, #union-0').length).toBe(3);
  });

  it('person mode renders one adult only', () => {
    renderCalculator();
    openAdvanced();
    expect(document.querySelector('[data-adult="1"]')).toBeNull();
    expect(document.querySelector('#union-1')).toBeNull();
  });
});

describe('AdultFields: union fee', () => {
  it('the hint shows the cap read from the adopted rule', async () => {
    renderCalculator();
    openAdvanced();
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
        showAdvanced
        labelSuffix=" (voksen 2)"
        unionFeeCap={unionFeeCapOf(bundle)}
      />,
    );
    expect(el('#union-1-hint').textContent).toContain(`${formatKr(kr(12_345))} kr`);
  });

  it('a fee typed for adult 2 reaches the engine result through the calculator’s own submit', async () => {
    const seen = renderCalculator();
    household();
    openAdvanced();
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
