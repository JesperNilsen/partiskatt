import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, krPerUnit, partyRule, patchWealthValuation, pct, proposedParams } from '../rule-helpers.ts';

/**
 * Encodable: wealth.valuation — aksjer og driftsmidler 60 pst. K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr.
 * L13 (2026-09-26): trygdeavgift lønn 7,7 pst. (regjeringens kutt reversert, utledet mot Prop. 1 LS); jobbfradrag og
 * pensjonsfradrag er ikke tallfestet (utforming ikke oppgitt).
 * L14 (beslutning Jesper 2026-09-26): jobbfradraget encodet som flat skattereduksjon 4 300 kr per person i arbeid, `uncertain`.
 * L10b (beslutning 2, 2026-09-25): bunnfradrag +100 000, tobakksavgift +15 pst og prisjustert barnetrygd utledet mot Prop. 1 LS.
 */
export const H_2026: PartyRuleSet = {
  ...emptyParty('h'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), wageRateBp: pct(7.7), lowerThreshold: kr(150_000) },
      'Trygdeavgift: lønn 7,7 pst. (regjeringens kutt reverseres); nedre grense 150 000 kr (frikortgrense)',
      partyProv(
        'h',
        'PDF p17',
        'Omprioritere reduksjon i trygdeavgiften',
        'Skattetabellen s. 17: «Omprioritere reduksjon i trygdeavgiften», +2 345 mill. kr. Regjeringen foreslår å redusere trygdeavgiften på lønn/trygd og næring fra 7,7 til 7,6 pst. (Prop. 1 LS tabell 1.7, PDF s. 33), med proveny −2 345 mill. kr (tabell 1.1, PDF s. 21); Høyre reverserer hele kuttet: 7,6 + 0,1 = 7,7 pst. på lønn. Pensjonssatsen (5,1 pst.) er ikke endret av regjeringen og er uendret. Frikortgrensen 150 000 kr (s. 17, «Øke frikortgrensen til 150 000 kr for alle»), beslutning 2026-09-13: frikortgrensen er i praksis nedre grense for trygdeavgift (ftrl. § 23-3), men partiet sier ikke dette eksplisitt.',
        '2026-01-01',
        'medium',
      ),
      {
        baselineParams: proposedParams('income.socialSecurity'),
        note: 'K1-frikort-trygdeavgift: nedre grense 150 000 kr encodet etter beslutning 2026-09-13; baseline-mismatch (partiene siterer 100 000 som utgangspunkt, vedtatt er 99 650). Utledet (beslutning 2): Prop. 1 LS lønn 7,6 pst + 0,1 pp (regjeringens kutt reversert, +2 345 mill. = Prop. 1 LS tabell 1.1) = 7,7 pst; pensjon 5,1 pst uendret.',
      },
    ),
    partyRule(
      'income.workTaxCredit',
      { amountPerWorker: kr(4_300) },
      'Jobbfradrag: 4 300 kr lavere skatt per person i arbeid (antatt flat)',
      partyProv(
        'h',
        'PDF p5; p17',
        '4300 kroner lavere skatt for folk i arbeid',
        'Usikkert: Partiet oppgir bare skattelettelsen og provenyet, ikke hvordan fradraget virker; det er antatt en flat skattereduksjon på 4 300 kr per person i arbeid. S. 5: «Høyre foreslår derfor et jobbfradrag, som vil gi 4300 kroner lavere skatt for folk i arbeid.» Skattetabellen s. 17: «Arbeidsfradrag (4300 kr)», −12 370 mill. kr. Kilden sier ikke hvem som regnes som i arbeid eller om fradraget trappes av.',
        '2026-01-01',
        'low',
      ),
      {
        uncertain: true,
        note: 'Usikkert (beslutning Jesper 2026-09-26): antatt flat 4 300 kr per person i arbeid; kilden sier ikke hvem som regnes som i arbeid eller om det trappes av. «I arbeid» = har lønnsinntekt over 0 (ikke bare pensjon, ikke null inntekt). Fradraget gis i personens skatt på alminnelig inntekt, trinnskatt og trygdeavgift og kan ikke gjøre skatten negativ. Partiet sier ikke om det er et fradrag i inntekten eller i skatten, eller om det er målrettet mot lave inntekter slik et arbeidsfradrag kan utformes (Prop. 1 LS kap. 4, PDF s. 89); s. 5 kaller det «første trinn i innføringen av et større fradrag». Regjeringens «Forsøk med jobbfradrag» (+500 mill., s. 17) er en annen ordning og er ikke modellert.',
      },
    ),
    partyRule(
      'wealth.netWealthTax',
      {
        ...proposedParams('wealth.netWealthTax'),
        single: { allowance: kr(2_000_000), tier2Threshold: kr(21_500_000) },
        couple: { allowance: kr(4_000_000), tier2Threshold: kr(43_000_000) },
      },
      'Bunnfradrag i formuesskatten 2 mill. kr (4 mill. kr for ektepar)',
      partyProv(
        'h',
        'PDF p17',
        'Formuesskatt. Heve bunnfradraget med 100 000 kr',
        'Skattetabellen s. 17: «Formuesskatt. Heve bunnfradraget med 100 000 kr». Regjeringen foreslår 1,9 mill. kr (Prop. 1 LS s. 36); 1 900 000 + 100 000 = 2 000 000 kr. Ektepar har dobbelt bunnfradrag, 4 mill. kr. Satsene er uendret.',
      ),
      {
        baselineParams: proposedParams('wealth.netWealthTax'),
        note: 'Utledet (beslutning 2): Prop. 1 LS 1 900 000 + 100 000 = 2 000 000 kr; ektepar 2 × = 4 000 000 kr.',
      },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ listedSharesBp: pct(60), otherBp: pct(60) }),
      'Aksjer og driftsmidler verdsettes til 60 pst.',
      partyProv(
        'h',
        'PDF p17',
        'Aksjer og driftsmidler verdsettes til 60 pst.',
        'Verdsettelsen står som prosent i skattetabellen. Primærbolig, sekundærbolig og bankinnskudd er ikke omtalt.',
      ),
      { note: 'no-baseline-quoted: partiet siterer ikke Prop. 1 LS-utgangspunkt.' },
    ),
    partyRule(
      'excise.cigarette',
      { ratePerUnit: krPerUnit(3.8065) },
      'Tobakksavgift sigaretter +15 pst. (3,8065 kr/stk)',
      partyProv(
        'h',
        'PDF p17',
        'Tobakksavgift (utenom snus) økes 15 pst.',
        'Skattetabellen s. 17: «Tobakksavgift (utenom snus) økes 15 pst.» Regjeringen foreslår 3,31 kr per sigarett (Prop. 1 LS tabell 1.8); 3,31 × 1,15 = 3,8065 kr. Snus er uendret.',
      ),
      {
        baselineParams: proposedParams('excise.cigarette'),
        note: 'Utledet (beslutning 2): Prop. 1 LS 3,31 kr/stk × 1,15 = 3,8065 kr/stk; snus uendret.',
      },
    ),
    partyRule(
      'benefit.childBenefit',
      { under6PerMonth: kr(2_012), from6PerMonth: kr(2_012), ageCutoff: 6, extendedSingleParentPerMonth: kr(2_572) },
      'Barnetrygden prisjusteres fra 1. februar (2 012 kr/mnd; utvidet 2 572 kr/mnd)',
      partyProv(
        'h',
        'PDF p24',
        'Prisjustere hele barnetrygden fra 1. februar',
        'Usikkert: Partiet oppgir ingen satser; det er antatt at prisjusteringen gir samme satser som i vedtatt budsjett. S. 24 og s. 7: «Prisjustere hele barnetrygden fra 1. februar», 609 mill. kr. Regjeringen foreslår 1 968 kr/mnd og 2 516 kr/mnd i utvidet, uten prisjustering. Samme tiltak med samme beløp (609 mill. kr) står hos Rødt, som viser +44 kr per barn i måneden: 1 968 → 2 012 kr og 2 516 → 2 572 kr, som i vedtatt budsjett. Vist som helårssats.',
        '2026-02-01',
      ),
      {
        baselineParams: proposedParams('benefit.childBenefit'),
        uncertain: true,
        note: 'Usikkert: Partiet oppgir ingen satser; det er antatt at prisjusteringen gir samme satser som i vedtatt budsjett. Utledet (beslutning 2): prisjustering 1 968 → 2 012 og 2 516 → 2 572 (faktor 2 012/1 968, som vedtatt sats og Rødts eksempel). Proveny 609 mill. = Rødts linje.',
      },
    ),
  ],
  reviewed: {
    'consumption-tax': {
      status: 'no-change',
      pageOrTable: 'PDF p17',
      note: 'Utover tobakk og bøker: ingen endring i mva-satser, drivstoff-, el-, fly- eller alkoholavgift i tabellen.',
    },
    employer: { status: 'no-change', pageOrTable: 'PDF p17', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Nytt pensjonsfradrag som gir 2 000 kr lavere skatt',
      status: 'unquantified',
      reason:
        'Partiet oppgir bare lettelsen (2 000 kr i året) og provenyet (−1 830 mill. kr), ikke hvem som får fradraget, om det gjelder all pensjon eller bare alderspensjon, eller om det trappes ned med inntekten slik dagens skattefradrag for pensjonsinntekt gjør.',
      provenance: partyProv('h', 'PDF p17', 'Nytt pensjonsfradrag (2000 kr)', 'Skattetabellen s. 17 (−1 830 mill. kr); omtale s. 5.'),
    },
    {
      category: 'direct-tax',
      title: 'Fagforeningsfradraget settes til 2021-nivå',
      status: 'unquantified',
      reason: 'Fradraget i 2021 står ikke i dokumentet eller i regjeringens forslag, og det er ikke sagt om nivået skal prisjusteres.',
      provenance: partyProv('h', 'PDF p17', 'Fagforeningsfradrag på 2021-nivå', 'Skattetabellen s. 17.'),
    },
    {
      category: 'consumption-tax',
      title: 'Mva-fritaket for bøker fjernes',
      status: 'unquantified',
      reason: 'Partiet sier ikke hvilken mva-sats bøker skal få, og kalkulatoren skiller ikke bøker ut fra annet forbruk.',
      provenance: partyProv('h', 'PDF p17', 'Mva.-fritak på bøker', 'Skattetabellen s. 17.'),
    },
  ],
};
