import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, partyRule, patchBracketTax, pct } from '../rule-helpers.ts';

/** Encodable: trinnskatt sats trinn 3–5, personfradrag 143 000, minstefradrag 55 %. K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr. */
export const SV_2026: PartyRuleSet = {
  ...emptyParty('sv'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), lowerThreshold: kr(150_000) },
      'Trygdeavgift: nedre grense 150 000 kr (frikortgrense)',
      partyProv(
        'sv',
        'PDF p37',
        '150 000',
        'K1 (besluttet 2026-09-13): frikortgrensen er nedre grense for trygdeavgift (ftrl. § 23-3), men partiet sier ikke dette eksplisitt. Absolutt 150 000 kr encodet som estimated; satser uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift: encodet etter beslutning 2026-09-13; baseline-mismatch (partiene siterer 100 000 som utgangspunkt, vedtatt er 99 650).' },
    ),
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
  unquantified: [],
};
