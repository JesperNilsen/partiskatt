import type { Bracket, FormulaParams, PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import {
  adoptedParams,
  emptyParty,
  kr,
  krPerUnit,
  partyRule,
  patchWealthValuation,
  pct,
  proposedParams,
} from '../rule-helpers.ts';


type Trinn = 1 | 2 | 3 | 4 | 5;
/** Prop. 1 LS brackets (the baseline the party wrote against) with individual trinn patched. */
function patchProposedBrackets(patches: Partial<Record<Trinn, Partial<Bracket>>>): FormulaParams['income.bracketTax'] {
  const { brackets } = proposedParams('income.bracketTax');
  return { brackets: brackets.map((b, i) => ({ ...b, ...patches[(i + 1) as Trinn] })) };
}

/**
 * Encodable: personfradrag 127 850; sekundærbolig 80 %; formuesskatt 0,8 % over 3/6 mill.
 * K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr.
 * L10b (beslutning 2, 2026-09-25): relative forslag utledet mot Prop. 1 LS — trinnskatt trinn 1–2,
 * fagforeningsfradrag, matmoms, veibruks- og CO2-avgift bensin/diesel.
 */
export const FRP_2026: PartyRuleSet = {
  ...emptyParty('frp'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), lowerThreshold: kr(150_000) },
      'Trygdeavgift: nedre grense 150 000 kr (frikortgrense)',
      partyProv(
        'frp',
        'PDF p8',
        '150 000',
        'Beslutning 2026-09-13: frikortgrensen er i praksis nedre grense for trygdeavgift (ftrl. § 23-3), men partiet sier ikke dette eksplisitt. Nedre grense satt til 150 000 kr; satsene er uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift: encodet etter beslutning 2026-09-13; baseline-mismatch (partiene siterer 100 000 som utgangspunkt, vedtatt er 99 650).' },
    ),
    partyRule(
      'income.bracketTax',
      patchProposedBrackets({ 1: { rateBp: pct(0) }, 2: { rateBp: pct(3.5) } }),
      'Trinnskatt: trinn 1 fjernes, trinn 2 senkes til 3,5 pst.',
      partyProv(
        'frp',
        'PDF p46',
        'Redusere trinnskatten i 2. trinn med 0,5 prosentpoeng.',
        'Skattetabellen s. 46: «Fjerne trinnskatt trinn 1» og «Redusere trinnskatten i 2. trinn med 0,5 prosentpoeng.» Partiet oppgir ingen satser, så de er regnet ut fra regjeringens forslag (Prop. 1 LS tabell 1.7, s. 33): trinn 1 1,7 pst. → 0 pst.; trinn 2 4,0 − 0,5 = 3,5 pst. Innslagspunktene er uendret.',
      ),
      {
        baselineParams: proposedParams('income.bracketTax'),
        note: 'Utledet (beslutning 2): trinn 1 sats 0; trinn 2 = Prop. 1 LS 4,0 pst − 0,5 pp = 3,5 pst.',
      },
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(127_850) },
      'Personfradrag 127 850 kr',
      partyProv('frp', 'PDF p46', '127 850', 'Personfradraget står som kronebeløp i skattetabellen.'),
      { note: 'no-baseline-quoted.' },
    ),
    partyRule(
      'income.unionFeeDeduction',
      { max: kr(0) },
      'Fagforeningsfradraget fjernes',
      partyProv(
        'frp',
        'PDF p46',
        'Fjerne fagforeningsfradraget',
        'Skattetabellen s. 46: «Fjerne fagforeningsfradraget». Regjeringens forslag er et fradrag på inntil 8 700 kr (Prop. 1 LS tabell 1.7, s. 36); uten fradrag blir maksimum 0 kr.',
      ),
      {
        baselineParams: proposedParams('income.unionFeeDeduction'),
        note: 'Utledet (beslutning 2): Prop. 1 LS maks 8 700 kr → 0 kr.',
      },
    ),
    partyRule(
      'wealth.netWealthTax',
      {
        single: { allowance: kr(3_000_000), tier2Threshold: kr(21_500_000) },
        couple: { allowance: kr(6_000_000), tier2Threshold: kr(43_000_000) },
        tier1RateBp: pct(0.8),
        tier2RateBp: pct(0.8),
      },
      'Formuesskatt 0,8 pst. over 3 mill. kr (6 mill. kr for ektepar)',
      partyProv(
        'frp',
        'PDF p13; p46',
        '6 millioner for ektepar',
        'S. 13: «senke satsen til 0,8 prosent og heve innslagspunktet fra 1,9 til 3 millioner kroner (6 millioner for ektepar)»; s. 46: «Redusere formuesskatten til 0,8%». Partiet nevner én sats og ikke trinn 2, så 0,8 pst. er brukt for all formue over bunnfradraget (samlet sats for stat og kommune).',
        '2026-01-01',
        'medium',
      ),
      { note: 'Antagelse: én sats 0,8 pst. også over trinn 2-grensen (partiet nevner ikke trinn 2). Utgangspunktet 1,9 mill. = Prop. 1 LS.' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ secondaryHomeBp: pct(80) }),
      'Sekundærbolig verdsettes til 80 pst.',
      partyProv(
        'frp',
        'PDF p11; p46',
        'verdsettelsen av sekundærboliger',
        'Sekundærbolig verdsettes til 80 pst. av markedsverdi. Forslaget om primærbolig (reversere ny boligmodell) er ikke tallfestet, se egen linje.',
        '2026-01-01',
        'medium',
      ),
      { note: 'baseline-mismatch flagg i reconciler; primærbolig ikke encodet.' },
    ),
    partyRule(
      'vat.food',
      { rateBp: pct(7.5) },
      'Merverdiavgift på mat halveres til 7,5 pst. fra 1. april',
      partyProv(
        'frp',
        'PDF p46',
        'Merverdiavgift mat, halveres 1. april',
        'Skattetabellen s. 46: «Merverdiavgift mat, halveres 1. april». Regjeringens forslag viderefører 15 pst. for næringsmidler (Prop. 1 LS s. 197; mva-vedtaket § 3); halvert gir 7,5 pst. Vist som helårssats.',
        '2026-04-01',
      ),
      {
        baselineParams: proposedParams('vat.food'),
        note: 'Utledet (beslutning 2): 15 pst ÷ 2 = 7,5 pst; virkning fra 1. april (beslutning 1: helårssats).',
      },
    ),
    partyRule(
      'excise.petrolLitre',
      { ratePerUnit: krPerUnit(5.375) },
      'Veibruks- og CO2-avgift bensin 5,375 kr/l (veibruksavgift halvert, CO2-avgift som i 2025)',
      partyProv(
        'frp',
        'PDF p46',
        'Veibruksavgift på drivstoff, avgiften halveres',
        'S. 46: «Veibruksavgift på drivstoff, avgiften halveres» og «Reversere økning CO2-avg mineralske prod». Prop. 1 LS tabell 1.8 (s. 40–41): veibruksavgift bensin 4,25 kr/l, CO2-avgift bensin 3,25 kr/l i 2025 og 3,80 kr/l foreslått. 4,25 ÷ 2 + 3,25 = 5,375 kr/l.',
      ),
      {
        baselineParams: proposedParams('excise.petrolLitre'),
        note: 'Utledet (beslutning 2): 4,25/2 + 3,25 = 5,375 kr/l (mot Prop. 1 LS 8,05). Kontroll s. 10: «om lag 3 kroner per liter inkl. mva.»; (8,05 − 5,375) × 1,25 = 3,34.',
      },
    ),
    partyRule(
      'excise.dieselLitre',
      { ratePerUnit: krPerUnit(5.29) },
      'Veibruks- og CO2-avgift diesel 5,29 kr/l (veibruksavgift halvert, CO2-avgift som i 2025)',
      partyProv(
        'frp',
        'PDF p46',
        'Veibruksavgift på drivstoff, avgiften halveres',
        'S. 46: «Veibruksavgift på drivstoff, avgiften halveres» (autodiesel) og «Reversere økning CO2-avg mineralske prod». Prop. 1 LS tabell 1.8 (s. 40–41): veibruksavgift mineralolje 3,00 kr/l, CO2-avgift mineralolje 3,79 kr/l i 2025 og 4,42 kr/l foreslått. 3,00 ÷ 2 + 3,79 = 5,29 kr/l.',
      ),
      {
        baselineParams: proposedParams('excise.dieselLitre'),
        note: 'Utledet (beslutning 2): 3,00/2 + 3,79 = 5,29 kr/l (mot Prop. 1 LS 7,42). Kontroll s. 10: «om lag 2,50 per liter inkl. mva.»; (7,42 − 5,29) × 1,25 = 2,66.',
      },
    ),
  ],
  reviewed: {
    'consumption-tax': {
      status: 'no-change',
      pageOrTable: 'PDF p46',
      note: 'Utover matmoms og drivstoff: ingen endring i andre mva-satser, elavgift, flypassasjeravgift eller alkohol- og tobakksavgift i tabellen.',
    },
    employer: { status: 'no-change', pageOrTable: 'PDF p46', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'wealth-tax',
      title: 'Reversere regjeringens nye modell for verdsetting av bolig',
      status: 'unquantified',
      reason:
        'Forslaget endrer hvordan markedsverdien av boligen beregnes, ikke verdsettelsesprosenten. Kalkulatoren tar markedsverdien som oppgitt, så forslaget kan ikke regnes inn.',
      provenance: partyProv('frp', 'PDF p46', 'Reversere skjerpelse i boligbeskatning (ny modell)', 'Skattetabellen s. 46; omtalt s. 11.'),
    },
    {
      category: 'benefit',
      title: 'Studiestøtten knyttes til 1,5 G over fire år',
      status: 'unquantified',
      reason:
        'Partiet sier ikke hvor stort første steg er i 2026, bare at studiestøtten skal nå 1,5 G i løpet av fire år.',
      provenance: partyProv('frp', 'PDF p23', 'studiestøtten til 1,5 G over fire år', 'Omtale s. 23.'),
    },
    {
      category: 'benefit',
      title: 'Strømstønad: makspris 50 øre/kWh inkl. mva. for husholdninger',
      status: 'unquantified',
      reason:
        'Kalkulatoren regner ikke med strømpris eller strømstøtte, så en makspris kan ikke regnes inn.',
      provenance: partyProv(
        'frp',
        'PDF p46',
        'Strømstønad til husholdninger og borettslag 50 øre ink. mva.',
        'Skattetabellen s. 46; omtalt s. 10.',
      ),
    },
  ],
};
