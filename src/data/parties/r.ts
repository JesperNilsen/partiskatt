import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { emptyParty, kr, partyRule, patchBracketTax, pct } from '../rule-helpers.ts';

/** Encodable: trinnskatt trinn 2/4/5 og personfradrag 121 810. */
export const R_2026: PartyRuleSet = {
  ...emptyParty('r'),
  deltas: [
    partyRule(
      'income.bracketTax',
      patchBracketTax({
        2: { threshold: kr(404_115), rateBp: pct(4) },
        4: { threshold: kr(800_000), rateBp: pct(21.7) },
        5: { threshold: kr(1_467_200), rateBp: pct(25) },
      }),
      'Trinnskatt: trinn 2 404 115 / 4 %; trinn 4 800 000 / 21,7 %; trinn 5 25 %',
      partyProv('r', 'PDF p31', '404 115', 'Tabell 1 Rødt-kolonnen — agreed-value på tre trinn.'),
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(121_810) },
      'Personfradrag 121 810 kr',
      partyProv('r', 'PDF p31', '121 810', 'Absolutt personfradrag i Tabell 1.'),
    ),
  ],
  reviewed: {
    'consumption-tax': { status: 'no-change', pageOrTable: 'PDF p36', note: 'Elavgift og alkohol/tobakk ikke omtalt.' },
    employer: { status: 'no-change', pageOrTable: 'PDF p36', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Øke frikortgrensen til 150 000 kr',
      status: 'not-reviewed',
      reason: 'K1: one-sided — kun claude fant forslaget.',
      provenance: partyProv('r', 'PDF p31', '150 000', 'Konflikt — ikke encodet.'),
    },
    {
      category: 'benefit',
      title: 'Barnetrygd (prisjustering + utvidet)',
      status: 'unquantified',
      reason: 'agreed-proposal DERIVE — ingen absolutte satser oppgitt.',
      provenance: partyProv('r', 'PDF p38', 'barnetrygden', 'Ikke encodet som benefit.childBenefit.'),
    },
    {
      category: 'benefit',
      title: 'Studiestøtte +15 000 kr/år',
      status: 'unquantified',
      reason: 'agreed-proposal DERIVE — basisstøtte ikke tallfestet.',
      provenance: partyProv('r', 'PDF p49', '15 000 kroner', 'Ikke encodet som benefit.studentSupport.'),
    },
  ],
};
