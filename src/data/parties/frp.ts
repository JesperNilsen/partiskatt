import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { emptyParty, kr, partyRule, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Encodable: personalAllowance 127 850; wealth.valuation sekundærbolig 80 %. */
export const FRP_2026: PartyRuleSet = {
  ...emptyParty('frp'),
  deltas: [
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
      category: 'direct-tax',
      title: 'Øke frikortgrensen til 150 000 kr',
      status: 'not-reviewed',
      reason: 'K1: one-sided — kun ett uttrekk fant forslaget.',
      provenance: partyProv('frp', 'PDF p8', '150 000', 'Konflikt — ikke encodet.'),
    },
    {
      category: 'consumption-tax',
      title: 'Halvere matmoms (virkning fra 1. april)',
      status: 'unquantified',
      reason: 'agreed-proposal DERIVE — baseline ikke oppgitt i dokumentet.',
      provenance: partyProv('frp', 'PDF p46', 'matmoms', 'Ikke encodet som vat.food-sats.'),
    },
  ],
};
