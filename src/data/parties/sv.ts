import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, partyRule, patchBracketTax, pct } from '../rule-helpers.ts';

/** Encodable: trinnskatt sats trinn 3–5, personfradrag 143 000, minstefradrag 55 %. */
export const SV_2026: PartyRuleSet = {
  ...emptyParty('sv'),
  deltas: [
    partyRule(
      'income.bracketTax',
      patchBracketTax({
        3: { rateBp: pct(16.2) },
        4: { rateBp: pct(19.2) },
        5: { rateBp: pct(27) },
      }),
      'Trinnskatt: trinn 3–5 heves til 16,2 / 19,2 / 27 pst.',
      partyProv('sv', 'PDF p37', '16,2', 'Satser trinn 3–5 fra skattetabellen; terskler uendret (ikke nevnt).'),
      { note: 'no-baseline-quoted på alle trinn.' },
    ),
    partyRule(
      'income.personalAllowance',
      { amount: kr(143_000) },
      'Personfradrag 143 000 kr',
      partyProv('sv', 'PDF p37', '143 000', 'Absolutt personfradrag i skattetabellen.'),
      { note: 'no-baseline-quoted.' },
    ),
    partyRule(
      'income.minimumDeductionWage',
      { ...adoptedParams('income.minimumDeductionWage'), rateBp: pct(55) },
      'Minstefradrag i lønn 55 pst.',
      partyProv('sv', 'PDF p37', '55', 'Sats 55 % oppgitt; øvre grense ikke i dokumentet — beholdt vedtatt maks.'),
      { note: 'no-baseline-quoted; øvre grense NOT FOUND.' },
    ),
    partyRule(
      'income.minimumDeductionPension',
      { ...adoptedParams('income.minimumDeductionPension'), rateBp: pct(55) },
      'Minstefradrag i pensjon 55 pst.',
      partyProv('sv', 'PDF p37', '55', 'Sats 55 % oppgitt; øvre grense ikke i dokumentet — beholdt vedtatt maks.'),
      { note: 'no-baseline-quoted; øvre grense NOT FOUND.' },
    ),
  ],
  reviewed: {
    'consumption-tax': { status: 'no-change', pageOrTable: 'PDF p37', note: 'MVA-satser uendret i tabellen.' },
    employer: { status: 'no-change', pageOrTable: 'PDF p37', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Øke frikortgrensen til 150 000 kr',
      status: 'not-reviewed',
      reason: 'K1: one-sided — kun claude fant forslaget.',
      provenance: partyProv('sv', 'PDF p37', '150 000', 'Konflikt — ikke encodet.'),
    },
  ],
};
