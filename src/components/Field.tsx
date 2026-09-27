import { cloneElement, isValidElement } from 'react';

interface FieldProps {
  label: string;
  hint?: string;
  id: string;
  children: React.ReactNode;
}

/** Implemented by any input rendered inside a `Field` that wants the hint id merged into its own `aria-describedby`. */
export interface DescribedByProps {
  describedBy?: string;
}

export function Field({ label, hint, id, children }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const input =
    hintId && isValidElement<DescribedByProps>(children) ? cloneElement(children, { describedBy: hintId }) : children;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      {input}
      {hint ? <p className="field__hint" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}
