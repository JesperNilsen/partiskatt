import { DATA_BUNDLE } from '../data/index.ts';
import type { DataBundle } from '../engine/index.ts';
import { resolveBaseline } from '../engine/index.ts';
import { PROVISIONAL_BUNDLE } from '../provisional/bundle.ts';
import { BRAND } from '../config/brand.ts';

export type DataKind = 'live' | 'provisional';

export interface DataSource {
  kind: DataKind;
  bundle: DataBundle;
  /** Short banner headline shown on every surface that prints a number. */
  headline: string;
  detail: string;
  /** Set when a live data layer exists but could not be used. */
  warning: string | null;
}

/** Both baselines must carry one rule per formula, or nothing can be computed. */
function assertUsable(bundle: DataBundle): void {
  resolveBaseline(bundle.adopted);
  resolveBaseline(bundle.proposed);
}

const PROVISIONAL_HEADLINE = 'Demotall – ikke ekte partipolitikk';
const PROVISIONAL_DETAIL =
  'Datagrunnlaget for 2026 er under uttrekk fra primærkildene. Tallene du ser nå kommer fra et syntetisk regelsett og oppdiktede partiendringer som bare finnes for å vise hvordan kalkulatoren regner. Ingen tall på denne siden kan siteres.';

const LIVE_DETAIL =
  'Tallene bygger på avstemte ark fra alternative statsbudsjetter 2026 og vedtatte 2026-regler. Alle kodede endringer er merket anslått — ingen er bekreftet mot primærkilde ennå. Se metode og kilder før du tolker små forskjeller.';

function provisional(warning: string | null): DataSource {
  assertUsable(PROVISIONAL_BUNDLE);
  return {
    kind: 'provisional',
    bundle: PROVISIONAL_BUNDLE,
    headline: PROVISIONAL_HEADLINE,
    detail: PROVISIONAL_DETAIL,
    warning,
  };
}

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

/**
 * Loads the real S7 dataset (`DATA_BUNDLE`) and falls back to the provisional bundle only
 * when the live layer fails validation.
 */
export async function loadDataSource(): Promise<DataSource> {
  try {
    return live(DATA_BUNDLE);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return provisional(`Datalaget kunne ikke lastes (${message}). Viser demotall.`);
  }
}

/** Beta notice for institutional pages when live data is active. */
export const LIVE_BETA_NOTICE = BRAND.betaNotice;
