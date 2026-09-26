import { useMemo } from 'react';
import type { DataBundle } from '../engine/index.ts';
import { toggleEffects, type ToggleEffect } from '../state/toggle-effects.ts';
import type { Toggles } from '../types/index.ts';

interface ScenarioTogglesProps {
  /** The loaded data; null while it loads (toggles stay enabled, no note). */
  bundle: DataBundle | null;
  toggles: Toggles;
  setToggles: (update: (t: Toggles) => Toggles) => void;
}

interface ToggleRowProps {
  id: string;
  label: string;
  checked: boolean;
  effect: ToggleEffect | null;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, label, checked, effect, onChange }: ToggleRowProps) {
  const disabled = effect !== null && effect.ruleCount === 0;
  const noteId = `${id}-note`;
  return (
    <div className="scenario-toggle">
      <label className={disabled ? 'checkbox checkbox--disabled' : 'checkbox'}>
        <input
          id={id}
          type="checkbox"
          checked={checked && !disabled}
          disabled={disabled}
          aria-describedby={effect ? noteId : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
      {effect ? (
        <p className="field__hint scenario-toggle__note" id={noteId}>
          {effect.note}
        </p>
      ) : null}
    </div>
  );
}

export function ScenarioToggles({ bundle, toggles, setToggles }: ScenarioTogglesProps) {
  const effects = useMemo(() => (bundle ? toggleEffects(bundle) : null), [bundle]);
  return (
    <>
      <ToggleRow
        id="toggle-uncertain"
        label="Ta med usikre forslag (av som standard)"
        checked={toggles.includeUncertain}
        effect={effects?.includeUncertain ?? null}
        onChange={(checked) => setToggles((t) => ({ ...t, includeUncertain: checked }))}
      />
      <ToggleRow
        id="toggle-employer"
        label="Vis arbeidsgiveravgift (påvirker ikke standardrangering)"
        checked={toggles.includeEmployerContribution}
        effect={effects?.includeEmployerContribution ?? null}
        onChange={(checked) => setToggles((t) => ({ ...t, includeEmployerContribution: checked }))}
      />
    </>
  );
}
