import { kr, krPerUnit, pct } from '../../../engine/money.ts';
import type { BaselineRuleSet, DataStatus, FormulaId, FormulaParams, Provenance, Rule } from '../../../types/index.ts';

/** Build provenance from sources/manifest.json ids (S3b: not Skatteetaten-confirmed). */
function prov(
  sourceId: string,
  sourceUrl: string,
  pageOrTable: string,
  anchor: string,
  method: string,
  effectiveDate = '2026-01-01',
  confidence: Provenance['confidence'] = 'high',
): Provenance {
  return {
    sourceId,
    sourceUrl,
    pageOrTable,
    anchor,
    method,
    confidence,
    lastChecked: '2026-09-13',
    effectiveDate,
  };
}

/** Operator gate 3: nothing is `confirmed` until Jesper cross-checks Skatteetaten. */
const STATUS: DataStatus = 'estimated';

function rule<F extends FormulaId>(
  id: F,
  params: FormulaParams[F],
  label: string,
  provenance: Provenance,
  overrides: Partial<Omit<Rule<F>, 'id' | 'params' | 'provenance'>> = {},
): Rule<F> {
  return {
    id,
    params,
    status: STATUS,
    uncertain: false,
    label,
    provenance,
    ...overrides,
  };
}

const SV = 'lovdata-skattevedtak-2026';
const SV_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2747';
const FT = 'lovdata-folketrygdavgift-2026';
const FT_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2748';
const SKL_ENDR = 'lovdata-endringslov-2026-06-23-66';
const SKL_ENDR_URL = 'https://lovdata.no/dokument/LTI/lov/2026-06-23-66';
const MVA = 'lovdata-mva-2026';
const MVA_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2752';
const I4L = 'innst-4-l-2025-2026';
const I4L_URL = 'https://www.stortinget.no/globalassets/pdf/innstillinger/stortinget/2025-2026/inns-202526-004l.pdf';
const VEIB = 'lovdata-saeravgift-veibruk-2026';
const VEIB_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2759';
const EL = 'lovdata-saeravgift-elavgift-2026';
const EL_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2763';
const FLY = 'lovdata-saeravgift-flypassasjer-2026';
const FLY_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2776';
const ALK = 'lovdata-saeravgift-alkohol-2026';
const ALK_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2753';
const TOB = 'lovdata-saeravgift-tobakk-2026';
const TOB_URL = 'https://lovdata.no/dokument/LTI/forskrift/2025-12-18-2754';
const NAV_BT = 'nav-barnetrygd-2026';
const NAV_BT_URL = 'https://www.nav.no/barnetrygd';
const LK = 'lanekassen-satser-2026-2027';
const LK_URL = 'https://lanekassen.no/nb-NO/laresteder/nyheter/forskriftene-for-2026-2027-er-klare/';

/** Vedtatt referansesystem 2026 (Lovdata + budsjettforlik). */
export const ADOPTED_2026: BaselineRuleSet = {
  id: 'adopted',
  year: 2026,
  rules: [
    rule(
      'income.generalRate',
      { rateBp: pct(22) },
      'Skatt på alminnelig inntekt 22 pst (fellesskatt + skattører)',
      prov(SV, SV_URL, '§3-2, §3-8', 'For personlig skattepliktig og dødsbo ellers: 8,25 pst.', 'Fellesskatt 8,25 pst + maks kommune 11,35 + maks fylke 2,40 = 22 pst.'),
    ),
    rule(
      'income.bracketTax',
      {
        brackets: [
          { threshold: kr(226_100), rateBp: pct(1.7) },
          { threshold: kr(318_300), rateBp: pct(4) },
          { threshold: kr(725_050), rateBp: pct(13.7) },
          { threshold: kr(980_100), rateBp: pct(16.8) },
          { threshold: kr(1_467_200), rateBp: pct(17.8) },
        ],
      },
      'Trinnskatt fem trinn (vedtatt; trinn 4–5 hevet i budsjettforlik)',
      prov(SV, SV_URL, '§3-1; I3S PDF p14', 'som overstiger 725 050 kroner', 'Terskler fra skattevedtak §3-1; trinn 4–5 satser 16,8 og 17,8 pst fra forlik (I3S §3.1.2).'),
    ),
    rule(
      'income.socialSecurity',
      {
        wageRateBp: pct(7.6),
        pensionRateBp: pct(5.1),
        lowerThreshold: kr(99_650),
        phaseInRateBp: pct(25),
      },
      'Trygdeavgift lønn 7,6 pst / pensjon 5,1 pst',
      prov(
        FT,
        FT_URL,
        '§6–§7; SE-FU',
        'beregnes trygdeavgift med 7,6 pst.',
        'Satser fra folketrygdvedtak §6–§7. Nedre grense 99 650 kr og opptrapping 25 pst står i folketrygdloven §23-3; verdi fra Forskuddsutskrivingen/Prop. 1 LS Tabell 1.7.',
        '2026-01-01',
        'medium',
      ),
    ),
    rule(
      'income.personalAllowance',
      { amount: kr(114_540) },
      'Personfradrag 114 540 kr',
      prov(SV, SV_URL, '§6-3; I3S PDF p14', 'er 114 540 kroner i klasse 1', 'Vedtatt 114 540 kr (forlik: +330 kr mot Prop. 1 LS 114 210 kr).'),
    ),
    rule(
      'income.minimumDeductionWage',
      { rateBp: pct(46), max: kr(95_700), min: kr(0) },
      'Minstefradrag i lønn 46 pst, maks 95 700 kr',
      prov(
        SV,
        SV_URL,
        '§6-1; SE-FU',
        'ikke settes høyere enn 95 700 kroner',
        'Sats 46 pst fra skatteloven §6-32 via Forskuddsutskrivingen; øvre grense i skattevedtak §6-1. Ingen generell nedre grense for bosatte i Norge — min satt til 0.',
        '2026-01-01',
        'medium',
      ),
      { note: 'Nedre grense 4 000 kr gjelder bare bosatt i utlandet (Skatteetaten); ikke modellert separat.' },
    ),
    rule(
      'income.minimumDeductionPension',
      { rateBp: pct(40), max: kr(75_400), min: kr(0) },
      'Minstefradrag i pensjon 40 pst, maks 75 400 kr',
      prov(SV, SV_URL, '§6-1 annet ledd', 'ikke settes høyere enn 75 400 kroner', 'Sats 40 pst fra skatteloven §6-32 via Forskuddsutskrivingen; øvre grense i skattevedtak §6-1.'),
    ),
    rule(
      'income.unionFeeDeduction',
      { max: kr(8_700) },
      'Fagforeningsfradrag maks 8 700 kr',
      prov(I4L, I4L_URL, 'PDF p6 / §2.3', 'yrkes- og næringsorganisasjoner foreslås økt til 8 700', 'Vedtatt via Innst. 4 L (skatteloven §6-20).'),
    ),
    rule(
      'wealth.netWealthTax',
      {
        single: { allowance: kr(1_900_000), tier2Threshold: kr(21_500_000) },
        couple: { allowance: kr(3_800_000), tier2Threshold: kr(43_000_000) },
        tier1RateBp: pct(1),
        tier2RateBp: pct(1.1),
      },
      'Formuesskatt stat 0,65/0,75 pst + kommune maks 0,35 pst',
      prov(SV, SV_URL, '§2-1, §2-3', 'som overstiger 21 500 000 kroner', 'Bunnfradrag og trinn fra skattevedtak; satser summert stat + kommune (1,0 og 1,1 pst).'),
    ),
    rule(
      'wealth.valuation',
      {
        primaryHomeBp: pct(25),
        primaryHomeHighValueThreshold: kr(14_000_000),
        primaryHomeHighValueBp: pct(70),
        secondaryHomeBp: pct(100),
        listedSharesBp: pct(80),
        bankDepositsBp: pct(100),
        otherBp: pct(70),
        debtReductionApplies: { secondaryHome: false, listedShares: true, other: true },
      },
      'Verdsettelsesrabatter formue (primærbolig, aksjer, driftsmidler)',
      prov(
        SKL_ENDR,
        SKL_ENDR_URL,
        'Del II (§4-10 andre ledd tredje punktum); Del IV (ikrafttredelse); konsolidert sktl. §4-10, §4-12, §4-17',
        'omsetningsverdien som overstiger 14 000 000 kroner',
        'Primærbolig 25 pst under 14 mill., 70 pst over. Endringslov 23.06.2026 nr. 66 Del II, «med verknad frå og med inntektsåret 2026» (arkivert 2026-09-13); konsolidert sktl. §4-10 (lovdata-skatteloven-kap4-2026) samsvarer ordrett. Prop. 1 LS Tabell 1.7 / SE-FU sier 10 mill. fordi de er eldre enn lovendringen. Sekundærbolig 100 pst; aksjer 80 pst; driftsmidler 70 pst i otherBp (sktl. §4-12, §4-17).',
        '2026-01-01',
        'high',
      ),
      { note: '14 mill.-terskel bekreftet av endringslov 23.06.2026 nr. 66 (beslutning 2026-09-13: arkivert og kontrollert mot konsolidert lovtekst). Prop. 1 LS/SE-FU viser 10 mill. fordi de er eldre enn lovendringen. Status estimated som alt annet inntil operator gate 3.' },
    ),
    rule('vat.food', { rateBp: pct(15) }, 'Merverdiavgift næringsmidler 15 pst', prov(MVA, MVA_URL, '§3', '15 pst. av omsetning, uttak og innførsel av næringsmidler', 'Vedtatt MVA-sats for mat.')),
    rule('vat.general', { rateBp: pct(25) }, 'Merverdiavgift alminnelig sats 25 pst', prov(MVA, MVA_URL, '§2', 'Merverdiavgift beregnes med 25 pst.', 'Vedtatt generell MVA-sats.')),
    rule('vat.transportServices', { rateBp: pct(12) }, 'Merverdiavgift redusert sats 12 pst', prov(MVA, MVA_URL, '§4', 'Merverdiavgift beregnes med 12 pst.', 'Persontransport, overnatting m.m.')),
    rule(
      'vat.electricity',
      { rateBp: pct(25) },
      'Merverdiavgift på strøm 25 pst',
      prov(MVA, MVA_URL, '§2', 'Merverdiavgift beregnes med 25 pst.', 'Husholdningsstrøm modelleres med alminnelig sats; redusert el-MVA er avviklet.'),
    ),
    rule('vat.fuel', { rateBp: pct(25) }, 'Merverdiavgift drivstoff 25 pst', prov(MVA, MVA_URL, '§2', 'Merverdiavgift beregnes med 25 pst.', 'Drivstoff med alminnelig MVA.')),
    rule('vat.alcoholTobacco', { rateBp: pct(25) }, 'Merverdiavgift alkohol og tobakk 25 pst', prov(MVA, MVA_URL, '§2', 'Merverdiavgift beregnes med 25 pst.', 'Alkohol/tobakk med alminnelig MVA på forbruksprofil.')),
    rule('vat.flights', { rateBp: pct(12) }, 'Merverdiavgift flyreiser 12 pst', prov(MVA, MVA_URL, '§4', 'Merverdiavgift beregnes med 12 pst.', 'Innenlands fly med redusert MVA der det gjelder.')),
    rule(
      'excise.petrolLitre',
      { ratePerUnit: krPerUnit(7.57) },
      'Veibruks- og CO2-avgift bensin 7,57 kr/l',
      prov(VEIB, VEIB_URL, '§1 a + CO2 §1 b', 'bensin per liter: kr 3,77', 'Summert veibruksavgift 3,77 kr/l (I3S p21) og CO2-avgift bensin 3,80 kr/l.'),
    ),
    rule(
      'excise.dieselLitre',
      { ratePerUnit: krPerUnit(6.7) },
      'Veibruks- og CO2-avgift diesel 6,70 kr/l',
      prov(VEIB, VEIB_URL, '§1 b + CO2 §1 a', '(autodiesel) per liter: kr 2,28', 'Summert veibruksavgift 2,28 kr/l og CO2 mineralolje 4,42 kr/l.'),
    ),
    rule(
      'excise.kwh',
      { ratePerUnit: krPerUnit(0.0713) },
      'Elavgift 7,13 øre/kWh',
      prov(EL, EL_URL, '§1; I3S PDF p22', 'med 7,13 øre per kWh på elektrisk kraft', 'Vedtatt en sats fra 1. januar 2026 (forlik: mindre kutt enn Prop. 4,18 øre).'),
    ),
    rule(
      'excise.flightEurope',
      { ratePerUnit: krPerUnit(61) },
      'Flypassasjeravgift Europa 61 kr',
      prov(FLY, FLY_URL, '§1 a', 'sluttdestinasjon i Europa: kr 61', 'Vedtatt passasjeravgift lav sats.'),
    ),
    rule(
      'excise.flightOther',
      { ratePerUnit: krPerUnit(350) },
      'Flypassasjeravgift utenfor Europa 350 kr',
      prov(FLY, FLY_URL, '§1 b', 'andre flyginger: kr 350', 'Vedtatt passasjeravgift høy sats.'),
    ),
    rule(
      'excise.beerLitre',
      { ratePerUnit: krPerUnit(24.2) },
      'Alkoholavgift øl 3,7–4,7 vol.pst. 24,20 kr/l',
      prov(ALK, ALK_URL, '§1', '24,20 per liter', 'Sats for øl over 3,7 t.o.m. 4,7 vol.pst.'),
    ),
    rule(
      'excise.wineLitre',
      { ratePerUnit: krPerUnit(64.92) },
      'Alkoholavgift vin ca. 12 vol.pst. (64,92 kr/l)',
      prov(ALK, ALK_URL, '§1', '5,41 per volumprosent per liter', 'Vedtak: 5,41 kr/vol.pst./l. Motor bruker 12 vol.pst. som typisk tabellvin (5,41×12).'),
      { note: 'Faktisk avgift avhenger av alkoholstyrke; 12 pst er standardantagelse til SSB-profil er presisert.' },
    ),
    rule(
      'excise.spiritsLitre',
      { ratePerUnit: krPerUnit(369.2) },
      'Alkoholavgift brennevin ca. 40 vol.pst. (369,20 kr/l)',
      prov(ALK, ALK_URL, '§1', '9,23 per volumprosent per liter', 'Vedtak: 9,23 kr/vol.pst./l. Motor bruker 40 vol.pst. som typisk styrke (9,23×40).'),
      { note: 'Faktisk avgift avhenger av alkoholstyrke.' },
    ),
    rule(
      'excise.cigarette',
      { ratePerUnit: krPerUnit(3.31) },
      'Tobakksavgift sigaretter 3,31 kr/stk',
      prov(TOB, TOB_URL, '§1', 'Sigaretter 3,31 per stk.', 'Vedtatt sats per sigarett.'),
    ),
    rule(
      'excise.snusGram',
      { ratePerUnit: krPerUnit(1.02) },
      'Tobakksavgift snus 1,02 kr/gram',
      prov(TOB, TOB_URL, '§1', 'Snus 1,02 per gram av pakningens nettovekt', 'Vedtatt sats per gram.'),
    ),
    rule(
      'benefit.childBenefit',
      {
        under6PerMonth: kr(2_012),
        from6PerMonth: kr(2_012),
        ageCutoff: 6,
        extendedSingleParentPerMonth: kr(2_572),
      },
      'Barnetrygd 2 012 kr/mnd fra 1. feb. 2026',
      prov(
        NAV_BT,
        NAV_BT_URL,
        'sats tabell',
        'Ordinær barnetrygd, barn 0-18 år 2 012 kroner',
        'Én sats 0–18 år fra 1.2.2026 (forlik prisjustering). Utvidet enslig forsørger 2 572 kr/mnd (nav-utvidet-barnetrygd-2026).',
        '2026-02-01',
      ),
    ),
    rule(
      'benefit.studentSupport',
      { basicSupportPerMonth: kr(15_488), grantShareBp: pct(40) },
      'Studielån basisstøtte 15 488 kr/mnd (2026–2027)',
      prov(
        LK,
        LK_URL,
        'satser 2026–2027',
        'økes basislånet til 15 488 kroner i måneden',
        'Basislån studieåret 2026–2027; stipendandel inntil 40 pst.',
        '2026-08-01',
        'medium',
      ),
    ),
    rule(
      'employer.contribution',
      { rateBp: pct(14.1), extraRateBp: pct(0), extraThreshold: kr(850_000) },
      'Arbeidsgiveravgift sone I 14,1 pst',
      prov(FT, FT_URL, '§3', 'Sone I: 14,1 pst.', 'Standard sats sone I. Ingen ekstra arbeidsgiveravgift over terskel i 2026.'),
    ),
  ],
};
