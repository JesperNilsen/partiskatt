import type { Bp, Kroner, RatePerUnit } from './money.ts';
import type { ExciseGood, VatCategory } from './profile.ts';

export type PartyId = 'ap' | 'h' | 'frp' | 'sv' | 'sp' | 'r' | 'v' | 'mdg' | 'krf';
export const PARTY_IDS: readonly PartyId[] = ['ap', 'h', 'frp', 'sv', 'sp', 'r', 'v', 'mdg', 'krf'];

/** A budget round: the year whose rules the government proposes and the parties amend. */
export type BudgetYear = 2026 | 2027;

export type BaselineId = 'proposed' | 'adopted';
export type RuleSetId = BaselineId | PartyId;

/** Internal category; display groups collapse these to three (see result.ts). */
export type Category = 'direct-tax' | 'wealth-tax' | 'consumption-tax' | 'benefit' | 'employer';

export type DataStatus = 'confirmed' | 'estimated' | 'unquantified' | 'not-applicable' | 'not-reviewed';

export interface Bracket {
  threshold: Kroner;
  rateBp: Bp;
}

/** Parameter schema per formula. Adding a formula = add here + in engine/formulas.ts. */
export interface FormulaParams {
  'income.generalRate': { rateBp: Bp };
  'income.bracketTax': { brackets: readonly Bracket[] };
  'income.socialSecurity': {
    wageRateBp: Bp;
    pensionRateBp: Bp;
    lowerThreshold: Kroner;
    phaseInRateBp: Bp;
  };
  'income.personalAllowance': { amount: Kroner };
  'income.minimumDeductionWage': { rateBp: Bp; max: Kroner; min: Kroner };
  'income.minimumDeductionPension': { rateBp: Bp; max: Kroner; min: Kroner };
  'income.unionFeeDeduction': { max: Kroner };
  /** Skattefradrag per adult with wage income, capped at that adult's income tax (see income-tax.ts). */
  'income.workTaxCredit': { amountPerWorker: Kroner };
  /**
   * Skattefradrag for pensjonsinntekt (sktl. § 16-1): `max` per adult with pension income, phased
   * out by `rate1Bp` of pension between `threshold1` and `threshold2` and by `rate2Bp` above
   * `threshold2`; never more than the adult's income taxes and trygdeavgift (see income-tax.ts).
   */
  'income.pensionTaxCredit': { max: Kroner; threshold1: Kroner; rate1Bp: Bp; threshold2: Kroner; rate2Bp: Bp };
  'wealth.netWealthTax': {
    single: { allowance: Kroner; tier2Threshold: Kroner };
    couple: { allowance: Kroner; tier2Threshold: Kroner };
    tier1RateBp: Bp;
    tier2RateBp: Bp;
  };
  'wealth.valuation': {
    primaryHomeBp: Bp;
    primaryHomeHighValueThreshold: Kroner;
    primaryHomeHighValueBp: Bp;
    secondaryHomeBp: Bp;
    listedSharesBp: Bp;
    bankDepositsBp: Bp;
    otherBp: Bp;
    /** Asset classes whose allocated debt is discounted at the same rate (sktl. § 4-19). */
    debtReductionApplies: { secondaryHome: boolean; listedShares: boolean; other: boolean };
  };
  'vat.food': { rateBp: Bp };
  'vat.general': { rateBp: Bp };
  'vat.transportServices': { rateBp: Bp };
  'vat.electricity': { rateBp: Bp };
  'vat.fuel': { rateBp: Bp };
  'vat.alcoholTobacco': { rateBp: Bp };
  'vat.flights': { rateBp: Bp };
  'excise.petrolLitre': { ratePerUnit: RatePerUnit };
  'excise.dieselLitre': { ratePerUnit: RatePerUnit };
  'excise.kwh': { ratePerUnit: RatePerUnit };
  'excise.flightEurope': { ratePerUnit: RatePerUnit };
  'excise.flightOther': { ratePerUnit: RatePerUnit };
  'excise.beerLitre': { ratePerUnit: RatePerUnit };
  'excise.wineLitre': { ratePerUnit: RatePerUnit };
  'excise.spiritsLitre': { ratePerUnit: RatePerUnit };
  'excise.cigarette': { ratePerUnit: RatePerUnit };
  'excise.snusGram': { ratePerUnit: RatePerUnit };
  'benefit.childBenefit': {
    under6PerMonth: Kroner;
    from6PerMonth: Kroner;
    ageCutoff: number;
    extendedSingleParentPerMonth: Kroner;
  };
  'benefit.studentSupport': { basicSupportPerMonth: Kroner; grantShareBp: Bp };
  'employer.contribution': { rateBp: Bp; extraRateBp: Bp; extraThreshold: Kroner };
}

export type FormulaId = keyof FormulaParams;
export type VatFormulaId = `vat.${Exclude<VatCategory, 'exempt'>}`;
export type ExciseFormulaId = `excise.${ExciseGood}`;

export interface Provenance {
  /** Id in sources/manifest.json. */
  sourceId: string;
  sourceUrl: string;
  /** Page number in the archived text file, or § / table reference. */
  pageOrTable: string;
  /** ≤ 10 verbatim words that occur on that page (anchor test). */
  anchor: string;
  /** How the number was derived from the source (one or two sentences). */
  method: string;
  confidence: 'high' | 'medium' | 'low';
  /** ISO date of last manual check. */
  lastChecked: string;
  /** ISO date the rule takes effect. */
  effectiveDate: string;
}

export interface Rule<F extends FormulaId = FormulaId> {
  id: F;
  params: FormulaParams[F];
  status: DataStatus;
  /** Off by default; shown under «Mulige endringer». */
  uncertain: boolean;
  /** Short Norwegian description of the rule as the source states it. */
  label: string;
  provenance: Provenance;
  /**
   * Party deltas only: the value the party says it deviates from.
   * A test asserts it deep-equals the `proposed` rule (catches a misread baseline).
   */
  baselineParams?: FormulaParams[F];
  note?: string;
}

export type AnyRule = { [F in FormulaId]: Rule<F> }[FormulaId];

export interface BaselineRuleSet {
  id: BaselineId;
  year: BudgetYear;
  rules: readonly AnyRule[];
}

export interface ReviewNote {
  status: 'no-change' | 'not-applicable';
  pageOrTable: string;
  note: string;
}

/** A proposal that exists in the source but cannot enter the arithmetic. */
export interface UnquantifiedProposal {
  category: Category;
  title: string;
  status: 'unquantified' | 'not-reviewed';
  reason: string;
  provenance: Provenance;
}

export interface PartyRuleSet {
  id: PartyId;
  year: BudgetYear;
  /** Party documents state changes relative to the government's proposal. */
  base: 'proposed';
  /** Absolute values of every rule the party proposes to change. */
  deltas: readonly AnyRule[];
  /** Categories reviewed and found unchanged / not applicable, with evidence. */
  reviewed: Partial<Record<Category, ReviewNote>>;
  unquantified: readonly UnquantifiedProposal[];
}

export interface PartyMeta {
  id: PartyId;
  name: string;
  shortName: string;
  /** Official party colour, used only as identification. */
  color: string;
  /** Text colour that meets contrast on `color`. */
  onColor: string;
  inGovernment: boolean;
}
