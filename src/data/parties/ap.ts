import type { PartyRuleSet } from '../../types/index.ts';
import { emptyParty } from '../rule-helpers.ts';

/**
 * Arbeiderpartiet er regjeringsparti og publiserte ikke et alternativt statsbudsjett 2026.
 * Referansekortet = vedtatt system (null endring mot seg selv).
 */
export const AP_2026: PartyRuleSet = emptyParty('ap', {
  'direct-tax': {
    status: 'not-applicable',
    pageOrTable: 'ap-alt-2026 (manifest)',
    note: 'Regjeringsparti uten alternativt budsjett på Stortingets liste.',
  },
  'wealth-tax': {
    status: 'not-applicable',
    pageOrTable: 'ap-alt-2026 (manifest)',
    note: 'Regjeringsparti uten alternativt budsjett på Stortingets liste.',
  },
  'consumption-tax': {
    status: 'not-applicable',
    pageOrTable: 'ap-alt-2026 (manifest)',
    note: 'Regjeringsparti uten alternativt budsjett på Stortingets liste.',
  },
  benefit: {
    status: 'not-applicable',
    pageOrTable: 'ap-alt-2026 (manifest)',
    note: 'Regjeringsparti uten alternativt budsjett på Stortingets liste.',
  },
  employer: {
    status: 'not-applicable',
    pageOrTable: 'ap-alt-2026 (manifest)',
    note: 'Regjeringsparti uten alternativt budsjett på Stortingets liste.',
  },
});

/**
 * 2027-runden: Ap sitter i regjering, så regjeringens forslag ER partiets budsjett. Ingen egne
 * endringer; kortet viser forslaget (PROPOSED_2027, lagt under alle partier via `partyBase`)
 * mot vedtatt 2026 og er ikke lenger null.
 */
export const AP_2027: PartyRuleSet = emptyParty(
  'ap',
  {
    'direct-tax': { status: 'no-change', pageOrTable: 'PDF p26–30', note: 'Regjeringens forslag, Prop. 1 LS (2026–2027) Tabell 1.5.' },
    'wealth-tax': { status: 'no-change', pageOrTable: 'PDF p29', note: 'Regjeringens forslag, Prop. 1 LS (2026–2027) Tabell 1.5.' },
    'consumption-tax': { status: 'no-change', pageOrTable: 'PDF p31–35', note: 'Regjeringens forslag, Prop. 1 LS (2026–2027) Tabell 1.6.' },
  },
  2027,
);
