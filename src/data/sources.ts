import manifest from '../../sources/manifest.json' with { type: 'json' };
import type { PartyId, Provenance } from '../types/index.ts';

export interface SourceEntry {
  readonly id: string;
  readonly party: string | null;
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
  readonly format: string;
  readonly retrievedAt: string;
  readonly method: string;
  readonly sha256: string | null;
  readonly bytes: number;
  readonly pages: number;
  readonly rawFile: string | null;
  readonly textFile: string | null;
  readonly status: string;
  readonly note?: string;
  readonly summaryTablePages?: readonly number[];
}

const ENTRIES = manifest as readonly SourceEntry[];

export const SOURCES: Readonly<Record<string, SourceEntry>> = Object.fromEntries(ENTRIES.map((e) => [e.id, e]));

/** Manifest id per opposition party budget (Ap has no alt document). */
export const PARTY_SOURCE_ID: Readonly<Record<PartyId, string>> = {
  ap: 'ap-alt-2026',
  h: 'h-alt-2026',
  frp: 'frp-alt-2026',
  sv: 'sv-alt-2026',
  sp: 'sp-alt-2026',
  r: 'r-alt-2026',
  v: 'v-alt-2026',
  mdg: 'mdg-alt-2026',
  krf: 'krf-alt-2026',
};

export function sourceOf(id: string): SourceEntry {
  const entry = SOURCES[id];
  if (!entry) throw new Error(`ukjent kilde-id: ${id}`);
  return entry;
}

export function partySource(party: PartyId): SourceEntry {
  return sourceOf(PARTY_SOURCE_ID[party]);
}

export function partyProv(
  party: PartyId,
  pageOrTable: string,
  anchor: string,
  method: string,
  effectiveDate = '2026-01-01',
  confidence: Provenance['confidence'] = 'high',
) {
  const s = partySource(party);
  return {
    sourceId: s.id,
    sourceUrl: s.url,
    pageOrTable,
    anchor,
    method,
    confidence,
    lastChecked: '2026-09-13',
    effectiveDate,
  };
}
