import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { emptyParty, kr, krPerUnit, partyRule, pct, proposedParams } from '../rule-helpers.ts';

/**
 * Encodable: personfradrag 125 000; bunnfradrag formuesskatt 10 mill.
 * L10b (beslutning 2, 2026-09-25): trygdeavgift (reversert kutt) og veibruksavgift +2,50 kr/l utledet mot Prop. 1 LS.
 */
export const MDG_2026: PartyRuleSet = {
  ...emptyParty('mdg'),
  deltas: [
    partyRule(
      'income.personalAllowance',
      { amount: kr(125_000) },
      'Personfradrag 125 000 kr',
      partyProv(
        'mdg',
        'PDF p19',
        'øke personfradraget til kr 125.000',
        'S. 19: «øke personfradraget til kr 125.000». Dokumentet oppgir andre tall for personfradraget på andre sider; dette er tallet begge gjennomlesningene fant.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K4-mdg-self-contradiction; no-baseline-quoted.' },
    ),
    partyRule(
      'income.socialSecurity',
      { ...proposedParams('income.socialSecurity'), wageRateBp: pct(7.7) },
      'Trygdeavgift på lønn og trygd 7,7 pst. (regjeringens kutt på 0,1 prosentenhet reverseres)',
      partyProv(
        'mdg',
        'PDF p19',
        'Reverserer regjeringens flate kutt på 0,1% i trygdeavgiften',
        'S. 19 og s. 82: «Reverserer regjeringens flate kutt på 0,1% i trygdeavgiften». Regjeringen foreslår å kutte satsen på lønn/trygd fra 7,7 til 7,6 pst. (Prop. 1 LS s. 80); reversert gir 7,7 pst. Pensjonssatsen (5,1 pst.) ble ikke kuttet og er uendret.',
      ),
      {
        baselineParams: proposedParams('income.socialSecurity'),
        note: 'Utledet (beslutning 2): Prop. 1 LS 7,6 + 0,1 = 7,7 pst (2025-sats). K4: sidene er enige om tiltaket; bare provenyfortegnet avviker (−2 260 s. 19/82, +2 283 s. 47).',
      },
    ),
    partyRule(
      'wealth.netWealthTax',
      {
        ...proposedParams('wealth.netWealthTax'),
        single: { allowance: kr(10_000_000), tier2Threshold: kr(21_500_000) },
        couple: { allowance: kr(20_000_000), tier2Threshold: kr(43_000_000) },
      },
      'Bunnfradrag i formuesskatten 10 mill. kr (20 mill. kr for ektepar)',
      partyProv(
        'mdg',
        'PDF p9',
        'Øke bunnfradraget i formuesskatten til 10 mill.',
        'S. 9, 19 og 79: bunnfradraget økes til 10 mill. kr. Ektepar har dobbelt bunnfradrag etter skattereglene, som i regjeringens forslag. Satsene er uendret. Samtidig skal verdsettelsesrabattene kuttes; det er ikke tallfestet, se egen linje.',
        '2026-01-01',
        'medium',
      ),
      { baselineParams: proposedParams('wealth.netWealthTax'), note: 'Partiets tall; ektepar = 2 × enslig. Rabattkuttet (samme tabellinje) er unquantified.' },
    ),
    partyRule(
      'excise.petrolLitre',
      { ratePerUnit: krPerUnit(10.55) },
      'Veibruks- og CO2-avgift bensin 10,55 kr/l (veibruksavgift +2,50 kr/l)',
      partyProv(
        'mdg',
        'PDF p81',
        'på bensin og bioetanol med 2.50 kroner',
        'S. 81: «Øker veibruksavgiften på bensin og bioetanol med 2.50 kroner». Regjeringen foreslår veibruksavgift 4,25 kr/l og CO2-avgift 3,80 kr/l (Prop. 1 LS tabell 1.8); 4,25 + 2,50 + 3,80 = 10,55 kr/l. Den økte CO2-avgiften er ikke tallfestet, se egen linje.',
      ),
      { baselineParams: proposedParams('excise.petrolLitre'), note: 'Utledet (beslutning 2): (4,25 + 2,50) + 3,80 = 10,55 kr/l.' },
    ),
    partyRule(
      'excise.dieselLitre',
      { ratePerUnit: krPerUnit(9.92) },
      'Veibruks- og CO2-avgift diesel 9,92 kr/l (veibruksavgift +2,50 kr/l)',
      partyProv(
        'mdg',
        'PDF p81',
        'diesel/mineralolje og biodiesel med 2.50',
        'S. 81: «Øker veibruksavgiften på diesel/mineralolje og biodiesel med 2.50 kroner». Regjeringen foreslår veibruksavgift 3,00 kr/l og CO2-avgift 4,42 kr/l (Prop. 1 LS tabell 1.8); 3,00 + 2,50 + 4,42 = 9,92 kr/l. Den økte CO2-avgiften er ikke tallfestet, se egen linje.',
      ),
      { baselineParams: proposedParams('excise.dieselLitre'), note: 'Utledet (beslutning 2): (3,00 + 2,50) + 4,42 = 9,92 kr/l.' },
    ),
  ],
  reviewed: {
    employer: { status: 'no-change', pageOrTable: 'PDF p19', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'wealth-tax',
      title: 'Verdsettelsesrabattene i formuesskatten kuttes',
      status: 'unquantified',
      reason: 'Dokumentet sier ikke hvilke rabatter som kuttes eller til hvilket nivå (s. 9 «kutte», s. 79 «fjernes»).',
      provenance: partyProv('mdg', 'PDF p79', 'Bunnfradrag økes til 10 mill. og rabatter', 'Vedlegget s. 79; omtalt s. 9.'),
    },
    {
      category: 'consumption-tax',
      title: 'Mva: full sats på ikke-økologisk kjøtt, godteri og brus',
      status: 'unquantified',
      reason: 'Kalkulatoren har én mva-sats for all mat og kan ikke skille ut kjøtt, godteri og brus.',
      provenance: partyProv('mdg', 'PDF p80', 'ikke-økologisk kjøtt, godteri og brus', 'Vedlegget s. 80.'),
    },
    {
      category: 'consumption-tax',
      title: 'Mva: full sats på innenlands luftfart',
      status: 'unquantified',
      reason: 'Forbruksprofilen skiller ikke innenlandsreiser fra utenlandsreiser med fly.',
      provenance: partyProv('mdg', 'PDF p81', 'innenlandsflyreiser', 'Vedlegget s. 81.'),
    },
    {
      category: 'consumption-tax',
      title: 'CO2-avgiften økes til 2150 kr per tonn',
      status: 'unquantified',
      reason:
        'Satsen er oppgitt per tonn CO2, ikke per liter drivstoff, og dokumentet oppgir ikke omregningen.',
      provenance: partyProv('mdg', 'PDF p81', 'Vi øker CO2-avgiften til 2150 kroner per', 'Vedlegget s. 81.'),
    },
    {
      category: 'consumption-tax',
      title: 'Elavgift: regjeringens reduksjon reverseres',
      status: 'unquantified',
      reason:
        'Satsene for 2025 var ulike gjennom året (lavere i januar–mars), og det er ikke sagt om de skal prisjusteres. Det gir ingen entydig helårssats.',
      provenance: partyProv('mdg', 'PDF p81', 'Vi reverserer den foreslåtte reduksjonen i', 'Vedlegget s. 81.'),
    },
    {
      category: 'consumption-tax',
      title: 'Flypassasjeravgiften erstattes av en flyseteavgift',
      status: 'unquantified',
      reason: 'Ingen satser er oppgitt for den nye flyseteavgiften.',
      provenance: partyProv('mdg', 'PDF p82', 'Avvikler dagens flypassasjeravgift', 'Vedlegget s. 82.'),
    },
    {
      category: 'consumption-tax',
      title: 'Tobakksavgiften økes',
      status: 'unquantified',
      reason: 'Partiet oppgir ikke hvor mye avgiften skal økes.',
      provenance: partyProv('mdg', 'PDF p81', 'Vi avvikler taxfree og øker avgift på', 'Vedlegget s. 81.'),
    },
    {
      category: 'benefit',
      title: 'Barnetrygden dobles og blir skattepliktig',
      status: 'unquantified',
      reason: 'Barnetrygden skal skattlegges som lønn, og kalkulatoren kan ikke skattlegge barnetrygd.',
      provenance: partyProv(
        'mdg',
        'PDF p21',
        'Doble barnetrygden og gjøre den mer omfordelende gjennom skatt',
        'Tabell s. 21; omtalt s. 17–20; vedlegget s. 50–51.',
      ),
    },
    {
      category: 'benefit',
      title: 'Studiestøtten økes til 1,4 G',
      status: 'unquantified',
      reason: 'Dokumentet oppgir ikke grunnbeløpet (G) eller fra når økningen gjelder.',
      provenance: partyProv('mdg', 'PDF p24', 'Vi øker basislånet til studenter til tilsvarende 1,4G', 'Tabell s. 24; vedlegget s. 74.'),
    },
    {
      category: 'benefit',
      title: 'Klimabelønning: flat utbetaling til alle',
      status: 'unquantified',
      reason: 'Beløpet per person er ikke oppgitt.',
      provenance: partyProv('mdg', 'PDF p81', 'Klimabelønning som flat utbetaling til alle', 'Vedlegget s. 81.'),
    },
  ],
};
