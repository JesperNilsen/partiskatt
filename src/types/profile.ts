import type { Kroner } from './money.ts';

export type VatCategory =
  | 'food' // næringsmidler
  | 'general' // alminnelige varer og tjenester (full sats)
  | 'transportServices' // persontransport (redusert sats)
  | 'electricity' // strøm inkl. nettleie (full sats; elavgift kommer i tillegg)
  | 'fuel' // drivstoff (full sats; veibruks- og CO2-avgift i tillegg)
  | 'alcoholTobacco' // full sats; særavgift i tillegg
  | 'flights' // flyreiser (innenlands redusert sats; flypassasjeravgift i tillegg)
  | 'exempt'; // husleie, renter, forsikring, helse m.m. — ingen mva

export type ExciseGood =
  | 'petrolLitre'
  | 'dieselLitre'
  | 'kwh'
  | 'flightEurope'
  | 'flightOther'
  | 'beerLitre' // 4,7 vol%
  | 'wineLitre' // 12 vol%
  | 'spiritsLitre' // 40 vol%
  | 'cigarette' // stk
  | 'snusGram';

export const VAT_CATEGORIES: readonly VatCategory[] = [
  'food',
  'general',
  'transportServices',
  'electricity',
  'fuel',
  'alcoholTobacco',
  'flights',
  'exempt',
];

export const EXCISE_GOODS: readonly ExciseGood[] = [
  'petrolLitre',
  'dieselLitre',
  'kwh',
  'flightEurope',
  'flightOther',
  'beerLitre',
  'wineLitre',
  'spiritsLitre',
  'cigarette',
  'snusGram',
];

export interface Adult {
  /** Brutto arbeidsinntekt per år. */
  wageIncome: Kroner;
  /** Brutto pensjon per år (MVP: 0 som standard). */
  pensionIncome: Kroner;
  /** Renteinntekter og annen kapitalinntekt utenom utbytte. */
  capitalIncome: Kroner;
  /** Renteutgifter (fradrag i alminnelig inntekt). */
  interestExpense: Kroner;
  /** Fagforeningskontingent betalt per år. */
  unionFee: Kroner;
  isStudent: boolean;
  /** Måneder med studiestøtte i året (0–11). */
  studyMonths: number;
}

/** Household-level gross values; the engine applies valuation discounts. */
export interface Wealth {
  primaryHomeValue: Kroner;
  secondaryHomeValue: Kroner;
  bankDeposits: Kroner;
  listedShares: Kroner;
  otherTaxableWealth: Kroner;
  debt: Kroner;
}

/** Household-level annual consumption under the reference system. */
export interface Consumption {
  /** Spend incl. VAT per category, kr/år. */
  spend: Record<VatCategory, Kroner>;
  /** Physical quantities per year for excise goods. */
  units: Record<ExciseGood, number>;
}

export type ConsumptionProfileId = 'noktern' | 'typisk' | 'hoy';

export interface UserProfile {
  version: 1;
  mode: 'person' | 'household';
  adults: readonly [Adult] | readonly [Adult, Adult];
  /** Alder i hele år for hvert barn under 18. */
  childrenAges: readonly number[];
  wealth: Wealth;
  consumption: Consumption;
  consumptionProfileId: ConsumptionProfileId | 'custom';
}

export interface Toggles {
  includeUncertain: boolean;
  includeEmployerContribution: boolean;
}

export const DEFAULT_TOGGLES: Toggles = {
  includeUncertain: false,
  includeEmployerContribution: false,
};
