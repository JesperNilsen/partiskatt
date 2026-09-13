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
