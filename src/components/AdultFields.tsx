import type { Dispatch } from 'react';
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
  showAdvanced: boolean;
  /** Appended to every label, e.g. " (voksen 2)"; empty for the first adult. */
  labelSuffix?: string;
  /** Adopted cap on the union-fee deduction; null while the data loads. */
  unionFeeCap: Kroner | null;
}

/** One adult's income fields. Both adults get exactly the same set; only the ids and labels differ. */
export function AdultFields({ index, adult, dispatch, showAdvanced, labelSuffix = '', unionFeeCap }: AdultFieldsProps) {
  const patch = (p: Partial<Adult>) => dispatch({ type: 'adult', index, patch: p });
  const unionHint =
    unionFeeCap === null
      ? 'Gir fradrag i alminnelig inntekt, opp til et tak.'
      : `Gir fradrag i alminnelig inntekt på inntil ${formatKr(unionFeeCap)} kr (vedtatt for 2026).`;

  return (
    <div data-adult={index}>
      <Field
        label={`Årlig brutto arbeidsinntekt${labelSuffix}`}
        id={`wage-${index}`}
        hint="Før skatt, pensjon og trygd."
      >
        <MoneyInput id={`wage-${index}`} value={adult.wageIncome} onChange={(v) => patch({ wageIncome: v })} />
      </Field>

      {/* L5 slot: `pension-${index}` («Alderspensjon og AFP», hint «Ikke uføretrygd») goes here. */}

      <label className="checkbox">
        <input
          id={`student-${index}`}
          type="checkbox"
          checked={adult.isStudent}
          onChange={(e) =>
            patch({ isStudent: e.target.checked, studyMonths: e.target.checked ? FULL_STUDY_YEAR_MONTHS : 0 })
          }
        />
        {`Student med inntekt fra jobb${labelSuffix} — fulltid gir ${FULL_STUDY_YEAR_MONTHS} måneder studiestøtte`}
      </label>

      {adult.isStudent ? (
        <Field
          label={`Måneder med studiestøtte i 2026${labelSuffix}`}
          id={`studyMonths-${index}`}
          hint={`Fra 0 til ${FULL_STUDY_YEAR_MONTHS}. Et helt studieår på fulltid gir ${FULL_STUDY_YEAR_MONTHS}.`}
        >
          <input
            id={`studyMonths-${index}`}
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

      {showAdvanced ? (
        <>
          <h3>{`Kapitalinntekt og fradrag${labelSuffix}`}</h3>
          <Field label={`Kapitalinntekt${labelSuffix}`} id={`capital-${index}`}>
            <MoneyInput id={`capital-${index}`} value={adult.capitalIncome} onChange={(v) => patch({ capitalIncome: v })} />
          </Field>
          <Field label={`Renteutgifter${labelSuffix}`} id={`interest-${index}`}>
            <MoneyInput
              id={`interest-${index}`}
              value={adult.interestExpense}
              onChange={(v) => patch({ interestExpense: v })}
            />
          </Field>
          <Field label={`Fagforeningskontingent${labelSuffix}`} id={`union-${index}`} hint={unionHint}>
            <MoneyInput id={`union-${index}`} value={adult.unionFee} onChange={(v) => patch({ unionFee: v })} />
          </Field>
        </>
      ) : null}
    </div>
  );
}
