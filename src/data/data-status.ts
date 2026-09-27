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
    'income.workTaxCredit',
    'income.pensionTaxCredit',
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

const MOMS_TITLE_PATTERN = /mva|moms|mat/i;
const SAERAVGIFT_TITLE_PATTERN = /avgift|bensin|diesel|elavgift|fly|alkohol|tobakk/i;

/**
 * Classifies an unquantified consumption-tax proposal's title into exactly
 * one of the two UI columns ("Moms" or "Særavgifter").
 *
 * Tie rule (named `no-silent-classification`, decided 2026-09-26): a title
 * must match exactly one of the two patterns. Zero matches used to vanish
 * silently from `DATA_STATUS.md` and `/kilder`; two matches used to be
 * silently double-counted into both columns (e.g. a hypothetical title like
 * "Avgift på matvarer" hits both `mat` and `avgift`). Neither failure mode is
 * safe to resolve automatically by pattern priority — a human must either fix
 * the title/pattern or record an explicit reason the proposal can't be
 * classified. So both cases throw here, in production code, rather than in a
 * test only.
 */
export function classifyConsumptionTaxTitle(partyId: PartyId, title: string): 'Moms' | 'Særavgifter' {
  const isMoms = MOMS_TITLE_PATTERN.test(title);
  const isSaeravgift = SAERAVGIFT_TITLE_PATTERN.test(title);

  if (isMoms === isSaeravgift) {
    const reason = isMoms
      ? 'treffer BÅDE Moms- og Særavgifter-mønsteret'
      : 'treffer INGEN av Moms- eller Særavgifter-mønsteret';
    throw new Error(
      `Uklassifisert forbruksavgift-forslag hos "${partyId}": tittelen "${title}" ${reason} — ` +
        'kan ikke plasseres i nøyaktig én kolonne i DATA_STATUS.md/`/kilder`.',
    );
  }

  return isMoms ? 'Moms' : 'Særavgifter';
}

function unquantifiedForColumn(partyId: PartyId, column: DisplayColumn) {
  const party = DATA_BUNDLE.parties.find((p) => p.id === partyId)!;
  const cat = COLUMN_CATEGORY[column];
  return party.unquantified.filter((u) => {
    if (u.category !== cat) return false;
    if (u.category !== 'consumption-tax') return true;
    return classifyConsumptionTaxTitle(partyId, u.title) === column;
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
