import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { adoptedParams, emptyParty, kr, partyRule, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Encodable: aksjer/driftsmidler 60 pst.; barnetrygd 2 250 kr/mnd (aldersnøytral). */
export const KRF_2026: PartyRuleSet = {
  ...emptyParty('krf'),
  deltas: [
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ listedSharesBp: pct(60), otherBp: pct(60) }),
      'Aksjer og driftsmidler verdsettes til 60 pst.',
      partyProv(
        'krf',
        'PDF p17',
        'aksjer og driftsmidler fra 80 til 60 pst',
        'K2: skattevedlegget er delvis uleselig i pdftotext, men aksjer/driftsmidler 60 % er agreed-value.',
        '2026-01-01',
        'medium',
      ),
      { note: 'derive-detail-mismatch på bolig over 8 mill.; kun aksjer/driftsmidler encodet.' },
    ),
    partyRule(
      'benefit.childBenefit',
      {
        ...adoptedParams('benefit.childBenefit'),
        under6PerMonth: kr(2_250),
        from6PerMonth: kr(2_250),
      },
      'Barnetrygd 2 250 kr/mnd (aldersnøytral)',
      partyProv(
        'krf',
        'PDF p9',
        '2 250 kroner i måneden',
        'Én sats for alle barn 0–18; utvidet barnetrygd ikke differensiert i dokumentet.',
      ),
      { note: 'no-baseline-quoted; aldersspesifikke satser ikke oppgitt.' },
    ),
  ],
  reviewed: {
    employer: { status: 'no-change', pageOrTable: 'PDF p17–18', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Skattevedlegg (PDF p35–46 tom i pdftotext)',
      status: 'not-reviewed',
      reason: 'K2: numerisk vedlegg ikke lesbart — de fleste inntektsskatt-rader er not-found.',
      provenance: partyProv('krf', 'PDF p35–46', 'vedlegg', 'K2-krf-appendix-empty.'),
    },
  ],
};
