/**
 * Presentational lookup: which of a party's rules sit behind a PartyResult, with
 * the status and provenance the party card shows per rule. Provenance comes from
 * the party's own rule set (src/data), never from UI constants.
 */
import { partyOf, sourceOf } from '../data/index.ts';
import { parsePageRefs } from '../data/provenance.ts';
import { sum, toKroner } from '../engine/money.ts';
import type { DataStatus, FormulaId, Kroner, PartyResult, Provenance } from '../types/index.ts';
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
   * "gjelder fra 1. september; hovedtallet viser helårseffekt" when the rule's `effectiveDate`
   * is not 1 January. The headline stays a full-year policy-rate comparison (decision 1,
   * 2026-09-25, reaffirmed as D2 on 2026-09-27) — it is not a 2026 cash-flow forecast.
   * `undefined` when the rule takes effect at the start of the year or has no provenance.
   */
  readonly effectiveNote?: string | undefined;
  /**
   * D2 (2026-09-27): the rule's own 2026 effect, i.e. `midYearShare` of the annual delta
   * already computed by the engine (`PartyResult.components`, matched by `formulaId`, summed
   * across per-adult components). Only set on applied rows: an excluded row's componentDelta
   * is computed against the party's own value, which the engine never applies, so it is always
   * zero — showing a mid-year share of that zero would look like data instead of "not computed".
   */
  readonly midYearDelta?: Kroner | undefined;
}

/** Full year in the current data model: `Provenance.effectiveDate` defaults to this. */
const START_OF_YEAR = '2026-01-01';

/**
 * D2 (2026-09-27): the disbursement calendar `benefit.studentSupport` follows — January
 * through June, then August through December. No July, so 11 months, not 12.
 */
const STUDENT_SUPPORT_MONTHS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12];

function daysRemainingInYear(iso: string): number {
  const date = new Date(`${iso}T00:00:00Z`);
  const yearEnd = new Date(Date.UTC(date.getUTCFullYear(), 11, 31));
  return Math.round((yearEnd.getTime() - date.getTime()) / 86_400_000) + 1;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * D2 (2026-09-27): the share of 2026 a mid-year rule is actually in force, for the card's
 * "i 2026" figure. `benefit.studentSupport` follows the disbursement calendar (11 months,
 * no July); every other formula follows the plain calendar, counting from the 1st of the
 * effective month (13 − month) / 12. A date that is not the 1st of its month — none in the
 * current data — is prorated by days instead of whole months, since a mid-month start does
 * not correspond to a whole number of calendar months.
 */
export function midYearShare(formulaId: FormulaId, effectiveDate: string): number {
  const date = new Date(`${effectiveDate}T00:00:00Z`);
  const month = date.getUTCMonth() + 1;
  if (formulaId === 'benefit.studentSupport') {
    return STUDENT_SUPPORT_MONTHS.filter((m) => m >= month).length / STUDENT_SUPPORT_MONTHS.length;
  }
  if (date.getUTCDate() === 1) return (13 - month) / 12;
  return daysRemainingInYear(effectiveDate) / daysInYear(date.getUTCFullYear());
}

/**
 * The mid-year disclosure line for a rule, derived from its own `effectiveDate` — never
 * from a hard-coded list of parties or rule ids.
 */
export function effectiveDateNote(provenance: Provenance | null): string | undefined {
  if (!provenance || provenance.effectiveDate === START_OF_YEAR) return undefined;
  return `gjelder fra ${formatEffectiveDate(provenance.effectiveDate)}; hovedtallet viser helårseffekt`;
}

/**
 * D2 (2026-09-27): the rule's own 2026 figure — `midYearShare` of the annual delta the engine
 * already computed for this formula, summed across per-adult components. `undefined` unless
 * the rule is mid-year and has a computed component (i.e. it is an applied row).
 */
function midYearDelta(result: PartyResult, formulaId: FormulaId, provenance: Provenance | null): Kroner | undefined {
  if (!provenance || provenance.effectiveDate === START_OF_YEAR) return undefined;
  const annual = sum(result.components.filter((c) => c.formulaId === formulaId).map((c) => c.keptDelta));
  return toKroner(annual * midYearShare(formulaId, provenance.effectiveDate));
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
      midYearDelta: midYearDelta(result, d.id, d.provenance),
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

/**
 * D3: how many of the party's proposals never entered the arithmetic because they are not
 * tallfestet (`PartyRuleSet.unquantified`), for the card's "n forslag ikke tallfestet" chip.
 * Independent of `partyRuleRows`/`expanded` so the chip shows on a collapsed card too.
 */
export function unquantifiedCount(result: PartyResult): number {
  return partyOf(result.party).unquantified.length;
}
