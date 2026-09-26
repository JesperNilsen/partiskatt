import type {
  Category,
  Component,
  Direction,
  ExciseGood,
  FormulaId,
  FormulaParams,
  Kroner,
  VatCategory,
} from '../types/index.ts';
import { toKroner } from './money.ts';
import type { ResolvedRuleSet } from './rule-set.ts';

/** Every formula the engine knows. The type check below fails if FormulaParams gains an id that is missing here. */
export const FORMULA_IDS = [
  'income.generalRate',
  'income.bracketTax',
  'income.socialSecurity',
  'income.personalAllowance',
  'income.minimumDeductionWage',
  'income.minimumDeductionPension',
  'income.unionFeeDeduction',
  'income.workTaxCredit',
  'wealth.netWealthTax',
  'wealth.valuation',
  'vat.food',
  'vat.general',
  'vat.transportServices',
  'vat.electricity',
  'vat.fuel',
  'vat.alcoholTobacco',
  'vat.flights',
  'excise.petrolLitre',
  'excise.dieselLitre',
  'excise.kwh',
  'excise.flightEurope',
  'excise.flightOther',
  'excise.beerLitre',
  'excise.wineLitre',
  'excise.spiritsLitre',
  'excise.cigarette',
  'excise.snusGram',
  'benefit.childBenefit',
  'benefit.studentSupport',
  'employer.contribution',
] as const satisfies readonly FormulaId[];

type MissingFormula = Exclude<FormulaId, (typeof FORMULA_IDS)[number]>;
const _everyFormulaListed: MissingFormula extends never ? true : never = true;
void _everyFormulaListed;

export function categoryOf(id: FormulaId): Category {
  if (id.startsWith('income.')) return 'direct-tax';
  if (id.startsWith('wealth.')) return 'wealth-tax';
  if (id.startsWith('vat.') || id.startsWith('excise.')) return 'consumption-tax';
  if (id.startsWith('benefit.')) return 'benefit';
  return 'employer';
}

/** Tax credits reduce tax: they are income-tax components the person receives, not pays. */
const CREDIT_FORMULAS: ReadonlySet<FormulaId> = new Set<FormulaId>(['income.workTaxCredit']);

export function directionOf(id: FormulaId): Direction {
  return categoryOf(id) === 'benefit' || CREDIT_FORMULAS.has(id) ? 'received' : 'paid';
}

/** User-facing line-item names (Norwegian). Parameter-only rules never become components. */
export const COMPONENT_LABEL: Record<FormulaId, string> = {
  'income.generalRate': 'Skatt på alminnelig inntekt',
  'income.bracketTax': 'Trinnskatt',
  'income.socialSecurity': 'Trygdeavgift',
  'income.personalAllowance': 'Personfradrag',
  'income.minimumDeductionWage': 'Minstefradrag i lønn',
  'income.minimumDeductionPension': 'Minstefradrag i pensjon',
  'income.unionFeeDeduction': 'Fagforeningsfradrag',
  'income.workTaxCredit': 'Jobbfradrag (H), antatt flat',
  'wealth.netWealthTax': 'Formuesskatt',
  'wealth.valuation': 'Verdsettelse av formue',
  'vat.food': 'Merverdiavgift på mat',
  'vat.general': 'Merverdiavgift, alminnelig sats',
  'vat.transportServices': 'Merverdiavgift på persontransport',
  'vat.electricity': 'Merverdiavgift på strøm',
  'vat.fuel': 'Merverdiavgift på drivstoff',
  'vat.alcoholTobacco': 'Merverdiavgift på alkohol og tobakk',
  'vat.flights': 'Merverdiavgift på flyreiser',
  'excise.petrolLitre': 'Avgifter på bensin',
  'excise.dieselLitre': 'Avgifter på diesel',
  'excise.kwh': 'Elavgift',
  'excise.flightEurope': 'Flypassasjeravgift, Europa',
  'excise.flightOther': 'Flypassasjeravgift, utenfor Europa',
  'excise.beerLitre': 'Alkoholavgift på øl',
  'excise.wineLitre': 'Alkoholavgift på vin',
  'excise.spiritsLitre': 'Alkoholavgift på brennevin',
  'excise.cigarette': 'Tobakksavgift på sigaretter',
  'excise.snusGram': 'Tobakksavgift på snus',
  'benefit.childBenefit': 'Barnetrygd',
  'benefit.studentSupport': 'Studiestøtte (stipenddel)',
  'employer.contribution': 'Arbeidsgiveravgift',
};

/**
 * VAT category that applies on top of each excise duty (the consumer pays VAT on the duty).
 * Flights: domestic flights carry reduced VAT, international flights none; the passenger
 * duty is charged on both, so no VAT is added on flight duties (conservative choice).
 */
export const VAT_ON_EXCISE: Record<ExciseGood, Exclude<VatCategory, 'exempt'> | null> = {
  petrolLitre: 'fuel',
  dieselLitre: 'fuel',
  kwh: 'electricity',
  flightEurope: null,
  flightOther: null,
  beerLitre: 'alcoholTobacco',
  wineLitre: 'alcoholTobacco',
  spiritsLitre: 'alcoholTobacco',
  cigarette: 'alcoholTobacco',
  snusGram: 'alcoholTobacco',
};

/**
 * Kroner amounts at which a formula's marginal behaviour changes. The threshold test
 * evaluates every rule set at t−1 / t / t+1 for each of these.
 */
export function thresholdsOf<F extends FormulaId>(id: F, params: FormulaParams[F]): readonly Kroner[] {
  switch (id) {
    case 'income.bracketTax': {
      const p = params as FormulaParams['income.bracketTax'];
      return p.brackets.map((b) => b.threshold);
    }
    case 'income.socialSecurity': {
      const p = params as FormulaParams['income.socialSecurity'];
      // Phase-in stops binding where phaseIn × (P − lower) = wageRate × P.
      const out: Kroner[] = [p.lowerThreshold];
      if (p.phaseInRateBp > p.wageRateBp) {
        out.push(toKroner((p.phaseInRateBp * p.lowerThreshold) / (p.phaseInRateBp - p.wageRateBp)));
      }
      return out;
    }
    case 'income.minimumDeductionWage':
    case 'income.minimumDeductionPension': {
      const p = params as FormulaParams['income.minimumDeductionWage'];
      const out: Kroner[] = [];
      if (p.rateBp > 0) {
        out.push(toKroner((p.max * 10_000) / p.rateBp));
        if (p.min > 0) out.push(toKroner((p.min * 10_000) / p.rateBp));
      }
      return out;
    }
    case 'income.personalAllowance':
      return [(params as FormulaParams['income.personalAllowance']).amount];
    case 'income.unionFeeDeduction':
      return [(params as FormulaParams['income.unionFeeDeduction']).max];
    case 'wealth.netWealthTax': {
      const p = params as FormulaParams['wealth.netWealthTax'];
      return [p.single.allowance, p.single.tier2Threshold, p.couple.allowance, p.couple.tier2Threshold];
    }
    case 'wealth.valuation':
      return [(params as FormulaParams['wealth.valuation']).primaryHomeHighValueThreshold];
    case 'employer.contribution':
      return [(params as FormulaParams['employer.contribution']).extraThreshold];
    default:
      return [];
  }
}

export function makeComponent(
  rs: ResolvedRuleSet,
  formulaId: FormulaId,
  amount: Kroner,
  inputs: Record<string, number>,
  adultIndex?: number,
): Component {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`komponent ${formulaId} fikk ugyldig beløp ${String(amount)}`);
  }
  const base: Component = {
    id: adultIndex === undefined ? formulaId : `${formulaId}#${adultIndex}`,
    formulaId,
    category: categoryOf(formulaId),
    label: COMPONENT_LABEL[formulaId],
    direction: directionOf(formulaId),
    amount,
    inputs,
    ruleSetId: rs.id,
  };
  return adultIndex === undefined ? base : { ...base, adultIndex };
}
