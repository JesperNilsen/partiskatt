import { kr } from '../engine/money.ts';
import { consumptionFor } from '../data/consumption-profiles.ts';
import type {
  Adult,
  Consumption,
  ConsumptionProfileId,
  ExciseGood,
  UserProfile,
  VatCategory,
  Wealth,
} from '../types/index.ts';

export const DEFAULT_CONSUMPTION_PROFILE: ConsumptionProfileId = 'typisk';

export function emptyAdult(): Adult {
  return {
    wageIncome: kr(0),
    pensionIncome: kr(0),
    capitalIncome: kr(0),
    interestExpense: kr(0),
    unionFee: kr(0),
    isStudent: false,
    studyMonths: 0,
  };
}

function emptyWealth(): Wealth {
  return {
    primaryHomeValue: kr(0),
    secondaryHomeValue: kr(0),
    bankDeposits: kr(0),
    listedShares: kr(0),
    otherTaxableWealth: kr(0),
    debt: kr(0),
  };
}

export function createProfile(): UserProfile {
  return {
    version: 1,
    mode: 'person',
    adults: [emptyAdult()],
    childrenAges: [],
    wealth: emptyWealth(),
    consumption: consumptionFor(DEFAULT_CONSUMPTION_PROFILE, 1, 0),
    consumptionProfileId: DEFAULT_CONSUMPTION_PROFILE,
  };
}

export type ProfileAction =
  | { type: 'mode'; mode: 'person' | 'household' }
  | { type: 'adult'; index: number; patch: Partial<Adult> }
  | { type: 'addChild' }
  | { type: 'removeChild'; index: number }
  | { type: 'childAge'; index: number; age: number }
  | { type: 'wealth'; patch: Partial<Wealth> }
  | { type: 'consumptionProfile'; id: ConsumptionProfileId }
  | { type: 'spend'; category: VatCategory; value: number }
  | { type: 'units'; good: ExciseGood; value: number }
  | { type: 'reset' };

function asAdults(list: readonly Adult[]): UserProfile['adults'] {
  const first = list[0] ?? emptyAdult();
  const second = list[1];
  return second ? [first, second] : [first];
}

/** Keep a preset consumption profile in step with household size; leave custom spend alone. */
function rescale(profile: UserProfile): UserProfile {
  if (profile.consumptionProfileId === 'custom') return profile;
  return {
    ...profile,
    consumption: consumptionFor(profile.consumptionProfileId, profile.adults.length, profile.childrenAges.length),
  };
}

function withCustomConsumption(profile: UserProfile, consumption: Consumption): UserProfile {
  return { ...profile, consumption, consumptionProfileId: 'custom' };
}

export function profileReducer(state: UserProfile, action: ProfileAction): UserProfile {
  switch (action.type) {
    case 'mode': {
      if (action.mode === state.mode) return state;
      const adults =
        action.mode === 'household' ? asAdults([...state.adults, state.adults[1] ?? emptyAdult()]) : asAdults([state.adults[0]]);
      return rescale({ ...state, mode: action.mode, adults });
    }
    case 'adult': {
      const adults = state.adults.map((adult, i) => (i === action.index ? { ...adult, ...action.patch } : adult));
      return { ...state, adults: asAdults(adults) };
    }
    case 'addChild':
      if (state.childrenAges.length >= 10) return state;
      return rescale({ ...state, childrenAges: [...state.childrenAges, 5] });
    case 'removeChild':
      return rescale({ ...state, childrenAges: state.childrenAges.filter((_, i) => i !== action.index) });
    case 'childAge': {
      const age = Math.min(17, Math.max(0, Math.round(action.age)));
      return { ...state, childrenAges: state.childrenAges.map((a, i) => (i === action.index ? age : a)) };
    }
    case 'wealth':
      return { ...state, wealth: { ...state.wealth, ...action.patch } };
    case 'consumptionProfile':
      return {
        ...state,
        consumptionProfileId: action.id,
        consumption: consumptionFor(action.id, state.adults.length, state.childrenAges.length),
      };
    case 'spend':
      return withCustomConsumption(state, {
        ...state.consumption,
        spend: { ...state.consumption.spend, [action.category]: kr(Math.max(0, Math.round(action.value))) },
      });
    case 'units':
      return withCustomConsumption(state, {
        ...state.consumption,
        units: { ...state.consumption.units, [action.good]: Math.max(0, action.value) },
      });
    case 'reset':
      return createProfile();
  }
}

/** True until the user has entered anything the calculator can meaningfully work from. */
export function isProfileEmpty(profile: UserProfile): boolean {
  const income = profile.adults.some(
    (a) => a.wageIncome > 0 || a.pensionIncome > 0 || a.capitalIncome > 0 || (a.isStudent && a.studyMonths > 0),
  );
  const wealth = Object.values(profile.wealth).some((v) => v > 0);
  return !income && !wealth;
}
