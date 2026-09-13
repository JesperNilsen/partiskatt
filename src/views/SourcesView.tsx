import { Link } from 'wouter';
import { DataStatusTable } from '../components/DataStatusTable.tsx';
import { DocDataBanner } from '../components/DocDataBanner.tsx';
import { SourceManifestSection } from '../components/SourceManifestSection.tsx';
import { groupManifest, SOURCE_MANIFEST } from '../content/manifest.ts';
import { useApp } from '../state/app.tsx';

const PRIMARY_LINKS = [
  {
    href: 'https://www.stortinget.no/no/Saker-og-publikasjoner/Statsbudsjettet/statsbudsjettet-2026/alternative-statsbudsjetter/',
    label: 'Stortingets alternative statsbudsjetter 2026',
  },
  {
    href: 'https://www.stortinget.no/no/Saker-og-publikasjoner/Statsbudsjettet/statsbudsjettet-2026/',
    label: 'Statsbudsjettet 2026 (saldert budsjett og vedtak)',
  },
  {
    href: 'https://www.regjeringen.no/no/dokumenter/prop.-1-ls-20252026/id3124192/',
    label: 'Prop. 1 LS (2025–2026) Skatter og avgifter',
  },
  {
    href: 'https://www.skatteetaten.no/satser/',
    label: 'Skatteetatens satser og regler',
  },
  {
    href: 'https://data.ssb.no/api/v0/no/table/14100',
    label: 'SSB forbruksundersøkelse (tabell 14100)',
  },
] as const;

export function SourcesView() {
  const { data, dataLoading, dataError } = useApp();
  const groups = groupManifest(SOURCE_MANIFEST);
  const provisional = data?.kind === 'provisional';
  const manifestFailed = SOURCE_MANIFEST.length === 0;

  return (
    <article className="doc-page">
      <DocDataBanner />

      <header className="doc-page__header">
        <h1>Kilder</h1>
        {dataLoading ? (
          <p className="lede calm" role="status">Laster datastatus …</p>
        ) : dataError && !data ? (
          <p className="lede calm" role="alert">
            Regelsettet kunne ikke lastes, men kildelisten under er uavhengig av beregningen.
          </p>
        ) : provisional ? (
          <p className="lede calm">
            Primærkildene er arkivert i prosjektet (se listen under). Tallene i kalkulatoren er fortsatt{' '}
            <strong>demotall</strong> til partidata er avstemt og koblet på.
          </p>
        ) : (
          <p className="lede calm">
            Tallene bygger på de vedtatte 2026-reglene, Lovdata-vedtak og partienes alternative statsbudsjetter listet
            nedenfor. Alle kodede endringer er merket <strong>anslått</strong> — ingen er bekreftet mot primærkilde
            ennå.
          </p>
        )}
      </header>

      <section>
        <h2>Primærkilder</h2>
        <ul>
          {PRIMARY_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} rel="noopener noreferrer">{link.label}</a>
            </li>
          ))}
          <li>NAV og Lånekassen for relevante student- og familieytelser</li>
        </ul>
        <p className="muted">
          Sekundærkilder kan brukes til å finne frem, men ikke som eneste dokumentasjon når en primærkilde finnes.
        </p>
      </section>

      <section>
        <h2>Arkiverte dokumenter</h2>
        {manifestFailed ? (
          <div className="banner banner--error" role="alert">
            <p><strong>Kildemanifestet er tomt.</strong> Forventet fil: <code>sources/manifest.json</code>.</p>
          </div>
        ) : (
          <>
            <SourceManifestSection
              title="Referanse og regelverk"
              entries={groups.baseline}
            />
            <SourceManifestSection
              title="Alternative statsbudsjetter 2026"
              entries={groups.partyBudgets}
            />
            <SourceManifestSection
              title="Blokkerte eller utilgjengelige kilder"
              entries={groups.blocked}
              emptyMessage="Ingen blokkerte kilder i manifestet."
            />
          </>
        )}
      </section>

      <section>
        <h2>Datastatus</h2>
        <p>
          Tabellen viser om hvert parti og hver beregningskategori er kontrollert. Bare{' '}
          <strong>bekreftet</strong> og <strong>anslått</strong> inngår i hovedtallet i kalkulatoren.
        </p>
        {dataLoading ? (
          <p className="loading-inline" role="status">Laster …</p>
        ) : (
          <DataStatusTable provisional={provisional || !data} />
        )}
        <p className="muted">
          Maskinlesbar versjon: <code>DATA_STATUS.md</code> i repoet (genereres av{' '}
          <code>scripts/gen-data-status.ts</code> fra <code>src/data/</code>).
        </p>
      </section>

      <nav className="doc-page__nav" aria-label="Relaterte sider">
        <Link href="/metode">Les metode</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/rettelseslogg">Rettelseslogg</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/">Tilbake til kalkulatoren</Link>
      </nav>
    </article>
  );
}
