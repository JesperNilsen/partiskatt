import type { AnyRule, FormulaId, FormulaParams, Rule, RuleSetId } from '../types/index.ts';

/** A complete, gate-filtered rule set: exactly one rule per FormulaId. */
export interface ResolvedRuleSet {
  readonly id: RuleSetId;
  readonly rules: ReadonlyMap<FormulaId, AnyRule>;
}

export function ruleOf<F extends FormulaId>(rs: ResolvedRuleSet, id: F): Rule<F> {
  const r = rs.rules.get(id);
  if (!r) throw new Error(`regelsett «${rs.id}» mangler regelen ${id}`);
  return r as Rule<F>;
}

export function paramsOf<F extends FormulaId>(rs: ResolvedRuleSet, id: F): FormulaParams[F] {
  return ruleOf(rs, id).params;
}
