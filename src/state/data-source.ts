import type { DataBundle } from '../engine/index.ts';
import { resolveBaseline } from '../engine/index.ts';
import { PROVISIONAL_BUNDLE } from '../provisional/bundle.ts';

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

/**
 * The seam between the UI and the data layer.
 *
 * `src/data/index.ts` does not exist yet (it is being extracted from the archived primary
 * sources). `import.meta.glob` resolves to an empty object while that is true, so the UI
 * falls back to the provisional bundle instead of failing to build. The moment the real
 * module lands — exporting the bundle as `default`, `DATA`, `BUNDLE` or `data` — it is
 * picked up here with no other change to the UI.
 */
const liveModules = import.meta.glob<Record<string, unknown>>('../data/index.ts');

function isBundle(value: unknown): value is DataBundle {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<DataBundle>;
  return (
    Array.isArray(candidate.adopted?.rules) && Array.isArray(candidate.proposed?.rules) && Array.isArray(candidate.parties)
  );
}

function pickBundle(mod: Record<string, unknown>): DataBundle | null {
  for (const key of ['default', 'DATA', 'BUNDLE', 'DATA_BUNDLE', 'bundle', 'data']) {
    const value = mod[key];
    if (isBundle(value)) return value;
  }
  for (const value of Object.values(mod)) {
    if (isBundle(value)) return value;
  }
  return null;
}

/** Both baselines must carry one rule per formula, or nothing can be computed. */
function assertUsable(bundle: DataBundle): void {
  resolveBaseline(bundle.adopted);
  resolveBaseline(bundle.proposed);
}

const PROVISIONAL_HEADLINE = 'Demotall – ikke ekte partipolitikk';
const PROVISIONAL_DETAIL =
  'Datagrunnlaget for 2026 er under uttrekk fra primærkildene. Tallene du ser nå kommer fra et syntetisk regelsett og oppdiktede partiendringer som bare finnes for å vise hvordan kalkulatoren regner. Ingen tall på denne siden kan siteres.';

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

export async function loadDataSource(): Promise<DataSource> {
  const load = Object.values(liveModules)[0];
  if (load) {
    try {
      const bundle = pickBundle(await load());
      if (bundle) {
        assertUsable(bundle);
        return {
          kind: 'live',
          bundle,
          headline: 'Offentlig beta',
          detail:
            'Tallene bygger på de vedtatte 2026-reglene og partienes alternative statsbudsjetter. Se metode og kilder før du tolker små forskjeller.',
          warning: null,
        };
      }
      return provisional('Datalaget finnes, men eksporterer ikke et gjenkjennelig datasett. Viser demotall.');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return provisional(`Datalaget kunne ikke lastes (${message}). Viser demotall.`);
    }
  }
  return provisional(null);
}
