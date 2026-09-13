import { kr, krPerUnit, pct } from '../engine/money.ts';
import type {
  AnyRule,
  FormulaId,
  FormulaParams,
  PartyId,
  PartyRuleSet,
  Provenance,
  Rule,
  UnquantifiedProposal,
} from '../types/index.ts';

/**
 * PROVISIONAL — demonstration deltas, NOT party policy.
 *
 * The real party rule sets come from the double extraction of the nine alternative budgets
 * (S6 → S7) and land in `src/data/parties/*.ts`. Until then the UI needs *some* set of
 * changed rules to render, so this module overlays invented values on the engine's
 * synthetic rule set. Every rule below carries `sourceId: 'demo'`, which is what
 * `isProvisional()` keys on, and the UI marks every number produced from it as demo data.
 *
 * Nothing here may be quoted as a party's position.
 */
export const DEMO_SOURCE_ID = 'demo';

const DEMO_PROVENANCE: Provenance = {
  sourceId: DEMO_SOURCE_ID,
  sourceUrl: 'about:blank',
  pageOrTable: 'n/a',
  anchor: 'demodata uten kilde',
  method: 'Oppdiktet verdi som bare finnes for å gjøre grensesnittet kjørbart før datalaget er ferdig.',
  confidence: 'low',
  lastChecked: '2026-09-13',
  effectiveDate: '2026-01-01',
};

function demoRule<F extends FormulaId>(
  id: F,
  params: FormulaParams[F],
  label: string,
  overrides: Partial<Omit<Rule<F>, 'id' | 'params' | 'label'>> = {},
): Rule<F> {
  return {
    id,
    params,
    status: 'estimated',
    uncertain: false,
    label,
    provenance: DEMO_PROVENANCE,
    ...overrides,
  };
}

function unquantified(title: string, reason: string): UnquantifiedProposal {
  return { category: 'direct-tax', title, status: 'unquantified', reason, provenance: DEMO_PROVENANCE };
}

function party(id: PartyId, deltas: readonly AnyRule[], proposals: readonly UnquantifiedProposal[] = []): PartyRuleSet {
  return { id, year: 2026, base: 'proposed', deltas, reviewed: {}, unquantified: proposals };
}

const WEALTH_VALUATION_BASE: FormulaParams['wealth.valuation'] = {
  primaryHomeBp: pct(25),
  primaryHomeHighValueThreshold: kr(10_000_000),
  primaryHomeHighValueBp: pct(70),
  secondaryHomeBp: pct(100),
  listedSharesBp: pct(80),
  bankDepositsBp: pct(100),
  otherBp: pct(100),
  debtReductionApplies: { secondaryHome: false, listedShares: true, other: false },
};

const BRACKETS_BASE: FormulaParams['income.bracketTax']['brackets'] = [
  { threshold: kr(200_000), rateBp: pct(1.7) },
  { threshold: kr(300_000), rateBp: pct(4) },
  { threshold: kr(700_000), rateBp: pct(13.7) },
  { threshold: kr(1_000_000), rateBp: pct(16.7) },
  { threshold: kr(1_500_000), rateBp: pct(17.7) },
];

/** Ap is the reference by construction: the adopted system is the government's policy. */
const ap = party('ap', []);

const h = party(
  'h',
  [
    demoRule('income.generalRate', { rateBp: pct(21) }, 'Skatt på alminnelig inntekt settes til 21 pst.'),
    demoRule(
      'income.minimumDeductionWage',
      { rateBp: pct(46), max: kr(100_000), min: kr(4_000) },
      'Øvre grense i minstefradraget økes til 100 000 kroner.',
    ),
    demoRule(
      'wealth.netWealthTax',
      {
        single: { allowance: kr(2_200_000), tier2Threshold: kr(20_700_000) },
        couple: { allowance: kr(4_400_000), tier2Threshold: kr(41_400_000) },
        tier1RateBp: pct(0.9),
        tier2RateBp: pct(1),
      },
      'Bunnfradraget i formuesskatten økes og satsene settes ned.',
    ),
    demoRule('excise.kwh', { ratePerUnit: krPerUnit(0.1) }, 'Elavgiften settes ned.', { uncertain: true }),
  ],
  [unquantified('Effektivisering av offentlig sektor', 'Provenyet er oppgitt samlet, ikke per skatteregel.')],
);

const frp = party(
  'frp',
  [
    demoRule('income.generalRate', { rateBp: pct(21.5) }, 'Skatt på alminnelig inntekt settes til 21,5 pst.'),
    demoRule('excise.petrolLitre', { ratePerUnit: krPerUnit(3.5) }, 'Veibruksavgiften på bensin settes ned.'),
    demoRule('excise.dieselLitre', { ratePerUnit: krPerUnit(3) }, 'Veibruksavgiften på diesel settes ned.'),
    demoRule(
      'wealth.netWealthTax',
      {
        single: { allowance: kr(3_000_000), tier2Threshold: kr(20_700_000) },
        couple: { allowance: kr(6_000_000), tier2Threshold: kr(41_400_000) },
        tier1RateBp: pct(0.8),
        tier2RateBp: pct(0.9),
      },
      'Formuesskatten trappes ned.',
    ),
    demoRule('vat.food', { rateBp: pct(12) }, 'Matmomsen settes ned til 12 pst.', { status: 'not-reviewed' }),
  ],
  [unquantified('Fjerning av formuesskatt på arbeidende kapital', 'Avgrensningen av «arbeidende kapital» er ikke tallfestet.')],
);

const sv = party('sv', [
  demoRule('income.generalRate', { rateBp: pct(23) }, 'Skatt på alminnelig inntekt settes til 23 pst.'),
  demoRule(
    'income.bracketTax',
    {
      brackets: [
        ...BRACKETS_BASE.slice(0, 3),
        { threshold: kr(1_000_000), rateBp: pct(19.7) },
        { threshold: kr(1_500_000), rateBp: pct(22.7) },
      ],
    },
    'Trinn 4 og 5 i trinnskatten økes.',
  ),
  demoRule(
    'wealth.netWealthTax',
    {
      single: { allowance: kr(1_700_000), tier2Threshold: kr(20_700_000) },
      couple: { allowance: kr(3_400_000), tier2Threshold: kr(41_400_000) },
      tier1RateBp: pct(1.3),
      tier2RateBp: pct(1.6),
    },
    'Formuesskatten økes.',
  ),
  demoRule(
    'benefit.childBenefit',
    { under6PerMonth: kr(2_400), from6PerMonth: kr(2_200), ageCutoff: 6, extendedSingleParentPerMonth: kr(1_800) },
    'Barnetrygden økes for alle aldersgrupper.',
  ),
]);

const sp = party('sp', [
  demoRule('vat.food', { rateBp: pct(12) }, 'Matmomsen settes ned til 12 pst.'),
  demoRule('excise.kwh', { ratePerUnit: krPerUnit(0.08) }, 'Elavgiften settes kraftig ned.'),
  demoRule('excise.dieselLitre', { ratePerUnit: krPerUnit(3.8) }, 'Veibruksavgiften på diesel settes ned.'),
]);

const r = party('r', [
  demoRule('income.personalAllowance', { amount: kr(115_000) }, 'Personfradraget økes til 115 000 kroner.'),
  demoRule(
    'income.bracketTax',
    {
      brackets: [
        ...BRACKETS_BASE.slice(0, 2),
        { threshold: kr(700_000), rateBp: pct(15.7) },
        { threshold: kr(1_000_000), rateBp: pct(21.7) },
        { threshold: kr(1_500_000), rateBp: pct(25.7) },
      ],
    },
    'Trinnskatten økes i de tre øverste trinnene.',
  ),
  demoRule(
    'wealth.netWealthTax',
    {
      single: { allowance: kr(1_500_000), tier2Threshold: kr(10_000_000) },
      couple: { allowance: kr(3_000_000), tier2Threshold: kr(20_000_000) },
      tier1RateBp: pct(1.5),
      tier2RateBp: pct(2.2),
    },
    'Formuesskatten økes og trinn 2 senkes.',
  ),
  demoRule('wealth.valuation', { ...WEALTH_VALUATION_BASE, listedSharesBp: pct(100) }, 'Aksjer verdsettes til 100 pst.'),
  demoRule(
    'benefit.childBenefit',
    { under6PerMonth: kr(2_600), from6PerMonth: kr(2_400), ageCutoff: 6, extendedSingleParentPerMonth: kr(2_000) },
    'Barnetrygden økes kraftig.',
  ),
]);

const v = party('v', [
  demoRule('income.personalAllowance', { amount: kr(110_000) }, 'Personfradraget økes til 110 000 kroner.'),
  demoRule('excise.petrolLitre', { ratePerUnit: krPerUnit(6.5) }, 'Veibruksavgiften på bensin økes.'),
  demoRule('excise.dieselLitre', { ratePerUnit: krPerUnit(5.5) }, 'Veibruksavgiften på diesel økes.'),
  demoRule('vat.transportServices', { rateBp: pct(9) }, 'Momsen på kollektivreiser settes ned til 9 pst.'),
  demoRule('excise.flightEurope', { ratePerUnit: krPerUnit(150) }, 'Flypassasjeravgiften økes.', { uncertain: true }),
]);

const mdg = party('mdg', [
  demoRule('excise.petrolLitre', { ratePerUnit: krPerUnit(7.5) }, 'Veibruks- og CO2-avgiften på bensin økes.'),
  demoRule('excise.dieselLitre', { ratePerUnit: krPerUnit(6.5) }, 'Veibruks- og CO2-avgiften på diesel økes.'),
  demoRule('excise.kwh', { ratePerUnit: krPerUnit(0.22) }, 'Elavgiften økes.'),
  demoRule('excise.flightEurope', { ratePerUnit: krPerUnit(200) }, 'Flypassasjeravgiften i Europa økes.'),
  demoRule('excise.flightOther', { ratePerUnit: krPerUnit(500) }, 'Flypassasjeravgiften utenfor Europa økes.'),
  demoRule('vat.food', { rateBp: pct(10) }, 'Matmomsen settes ned til 10 pst.'),
  demoRule(
    'benefit.childBenefit',
    { under6PerMonth: kr(2_200), from6PerMonth: kr(2_000), ageCutoff: 6, extendedSingleParentPerMonth: kr(1_800) },
    'Barnetrygden økes.',
  ),
]);

const krf = party(
  'krf',
  [
    demoRule(
      'benefit.childBenefit',
      { under6PerMonth: kr(2_500), from6PerMonth: kr(2_100), ageCutoff: 6, extendedSingleParentPerMonth: kr(2_100) },
      'Barnetrygden økes, mest for de yngste.',
    ),
    demoRule('income.personalAllowance', { amount: kr(108_000) }, 'Personfradraget økes til 108 000 kroner.'),
  ],
  [unquantified('Økt engangsstønad ved fødsel', 'Ytelsen er ikke modellert i motoren ennå.')],
);

export const DEMO_PARTIES: readonly PartyRuleSet[] = [ap, h, frp, sv, sp, r, v, mdg, krf];
