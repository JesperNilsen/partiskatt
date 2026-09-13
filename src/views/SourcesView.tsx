import { Link } from 'wouter';
import { useApp } from '../state/app.tsx';

export function SourcesView() {
  const { data, dataLoading } = useApp();

  return (
    <article className="doc-page">
      <h1>Kilder</h1>

      {dataLoading ? <p role="status">Laster datastatus …</p> : null}

      {data?.kind === 'provisional' ? (
        <div className="banner banner--provisional">
          <p>
            <strong>Demotall.</strong> Partitallene kommer fra et syntetisk regelsett til grensesnittet er ferdig testet.
            Ekte kilder fra Stortingets alternative statsbudsjetter og Lovdata-vedtak kobles på når datalaget (S7) er klart.
          </p>
        </div>
      ) : (
        <p className="lede calm">
          Tallene bygger på publiserte 2026-budsjetter, Lovdata-vedtak og primærkilder listet i prosjektets kildemanifest.
        </p>
      )}

      <section>
        <h2>Primærkilder (planlagt)</h2>
        <ul>
          <li>
            <a href="https://www.stortinget.no/no/Saker-og-publikasjoner/Statsbudsjettet/statsbudsjettet-2026/alternative-statsbudsjetter/" rel="noopener noreferrer">
              Stortingets alternative statsbudsjetter 2026
            </a>
          </li>
          <li>
            <a href="https://www.regjeringen.no/no/dokumenter/prop.-1-ls-20252026/id3124192/" rel="noopener noreferrer">
              Prop. 1 LS (2025–2026) Skatter og avgifter
            </a>
          </li>
          <li>Skatteetatens satser og regler for 2026</li>
          <li>SSB forbruksundersøkelse (tabell 14100)</li>
          <li>NAV og Lånekassen for relevante ytelser</li>
        </ul>
      </section>

      <section>
        <h2>Datastatus</h2>
        <p>
          Full tabell per parti og kategori finnes i <code>DATA_STATUS.md</code> i repoet og oppdateres automatisk når partidata er avstemt.
        </p>
      </section>

      <p><Link href="/">Tilbake til kalkulatoren</Link></p>
    </article>
  );
}
