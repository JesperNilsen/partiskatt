import type { PartyId, PartyMeta } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';

/**
 * Identity only — names and colours, never policy. Budget numbers live in the data layer.
 *
 * The hex values are the parties' own identification colours as used in their public
 * material; they are approximations pending a check against each party's brand guide, and
 * nothing in the arithmetic depends on them. `onColor` is the text colour that clears
 * WCAG AA on `color`.
 */
export const PARTY_META: Record<PartyId, PartyMeta> = {
  ap: {
    id: 'ap',
    name: 'Arbeiderpartiet',
    shortName: 'Ap',
    color: '#e11b22',
    onColor: '#ffffff',
    inGovernment: true,
  },
  h: {
    id: 'h',
    name: 'Høyre',
    shortName: 'H',
    color: '#0065a8',
    onColor: '#ffffff',
    inGovernment: false,
  },
  frp: {
    id: 'frp',
    name: 'Fremskrittspartiet',
    shortName: 'FrP',
    color: '#00417a',
    onColor: '#ffffff',
    inGovernment: false,
  },
  sv: {
    id: 'sv',
    name: 'Sosialistisk Venstreparti',
    shortName: 'SV',
    color: '#b0254c',
    onColor: '#ffffff',
    inGovernment: false,
  },
  sp: {
    id: 'sp',
    name: 'Senterpartiet',
    shortName: 'Sp',
    color: '#00713c',
    onColor: '#ffffff',
    inGovernment: false,
  },
  r: {
    id: 'r',
    name: 'Rødt',
    shortName: 'R',
    color: '#8f1520',
    onColor: '#ffffff',
    inGovernment: false,
  },
  v: {
    id: 'v',
    name: 'Venstre',
    shortName: 'V',
    color: '#00655c',
    onColor: '#ffffff',
    inGovernment: false,
  },
  mdg: {
    id: 'mdg',
    name: 'Miljøpartiet De Grønne',
    shortName: 'MDG',
    color: '#3a7229',
    onColor: '#ffffff',
    inGovernment: false,
  },
  krf: {
    id: 'krf',
    name: 'Kristelig Folkeparti',
    shortName: 'KrF',
    color: '#f0b323',
    onColor: '#141210',
    inGovernment: false,
  },
};

export const ALL_PARTY_META: readonly PartyMeta[] = PARTY_IDS.map((id) => PARTY_META[id]);
