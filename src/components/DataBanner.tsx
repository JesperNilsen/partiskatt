import type { DataSource } from '../state/data-source.ts';
import { PROFILES_ARE_PROVISIONAL } from '../provisional/consumption-profiles.ts';

interface DataBannerProps {
  data: DataSource | null;
  loading: boolean;
  error: string | null;
}

export function DataBanner({ data, loading, error }: DataBannerProps) {
  if (loading) {
    return (
      <div className="banner banner--loading" role="status" aria-live="polite">
        <p>Laster regelsett …</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="banner banner--error" role="alert">
        <p><strong>Kunne ikke laste data.</strong> {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="banner banner--beta" role="status">
      <p>
        <strong>{data.headline}.</strong> {data.detail}
      </p>
      {data.warning ? <p className="banner__warn">{data.warning}</p> : null}
      {PROFILES_ARE_PROVISIONAL ? (
        <p className="banner__warn">Forbruksprofilene er også midlertidige — ikke fra SSB ennå.</p>
      ) : null}
    </div>
  );
}
