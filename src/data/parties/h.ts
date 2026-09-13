import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { emptyParty, partyRule, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Encodable (agreed-value): wealth.valuation — aksjer og driftsmidler 60 pst. */
export const H_2026: PartyRuleSet = {
  ...emptyParty('h'),
  deltas: [
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
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Øke frikortgrensen til 150 000 kr',
      status: 'not-reviewed',
      reason: 'K1: evidence-conflict mellom uttrekkene (frikort vs trygdeavgift).',
      provenance: partyProv('h', 'PDF p17', 'Øke frikortgrensen til 150 000 kr', 'Konflikt — ikke encodet.'),
    },
  ],
};
