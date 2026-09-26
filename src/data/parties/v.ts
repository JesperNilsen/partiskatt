import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, krPerUnit, partyRule, patchWealthValuation, pct, proposedParams } from '../rule-helpers.ts';

/**
 * Encodable: trygdeavgift nedre grense 150 000; personfradrag 125 757; aksjer 70 %; elavgift 6 øre/kWh.
 * L10b (beslutning 2, 2026-09-25): formuesskatt trinn 1 −0,1 pp og tobakksavgift sigaretter +5 pst utledet mot Prop. 1 LS.
 */
export const V_2026: PartyRuleSet = {
  ...emptyParty('v'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), lowerThreshold: kr(150_000) },
      'Trygdeavgift: nedre grense 150 000 kr',
      partyProv(
        'v',
        'PDF p32–33; p119',
        'Øke frikortgrensen til 150.000 kroner',
        'Venstre knytter frikortgrensen til grensen for å betale trygdeavgift (omtale s. 32). Tabellen s. 119: «Øke frikortgrensen til 150.000 kroner». Satsene er uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift; baseline-mismatch (partiet siterer 100 000 som utgangspunkt).' },
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(125_757) },
      'Personfradrag 125 757 kr',
      partyProv('v', 'PDF p117', '125 757', 'Personfradraget står som kronebeløp i budsjettvedlegget.'),
      { note: 'no-baseline-quoted.' },
    ),
    partyRule(
      'wealth.netWealthTax',
      { ...proposedParams('wealth.netWealthTax'), tier1RateBp: pct(0.9) },
      'Formuesskatt trinn 1: 0,9 pst. (0,1 prosentenhet lavere enn regjeringens forslag)',
      partyProv(
        'v',
        'PDF p119',
        'formuer under 21,5 mill. kroner reduseres med 0,1 pst-poeng.',
        'Tabellen s. 119 (endringer mot regjeringens forslag): «Satsen i formuesskatten for formuer under 21,5 mill. kroner reduseres med 0,1 pst-poeng»; s. 80 sier det er den statlige satsen i trinn 1. Regjeringen foreslår 1,0 pst. samlet i trinn 1 (0,65 stat + 0,35 kommune, Prop. 1 LS s. 36); 1,0 − 0,1 = 0,9 pst. Trinn 2 og bunnfradraget er uendret.',
      ),
      {
        baselineParams: proposedParams('wealth.netWealthTax'),
        note: 'Utledet (beslutning 2): Prop. 1 LS trinn 1 1,0 pst − 0,1 pp = 0,9 pst; trinn 2 1,1 pst uendret.',
      },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ listedSharesBp: pct(70) }),
      'Aksjer («arbeidende kapital») verdsettes til 70 pst.',
      partyProv(
        'v',
        'PDF p119',
        'arbeidende kapital',
        'Tabellen s. 119: redusert formuesskatt på «arbeidende kapital», verdsettelse 70 pst. for aksjer.',
      ),
    ),
    partyRule(
      'excise.kwh',
      { ratePerUnit: krPerUnit(0.06) },
      'Elavgift 6 øre/kWh hele året',
      partyProv(
        'v',
        'PDF p122',
        'året til 6 øre kWh',
        'Tabellen s. 122 setter elavgiften til 6 øre/kWh hele året. Partiet måler endringen mot dagens sats, ikke mot regjeringens forslag (4,18 øre), men 6 øre er et fast kronebeløp og brukes direkte.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K3-venstre-elavgift-baseline: baseline-not-proposed + baseline-mismatch.' },
    ),
    partyRule(
      'excise.cigarette',
      { ratePerUnit: krPerUnit(3.4755) },
      'Tobakksavgift sigaretter +5 pst. (3,4755 kr/stk)',
      partyProv(
        'v',
        'PDF p123',
        'Økes med 5 pst. Gjelder ikke snus.',
        'Tabellen s. 123 (endringer mot regjeringens forslag): «Økt tobakksavgift … Økes med 5 pst. Gjelder ikke snus.» Regjeringen foreslår 3,31 kr per sigarett (Prop. 1 LS tabell 1.8); 3,31 × 1,05 = 3,4755 kr. Snus er uendret.',
      ),
      {
        baselineParams: proposedParams('excise.cigarette'),
        note: 'Utledet (beslutning 2): Prop. 1 LS 3,31 kr/stk × 1,05 = 3,4755 kr/stk; snus uendret.',
      },
    ),
  ],
  reviewed: {
    employer: { status: 'no-change', pageOrTable: 'PDF p119', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'consumption-tax',
      title: 'Mva på strøm i Nord-Norge: fritaket avvikles',
      status: 'unquantified',
      reason:
        'Kalkulatoren bruker allerede 25 pst. mva på strøm for alle husholdninger og har ikke med fritaket i Nord-Norge.',
      provenance: partyProv('v', 'PDF p120', 'Avvikle fritaket for mva', 'Tabellen s. 120; omtalt s. 81.'),
    },
    {
      category: 'consumption-tax',
      title: 'Mva: fritak for frukt og grønt, full sats på kjøtt',
      status: 'unquantified',
      reason: 'Kalkulatoren har én mva-sats for all mat og kan ikke skille ut frukt, grønt og kjøtt.',
      provenance: partyProv('v', 'PDF p120', 'Full mva på kjøtt', 'Tabellen s. 120; omtalt s. 81.'),
    },
    {
      category: 'consumption-tax',
      title: 'CO2-avgift 1 842 kr/tonn og reversering av lettelser i veibruksavgiften',
      status: 'unquantified',
      reason:
        'Dokumentet oppgir CO2-avgiften per tonn og veibruksavgiften som en reversering av tidligere lettelser, men ingen sats per liter bensin eller diesel.',
      provenance: partyProv('v', 'PDF p122', 'Avgiftsnivået i 2026 = 1 842 per', 'Tabellen s. 122.'),
    },
    {
      category: 'consumption-tax',
      title: 'Flypassasjeravgiften videreføres på 2024-nivå',
      status: 'unquantified',
      reason: 'Satsene for 2024 står ikke i dokumentet eller i regjeringens forslag, og det er ikke sagt om nivået er nominelt eller prisjustert.',
      provenance: partyProv('v', 'PDF p123', 'avgiften på 2024-nivå', 'Tabellen s. 123.'),
    },
    {
      category: 'benefit',
      title: 'Barnetrygden økes til 37 786 kr i året og blir skattepliktig',
      status: 'unquantified',
      reason:
        'Barnetrygden skal skattlegges, og kalkulatoren kan ikke skattlegge barnetrygd. Dokumentet gir dessuten to ulike tall for økningen (s. 46).',
      provenance: partyProv('v', 'PDF p46', 'Øke og skattlegge barnetrygden', 'Omtale og tabell s. 46; vedlegget s. 87.'),
    },
    {
      category: 'benefit',
      title: 'Studiestøtten økes til 1,4 G',
      status: 'unquantified',
      reason:
        'Dokumentet oppgir ikke grunnbeløpet (G) eller antall måneder, og økningen på 15 365 kr er regnet fra studieåret 2025–2026, ikke fra regjeringens forslag.',
      provenance: partyProv('v', 'PDF p33', 'Økt studiestøtte til 1,4G', 'Tabell 11 s. 33.'),
    },
  ],
};
