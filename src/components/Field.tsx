interface FieldProps {
  label: string;
  hint?: string;
  id: string;
  children: React.ReactNode;
}

export function Field({ label, hint, id, children }: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>{label}</label>
      {children}
      {hint ? <p className="field__hint" id={`${id}-hint`}>{hint}</p> : null}
    </div>
  );
}
