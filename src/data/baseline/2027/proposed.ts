import { kr, krPerUnit, pct } from '../../../engine/money.ts';
import { FORMULA_IDS } from '../../../engine/formulas.ts';
import type { AnyRule, BaselineRuleSet, FormulaId, FormulaParams, Provenance, Rule } from '../../../types/index.ts';
import { ADOPTED_2026 } from '../2026/adopted.ts';

/**
 * Regjeringens forslag for 2027 (Prop. 1 LS (2026–2027), lagt fram 2026-10-07). NOT adopted: the
 * Storting votes in December. In the 2027 round it is the base every party alternative amends,
 * and the reference stays the ADOPTED 2026 system (ADOPTED_2026).
 *
 * Tabell 1.5 (PDF p26–30) and Tabell 1.6 (PDF p31–35) print the 2026 and the 2027 value side by side,
 * so each rule that changes cites a row whose anchor holds BOTH numbers; `baselineParams` holds the
 * 2026 value the rule moves from and src/tests/round-2027.test.ts asserts it equals ADOPTED_2026.
 * A rule the tables show unchanged is carried from ADOPTED_2026 with a 2027 citation (`carry`).
 */

const SRC = 'prop1ls-2026-2027';
const URL = 'https://www.regjeringen.no/contentassets/36e022cd31e34350b61a5f2c7b33fa74/no/pdfs/prp202620270001ls0dddpdfs.pdf';

function prov(pageOrTable: string, anchor: string, method: string): Provenance {
  return {
    sourceId: SRC,
    sourceUrl: URL,
    pageOrTable,
    anchor,
    method,
    confidence: 'high',
    lastChecked: '2026-10-08',
    effectiveDate: '2027-01-01',
  };
}

function adoptedRule<F extends FormulaId>(id: F): Rule<F> {
  const r = ADOPTED_2026.rules.find((x) => x.id === id);
  if (!r) throw new Error(`adopted 2026 mangler ${id}`);
  return r as Rule<F>;
}

/** A rule the proposal changes: new value, the 2026 value it moves from, and the row that shows both. */
function changed<F extends FormulaId>(
  id: F,
  params: FormulaParams[F],
  label: string,
  page: string,
  anchor: string,
  method: string,
): Rule<F> {
  return {
    id,
    params,
    status: 'estimated',
    uncertain: false,
    label,
    provenance: prov(page, anchor, method),
    baselineParams: structuredClone(adoptedRule(id).params),
  };
}

/** A rule the tables show unchanged: the adopted 2026 value, cited to the 2027 row that says «-». */
function carry<F extends FormulaId>(id: F, page: string, anchor: string, method = 'Uendret fra 2026 i Tabell 1.5/1.6.'): Rule<F> {
  const base = adoptedRule(id);
  return {
    id,
    params: structuredClone(base.params),
    status: 'estimated',
    uncertain: false,
    label: base.label,
    provenance: prov(page, anchor, method),
    ...(base.note ? { note: base.note } : {}),
  };
}

/** Not in Prop. 1 LS (these sit in Prop. 1 S / NAV / Lånekassen): adopted 2026 value, flagged as not reviewed for 2027. */
function carryUnreviewed<F extends FormulaId>(id: F, why: string): Rule<F> {
  const base = adoptedRule(id);
  return {
    id,
    params: structuredClone(base.params),
    status: 'not-reviewed',
    uncertain: false,
    label: base.label,
    provenance: { ...base.provenance, method: `${base.provenance.method} [2027: ${why}]` },
    note: `2027-satsen står ikke i Prop. 1 LS (2026–2027). ${why} 2026-verdien er videreført; ikke kontrollert mot kilde for 2027.`,
  };
}

const BENEFIT_GAP = 'Må hentes fra Prop. 1 S / NAV / Lånekassen (kilden er ikke arkivert ennå).';

const RULES: readonly AnyRule[] = [
  carry('income.generalRate', 'PDF p26', '22 pst. 22 pst.'),
  changed(
    'income.bracketTax',
    {
      brackets: [
        { threshold: kr(235_150), rateBp: pct(1.7) },
        { threshold: kr(331_050), rateBp: pct(4) },
        { threshold: kr(754_050), rateBp: pct(13.7) },
        { threshold: kr(1_019_300), rateBp: pct(16.8) },
        { threshold: kr(1_525_900), rateBp: pct(17.8) },
      ],
    },
    'Trinnskatt fem trinn, innslagspunkter +4 pst (forslag 2027)',
    'PDF p26',
    '226 100 kr 235 150 kr',
    'Tabell 1.5, Trinn 1–5: innslagspunktene økes 4 pst, satsene er uendret (1,7 / 4,0 / 13,7 / 16,8 / 17,8 pst).',
  ),
  changed(
    'income.socialSecurity',
    { wageRateBp: pct(7.4), pensionRateBp: pct(5.1), lowerThreshold: kr(99_650), phaseInRateBp: pct(25) },
    'Trygdeavgift lønn 7,4 pst / pensjon 5,1 pst (forslag 2027)',
    'PDF p26',
    '7,6 pst. 7,4 pst.',
    'Tabell 1.5, Trygdeavgift: lønnsinntekt 7,6 → 7,4 pst; pensjon 5,1, nedre grense 99 650 kr og opptrappingssats 25 pst uendret.',
  ),
  changed(
    'income.personalAllowance',
    { amount: kr(120_180) },
    'Personfradrag 120 180 kr (forslag 2027)',
    'PDF p27',
    '114 540 kr 120 180 kr',
    'Tabell 1.5, Personfradrag 114 540 → 120 180 kr.',
  ),
  changed(
    'income.minimumDeductionWage',
    { rateBp: pct(46), max: kr(99_550), min: kr(0) },
    'Minstefradrag i lønn 46 pst, maks 99 550 kr (forslag 2027)',
    'PDF p27',
    '95 700 kr 99 550 kr',
    'Tabell 1.5, Minstefradrag i lønnsinntekt: sats 46 pst uendret, øvre grense 95 700 → 99 550 kr. Nedre grense modelleres som 0, som i 2026.',
  ),
  changed(
    'income.minimumDeductionPension',
    { rateBp: pct(40), max: kr(77_950), min: kr(0) },
    'Minstefradrag i pensjon 40 pst, maks 77 950 kr (forslag 2027)',
    'PDF p27',
    '75 400 kr 77 950 kr',
    'Tabell 1.5, Minstefradrag i pensjonsinntekt: sats 40 pst uendret, øvre grense 75 400 → 77 950 kr.',
  ),
  changed(
    'income.unionFeeDeduction',
    { max: kr(8_950) },
    'Fagforeningsfradrag maks 8 950 kr (forslag 2027)',
    'PDF p28',
    '8 700 kr 8 950 kr',
    'Tabell 1.5, Maksimalt fradrag for innbetalt fagforeningskontingent 8 700 → 8 950 kr.',
  ),
  carry(
    'income.workTaxCredit',
    'PDF p29',
    'Arbeidsfradrag for unge som omfattes av',
    'Tabell 1.5 har ingen generell skattereduksjon for folk i arbeid; forsøksordningen for unge (egen rad) modelleres ikke, som i 2026.',
  ),
  changed(
    'income.pensionTaxCredit',
    { max: kr(40_750), threshold1: kr(306_250), rate1Bp: pct(19.1), threshold2: kr(457_550), rate2Bp: pct(6) },
    'Skattefradrag for pensjonsinntekt maks 40 750 kr (forslag 2027)',
    'PDF p27',
    '39 100 kr 40 750 kr',
    'Tabell 1.5, Skattefradrag for pensjonsinntekt: maks 39 100 → 40 750 kr; nedtrapping fra 294 200 → 306 250 kr (19,1 pst) og 437 100 → 457 550 kr (6 pst).',
  ),
  changed(
    'wealth.netWealthTax',
    {
      single: { allowance: kr(1_990_000), tier2Threshold: kr(21_500_000) },
      couple: { allowance: kr(3_980_000), tier2Threshold: kr(43_000_000) },
      tier1RateBp: pct(1),
      tier2RateBp: pct(1.1),
    },
    'Formuesskatt: bunnfradrag 1,99 mill. (forslag 2027)',
    'PDF p29',
    '1 900 000 kr 1 990 000 kr',
    'Tabell 1.5, Formuesskatt: innslagspunkt (kommune og stat trinn 1) 1,9 → 1,99 mill. kr, trinn 2 21,5 mill. uendret; satser 0,35 + 0,65 / 0,75 pst uendret (summert 1,0 / 1,1 pst). Ektefeller har dobbelte innslagspunkter (note 15).',
  ),
  carry('wealth.valuation', 'PDF p29', 'Aksjer (inkl. næringseiendom) og tilordnet gjeld', 'Tabell 1.5, Verdsettelse: primærbolig 25/70 pst (grense 14 mill.), sekundærbolig 100, aksjer 80, driftsmidler 70 pst, alle uendret.'),
  carry('vat.food', 'PDF p31', '15 15 -'),
  carry('vat.general', 'PDF p31', '25 25 -'),
  carry('vat.transportServices', 'PDF p31', '12 12 -'),
  carry('vat.electricity', 'PDF p31', '25 25 -'),
  carry('vat.fuel', 'PDF p31', '25 25 -'),
  carry('vat.alcoholTobacco', 'PDF p31', '25 25 -'),
  carry('vat.flights', 'PDF p31', '12 12 -'),
  changed(
    'excise.petrolLitre',
    { ratePerUnit: krPerUnit(7.77) },
    'Veibruks- og CO2-avgift bensin 7,77 kr/l (forslag 2027)',
    'PDF p33; p34',
    '3,77 3,37',
    'Tabell 1.6: veibruksavgift bensin 3,77 → 3,37 kr/l (p33) pluss CO2-avgift bensin 3,80 → 4,40 kr/l (p34) = 7,77 kr/l (2026: 7,57).',
  ),
  changed(
    'excise.dieselLitre',
    { ratePerUnit: krPerUnit(6.97) },
    'Veibruks- og CO2-avgift diesel 6,97 kr/l (forslag 2027)',
    'PDF p33; p34',
    '2,28 1,84',
    'Tabell 1.6: veibruksavgift mineralolje 2,28 → 1,84 kr/l (p33) pluss CO2-avgift mineralolje, generell sats 4,42 → 5,13 kr/l (p34) = 6,97 kr/l (2026: 6,70).',
  ),
  changed(
    'excise.kwh',
    { ratePerUnit: krPerUnit(0.0732) },
    'Elavgift 7,32 øre/kWh (forslag 2027)',
    'PDF p34',
    '7,13 7,32',
    'Tabell 1.6, Avgift på elektrisk kraft, alminnelig sats 7,13 → 7,32 øre/kWh.',
  ),
  changed(
    'excise.flightEurope',
    { ratePerUnit: krPerUnit(63) },
    'Flypassasjeravgift lav sats 63 kr (forslag 2027)',
    'PDF p35',
    '61 63',
    'Tabell 1.6, Flypassasjeravgift lav sats 61 → 63 kr.',
  ),
  changed(
    'excise.flightOther',
    { ratePerUnit: krPerUnit(359) },
    'Flypassasjeravgift høy sats 359 kr (forslag 2027)',
    'PDF p35',
    '350 359',
    'Tabell 1.6, Flypassasjeravgift høy sats 350 → 359 kr.',
  ),
  changed(
    'excise.beerLitre',
    { ratePerUnit: krPerUnit(24.85) },
    'Alkoholavgift øl 3,7–4,7 vol.pst. 24,85 kr/l (forslag 2027)',
    'PDF p31',
    '24,20 24,85',
    'Tabell 1.6, annen alkoholholdig drikk til og med 4,7 vol.pst., 3,7–4,7 vol.pst.: 24,20 → 24,85 kr/l.',
  ),
  changed(
    'excise.wineLitre',
    { ratePerUnit: krPerUnit(66.72) },
    'Alkoholavgift vin ca. 12 vol.pst. (66,72 kr/l) (forslag 2027)',
    'PDF p31',
    '5,41 5,56',
    'Tabell 1.6: 5,41 → 5,56 kr/vol.pst./l. Motoren bruker 12 vol.pst. som typisk vin (5,56 × 12), som i 2026.',
  ),
  changed(
    'excise.spiritsLitre',
    { ratePerUnit: krPerUnit(379.2) },
    'Alkoholavgift brennevin ca. 40 vol.pst. (379,20 kr/l) (forslag 2027)',
    'PDF p31',
    '9,23 9,48',
    'Tabell 1.6: 9,23 → 9,48 kr/vol.pst./l. Motoren bruker 40 vol.pst. som typisk styrke (9,48 × 40), som i 2026.',
  ),
  changed(
    'excise.cigarette',
    { ratePerUnit: krPerUnit(3.4) },
    'Tobakksavgift sigaretter 3,40 kr/stk (forslag 2027)',
    'PDF p31',
    '331 340',
    'Tabell 1.6, Sigaretter 331 → 340 kr per 100 stk.',
  ),
  changed(
    'excise.snusGram',
    { ratePerUnit: krPerUnit(1.05) },
    'Tobakksavgift snus 1,05 kr/gram (forslag 2027)',
    'PDF p31',
    '102 105',
    'Tabell 1.6, Snus 102 → 105 kr per 100 gram.',
  ),
  carryUnreviewed('benefit.childBenefit', BENEFIT_GAP),
  carryUnreviewed('benefit.studentSupport', BENEFIT_GAP),
  carry('employer.contribution', 'PDF p27', '14,1 pst. 14,1 pst.'),
];

function assemble(): BaselineRuleSet {
  const byId = new Map<FormulaId, AnyRule>();
  for (const r of RULES) {
    if (byId.has(r.id)) throw new Error(`forslag 2027 har regelen ${r.id} to ganger`);
    byId.set(r.id, r);
  }
  const missing = FORMULA_IDS.filter((id) => !byId.has(id));
  if (missing.length > 0) throw new Error(`forslag 2027 mangler: ${missing.join(', ')}`);
  return { id: 'proposed', year: 2027, rules: FORMULA_IDS.map((id) => byId.get(id)!) };
}

export const PROPOSED_2027: BaselineRuleSet = assemble();
