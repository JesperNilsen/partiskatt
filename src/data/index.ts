import { ADOPTED_2026 } from './baseline/2026/adopted.ts';
import { PROPOSED_2026 } from './baseline/2026/proposed.ts';
import { NON_FORLIK_BASELINE_DIFFS } from './baseline/2026/forlik.ts';
import type { DataBundle } from '../engine/resolve.ts';
import type { PartyId, PartyMeta } from '../types/index.ts';
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

export const PARTY_META: readonly PartyMeta[] = [
  { id: 'ap', name: 'Arbeiderpartiet', shortName: 'Ap', color: '#E11926', onColor: '#FFFFFF', inGovernment: true },
  { id: 'h', name: 'Høyre', shortName: 'H', color: '#0063C6', onColor: '#FFFFFF', inGovernment: false },
  { id: 'frp', name: 'Fremskrittspartiet', shortName: 'FrP', color: '#004F7A', onColor: '#FFFFFF', inGovernment: false },
  { id: 'sv', name: 'Sosialistisk Venstreparti', shortName: 'SV', color: '#E6007E', onColor: '#FFFFFF', inGovernment: false },
  { id: 'sp', name: 'Senterpartiet', shortName: 'Sp', color: '#00843D', onColor: '#FFFFFF', inGovernment: true },
  { id: 'r', name: 'Rødt', shortName: 'R', color: '#E30613', onColor: '#FFFFFF', inGovernment: false },
  { id: 'v', name: 'Venstre', shortName: 'V', color: '#61A946', onColor: '#0B1F12', inGovernment: false },
  { id: 'mdg', name: 'Miljøpartiet De Grønne', shortName: 'MDG', color: '#6A9326', onColor: '#FFFFFF', inGovernment: false },
  { id: 'krf', name: 'Kristelig Folkeparti', shortName: 'KrF', color: '#FDED34', onColor: '#1A1A1A', inGovernment: false },
];

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
