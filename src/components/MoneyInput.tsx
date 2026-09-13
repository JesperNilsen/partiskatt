import { useEffect, useState } from 'react';
import type { Kroner } from '../types/index.ts';
import { formatKr } from '../utils/format.ts';

interface MoneyInputProps {
  id: string;
  value: Kroner;
  onChange: (value: Kroner) => void;
  placeholder?: string;
  min?: number;
}

function parseKr(raw: string): Kroner {
  const digits = raw.replace(/\s/g, '').replace(/[^\d]/g, '');
  if (!digits) return 0 as Kroner;
  const n = Number(digits);
  if (!Number.isFinite(n) || n < 0) return 0 as Kroner;
  return Math.min(n, 1_000_000_000) as Kroner;
}

export function MoneyInput({ id, value, onChange, placeholder = '0', min = 0 }: MoneyInputProps) {
  const [text, setText] = useState(formatKr(value));
  const [focused, setFocused] = useState(false);

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
          const next = parsed < min ? (min as Kroner) : parsed;
          onChange(next);
          setText(next === 0 ? '' : formatKr(next));
        }}
        onChange={(e) => {
          const next = parseKr(e.target.value);
          setText(e.target.value);
          onChange(next < min ? (min as Kroner) : next);
        }}
        aria-describedby={`${id}-suffix`}
      />
      <span className="money-input__suffix" id={`${id}-suffix`}>kr/år</span>
    </div>
  );
}
