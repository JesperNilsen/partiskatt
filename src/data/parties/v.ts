import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, krPerUnit, partyRule, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Encodable: trygdeavgift nedre grense 150 000; personfradrag 125 757; aksjer 70 %; elavgift 6 øre/kWh. */
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
        'K1: Venstre kobler frikort til trygdeavgift (p32 prosa). Tabell p119: «Øke frikortgrensen til 150.000 kroner». Satser uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift; baseline-mismatch (partiet siterer 100 000 som utgangspunkt).' },
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(125_757) },
      'Personfradrag 125 757 kr',
      partyProv('v', 'PDF p117', '125 757', 'Absolutt personfradrag i budsjettvedlegget.'),
      { note: 'no-baseline-quoted.' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ listedSharesBp: pct(70) }),
      'Aksjer («arbeidende kapital») verdsettes til 70 pst.',
      partyProv('v', 'PDF p119', 'arbeidende kapital', 'Aksjer/arbeidende kapital 70 % (agreed-value).'),
    ),
    partyRule(
      'excise.kwh',
      { ratePerUnit: krPerUnit(0.06) },
      'Elavgift 6 øre/kWh hele året',
      partyProv(
        'v',
        'PDF p122',
        'året til 6 øre kWh',
        'K3: partiet måler endringen mot dagens sats, ikke Prop. 1 LS. Absolutt 6 øre/kWh encodet som agreed-value.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K3-venstre-elavgift-baseline: baseline-not-proposed + baseline-mismatch.' },
    ),
  ],
  reviewed: {
    employer: { status: 'no-change', pageOrTable: 'PDF p119', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'consumption-tax',
      title: 'MVA strøm (fritak bortfaller)',
      status: 'unquantified',
      reason: 'agreed-proposal DERIVE — resulterende MVA-sats ikke oppgitt.',
      provenance: partyProv('v', 'PDF p120', 'Avvikle fritaket for mva', 'Ikke encodet som vat.electricity.'),
    },
  ],
};
