import { useEffect, useState } from 'react';
import { kr } from '../engine/money.ts';
import type { Kroner } from '../types/index.ts';
import { formatKr } from '../utils/format.ts';
import type { DescribedByProps } from './Field.tsx';

interface MoneyInputProps extends DescribedByProps {
  id: string;
  value: Kroner;
  onChange: (value: Kroner) => void;
  placeholder?: string;
  min?: number;
}

function parseKr(raw: string): Kroner {
  const digits = raw.replace(/\s/g, '').replace(/[^\d]/g, '');
  if (!digits) return kr(0);
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 0) return kr(0);
  return kr(Math.min(n, 1_000_000_000));
}

export function MoneyInput({ id, value, onChange, placeholder = '0', min = 0, describedBy }: MoneyInputProps) {
  const [text, setText] = useState(formatKr(value));
  const [focused, setFocused] = useState(false);
  const suffixId = `${id}-suffix`;
  const ariaDescribedBy = describedBy ? `${describedBy} ${suffixId}` : suffixId;

  useEffect(() => {
    if (!focused) setText(value === 0 ? '' : formatKr(value));
  }, [value, focused]);

  return (
    <div className="money-input">
      <input
        id={id}
        className="money-input__field"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={focused ? text : value === 0 ? '' : formatKr(value)}
        onFocus={() => {
          setFocused(true);
          setText(value === 0 ? '' : String(value));
        }}
        onBlur={() => {
          setFocused(false);
          const parsed = parseKr(text);
          const next = parsed < min ? kr(min ?? 0) : parsed;
          onChange(next);
          setText(next === 0 ? '' : formatKr(next));
        }}
        onChange={(e) => {
          const next = parseKr(e.target.value);
          setText(e.target.value);
          onChange(next < min ? kr(min ?? 0) : next);
        }}
        aria-describedby={ariaDescribedBy}
      />
      <span className="money-input__suffix" id={suffixId}>kr/år</span>
    </div>
  );
}
