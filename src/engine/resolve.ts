import type {
  AnyRule,
  BaselineRuleSet,
  ExcludedRule,
  FormulaId,
  PartyRuleSet,
  RuleSetId,
  Toggles,
} from '../types/index.ts';
import { FORMULA_IDS } from './formulas.ts';
import { headlineGate } from './headline.ts';
import type { ResolvedRuleSet } from './rule-set.ts';

/** Everything the engine needs; assembled in src/data, passed in so the engine imports no data. */
export interface DataBundle {
  readonly proposed: BaselineRuleSet;
  readonly adopted: BaselineRuleSet;
  readonly parties: readonly PartyRuleSet[];
}

export interface Resolution {
  ruleSet: ResolvedRuleSet;
  excluded: ExcludedRule[];
  appliedRuleCount: number;
}

/** A baseline must carry exactly one rule for every formula. */
export function resolveBaseline(baseline: BaselineRuleSet): ResolvedRuleSet {
  const rules = new Map<FormulaId, AnyRule>();
  for (const r of baseline.rules) {
    if (rules.has(r.id)) throw new Error(`regelsett «${baseline.id}» har regelen ${r.id} to ganger`);
    rules.set(r.id, r);
  }
  const missing = FORMULA_IDS.filter((id) => !rules.has(id));
  if (missing.length > 0) throw new Error(`regelsett «${baseline.id}» mangler: ${missing.join(', ')}`);
  return { id: baseline.id, rules };
}

/**
 * Party = adopted system overlaid with the party's absolute values for the rules it changes
 * and that pass the headline gate. Rules that fail the gate, and unquantified proposals, are
 * returned as excluded so the card can say «n forslag ikke tallfestet».
 */
export function resolveParty(party: PartyRuleSet, adopted: ResolvedRuleSet, toggles: Toggles): Resolution {
  const rules = new Map(adopted.rules);
  const excluded: ExcludedRule[] = [];
  const seen = new Set<FormulaId>();
  let appliedRuleCount = 0;
  for (const delta of party.deltas) {
    if (seen.has(delta.id)) throw new Error(`partiet «${party.id}» har regelen ${delta.id} to ganger`);
    seen.add(delta.id);
    const verdict = headlineGate(delta, toggles);
    if (verdict.ok) {
      rules.set(delta.id, delta);
      appliedRuleCount += 1;
    } else {
      excluded.push({
        formulaId: delta.id,
        title: delta.label,
        status: delta.status,
        reason: verdict.reason,
        uncertain: delta.uncertain,
      });
    }
  }
  for (const u of party.unquantified) {
    excluded.push({ title: u.title, status: u.status, reason: u.reason, uncertain: false });
  }
  return { ruleSet: { id: party.id, rules }, excluded, appliedRuleCount };
}

export function resolveRuleSet(id: RuleSetId, data: DataBundle, toggles: Toggles): Resolution {
  if (id === 'adopted' || id === 'proposed') {
    return { ruleSet: resolveBaseline(data[id]), excluded: [], appliedRuleCount: 0 };
  }
  const party = data.parties.find((p) => p.id === id);
  if (!party) throw new Error(`ingen data for partiet «${id}»`);
  return resolveParty(party, resolveBaseline(data.adopted), toggles);
}
