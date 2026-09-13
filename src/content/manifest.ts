import manifest from '../../sources/manifest.json';
import type { PartyId } from '../types/index.ts';
import { PARTY_META } from '../config/parties.ts';

export type ManifestArchiveStatus = 'archived' | 'blocked' | 'not-applicable';

export interface SourceManifestEntry {
  id: string;
  party: string | null;
  title: string;
  publisher: string;
  url: string;
  format: string;
  retrievedAt: string;
  status: ManifestArchiveStatus;
  note?: string;
  pages?: number;
  summaryTablePages?: number[];
}

export const SOURCE_MANIFEST = manifest as SourceManifestEntry[];

const PARTY_MANIFEST_ALIASES: Record<string, PartyId> = {
  Ap: 'ap',
  H: 'h',
  FrP: 'frp',
  SV: 'sv',
  Sp: 'sp',
  Rødt: 'r',
  V: 'v',
  MDG: 'mdg',
  KrF: 'krf',
};

export function manifestPartyId(entry: SourceManifestEntry): PartyId | null {
  if (!entry.party) return null;
  return PARTY_MANIFEST_ALIASES[entry.party] ?? null;
}

export function manifestPartyLabel(entry: SourceManifestEntry): string | null {
  const id = manifestPartyId(entry);
  if (!id) return entry.party;
  return PARTY_META[id].shortName;
}

export interface ManifestGroups {
  baseline: SourceManifestEntry[];
  partyBudgets: SourceManifestEntry[];
  blocked: SourceManifestEntry[];
}

export function groupManifest(entries: readonly SourceManifestEntry[]): ManifestGroups {
  const baseline: SourceManifestEntry[] = [];
  const partyBudgets: SourceManifestEntry[] = [];
  const blocked: SourceManifestEntry[] = [];

  for (const entry of entries) {
    if (entry.status === 'blocked') {
      blocked.push(entry);
      continue;
    }
    if (entry.party) {
      partyBudgets.push(entry);
      continue;
    }
    baseline.push(entry);
  }

  partyBudgets.sort((a, b) => (manifestPartyLabel(a) ?? '').localeCompare(manifestPartyLabel(b) ?? '', 'nb'));

  return { baseline, partyBudgets, blocked };
}
