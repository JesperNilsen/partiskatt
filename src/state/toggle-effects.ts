import { PARTY_META } from '../config/parties.ts';
import type { DataBundle } from '../engine/index.ts';
import { headlineGate } from '../engine/index.ts';
import type { AnyRule, PartyId, Toggles } from '../types/index.ts';

/** What one scenario toggle does to the loaded data. */
export interface ToggleEffect {
  /** Party rules whose arithmetic the toggle changes. */
  readonly ruleCount: number;
  /** Parties that own those rules, in bundle order. */
  readonly parties: readonly PartyId[];
  /** One visible line: why the toggle is disabled (ruleCount 0) or what it affects. */
  readonly note: string;
}

export interface ToggleEffects {
  readonly includeUncertain: ToggleEffect;
  readonly includeEmployerContribution: ToggleEffect;
}

const ALL_ON: Toggles = { includeUncertain: true, includeEmployerContribution: true };

/** A rule the toggle can matter for must pass the headline gate once every toggle is on. */
function entersWithAllOn(rule: AnyRule): boolean {
  return headlineGate(rule, ALL_ON).ok;
}

function effect(
  bundle: DataBundle,
  matches: (rule: AnyRule) => boolean,
  noneNote: string,
  someNote: (count: number, parties: string) => string,
): ToggleEffect {
  let ruleCount = 0;
  const parties: PartyId[] = [];
  for (const party of bundle.parties) {
    const n = party.deltas.filter((r) => entersWithAllOn(r) && matches(r)).length;
    if (n === 0) continue;
    ruleCount += n;
    parties.push(party.id);
  }
  const names = parties.map((id) => PARTY_META[id].shortName).join(', ');
  return { ruleCount, parties, note: ruleCount === 0 ? noneNote : someNote(ruleCount, names) };
}

const rules = (n: number) => (n === 1 ? '1 regel' : `${n} regler`);

/**
 * Derived from the loaded rule sets, never hard-coded: a toggle is only worth offering when at
 * least one party rule would enter the arithmetic differently because of it.
 */
export function toggleEffects(bundle: DataBundle): ToggleEffects {
  return {
    includeUncertain: effect(
      bundle,
      (r) => r.uncertain,
      'Ingen regler i datagrunnlaget er merket usikre, så bryteren endrer ingenting.',
      (n, names) => `Gjelder ${rules(n)} merket usikre (${names}).`,
    ),
    includeEmployerContribution: effect(
      bundle,
      (r) => r.id === 'employer.contribution',
      'Ingen partier i datagrunnlaget endrer arbeidsgiveravgiften, så bryteren endrer ingenting.',
      (n, names) => `Gjelder ${rules(n)} om arbeidsgiveravgift (${names}).`,
    ),
  };
}

/** Results-page sentence on what the two toggles did to the numbers shown. */
export function toggleSummary(effects: ToggleEffects, toggles: Toggles): string {
  const u = effects.includeUncertain;
  const uncertain =
    u.ruleCount === 0
      ? 'Ingen regler er merket usikre.'
      : toggles.includeUncertain
        ? `Usikre forslag (${rules(u.ruleCount)}) er slått på og regnet med.`
        : `Usikre forslag (${rules(u.ruleCount)}) er av som standard og ikke regnet med.`;
  const e = effects.includeEmployerContribution;
  const employer =
    e.ruleCount === 0
      ? 'Ingen partier endrer arbeidsgiveravgiften.'
      : toggles.includeEmployerContribution
        ? 'Arbeidsgiveravgift vises separat på hvert kort og er ikke med i hovedtallet.'
        : 'Arbeidsgiveravgift er av som standard og vises ikke.';
  return `${uncertain} ${employer}`;
}
