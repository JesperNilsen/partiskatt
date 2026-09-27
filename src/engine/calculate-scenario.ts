import type {
  Adult,
  Component,
  Consumption,
  ExciseGood,
  Kroner,
  PartyId,
  PartyResult,
  ScenarioResult,
  Toggles,
  UserProfile,
  VatCategory,
  Wealth,
} from '../types/index.ts';
import { DEFAULT_PRICE_YEAR, EXCISE_GOODS, PRICE_YEARS, VAT_CATEGORIES } from '../types/index.ts';
import { computeBenefits } from './benefits.ts';
import { computeConsumptionTaxes } from './consumption.ts';
import { computeEmployerContribution } from './employer-contribution.ts';
import { compareScenarios, summarizeParty } from './headline.ts';
import { computeIncomeTax } from './income-tax.ts';
import { neg, sanitizeKroner, sanitizeUnits, sum } from './money.ts';
import type { DataBundle } from './resolve.ts';
import { resolveBaseline, resolveRuleSet } from './resolve.ts';
import type { ResolvedRuleSet } from './rule-set.ts';
import { computeWealthTax } from './wealth-tax.ts';

function clampInt(input: unknown, lo: number, hi: number, fallback: number): number {
  const n = typeof input === 'number' ? input : Number(input);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

function cleanAdult(a: Partial<Adult> | undefined): Adult {
  return {
    wageIncome: sanitizeKroner(a?.wageIncome),
    pensionIncome: sanitizeKroner(a?.pensionIncome),
    capitalIncome: sanitizeKroner(a?.capitalIncome),
    interestExpense: sanitizeKroner(a?.interestExpense),
    unionFee: sanitizeKroner(a?.unionFee),
    isStudent: a?.isStudent === true,
    studyMonths: clampInt(a?.studyMonths, 0, 11, 0),
  };
}

function cleanWealth(w: Partial<Wealth> | undefined): Wealth {
  return {
    primaryHomeValue: sanitizeKroner(w?.primaryHomeValue),
    secondaryHomeValue: sanitizeKroner(w?.secondaryHomeValue),
    bankDeposits: sanitizeKroner(w?.bankDeposits),
    listedShares: sanitizeKroner(w?.listedShares),
    otherTaxableWealth: sanitizeKroner(w?.otherTaxableWealth),
    debt: sanitizeKroner(w?.debt),
  };
}

function cleanConsumption(c: Partial<Consumption> | undefined): Consumption {
  const spend = {} as Record<VatCategory, Kroner>;
  for (const cat of VAT_CATEGORIES) spend[cat] = sanitizeKroner(c?.spend?.[cat]);
  const units = {} as Record<ExciseGood, number>;
  for (const good of EXCISE_GOODS) units[good] = sanitizeUnits(c?.units?.[good]);
  return { spend, units };
}

/** Coerce untrusted UI / sessionStorage input into a well-formed profile. Never throws. */
export function sanitizeProfile(profile: UserProfile): UserProfile {
  const rawAdults: readonly Partial<Adult>[] = Array.isArray(profile.adults) ? profile.adults : [];
  const adults: UserProfile['adults'] =
    rawAdults.length >= 2 ? [cleanAdult(rawAdults[0]), cleanAdult(rawAdults[1])] : [cleanAdult(rawAdults[0])];
  const ages = Array.isArray(profile.childrenAges) ? profile.childrenAges : [];
  const childrenAges = ages
    .map((age) => {
      const n = typeof age === 'number' ? age : Number(age);
      return Number.isFinite(n) ? Math.round(n) : -1;
    })
    .filter((age) => age >= 0 && age <= 17)
    .slice(0, 20);
  return {
    version: 1,
    mode: adults.length === 2 ? 'household' : profile.mode === 'household' ? 'household' : 'person',
    adults,
    childrenAges,
    wealth: cleanWealth(profile.wealth),
    consumption: cleanConsumption(profile.consumption),
    consumptionProfileId: profile.consumptionProfileId ?? 'custom',
    // Passes through untouched: the engine never reads it (spend is already in whichever
    // prices it was seeded or typed in). Anything but a known price year becomes the default.
    priceYear: PRICE_YEARS.includes(profile.priceYear) ? profile.priceYear : DEFAULT_PRICE_YEAR,
  };
}

/** All line items for one profile under one rule set. `reference` fixes the ex-VAT consumption base. */
export function computeScenario(profile: UserProfile, rs: ResolvedRuleSet, reference: ResolvedRuleSet): ScenarioResult {
  const components: Component[] = [];
  profile.adults.forEach((adult, i) => components.push(...computeIncomeTax(adult, i, rs)));
  components.push(computeWealthTax(profile.wealth, profile.adults.length === 2 ? 2 : 1, rs));
  components.push(...computeConsumptionTaxes(profile.consumption, rs, reference));
  components.push(...computeBenefits(profile, rs));
  profile.adults.forEach((adult, i) => components.push(computeEmployerContribution(adult, i, rs)));
  const net = sum(
    components
      .filter((c) => c.category !== 'employer')
      .map((c) => (c.direction === 'received' ? c.amount : neg(c.amount))),
  );
  return { ruleSetId: rs.id, components, net };
}

export function calculateParty(profile: UserProfile, party: PartyId, data: DataBundle, toggles: Toggles): PartyResult {
  const clean = sanitizeProfile(profile);
  const adopted = resolveBaseline(data.adopted);
  const resolution = resolveRuleSet(party, data, toggles);
  const ref = computeScenario(clean, adopted, adopted);
  const alt = computeScenario(clean, resolution.ruleSet, adopted);
  return summarizeParty(party, compareScenarios(ref, alt), resolution.excluded, resolution.appliedRuleCount, toggles);
}

/** Every party in the bundle, best headline first (ties broken by party id for stable rendering). */
export function calculateAll(profile: UserProfile, toggles: Toggles, data: DataBundle): PartyResult[] {
  return data.parties
    .map((p) => calculateParty(profile, p.id, data, toggles))
    .sort((a, b) => b.headline - a.headline || a.party.localeCompare(b.party));
}
