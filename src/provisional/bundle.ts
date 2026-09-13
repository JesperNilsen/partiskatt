import type { DataBundle } from '../engine/index.ts';
import { SYNTHETIC, SYNTHETIC_PROPOSED } from '../tests/synthetic-rules.ts';
import { DEMO_PARTIES } from './demo-parties.ts';

/**
 * PROVISIONAL bundle: the engine's synthetic rule set as the 2026 reference, with the
 * demonstration party deltas overlaid.
 *
 * `src/data/baseline/2026/adopted.ts` and `src/data/parties/*.ts` are still being
 * extracted from the archived primary sources. When `src/data/index.ts` appears, the
 * loader in `src/state/data-source.ts` picks it up and this module stops being used —
 * it is then safe to delete along with `src/provisional/`.
 */
export const PROVISIONAL_BUNDLE: DataBundle = {
  proposed: SYNTHETIC_PROPOSED,
  adopted: SYNTHETIC,
  parties: DEMO_PARTIES,
};
