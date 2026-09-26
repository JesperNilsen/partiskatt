import type { Bracket, FormulaParams, PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import {
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
 * Encodable: trinnskatt trinn 4 terskel 960 000; boliggrense 10,21 mill.; matmoms 10 %;
 * bunnfradrag formuesskatt 2 mill.; flypassasjeravgift lav sats 50 kr.
 * L10b (beslutning 2, 2026-09-25): trygdeavgift lønn −0,1 pp og driftsmidler +10 pp rabatt utledet mot Prop. 1 LS.
 */
export const SP_2026: PartyRuleSet = {
  ...emptyParty('sp'),
  deltas: [
    partyRule(
      'income.bracketTax',
      patchProposedBrackets({ 4: { threshold: kr(960_000) } }),
      'Trinnskatt trinn 4: innslagspunkt 960 000 kr',
      partyProv(
        'sp',
        'PDF p8',
        '960 000',
        'Innslagspunktet for «nye trinn 4» står i skattetabellen. Satsen er ikke oppgitt, så regjeringens sats er beholdt. Sammenslåingen med trinn 5 er ikke tallfestet, se egen linje.',
      ),
      { note: 'no-baseline-quoted. Trinn 5 (sammenslått med trinn 4) står som unquantified.' },
    ),
    partyRule(
      'income.socialSecurity',
      { ...proposedParams('income.socialSecurity'), wageRateBp: pct(7.5) },
      'Trygdeavgift på lønn og trygd 7,5 pst. (0,1 prosentenhet lavere enn regjeringens forslag)',
      partyProv(
        'sp',
        'PDF p8',
        'Redusere trygdeavgiften på lønn/trygd og næring med 0,1 pst.',
        'Skattetabellen s. 8 (og vedlegget s. 80, «samanlikna med regjeringa sitt forslag»): «Redusere trygdeavgiften på lønn/trygd og næring med 0,1 pst.», −2 345 mill. kr. Regjeringen foreslår 7,6 pst. på lønn/trygd (Prop. 1 LS s. 80), og samme tiltak der har samme proveny (−2 345 mill. kr, s. 21), så endringen er 0,1 prosentenhet: 7,6 − 0,1 = 7,5 pst. Pensjonssatsen (5,1 pst.) er ikke nevnt og er uendret.',
      ),
      {
        baselineParams: proposedParams('income.socialSecurity'),
        note: 'Utledet (beslutning 2): Prop. 1 LS lønn 7,6 pst − 0,1 pp = 7,5 pst; pensjon 5,1 pst og nedre grense 99 650 kr uendret.',
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
        'sp',
        'PDF p8',
        'Øke bunnfradraget i formuesskatten til 2 mill. kroner',
        'Skattetabellen s. 8: bunnfradraget økes til 2 mill. kr. Ektepar har dobbelt bunnfradrag etter skattereglene (regjeringens forslag: 1,9 / 3,8 mill. kr, Prop. 1 LS s. 36), så ektepar får 4 mill. kr. Satsene er uendret.',
      ),
      { baselineParams: proposedParams('wealth.netWealthTax'), note: 'Ektepar = 2 × enslig, som i Prop. 1 LS (1,9 / 3,8 mill.).' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ primaryHomeHighValueThreshold: kr(10_210_000), otherBp: pct(60) }),
      'Verdsettelsesgrense boliger 10,21 mill. kr; driftsmidler verdsettes til 60 pst.',
      partyProv(
        'sp',
        'PDF p8',
        'Øke rabatten for driftsmidler i formueskatten med 10 prosentpoeng',
        'Skattetabellen s. 8: boliggrensen prisjusteres fra 10 til 10,21 mill. kr, og rabatten for driftsmidler økes med 10 prosentpoeng. Regjeringen foreslår at driftsmidler verdsettes til 70 pst. (30 pst. rabatt; Prop. 1 LS s. 36); 40 pst. rabatt gir 60 pst.',
      ),
      {
        baselineParams: proposedParams('wealth.valuation'),
        note: 'Boliggrense 10,21 mill. er partiets tall; driftsmidler utledet (beslutning 2): 100 − (30 + 10) = 60 pst.',
      },
    ),
    partyRule(
      'vat.food',
      { rateBp: pct(10) },
      'Merverdiavgift næringsmidler 10 pst. fra 1. september 2026',
      partyProv(
        'sp',
        'PDF p8',
        '10 prosent fra 1. september',
        'Skattetabellen s. 8: matmomsen reduseres til 10 pst. fra 1. september. Vist som helårssats.',
        '2026-09-01',
      ),
      { note: 'no-baseline-quoted; effective-date-differs.' },
    ),
    partyRule(
      'excise.flightEurope',
      { ratePerUnit: krPerUnit(50) },
      'Flypassasjeravgift lav sats 50 kr',
      partyProv(
        'sp',
        'PDF p8',
        'den lave satsen i flypassasjeravgiften fra 61 til 50 kroner',
        'Skattetabellen s. 8: lav sats fra 61 til 50 kr. 61 kr er regjeringens forslag (Prop. 1 LS tabell 1.8, s. 43). Høy sats er ikke nevnt.',
      ),
      { baselineParams: proposedParams('excise.flightEurope'), note: 'Partiets utgangspunkt 61 kr = Prop. 1 LS.' },
    ),
  ],
  reviewed: {
    employer: { status: 'no-change', pageOrTable: 'PDF p8', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Trinnskatt: trinn 4 og 5 slås sammen',
      status: 'unquantified',
      reason:
        'Partiet oppgir ikke satsen for det sammenslåtte trinnet. Bare det nye innslagspunktet (960 000 kr) er regnet inn; trinn 5 står som i regjeringens forslag.',
      provenance: partyProv('sp', 'PDF p8', 'Slå sammen trinn 4 og 5 i trinnskatten', 'Skattetabellen s. 8.'),
    },
    {
      category: 'consumption-tax',
      title: 'Veibruksavgift bensin og diesel: reelt uendret, deretter 25 øre/l lavere',
      status: 'unquantified',
      reason:
        'Partiet oppgir ingen sats. «Reelt uendret» krever en prisjusteringsfaktor som dokumentet ikke oppgir, og partiets egne provenytall passer ikke med én felles faktor.',
      provenance: partyProv(
        'sp',
        'PDF p8',
        'Redusere vegbruksavgiften på bensin slik at avgiftene blir reelt uendret',
        'Skattetabellen s. 8; vedlegget s. 80.',
      ),
    },
    {
      category: 'benefit',
      title: 'Dobbel barnetrygd for tredje barn fra 1. oktober',
      status: 'unquantified',
      reason: 'Kalkulatoren har samme barnetrygd for hvert barn og skiller ikke på hvilket barn i rekken det er.',
      provenance: partyProv('sp', 'PDF p23', 'Innføre dobbel barnetrygd for tredje barn frå 1. oktober', 'Tabell s. 23; vedlegget s. 57.', '2026-10-01'),
    },
    {
      category: 'benefit',
      title: 'Studiestøtte: 40 pst. omgjøring for folkehøgskoleelever og høyere barnestipend',
      status: 'unquantified',
      reason:
        'Kalkulatoren regner med vanlig basisstøtte for en heltidsstudent. Folkehøgskoleelever og stipend til studenter med barn er ikke med.',
      provenance: partyProv(
        'sp',
        'PDF p47',
        'Sikre 40 prosent omgjering av lån til studentar ved folkehøgskular',
        'Tabell s. 47.',
      ),
    },
  ],
};
