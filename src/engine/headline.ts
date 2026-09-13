import type {
  AnyRule,
  Component,
  ComponentDelta,
  ExcludedRule,
  HeadlineGroup,
  Kroner,
  PartyId,
  PartyResult,
  ScenarioResult,
  Toggles,
} from '../types/index.ts';
import { groupOf } from '../types/index.ts';
import { ZERO, add, neg, perMonth, sub, sum } from './money.ts';

export type GateVerdict = { ok: true } | { ok: false; reason: string };

/**
 * A rule enters the arithmetic iff status ∈ {confirmed, estimated}, and it is not uncertain
 * (or the uncertain toggle is on), and it is not the employer contribution (or that toggle
 * is on). `status` is the only gate; `confidence` is display-only.
 */
export function headlineGate(rule: AnyRule, toggles: Toggles): GateVerdict {
  switch (rule.status) {
    case 'confirmed':
    case 'estimated':
      break;
    case 'unquantified':
      return { ok: false, reason: 'Forslaget er ikke tallfestet i partiets dokument.' };
    case 'not-reviewed':
      return { ok: false, reason: 'De to uavhengige uttrekkene er ikke enige, eller regelen er ikke gjennomgått.' };
    case 'not-applicable':
      return { ok: false, reason: 'Regelen gjelder ikke for dette partiet.' };
  }
  if (rule.uncertain && !toggles.includeUncertain) {
    return { ok: false, reason: 'Usikkert forslag – regnes bare med når «usikre forslag» er slått på.' };
  }
  if (rule.id === 'employer.contribution' && !toggles.includeEmployerContribution) {
    return { ok: false, reason: 'Arbeidsgiveravgift regnes bare med når bryteren er slått på.' };
  }
  return { ok: true };
}

function componentDelta(ref: Component, alt: Component): ComponentDelta {
  const diff = sub(alt.amount, ref.amount);
  const d: ComponentDelta = {
    id: ref.id,
    formulaId: ref.formulaId,
    category: ref.category,
    group: groupOf(ref.category),
    label: ref.label,
    direction: ref.direction,
    ref: ref.amount,
    alt: alt.amount,
    keptDelta: ref.direction === 'paid' ? neg(diff) : diff,
    inputsRef: ref.inputs,
    inputsAlt: alt.inputs,
  };
  return ref.adultIndex === undefined ? d : { ...d, adultIndex: ref.adultIndex };
}

/** Component-by-component difference; both scenarios must come from the same profile. */
export function compareScenarios(ref: ScenarioResult, alt: ScenarioResult): ComponentDelta[] {
  const altById = new Map(alt.components.map((c) => [c.id, c] as const));
  if (altById.size !== ref.components.length || altById.size !== alt.components.length) {
    throw new Error('scenarioene har ikke samme komponenter');
  }
  return ref.components.map((r) => {
    const a = altById.get(r.id);
    if (!a) throw new Error(`komponenten ${r.id} finnes i referansen, men ikke i alternativet`);
    return componentDelta(r, a);
  });
}

export function summarizeParty(
  party: PartyId,
  deltas: readonly ComponentDelta[],
  excluded: readonly ExcludedRule[],
  appliedRuleCount: number,
  toggles: Toggles,
): PartyResult {
  const byGroup: Record<HeadlineGroup, Kroner> = { direct: ZERO, consumption: ZERO, benefit: ZERO };
  let employer = ZERO;
  for (const d of deltas) {
    if (d.group === 'employer') employer = add(employer, d.keptDelta);
    else byGroup[d.group] = add(byGroup[d.group], d.keptDelta);
  }
  const headline = sum([byGroup.direct, byGroup.consumption, byGroup.benefit]);
  return {
    party,
    headline,
    monthly: perMonth(headline),
    byGroup,
    employerDelta: toggles.includeEmployerContribution ? employer : null,
    components: toggles.includeEmployerContribution ? deltas : deltas.filter((d) => d.group !== 'employer'),
    excluded,
    appliedRuleCount,
  };
}
