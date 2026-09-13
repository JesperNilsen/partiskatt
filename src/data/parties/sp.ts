import type { PartyRuleSet } from '../../types/index.ts';
import { partyProv } from '../sources.ts';
import { emptyParty, kr, partyRule, patchBracketTax, patchWealthValuation, pct } from '../rule-helpers.ts';

/** Encodable: trinnskatt trinn 4 terskel 960 000; boliggrense 10,21 mill.; matmoms 10 %. */
export const SP_2026: PartyRuleSet = {
  ...emptyParty('sp'),
  deltas: [
    partyRule(
      'income.bracketTax',
      patchBracketTax({ 4: { threshold: kr(960_000) } }),
      'Trinnskatt trinn 4: innslagspunkt 960 000 kr',
      partyProv('sp', 'PDF p8', '960 000', 'Terskel trinn 4 oppgitt; sats ikke oppgitt — beholdt vedtatt sats.'),
      { note: 'no-baseline-quoted. Trinn 5 (bortfaller) er not-reviewed — ikke encodet.' },
    ),
    partyRule(
      'wealth.valuation',
      patchWealthValuation({ primaryHomeHighValueThreshold: kr(10_210_000) }),
      'Verdsettelsesgrense boliger 10,21 mill. kr',
      partyProv('sp', 'PDF p8', '10,21 mill.', 'Boliggrense 10,21 mill. kr (agreed-value).'),
    ),
    partyRule(
      'vat.food',
      { rateBp: pct(10) },
      'Merverdiavgift næringsmidler 10 pst fra 1. september 2026',
      partyProv(
        'sp',
        'PDF p8',
        '10 prosent fra 1. september',
        'Matmoms 10 % fra 1.9.2026; effektiv dato avviker fra hele året.',
        '2026-09-01',
      ),
      { note: 'no-baseline-quoted; effective-date-differs.' },
    ),
  ],
  reviewed: {
    employer: { status: 'no-change', pageOrTable: 'PDF p8', note: 'Arbeidsgiveravgift ikke omtalt.' },
  },
  unquantified: [
    {
      category: 'direct-tax',
      title: 'Trygdeavgift (DERIVE)',
      status: 'unquantified',
      reason: 'agreed-proposal — ingen absolutte satser i dokumentet.',
      provenance: partyProv('sp', 'PDF p8', 'trygdeavgift', 'Ikke encodet.'),
    },
  ],
};
