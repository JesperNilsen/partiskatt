import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, partyRule, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Encodable: personalAllowance 127 850; wealth.valuation sekundærbolig 80 %. K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr. */
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
        'K1 (besluttet 2026-09-13): frikortgrensen er nedre grense for trygdeavgift (ftrl. § 23-3), men partiet sier ikke dette eksplisitt. Absolutt 150 000 kr encodet som estimated; satser uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift: encodet etter beslutning 2026-09-13; baseline-mismatch (partiene siterer 100 000 som utgangspunkt, vedtatt er 99 650).' },
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(127_850) },
      'Personfradrag 127 850 kr',
      partyProv('frp', 'PDF p46', '127 850', 'Absolutt personfradrag i skattetabellen.'),
      { note: 'no-baseline-quoted.' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ secondaryHomeBp: pct(80) }),
      'Sekundærbolig verdsettes til 80 pst.',
      partyProv(
        'frp',
        'PDF p11; p46',
        'verdsettelsen av sekundærboliger',
        'Sekundærbolig 80 % av markedsverdi (agreed-value). Primærbolig ikke tallfestet (DERIVE).',
        '2026-01-01',
        'medium',
      ),
      { note: 'baseline-mismatch flagg i reconciler; primærbolig ikke encodet.' },
    ),
  ],
  reviewed: {
    'consumption-tax': { status: 'no-change', pageOrTable: 'PDF p46', note: 'Drivstoff/el/fly uendret i tabell.' },
    employer: { status: 'no-change', pageOrTable: 'PDF p46', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'consumption-tax',
      title: 'Halvere matmoms (virkning fra 1. april)',
      status: 'unquantified',
      reason: 'agreed-proposal DERIVE — baseline ikke oppgitt i dokumentet.',
      provenance: partyProv('frp', 'PDF p46', 'Merverdiavgift mat, halveres 1. april', 'Ikke encodet som vat.food-sats.'),
    },
  ],
};
