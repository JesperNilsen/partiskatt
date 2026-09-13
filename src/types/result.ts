import type { Kroner } from './money.ts';
import type { Category, DataStatus, FormulaId, PartyId, RuleSetId } from './rules.ts';

/** The three groups shown to the user. */
export type HeadlineGroup = 'direct' | 'consumption' | 'benefit';

export function groupOf(category: Category): HeadlineGroup | 'employer' {
  switch (category) {
    case 'direct-tax':
    case 'wealth-tax':
      return 'direct';
    case 'consumption-tax':
      return 'consumption';
    case 'benefit':
      return 'benefit';
    case 'employer':
      return 'employer';
  }
}

export type Direction = 'paid' | 'received';

export interface Component {
  /** Stable id: `${formulaId}` or `${formulaId}#${adultIndex}`. */
  id: string;
  formulaId: FormulaId;
  category: Category;
  label: string;
  direction: Direction;
  /** Always ≥ 0; sign is carried by `direction`. */
  amount: Kroner;
  /** Intermediate values, so the detail view can show the arithmetic. */
  inputs: Record<string, number>;
  ruleSetId: RuleSetId;
  adultIndex?: number;
}

export interface ScenarioResult {
  ruleSetId: RuleSetId;
  components: readonly Component[];
  /** Σ received − Σ paid over headline components. */
  net: Kroner;
}

export interface ComponentDelta {
  id: string;
  formulaId: FormulaId;
  category: Category;
  group: HeadlineGroup | 'employer';
  label: string;
  direction: Direction;
  ref: Kroner;
  alt: Kroner;
  /** Effect on money kept: −(alt−ref) for paid, +(alt−ref) for received. */
  keptDelta: Kroner;
  inputsRef: Record<string, number>;
  inputsAlt: Record<string, number>;
  adultIndex?: number;
}

export interface ExcludedRule {
  formulaId?: FormulaId;
  title: string;
  status: DataStatus;
  reason: string;
  uncertain: boolean;
}

export interface PartyResult {
  party: PartyId;
  /** Kroner kept per year vs. the reference. Positive = more money. */
  headline: Kroner;
  monthly: Kroner;
  byGroup: Record<HeadlineGroup, Kroner>;
  /** Only present when the employer toggle is on. */
  employerDelta: Kroner | null;
  components: readonly ComponentDelta[];
  excluded: readonly ExcludedRule[];
  /** Number of rules the party changed that entered the arithmetic. */
  appliedRuleCount: number;
}
