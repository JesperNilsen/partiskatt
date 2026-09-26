import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, DATA_BUNDLE, PROPOSED_2026, partyOf, sourceOf } from '../data/index.ts';
import { krPerUnit } from '../engine/money.ts';
import { KNOWN_KNOTS } from '../data/knots.ts';
import { NON_FORLIK_BASELINE_DIFFS } from '../data/baseline/2026/forlik.ts';
import { anchorInText, normalizeForAnchor, parsePageRefs } from '../data/provenance.ts';
import type { AnyRule, FormulaId, FormulaParams, PartyId } from '../types/index.ts';
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

describe('uncertain party rules', () => {
  /**
   * Plausible but assumption-dependent values (Codex review of L10b, 2026-09-26): kept out of the
   * headline unless «usikre forslag» is on. One delta per formula, so the whole rule is uncertain.
   */
  const UNCERTAIN: readonly string[] = ['frp:wealth.netWealthTax', 'h:benefit.childBenefit', 'sv:benefit.childBenefit'];

  it('exactly the listed rules are uncertain, each stating its assumption in Norwegian', () => {
    const flagged = DATA_BUNDLE.parties.flatMap((party) =>
      party.deltas.filter((d) => d.uncertain).map((d) => ({ key: `${party.id}:${d.id}`, d })),
    );
    expect(flagged.map((x) => x.key).sort()).toEqual([...UNCERTAIN].sort());
    for (const { key, d } of flagged) {
      expect(d.provenance.method, key).toMatch(/^Usikkert: .*antatt/);
    }
  });
});

describe('party baselineParams vs proposed', () => {
  /**
   * Rules that carry `baselineParams`, as `party:formulaId`: the relative proposals derived against
   * Prop. 1 LS (decision 2, L10b) and the explicit values whose quoted baseline is Prop. 1 LS.
   */
  const WITH_BASELINE_PARAMS: readonly string[] = [
    'h:income.socialSecurity',
    'h:wealth.netWealthTax',
    'h:excise.cigarette',
    'h:benefit.childBenefit',
    'frp:income.bracketTax',
    'frp:income.unionFeeDeduction',
    'frp:vat.food',
    'frp:excise.petrolLitre',
    'frp:excise.dieselLitre',
    'sv:wealth.netWealthTax',
    'sv:wealth.valuation',
    'sv:excise.petrolLitre',
    'sv:excise.dieselLitre',
    'sv:excise.flightEurope',
    'sv:excise.flightOther',
    'sv:benefit.childBenefit',
    'sp:income.socialSecurity',
    'sp:wealth.netWealthTax',
    'sp:wealth.valuation',
    'sp:excise.flightEurope',
    'r:wealth.netWealthTax',
    'r:wealth.valuation',
    'r:benefit.childBenefit',
    'r:benefit.studentSupport',
    'v:wealth.netWealthTax',
    'v:excise.cigarette',
    'mdg:income.socialSecurity',
    'mdg:wealth.netWealthTax',
    'mdg:excise.petrolLitre',
    'mdg:excise.dieselLitre',
  ];

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
    h: ['income.socialSecurity', 'wealth.netWealthTax', 'wealth.valuation', 'excise.cigarette', 'benefit.childBenefit'],
    frp: ['income.socialSecurity', 'income.bracketTax', 'income.personalAllowance', 'income.unionFeeDeduction', 'wealth.netWealthTax', 'wealth.valuation', 'vat.food', 'excise.petrolLitre', 'excise.dieselLitre'],
    sv: ['income.socialSecurity', 'income.bracketTax', 'income.personalAllowance', 'income.minimumDeductionWage', 'income.minimumDeductionPension', 'wealth.netWealthTax', 'wealth.valuation', 'excise.petrolLitre', 'excise.dieselLitre', 'excise.flightEurope', 'excise.flightOther', 'benefit.childBenefit', 'benefit.studentSupport'],
    sp: ['income.bracketTax', 'income.socialSecurity', 'wealth.netWealthTax', 'wealth.valuation', 'vat.food', 'excise.flightEurope'],
    r: ['income.socialSecurity', 'income.bracketTax', 'income.personalAllowance', 'wealth.netWealthTax', 'wealth.valuation', 'benefit.childBenefit', 'benefit.studentSupport'],
    v: ['income.socialSecurity', 'income.personalAllowance', 'wealth.netWealthTax', 'wealth.valuation', 'excise.kwh', 'excise.cigarette'],
    mdg: ['income.personalAllowance', 'income.socialSecurity', 'wealth.netWealthTax', 'excise.petrolLitre', 'excise.dieselLitre'],
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

/**
 * Decision 2 (2026-09-25): a relative proposal is encoded only where the arithmetic against Prop. 1 LS
 * is unambiguous. Each case recomputes the encoded value from the `proposed` baseline, so a changed
 * baseline or a mistyped number fails here. Constants are the party's own change (page in the rule's
 * provenance) or a Prop. 1 LS component that is pinned to the baseline in the same case.
 */
describe('derived party rules (decision 2) reproduce their arithmetic from Prop. 1 LS', () => {
  const P = <F extends FormulaId>(id: F) => ruleOf(PROPOSED_2026, id).params as FormulaParams[F];
  const A = <F extends FormulaId>(id: F) => ruleOf(ADOPTED_2026, id).params as FormulaParams[F];
  const enc = <F extends FormulaId>(party: PartyId, id: F) => {
    const d = partyOf(party).deltas.find((x) => x.id === id);
    if (!d) throw new Error(`${party} has no ${id}`);
    return d.params as FormulaParams[F];
  };
  // L13: trinn a party does not touch stay at ADOPTED values (trinn 4–5 16,8 / 17,8, not Prop. 1 LS 16,7 / 17,7).
  const brackets = (patch: Record<number, number>) =>
    A('income.bracketTax').brackets.map((b, i) => (i in patch ? { ...b, rateBp: patch[i]! } : b));
  const ss = P('income.socialSecurity');
  const nw = P('wealth.netWealthTax');
  const val = P('wealth.valuation');
  const cb = P('benefit.childBenefit');
  // The price-indexed child benefit (1 968 → 2 012, 2 516 → 2 572) is the adopted rate from 1.2.2026.
  const cbIndexed = A('benefit.childBenefit');

  const CASES: [string, () => unknown, () => unknown][] = [
    ['frp income.bracketTax: trinn 1 fjernes, trinn 2 − 0,5 pp', () => enc('frp', 'income.bracketTax'), () => ({ brackets: brackets({ 0: 0, 1: P('income.bracketTax').brackets[1]!.rateBp - 50 }) })],
    ['frp income.unionFeeDeduction: fjernes', () => enc('frp', 'income.unionFeeDeduction'), () => ({ max: 0 })],
    ['frp vat.food: halveres', () => enc('frp', 'vat.food'), () => ({ rateBp: P('vat.food').rateBp / 2 })],
    ['frp excise.petrolLitre: veibruk 4,25 ÷ 2 + CO2 2025 3,25', () => enc('frp', 'excise.petrolLitre'), () => {
      expect(krPerUnit(4.25 + 3.8)).toBe(P('excise.petrolLitre').ratePerUnit);
      return { ratePerUnit: krPerUnit(4.25 / 2 + 3.25) };
    }],
    ['frp excise.dieselLitre: veibruk 3,00 ÷ 2 + CO2 2025 3,79', () => enc('frp', 'excise.dieselLitre'), () => {
      expect(krPerUnit(3.0 + 4.42)).toBe(P('excise.dieselLitre').ratePerUnit);
      return { ratePerUnit: krPerUnit(3.0 / 2 + 3.79) };
    }],
    ['sp income.socialSecurity: lønn − 0,1 pp', () => enc('sp', 'income.socialSecurity'), () => ({ ...ss, wageRateBp: ss.wageRateBp - 10 })],
    ['h income.socialSecurity: regjeringens kutt reverseres (+ 0,1 pp), frikortgrense 150 000 (K1)', () => enc('h', 'income.socialSecurity'), () => ({ ...ss, wageRateBp: ss.wageRateBp + 10, lowerThreshold: 150_000 })],
    ['mdg income.socialSecurity: regjeringens kutt reverseres (+ 0,1 pp)', () => enc('mdg', 'income.socialSecurity'), () => ({ ...ss, wageRateBp: ss.wageRateBp + 10 })],
    ['h wealth.netWealthTax: bunnfradrag + 100 000, ektepar dobbelt', () => enc('h', 'wealth.netWealthTax'), () => {
      expect(nw.couple.allowance).toBe(2 * nw.single.allowance);
      const single = nw.single.allowance + 100_000;
      return { ...nw, single: { ...nw.single, allowance: single }, couple: { ...nw.couple, allowance: 2 * single } };
    }],
    ['v wealth.netWealthTax: trinn 1 − 0,1 pp', () => enc('v', 'wealth.netWealthTax'), () => ({ ...nw, tier1RateBp: nw.tier1RateBp - 10 })],
    // L13: Sp's 10,21 mill. home limit is below adopted law (14 mill.), so the adopted limit stands.
    ['sp wealth.valuation: driftsmidler + 10 pp rabatt, boliggrense vedtatt', () => enc('sp', 'wealth.valuation'), () => ({ ...val, primaryHomeHighValueThreshold: A('wealth.valuation').primaryHomeHighValueThreshold, otherBp: val.otherBp - 1000 })],
    ['r wealth.valuation: rabatter fjernet (Tabell 3)', () => enc('r', 'wealth.valuation'), () => ({ ...val, primaryHomeHighValueBp: 10_000, listedSharesBp: 10_000, otherBp: 10_000 })],
    ['sv wealth.valuation: rabatter fjernet', () => enc('sv', 'wealth.valuation'), () => ({ ...val, primaryHomeHighValueBp: 10_000, listedSharesBp: 10_000, otherBp: 10_000 })],
    ['h excise.cigarette: + 15 pst', () => enc('h', 'excise.cigarette'), () => ({ ratePerUnit: Math.round(P('excise.cigarette').ratePerUnit * 1.15) })],
    ['v excise.cigarette: + 5 pst', () => enc('v', 'excise.cigarette'), () => ({ ratePerUnit: Math.round(P('excise.cigarette').ratePerUnit * 1.05) })],
    ['sv excise.flightEurope: + 20 pst', () => enc('sv', 'excise.flightEurope'), () => ({ ratePerUnit: Math.round(P('excise.flightEurope').ratePerUnit * 1.2) })],
    ['sv excise.flightOther: + 20 pst', () => enc('sv', 'excise.flightOther'), () => ({ ratePerUnit: Math.round(P('excise.flightOther').ratePerUnit * 1.2) })],
    ['sv excise.petrolLitre: veibruk + 0,25', () => enc('sv', 'excise.petrolLitre'), () => ({ ratePerUnit: P('excise.petrolLitre').ratePerUnit + krPerUnit(0.25) })],
    ['sv excise.dieselLitre: veibruk + 0,25', () => enc('sv', 'excise.dieselLitre'), () => ({ ratePerUnit: P('excise.dieselLitre').ratePerUnit + krPerUnit(0.25) })],
    ['mdg excise.petrolLitre: veibruk + 2,50', () => enc('mdg', 'excise.petrolLitre'), () => ({ ratePerUnit: P('excise.petrolLitre').ratePerUnit + krPerUnit(2.5) })],
    ['mdg excise.dieselLitre: veibruk + 2,50', () => enc('mdg', 'excise.dieselLitre'), () => ({ ratePerUnit: P('excise.dieselLitre').ratePerUnit + krPerUnit(2.5) })],
    ['h benefit.childBenefit: prisjustert', () => enc('h', 'benefit.childBenefit'), () => {
      expect(cbIndexed.under6PerMonth - cb.under6PerMonth).toBe(44); // Rødt s. 11: +88 kr/mnd for to barn
      return { ...cb, under6PerMonth: cbIndexed.under6PerMonth, from6PerMonth: cbIndexed.from6PerMonth, extendedSingleParentPerMonth: cbIndexed.extendedSingleParentPerMonth };
    }],
    ['r benefit.childBenefit: prisjustert, utvidet + 500', () => enc('r', 'benefit.childBenefit'), () => ({ ...cb, under6PerMonth: cbIndexed.under6PerMonth, from6PerMonth: cbIndexed.from6PerMonth, extendedSingleParentPerMonth: cbIndexed.extendedSingleParentPerMonth + 500 })],
    ['sv benefit.childBenefit: prisjustert + 100 per barn', () => enc('sv', 'benefit.childBenefit'), () => ({ ...cb, under6PerMonth: cbIndexed.under6PerMonth + 100, from6PerMonth: cbIndexed.from6PerMonth + 100, extendedSingleParentPerMonth: cbIndexed.extendedSingleParentPerMonth })],
    ['r benefit.studentSupport: + 1 250 kr/mnd', () => enc('r', 'benefit.studentSupport'), () => ({ ...P('benefit.studentSupport'), basicSupportPerMonth: P('benefit.studentSupport').basicSupportPerMonth + 1_250 })],
  ];

  it.each(CASES)('%s', (_label, actual, expected) => {
    expect(actual()).toEqual(expected());
  });

  it('every derived rule is covered by a case', () => {
    // KrF's derived tobacco rules (L10a) are recomputed in the K2 test above.
    const derived = DATA_BUNDLE.parties.filter((p) => p.id !== 'krf').flatMap((p) =>
      p.deltas.filter((d) => /Utledet \(beslutning 2\)/.test(d.note ?? '')).map((d) => `${p.id} ${d.id}`),
    );
    const covered = CASES.map(([label]) => label.split(':')[0]!);
    expect(derived.filter((k) => !covered.includes(k))).toEqual([]);
  });
});
