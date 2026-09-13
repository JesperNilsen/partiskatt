import type { Category, DataStatus, FormulaId, PartyId } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';
import { DATA_BUNDLE } from './index.ts';

/** UI column ids — matches `DATA_STATUS.md` and `/kilder`. */
export type DataStatusCategory =
  | 'incomeTax'
  | 'wealthTax'
  | 'vat'
  | 'excise'
  | 'benefits'
  | 'employer';

export const DATA_STATUS_CATEGORIES: readonly {
  id: DataStatusCategory;
  label: string;
}[] = [
  { id: 'incomeTax', label: 'Inntektsskatt' },
  { id: 'wealthTax', label: 'Formuesskatt' },
  { id: 'vat', label: 'Moms' },
  { id: 'excise', label: 'Særavgifter' },
  { id: 'benefits', label: 'Kontantytelser' },
  { id: 'employer', label: 'Arbeidsgiveravgift' },
];

type DisplayColumn = (typeof DATA_STATUS_CATEGORIES)[number]['label'];

const COLUMN_BY_ID = {
  incomeTax: 'Inntektsskatt',
  wealthTax: 'Formuesskatt',
  vat: 'Moms',
  excise: 'Særavgifter',
  benefits: 'Kontantytelser',
  employer: 'Arbeidsgiveravgift',
} as const satisfies Record<DataStatusCategory, DisplayColumn>;

const COLUMN_FORMULAS: Record<DisplayColumn, readonly FormulaId[]> = {
  Inntektsskatt: [
    'income.generalRate',
    'income.bracketTax',
    'income.socialSecurity',
    'income.personalAllowance',
    'income.minimumDeductionWage',
    'income.minimumDeductionPension',
    'income.unionFeeDeduction',
  ],
  Formuesskatt: ['wealth.netWealthTax', 'wealth.valuation'],
  Moms: [
    'vat.food',
    'vat.general',
    'vat.transportServices',
    'vat.electricity',
    'vat.fuel',
    'vat.alcoholTobacco',
    'vat.flights',
  ],
  Særavgifter: [
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
  ],
  Kontantytelser: ['benefit.childBenefit', 'benefit.studentSupport'],
  Arbeidsgiveravgift: ['employer.contribution'],
};

const COLUMN_CATEGORY: Record<DisplayColumn, Category> = {
  Inntektsskatt: 'direct-tax',
  Formuesskatt: 'wealth-tax',
  Moms: 'consumption-tax',
  Særavgifter: 'consumption-tax',
  Kontantytelser: 'benefit',
  Arbeidsgiveravgift: 'employer',
};

const STATUS_RANK: Record<DataStatus, number> = {
  'not-reviewed': 5,
  unquantified: 4,
  estimated: 3,
  confirmed: 2,
  'not-applicable': 1,
};

function worstStatus(statuses: DataStatus[]): DataStatus {
  if (statuses.length === 0) return 'not-reviewed';
  return statuses.reduce((a, b) => (STATUS_RANK[a] >= STATUS_RANK[b] ? a : b));
}

function unquantifiedForColumn(partyId: PartyId, column: DisplayColumn) {
  const party = DATA_BUNDLE.parties.find((p) => p.id === partyId)!;
  const cat = COLUMN_CATEGORY[column];
  return party.unquantified.filter((u) => {
    if (u.category !== cat) return false;
    if (column === 'Moms') return /mva|moms|mat/i.test(u.title);
    if (column === 'Særavgifter') return /avgift|bensin|diesel|elavgift|fly|alkohol|tobakk/i.test(u.title);
    return true;
  });
}

/** Same aggregation as `scripts/gen-data-status.ts` / `DATA_STATUS.md`. */
export function partyColumnStatus(partyId: PartyId, category: DataStatusCategory): DataStatus {
  const column = COLUMN_BY_ID[category];
  const party = DATA_BUNDLE.parties.find((p) => p.id === partyId)!;
  const formulas = COLUMN_FORMULAS[column]!;
  const cat = COLUMN_CATEGORY[column]!;

  if (partyId === 'ap') return 'not-applicable';

  const reviewed = party.reviewed[cat as Category];
  const statuses: DataStatus[] = [];

  for (const f of formulas) {
    const delta = party.deltas.find((d) => d.id === f);
    if (delta) statuses.push(delta.status);
  }

  for (const u of unquantifiedForColumn(partyId, column)) {
    statuses.push(u.status);
  }

  if (statuses.length > 0) return worstStatus(statuses);

  if (reviewed) return reviewed.status === 'no-change' ? 'not-applicable' : 'not-applicable';

  return 'not-reviewed';
}

export type PartyDataStatusRow = Record<DataStatusCategory, DataStatus>;

/** Live table for `/kilder` — derived from `DATA_BUNDLE`, not a static snapshot. */
export function buildDataStatusTable(): Record<PartyId, PartyDataStatusRow> {
  return Object.fromEntries(
    PARTY_IDS.map((id) => [
      id,
      Object.fromEntries(
        DATA_STATUS_CATEGORIES.map((cat) => [cat.id, partyColumnStatus(id, cat.id)]),
      ) as PartyDataStatusRow,
    ]),
  ) as Record<PartyId, PartyDataStatusRow>;
}
