/**
 * Gate-3 sheet: per fixture, what to type into Skatteetaten's skattekalkulator and what the
 * engine expects per compared component — computed live, never hard-coded. Printed by
 * `npm run gate3:sheet`; docs/gate-3.md explains the procedure.
 */
import { ADOPTED_2026_ENCODED } from './baseline/2026/adopted.ts';
import {
  GATE3_INNTEKTSAAR,
  GATE3_KIND_FORMULA,
  GATE3_OUT_OF_SCOPE,
  GATE3_TOLERANCE_KR,
  deriveGate3,
  gate3Components,
  kindOfKey,
} from './gate3.ts';
import type { FixtureSet, Gate3ComponentKey, Gate3ComponentKind, Gate3Results, Gate3Verdict } from './gate3.ts';
import { GATE3_RESULTS } from './gate3-results.ts';
import { computeScenario, sanitizeProfile } from '../engine/calculate-scenario.ts';
import { resolveBaseline } from '../engine/resolve.ts';
import { FIXTURES, FIXTURE_BIRTH_YEAR } from '../tests/fixtures.ts';
import type { Adult, BaselineRuleSet, FormulaId, UserProfile, Wealth } from '../types/index.ts';

export const CALCULATOR_URL = 'https://skattekalkulator.formueinntekt.skatt.skatteetaten.no/';

/**
 * A label in the calculator. `verified` = the exact string was read on 2026-09-26 from the
 * calculator's own 2026 text bundles (read-only; nothing typed or submitted). Unverified labels
 * are the skattemelding's usual names; the sheet prints them with «(verify label)».
 */
export interface CalcLabel {
  text: string;
  verified: boolean;
}
const v = (text: string): CalcLabel => ({ text, verified: true });
const u = (text: string): CalcLabel => ({ text, verified: false });

export const LABELS = {
  aar: v('Hvilket år vil du beregne skatt for?'),
  sivilstatus: v('Hva er din sivilstatus?'),
  ugift: v('Ugift'),
  gift: v('Gift / Registrert partner / Meldepliktig samboer'),
  foedselsaar: v('I hvilket år er du født (åååå)?'),
  foedselsaarEktefelle: v('I hvilket år er din ektefelle / registrerte partner / meldepliktig samboer født (åååå)?'),
  unge: v('Arbeidsfradrag for unge (forsøksordning)'),
  finnmark: v('Finnmarksfradrag'),
  kildeskatt: v('Jeg vil beregne for kildeskatt på lønn'),
  delAar: v('Jeg bor i Norge kun deler av året'),
  loenn: v('Lønn'),
  pensjon: v('Pensjon'),
  alderspensjon: u('Alderspensjon fra folketrygden'),
  fagforening: v('Fagforeningskontingent'),
  bankinnskudd: v('Bankinnskudd'),
  innskudd: u('Innskudd'),
  opptjenteRenter: u('Opptjente renter'),
  gjeldKort: u('Gjeld'),
  gjeld: u('Gjeld'),
  paaloepteRenter: u('Påløpte renter'),
  primaerbolig: v('Primærbolig'),
  sekundaerbolig: v('Sekundærbolig'),
  markedsverdi: u('markedsverdi (egen verdi, ikke ferdig formuesverdi)'),
  aksjer: v('Aksjer i aksjonærregisteret'),
  aksjeverdi: u('markedsverdi / verdi før verdsettingsrabatt'),
  // result side
  sumSkatt: v('Beregnet skatt og avgift'),
  nettoformue: v('Nettoformue'),
  sumMinstefradrag: v('Sum minstefradrag'),
  alminneligInntekt: v('Alminnelig inntekt før særfradrag'),
  fellesskatt: u('Fellesskatt'),
  skattKommune: u('Inntektsskatt til kommune'),
  skattFylke: u('Inntektsskatt til fylkeskommune'),
  trinnskatt: u('Trinnskatt'),
  trygdeavgift: u('Trygdeavgift'),
  skattefradragPensjon: u('Skattefradrag for pensjonsinntekt'),
  formuesskattKommune: u('Formuesskatt til kommune'),
  formuesskattStat: u('Formuesskatt til staten'),
} as const satisfies Record<string, CalcLabel>;

export function show(label: CalcLabel): string {
  return label.verified ? `«${label.text}»` : `«${label.text}» (verify label)`;
}

/**
 * Birth year typed for every adult of a fixture (`FIXTURE_BIRTH_YEAR` in src/tests/fixtures.ts,
 * where the choice is explained). Throws for a fixture without one.
 */
export function birthYearOf(fixtureId: string): number {
  const year = FIXTURE_BIRTH_YEAR[fixtureId];
  if (year === undefined) throw new Error(`gate 3: fixture «${fixtureId}» mangler fødselsår (FIXTURE_BIRTH_YEAR)`);
  return year;
}

/** Credit kinds reduce the tax: «Beregnet skatt og avgift» is the taxes minus these. */
export const CREDIT_KINDS: ReadonlySet<Gate3ComponentKind> = new Set<Gate3ComponentKind>(['skattefradragPensjon']);

/** Which calculator lines sum to each compared component. */
export const KIND_LINES: Record<Gate3ComponentKind, readonly CalcLabel[]> = {
  skattAlminneligInntekt: [LABELS.fellesskatt, LABELS.skattKommune, LABELS.skattFylke],
  trinnskatt: [LABELS.trinnskatt],
  trygdeavgift: [LABELS.trygdeavgift],
  skattefradragPensjon: [LABELS.skattefradragPensjon],
  formuesskatt: [LABELS.formuesskattKommune, LABELS.formuesskattStat],
};

type FieldSpec = { card: CalcLabel; field?: CalcLabel } | { notTyped: string };

/** Every profile field → where it goes in the calculator. Exhaustive by type. */
export const ADULT_FIELDS: Record<keyof Adult, FieldSpec> = {
  wageIncome: { card: LABELS.loenn },
  pensionIncome: { card: LABELS.pensjon, field: LABELS.alderspensjon },
  capitalIncome: { card: LABELS.bankinnskudd, field: LABELS.opptjenteRenter },
  interestExpense: { card: LABELS.gjeldKort, field: LABELS.paaloepteRenter },
  unionFee: { card: LABELS.fagforening },
  isStudent: { notTyped: 'studentstatus endrer ikke skatten; studiestøtten er ikke skattepliktig' },
  studyMonths: { notTyped: 'bare studiestøtte (utenfor gate 3)' },
};

export const WEALTH_FIELDS: Record<keyof Wealth, FieldSpec> = {
  primaryHomeValue: { card: LABELS.primaerbolig, field: LABELS.markedsverdi },
  secondaryHomeValue: { card: LABELS.sekundaerbolig, field: LABELS.markedsverdi },
  bankDeposits: { card: LABELS.bankinnskudd, field: LABELS.innskudd },
  listedShares: { card: LABELS.aksjer, field: LABELS.aksjeverdi },
  otherTaxableWealth: { notTyped: 'ingen fixture bruker annen formue; motoren verdsetter den med otherBp' },
  debt: { card: LABELS.gjeldKort, field: LABELS.gjeld },
};

export interface SheetInput {
  /** `adults[0].wageIncome`, `wealth.debt`, … — the profile field this line types. */
  source: string;
  who: string;
  where: string;
  value: number;
}

export interface SheetComponent {
  key: Gate3ComponentKey;
  kind: Gate3ComponentKind;
  engine: number;
  recorded: number | null;
  lines: string;
}

export interface SheetFixture {
  id: string;
  adults: number;
  setup: string[];
  inputs: SheetInput[];
  notTyped: string[];
  components: SheetComponent[];
  diagnostics: string[];
}

export interface Gate3Sheet {
  fixtures: SheetFixture[];
  verdicts: Gate3Verdict[];
  results: Gate3Results;
}

const nf = (n: number) => n.toLocaleString('nb-NO').replace(/\u00a0/g, ' ');

function whoOf(i: number, adults: number): string {
  if (adults === 1) return 'deg';
  return i === 0 ? 'deg (voksen 1)' : 'ektefelle (voksen 2)';
}

function placeOf(spec: { card: CalcLabel; field?: CalcLabel }): string {
  return spec.field ? `kort ${show(spec.card)}, felt ${show(spec.field)}` : `kort ${show(spec.card)}`;
}

function fixtureSheet(id: string, profile: UserProfile, ruleSet: BaselineRuleSet, results: Gate3Results): SheetFixture {
  const p = sanitizeProfile(profile);
  const n = p.adults.length;
  const born = birthYearOf(id);
  const setup = [
    `${show(LABELS.aar)} → ${GATE3_INNTEKTSAAR}`,
    `${show(LABELS.sivilstatus)} → ${show(n === 2 ? LABELS.gift : LABELS.ugift)}`,
    `${show(LABELS.foedselsaar)} → ${born}`,
    ...(n === 2 ? [`${show(LABELS.foedselsaarEktefelle)} → ${born}`] : []),
    `La være uavkrysset: ${[LABELS.unge, LABELS.finnmark, LABELS.kildeskatt, LABELS.delAar].map(show).join(', ')}`,
    ...(p.adults.some((a) => a.pensionIncome > 0)
      ? [
          'Pensjonen er alderspensjon fra folketrygden, mottatt hele året med 100 % uttaksgrad (motoren modellerer ikke gradert uttak eller færre måneder)',
        ]
      : []),
  ];

  const inputs: SheetInput[] = [];
  const notTyped: string[] = [];
  p.adults.forEach((adult, i) => {
    for (const [field, spec] of Object.entries(ADULT_FIELDS) as [keyof Adult, FieldSpec][]) {
      const value = adult[field];
      if ('notTyped' in spec) {
        if (value) notTyped.push(`adults[${i}].${field}: ${spec.notTyped}`);
        continue;
      }
      if (typeof value === 'number' && value !== 0) {
        inputs.push({ source: `adults[${i}].${field}`, who: whoOf(i, n), where: placeOf(spec), value });
      }
    }
  });
  for (const [field, spec] of Object.entries(WEALTH_FIELDS) as [keyof Wealth, FieldSpec][]) {
    const total = p.wealth[field];
    if (total === 0) continue;
    if ('notTyped' in spec) {
      notTyped.push(`wealth.${field}: ${spec.notTyped}`);
      continue;
    }
    // Couples: the engine taxes the household with the couple allowance/threshold, which equals
    // each spouse holding half with the single allowance/threshold. Type half on each spouse.
    const shares = n === 2 ? [Math.ceil(total / 2), Math.floor(total / 2)] : [total];
    shares.forEach((value, i) => {
      if (value !== 0) inputs.push({ source: `wealth.${field}`, who: whoOf(i, n), where: placeOf(spec), value });
    });
  }
  if (p.childrenAges.length > 0) {
    notTyped.push('childrenAges: barn påvirker ingen av de sammenlignede skattene i motoren; ikke legg inn barn eller barnepass');
  }
  notTyped.push('consumption: forbruk (moms/særavgifter) finnes ikke i skattekalkulatoren');

  const engine = gate3Components(profile, ruleSet);
  const rec = results.values[id] ?? {};
  const components: SheetComponent[] = [...engine].map(([key, amount]) => {
    const kind = kindOfKey(key);
    const idx = key.includes('#') ? Number(key.split('#')[1]) : null;
    const who = idx === null ? (n === 2 ? ' (sum for begge ektefeller)' : '') : n === 2 ? ` for ${whoOf(idx, n)}` : '';
    return {
      key,
      kind,
      engine: amount,
      recorded: rec[key] ?? null,
      lines: `${KIND_LINES[kind].map(show).join(' + ')}${who}`,
    };
  });

  const rs = resolveBaseline(ruleSet);
  const scenario = computeScenario(p, rs, rs);
  const diagnostics: string[] = [];
  for (const c of scenario.components) {
    if (c.formulaId === GATE3_KIND_FORMULA.skattAlminneligInntekt) {
      const who = n === 2 ? ` (${whoOf(c.adultIndex ?? 0, n)})` : '';
      diagnostics.push(`${show(LABELS.sumMinstefradrag)}${who}: ${nf(c.inputs.minstefradrag ?? 0)}`);
      diagnostics.push(`${show(LABELS.alminneligInntekt)}${who}: ${nf(c.inputs.alminneligInntekt ?? 0)}`);
    }
    if (c.formulaId === GATE3_KIND_FORMULA.formuesskatt) {
      diagnostics.push(`${show(LABELS.nettoformue)}${n === 2 ? ' (sum begge)' : ''}: ${nf(c.inputs.nettoformue ?? 0)}`);
    }
  }
  const total = [...engine].reduce((a, [key, v]) => (CREDIT_KINDS.has(kindOfKey(key)) ? a - v : a + v), 0);
  diagnostics.push(`${show(LABELS.sumSkatt)}${n === 2 ? ' (sum begge)' : ''}: ${nf(total)}`);

  return { id, adults: n, setup, inputs, notTyped, components, diagnostics };
}

export function buildGate3Sheet(
  ruleSet: BaselineRuleSet = ADOPTED_2026_ENCODED,
  results: Gate3Results = GATE3_RESULTS,
  fixtures: FixtureSet = FIXTURES,
): Gate3Sheet {
  return {
    fixtures: Object.entries(fixtures).map(([id, p]) => fixtureSheet(id, p, ruleSet, results)),
    verdicts: deriveGate3(ruleSet, results, fixtures),
    results,
  };
}

export function renderGate3Sheet(sheet: Gate3Sheet): string {
  const out: string[] = [
    '# Gate 3 — arbeidsark (generert av `npm run gate3:sheet`)',
    '',
    `Kalkulator: ${CALCULATOR_URL}`,
    `Toleranse: ±${GATE3_TOLERANCE_KR} kr per komponent. Registrer i \`src/data/gate3-results.ts\`.`,
    `Resultatfil: dato ${sheet.results.checkedOn ?? '—'}, år ${sheet.results.calculator.inntektsaar ?? '—'}, ` +
      `verdsetting ${sheet.results.valuationEnteredAs ?? '—'}.`,
    '',
  ];
  for (const f of sheet.fixtures) {
    out.push(`## ${f.id}`, '', 'Oppsett:');
    for (const s of f.setup) out.push(`- ${s}`);
    out.push('', 'Tast inn («Legg til opplysninger»):');
    for (const i of f.inputs) out.push(`- ${i.who}: ${i.where} → ${nf(i.value)}   _(${i.source})_`);
    out.push('', 'Ikke tastet:');
    for (const t of f.notTyped) out.push(`- ${t}`);
    out.push('', '| nøkkel i resultatfilen | kalkulatorlinjer | motor | registrert | ok |', '|---|---|---:|---:|---|');
    for (const c of f.components) {
      const ok = c.recorded === null ? '—' : Math.abs(c.recorded - c.engine) <= GATE3_TOLERANCE_KR ? 'ja' : 'NEI';
      out.push(`| \`${c.key}\` | ${c.lines} | ${nf(c.engine)} | ${c.recorded === null ? '—' : nf(c.recorded)} | ${ok} |`);
    }
    out.push('', 'Til feilsøking (registreres ikke):');
    for (const d of f.diagnostics) out.push(`- ${d}`);
    out.push('');
  }

  out.push('## Regler — status fra gate 3', '', '| regel | status | mater | hvorfor ikke confirmed |', '|---|---|---|---|');
  for (const vd of sheet.verdicts.filter((x) => x.gated)) {
    out.push(`| \`${vd.id}\` | ${vd.status} | ${vd.feeds.join(', ')} | ${vd.reasons.join('; ') || '—'} |`);
  }
  out.push('', 'Utenfor gate 3 (forblir `estimated`):');
  const byReason = new Map<string, FormulaId[]>();
  for (const [id, reason] of Object.entries(GATE3_OUT_OF_SCOPE) as [FormulaId, string][]) {
    byReason.set(reason, [...(byReason.get(reason) ?? []), id]);
  }
  for (const [reason, ids] of byReason) out.push(`- ${ids.map((i) => `\`${i}\``).join(', ')}: ${reason}`);
  out.push('');
  return out.join('\n');
}
