/**
 * Operator gate 3: the only path by which an adopted-baseline rule may become `confirmed`.
 *
 * Jesper types each fixture in `src/tests/fixtures.ts` into Skatteetaten's skattekalkulator
 * and records what it shows in `src/data/gate3-results.ts`. A rule becomes `confirmed` iff
 *   1. it is a gate-3 rule (it feeds a component the calculator shows — GATE3_RULE_FEEDS),
 *   2. every one of its parameters is exercised by the fixtures (moving it 1 % changes a
 *      component it feeds — otherwise a match says nothing about that parameter),
 *   3. every fixture component it feeds has a recorded Skatteetaten value within 1 kr of the
 *      engine, and the results carry a date and the 2026 calculator year.
 * Nothing else may set `confirmed`: `applyGate3Status` refuses a rule set that already
 * contains one. Party rules never pass through here.
 *
 * This module must not import the adopted rule set (adopted.ts imports this module).
 */
import { computeScenario, sanitizeProfile } from '../engine/calculate-scenario.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import { FIXTURES } from '../tests/fixtures.ts';
import type { AnyRule, BaselineRuleSet, DataStatus, FormulaId, UserProfile } from '../types/index.ts';

export const GATE3_TOLERANCE_KR = 1;
export const GATE3_INNTEKTSAAR = 2026;
/** Local sensitivity step for the exercise test: ±1 % of the parameter (at least 1 unit). */
export const GATE3_EXERCISE_STEP_BP = 100;

/**
 * The numbers per fixture the comparison needs (what the calculator shows as tax lines). Every
 * kind but formuesskatt is per adult; `skattefradragPensjon` is a credit (it reduces the tax).
 */
export const GATE3_COMPONENT_KINDS = [
  'skattAlminneligInntekt',
  'trinnskatt',
  'trygdeavgift',
  'skattefradragPensjon',
  'formuesskatt',
] as const;
export type Gate3ComponentKind = (typeof GATE3_COMPONENT_KINDS)[number];

type PerAdultKind = Exclude<Gate3ComponentKind, 'formuesskatt'>;
export type Gate3ComponentKey = `${PerAdultKind}#${0 | 1}` | 'formuesskatt';

/** The engine formula whose component *is* the compared number. */
export const GATE3_KIND_FORMULA: Record<Gate3ComponentKind, FormulaId> = {
  skattAlminneligInntekt: 'income.generalRate',
  trinnskatt: 'income.bracketTax',
  trygdeavgift: 'income.socialSecurity',
  skattefradragPensjon: 'income.pensionTaxCredit',
  formuesskatt: 'wealth.netWealthTax',
};

const KIND_BY_FORMULA = new Map<FormulaId, Gate3ComponentKind>(
  GATE3_COMPONENT_KINDS.map((k) => [GATE3_KIND_FORMULA[k], k]),
);

export function isPerAdult(kind: Gate3ComponentKind): kind is PerAdultKind {
  return kind !== 'formuesskatt';
}

/**
 * Rule → compared components, read off the engine (income-tax.ts, wealth-tax.ts):
 * - skatt på alminnelig inntekt = generalRate × max0(alminnelig inntekt − personfradrag), where
 *   alminnelig inntekt subtracts minstefradrag (wage + pension) and fagforeningsfradrag;
 * - trinnskatt reads only the bracket table; trygdeavgift only its own parameters;
 * - skattefradragPensjon reads its own parameters; the taxes above reach it only through the cap
 *   (§ 16-1 (6)), and every pension fixture is chosen so the cap does not bind;
 * - formuesskatt reads the valuation discounts and the allowance/tier table.
 * `gate3.test.ts` perturbs every parameter of every formula and checks this map is exact.
 */
export const GATE3_RULE_FEEDS = {
  'income.generalRate': ['skattAlminneligInntekt'],
  'income.personalAllowance': ['skattAlminneligInntekt'],
  'income.minimumDeductionWage': ['skattAlminneligInntekt'],
  'income.minimumDeductionPension': ['skattAlminneligInntekt'],
  'income.unionFeeDeduction': ['skattAlminneligInntekt'],
  'income.bracketTax': ['trinnskatt'],
  'income.socialSecurity': ['trygdeavgift'],
  'income.pensionTaxCredit': ['skattefradragPensjon'],
  'wealth.netWealthTax': ['formuesskatt'],
  'wealth.valuation': ['formuesskatt'],
} as const satisfies Partial<Record<FormulaId, readonly Gate3ComponentKind[]>>;

export type Gate3RuleId = keyof typeof GATE3_RULE_FEEDS;
export const GATE3_RULE_IDS = Object.keys(GATE3_RULE_FEEDS) as Gate3RuleId[];

export function isGate3Rule(id: FormulaId): id is Gate3RuleId {
  return Object.hasOwn(GATE3_RULE_FEEDS, id);
}

const NOT_IN_CALCULATOR_VAT =
  'Merverdiavgift og særavgifter beregnes ikke av skattekalkulatoren; gate 3 kan ikke bekrefte regelen.';
const NOT_IN_CALCULATOR_BENEFIT =
  'Barnetrygd og studiestøtte er utbetalinger (NAV/Lånekassen), ikke skatt; skattekalkulatoren viser dem ikke.';
const NOT_IN_CALCULATOR_EMPLOYER =
  'Arbeidsgiveravgift betales av arbeidsgiver og vises ikke i skattekalkulatoren.';

/** Every formula outside gate 3, with the reason it stays `estimated`. Exhaustive by type. */
export const GATE3_OUT_OF_SCOPE: Record<Exclude<FormulaId, Gate3RuleId>, string> = {
  'income.workTaxCredit':
    'Et generelt jobbfradrag finnes ikke i gjeldende rett (0 kr i vedtatt budsjett); skattekalkulatoren har ingenting å sammenligne med.',
  'vat.food': NOT_IN_CALCULATOR_VAT,
  'vat.general': NOT_IN_CALCULATOR_VAT,
  'vat.transportServices': NOT_IN_CALCULATOR_VAT,
  'vat.electricity': NOT_IN_CALCULATOR_VAT,
  'vat.fuel': NOT_IN_CALCULATOR_VAT,
  'vat.alcoholTobacco': NOT_IN_CALCULATOR_VAT,
  'vat.flights': NOT_IN_CALCULATOR_VAT,
  'excise.petrolLitre': NOT_IN_CALCULATOR_VAT,
  'excise.dieselLitre': NOT_IN_CALCULATOR_VAT,
  'excise.kwh': NOT_IN_CALCULATOR_VAT,
  'excise.flightEurope': NOT_IN_CALCULATOR_VAT,
  'excise.flightOther': NOT_IN_CALCULATOR_VAT,
  'excise.beerLitre': NOT_IN_CALCULATOR_VAT,
  'excise.wineLitre': NOT_IN_CALCULATOR_VAT,
  'excise.spiritsLitre': NOT_IN_CALCULATOR_VAT,
  'excise.cigarette': NOT_IN_CALCULATOR_VAT,
  'excise.snusGram': NOT_IN_CALCULATOR_VAT,
  'benefit.childBenefit': NOT_IN_CALCULATOR_BENEFIT,
  'benefit.studentSupport': NOT_IN_CALCULATOR_BENEFIT,
  'employer.contribution': NOT_IN_CALCULATOR_EMPLOYER,
};

// ---------------------------------------------------------------------------------------------
// Results file shape (the data lives in gate3-results.ts)

export interface Gate3Results {
  /** ISO date (yyyy-mm-dd) the calculator was run. */
  checkedOn: string | null;
  calculator: {
    /** Answer to «Hvilket år vil du beregne skatt for?». Must be 2026. */
    inntektsaar: number | null;
    /** Free text: URL and anything identifying the version (page footer, date of last update). */
    version: string | null;
  };
  /**
   * How home and share values were typed. Only `markedsverdi` (the calculator applies the
   * rabatt itself) lets `wealth.valuation` be confirmed.
   */
  valuationEnteredAs: 'markedsverdi' | 'formuesverdi' | null;
  /** Skatteetaten's value per fixture id × component, whole kroner as shown. */
  values: Readonly<Record<string, Partial<Record<Gate3ComponentKey, number>>>>;
}

// ---------------------------------------------------------------------------------------------
// Engine side

export type ComponentValues = ReadonlyMap<Gate3ComponentKey, number>;

/** The compared components for one profile under a baseline rule set, straight from the engine. */
export function gate3Components(profile: UserProfile, ruleSet: BaselineRuleSet): ComponentValues {
  const rs = resolveBaseline(ruleSet);
  const result = computeScenario(sanitizeProfile(profile), rs, rs);
  const out = new Map<Gate3ComponentKey, number>();
  for (const c of result.components) {
    const kind = KIND_BY_FORMULA.get(c.formulaId);
    if (!kind) continue;
    const key = (isPerAdult(kind) ? `${kind}#${c.adultIndex ?? 0}` : kind) as Gate3ComponentKey;
    out.set(key, c.amount);
  }
  return out;
}

export function kindOfKey(key: Gate3ComponentKey): Gate3ComponentKind {
  return key.split('#')[0] as Gate3ComponentKind;
}

/** Every fixture component a rule feeds (all fixtures, all adults). */
export function fedKeys(ruleId: Gate3RuleId, components: ComponentValues): Gate3ComponentKey[] {
  const kinds: readonly Gate3ComponentKind[] = GATE3_RULE_FEEDS[ruleId];
  return [...components.keys()].filter((k) => kinds.includes(kindOfKey(k)));
}

// ---------------------------------------------------------------------------------------------
// Parameter leaves and the exercise test

type Json = number | boolean | readonly Json[] | { readonly [k: string]: Json };

export interface ParamLeaf {
  path: string;
  value: number | boolean;
}

/** Every numeric / boolean leaf of a params object, with a readable path (`brackets[2].threshold`). */
export function paramLeaves(params: unknown, prefix = ''): ParamLeaf[] {
  const p = params as Json;
  if (typeof p === 'number' || typeof p === 'boolean') return [{ path: prefix, value: p }];
  if (Array.isArray(p)) return p.flatMap((v, i) => paramLeaves(v, `${prefix}[${i}]`));
  return Object.entries(p as Record<string, Json>).flatMap(([k, v]) => paramLeaves(v, prefix ? `${prefix}.${k}` : k));
}

function setLeaf(params: unknown, path: string, value: number | boolean): unknown {
  const clone = structuredClone(params) as Record<string, unknown>;
  const parts = path.match(/[^.[\]]+/g) ?? [];
  let node: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]!] as Record<string, unknown>;
  node[parts[parts.length - 1]!] = value;
  return clone;
}

/** The two nudged values for a leaf: ±1 % (at least one unit) for numbers, the flip for booleans. */
export function nudges(value: number | boolean): (number | boolean)[] {
  if (typeof value === 'boolean') return [!value];
  const step = Math.max(1, Math.round((Math.abs(value) * GATE3_EXERCISE_STEP_BP) / 10_000));
  return [value + step, Math.max(0, value - step)].filter((v) => v !== value);
}

export function withRuleParams(ruleSet: BaselineRuleSet, id: FormulaId, params: unknown): BaselineRuleSet {
  return {
    ...ruleSet,
    rules: ruleSet.rules.map((r) => (r.id === id ? ({ ...r, params } as AnyRule) : r)),
  };
}

export interface LeafExercise {
  path: string;
  /** `${fixtureId}:${componentKey}` pairs whose value moved when the leaf was nudged. */
  movedBy: string[];
}

export type FixtureSet = Readonly<Record<string, UserProfile>>;

/** For one rule: which fixture components each parameter moves (restricted to `kinds`). */
export function exerciseOf(
  ruleSet: BaselineRuleSet,
  id: FormulaId,
  fixtures: FixtureSet = FIXTURES,
  kinds: readonly Gate3ComponentKind[] = GATE3_COMPONENT_KINDS,
): LeafExercise[] {
  const rule = ruleSet.rules.find((r) => r.id === id);
  if (!rule) throw new Error(`gate 3: regelsettet mangler ${id}`);
  const base = Object.entries(fixtures).map(([fid, p]) => [fid, p, gate3Components(p, ruleSet)] as const);
  return paramLeaves(rule.params).map(({ path, value }) => {
    const moved = new Set<string>();
    for (const v of nudges(value)) {
      const nudged = withRuleParams(ruleSet, id, setLeaf(rule.params, path, v));
      for (const [fid, profile, before] of base) {
        const after = gate3Components(profile, nudged);
        for (const [key, amount] of after) {
          if (!kinds.includes(kindOfKey(key))) continue;
          if (before.get(key) !== amount) moved.add(`${fid}:${key}`);
        }
      }
    }
    return { path, movedBy: [...moved].sort() };
  });
}

// ---------------------------------------------------------------------------------------------
// Derivation

export interface Gate3Comparison {
  fixture: string;
  key: Gate3ComponentKey;
  engine: number;
  recorded: number | null;
  ok: boolean;
}

export interface Gate3Verdict {
  id: FormulaId;
  gated: boolean;
  status: DataStatus;
  feeds: readonly Gate3ComponentKind[];
  /** Parameter paths no fixture exercises (empty for out-of-scope rules). */
  unexercised: string[];
  comparisons: Gate3Comparison[];
  /** Why the rule is not confirmed (empty iff confirmed). */
  reasons: string[];
}

/** Throws on a recorded value for an unknown fixture or a component the engine does not produce. */
export function validateGate3Results(
  results: Gate3Results,
  ruleSet: BaselineRuleSet,
  fixtures: FixtureSet = FIXTURES,
): void {
  for (const [fid, rec] of Object.entries(results.values)) {
    const profile = fixtures[fid];
    if (!profile) throw new Error(`gate 3: resultat for ukjent fixture «${fid}»`);
    const known = gate3Components(profile, ruleSet);
    for (const [key, v] of Object.entries(rec)) {
      if (!known.has(key as Gate3ComponentKey)) throw new Error(`gate 3: «${fid}» har ingen komponent «${key}»`);
      if (typeof v !== 'number' || !Number.isSafeInteger(v) || v < 0) {
        throw new Error(`gate 3: «${fid}.${key}» må være et helt, ikke-negativt kronebeløp`);
      }
    }
  }
}

function hasAnyValue(results: Gate3Results): boolean {
  return Object.values(results.values).some((r) => Object.keys(r).length > 0);
}

/** One verdict per rule in the set, in rule order. Pure; never mutates the input. */
export function deriveGate3(
  ruleSet: BaselineRuleSet,
  results: Gate3Results,
  fixtures: FixtureSet = FIXTURES,
): Gate3Verdict[] {
  if (ruleSet.id !== 'adopted') throw new Error('gate 3 gjelder bare det vedtatte referansesystemet');
  validateGate3Results(results, ruleSet, fixtures);
  const engine = Object.entries(fixtures).map(([fid, p]) => [fid, gate3Components(p, ruleSet)] as const);

  const metaProblems: string[] = [];
  if (hasAnyValue(results)) {
    if (!results.checkedOn || !/^\d{4}-\d{2}-\d{2}$/.test(results.checkedOn)) {
      metaProblems.push('resultatfilen mangler dato (checkedOn)');
    }
    if (results.calculator.inntektsaar !== GATE3_INNTEKTSAAR) {
      metaProblems.push(`resultatfilen er ikke registrert for inntektsåret ${GATE3_INNTEKTSAAR}`);
    }
  }

  return ruleSet.rules.map((rule): Gate3Verdict => {
    if (!isGate3Rule(rule.id)) {
      return {
        id: rule.id,
        gated: false,
        status: rule.status,
        feeds: [],
        unexercised: [],
        comparisons: [],
        reasons: [GATE3_OUT_OF_SCOPE[rule.id as Exclude<FormulaId, Gate3RuleId>]],
      };
    }
    const id = rule.id;
    const feeds = GATE3_RULE_FEEDS[id];
    const reasons: string[] = [...metaProblems];

    const unexercised = exerciseOf(ruleSet, id, fixtures, feeds)
      .filter((l) => l.movedBy.length === 0)
      .map((l) => l.path);
    if (unexercised.length > 0) {
      reasons.push(`parametre ingen fixture treffer: ${unexercised.join(', ')}`);
    }
    if (id === 'wealth.valuation' && results.valuationEnteredAs !== 'markedsverdi') {
      reasons.push('bolig- og aksjeverdier er ikke registrert som markedsverdi (valuationEnteredAs)');
    }

    const comparisons: Gate3Comparison[] = [];
    for (const [fid, comps] of engine) {
      for (const key of fedKeys(id, comps)) {
        const eng = comps.get(key)!;
        const rec = results.values[fid]?.[key];
        const recorded = typeof rec === 'number' ? rec : null;
        comparisons.push({
          fixture: fid,
          key,
          engine: eng,
          recorded,
          ok: recorded !== null && Math.abs(recorded - eng) <= GATE3_TOLERANCE_KR,
        });
      }
    }
    const missing = comparisons.filter((c) => c.recorded === null).length;
    const off = comparisons.filter((c) => c.recorded !== null && !c.ok);
    if (missing > 0) reasons.push(`${missing} av ${comparisons.length} komponenter mangler Skatteetaten-verdi`);
    for (const c of off) {
      reasons.push(`${c.fixture}.${c.key}: motor ${c.engine} ≠ Skatteetaten ${c.recorded} (> ${GATE3_TOLERANCE_KR} kr)`);
    }
    if (comparisons.length === 0) reasons.push('ingen fixture-komponent å sammenligne');

    return {
      id,
      gated: true,
      status: reasons.length === 0 ? 'confirmed' : rule.status,
      feeds,
      unexercised,
      comparisons,
      reasons,
    };
  });
}

/**
 * The adopted rule set with gate-3 statuses applied. Refuses a hand-set `confirmed`: the
 * encoded rule set must carry no confirmed rule; confirmation only ever comes from `results`.
 */
export function applyGate3Status(
  encoded: BaselineRuleSet,
  results: Gate3Results,
  fixtures: FixtureSet = FIXTURES,
): BaselineRuleSet {
  const handSet = encoded.rules.filter((r) => r.status === 'confirmed').map((r) => r.id);
  if (handSet.length > 0) {
    throw new Error(
      `gate 3: ${handSet.join(', ')} er satt til confirmed for hånd; confirmed kan bare avledes fra src/data/gate3-results.ts`,
    );
  }
  const verdicts = new Map(deriveGate3(encoded, results, fixtures).map((v) => [v.id, v]));
  return {
    ...encoded,
    rules: encoded.rules.map((r) => {
      const v = verdicts.get(r.id)!;
      return v.status === r.status ? r : ({ ...r, status: v.status } as AnyRule);
    }),
  };
}
