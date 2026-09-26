import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ADOPTED_2026, ADOPTED_2026_ENCODED } from '../data/baseline/2026/adopted.ts';
import { PROPOSED_2026 } from '../data/baseline/2026/proposed.ts';
import {
  GATE3_COMPONENT_KINDS,
  GATE3_OUT_OF_SCOPE,
  GATE3_RULE_FEEDS,
  GATE3_RULE_IDS,
  applyGate3Status,
  deriveGate3,
  exerciseOf,
  gate3Components,
  isGate3Rule,
  isPerAdult,
  kindOfKey,
} from '../data/gate3.ts';
import type { Gate3ComponentKey, Gate3ComponentKind, Gate3Results } from '../data/gate3.ts';
import { GATE3_RESULTS } from '../data/gate3-results.ts';
import { buildGate3Sheet, renderGate3Sheet } from '../data/gate3-sheet.ts';
import { FORMULA_IDS } from '../engine/formulas.ts';
import { kr } from '../engine/money.ts';
import type { AnyRule, FormulaId, UserProfile } from '../types/index.ts';
import { FIXTURES, adult, profile, wealth } from './fixtures.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Rules whose every parameter the five fixtures exercise (asserted below, not assumed). */
const FULLY_EXERCISED: FormulaId[] = ['income.generalRate', 'income.bracketTax', 'income.personalAllowance'];

/** Engine values recorded as if Skatteetaten agreed exactly, with valid metadata. */
function matchingResults(overrides: Partial<Gate3Results> = {}): Gate3Results {
  const values: Record<string, Partial<Record<Gate3ComponentKey, number>>> = {};
  for (const [id, p] of Object.entries(FIXTURES)) values[id] = Object.fromEntries(gate3Components(p, ADOPTED_2026_ENCODED));
  return {
    checkedOn: '2026-10-01',
    calculator: { inntektsaar: 2026, version: 'synthetic' },
    valuationEnteredAs: 'markedsverdi',
    values,
    ...overrides,
  };
}

function confirmedIds(results: Gate3Results): FormulaId[] {
  return deriveGate3(ADOPTED_2026_ENCODED, results)
    .filter((v) => v.status === 'confirmed')
    .map((v) => v.id)
    .sort();
}

/**
 * Extra profiles, used only to prove the rule→component map: each reaches a branch the five
 * fixtures do not (pension, capped union fee, phase-in, high-value home, tier 2, other wealth).
 */
const PROBES: Record<string, UserProfile> = {
  pensioner: profile({
    adults: [adult({ pensionIncome: kr(400_000), unionFee: kr(20_000) })],
  }),
  lowIncome: profile({ adults: [adult({ wageIncome: kr(110_000) })] }),
  richCouple: profile({
    mode: 'household',
    adults: [adult({ wageIncome: kr(900_000) }), adult({ wageIncome: kr(300_000) })],
    wealth: wealth({
      primaryHomeValue: kr(30_000_000),
      secondaryHomeValue: kr(8_000_000),
      listedShares: kr(40_000_000),
      otherTaxableWealth: kr(10_000_000),
      bankDeposits: kr(5_000_000),
      debt: kr(6_000_000),
    }),
  }),
  richSingle: profile({
    adults: [adult({ wageIncome: kr(2_000_000) })],
    wealth: wealth({
      primaryHomeValue: kr(20_000_000),
      secondaryHomeValue: kr(5_000_000),
      listedShares: kr(20_000_000),
      otherTaxableWealth: kr(5_000_000),
      debt: kr(3_000_000),
    }),
  }),
};

describe('gate 3 — empty results file', () => {
  it('confirms zero rules', () => {
    expect(confirmedIds(GATE3_RESULTS)).toEqual([]);
    expect(ADOPTED_2026.rules.filter((r) => r.status === 'confirmed')).toHaveLength(0);
  });

  it('the results file is empty and well-formed', () => {
    expect(GATE3_RESULTS.checkedOn).toBeNull();
    expect(Object.keys(GATE3_RESULTS.values)).toHaveLength(0);
  });

  it('ADOPTED_2026 differs from the encoded set only in derived status', () => {
    expect(ADOPTED_2026.rules.map((r) => r.id)).toEqual(ADOPTED_2026_ENCODED.rules.map((r) => r.id));
    ADOPTED_2026.rules.forEach((r, i) => {
      const { status: _a, ...rest } = r;
      const { status: _b, ...restEncoded } = ADOPTED_2026_ENCODED.rules[i]!;
      expect(rest).toEqual(restEncoded);
    });
  });
});

describe('gate 3 — guards: confirmed only via the results file', () => {
  it('every encoded baseline rule is estimated (no hand-set confirmed)', () => {
    for (const r of [...PROPOSED_2026.rules, ...ADOPTED_2026_ENCODED.rules]) expect(r.status).toBe('estimated');
  });

  it('applyGate3Status refuses a hand-set confirmed', () => {
    const tampered = {
      ...ADOPTED_2026_ENCODED,
      rules: ADOPTED_2026_ENCODED.rules.map((r) =>
        r.id === 'income.generalRate' ? ({ ...r, status: 'confirmed' } as AnyRule) : r,
      ),
    };
    expect(() => applyGate3Status(tampered, GATE3_RESULTS)).toThrow(/for hånd/);
  });

  it('gate 3 never applies to the proposed baseline', () => {
    expect(() => deriveGate3(PROPOSED_2026, GATE3_RESULTS)).toThrow(/vedtatte/);
  });

  it('rejects results for unknown fixtures or components', () => {
    expect(() => deriveGate3(ADOPTED_2026_ENCODED, matchingResults({ values: { nobody: {} } }))).toThrow(/ukjent fixture/);
    expect(() =>
      deriveGate3(ADOPTED_2026_ENCODED, matchingResults({ values: { student: { 'trinnskatt#1': 0 } } })),
    ).toThrow(/ingen komponent/);
  });
});

describe('gate 3 — the path to confirmed', () => {
  it('a full synthetic match confirms exactly the fully exercised rules', () => {
    expect(confirmedIds(matchingResults())).toEqual([...FULLY_EXERCISED].sort());
    const applied = applyGate3Status(ADOPTED_2026_ENCODED, matchingResults());
    for (const r of applied.rules) {
      expect(r.status).toBe(FULLY_EXERCISED.includes(r.id) ? 'confirmed' : 'estimated');
    }
  });

  it('a 1-kr difference is within tolerance', () => {
    const res = matchingResults();
    const rec = { ...res.values.medianSingle! };
    rec['skattAlminneligInntekt#0'] = rec['skattAlminneligInntekt#0']! + 1;
    expect(confirmedIds({ ...res, values: { ...res.values, medianSingle: rec } })).toEqual([...FULLY_EXERCISED].sort());
  });

  it('a 2-kr mismatch un-confirms every rule feeding that component, and only those', () => {
    const res = matchingResults();
    const rec = { ...res.values.medianSingle! };
    rec['skattAlminneligInntekt#0'] = rec['skattAlminneligInntekt#0']! + 2;
    const verdicts = deriveGate3(ADOPTED_2026_ENCODED, { ...res, values: { ...res.values, medianSingle: rec } });
    const status = new Map(verdicts.map((v) => [v.id, v.status]));
    expect(status.get('income.generalRate')).toBe('estimated');
    expect(status.get('income.personalAllowance')).toBe('estimated');
    expect(status.get('income.bracketTax')).toBe('confirmed');
    expect(verdicts.find((v) => v.id === 'income.generalRate')!.reasons.join(' ')).toMatch(/medianSingle/);
  });

  it('a missing component blocks confirmation', () => {
    const res = matchingResults();
    const { 'trinnskatt#0': _dropped, ...rest } = res.values.highEarner!;
    expect(confirmedIds({ ...res, values: { ...res.values, highEarner: rest } })).not.toContain('income.bracketTax');
  });

  it('matching values without date or calculator year confirm nothing', () => {
    expect(confirmedIds(matchingResults({ checkedOn: null }))).toEqual([]);
    expect(confirmedIds(matchingResults({ calculator: { inntektsaar: 2025, version: null } }))).toEqual([]);
  });

  it('out-of-scope and under-exercised rules say why they stay estimated', () => {
    for (const v of deriveGate3(ADOPTED_2026_ENCODED, matchingResults())) {
      if (v.status === 'confirmed') expect(v.reasons).toEqual([]);
      else expect(v.reasons.length).toBeGreaterThan(0);
    }
  });
});

describe('gate 3 — rule → component map is exact', () => {
  const profiles = { ...FIXTURES, ...PROBES };

  it('every formula is either a gate-3 rule or out of scope with a reason', () => {
    for (const id of FORMULA_IDS) {
      const inScope = isGate3Rule(id);
      const outReason = (GATE3_OUT_OF_SCOPE as Record<string, string>)[id];
      expect(inScope !== (outReason !== undefined)).toBe(true);
    }
  });

  it.each(FORMULA_IDS.map((id) => [id]))('%s moves exactly the components it is mapped to', (id) => {
    const moved = new Set<Gate3ComponentKind>();
    for (const leaf of exerciseOf(ADOPTED_2026_ENCODED, id, profiles)) {
      for (const m of leaf.movedBy) moved.add(kindOfKey(m.split(':')[1] as Gate3ComponentKey));
    }
    const declared: readonly Gate3ComponentKind[] = isGate3Rule(id) ? GATE3_RULE_FEEDS[id] : [];
    expect([...moved].sort()).toEqual([...declared].sort());
  });

  it('the fully-exercised list matches the live exercise analysis on the five fixtures', () => {
    const full = GATE3_RULE_IDS.filter((id) =>
      exerciseOf(ADOPTED_2026_ENCODED, id, FIXTURES, GATE3_RULE_FEEDS[id]).every((l) => l.movedBy.length > 0),
    );
    expect(full.sort()).toEqual([...FULLY_EXERCISED].sort());
  });
});

describe('gate 3 — sheet coverage', () => {
  const sheet = buildGate3Sheet();

  it('covers every fixture, in order', () => {
    expect(sheet.fixtures.map((f) => f.id)).toEqual(Object.keys(FIXTURES));
  });

  it('lists every component the comparison needs for each fixture', () => {
    for (const f of sheet.fixtures) {
      const p = FIXTURES[f.id]!;
      const expected: string[] = [];
      for (const kind of GATE3_COMPONENT_KINDS) {
        if (isPerAdult(kind)) p.adults.forEach((_, i) => expected.push(`${kind}#${i}`));
        else expected.push(kind);
      }
      expect(f.components.map((c) => c.key).sort()).toEqual(expected.sort());
      const engine = gate3Components(p, ADOPTED_2026_ENCODED);
      for (const c of f.components) expect(c.engine).toBe(engine.get(c.key));
    }
  });

  it('every gate-3 rule is fed by at least one listed component', () => {
    const listed = new Set(sheet.fixtures.flatMap((f) => f.components.map((c) => c.kind)));
    for (const id of GATE3_RULE_IDS) for (const k of GATE3_RULE_FEEDS[id]) expect(listed.has(k)).toBe(true);
  });

  it('types every non-zero income and wealth field of every fixture, with the right total', () => {
    for (const f of sheet.fixtures) {
      const p = FIXTURES[f.id]!;
      const fields: [string, number][] = [];
      p.adults.forEach((a, i) => {
        for (const k of ['wageIncome', 'pensionIncome', 'capitalIncome', 'interestExpense', 'unionFee'] as const) {
          fields.push([`adults[${i}].${k}`, a[k]]);
        }
      });
      for (const [k, val] of Object.entries(p.wealth)) {
        if (k !== 'otherTaxableWealth') fields.push([`wealth.${k}`, val]);
      }
      for (const [source, val] of fields) {
        const typed = f.inputs.filter((i) => i.source === source).reduce((a, i) => a + i.value, 0);
        expect({ source, typed }).toEqual({ source, typed: val });
      }
      expect(p.wealth.otherTaxableWealth).toBe(0);
    }
  });

  it('renders without throwing and names every fixture', () => {
    const md = renderGate3Sheet(sheet);
    for (const id of Object.keys(FIXTURES)) expect(md).toContain(`## ${id}`);
  });
});

describe('docs/gate-3.md', () => {
  const doc = readFileSync(join(ROOT, 'docs/gate-3.md'), 'utf8');

  it('hard-codes none of the engine expectations', () => {
    const sheet = buildGate3Sheet();
    const variants = (n: number) => [String(n), n.toLocaleString('nb-NO').replace(/ /g, ' '), n.toLocaleString('en-US')];
    for (const f of sheet.fixtures) {
      for (const c of f.components) {
        if (c.engine < 1000) continue;
        for (const s of variants(c.engine)) expect({ fixture: f.id, key: c.key, inDoc: doc.includes(s) }).toEqual({ fixture: f.id, key: c.key, inDoc: false });
      }
    }
  });

  it('points at the script and the results file', () => {
    expect(doc).toContain('npm run gate3:sheet');
    expect(doc).toContain('src/data/gate3-results.ts');
  });
});
