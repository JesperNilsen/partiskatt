import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { emptyParty, kr, partyRule } from '../rule-helpers.ts';

/** Encodable: personfradrag 125 000. */
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
        'K4: dokumentet motsier seg på andre sider — encodet kun der begge uttrekk er enige.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K4-mdg-self-contradiction; no-baseline-quoted.' },
    ),
  ],
  reviewed: {
    'consumption-tax': { status: 'no-change', pageOrTable: 'PDF p80–81', note: 'Generell MVA uendret utover enkeltposter i konflikt.' },
    employer: { status: 'no-change', pageOrTable: 'PDF p19', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Reverserer regjeringens kutt i trygdeavgiften (0,1 pp)',
      status: 'unquantified',
      reason: 'agreed-proposal DERIVE — ingen absolutte satser.',
      provenance: partyProv('mdg', 'PDF p19', '0,1%', 'Ikke encodet som income.socialSecurity.'),
    },
  ],
};
