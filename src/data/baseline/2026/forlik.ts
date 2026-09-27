import type { FormulaId } from '../../../types/index.ts';

/** One row from Innst. 2 S «Skatt og avgift» / utgiftsendringer (baseline-2026.md row 72). */
export interface ForlikChange {
  readonly ordinal: number;
  readonly summary: string;
  readonly sourceId: string;
  readonly sourceUrl: string;
  readonly pageOrTable: string;
  /** ≤ 10 verbatim words from the archived source. */
  readonly anchor: string;
  /** Set when the MVP engine models the change as a param diff proposed → adopted. */
  readonly formulaId?: FormulaId;
  /** False when no FormulaId exists yet (reisefradrag, næringsfradrag, uføreytelser, …). */
  readonly modeled: boolean;
  readonly note?: string;
}

const I2S = 'innst2s-2025-2026';
const I2S_URL = 'https://www.stortinget.no/globalassets/pdf/innstillinger/stortinget/2025-2026/inns-202526-002s.pdf';
const I3S = 'innst3s-2025-2026';
const I3S_URL = 'https://www.stortinget.no/globalassets/pdf/innstillinger/stortinget/2025-2026/inns-202526-003s.pdf';
const I4L = 'innst4l-2025-2026';
const I4L_URL = 'https://www.stortinget.no/globalassets/pdf/innstillinger/stortinget/2025-2026/inns-202526-004l.pdf';

/**
 * All 15 endringer fra budsjettforliket 2026 mot Prop. 1 LS.
 * Kilde: sources/worksheets/baseline-2026.md (I2S p23–24 + tilhørende I3S/I4L).
 */
export const FORLIK_2026 = {
  agreement:
    'Rammer: Ap–Sp–Rødt 29. nov. 2025. Flertall (+SV, MDG): avtale 3. des. 2025 (I3S §2.3.2.2).',
  sourceTable: 'I2S PDF p23–24 / printed 19–20 «Skatt og avgift»; utgiftsendringer I2S p20 / printed 16',
  changes: [
    {
      ordinal: 1,
      summary: 'Trinnskatt trinn 4: øke satsen med 0,1 prosentenhet (16,7 → 16,8 pst)',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p14 / printed 8 §3.1.2',
      anchor: '16,8 pst. for den delen av inntekten',
      formulaId: 'income.bracketTax',
      modeled: true,
    },
    {
      ordinal: 2,
      summary: 'Trinnskatt trinn 5: øke satsen med 0,1 prosentenhet (17,7 → 17,8 pst)',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p14 / printed 8 §3.1.2',
      anchor: '17,8 pst. for den delen av inntekten',
      formulaId: 'income.bracketTax',
      modeled: true,
    },
    {
      ordinal: 3,
      summary: 'Personfradrag: øke med 330 kr (114 210 → 114 540 kr)',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p14 / printed 8 §3.1.1.3',
      anchor: 'er 114 540 kroner i klasse 1',
      formulaId: 'income.personalAllowance',
      modeled: true,
    },
    {
      ordinal: 4,
      summary: 'Veibruksavgift bensin: redusere med 0,48 kr/l (4,25 → 3,77 kr/l; motor: + uendret CO2)',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p21 / printed 15',
      anchor: 'bensin per liter: kr 3,77',
      formulaId: 'excise.petrolLitre',
      modeled: true,
      note: 'Motor lagrer veibruk + CO2 summert (7,57 vs 8,05 kr/l proposed).',
    },
    {
      ordinal: 5,
      summary: 'Veibruksavgift mineralolje/biodiesel: redusere med 0,72 kr/l (3,00 → 2,28 kr/l)',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p20–21 / printed 14–15',
      anchor: '(autodiesel) per liter: kr 2,28',
      formulaId: 'excise.dieselLitre',
      modeled: true,
      note: 'Motor lagrer veibruk + CO2 summert (6,70 vs 7,42 kr/l proposed).',
    },
    {
      ordinal: 6,
      summary: 'Fiskerfradrag: 160 000 kr',
      sourceId: I4L,
      sourceUrl: I4L_URL,
      pageOrTable: 'PDF p10 / printed 6',
      anchor: 'Fiskerfradraget foreslås satt til 160 000',
      modeled: false,
      note: 'Ingen income.fisherDeduction-formel i MVP-motoren.',
    },
    {
      ordinal: 7,
      summary: 'Jordbruksfradrag 99 600 kr / maks 208 900 kr; reindriftsfradrag følger',
      sourceId: I4L,
      sourceUrl: I4L_URL,
      pageOrTable: 'PDF p10 / printed 6',
      anchor: 'Jordbruksfradraget foreslås satt til 99 600',
      modeled: false,
      note: 'Ingen næringsfradrag-formler i MVP-motoren.',
    },
    {
      ordinal: 8,
      summary: 'Sjøfolkfradrag: 86 300 kr',
      sourceId: I4L,
      sourceUrl: I4L_URL,
      pageOrTable: 'PDF p10 / printed 6',
      anchor: 'Sjøfolkfradraget foreslås satt til 86 300',
      modeled: false,
      note: 'Ingen income.seafarerDeduction-formel i MVP-motoren.',
    },
    {
      ordinal: 9,
      summary: 'Reisefradrag: nedre grense 12 000 kr, sats 1,90 kr/km, øvre 120 000 kr',
      sourceId: I2S,
      sourceUrl: I2S_URL,
      pageOrTable: 'I2S p23 / printed 19; I3S p16; I4L p6',
      anchor: 'Redusere nedre grense i reisefradraget',
      modeled: false,
      note: 'Prop. 1 LS: 1,87 kr/km; nedre 15 600; øvre 103 100. Ingen reisefradrag-formel i motoren.',
    },
    {
      ordinal: 10,
      summary: 'CO2-avgift veksthusnæringen: halv opptrapping (naturgass 0,95 kr/Sm³, LPG 1,43 kr/kg)',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p23 / printed 17',
      anchor: 'CO2-avgift veksthusnæringen',
      modeled: false,
      note: 'Husholdningsmotor modellerer ikke veksthus-CO2.',
    },
    {
      ordinal: 11,
      summary: 'Elavgift: redusere foreslått kutt (4,18 → 7,13 øre/kWh fra 1. januar)',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p22 / printed 16',
      anchor: 'med 7,13 øre per kWh på elektrisk kraft',
      formulaId: 'excise.kwh',
      modeled: true,
    },
    {
      ordinal: 12,
      summary: 'CO2-avgift sokkelen: økt slik samlet CO2-pris = 2 010 kr/tonn',
      sourceId: I3S,
      sourceUrl: I3S_URL,
      pageOrTable: 'PDF p23 / printed 17; I2S p24 / printed 20',
      anchor: 'CO2-avgift sokkelen',
      modeled: false,
      note: 'Petroleum/sektoravgift — utenfor husholdningsprofilen.',
    },
    {
      ordinal: 13,
      summary: 'Barnetrygd prisjustert fra 1. februar 2026 (609 mill.)',
      sourceId: I2S,
      sourceUrl: I2S_URL,
      pageOrTable: 'PDF p20 / printed 16 utgiftsendringer',
      anchor: 'Prisjustere barnetrygd 1. februar',
      formulaId: 'benefit.childBenefit',
      modeled: true,
      note:
        'Prop. nominell videreføring ≈ 1 968 kr/mnd; vedtatt 2 012 kr/mnd fra 1.2.2026. Eksakt proposed-sats avhenger av tolkning av «nominelt» — flagget estimated.',
    },
    {
      ordinal: 14,
      summary: 'Fribeløp for uføre: til 1G fra 1. oktober 2026',
      sourceId: I2S,
      sourceUrl: I2S_URL,
      pageOrTable: 'PDF p20 / printed 16 utgiftsendringer',
      anchor: 'Fribeløp for uføre til 1G',
      modeled: false,
      note: 'Ingen uføreytelse-formel i MVP-motoren.',
    },
    {
      ordinal: 15,
      summary: 'Reversere kutt i engangsstønaden',
      sourceId: I2S,
      sourceUrl: I2S_URL,
      pageOrTable: 'PDF p20 / printed 16 utgiftsendringer',
      anchor: 'Reversere kutt i engangsstønaden',
      modeled: false,
      note: 'Engangsstønad er utenfor målgruppene / ingen benefit-formel.',
    },
  ] satisfies readonly ForlikChange[],
} as const;

/** Unique formula ids touched by the forlik (6 ids, 7 param-level changes). */
export function forlikModeledFormulaIds(): FormulaId[] {
  const ids = FORLIK_2026.changes.filter((c) => c.formulaId).map((c) => c.formulaId!);
  return [...new Set(ids)];
}

/** Formula ids where adopted ≠ proposed but the change is NOT from the forlik list. */
export const NON_FORLIK_BASELINE_DIFFS: readonly { formulaId: FormulaId; reason: string }[] = [
  {
    formulaId: 'wealth.valuation',
    reason:
      'Primærbolig 14 mill.-trinn: skatteloven §4-10 endret ved lov 23.06.2026 nr. 66 med verknad frå inntektsåret 2026 (arkivert som lovdata-endringslov-2026-06-23-66). Prop. 1 LS Tabell 1.7 sier 10 mill. fordi den er eldre enn lovendringen (ikke forlikspost).',
  },
  {
    formulaId: 'income.pensionTaxCredit',
    reason:
      'Skattefradrag for pensjonsinntekt: skattevedtaket §6-5 endret 19.06.2026 (FOR-2026-06-19-1243, i kraft 1.1.2026) til 39 100 kr / 294 200 kr / 437 100 kr, og nedtrappingssatsen i trinn 1 hevet fra 16,7 til 19,1 pst ved lov 23.06.2026 nr. 66, «med virkning fra 1. januar 2026» (Innst. 459 L PDF p3). Prop. 1 LS og desembervedtaket har 37 100 / 284 950 / 436 050 kr og 16,7 pst (ikke forlikspost).',
  },
];
