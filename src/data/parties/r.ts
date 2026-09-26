import type { Bracket, FormulaParams, PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import {
  adoptedParams,
  emptyParty,
  kr,
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
 * Encodable: trinnskatt (trinn 1 fjernes, trinn 2/4/5), personfradrag 121 810, formuesskatt og
 * verdsettelse fra Tabell 3. K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr.
 * L10b (beslutning 2, 2026-09-25): barnetrygd og studiestøtte utledet mot Prop. 1 LS.
 */
export const R_2026: PartyRuleSet = {
  ...emptyParty('r'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), lowerThreshold: kr(150_000) },
      'Trygdeavgift: nedre grense 150 000 kr (frikortgrense)',
      partyProv(
        'r',
        'PDF p31',
        '150 000',
        'Beslutning 2026-09-13: frikortgrensen er i praksis nedre grense for trygdeavgift (ftrl. § 23-3), men partiet sier ikke dette eksplisitt. Nedre grense satt til 150 000 kr; satsene er uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift: encodet etter beslutning 2026-09-13; baseline-mismatch (partiene siterer 100 000 som utgangspunkt, vedtatt er 99 650).' },
    ),
    partyRule(
      'income.bracketTax',
      patchProposedBrackets({
        1: { rateBp: pct(0) },
        2: { threshold: kr(404_115), rateBp: pct(4) },
        4: { threshold: kr(800_000), rateBp: pct(21.7) },
        5: { threshold: kr(1_467_200), rateBp: pct(25) },
      }),
      'Trinnskatt: trinn 1 fjernes; trinn 2 404 115 / 4 %; trinn 4 800 000 / 21,7 %; trinn 5 25 %',
      partyProv(
        'r',
        'PDF p31',
        '404 115',
        'Tabell 1 s. 31 viser regjeringens forslag og Rødts forslag side om side: trinn 1 «Fjernes», trinn 2 404 115 kr / 4,0 %, trinn 3 uendret, trinn 4 800 000 kr / 21,7 %, trinn 5 1 467 200 kr / 25,0 %.',
      ),
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(121_810) },
      'Personfradrag 121 810 kr',
      partyProv('r', 'PDF p31', '121 810', 'Personfradraget står som kronebeløp i Tabell 1.'),
    ),
    partyRule(
      'wealth.netWealthTax',
      {
        single: { allowance: kr(2_200_000), tier2Threshold: kr(20_000_000) },
        couple: { allowance: kr(4_400_000), tier2Threshold: kr(40_000_000) },
        tier1RateBp: pct(1.2),
        tier2RateBp: pct(1.4),
      },
      'Formuesskatt: bunnfradrag 2,2 mill. kr, 1,2 pst.; 1,4 pst. over 20 mill. kr',
      partyProv(
        'r',
        'PDF p32',
        'øker vi bunnfradraget til 2,2 millioner kroner',
        'Tabell 3 s. 32 (regjeringen mot Rødt): bunnfradrag 1 900 000 → 2 200 000 kr, sats 1 1,0 → 1,2 %, trinn 2 21,5 → 20 mill. kr, sats 2 1,1 → 1,4 %. Ektepar har dobbelt bunnfradrag og trinngrense, som i regjeringens forslag. Nytt trinn 3 (1,6 % over 100 mill. kr) er ikke med, se egen linje.',
      ),
      { baselineParams: proposedParams('wealth.netWealthTax'), note: 'Partiets egen regjeringskolonne = Prop. 1 LS. Ektepar = 2 × enslig.' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({
        primaryHomeHighValueThreshold: kr(10_000_000),
        primaryHomeHighValueBp: pct(100),
        listedSharesBp: pct(100),
        otherBp: pct(100),
      }),
      'Verdsettelse 100 pst. for primærbolig over 10 mill. kr, aksjer og driftsmidler',
      partyProv(
        'r',
        'PDF p32',
        'Primærbolig o/10 millioner: 100 %',
        'Tabell 3 s. 32 (regjeringen mot Rødt): primærbolig over 10 mill. 70 → 100 %, aksjer og næringseiendom 80 → 100 %, driftsmidler 70 → 100 %. Primærbolig under grensen (25 %) og sekundærbolig (100 %) er uendret.',
      ),
      { baselineParams: proposedParams('wealth.valuation'), note: 'Partiets regjeringskolonne = Prop. 1 LS (70/80/70 pst). Boliggrensen 10 mill. er partiets bokstavelige forslag og beholdes selv om vedtatt grense er 14 mill. (beslutning Jesper 2026-09-27).' },
    ),
    partyRule(
      'benefit.childBenefit',
      { under6PerMonth: kr(2_012), from6PerMonth: kr(2_012), ageCutoff: 6, extendedSingleParentPerMonth: kr(3_072) },
      'Barnetrygd prisjusteres til 2 012 kr/mnd; utvidet barnetrygd 3 072 kr/mnd (+500 kr utover prisjustering)',
      partyProv(
        'r',
        'PDF p38',
        'Øke barnetrygden i tråd med prisutviklingen',
        'S. 38: «Øke barnetrygden i tråd med prisutviklingen» og «Øke utvidet barnetrygd for enslige med 500 kroner i måneden utover prisjustering»; gjelder fra 1. februar (s. 7). Regjeringen foreslår 1 968 kr/mnd og 2 516 kr/mnd i utvidet, uten prisjustering. Partiets eget eksempel (s. 11: +88 kr/mnd for to barn) gir 1 968 + 44 = 2 012 kr, samme prisjustering som i vedtatt budsjett (2 012 og 2 572 kr). Utvidet: 2 572 + 500 = 3 072 kr/mnd. Vist som helårssats.',
        '2026-02-01',
      ),
      {
        baselineParams: proposedParams('benefit.childBenefit'),
        note: 'Utledet (beslutning 2): 1 968 × 2 012/1 968 = 2 012 (partiets eksempel +44 kr/barn); utvidet 2 516 → 2 572 (samme prisjustering) + 500 = 3 072. Kontroll s. 7: 6 000 kr/år ekstra for enslige = 500 × 12.',
      },
    ),
    partyRule(
      'benefit.studentSupport',
      { ...proposedParams('benefit.studentSupport'), basicSupportPerMonth: kr(16_738) },
      'Studiestøtte: basisstøtte 16 738 kr/mnd (+1 250 kr/mnd fra høsten 2026)',
      partyProv(
        'r',
        'PDF p18',
        'Øke studielån og stipend med 15 000 kroner i året',
        'S. 18: «Øke studielån og stipend med 15 000 kroner i året fra og med studiestart høsten 2026»; partiets eksempel s. 12 bruker 1 250 kr/mnd (= 15 000 ÷ 12). Basisstøtten i regjeringens forslag er 15 488 kr/mnd for 2026–2027; 15 488 + 1 250 = 16 738 kr/mnd. Stipendandelen er ikke nevnt og er uendret. Vist som helårssats.',
        '2026-08-01',
        'medium',
      ),
      {
        baselineParams: proposedParams('benefit.studentSupport'),
        note: 'Utledet (beslutning 2): 15 488 + 1 250 = 16 738 kr/mnd, med partiets egen månedssats (s. 12). Med 10 måneders studieår gir det 12 500 kr/år, ikke 15 000; partiet regner med 12 måneder.',
      },
    ),
  ],
  reviewed: {
    'consumption-tax': {
      status: 'no-change',
      pageOrTable: 'PDF p36',
      note: 'Avgiftstabellen s. 36 har ingen endring i elavgift, alkohol- og tobakksavgift eller veibruksavgift.',
    },
    employer: { status: 'no-change', pageOrTable: 'PDF p36', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Rentefradrag bare for renter på de første 8 mill. kr av lån (per person)',
      status: 'unquantified',
      reason:
        'Kalkulatoren gir fradrag for oppgitte renteutgifter, men vet ikke hvor stor del av dem som gjelder lån over 8 mill. kr, og kan derfor ikke avkorte fradraget.',
      provenance: partyProv(
        'r',
        'PDF p30',
        'Vi begrenser skattefradrag på renter til å kun gjelde',
        'Omtale s. 30: fradraget gjelder bare renter på de første 8 mill. kr av lån (60 G), per person.',
      ),
    },
    {
      category: 'wealth-tax',
      title: 'Formuesskatt: nytt trinn 3 med 1,6 pst. over 100 mill. kr',
      status: 'unquantified',
      reason: 'Kalkulatoren har bare to trinn i formuesskatten. Trinn 3 gjelder bare formuer over 100 mill. kr.',
      provenance: partyProv('r', 'PDF p32', '100 000 000', 'Tabell 3 s. 32.'),
    },
    {
      category: 'consumption-tax',
      title: 'Mva-fritak for norskprodusert fersk frukt og grønnsaker',
      status: 'unquantified',
      reason: 'Kalkulatoren har én mva-sats for all mat og kan ikke skille ut norsk fersk frukt og grønt.',
      provenance: partyProv('r', 'PDF p36', 'Fjerne mva på norskproduserte fersk frukt og grønnsaker', 'Avgiftstabellen s. 36.'),
    },
    {
      category: 'consumption-tax',
      title: 'CO2-avgift: 32 pst. økning utover prisstigning fra 2025-nivå',
      status: 'unquantified',
      reason:
        'Økningen er målt mot 2025-nivået justert for prisstigning, og dokumentet oppgir verken prisjusteringen eller en sats per liter drivstoff.',
      provenance: partyProv(
        'r',
        'PDF p8; p36',
        'Økt CO2-avgift (32 % økning utover prisstigning fra 2025-nivå)',
        'Omtale s. 8 («Vi øker CO2-avgiften raskere enn regjeringa»); avgiftstabellen s. 36.',
      ),
    },
    {
      category: 'consumption-tax',
      title: 'Progressiv flyavgift mellom de største byene og for utenlandsreiser',
      status: 'unquantified',
      reason:
        'Ingen satser er oppgitt, og avgiften avhenger av hvor mange utenlandsreiser man tar i året, noe kalkulatoren ikke vet.',
      provenance: partyProv(
        'r',
        'PDF p33; p36',
        'Innføre progressiv flyavgift for reiser mellom de største byene',
        'Avgiftstabellen s. 36; gjelder fra 1. mars 2026. Inntektene går til klimarabatten (s. 33).',
        '2026-03-01',
      ),
    },
    {
      category: 'benefit',
      title: 'Klimarabatt: årlig utbetaling til alle med inntekt under 500 000 kr',
      status: 'unquantified',
      reason: 'Beløpet avhenger av hvor sentralt man bor (sentralitetssone), og det spør ikke kalkulatoren om.',
      provenance: partyProv(
        'r',
        'PDF p10; p33',
        'innføre en klimarabatt som tilbakebetaler inntektene',
        'Omtale s. 10 og s. 33, der satsene står per inntektsgruppe og sentralitetssone; avgiftstabellen s. 36.',
      ),
    },
  ],
};
