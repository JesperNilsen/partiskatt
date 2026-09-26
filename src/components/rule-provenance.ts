/**
 * Presentational lookup: which of a party's rules sit behind a PartyResult, with
 * the status and provenance the party card shows per rule. Provenance comes from
 * the party's own rule set (src/data), never from UI constants.
 */
import { partyOf, sourceOf } from '../data/index.ts';
import { parsePageRefs } from '../data/provenance.ts';
import type { DataStatus, PartyResult, Provenance } from '../types/index.ts';
import { formatEffectiveDate } from '../utils/format.ts';

export interface RuleRow {
  readonly key: string;
  readonly title: string;
  readonly status: DataStatus;
  readonly uncertain: boolean;
  /** Why the rule is left out of the headline; absent for rules in the arithmetic. */
  readonly reason?: string;
  /** `null` only if the excluded item cannot be matched to the party's data (a data bug). */
  readonly provenance: Provenance | null;
  /**
   * "gjelder fra 1. mars; vist som helårseffekt" when the rule's `effectiveDate` is not
   * 1 January (decision 1, 2026-09-25: mid-year rules stay full-year policy rates, no
   * pro-rating by date). `undefined` when the rule takes effect at the start of the year
   * or has no provenance.
   */
  readonly effectiveNote?: string | undefined;
}

/** Full year in the current data model: `Provenance.effectiveDate` defaults to this. */
const START_OF_YEAR = '2026-01-01';

/**
 * The mid-year disclosure line for a rule, derived from its own `effectiveDate` — never
 * from a hard-coded list of parties or rule ids.
 */
export function effectiveDateNote(provenance: Provenance | null): string | undefined {
  if (!provenance || provenance.effectiveDate === START_OF_YEAR) return undefined;
  return `gjelder fra ${formatEffectiveDate(provenance.effectiveDate)}; vist som helårseffekt`;
}

/** Compress sorted unique pages to ranges: [4,5,6,9] → "4–6, 9". */
function compressPages(pages: readonly number[]): string {
  const parts: string[] = [];
  let start = pages[0]!;
  let prev = start;
  for (const p of [...pages.slice(1), Number.NaN]) {
    if (p === prev + 1) {
      prev = p;
      continue;
    }
    parts.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = p;
    prev = p;
  }
  return parts.join(', ');
}

/** "PDF p32–33; p119" → "s. 32–33, 119". A non-page reference (§, table) is shown as written. */
export function formatPageRefs(pageOrTable: string): string {
  const pages = parsePageRefs(pageOrTable);
  if (!pages || pages.length === 0) return pageOrTable;
  return `s. ${compressPages(pages)}`;
}

/** The part of a manifest title before the subtitle dash. */
export function shortSourceTitle(title: string): string {
  return title.split(' — ')[0]!.trim();
}

export interface SourceLine {
  readonly title: string;
  readonly fullTitle: string;
  readonly url: string;
  readonly pages: string;
}

export function sourceLine(prov: Provenance): SourceLine {
  const entry = sourceOf(prov.sourceId);
  return {
    title: shortSourceTitle(entry.title),
    fullTitle: entry.title,
    url: prov.sourceUrl || entry.url,
    pages: formatPageRefs(prov.pageOrTable),
  };
}

/**
 * Rules the party changed that entered the arithmetic (`applied`) and the ones left
 * out of it (`excluded`, same order as `result.excluded`: gated deltas, then
 * unquantified proposals).
 */
export function partyRuleRows(result: PartyResult): { applied: RuleRow[]; excluded: RuleRow[] } {
  const party = partyOf(result.party);
  const excludedIds = new Set(result.excluded.flatMap((e) => (e.formulaId ? [e.formulaId] : [])));

  const applied: RuleRow[] = party.deltas
    .filter((d) => !excludedIds.has(d.id))
    .map((d) => ({
      key: d.id,
      title: d.label,
      status: d.status,
      uncertain: d.uncertain,
      provenance: d.provenance,
      effectiveNote: effectiveDateNote(d.provenance),
    }));

  const excluded: RuleRow[] = result.excluded.map((item, i) => {
    const provenance = item.formulaId
      ? (party.deltas.find((d) => d.id === item.formulaId)?.provenance ?? null)
      : (party.unquantified.find((u) => u.title === item.title)?.provenance ?? null);
    return {
      key: item.formulaId ?? `u${i}:${item.title}`,
      title: item.title,
      status: item.status,
      uncertain: item.uncertain,
      reason: item.reason,
      provenance,
      effectiveNote: effectiveDateNote(provenance),
    };
  });

  return { applied, excluded };
}
