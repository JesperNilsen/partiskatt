import { useState } from 'react';
import type { ExciseGood } from '../types/index.ts';
import { EXCISE_GOODS } from '../types/index.ts';
import { Field } from './Field.tsx';

/** Norwegian label and unit suffix per excise good; the unit is what the engine multiplies the rate by. */
export const EXCISE_UNIT_LABELS: Record<ExciseGood, { label: string; suffix: string }> = {
  petrolLitre: { label: 'Bensin', suffix: 'liter/år' },
  dieselLitre: { label: 'Diesel', suffix: 'liter/år' },
  kwh: { label: 'Strøm', suffix: 'kWh/år' },
  flightEurope: { label: 'Flyreiser i Europa', suffix: 'avreiser/år' },
  flightOther: { label: 'Flyreiser utenfor Europa', suffix: 'avreiser/år' },
  beerLitre: { label: 'Øl (4,7 %)', suffix: 'liter/år' },
  wineLitre: { label: 'Vin (12 %)', suffix: 'liter/år' },
  spiritsLitre: { label: 'Brennevin (40 %)', suffix: 'liter/år' },
  cigarette: { label: 'Sigaretter', suffix: 'stk/år' },
  snusGram: { label: 'Snus', suffix: 'gram/år' },
};

/** Same ceiling as the engine's `sanitizeUnits`. */
const UNIT_CAP = 10_000_000;

const oneDecimal = new Intl.NumberFormat('nb-NO', { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export function roundUnits(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Accepts «12,5», «12.5» and «1 200»; anything unparsable is 0. One decimal kept. */
export function parseUnits(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const [whole = '', ...rest] = cleaned.split('.');
  const n = Number(rest.length > 0 ? `${whole}.${rest.join('')}` : whole);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(roundUnits(n), UNIT_CAP);
}

export function formatUnits(n: number): string {
  return n === 0 ? '' : oneDecimal.format(roundUnits(n));
}

interface UnitInputProps {
  id: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}

/** One-decimal quantity input. It dispatches on typing only, so focusing a field never rewrites the profile. */
function UnitInput({ id, value, suffix, onChange }: UnitInputProps) {
  const [text, setText] = useState<string | null>(null);
  return (
    <div className="money-input">
      <input
        id={id}
        className="money-input__field"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0"
        value={text ?? formatUnits(value)}
        onFocus={() => setText(formatUnits(value))}
        onBlur={() => setText(null)}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseUnits(e.target.value));
        }}
        aria-describedby={`${id}-suffix`}
      />
      <span className="money-input__suffix" id={`${id}-suffix`}>{suffix}</span>
    </div>
  );
}

interface ExciseUnitsFieldsProps {
  units: Record<ExciseGood, number>;
  onChange: (good: ExciseGood, value: number) => void;
}

/** Q-002: the physical quantities the excise duties are computed from, one field per `ExciseGood`. */
export function ExciseUnitsFields({ units, onChange }: ExciseUnitsFieldsProps) {
  return (
    <>
      <h3>Mengder for særavgifter (per år)</h3>
      <p className="field__hint">
        Forhåndsutfylt fra forbruksprofilen og vist med én desimal; mengdene er forventede årlige mengder, så brøker er
        vanlige. Endrer du én, blir profilen egendefinert.
      </p>
      {EXCISE_GOODS.map((good) => (
        <Field key={good} label={EXCISE_UNIT_LABELS[good].label} id={`units-${good}`}>
          <UnitInput
            id={`units-${good}`}
            value={units[good]}
            suffix={EXCISE_UNIT_LABELS[good].suffix}
            onChange={(v) => onChange(good, v)}
          />
        </Field>
      ))}
    </>
  );
}
