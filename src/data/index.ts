import { ADOPTED_2026 } from './baseline/2026/adopted.ts';
import { PROPOSED_2026 } from './baseline/2026/proposed.ts';
import { NON_FORLIK_BASELINE_DIFFS } from './baseline/2026/forlik.ts';
import type { DataBundle } from '../engine/resolve.ts';
import type { PartyId } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';
import { AP_2026 } from './parties/ap.ts';
import { FRP_2026 } from './parties/frp.ts';
import { H_2026 } from './parties/h.ts';
import { KRF_2026 } from './parties/krf.ts';
import { MDG_2026 } from './parties/mdg.ts';
import { R_2026 } from './parties/r.ts';
import { SP_2026 } from './parties/sp.ts';
import { SV_2026 } from './parties/sv.ts';
import { V_2026 } from './parties/v.ts';

export { ADOPTED_2026, PROPOSED_2026, NON_FORLIK_BASELINE_DIFFS };
export { SOURCES, PARTY_SOURCE_ID, partySource, sourceOf } from './sources.ts';
export { AP_2026 } from './parties/ap.ts';
export { H_2026 } from './parties/h.ts';
export { FRP_2026 } from './parties/frp.ts';
export { SV_2026 } from './parties/sv.ts';
export { SP_2026 } from './parties/sp.ts';
export { R_2026 } from './parties/r.ts';
export { V_2026 } from './parties/v.ts';
export { MDG_2026 } from './parties/mdg.ts';
export { KRF_2026 } from './parties/krf.ts';

const PARTY_SETS = {
  ap: AP_2026,
  h: H_2026,
  frp: FRP_2026,
  sv: SV_2026,
  sp: SP_2026,
  r: R_2026,
  v: V_2026,
  mdg: MDG_2026,
  krf: KRF_2026,
} as const;

export function partyOf(id: PartyId) {
  return PARTY_SETS[id];
}

/** Full engine dataset: proposed + adopted baselines and all nine party overlays. */
export const DATA_BUNDLE: DataBundle = {
  proposed: PROPOSED_2026,
  adopted: ADOPTED_2026,
  parties: PARTY_IDS.map((id) => PARTY_SETS[id]),
};
