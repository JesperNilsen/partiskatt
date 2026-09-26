import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import {
  adoptedParams,
  emptyParty,
  kr,
  krPerUnit,
  partyRule,
  patchBracketTax,
  patchWealthValuation,
  pct,
  proposedParams,
} from '../rule-helpers.ts';

/**
 * Encodable: trinnskatt sats trinn 3–5, personfradrag 143 000, minstefradrag 55 %, formuesskatt og
 * veibruksavgift fra skattetabellen s. 37. K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr.
 * L10b (beslutning 2, 2026-09-25): verdsettelse, flypassasjeravgift +20 % og barnetrygd utledet mot Prop. 1 LS.
 */
export const SV_2026: PartyRuleSet = {
  ...emptyParty('sv'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), lowerThreshold: kr(150_000) },
      'Trygdeavgift: nedre grense 150 000 kr (frikortgrense)',
      partyProv(
        'sv',
        'PDF p37',
        '150 000',
        'Beslutning 2026-09-13: frikortgrensen er i praksis nedre grense for trygdeavgift (ftrl. § 23-3), men partiet sier ikke dette eksplisitt. Nedre grense satt til 150 000 kr; satsene er uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift: encodet etter beslutning 2026-09-13; baseline-mismatch (partiene siterer 100 000 som utgangspunkt, vedtatt er 99 650).' },
    ),
    partyRule(
      'income.bracketTax',
      patchBracketTax({
        3: { rateBp: pct(16.2) },
        4: { rateBp: pct(19.2) },
        5: { rateBp: pct(27) },
      }),
      'Trinnskatt: trinn 3–5 heves til 16,2 / 19,2 / 27 pst.',
      partyProv('sv', 'PDF p37', '16,2', 'Satsene for trinn 3–5 står i skattetabellen; innslagspunktene er ikke nevnt og er uendret.'),
      { note: 'no-baseline-quoted på alle trinn.' },
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(143_000) },
      'Personfradrag 143 000 kr',
      partyProv('sv', 'PDF p37', '143 000', 'Personfradraget står som kronebeløp i skattetabellen.'),
      { note: 'no-baseline-quoted.' },
    ),
    partyRule(
      'income.minimumDeductionWage',
      { ...adoptedParams('income.minimumDeductionWage'), rateBp: pct(55) },
      'Minstefradrag i lønn 55 pst.',
      partyProv('sv', 'PDF p37', '55', 'Satsen 55 pst. står i skattetabellen; øvre grense er ikke oppgitt, så regjeringens grense er beholdt.'),
      { note: 'no-baseline-quoted; øvre grense NOT FOUND.' },
    ),
    partyRule(
      'income.minimumDeductionPension',
      { ...adoptedParams('income.minimumDeductionPension'), rateBp: pct(55) },
      'Minstefradrag i pensjon 55 pst.',
      partyProv('sv', 'PDF p37', '55', 'Satsen 55 pst. står i skattetabellen; øvre grense er ikke oppgitt, så regjeringens grense er beholdt.'),
      { note: 'no-baseline-quoted; øvre grense NOT FOUND.' },
    ),
    partyRule(
      'wealth.netWealthTax',
      {
        single: { allowance: kr(2_000_000), tier2Threshold: kr(20_000_000) },
        couple: { allowance: kr(4_000_000), tier2Threshold: kr(40_000_000) },
        tier1RateBp: pct(1.1),
        tier2RateBp: pct(1.4),
      },
      'Formuesskatt: bunnfradrag 2 mill. kr, 1,1 pst.; 1,4 pst. over 20 mill. kr',
      partyProv(
        'sv',
        'PDF p37',
        'Øke satsen i trinn 1 til 1,1 prosent',
        'Skattetabellen s. 37: «Øke bunnfradraget til 2 millioner», «Øke satsen i trinn 1 til 1,1 prosent» og «Sette innslagspunktet i trinn 2 til 20 millioner, og øke satsen til 1,4 prosent». Ektepar har dobbelt bunnfradrag og trinngrense, som i regjeringens forslag. Nytt trinn 3 (1,7 pst. over 100 mill. kr) er ikke med, se egen linje.',
      ),
      { baselineParams: proposedParams('wealth.netWealthTax'), note: 'Partiets tall; ektepar = 2 × enslig som i Prop. 1 LS.' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({
        primaryHomeHighValueThreshold: kr(10_000_000),
        primaryHomeHighValueBp: pct(100),
        listedSharesBp: pct(100),
        otherBp: pct(100),
      }),
      'Verdsettelsesrabatter fjernes for aksjer, driftsmidler og primærbolig over 10 mill. kr',
      partyProv(
        'sv',
        'PDF p37',
        'Fjerne aksjerabatten (inkludert næringseiendom)',
        'Skattetabellen s. 37: «Fjerne aksjerabatten (inkludert næringseiendom)», «Fjerne rabatten for driftsmidler» og «Fjerne verdsettelsesrabatten for primærbolig med høy verdi» (over 10 mill. kr). Uten rabatt verdsettes formuen til 100 pst. (regjeringens forslag: 80, 70 og 70 pst., Prop. 1 LS s. 36).',
      ),
      {
        baselineParams: proposedParams('wealth.valuation'),
        note: 'Utledet (beslutning 2): rabatt fjernet ⇒ 100 pst. for aksjer (80), driftsmidler (70) og primærbolig over 10 mill. (70).',
      },
    ),
    partyRule(
      'excise.petrolLitre',
      { ratePerUnit: krPerUnit(8.3) },
      'Veibruks- og CO2-avgift bensin 8,30 kr/l (veibruksavgift 4,50 kr/l)',
      partyProv(
        'sv',
        'PDF p37',
        'Øke veibruksavgiften på bensin med 0,25 til 4,50 kr/L',
        'Skattetabellen s. 37: veibruksavgiften på bensin økes med 0,25 til 4,50 kr/l (regjeringens forslag 4,25 kr/l, Prop. 1 LS tabell 1.8). CO2-avgiften er regjeringens 3,80 kr/l; 4,50 + 3,80 = 8,30 kr/l. Den økte CO2-avgiften er ikke tallfestet, se egen linje.',
      ),
      { baselineParams: proposedParams('excise.petrolLitre'), note: 'Partiets 4,50 kr/l + Prop. 1 LS CO2 3,80 kr/l = 8,30 kr/l.' },
    ),
    partyRule(
      'excise.dieselLitre',
      { ratePerUnit: krPerUnit(7.67) },
      'Veibruks- og CO2-avgift diesel 7,67 kr/l (veibruksavgift 3,25 kr/l)',
      partyProv(
        'sv',
        'PDF p37',
        'Øke veibruksavgiften på diesel (mineralolje) med 0,25 til 3,25 kr/L',
        'Skattetabellen s. 37: veibruksavgiften på diesel økes med 0,25 til 3,25 kr/l (regjeringens forslag 3,00 kr/l, Prop. 1 LS tabell 1.8). CO2-avgiften er regjeringens 4,42 kr/l; 3,25 + 4,42 = 7,67 kr/l. Den økte CO2-avgiften er ikke tallfestet, se egen linje.',
      ),
      { baselineParams: proposedParams('excise.dieselLitre'), note: 'Partiets 3,25 kr/l + Prop. 1 LS CO2 4,42 kr/l = 7,67 kr/l.' },
    ),
    partyRule(
      'excise.flightEurope',
      { ratePerUnit: krPerUnit(73.2) },
      'Flypassasjeravgift Europa +20 pst. (73,20 kr)',
      partyProv(
        'sv',
        'PDF p37',
        'Øke flypassasjeravgiften i Europa med 20%',
        'Skattetabellen s. 37: «Øke flypassasjeravgiften i Europa med 20%». Regjeringen foreslår 61 kr (Prop. 1 LS tabell 1.8, s. 43); 61 × 1,2 = 73,20 kr.',
      ),
      { baselineParams: proposedParams('excise.flightEurope'), note: 'Utledet (beslutning 2): Prop. 1 LS 61 kr × 1,2 = 73,20 kr.' },
    ),
    partyRule(
      'excise.flightOther',
      { ratePerUnit: krPerUnit(420) },
      'Flypassasjeravgift utenfor Europa +20 pst. (420 kr)',
      partyProv(
        'sv',
        'PDF p37',
        'Øke flypassasjeravgiften utenfor Europa med 20 %',
        'Skattetabellen s. 37: «Øke flypassasjeravgiften utenfor Europa med 20 %». Regjeringen foreslår 350 kr (Prop. 1 LS tabell 1.8, s. 43); 350 × 1,2 = 420 kr.',
      ),
      { baselineParams: proposedParams('excise.flightOther'), note: 'Utledet (beslutning 2): Prop. 1 LS 350 kr × 1,2 = 420 kr.' },
    ),
    partyRule(
      'benefit.childBenefit',
      { under6PerMonth: kr(2_112), from6PerMonth: kr(2_112), ageCutoff: 6, extendedSingleParentPerMonth: kr(2_572) },
      'Barnetrygden økes med 144 kr/mnd fra 1. mai (2 112 kr/mnd); utvidet prisjusteres til 2 572 kr/mnd',
      partyProv(
        'sv',
        'PDF p25',
        'Øke barnetrygden med 100 kr i måneden fra 1. mai',
        'S. 25: «Øke barnetrygden med 100 kr i måneden fra 1. mai» (872 mill. kr) og «Prisjustere barnetrygden fra 1. mai» (443 mill. kr); s. 10: til sammen 144 kr i måneden. Regjeringen foreslår 1 968 kr/mnd uten prisjustering. 1 968 + 144 = 2 112 kr/mnd. Prisjusteringen er samme tiltak som hos Høyre og Rødt (609 mill. kr fra 1. februar = 443 mill. kr for 8 måneder) og gir utvidet 2 516 → 2 572 kr; de 100 kronene gjelder per barn. Vist som helårssats.',
        '2026-05-01',
      ),
      {
        baselineParams: proposedParams('benefit.childBenefit'),
        note: 'Utledet (beslutning 2): 1 968 + 44 (prisjustering) + 100 = 2 112 kr/mnd; utvidet 2 516 → 2 572 (prisjustering). Kontroll: 609 × 8/11 = 443 mill.',
      },
    ),
    partyRule(
      'benefit.studentSupport',
      { ...proposedParams('benefit.studentSupport'), basicSupportPerMonth: kr(16_686) },
      'Studiestøtte: basisstøtte 16 686 kr/mnd i studieåret 2026–2027',
      partyProv(
        'sv',
        'PDF p12',
        'som student i snitt få utbetalt 16.686',
        'S. 12: studiestøtten økes med ti prosent, og «I 2026-2027 vil man derfor som student i snitt få utbetalt 16.686 kroner i basislån i måneden». Kronebeløpet brukes direkte. Partiet regner økningen (1 517 kr) fra studieåret 2025–2026 (15 169 kr), ikke fra regjeringens forslag (15 488 kr). Stipendandelen er uendret. Vist som helårssats.',
        '2026-08-01',
        'medium',
      ),
      { note: 'baseline-not-proposed: 16 686 − 1 517 = 15 169 (2025–2026), mens Prop. 1 LS-grunnlaget er 15 488. Absolutt beløp brukt. Tabellen s. 34 har to ulike beløp for tiltaket (296 og 1 020 mill.).' },
    ),
  ],
  reviewed: {
    'consumption-tax': {
      status: 'no-change',
      pageOrTable: 'PDF p37',
      note: 'Ingen endring i mva-satsene for mat, strøm, drivstoff, alkohol, tobakk eller fly; ingen alkohol- eller tobakksavgift i dokumentet.',
    },
    employer: { status: 'no-change', pageOrTable: 'PDF p37', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'wealth-tax',
      title: 'Formuesskatt: nytt trinn 3 med 1,7 pst. over 100 mill. kr',
      status: 'unquantified',
      reason: 'Kalkulatoren har bare to trinn i formuesskatten. Trinn 3 gjelder bare formuer over 100 mill. kr.',
      provenance: partyProv('sv', 'PDF p37', 'Innføre et tredje trinn i formuesskatten på 1,7 prosent', 'Skattetabellen s. 37.'),
    },
    {
      category: 'direct-tax',
      title: 'Skatt på fordelen av å eie egen bolig (bunnfradrag 10 mill. kr, 1,7 pst.)',
      status: 'unquantified',
      reason: 'Kalkulatoren har ingen skatt på boligfordel, og partiet beskriver ikke hvordan fordelen skal beregnes.',
      provenance: partyProv('sv', 'PDF p37', 'Gjeninnføre skatt på fordelen av å eie egen bolig.', 'Skattetabellen s. 37.'),
    },
    {
      category: 'consumption-tax',
      title: 'CO2-avgiften trappes raskere opp',
      status: 'unquantified',
      reason: 'Partiet oppgir ingen ny sats, verken per tonn eller per liter drivstoff.',
      provenance: partyProv('sv', 'PDF p37', 'Øke opptrappingen av CO2-avgiften', 'Skattetabellen s. 37.'),
    },
    {
      category: 'benefit',
      title: 'Stipendandel 40 pst. for folkehøgskoleelever',
      status: 'unquantified',
      reason: 'Kalkulatoren regner med vanlig basisstøtte for en heltidsstudent og skiller ikke ut folkehøgskoleelever.',
      provenance: partyProv('sv', 'PDF p34', 'Reversere kutt i stipendandel for folkehøgskoleelver', 'Tabell s. 34; omtalt s. 12.'),
    },
  ],
};
