import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DATA_BUNDLE, PROPOSED_2026, partyOf, sourceOf } from '../data/index.ts';
import { KNOWN_KNOTS } from '../data/knots.ts';
import { NON_FORLIK_BASELINE_DIFFS } from '../data/baseline/2026/forlik.ts';
import type { AnyRule, FormulaId, PartyId } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function ruleOf(set: { rules: readonly AnyRule[] }, id: FormulaId): AnyRule {
  const r = set.rules.find((x) => x.id === id);
  if (!r) throw new Error(`missing rule ${id}`);
  return r;
}

function pageText(sourceId: string, pageNum: number): string {
  const entry = sourceOf(sourceId);
  if (!entry.textFile) throw new Error(`no text file for ${sourceId}`);
  const text = readFileSync(join(ROOT, entry.textFile), 'utf8');
  const pages = text.split('\f');
  return pages[pageNum - 1] ?? '';
}

/** Anchor test: every word in the anchor (len>1) occurs on the cited page. */
function anchorOnPage(anchor: string, page: string): boolean {
  const hay = page.toLowerCase().replace(/\s+/g, ' ');
  const words = anchor
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s,.%øæå-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
  return words.length > 0 && words.every((w) => hay.includes(w));
}

function pageFromProvenance(pageOrTable: string): number | null {
  const m = pageOrTable.match(/p(?:df)?\s*(\d+)/i) ?? pageOrTable.match(/\bp(\d+)\b/i);
  return m ? Number(m[1]) : null;
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
  it('when baselineParams is set it deep-equals proposed', () => {
    for (const party of DATA_BUNDLE.parties) {
      for (const d of party.deltas) {
        if (!d.baselineParams) continue;
        expect(d.baselineParams).toEqual(ruleOf(PROPOSED_2026, d.id).params);
      }
    }
  });
});

describe('anchor test — party deltas', () => {
  it.each(
    DATA_BUNDLE.parties.flatMap((party) =>
      party.deltas.map((d) => ({
        party: party.id,
        formulaId: d.id,
        sourceId: d.provenance.sourceId,
        pageOrTable: d.provenance.pageOrTable,
        anchor: d.provenance.anchor,
      })),
    ),
  )('$party $formulaId: anchor on cited page', ({ sourceId, pageOrTable, anchor }) => {
    const page = pageFromProvenance(pageOrTable);
    if (!page) return;
    const text = pageText(sourceId, page);
    expect(anchorOnPage(anchor, text)).toBe(true);
  });
});

describe('KNOWN_KNOTS', () => {
  it('lists four knots', () => {
    expect(KNOWN_KNOTS).toHaveLength(4);
  });

  it('K1 parties do not encode income.socialSecurity', () => {
    for (const id of ['h', 'frp', 'sv', 'r'] as PartyId[]) {
      expect(partyOf(id).deltas.some((d) => d.id === 'income.socialSecurity')).toBe(false);
    }
  });

  it('K3 Venstre encodes excise.kwh with baseline flag in note', () => {
    const rule = partyOf('v').deltas.find((d) => d.id === 'excise.kwh');
    expect(rule).toBeDefined();
    expect(rule?.note).toMatch(/K3/);
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
    h: ['wealth.valuation'],
    frp: ['income.personalAllowance', 'wealth.valuation'],
    sv: ['income.bracketTax', 'income.personalAllowance', 'income.minimumDeductionWage', 'income.minimumDeductionPension'],
    sp: ['income.bracketTax', 'wealth.valuation', 'vat.food'],
    r: ['income.bracketTax', 'income.personalAllowance'],
    v: ['income.socialSecurity', 'income.personalAllowance', 'wealth.valuation', 'excise.kwh'],
    mdg: ['income.personalAllowance'],
    krf: ['wealth.valuation', 'benefit.childBenefit'],
  };

  it.each(Object.entries(ENCODED) as [PartyId, FormulaId[]][])(
    '%s encodes exactly the agreed-value rows',
    (partyId, ids) => {
      const encoded = partyOf(partyId).deltas.map((d) => d.id);
      expect(encoded.sort()).toEqual([...ids].sort());
    },
  );
});
