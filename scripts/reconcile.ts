/**
 * S6b — reconcile the two independent extraction sheets per party.
 *
 * Reads `sources/worksheets/<party>.claude.md` and `<party>.codex.md`, compares section A
 * row by row, and writes `<party>.reconciled.md` plus a cross-party report in
 * `sources/worksheets/RECONCILIATION.md`.
 *
 * The reconciler never invents a value and never resolves a disagreement. Its only job is
 * to say which rows S7 may encode and which rows must stay out of the headline:
 *
 *   both extractors agree            → keep the status they agree on
 *   they disagree, or only one found → `not-reviewed`, both readings kept in the note
 *   neither found anything           → `no-change` (nothing can enter the arithmetic either way)
 *
 * On top of that it raises flags for missing evidence (page, anchor, quoted baseline) and
 * for values that need an assumption (`estimated`) or an external baseline (`DERIVE`).
 *
 * KNOWN_KNOTS are the four snags carried over from the extraction pass. The script asserts
 * that each open knot still surfaces as a flagged row; if an open knot goes quiet, that means the
 * reconciler lost it rather than that it was resolved, so the run exits non-zero. A knot is closed
 * only by giving it a `resolution` in this file. A closed knot must then be quiet, and every row
 * it names must exist. A closed knot that still flags is also an error: either the resolution is
 * wrong, or the knot must be reopened.
 *
 * Usage: npm run reconcile [-- --check]
 *   --check  write nothing; fail if a committed sheet is stale or a knot has gone quiet
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHEETS = join(ROOT, 'sources', 'worksheets');
const RUN_DATE = new Date().toISOString().slice(0, 10);

const PARTIES = ['h', 'frp', 'sv', 'sp', 'r', 'v', 'mdg', 'krf'] as const;
type PartyKey = (typeof PARTIES)[number];

const PARTY_NAME: Record<PartyKey, string> = {
  h: 'Høyre',
  frp: 'Fremskrittspartiet',
  sv: 'Sosialistisk Venstreparti',
  sp: 'Senterpartiet',
  r: 'Rødt',
  v: 'Venstre',
  mdg: 'Miljøpartiet De Grønne',
  krf: 'Kristelig Folkeparti',
};

type Extractor = 'claude' | 'codex';
const EXTRACTORS: readonly Extractor[] = ['claude', 'codex'];

/** One section-A row as written in a sheet. */
interface SheetRow {
  formulaId: string;
  parameter: string;
  baseline: string;
  absolute: string;
  change: string;
  page: string;
  anchor: string;
  status: string;
  proveny: string;
  note: string;
}

interface Sheet {
  party: PartyKey;
  extractor: Extractor;
  rowsA: Map<string, SheetRow>;
  rowsB: string[][];
  rowsC: string[][];
  parseWarnings: string[];
}

// ---------------------------------------------------------------------------- parsing

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

function isSeparator(line: string): boolean {
  return /^\|[\s:|-]+\|?$/.test(line.trim());
}

/** Table rows of the section whose heading starts with `## <letter>.`. */
function tableOf(text: string, letter: 'A' | 'B' | 'C'): string[][] {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => l.startsWith(`## ${letter}.`));
  if (start === -1) return [];
  const out: string[][] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (line.startsWith('## ')) break;
    if (!line.trim().startsWith('|') || isSeparator(line)) continue;
    const cells = splitRow(line);
    const first = (cells[0] ?? '').toLowerCase();
    if (first.startsWith('formulaid') || first.startsWith('category') || first.startsWith('categor')) continue;
    out.push(cells);
  }
  return out;
}

const COLUMN_COUNT = 10;

function readSheet(party: PartyKey, extractor: Extractor): Sheet | null {
  const path = join(SHEETS, `${party}.${extractor}.md`);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  const rowsA = new Map<string, SheetRow>();
  const parseWarnings: string[] = [];
  for (const cells of tableOf(text, 'A')) {
    const formulaId = (cells[0] ?? '').replace(/`/g, '').trim();
    if (!/^[a-z]+\.[A-Za-z0-9.]+$/.test(formulaId)) {
      parseWarnings.push(`uparsable formulaId «${formulaId}»`);
      continue;
    }
    if (cells.length < COLUMN_COUNT) {
      parseWarnings.push(`${formulaId}: ${String(cells.length)} columns, expected ${String(COLUMN_COUNT)}`);
    }
    // A stray pipe inside the note would shift columns; fold any surplus back into the note.
    const note = cells.slice(COLUMN_COUNT - 1).join(' | ');
    const row: SheetRow = {
      formulaId,
      parameter: cells[1] ?? '',
      baseline: cells[2] ?? '',
      absolute: cells[3] ?? '',
      change: cells[4] ?? '',
      page: cells[5] ?? '',
      anchor: cells[6] ?? '',
      status: cells[7] ?? '',
      proveny: cells[8] ?? '',
      note,
    };
    if (rowsA.has(formulaId)) parseWarnings.push(`${formulaId}: duplicate row`);
    rowsA.set(formulaId, row);
  }
  return { party, extractor, rowsA, rowsB: tableOf(text, 'B'), rowsC: tableOf(text, 'C'), parseWarnings };
}

// ---------------------------------------------------------------------- normalisation

/**
 * Cell texts that mean «nothing here». The two extractors chose different vocabularies for
 * the same thing — `NOT FOUND`, `none quoted`, `—`, `uendret`, `(ingen endring foreslått)` —
 * so these have to normalise to one token or every such row reads as a disagreement.
 */
const ABSENT = new Set([
  '',
  '-',
  '—',
  '–',
  '.',
  'n/a',
  'na',
  'n.a.',
  'not found',
  'notfound',
  'none',
  'none quoted',
  'none proposed',
  'none stated',
  'no baseline quoted',
  'ingen',
  'ingen endring',
  'ingen endring foreslått',
  'ingen forslag',
  'uendret',
  'unchanged',
  'ikke sitert',
  'ikke oppgitt',
  'ikke nevnt',
  'ikke spesifisert',
  'ikke funnet',
  'ikke relevant',
]);

/** Lower-cased, whitespace- and punctuation-normalised cell text. */
function norm(cell: string): string {
  return cell
    .replace(/`/g, '')
    .replace(/[\u00a0\u202f\u2009]/g, ' ')
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAbsent(cell: string): boolean {
  const n = norm(cell).toLowerCase().replace(/^\((.*)\)$/, '$1').trim();
  if (ABSENT.has(n)) return true;
  // «uendret (innslagspunkt og sats)», «not found as a general rule», …
  return /^(uendret|unchanged|not found|ingen endring)\b/.test(n);
}

function hasDerive(cell: string): boolean {
  return /\bderive\b/i.test(cell);
}

/**
 * Several rows cover more than one parameter, e.g. «sats 16,2 %; innslagspunkt DERIVE».
 * `DERIVE` only voids the clause it stands in, so clauses are split on `;` and the ones
 * marked DERIVE are dropped before values are compared.
 */
function deriveFreeText(cell: string): string {
  return norm(cell)
    .split(/[;·]/)
    .filter((clause) => !hasDerive(clause))
    .join('; ');
}

const MONTHS = 'januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember';
const DATE_PHRASE = new RegExp(String.raw`\b\d{1,2}\.\s?(?:${MONTHS})\.?(?:\s+\d{4})?`, 'gi');
const STUDY_YEAR = /\b(?:19|20)\d{2}\s?[-–/]\s?(?:19|20)?\d{2}\b/g;

/**
 * Effective dates are provenance, not rule values, and the two extractors were inconsistent
 * about repeating them in the value column. They are compared separately.
 */
function dateTokens(cell: string): string[] {
  const n = norm(cell);
  const out = [...(n.match(DATE_PHRASE) ?? []), ...(n.match(STUDY_YEAR) ?? [])];
  return out.map((d) => d.toLowerCase().replace(/\s+/g, ' ').trim()).sort();
}

function stripDates(cell: string): string {
  return norm(cell).replace(DATE_PHRASE, ' ').replace(STUDY_YEAR, ' ');
}

/**
 * Numbers a cell states, normalised so that `kr 150 000`, `150 000 kr`, `125.000` and
 * `150000` all compare equal, and `7,13 øre` compares equal to `7.13`. A period followed by
 * exactly three digits is a Norwegian thousands separator, not a decimal point.
 */
function numbersOf(cell: string): string[] {
  const n = stripDates(cell).replace(/(\d)\.(\d{3})(?!\d)/g, '$1$2');
  const out: string[] = [];
  for (const m of n.matchAll(/-?\d[\d\s]*(?:[.,]\d+)?/g)) {
    const raw = (m[0] ?? '').replace(/\s/g, '').replace(',', '.');
    const value = Number(raw);
    if (!Number.isFinite(value)) continue;
    out.push(String(value));
  }
  return out.sort();
}

function sameNumbers(a: string, b: string): boolean {
  const x = numbersOf(a);
  const y = numbersOf(b);
  return x.length === y.length && x.every((v, i) => v === y[i]);
}

type NormStatus =
  | 'confirmed'
  | 'estimated'
  | 'unquantified'
  | 'no-change'
  | 'not-applicable'
  | 'not-reviewed'
  | 'not-found'
  | 'unknown';

function normStatus(cell: string): NormStatus {
  const n = norm(cell).toLowerCase();
  if (n.startsWith('confirmed')) return 'confirmed';
  if (n.startsWith('estimated')) return 'estimated';
  if (n.startsWith('unquantified')) return 'unquantified';
  if (n.startsWith('no-change') || n.startsWith('no change')) return 'no-change';
  if (n.startsWith('not-applicable') || n.startsWith('not applicable')) return 'not-applicable';
  if (n.startsWith('not-reviewed') || n.startsWith('not reviewed')) return 'not-reviewed';
  if (n.startsWith('not found') || n.startsWith('not-found') || isAbsent(cell)) return 'not-found';
  return 'unknown';
}

/** Statuses that mean «nothing here can enter the arithmetic». */
const NOTHING_TO_ENCODE: readonly NormStatus[] = ['no-change', 'not-applicable', 'not-found'];

/** What the row offers S7. */
type ValueKind = 'value' | 'derive' | 'proposal-only' | 'absent';

/**
 * A cell can only supply a value if it states a digit. «uendret», «NOT FOUND» and a bare
 * `DERIVE` cannot, so a row whose status already says there is nothing to encode is treated
 * as empty even when the extractor wrote `DERIVE` next to it.
 */
function valueKindOf(row: SheetRow): ValueKind {
  const status = normStatus(row.status);
  const nothing = NOTHING_TO_ENCODE.includes(status);
  const stated = deriveFreeText(row.absolute);
  if (!isAbsent(stated) && numbersOf(stated).length > 0) return 'value';
  if (nothing) return 'absent';
  if (hasDerive(row.absolute)) return 'derive';
  if (numbersOf(row.change).length > 0) return 'proposal-only';
  return 'absent';
}

// ----------------------------------------------------------------------- reconciliation

type Verdict =
  | 'agreed-value'
  | 'agreed-proposal'
  | 'agreed-nothing'
  | 'value-conflict'
  | 'status-conflict'
  | 'review-conflict'
  | 'one-sided'
  | 'evidence-conflict'
  | 'only-in-one-sheet';

interface Flag {
  code: string
  detail: string;
  severity: 'high' | 'medium' | 'note';
}

interface Reconciled {
  party: PartyKey;
  formulaId: string;
  parameter: string;
  verdict: Verdict;
  /** The status S7 must use. Never upgraded, only kept or lowered to `not-reviewed`. */
  resolvedStatus: NormStatus;
  claude: SheetRow | null;
  codex: SheetRow | null;
  flags: Flag[];
}

const CONFLICTS: readonly Verdict[] = [
  'value-conflict',
  'status-conflict',
  'review-conflict',
  'one-sided',
  'evidence-conflict',
  'only-in-one-sheet',
];

function isConflict(v: Verdict): boolean {
  return CONFLICTS.includes(v);
}

function flag(flags: Flag[], code: string, detail: string, severity: Flag['severity']): void {
  flags.push({ code, detail, severity });
}

/** Evidence and confidence flags for one side of a row that claims something. */
function evidenceFlags(row: SheetRow, who: Extractor, flags: Flag[]): void {
  // Checked even for empty rows: an unreadable source is exactly why a row came out empty.
  if (/\bblank\b|tom(t|me)? (vedlegg|side|sider)|empty (annex|page|appendix)|pdftotext|ikke lesbar/i.test(row.note)) {
    flag(
      flags,
      'source-text-incomplete',
      `${who} reports that part of the source text is unreadable: ${norm(row.note).slice(0, 160)}`,
      'medium',
    );
  }
  if (normStatus(row.status) === 'unknown') {
    flag(flags, 'unreadable-status', `${who} wrote status «${norm(row.status)}»`, 'medium');
  }
  const kind = valueKindOf(row);
  if (kind === 'absent') return;
  if (isAbsent(row.page)) flag(flags, 'missing-page', `${who} states a value without a page`, 'medium');
  if (isAbsent(row.anchor)) flag(flags, 'missing-anchor', `${who} states a value without a verbatim anchor`, 'medium');
  if (normStatus(row.status) === 'estimated') {
    flag(flags, 'estimated', `${who} needs an assumption: ${norm(row.note).slice(0, 160)}`, 'high');
  }
  if (kind === 'derive') {
    flag(flags, 'derive', `${who} could not derive an absolute value from the document`, 'medium');
  }
  if (isAbsent(row.baseline) && !isAbsent(row.change)) {
    flag(
      flags,
      'no-baseline-quoted',
      `${who}: the party states a change but quotes no baseline, so «party baseline = Prop. 1 LS» cannot be verified`,
      'medium',
    );
  }
  // A baseline quoted as «dagens» is the adopted/current rate, not the government proposal
  // every other party is measured against. Encoding it as a delta on `proposed` would be wrong.
  if (/\bdagens\b|\bi dag\b|\bgjeldende sats\b/i.test(row.baseline) || /mot dagens|dagens nivå|ikke mot prop/i.test(row.note)) {
    flag(
      flags,
      'baseline-not-proposed',
      `${who}: the party measures this change against today's rate, not against Prop. 1 LS`,
      'high',
    );
  }
}

function reconcileRow(party: PartyKey, formulaId: string, claude: SheetRow | null, codex: SheetRow | null): Reconciled {
  const flags: Flag[] = [];
  const parameter = norm(claude?.parameter ?? codex?.parameter ?? '');

  if (!claude || !codex) {
    const present = claude ?? codex;
    const who: Extractor = claude ? 'claude' : 'codex';
    if (present) evidenceFlags(present, who, flags);
    flag(flags, 'row-missing', `only ${who} has a row for ${formulaId}`, 'high');
    return {
      party,
      formulaId,
      parameter,
      verdict: 'only-in-one-sheet',
      resolvedStatus: 'not-reviewed',
      claude,
      codex,
      flags,
    };
  }

  evidenceFlags(claude, 'claude', flags);
  evidenceFlags(codex, 'codex', flags);

  const sClaude = normStatus(claude.status);
  const sCodex = normStatus(codex.status);
  const kClaude = valueKindOf(claude);
  const kCodex = valueKindOf(codex);

  if (!isAbsent(claude.page) && !isAbsent(codex.page) && !sameNumbers(claude.page, codex.page)) {
    flag(flags, 'page-mismatch', `claude cites p. ${norm(claude.page)}, codex p. ${norm(codex.page)}`, 'note');
  }
  if (
    !isAbsent(claude.baseline) &&
    !isAbsent(codex.baseline) &&
    numbersOf(claude.baseline).length > 0 &&
    numbersOf(codex.baseline).length > 0 &&
    !sameNumbers(claude.baseline, codex.baseline)
  ) {
    flag(
      flags,
      'baseline-mismatch',
      `the two readings quote different baselines: claude «${norm(claude.baseline)}» vs codex «${norm(codex.baseline)}»`,
      'high',
    );
  }

  if (kClaude !== 'absent' || kCodex !== 'absent') {
    const dClaude = [...dateTokens(claude.absolute), ...dateTokens(claude.change)];
    const dCodex = [...dateTokens(codex.absolute), ...dateTokens(codex.change)];
    const same = dClaude.length === dCodex.length && dClaude.every((d, i) => d === dCodex[i]);
    if (!same) {
      flag(
        flags,
        'effective-date-differs',
        `the two readings record different in-year start dates (claude: ${dClaude.join(', ') || 'none'}; ` +
          `codex: ${dCodex.join(', ') || 'none'}), which changes the annual amount`,
        'medium',
      );
    }
  }

  // Neither extractor found anything to quantify.
  if (kClaude === 'absent' && kCodex === 'absent') {
    if (sClaude === sCodex) {
      return { party, formulaId, parameter, verdict: 'agreed-nothing', resolvedStatus: sClaude, claude, codex, flags };
    }
    // Both agree there is no number; they only disagree about how exhaustively the category
    // was reviewed. Nothing can enter the arithmetic either way, so this is a documentation
    // gap, not a value conflict.
    if (NOTHING_TO_ENCODE.includes(sClaude) && NOTHING_TO_ENCODE.includes(sCodex)) {
      flag(
        flags,
        'review-status-mismatch',
        `both found no number, but claude says «${sClaude}» and codex says «${sCodex}»`,
        'note',
      );
      return { party, formulaId, parameter, verdict: 'agreed-nothing', resolvedStatus: 'no-change', claude, codex, flags };
    }
    flag(
      flags,
      'review-conflict',
      `no number on either side, but they disagree about whether a proposal exists: claude «${sClaude}» vs codex «${sCodex}»`,
      'medium',
    );
    return { party, formulaId, parameter, verdict: 'review-conflict', resolvedStatus: 'not-reviewed', claude, codex, flags };
  }

  // One extractor found a proposal the other did not see at all.
  if (kClaude === 'absent' || kCodex === 'absent') {
    const finder: Extractor = kClaude === 'absent' ? 'codex' : 'claude';
    flag(flags, 'one-sided', `only ${finder} found this proposal in the document`, 'high');
    return { party, formulaId, parameter, verdict: 'one-sided', resolvedStatus: 'not-reviewed', claude, codex, flags };
  }

  // Both saw something. Do the numbers they wrote down match?
  const valuesMatch = sameNumbers(deriveFreeText(claude.absolute), deriveFreeText(codex.absolute));
  // Values agree, but one side additionally marked a parameter in the same row as DERIVE:
  // that is a proposal the other extractor did not see at all.
  if (valuesMatch && !sameNumbers(claude.absolute, codex.absolute)) {
    flag(
      flags,
      'derive-detail-mismatch',
      `the encodable values agree, but the rows differ on what could not be derived: ` +
        `claude «${norm(claude.absolute)}» vs codex «${norm(codex.absolute)}»`,
      'medium',
    );
  }
  const changesMatch = sameNumbers(claude.change, codex.change);

  if (kClaude === 'value' && kCodex === 'value') {
    if (!valuesMatch) {
      flag(
        flags,
        'value-conflict',
        `claude «${norm(claude.absolute)}» vs codex «${norm(codex.absolute)}»`,
        'high',
      );
      return {
        party,
        formulaId,
        parameter,
        verdict: 'value-conflict',
        resolvedStatus: 'not-reviewed',
        claude,
        codex,
        flags,
      };
    }
    if (sClaude !== sCodex) {
      flag(flags, 'status-conflict', `same value, status «${sClaude}» vs «${sCodex}»`, 'high');
      return {
        party,
        formulaId,
        parameter,
        verdict: 'status-conflict',
        resolvedStatus: 'not-reviewed',
        claude,
        codex,
        flags,
      };
    }
    return { party, formulaId, parameter, verdict: 'agreed-value', resolvedStatus: sClaude, claude, codex, flags };
  }

  // At least one side has only a stated change (DERIVE / proposal-only).
  if (kClaude !== kCodex) {
    flag(
      flags,
      'evidence-conflict',
      `claude gives ${kClaude} «${norm(claude.absolute) || '—'}», codex gives ${kCodex} «${norm(codex.absolute) || '—'}»`,
      'high',
    );
    return {
      party,
      formulaId,
      parameter,
      verdict: 'evidence-conflict',
      resolvedStatus: 'not-reviewed',
      claude,
      codex,
      flags,
    };
  }
  if (!changesMatch) {
    flag(flags, 'change-conflict', `claude «${norm(claude.change)}» vs codex «${norm(codex.change)}»`, 'high');
    return {
      party,
      formulaId,
      parameter,
      verdict: 'value-conflict',
      resolvedStatus: 'not-reviewed',
      claude,
      codex,
      flags,
    };
  }
  if (sClaude !== sCodex) {
    flag(flags, 'status-conflict', `same wording, status «${sClaude}» vs «${sCodex}»`, 'high');
    return {
      party,
      formulaId,
      parameter,
      verdict: 'status-conflict',
      resolvedStatus: 'not-reviewed',
      claude,
      codex,
      flags,
    };
  }
  return { party, formulaId, parameter, verdict: 'agreed-proposal', resolvedStatus: sClaude, claude, codex, flags };
}

// --------------------------------------------------------------------------- the knots

/**
 * The four snags the extraction pass documented. Each open one must still show up as a flagged
 * row after reconciliation; `check` returns the rows that prove it.
 */
interface Knot {
  id: string;
  title: string;
  question: string;
  rows: { party: PartyKey; formulaId: string }[];
  /** Set only when the knot is settled with evidence; the check then requires the rows to be quiet. */
  resolution?: { date: string; by: string; summary: string };
}

const KNOWN_KNOTS: readonly Knot[] = [
  {
    id: 'K1-frikort-trygdeavgift',
    title: 'Frikortgrense 150 000 kr mapped onto the lower threshold for trygdeavgift',
    question:
      'Five parties propose «frikortgrensen til 150 000 kr». Legally the frikort limit IS the lower threshold in ' +
      'folketrygdloven § 23-3, but only Venstre’s document says so in as many words («inntektsgrense for å betale ' +
      'trygdeavgift»), which is why Venstre reconciles as `confirmed` and H, FrP, SV and Rødt do not. ' +
      'Encode all five as `income.socialSecurity.lowerThreshold` (the four as `estimated`, assumption documented), ' +
      'or keep the four out of the arithmetic as unquantified and let only Venstre count? Note that the parties ' +
      'quote the baseline as a round 100 000 kr while the adopted and proposed threshold is 99 650 kr, so the ' +
      '«party baseline = Prop. 1 LS» test in S7 will not match exactly either.',
    rows: [
      { party: 'h', formulaId: 'income.socialSecurity' },
      { party: 'frp', formulaId: 'income.socialSecurity' },
      { party: 'sv', formulaId: 'income.socialSecurity' },
      { party: 'r', formulaId: 'income.socialSecurity' },
    ],
  },
  {
    id: 'K2-krf-appendix-empty',
    title: 'KrF: the tax table is an image with no text layer (PDF p. 19); pp. 35–46 are spending tables',
    question:
      'KrF’s numeric annex did not survive `pdftotext -layout`, so both extractors read an incomplete document ' +
      'and agree on «nothing found» for most of section A — agreement that proves nothing. Re-extract with ' +
      '`pdftotext -raw` / table mode (or a PDF table extractor) before S7, or ship KrF with the affected ' +
      'categories visibly `not-reviewed` rather than `no-change`?',
    rows: [
      { party: 'krf', formulaId: 'income.generalRate' },
      { party: 'krf', formulaId: 'income.bracketTax.trinn1' },
      { party: 'krf', formulaId: 'income.personalAllowance' },
      { party: 'krf', formulaId: 'wealth.netWealthTax' },
    ],
    resolution: {
      date: '2026-09-26',
      by: 'sprint lane L10a: two independent vision reads (A: Opus, C: Sonnet) of the image-only pages, archived in sources/worksheets/krf.vision.md',
      summary:
        'The tax table is PDF p. 19, «Skatter og avgifter», and it is complete: its SUM rows reproduce, and its totals match p. 3 (bokført) and ' +
        'p. 18 (påløpt). It has no row for the rate on alminnelig inntekt, trinnskatt, personfradrag, minstefradrag, trygdeavgift or the ' +
        'formuesskatt satser, so those rows are `no-change`. pp. 35–46 are spending tables with no tax parameter. From p. 19 the tobacco duty ' +
        '(+15 pst) is encoded as `estimated`, derived from Prop. 1 LS. The alcohol, sugar, EV-VAT, youth-deduction, foreldrefradrag and ' +
        'bolig-verdsettelse rows stay unquantified, each with its reason in krf.ts.',
    },
  },
  {
    id: 'K3-venstre-elavgift-baseline',
    title: 'Venstre states the electricity duty against today’s rate, not against Prop. 1 LS',
    question:
      'Venstre’s change is quoted from a different baseline than every other party (adopted/current rate rather ' +
      'than the government proposal). Rebase it onto `proposed` before encoding, or treat the party’s own ' +
      'baseline as the reference for this one rule and document the exception?',
    rows: [{ party: 'v', formulaId: 'excise.kwh' }],
  },
  {
    id: 'K4-mdg-self-contradiction',
    title: 'MDG’s document contradicts itself across pages',
    question:
      'MDG quotes different figures for the same rules on different pages (personfradrag, trygdeavgift, ' +
      'flypassasjeravgift) and states no VAT rates or G-amount. Which page wins, or do the contradicting rules ' +
      'stay out of the arithmetic?',
    rows: [
      { party: 'mdg', formulaId: 'income.personalAllowance' },
      { party: 'mdg', formulaId: 'income.socialSecurity' },
      { party: 'mdg', formulaId: 'excise.flightEurope' },
    ],
  },
];

function isFlagged(r: Reconciled | undefined): boolean {
  if (!r) return false;
  return isConflict(r.verdict) || r.flags.some((f) => f.severity !== 'note');
}

// ----------------------------------------------------------------------------- output

function cell(s: string, fallback = '—'): string {
  const n = norm(s).replace(/\|/g, '\\|');
  return n.length === 0 ? fallback : n;
}

function short(s: string, max = 90): string {
  const n = cell(s);
  return n.length <= max ? n : `${n.slice(0, max - 1)}…`;
}

function flagList(flags: Flag[]): string {
  if (flags.length === 0) return '—';
  const codes = new Map<string, number>();
  for (const f of flags) codes.set(f.code, (codes.get(f.code) ?? 0) + 1);
  return [...codes].map(([code, n]) => (n > 1 ? `\`${code}\`×${String(n)}` : `\`${code}\``)).join(' ');
}

function renderPartySheet(party: PartyKey, rows: Reconciled[], sheets: Record<Extractor, Sheet>): string {
  const counts = tally(rows);
  const knots = KNOWN_KNOTS.filter((k) => k.rows.some((r) => r.party === party));
  const lines: string[] = [];
  lines.push(`# Avstemt ekstraksjonsark — ${PARTY_NAME[party]} (${party.toUpperCase()}), alternativt statsbudsjett 2026`);
  lines.push('');
  lines.push(
    `Generated by \`scripts/reconcile.ts\` on ${RUN_DATE} from \`${party}.claude.md\` and \`${party}.codex.md\`. ` +
      'Do not edit by hand — edit the source sheets and re-run.',
  );
  lines.push('');
  lines.push(
    'Only rows with `resolved status` = `confirmed`, `estimated` or `unquantified` may be encoded in ' +
      '`src/data/parties/*.ts` (S7), and only `confirmed`/`estimated` ever enter the headline. ' +
      '`not-reviewed` means the two independent extractions do not agree; the disagreement is kept below, ' +
      'unresolved, on purpose. `confirmed` here means «both extractors read the same explicit number in the ' +
      'document», not «checked against Skatteetaten» — that is still an operator gate.',
  );
  lines.push('');
  lines.push(
    `Rows: ${String(rows.length)} · agreed ${String(counts.agreed)} · conflicts ${String(counts.conflicts)} · ` +
      `flagged ${String(counts.flagged)} · encodable ${String(counts.encodable)}`,
  );
  lines.push('');
  lines.push('## A. Reconciled rules');
  lines.push('');
  lines.push('| formulaId | resolved status | verdict | claude absolute | codex absolute | claude status | codex status | page (c/x) | flags |');
  lines.push('|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) {
    lines.push(
      `| \`${r.formulaId}\` | ${r.resolvedStatus} | ${r.verdict} | ${short(r.claude?.absolute ?? '')} | ` +
        `${short(r.codex?.absolute ?? '')} | ${cell(r.claude?.status ?? '')} | ${cell(r.codex?.status ?? '')} | ` +
        `${cell(r.claude?.page ?? '')} / ${cell(r.codex?.page ?? '')} | ${flagList(r.flags)} |`,
    );
  }
  lines.push('');
  lines.push('## A2. Disagreements and flags in full');
  lines.push('');
  const detail = rows.filter((r) => isConflict(r.verdict) || r.flags.length > 0);
  if (detail.length === 0) {
    lines.push('None.');
  }
  for (const r of detail) {
    lines.push(`### \`${r.formulaId}\` — ${r.verdict} → \`${r.resolvedStatus}\``);
    lines.push('');
    lines.push(`- parameter: ${cell(r.parameter)}`);
    for (const who of EXTRACTORS) {
      const row = who === 'claude' ? r.claude : r.codex;
      if (!row) {
        lines.push(`- ${who}: no row`);
        continue;
      }
      lines.push(
        `- ${who}: absolute **${cell(row.absolute)}** · change «${cell(row.change)}» · baseline ${cell(row.baseline)} · ` +
          `p. ${cell(row.page)} · anchor «${cell(row.anchor)}» · status \`${normStatus(row.status)}\``,
      );
      if (!isAbsent(row.note)) lines.push(`  - note: ${cell(row.note)}`);
    }
    for (const f of r.flags) lines.push(`- flag \`${f.code}\` (${f.severity}): ${f.detail}`);
    lines.push('');
  }
  lines.push('## B. Unquantified proposals (union of both sheets)');
  lines.push('');
  lines.push('| found by | category | title | page | why it cannot be quantified |');
  lines.push('|---|---|---|---|---|');
  for (const u of unionB(sheets)) {
    lines.push(`| ${u.foundBy} | ${cell(u.category)} | ${short(u.title, 120)} | ${cell(u.page)} | ${short(u.reason, 160)} |`);
  }
  lines.push('');
  lines.push('## C. Categories each extractor reviewed with no proposal');
  lines.push('');
  lines.push('| extractor | category | verdict | where they looked |');
  lines.push('|---|---|---|---|');
  for (const who of EXTRACTORS) {
    for (const row of sheets[who].rowsC) {
      lines.push(`| ${who} | ${short(row[0] ?? '', 80)} | ${cell(row[1] ?? '')} | ${short(row[2] ?? '', 100)} |`);
    }
  }
  lines.push('');
  if (knots.length > 0) {
    lines.push('## D. Documented knots that touch this party');
    lines.push('');
    for (const k of knots) {
      lines.push(`- **${k.id}** — ${k.title}`);
      lines.push(`  - open question: ${k.question}`);
    }
    lines.push('');
  }
  const warnings = EXTRACTORS.flatMap((w) => sheets[w].parseWarnings.map((p) => `${w}: ${p}`));
  if (warnings.length > 0) {
    lines.push('## E. Parse warnings');
    lines.push('');
    for (const w of warnings) lines.push(`- ${w}`);
    lines.push('');
  }
  return lines.join('\n');
}

interface UnionEntry {
  foundBy: string;
  category: string;
  title: string;
  page: string;
  reason: string;
}

function unionB(sheets: Record<Extractor, Sheet>): UnionEntry[] {
  const byKey = new Map<string, UnionEntry>();
  for (const who of EXTRACTORS) {
    for (const row of sheets[who].rowsB) {
      const title = row[1] ?? '';
      const key = norm(title).toLowerCase().replace(/[^a-z0-9æøå ]/g, '').slice(0, 60);
      if (key.length === 0) continue;
      const existing = byKey.get(key);
      if (existing) {
        existing.foundBy = 'both';
        continue;
      }
      byKey.set(key, {
        foundBy: who,
        category: row[0] ?? '',
        title,
        page: row[2] ?? '',
        reason: row[4] ?? row[3] ?? '',
      });
    }
  }
  return [...byKey.values()];
}

interface Tally {
  rows: number;
  agreed: number;
  conflicts: number;
  flagged: number;
  encodable: number;
  headline: number;
}

function tally(rows: Reconciled[]): Tally {
  const t: Tally = { rows: rows.length, agreed: 0, conflicts: 0, flagged: 0, encodable: 0, headline: 0 };
  for (const r of rows) {
    if (isConflict(r.verdict)) t.conflicts += 1;
    else t.agreed += 1;
    if (isFlagged(r)) t.flagged += 1;
    if (r.resolvedStatus === 'confirmed' || r.resolvedStatus === 'estimated' || r.resolvedStatus === 'unquantified') {
      t.encodable += 1;
    }
    if (r.resolvedStatus === 'confirmed' || r.resolvedStatus === 'estimated') t.headline += 1;
  }
  return t;
}

function renderReport(all: Map<PartyKey, Reconciled[]>, knotProof: Map<string, Reconciled[]>): string {
  const lines: string[] = [];
  lines.push('# S6b — reconciliation report, eight alternative budgets 2026');
  lines.push('');
  lines.push(
    `Generated by \`scripts/reconcile.ts\` on ${RUN_DATE}. Per-party detail is in ` +
      '`sources/worksheets/<party>.reconciled.md`. Nothing here is a decision: the reconciler keeps the two ' +
      'independent readings side by side and lowers a row to `not-reviewed` whenever they differ.',
  );
  lines.push('');
  lines.push('## How to read this');
  lines.push('');
  lines.push('| verdict | meaning | resolved status |');
  lines.push('|---|---|---|');
  lines.push('| `agreed-value` | both read the same absolute value | the status they agree on |');
  lines.push('| `agreed-proposal` | both read the same change, neither could derive an absolute value | the status they agree on (normally `unquantified`) |');
  lines.push('| `agreed-nothing` | neither found a number for this rule | the status they agree on (`no-change` / `not-found` / `unquantified`) |');
  lines.push('| `value-conflict` | they wrote different numbers | `not-reviewed` |');
  lines.push('| `status-conflict` | same numbers, different status | `not-reviewed` |');
  lines.push('| `review-conflict` | no number either side, but they disagree about whether a proposal exists at all | `not-reviewed` |');
  lines.push('| `one-sided` | one found a proposal the other did not see | `not-reviewed` |');
  lines.push('| `evidence-conflict` | one derived an absolute value, the other could not | `not-reviewed` |');
  lines.push('| `only-in-one-sheet` | the row exists in one sheet only | `not-reviewed` |');
  lines.push('');
  lines.push(
    'Flags are independent of the verdict: `estimated` (needs an assumption), `derive` (needs a baseline from ' +
      'outside the document), `no-baseline-quoted` (the party quotes no starting point, so the ' +
      '«party baseline = Prop. 1 LS» test cannot run), `missing-page` / `missing-anchor` (evidence gap, breaks ' +
      'the anchor test), `page-mismatch`, `review-status-mismatch`, `row-missing`, `unreadable-status`.',
  );
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| party | rows | agreed | conflicts | flagged | encodable | may enter headline |');
  lines.push('|---|---|---|---|---|---|---|');
  const totals: Tally = { rows: 0, agreed: 0, conflicts: 0, flagged: 0, encodable: 0, headline: 0 };
  for (const party of PARTIES) {
    const rows = all.get(party) ?? [];
    const t = tally(rows);
    totals.rows += t.rows;
    totals.agreed += t.agreed;
    totals.conflicts += t.conflicts;
    totals.flagged += t.flagged;
    totals.encodable += t.encodable;
    totals.headline += t.headline;
    lines.push(
      `| [${PARTY_NAME[party]}](${party}.reconciled.md) | ${String(t.rows)} | ${String(t.agreed)} | ` +
        `${String(t.conflicts)} | ${String(t.flagged)} | ${String(t.encodable)} | ${String(t.headline)} |`,
    );
  }
  lines.push(
    `| **sum** | ${String(totals.rows)} | ${String(totals.agreed)} | ${String(totals.conflicts)} | ` +
      `${String(totals.flagged)} | ${String(totals.encodable)} | ${String(totals.headline)} |`,
  );
  lines.push('');

  lines.push('## Rows S7 may encode (both extractors agree on a number)');
  lines.push('');
  lines.push('| party | formulaId | value | status | flags |');
  lines.push('|---|---|---|---|---|');
  for (const party of PARTIES) {
    for (const r of all.get(party) ?? []) {
      if (r.verdict !== 'agreed-value') continue;
      lines.push(
        `| ${party} | \`${r.formulaId}\` | ${short(r.claude?.absolute ?? '', 70)} | ${r.resolvedStatus} | ${flagList(r.flags)} |`,
      );
    }
  }
  lines.push('');

  lines.push('## Disagreements — every row the reconciler refuses to resolve');
  lines.push('');
  lines.push('| party | formulaId | verdict | claude | codex | why |');
  lines.push('|---|---|---|---|---|---|');
  for (const party of PARTIES) {
    for (const r of all.get(party) ?? []) {
      if (!isConflict(r.verdict)) continue;
      const why = r.flags.find((f) => f.severity === 'high')?.detail ?? r.flags[0]?.detail ?? '';
      lines.push(
        `| ${party} | \`${r.formulaId}\` | ${r.verdict} | ${short(r.claude?.absolute ?? '', 50)} | ` +
          `${short(r.codex?.absolute ?? '', 50)} | ${short(why, 140)} |`,
      );
    }
  }
  lines.push('');

  lines.push('## Every high-severity flag, row by row');
  lines.push('');
  lines.push(
    'A high-severity flag means the value needs an assumption (`estimated`), the two readings disagree about the ' +
      'party’s own baseline (`baseline-mismatch`), or the party measures against today’s rate instead of ' +
      'Prop. 1 LS (`baseline-not-proposed`). A flagged row may still be encoded when the verdict is an ' +
      'agreement, but never as `confirmed`.',
  );
  lines.push('');
  lines.push('| party | formulaId | resolved | value | flag | detail |');
  lines.push('|---|---|---|---|---|---|');
  for (const party of PARTIES) {
    for (const r of all.get(party) ?? []) {
      for (const f of r.flags.filter((x) => x.severity === 'high')) {
        lines.push(
          `| ${party} | \`${r.formulaId}\` | ${r.resolvedStatus} | ${short(r.claude?.absolute ?? '', 40)} | ` +
            `\`${f.code}\` | ${short(f.detail, 160)} |`,
        );
      }
    }
  }
  lines.push('');

  lines.push('## Flag counts per party');
  lines.push('');
  lines.push(
    'Row-level detail for every flag is in the party sheets. `no-baseline-quoted` and `derive` are the normal ' +
      'condition of these documents — parties write «øker X til Y» without printing the value they start from — ' +
      'so they are counted here rather than listed. Both break the S7 provenance/`currentRule` tests and mean ' +
      'the row needs the `proposed` rule set (S4) before it can become kroner.',
  );
  lines.push('');
  const codes = new Map<string, { severity: Flag['severity']; per: Map<PartyKey, number>; total: number }>();
  for (const party of PARTIES) {
    for (const r of all.get(party) ?? []) {
      for (const f of r.flags) {
        const entry = codes.get(f.code) ?? { severity: f.severity, per: new Map<PartyKey, number>(), total: 0 };
        entry.per.set(party, (entry.per.get(party) ?? 0) + 1);
        entry.total += 1;
        codes.set(f.code, entry);
      }
    }
  }
  lines.push(`| flag | severity | ${PARTIES.join(' | ')} | sum |`);
  lines.push(`|---|---|${PARTIES.map(() => '---').join('|')}|---|`);
  const ordered = [...codes].sort((a, b) => b[1].total - a[1].total);
  for (const [code, entry] of ordered) {
    const cells = PARTIES.map((p) => String(entry.per.get(p) ?? 0)).join(' | ');
    lines.push(`| \`${code}\` | ${entry.severity} | ${cells} | ${String(entry.total)} |`);
  }
  lines.push('');

  const openKnots = KNOWN_KNOTS.filter((k) => !k.resolution);
  const closedKnots = KNOWN_KNOTS.filter((k) => k.resolution);
  lines.push('## Decisions that need Jesper');
  lines.push('');
  lines.push(
    `The ${String(openKnots.length)} open knots below were documented during extraction. Each one is still a flagged row after ` +
      'reconciliation — the reconciler has deliberately not resolved any of them.',
  );
  lines.push('');
  for (const k of openKnots) {
    const proof = knotProof.get(k.id) ?? [];
    lines.push(`### ${k.id} — ${k.title}`);
    lines.push('');
    lines.push(k.question);
    lines.push('');
    lines.push('Flagged rows that carry it:');
    lines.push('');
    for (const r of proof) {
      lines.push(
        `- \`${r.party}/${r.formulaId}\` → ${r.verdict} → \`${r.resolvedStatus}\`` +
          (r.flags.length > 0 ? ` (${r.flags.map((f) => f.code).join(', ')})` : ''),
      );
    }
    lines.push('');
  }
  if (closedKnots.length > 0) {
    lines.push('## Closed knots');
    lines.push('');
    lines.push(
      'Settled with evidence. A closed knot must stay quiet: if any of its rows flags again, the run fails ' +
        'and the knot has to be fixed or reopened.',
    );
    lines.push('');
    for (const k of closedKnots) {
      const res = k.resolution!;
      lines.push(`### ${k.id} — ${k.title}`);
      lines.push('');
      lines.push(`Closed ${res.date} by ${res.by}.`);
      lines.push('');
      lines.push(res.summary);
      lines.push('');
      lines.push(`Original question: ${k.question}`);
      lines.push('');
      lines.push('Rows it covers, now:');
      lines.push('');
      for (const want of k.rows) {
        const r = (all.get(want.party) ?? []).find((x) => x.formulaId === want.formulaId);
        lines.push(`- \`${want.party}/${want.formulaId}\` → ${r ? `${r.verdict} → \`${r.resolvedStatus}\`` : 'MISSING'}`);
      }
      lines.push('');
    }
  }
  lines.push('## Not covered by this script');
  lines.push('');
  lines.push(
    '- Whether a value is *correct*: the reconciler only checks that two independent readings of the same text ' +
      'agree. The anchor test (S7) checks that the quoted words really occur on the cited page.',
  );
  lines.push(
    '- Section B and C are merged as a union without comparison; a proposal found by one extractor only is ' +
      'listed with `found by = claude|codex` so S7 can check it against the source.',
  );
  lines.push(
    '- Nothing is marked `confirmed` against Skatteetaten here. Operator gate 3 (manual cross-check) is still open.',
  );
  lines.push('');
  return lines.join('\n');
}

// ------------------------------------------------------------------------------- main

function main(): void {
  const checkOnly = process.argv.includes('--check');
  const all = new Map<PartyKey, Reconciled[]>();
  const written: string[] = [];
  const stale: string[] = [];
  let missingSheets = 0;

  /** Write, or in --check mode verify that the committed file matches what we would write. */
  const emit = (path: string, content: string): void => {
    if (!checkOnly) {
      writeFileSync(path, content, 'utf8');
      written.push(path);
      return;
    }
    const current = existsSync(path) ? readFileSync(path, 'utf8') : '';
    // The generation date changes every day without the content changing; ignore it here,
    // or `npm run check` would report every sheet as stale tomorrow morning.
    const undated = (s: string): string => s.replace(/\bon \d{4}-\d{2}-\d{2}\b/g, 'on <date>');
    if (undated(current) !== undated(content)) stale.push(path.replace(`${ROOT}/`, ''));
  };

  for (const party of PARTIES) {
    const claudeSheet = readSheet(party, 'claude');
    const codexSheet = readSheet(party, 'codex');
    if (!claudeSheet || !codexSheet) {
      console.error(`mangler ark for ${party}: ${!claudeSheet ? 'claude' : ''} ${!codexSheet ? 'codex' : ''}`.trim());
      missingSheets += 1;
      continue;
    }
    const ids = [...new Set([...claudeSheet.rowsA.keys(), ...codexSheet.rowsA.keys()])];
    const rows = ids.map((id) =>
      reconcileRow(party, id, claudeSheet.rowsA.get(id) ?? null, codexSheet.rowsA.get(id) ?? null),
    );
    all.set(party, rows);
    emit(
      join(SHEETS, `${party}.reconciled.md`),
      `${renderPartySheet(party, rows, { claude: claudeSheet, codex: codexSheet })}\n`,
    );
  }

  // Every open knot must still be visible as a flagged row; every closed knot must be quiet
  // and must name rows that exist.
  const knotProof = new Map<string, Reconciled[]>();
  const silentKnots: string[] = [];
  const unsettledKnots: string[] = [];
  for (const knot of KNOWN_KNOTS) {
    const proof: Reconciled[] = [];
    let missingRows = 0;
    for (const want of knot.rows) {
      const row = (all.get(want.party) ?? []).find((r) => r.formulaId === want.formulaId);
      if (!row) missingRows += 1;
      if (isFlagged(row) && row) proof.push(row);
    }
    knotProof.set(knot.id, proof);
    if (knot.resolution) {
      if (proof.length > 0 || missingRows > 0) unsettledKnots.push(knot.id);
    } else if (proof.length === 0) {
      silentKnots.push(knot.id);
    }
  }

  emit(join(SHEETS, 'RECONCILIATION.md'), `${renderReport(all, knotProof)}\n`);

  const totals: Tally = { rows: 0, agreed: 0, conflicts: 0, flagged: 0, encodable: 0, headline: 0 };
  console.log('parti  rader  enige  uenige  flagget  kodbare  til-hovedtall');
  for (const party of PARTIES) {
    const t = tally(all.get(party) ?? []);
    totals.rows += t.rows;
    totals.agreed += t.agreed;
    totals.conflicts += t.conflicts;
    totals.flagged += t.flagged;
    totals.encodable += t.encodable;
    totals.headline += t.headline;
    console.log(
      `${party.padEnd(6)} ${String(t.rows).padStart(5)} ${String(t.agreed).padStart(6)} ${String(t.conflicts).padStart(7)} ` +
        `${String(t.flagged).padStart(8)} ${String(t.encodable).padStart(8)} ${String(t.headline).padStart(13)}`,
    );
  }
  console.log(
    `sum    ${String(totals.rows).padStart(5)} ${String(totals.agreed).padStart(6)} ${String(totals.conflicts).padStart(7)} ` +
      `${String(totals.flagged).padStart(8)} ${String(totals.encodable).padStart(8)} ${String(totals.headline).padStart(13)}`,
  );
  for (const [id, proof] of knotProof) {
    const closed = KNOWN_KNOTS.find((k) => k.id === id)?.resolution;
    const state = proof.length > 0 ? `flagged in ${proof.map((r) => `${r.party}/${r.formulaId}`).join(', ')}` : 'NOT FLAGGED';
    console.log(`knot ${id}: ${closed ? `closed ${closed.date}; ` : ''}${state}`);
  }
  for (const path of written) console.log(`skrev ${path.replace(`${ROOT}/`, '')}`);

  if (silentKnots.length > 0) {
    console.error(
      `FEIL: disse dokumenterte knutene er ikke lenger flagget: ${silentKnots.join(', ')}. ` +
        'En knute som blir stille er en feil i avstemmingen, ikke en avklaring.',
    );
  }
  if (unsettledKnots.length > 0) {
    console.error(
      `FEIL: disse lukkede knutene er fortsatt flagget eller peker på rader som ikke finnes: ${unsettledKnots.join(', ')}. ` +
        'Rett radene, eller åpne knuten igjen ved å fjerne `resolution`.',
    );
  }
  if (stale.length > 0) {
    console.error(
      `FEIL: disse avstemte arkene er utdaterte: ${stale.join(', ')}. Kjør «npm run reconcile» og commit resultatet.`,
    );
  }
  if (missingSheets > 0 || silentKnots.length > 0 || unsettledKnots.length > 0 || stale.length > 0) process.exitCode = 1;
}

main();
