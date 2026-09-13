import type { DataStatus, PartyId } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';

/** Display columns — matches DATA_STATUS.md and the planned gen-data-status output. */
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

export type PartyDataStatusRow = Record<DataStatusCategory, DataStatus>;

/**
 * Snapshot mirrored from DATA_STATUS.md until `scripts/gen-data-status.ts` feeds the UI.
 * All parties are `not-reviewed` while the data layer (S7) is under extraction.
 */
export const DATA_STATUS_SNAPSHOT: Record<PartyId, PartyDataStatusRow> = Object.fromEntries(
  PARTY_IDS.map((id) => [
    id,
    {
      incomeTax: 'not-reviewed',
      wealthTax: 'not-reviewed',
      vat: 'not-reviewed',
      excise: 'not-reviewed',
      benefits: 'not-reviewed',
      employer: 'not-reviewed',
    },
  ]),
) as Record<PartyId, PartyDataStatusRow>;
