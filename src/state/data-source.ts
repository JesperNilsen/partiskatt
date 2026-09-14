import { DATA_BUNDLE } from '../data/index.ts';
import type { DataBundle } from '../engine/index.ts';
import { resolveBaseline } from '../engine/index.ts';
import { BRAND } from '../config/brand.ts';

export type DataKind = 'live';

export interface DataSource {
  kind: DataKind;
  bundle: DataBundle;
  /** Short banner headline shown on every surface that prints a number. */
  headline: string;
  detail: string;
  /** Reserved for non-fatal data notices; null today. */
  warning: string | null;
}

/** Both baselines must carry one rule per formula, or nothing can be computed. */
function assertUsable(bundle: DataBundle): void {
  resolveBaseline(bundle.adopted);
  resolveBaseline(bundle.proposed);
}

const LIVE_DETAIL =
  'Tallene bygger på avstemte ark fra alternative statsbudsjetter 2026 og vedtatte 2026-regler. Alle kodede endringer er merket anslått — ingen er bekreftet mot primærkilde ennå. Se metode og kilder før du tolker små forskjeller.';

function live(bundle: DataBundle): DataSource {
  assertUsable(bundle);
  return {
    kind: 'live',
    bundle,
    headline: 'Offentlig beta',
    detail: LIVE_DETAIL,
    warning: null,
  };
}

/** Loads the S7 dataset (`DATA_BUNDLE`). A validation failure rejects; the app shows the error instead of numbers. */
export async function loadDataSource(): Promise<DataSource> {
  return live(DATA_BUNDLE);
}

/** Beta notice for institutional pages when live data is active. */
export const LIVE_BETA_NOTICE = BRAND.betaNotice;
