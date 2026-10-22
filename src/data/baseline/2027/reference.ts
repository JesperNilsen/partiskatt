import { kr, rate, roundHalfAway } from '../../../engine/money.ts';
import { FORMULA_IDS } from '../../../engine/formulas.ts';
import type {
  AnyRule,
  BaselineRuleSet,
  ExciseFormulaId,
  FormulaId,
  FormulaParams,
  Kroner,
  Provenance,
  Rule,
} from '../../../types/index.ts';
import { ADOPTED_2026 } from '../2026/adopted.ts';

/**
 * Referansesystemet for 2027: the 2026 system as ADOPTED, moved to 2027 level the way Prop. 1 LS
 * (2026–2027) builds the reference it measures every proposal against («endring fra referansen»).
 * Decision 2026-10-20 (Jesper): the 2027 round compares with this indexed system, not with the 2026
 * rules at the same kroner, so indexation that only keeps the system unchanged in real terms is not
 * shown as a tax cut.
 *
 * Convention, all from the archived text (sources/text/prop1ls-2026-2027.txt; PDF pN = page N):
 * - §2.9.1 (PDF p73): deductions and income limits in personal taxation are adjusted «i hovedsak» with
 *   expected wage growth; særavgift quantity rates with expected CPI growth; note 3: percentage rates
 *   (VAT, trygdeavgift …) are held unchanged.
 * - §1.4 / §3.1 (PDF p25, p79): wage growth 4,0 pst., pension growth 3,35 pst., CPI growth 2,7 pst.
 * - PDF p25: after indexing the amounts are «avrundet»; the unit is not printed. Nearest 50 kr reproduces
 *   every amount the Prop says moves in line with the reference (src/tests/reference-2027.test.ts), and
 *   nearest 10 or 100 kr does not. Excise components are rounded at the precision Tabell 1.6 prints them.
 * - Wealth: the Prop says the 14 mill. and 21,5 mill. limits are held nominal and that this is a change
 *   against the reference (PDF p92), but it does not print the factor. 4,0 pst. (wage growth) is an
 *   ASSUMPTION, labelled on the two wealth rules. It has no effect on income-only households.
 * - Benefits (barnetrygd, studiestøtte) are not part of the tax referansesystem and are carried from 2026,
 *   as PROPOSED_2027 carries them, so they contribute zero.
 */

const SRC = 'prop1ls-2026-2027';
const URL = 'https://www.regjeringen.no/contentassets/36e022cd31e34350b61a5f2c7b33fa74/no/pdfs/prp202620270001ls0dddpdfs.pdf';

/** Expected growth 2026 → 2027 in basis points (Prop. 1 LS (2026–2027) §1.4, PDF p79). */
export const GROWTH_2027_BP = { wage: 400, pension: 335, cpi: 270 } as const;
export type GrowthKind = keyof typeof GROWTH_2027_BP;

/** A kroner amount at 2027 reference level: amount × (1 + growth), rounded to the nearest `unit` kr (50). */
export function indexKroner(amount: number, growthBp: number, unit = 50): Kroner {
  return kr(roundHalfAway((amount * (10_000 + growthBp)) / (10_000 * unit)) * unit);
}

/** An integer in a table's printed precision (5,41 → 541), indexed and rounded at that same precision. */
export function indexPrinted(printed: number, growthBp: number): number {
  return roundHalfAway((printed * (10_000 + growthBp)) / 10_000);
}

/**
 * The 2026 excise rates as Tabell 1.6 prints their components (PDF p31–35, «2026» column), each an
 * integer in the printed precision. `unit` converts one printed step into the engine's RatePerUnit
 * (1/10 000 kr per litre, kWh, passenger, cigarette or gram): 0,01 kr/l = 100; 0,01 øre/kWh = 1;
 * 0,01 kr per vol.pst. at 12 vol.pst. wine = 1 200; 1 kr per 100 cigarettes = 100. A test asserts that
 * the components compose to exactly the ADOPTED_2026 rate, so they cannot drift apart.
 */
export const EXCISE_COMPONENTS_2026: Readonly<Record<ExciseFormulaId, readonly { what: string; printed: number; unit: number }[]>> = {
  'excise.petrolLitre': [
    { what: 'veibruksavgift bensin 3,77 kr/l', printed: 377, unit: 100 },
    { what: 'CO2-avgift bensin 3,80 kr/l', printed: 380, unit: 100 },
  ],
  'excise.dieselLitre': [
    { what: 'veibruksavgift mineralolje 2,28 kr/l', printed: 228, unit: 100 },
    { what: 'CO2-avgift mineralolje, generell sats 4,42 kr/l', printed: 442, unit: 100 },
  ],
  'excise.kwh': [{ what: 'elavgift 7,13 øre/kWh', printed: 713, unit: 1 }],
  'excise.flightEurope': [{ what: 'flypassasjeravgift lav sats 61 kr', printed: 61, unit: 10_000 }],
  'excise.flightOther': [{ what: 'flypassasjeravgift høy sats 350 kr', printed: 350, unit: 10_000 }],
  'excise.beerLitre': [{ what: 'øl 3,7–4,7 vol.pst. 24,20 kr/l', printed: 2_420, unit: 100 }],
  'excise.wineLitre': [{ what: 'vin 5,41 kr per vol.pst. per liter, × 12 vol.pst.', printed: 541, unit: 1_200 }],
  'excise.spiritsLitre': [{ what: 'brennevin 9,23 kr per vol.pst. per liter, × 40 vol.pst.', printed: 923, unit: 4_000 }],
  'excise.cigarette': [{ what: 'sigaretter 331 kr per 100 stk.', printed: 331, unit: 100 }],
  'excise.snusGram': [{ what: 'snus 102 kr per 100 gram', printed: 102, unit: 100 }],
};

function prov(pageOrTable: string, anchor: string, method: string, confidence: Provenance['confidence'] = 'high'): Provenance {
  return {
    sourceId: SRC,
    sourceUrl: URL,
    pageOrTable,
    anchor,
    method,
    confidence,
    lastChecked: '2026-10-20',
    effectiveDate: '2027-01-01',
  };
}

function adoptedRule<F extends FormulaId>(id: F): Rule<F> {
  const r = ADOPTED_2026.rules.find((x) => x.id === id);
  if (!r) throw new Error(`adopted 2026 mangler ${id}`);
  return r as Rule<F>;
}


/** A rule whose amounts move to 2027 level: adopted params → indexed params, cited to the convention. */
function indexed<F extends FormulaId>(
  id: F,
  move: (p: FormulaParams[F]) => FormulaParams[F],
  label: string,
  provenance: Provenance,
  note?: string,
): Rule<F> {
  return {
    id,
    params: move(structuredClone(adoptedRule(id).params)),
    status: 'estimated',
    uncertain: false,
    label,
    provenance,
    ...(note ? { note } : {}),
  };
}

/** A rule the reference holds unchanged (a rate, or an amount outside the referansesystem). */
function carried<F extends FormulaId>(id: F, provenance: Provenance, note?: string): Rule<F> {
  const base = adoptedRule(id);
  return {
    id,
    params: structuredClone(base.params),
    status: base.status,
    uncertain: false,
    label: base.label,
    provenance,
    ...(note ? { note } : base.note ? { note: base.note } : {}),
  };
}

const RATE_P73 = 'Prosentsatser, som for eksempel merverdiavgiftssatsene';
const rateHeld = (what: string) =>
  prov('PDF p73', RATE_P73, `${what} Prosentsatser holdes uendret i referansesystemet (§2.9.1 note 3); 2026-satsen er videreført.`);

/** Benefits are outside the tax referansesystem: carried, as PROPOSED_2027 carries them, so they give zero. */
const benefitHeld = (id: 'benefit.childBenefit' | 'benefit.studentSupport') => {
  const src = adoptedRule(id).provenance;
  return prov(
    'PDF p73',
    'Referansesystemet for skatt er basert på',
    `Referansesystemet i §2.9.1 gjelder skatter og avgifter; ytelser inngår ikke, og Prop. 1 LS trykker ikke 2027-satsen. 2026-satsen (${src.sourceId}, ${src.pageOrTable}) er videreført i referansen som i forslaget, så linjen gir null.`,
    'medium',
  );
};

const W = GROWTH_2027_BP.wage;
const P = GROWTH_2027_BP.pension;
const C = GROWTH_2027_BP.cpi;

function exciseRule(id: ExciseFormulaId, label: string, page: string, anchor: string, extra = ''): Rule<ExciseFormulaId> {
  const parts = EXCISE_COMPONENTS_2026[id];
  const moved = parts.map((c) => ({ ...c, to: indexPrinted(c.printed, C) }));
  const ratePerUnit = rate(moved.reduce((s, c) => s + c.to * c.unit, 0));
  const steps = moved.map((c) => `${c.what}: ${c.printed} × 1,027 → ${c.to} (i trykt presisjon)`).join('; ');
  return {
    id,
    params: { ratePerUnit },
    status: 'estimated',
    uncertain: false,
    label,
    provenance: prov(
      `PDF p73; ${page}`,
      anchor,
      `Kvantumssatsene prisjusteres med anslått KPI-vekst 2,7 pst. (§2.9.1, PDF p73; vekst PDF p25/p79), hver komponent avrundet slik Tabell 1.6 trykker den. ${steps}.${extra}`,
    ),
  };
}

const RULES: readonly AnyRule[] = [
  carried('income.generalRate', rateHeld('Skatt på alminnelig inntekt 22 pst.')),
  indexed(
    'income.bracketTax',
    (p) => ({ brackets: p.brackets.map((b) => ({ threshold: indexKroner(b.threshold, W), rateBp: b.rateBp })) }),
    'Trinnskatt, innslagspunkter × 1,04 (referanse 2027)',
    prov(
      'PDF p73; p79; p80',
      'anslått lønnsvekst på 4,0 pst.',
      'Innslagspunktene justeres med lønnsvekst 4,0 pst. og avrundes til nærmeste 50 kr: 226 100 / 318 300 / 725 050 / 980 100 / 1 467 200 → 235 150 / 331 050 / 754 050 / 1 019 300 / 1 525 900. Lik forslaget (PDF p80: «justert med anslått lønnsvekst»). Satsene er uendret.',
    ),
  ),
  indexed(
    'income.socialSecurity',
    (p) => ({ ...p, lowerThreshold: indexKroner(p.lowerThreshold, W) }),
    'Trygdeavgift 7,6 / 5,1 pst., nedre grense 103 650 kr (referanse 2027)',
    prov(
      'PDF p73; p82',
      'grense for å betale trygdeavgift (frikortgrensen)',
      'Satsene 7,6 og 5,1 pst. og opptrappingssatsen 25 pst. holdes uendret (§2.9.1 note 3, PDF p73). Nedre grense er en inntektsgrense og justeres med lønnsvekst: 99 650 × 1,04 = 103 636 → 103 650 kr. PDF p82 (§3.1.6) sier at frikortgrensen videreføres nominelt og at det «innebærer en endring sammenlignet med referansesystemet»; faktoren står ikke, 4,0 pst. følger hovedregelen i §2.9.1.',
      'medium',
    ),
  ),
  indexed(
    'income.personalAllowance',
    (p) => ({ amount: indexKroner(p.amount, W) }),
    'Personfradrag 119 100 kr (referanse 2027: 114 540 × 1,04)',
    prov(
      'PDF p73; p79',
      'reell økning på om lag 1 200 kroner',
      'Personfradraget justeres med lønnsvekst: 114 540 × 1,04 = 119 121,6 → 119 100 kr. Forslaget 120 180 kr er +4,9 pst., en «reell økning» mot referansen (PDF p79). Prop sier «om lag 1 200 kroner»; denne referansen gir 1 080 kr, og lettelsen 0,22 × 1 080 = 238 kr samsvarer med Props «om lag 250 kroner».',
    ),
  ),
  indexed(
    'income.minimumDeductionWage',
    (p) => ({ ...p, max: indexKroner(p.max, W), min: indexKroner(p.min, W) }),
    'Minstefradrag i lønn 46 pst., maks 99 550 kr (referanse 2027)',
    prov(
      'PDF p79',
      'anslått lønns- og pensjonsvekst på henholdsvis 4,0',
      'Øvre grense justeres med lønnsvekst: 95 700 × 1,04 = 99 528 → 99 550 kr, lik forslaget. Sats 46 pst. uendret; nedre grense 0 som i 2026.',
    ),
  ),
  indexed(
    'income.minimumDeductionPension',
    (p) => ({ ...p, max: indexKroner(p.max, P), min: indexKroner(p.min, P) }),
    'Minstefradrag i pensjon 40 pst., maks 77 950 kr (referanse 2027)',
    prov(
      'PDF p79',
      'anslått lønns- og pensjonsvekst på henholdsvis 4,0',
      'Øvre grense justeres med pensjonsvekst: 75 400 × 1,0335 = 77 925,9 → 77 950 kr, lik forslaget. Sats 40 pst. uendret.',
    ),
  ),
  indexed(
    'income.unionFeeDeduction',
    (p) => ({ max: indexKroner(p.max, C) }),
    'Fagforeningsfradrag maks 8 950 kr (referanse 2027, prisjustert)',
    prov(
      'PDF p82',
      '8 700 kroner til 8 950 kroner',
      'Maksimalt fradrag «prisjusteres ... i tråd med referansen» (PDF p82): 8 700 × 1,027 = 8 934,9 → 8 950 kr, lik forslaget.',
    ),
  ),
  carried(
    'income.workTaxCredit',
    prov(
      'PDF p82',
      'også økt med lønnsvekst i tråd med referansen',
      'Ingen generell skattereduksjon for folk i arbeid; 0 kr indeksert er 0 kr. Forsøksordningen med arbeidsfradrag for unge (justeres med lønnsvekst i tråd med referansen, PDF p82) modelleres ikke, som i 2026.',
    ),
  ),
  indexed(
    'income.pensionTaxCredit',
    (p) => ({ ...p, max: indexKroner(p.max, P), threshold1: indexKroner(p.threshold1, P), threshold2: indexKroner(p.threshold2, P) }),
    'Skattefradrag for pensjonsinntekt maks 40 400 kr (referanse 2027)',
    prov(
      'PDF p79; p81',
      'med 2 200 kroner utover',
      'Beløp og grenser justeres med pensjonsvekst 3,35 pst. og avrundes til nærmeste 50 kr. Trinn 1: 294 200 → 304 050 kr; PDF p81 sier forslaget 306 250 kr er 2 200 kr «utover referansen» (306 250 − 2 200 = 304 050). Trinn 2: 437 100 → 451 750 kr; forslaget 457 550 er 5 800 kr over (457 550 − 5 800 = 451 750). Maks: 39 100 → 40 400 kr (faktoren for maksbeløpet står ikke; pensjonsvekst gir en lettelse på inntil 350 + 0,191 × 2 200 = 770 kr, Prop sier «inntil 750 kroner»). Satsene 19,1 / 6 pst. er uendret.',
      'medium',
    ),
  ),
  indexed(
    'wealth.netWealthTax',
    (p) => ({
      ...p,
      single: { allowance: indexKroner(p.single.allowance, W), tier2Threshold: indexKroner(p.single.tier2Threshold, W) },
      couple: { allowance: indexKroner(p.couple.allowance, W), tier2Threshold: indexKroner(p.couple.tier2Threshold, W) },
    }),
    'Formuesskatt: bunnfradrag 1,976 mill., trinn 2 22,36 mill. (referanse 2027, ANTATT × 1,04)',
    prov(
      'PDF p92',
      'videreføres nominelt fra 2026 til 2027.',
      'ANTAKELSE: Prop sier at innslagspunktet 21,5 mill. for trinn 2 videreføres nominelt og at dette øker provenyet med om lag 100 mill. kr mot referansen (PDF p92), og at bunnfradraget 1 990 000 kr økes «reelt» (PDF p20), men faktoren for formuesgrensene står ikke. Lønnsvekst 4,0 pst. er lagt til grunn: 1 900 000 → 1 976 000, 21 500 000 → 22 360 000 kr (ektefeller det dobbelte). Satsene er uendret. Ingen virkning for husholdninger uten formue over bunnfradraget.',
      'low',
    ),
    'Faktoren for formuesgrensene er en merket antakelse (lønnsvekst 4,0 pst.); Prop. 1 LS (2026–2027) trykker den ikke.',
  ),
  indexed(
    'wealth.valuation',
    (p) => ({ ...p, primaryHomeHighValueThreshold: indexKroner(p.primaryHomeHighValueThreshold, W) }),
    'Verdsettelse formue, primærbolig-grense 14,56 mill. (referanse 2027, ANTATT × 1,04)',
    prov(
      'PDF p92',
      'Det foreslås at beløpsgrensen for lav',
      'ANTAKELSE: grensen for lav verdsetting av primærbolig (14 mill.) videreføres nominelt i forslaget, som Prop regner som en endring mot referansen (PDF p92); faktoren står ikke. Lønnsvekst 4,0 pst. er lagt til grunn: 14 000 000 → 14 560 000 kr. Verdsettelsesprosentene er uendret.',
      'low',
    ),
    'Faktoren for primærbolig-grensen er en merket antakelse (lønnsvekst 4,0 pst.).',
  ),
  carried('vat.food', rateHeld('Mva-sats næringsmidler 15 pst.')),
  carried('vat.general', rateHeld('Alminnelig mva-sats 25 pst.')),
  carried('vat.transportServices', rateHeld('Redusert mva-sats 12 pst.')),
  carried('vat.electricity', rateHeld('Mva på strøm 25 pst.')),
  carried('vat.fuel', rateHeld('Mva på drivstoff 25 pst.')),
  carried('vat.alcoholTobacco', rateHeld('Mva på alkohol og tobakk 25 pst.')),
  carried('vat.flights', rateHeld('Mva på flyreiser 12 pst.')),
  exciseRule('excise.petrolLitre', 'Veibruks- og CO2-avgift bensin 7,77 kr/l (referanse 2027)', 'p20', 'veitrafikken holdes reelt uendret.', ' Sum 3,87 + 3,90 = 7,77 kr/l, lik forslagets 3,37 + 4,40 (PDF p20: avgiftene «holdes reelt uendret»).'),
  exciseRule('excise.dieselLitre', 'Veibruks- og CO2-avgift diesel 6,88 kr/l (referanse 2027)', 'p33; p34', '2,28 1,84', ' Sum 2,34 + 4,54 = 6,88 kr/l; forslaget 1,84 + 5,13 = 6,97 kr/l ligger 0,09 kr/l over referansen.'),
  exciseRule('excise.kwh', 'Elavgift 7,32 øre/kWh (referanse 2027)', 'p34', '7,13 7,32', ' Lik forslaget.'),
  exciseRule('excise.flightEurope', 'Flypassasjeravgift lav sats 63 kr (referanse 2027)', 'p35', '61 63', ' Lik forslaget.'),
  exciseRule('excise.flightOther', 'Flypassasjeravgift høy sats 359 kr (referanse 2027)', 'p35', '350 359', ' Lik forslaget.'),
  exciseRule('excise.beerLitre', 'Alkoholavgift øl 3,7–4,7 vol.pst. 24,85 kr/l (referanse 2027)', 'p31', '24,20 24,85', ' Lik forslaget.'),
  exciseRule('excise.wineLitre', 'Alkoholavgift vin ca. 12 vol.pst. (66,72 kr/l) (referanse 2027)', 'p31', '5,41 5,56', ' 5,56 × 12 = 66,72 kr/l, lik forslaget.'),
  exciseRule('excise.spiritsLitre', 'Alkoholavgift brennevin ca. 40 vol.pst. (379,20 kr/l) (referanse 2027)', 'p31', '9,23 9,48', ' 9,48 × 40 = 379,20 kr/l, lik forslaget.'),
  exciseRule('excise.cigarette', 'Tobakksavgift sigaretter 3,40 kr/stk (referanse 2027)', 'p31', '331 340', ' 3,40 kr/stk, lik forslaget.'),
  exciseRule('excise.snusGram', 'Tobakksavgift snus 1,05 kr/gram (referanse 2027)', 'p31', '102 105', ' 1,05 kr/g, lik forslaget.'),
  carried('benefit.childBenefit', benefitHeld('benefit.childBenefit')),
  carried('benefit.studentSupport', benefitHeld('benefit.studentSupport')),
  carried(
    'employer.contribution',
    rateHeld('Arbeidsgiveravgift sone I 14,1 pst.'),
    'Ekstra arbeidsgiveravgift har sats 0 i 2026, så terskelen 850 000 kr har ingen virkning og er videreført uindeksert.',
  ),
];

function assemble(): BaselineRuleSet {
  const byId = new Map<FormulaId, AnyRule>();
  for (const r of RULES) {
    if (byId.has(r.id)) throw new Error(`referanse 2027 har regelen ${r.id} to ganger`);
    byId.set(r.id, r);
  }
  const missing = FORMULA_IDS.filter((id) => !byId.has(id));
  if (missing.length > 0) throw new Error(`referanse 2027 mangler: ${missing.join(', ')}`);
  return { id: 'reference', year: 2027, rules: FORMULA_IDS.map((id) => byId.get(id)!) };
}

/** The 2027 referansesystem: ADOPTED_2026 indexed to 2027 level per Prop. 1 LS (2026–2027). */
export const REFERENCE_2027: BaselineRuleSet = assemble();
