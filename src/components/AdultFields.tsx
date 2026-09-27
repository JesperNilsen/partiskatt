import { useState, type Dispatch } from 'react';
import type { DataBundle } from '../engine/index.ts';
import { paramsOf, resolveBaseline } from '../engine/index.ts';
import type { ProfileAction } from '../state/profile.ts';
import type { Adult, Kroner } from '../types/index.ts';
import { formatKr } from '../utils/format.ts';
import { Field } from './Field.tsx';
import { MoneyInput } from './MoneyInput.tsx';

/**
 * Months of studiestøtte in a full-time studieår. Source: `sources/worksheets/baseline-2026.md`,
 * row «Lånekassen støttemåneder, studieåret 2026–2027». The engine clamps to the same 0–11
 * (`sanitizeProfile`).
 */
export const FULL_STUDY_YEAR_MONTHS = 11;

/** Parses the months input and clamps it to whole months in 0–11; anything unreadable is 0. */
export function clampStudyMonths(raw: string | number): number {
  const n = typeof raw === 'number' ? raw : Number(raw.trim().replace(',', '.'));
  if (!Number.isFinite(n)) return 0;
  return Math.min(FULL_STUDY_YEAR_MONTHS, Math.max(0, Math.round(n)));
}

/** The cap on fagforeningsfradraget in the adopted 2026 rules, read from the rule, never written here. */
export function unionFeeCapOf(bundle: DataBundle): Kroner {
  return paramsOf(resolveBaseline(bundle.adopted), 'income.unionFeeDeduction').max;
}

interface AdultFieldsProps {
  /** 0 for the first adult, 1 for the second; every field id ends in `-${index}`. */
  index: number;
  adult: Adult;
  dispatch: Dispatch<ProfileAction>;
  /**
   * Legend text for the `<fieldset>` wrapping this adult's fields, e.g. "Voksen 2". Omitted in
   * person mode, where a single adult needs no heading and the fields render in a plain `<div>`.
   * A `<fieldset>`/`<legend>` pair (rather than a repeated label suffix) is what disambiguates the
   * two adults' otherwise-identical field labels for assistive tech (WCAG technique H71).
   */
  legend?: string;
  /** Adopted cap on the union-fee deduction; null while the data loads. */
  unionFeeCap: Kroner | null;
}

/** One adult's income fields. Both adults get exactly the same set; only the ids and, in household mode, the enclosing legend differ. */
export function AdultFields({ index, adult, dispatch, legend, unionFeeCap }: AdultFieldsProps) {
  const patch = (p: Partial<Adult>) => dispatch({ type: 'adult', index, patch: p });
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsPanelId = `adult-${index}-capital-fields`;
  const unionHint =
    unionFeeCap === null
      ? 'Gir fradrag i alminnelig inntekt, opp til et tak.'
      : `Gir fradrag i alminnelig inntekt på inntil ${formatKr(unionFeeCap)} kr (vedtatt for 2026).`;

  const fields = (
    <>
      <Field label="Årlig brutto arbeidsinntekt" id={`wage-${index}`} hint="Før skatt, pensjon og trygd.">
        <MoneyInput id={`wage-${index}`} value={adult.wageIncome} onChange={(v) => patch({ wageIncome: v })} />
      </Field>

      {/* Only alderspensjon and AFP give skattefradrag for pensjonsinntekt; uføretrygd does not (sktl. § 16-1 første ledd). */}
      <Field label="Alderspensjon og AFP" id={`pension-${index}`} hint="Ikke uføretrygd.">
        <MoneyInput id={`pension-${index}`} value={adult.pensionIncome} onChange={(v) => patch({ pensionIncome: v })} />
      </Field>

      <label className="checkbox">
        <input
          id={`student-${index}`}
          type="checkbox"
          checked={adult.isStudent}
          onChange={(e) =>
            patch({ isStudent: e.target.checked, studyMonths: e.target.checked ? FULL_STUDY_YEAR_MONTHS : 0 })
          }
        />
        {`Student med inntekt fra jobb — fulltid gir ${FULL_STUDY_YEAR_MONTHS} måneder studiestøtte`}
      </label>

      {adult.isStudent ? (
        <Field
          label="Måneder med studiestøtte i 2026"
          id={`studyMonths-${index}`}
          hint={`Fra 0 til ${FULL_STUDY_YEAR_MONTHS}. Et helt studieår på fulltid gir ${FULL_STUDY_YEAR_MONTHS}.`}
        >
          <input
            id={`studyMonths-${index}`}
            aria-describedby={`studyMonths-${index}-hint`}
            type="number"
            inputMode="numeric"
            min={0}
            max={FULL_STUDY_YEAR_MONTHS}
            step={1}
            value={adult.studyMonths}
            onChange={(e) => patch({ studyMonths: clampStudyMonths(e.target.value) })}
          />
        </Field>
      ) : null}

      <button
        type="button"
        className="btn btn--ghost adult-fields__disclosure"
        aria-expanded={detailsOpen}
        aria-controls={detailsPanelId}
        onClick={() => setDetailsOpen((v) => !v)}
      >
        Kapitalinntekt, renter og fagforening
      </button>

      {detailsOpen ? (
        <div id={detailsPanelId} className="adult-fields__details">
          <Field label="Kapitalinntekt" id={`capital-${index}`}>
            <MoneyInput id={`capital-${index}`} value={adult.capitalIncome} onChange={(v) => patch({ capitalIncome: v })} />
          </Field>
          <Field label="Renteutgifter" id={`interest-${index}`}>
            <MoneyInput
              id={`interest-${index}`}
              value={adult.interestExpense}
              onChange={(v) => patch({ interestExpense: v })}
            />
          </Field>
          <Field label="Fagforeningskontingent" id={`union-${index}`} hint={unionHint}>
            <MoneyInput id={`union-${index}`} value={adult.unionFee} onChange={(v) => patch({ unionFee: v })} />
          </Field>
        </div>
      ) : null}
    </>
  );

  if (legend) {
    return (
      <fieldset className="adult-fields" data-adult={index}>
        <legend>{legend}</legend>
        {fields}
      </fieldset>
    );
  }

  return (
    <div className="adult-fields" data-adult={index}>
      {fields}
    </div>
  );
}
