import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, partyRule, patchBracketTax, pct } from '../rule-helpers.ts';

/** Encodable: trinnskatt trinn 2/4/5 og personfradrag 121 810. K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr. */
export const R_2026: PartyRuleSet = {
  ...emptyParty('r'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), lowerThreshold: kr(150_000) },
      'Trygdeavgift: nedre grense 150 000 kr (frikortgrense)',
      partyProv(
        'r',
        'PDF p31',
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
