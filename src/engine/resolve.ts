import type {
  AnyRule,
  BaselineId,
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
  /**
   * What every alternative is compared against, and the price level consumption spend is entered in.
   * Default `adopted`: the 2026 round compares with the system in force. The 2027 round sets the
   * referansesystem (REFERENCE_2027: adopted 2026 with amounts indexed to 2027 level, as Prop. 1 LS
   * computes «endring fra referansen»), so indexation alone is not counted as a tax change.
   */
  readonly reference?: BaselineRuleSet;
  readonly parties: readonly PartyRuleSet[];
  /**
   * What a party's absolute values are laid over. `adopted` (default) is the 2026 round: the party
   * is judged against the adopted system. `proposed` is the 2027 round: no 2027 system is adopted
   * yet, so a party alternative is the government's 2027 proposal plus its own changes, compared
   * against `reference`.
   */
  readonly partyBase?: BaselineId;
}

/** The rule set a bundle names by id; `reference` falls back to `adopted` when the bundle sets none. */
export function baselineOf(data: DataBundle, id: BaselineId): BaselineRuleSet {
  return id === 'reference' ? (data.reference ?? data.adopted) : data[id];
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
  if (id === 'adopted' || id === 'proposed' || id === 'reference') {
    return { ruleSet: resolveBaseline(baselineOf(data, id)), excluded: [], appliedRuleCount: 0 };
  }
  const party = data.parties.find((p) => p.id === id);
  if (!party) throw new Error(`ingen data for partiet «${id}»`);
  return resolveParty(party, resolveBaseline(baselineOf(data, data.partyBase ?? 'adopted')), toggles);
}
