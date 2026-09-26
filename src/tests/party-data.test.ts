import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DATA_BUNDLE, PROPOSED_2026, partyOf, sourceOf } from '../data/index.ts';
import { KNOWN_KNOTS } from '../data/knots.ts';
import { NON_FORLIK_BASELINE_DIFFS } from '../data/baseline/2026/forlik.ts';
import { anchorInText, normalizeForAnchor, parsePageRefs } from '../data/provenance.ts';
import type { AnyRule, FormulaId, PartyId } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function ruleOf(set: { rules: readonly AnyRule[] }, id: FormulaId): AnyRule {
  const r = set.rules.find((x) => x.id === id);
  if (!r) throw new Error(`missing rule ${id}`);
  return r;
}

const TEXT_PAGES = new Map<string, readonly string[]>();

/** Pages of a source's archived text file (form-feed split; pdftotext's trailing \f is not a page). */
function textPages(sourceId: string): readonly string[] {
  const cached = TEXT_PAGES.get(sourceId);
  if (cached) return cached;
  const entry = sourceOf(sourceId);
  if (!entry.textFile) throw new Error(`no text file for ${sourceId}`);
  const text = readFileSync(join(ROOT, entry.textFile), 'utf8');
  const pages = (text.endsWith('\f') ? text.slice(0, -1) : text).split('\f');
  TEXT_PAGES.set(sourceId, pages);
  return pages;
}

/** Parsed page refs, or a thrown error naming the rule — never a silent skip. */
function pagesOf(label: string, sourceId: string, pageOrTable: string): number[] {
  const pages = parsePageRefs(pageOrTable);
  if (!pages || pages.length === 0) throw new Error(`${label}: unparsable page reference ${JSON.stringify(pageOrTable)}`);
  const count = textPages(sourceId).length;
  const outOfRange = pages.filter((p) => p > count);
  if (outOfRange.length) throw new Error(`${label}: page(s) ${outOfRange.join(', ')} beyond ${sourceId} (${count} text pages)`);
  return pages;
}

interface ProvCase {
  kind: 'delta' | 'unquantified';
  party: PartyId;
  label: string;
  sourceId: string;
  pageOrTable: string;
  anchor: string;
}

const PROV_CASES: ProvCase[] = DATA_BUNDLE.parties.flatMap((party) => [
  ...party.deltas.map((d) => ({
    kind: 'delta' as const,
    party: party.id,
    label: d.id,
    sourceId: d.provenance.sourceId,
    pageOrTable: d.provenance.pageOrTable,
    anchor: d.provenance.anchor,
  })),
  ...party.unquantified.map((u) => ({
    kind: 'unquantified' as const,
    party: party.id,
    label: u.title,
    sourceId: u.provenance.sourceId,
    pageOrTable: u.provenance.pageOrTable,
    anchor: u.provenance.anchor,
  })),
]);

/**
 * Known cases where the anchor cannot be found in the text layer. Each entry is
 * checked to still be necessary: the anchor must NOT be found on any cited page
 * (a stale entry fails), and `textEmpty` entries must cite only pages whose text
 * layer holds nothing but the page number.
 */
const KRF_P19_IMAGE =
  "K2 (closed 2026-09-26): KrF's tax table p19 «Skatter og avgifter» is one raster image with no text layer. The anchor is verbatim from the image, read twice independently (sources/worksheets/krf.vision.md), so it cannot be text-verified.";

const ANCHOR_ALLOWLIST: readonly { party: PartyId; label: string; textEmpty: boolean; why: string }[] = [
  {
    party: 'krf',
    label: 'excise.cigarette',
    textEmpty: true,
    why: KRF_P19_IMAGE,
  },
  {
    party: 'krf',
    label: 'excise.snusGram',
    textEmpty: true,
    why: KRF_P19_IMAGE,
  },
  {
    party: 'krf',
    label: 'Alkoholavgift: halvering av innførselskvoten',
    textEmpty: true,
    why: KRF_P19_IMAGE,
  },
];

function allowlisted(c: ProvCase) {
  return ANCHOR_ALLOWLIST.find((a) => a.party === c.party && a.label === c.label);
}

describe('DATA_BUNDLE', () => {
  it('contains all nine parties with unique ids', () => {
    expect(DATA_BUNDLE.parties).toHaveLength(9);
    expect(new Set(DATA_BUNDLE.parties.map((p) => p.id)).size).toBe(9);
    expect(PARTY_IDS.every((id) => DATA_BUNDLE.parties.some((p) => p.id === id))).toBe(true);
  });

  it('Ap has zero deltas', () => {
    expect(partyOf('ap').deltas).toHaveLength(0);
  });
});

describe('party rule status — operator gate 3', () => {
  it('no party delta is marked confirmed', () => {
    for (const party of DATA_BUNDLE.parties) {
      for (const d of party.deltas) {
        expect(d.status).toBe('estimated');
      }
    }
  });
});

describe('party baselineParams vs proposed', () => {
  /** Rules that carry `baselineParams`, as `party:formulaId`. Explicitly none today. */
  const WITH_BASELINE_PARAMS: readonly string[] = [];

  it('exactly the listed rules carry baselineParams, each deep-equal to proposed', () => {
    const withBaseline = DATA_BUNDLE.parties.flatMap((party) =>
      party.deltas.filter((d) => d.baselineParams !== undefined).map((d) => ({ key: `${party.id}:${d.id}`, d })),
    );
    expect(withBaseline.map((x) => x.key).sort()).toEqual([...WITH_BASELINE_PARAMS].sort());
    for (const { d } of withBaseline) {
      expect(d.baselineParams).toEqual(ruleOf(PROPOSED_2026, d.id).params);
    }
  });
});

describe('provenance page references', () => {
  it('parses single pages, ranges, lists and prefixes; rejects non-page text', () => {
    expect(parsePageRefs('PDF p17')).toEqual([17]);
    expect(parsePageRefs('PDF p11; p46')).toEqual([11, 46]);
    expect(parsePageRefs('PDF p17–24')).toEqual([17, 18, 19, 20, 21, 22, 23, 24]);
    expect(parsePageRefs('s. 12–13')).toEqual([12, 13]);
    expect(parsePageRefs('pp. 4, 7')).toEqual([4, 7]);
    expect(parsePageRefs('PDF pX')).toBeNull();
    expect(parsePageRefs('PDF p0')).toBeNull();
    expect(parsePageRefs('PDF p9–3')).toBeNull();
    expect(parsePageRefs('ap-alt-2026 (manifest)')).toBeNull();
    expect(parsePageRefs('Tabell 3.2')).toBeNull();
  });

  it('every delta and unquantified proposal parses to at least one page in its source text', () => {
    const expected =
      DATA_BUNDLE.parties.reduce((n, p) => n + p.deltas.length + p.unquantified.length, 0);
    // Invariant: one case per delta + unquantified proposal, and each yields ≥ 1 parsed page.
    expect(PROV_CASES).toHaveLength(expected);
    const parsed = PROV_CASES.map((c) => pagesOf(`${c.party} ${c.label}`, c.sourceId, c.pageOrTable));
    expect(parsed.filter((pages) => pages.length > 0)).toHaveLength(expected);
  });

  it('every reviewed note cites parsable pages, except Ap (no alternative budget)', () => {
    for (const party of DATA_BUNDLE.parties) {
      for (const [category, note] of Object.entries(party.reviewed)) {
        if (party.id === 'ap') {
          expect(note!.pageOrTable).toBe('ap-alt-2026 (manifest)');
          continue;
        }
        pagesOf(`${party.id} reviewed ${category}`, `${party.id}-alt-2026`, note!.pageOrTable);
      }
    }
  });
});

describe('anchor matching', () => {
  it('matches whole phrases, numbers with or without thousands separators', () => {
    expect(anchorInText('150 000', 'øke frikortgrensen til 150.000 kroner')).toBe(true);
    expect(anchorInText('kr 125.000', 'kr 125 000')).toBe(true);
    expect(anchorInText('55', 'minstefradrag 55 pst.')).toBe(true);
    expect(anchorInText('55', 'minstefradrag 155 pst.')).toBe(false);
    expect(anchorInText('55', 'minstefradrag 550 pst.')).toBe(false);
    expect(anchorInText('150 000', 'til 2 150 000 kroner')).toBe(false);
    expect(anchorInText('strøm', 'strømstøtte')).toBe(false);
    expect(anchorInText('matmoms', 'halvere matmomsen')).toBe(false);
    expect(anchorInText('aksjer og driftsmidler', 'driftsmidler og aksjer')).toBe(false);
    expect(anchorInText('Øke   frikortgrensen', 'øke\nfrikortgrensen')).toBe(true);
    expect(anchorInText('10,21 mill.', 'verdi 10,21 mill. kroner')).toBe(true);
  });

  it('anchors are at most ten words', () => {
    for (const c of PROV_CASES) {
      expect(normalizeForAnchor(c.anchor).split(' ').length, `${c.party} ${c.label}`).toBeLessThanOrEqual(10);
    }
  });
});

describe('anchor test — party provenance', () => {
  it.each(PROV_CASES)('$party $kind $label: anchor on a cited page', (c) => {
    const pages = pagesOf(`${c.party} ${c.label}`, c.sourceId, c.pageOrTable);
    const text = textPages(c.sourceId);
    const hits = pages.filter((p) => anchorInText(c.anchor, text[p - 1]!));
    const allow = allowlisted(c);
    if (allow) {
      // The entry must still be needed, and its stated reason must still hold.
      expect(hits, `stale allowlist entry: ${c.party} ${c.label}`).toEqual([]);
      if (allow.textEmpty) {
        // Empty = nothing but the printed page number in the text layer.
        expect(pages.filter((p) => !/^\d*$/.test(text[p - 1]!.trim()))).toEqual([]);
      }
      return;
    }
    expect(hits.length, `${c.party} ${c.label}: ${JSON.stringify(c.anchor)} not on ${c.pageOrTable}`).toBeGreaterThan(0);
  });

  it('every allowlist entry names an existing case', () => {
    for (const a of ANCHOR_ALLOWLIST) {
      expect(PROV_CASES.some((c) => c.party === a.party && c.label === a.label), `${a.party} ${a.label}`).toBe(true);
      expect(a.why.length).toBeGreaterThan(20);
    }
  });
});

describe('KNOWN_KNOTS', () => {
  it('lists four knots', () => {
    expect(KNOWN_KNOTS).toHaveLength(4);
  });

  it('K1 parties encode income.socialSecurity as estimated with a K1 note (decided 2026-09-13)', () => {
    for (const id of ['h', 'frp', 'sv', 'r'] as PartyId[]) {
      const rule = partyOf(id).deltas.find((d) => d.id === 'income.socialSecurity');
      expect(rule).toBeDefined();
      expect(rule?.status).toBe('estimated');
      expect(rule?.params).toMatchObject({ lowerThreshold: 150_000 });
      expect(rule?.note).toMatch(/K1/);
      expect(partyOf(id).unquantified.some((u) => /frikort/i.test(u.title))).toBe(false);
    }
  });

  it('K3 Venstre encodes excise.kwh with baseline flag in note', () => {
    const rule = partyOf('v').deltas.find((d) => d.id === 'excise.kwh');
    expect(rule).toBeDefined();
    expect(rule?.note).toMatch(/K3/);
  });

  it('K2 is closed: KrF changes no income-tax rate, and the tobacco rules are Prop. 1 LS × 1,15', () => {
    const k2 = KNOWN_KNOTS.find((k) => k.id === 'K2-krf-appendix-empty');
    expect(k2?.resolved?.date).toBe('2026-09-26');
    const krf = partyOf('krf');
    const incomeIds: FormulaId[] = ['income.generalRate', 'income.bracketTax', 'income.personalAllowance', 'income.socialSecurity'];
    expect(krf.deltas.filter((d) => incomeIds.includes(d.id))).toEqual([]);
    expect(krf.unquantified.filter((u) => u.status === 'not-reviewed')).toEqual([]);
    for (const id of ['excise.cigarette', 'excise.snusGram'] as const) {
      const rule = krf.deltas.find((d) => d.id === id);
      const base = ruleOf(PROPOSED_2026, id).params as { ratePerUnit: number };
      expect(rule?.params).toEqual({ ratePerUnit: Math.round(base.ratePerUnit * 1.15) });
      expect(rule?.provenance.pageOrTable).toBe('PDF p19');
    }
  });

  it('K4 MDG encodes personalAllowance with contradiction note', () => {
    const rule = partyOf('mdg').deltas.find((d) => d.id === 'income.personalAllowance');
    expect(rule?.note).toMatch(/K4/);
  });
});

describe('NON_FORLIK_BASELINE_DIFFS', () => {
  it('still flags wealth.valuation only', () => {
    expect(NON_FORLIK_BASELINE_DIFFS.map((d) => d.formulaId)).toEqual(['wealth.valuation']);
  });
});

describe('agreed-value coverage', () => {
  const ENCODED: Record<Exclude<PartyId, 'ap'>, FormulaId[]> = {
    h: ['income.socialSecurity', 'wealth.valuation'],
    frp: ['income.socialSecurity', 'income.personalAllowance', 'wealth.valuation'],
    sv: ['income.socialSecurity', 'income.bracketTax', 'income.personalAllowance', 'income.minimumDeductionWage', 'income.minimumDeductionPension'],
    sp: ['income.bracketTax', 'wealth.valuation', 'vat.food'],
    r: ['income.socialSecurity', 'income.bracketTax', 'income.personalAllowance'],
    v: ['income.socialSecurity', 'income.personalAllowance', 'wealth.valuation', 'excise.kwh'],
    mdg: ['income.personalAllowance'],
    krf: ['wealth.valuation', 'benefit.childBenefit', 'excise.cigarette', 'excise.snusGram'],
  };

  it.each(Object.entries(ENCODED) as [PartyId, FormulaId[]][])(
    '%s encodes exactly the agreed-value rows plus decided knots',
    (partyId, ids) => {
      const encoded = partyOf(partyId).deltas.map((d) => d.id);
      expect(encoded.sort()).toEqual([...ids].sort());
    },
  );
});
