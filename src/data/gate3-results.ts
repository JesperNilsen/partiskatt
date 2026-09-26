import type { Gate3Results } from './gate3.ts';

/**
 * Operator gate 3 — Skatteetaten's numbers, recorded by hand (Jesper). See docs/gate-3.md.
 *
 * Run `npm run gate3:sheet` for what to type into the skattekalkulator per fixture, then
 * copy each tax line it shows into `values` (whole kroner, as shown). Keys per fixture:
 *   'skattAlminneligInntekt#0' = Fellesskatt + Inntektsskatt til kommune + … til fylkeskommune
 *   'trinnskatt#0', 'trygdeavgift#0'           (#1 = the second adult in a household fixture)
 *   'formuesskatt'                              = til kommune + til staten (both spouses summed)
 *
 * Never edit statuses in adopted.ts: a rule turns `confirmed` only when these values match
 * the engine within 1 kr (src/data/gate3.ts). Empty = nothing is confirmed.
 */
export const GATE3_RESULTS: Gate3Results = {
  checkedOn: null,
  calculator: { inntektsaar: null, version: null },
  valuationEnteredAs: null,
  values: {},
};
