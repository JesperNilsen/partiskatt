import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, partyRule, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Encodable (agreed-value): wealth.valuation — aksjer og driftsmidler 60 pst. K1 (besluttet 2026-09-13): income.socialSecurity nedre grense 150 000 kr. */
export const H_2026: PartyRuleSet = {
  ...emptyParty('h'),
  deltas: [
    partyRule(
      'income.socialSecurity',
      { ...adoptedParams('income.socialSecurity'), lowerThreshold: kr(150_000) },
      'Trygdeavgift: nedre grense 150 000 kr (frikortgrense)',
      partyProv(
        'h',
        'PDF p17',
        'Øke frikortgrensen til 150 000 kr',
        'K1 (besluttet 2026-09-13): frikortgrensen er nedre grense for trygdeavgift (ftrl. § 23-3), men partiet sier ikke dette eksplisitt. Absolutt 150 000 kr encodet som estimated; satser uendret.',
        '2026-01-01',
        'medium',
      ),
      { note: 'K1-frikort-trygdeavgift: encodet etter beslutning 2026-09-13; baseline-mismatch (partiene siterer 100 000 som utgangspunkt, vedtatt er 99 650).' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ listedSharesBp: pct(60), otherBp: pct(60) }),
      'Aksjer og driftsmidler verdsettes til 60 pst.',
      partyProv(
        'h',
        'PDF p17',
        'Aksjer og driftsmidler verdsettes til 60 pst.',
        'Absolutt verdsettelsesnivå oppgitt i skattetabellen; primærbolig/sekundærbolig/bank ikke omtalt.',
      ),
      { note: 'no-baseline-quoted: partiet siterer ikke Prop. 1 LS-utgangspunkt.' },
    ),
  ],
  reviewed: {
    'direct-tax': { status: 'no-change', pageOrTable: 'PDF p17', note: 'Inntektsskatt-tabellen uten endringer i satser/terskler.' },
    'consumption-tax': { status: 'no-change', pageOrTable: 'PDF p17', note: 'MVA og husholdningsavgifter uendret i tabellen.' },
    benefit: { status: 'no-change', pageOrTable: 'PDF p17–24', note: 'Studiestøtte ikke omtalt; barnetrygd kun prisjustering (unquantified).' },
    employer: { status: 'no-change', pageOrTable: 'PDF p17', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [],
};
