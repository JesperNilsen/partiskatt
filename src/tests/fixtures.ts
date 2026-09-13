import { kr } from '../engine/money.ts';
import type { Adult, Consumption, ExciseGood, Kroner, UserProfile, VatCategory, Wealth } from '../types/index.ts';
import { EXCISE_GOODS, VAT_CATEGORIES } from '../types/index.ts';

export function adult(overrides: Partial<Adult> = {}): Adult {
  return {
    wageIncome: kr(0),
    pensionIncome: kr(0),
    capitalIncome: kr(0),
    interestExpense: kr(0),
    unionFee: kr(0),
    isStudent: false,
    studyMonths: 0,
    ...overrides,
  };
}

export function wealth(overrides: Partial<Wealth> = {}): Wealth {
  return {
    primaryHomeValue: kr(0),
    secondaryHomeValue: kr(0),
    bankDeposits: kr(0),
    listedShares: kr(0),
    otherTaxableWealth: kr(0),
    debt: kr(0),
    ...overrides,
  };
}

export function consumption(
  spend: Partial<Record<VatCategory, number>> = {},
  units: Partial<Record<ExciseGood, number>> = {},
): Consumption {
  const s = {} as Record<VatCategory, Kroner>;
  for (const cat of VAT_CATEGORIES) s[cat] = kr(spend[cat] ?? 0);
  const u = {} as Record<ExciseGood, number>;
  for (const good of EXCISE_GOODS) u[good] = units[good] ?? 0;
  return { spend: s, units: u };
}

export function profile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    version: 1,
    mode: 'person',
    adults: [adult()],
    childrenAges: [],
    wealth: wealth(),
    consumption: consumption(),
    consumptionProfileId: 'custom',
    ...overrides,
  };
}

/** The five fixtures mandated by the brief. */
export const FIXTURES: Record<string, UserProfile> = {
  student: profile({
    adults: [adult({ wageIncome: kr(150_000), isStudent: true, studyMonths: 10 })],
    consumption: consumption({ food: 30_000, general: 40_000, transportServices: 8_000 }),
  }),
  medianSingle: profile({
    adults: [adult({ wageIncome: kr(600_000), unionFee: kr(6_000) })],
    consumption: consumption(
      { food: 50_000, general: 120_000, transportServices: 10_000, electricity: 15_000, fuel: 12_000 },
      { petrolLitre: 600, kwh: 12_000 },
    ),
  }),
  twoEarnersTwoKids: profile({
    mode: 'household',
    adults: [adult({ wageIncome: kr(700_000) }), adult({ wageIncome: kr(500_000) })],
    childrenAges: [3, 9],
    wealth: wealth({ primaryHomeValue: kr(6_000_000), bankDeposits: kr(400_000), debt: kr(4_000_000) }),
    consumption: consumption(
      { food: 110_000, general: 250_000, transportServices: 15_000, electricity: 30_000, fuel: 25_000 },
      { dieselLitre: 1_200, kwh: 25_000, flightEurope: 8 },
    ),
  }),
  highEarner: profile({
    adults: [adult({ wageIncome: kr(1_500_000), capitalIncome: kr(50_000) })],
    wealth: wealth({ listedShares: kr(3_000_000), bankDeposits: kr(1_000_000) }),
    consumption: consumption(
      { food: 80_000, general: 400_000, flights: 40_000, alcoholTobacco: 30_000 },
      { flightEurope: 12, flightOther: 4, wineLitre: 60 },
    ),
  }),
  homeownerWithWealth: profile({
    adults: [adult({ wageIncome: kr(850_000), interestExpense: kr(120_000) })],
    wealth: wealth({
      primaryHomeValue: kr(12_000_000),
      secondaryHomeValue: kr(3_000_000),
      listedShares: kr(2_000_000),
      bankDeposits: kr(500_000),
      debt: kr(5_000_000),
    }),
    consumption: consumption({ food: 60_000, general: 200_000, electricity: 25_000 }, { kwh: 20_000 }),
  }),
};
