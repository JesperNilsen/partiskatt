import { ADOPTED_2026 } from './baseline/2026/adopted.ts';
import { PROPOSED_2026 } from './baseline/2026/proposed.ts';
import { kr, krPerUnit, pct } from '../engine/money.ts';
import type {
  Bracket,
  DataStatus,
  FormulaId,
  FormulaParams,
  PartyRuleSet,
  Provenance,
  Rule,
} from '../types/index.ts';

/** Operator gate 3: nothing is `confirmed` until Jesper cross-checks Skatteetaten. */
export const PARTY_RULE_STATUS: DataStatus = 'estimated';

export function adoptedParams<F extends FormulaId>(id: F): FormulaParams[F] {
  const rule = ADOPTED_2026.rules.find((r) => r.id === id);
  if (!rule) throw new Error(`adopted mangler ${id}`);
  return structuredClone(rule.params) as FormulaParams[F];
}

export function proposedParams<F extends FormulaId>(id: F): FormulaParams[F] {
  const rule = PROPOSED_2026.rules.find((r) => r.id === id);
  if (!rule) throw new Error(`proposed mangler ${id}`);
  return structuredClone(rule.params) as FormulaParams[F];
}

export function prov(
  sourceId: string,
  sourceUrl: string,
  pageOrTable: string,
  anchor: string,
  method: string,
  effectiveDate = '2026-01-01',
  confidence: Provenance['confidence'] = 'high',
): Provenance {
  return {
    sourceId,
    sourceUrl,
    pageOrTable,
    anchor,
    method,
    confidence,
    lastChecked: '2026-09-13',
    effectiveDate,
  };
}

export function partyRule<F extends FormulaId>(
  id: F,
  params: FormulaParams[F],
  label: string,
  provenance: Provenance,
  overrides: Partial<Omit<Rule<F>, 'id' | 'params' | 'provenance'>> = {},
): Rule<F> {
  return {
    id,
    params,
    status: PARTY_RULE_STATUS,
    uncertain: false,
    label,
    provenance,
    ...overrides,
  };
}

type BracketTrinn = 1 | 2 | 3 | 4 | 5;

/** Copy adopted brackets and patch individual trinn (1-indexed). */
export function patchBracketTax(
  patches: Partial<Record<BracketTrinn, Partial<Bracket>>>,
): FormulaParams['income.bracketTax'] {
  const { brackets } = adoptedParams('income.bracketTax');
  const next = brackets.map((b, i) => {
    const trinn = (i + 1) as BracketTrinn;
    const patch = patches[trinn];
    return patch ? { ...b, ...patch } : b;
  });
  return { brackets: next };
}

/** Copy adopted valuation params and patch listed fields. */
export function patchWealthValuation(
  patch: Partial<FormulaParams['wealth.valuation']>,
): FormulaParams['wealth.valuation'] {
  return { ...adoptedParams('wealth.valuation'), ...patch };
}

export function emptyParty(
  id: PartyRuleSet['id'],
  reviewed: PartyRuleSet['reviewed'] = {},
  year: PartyRuleSet['year'] = 2026,
): PartyRuleSet {
  return { id, year, base: 'proposed', deltas: [], reviewed, unquantified: [] };
}

export { kr, krPerUnit, pct };
