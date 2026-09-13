import { Link } from 'wouter';
import { CORRECTIONS } from '../content/corrections.ts';
import { DocDataBanner } from '../components/DocDataBanner.tsx';
import { BRAND } from '../config/brand.ts';

export function CorrectionsView() {
  const hasEntries = CORRECTIONS.length > 0;

  return (
    <article className="doc-page">
      <DocDataBanner />

      <header className="doc-page__header">
        <h1>Rettelseslogg</h1>
        <p className="lede calm">
          Offentlig logg over feil som er meldt inn og rettet i {BRAND.name}. Nyeste øverst.
        </p>
      </header>

      {hasEntries ? (
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Rettelseslogg">
          <table className="doc-table corrections-table">
            <caption className="visually-hidden">Publiserte rettelser</caption>
            <thead>
              <tr>
                <th scope="col">Dato</th>
                <th scope="col">Hva var feil</th>
                <th scope="col">Hva ble endret</th>
                <th scope="col">Kilde/verifikasjon</th>
              </tr>
            </thead>
            <tbody>
              {CORRECTIONS.map((entry) => (
                <tr key={`${entry.date}-${entry.whatWasWrong}`}>
                  <td>{entry.date}</td>
                  <td>{entry.whatWasWrong}</td>
                  <td>{entry.whatChanged}</td>
                  <td>{entry.verification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <section className="empty-state empty-state--doc" aria-labelledby="corrections-empty-title">
          <h2 id="corrections-empty-title">Ingen rettelser ennå</h2>
          <p>
            Vi har ikke publisert noen rettelser. Loggen oppdateres når feil er verifisert og fikset i koden eller
            datasettet.
          </p>
          <p>
            <a href={BRAND.feedbackMailto} className="btn btn--primary">Meld en feil</a>
          </p>
        </section>
      )}

      <section>
        <h2>Hvordan vi håndterer feil</h2>
        <ul>
          <li>Feil i beregningsregler eller kildetolkning rettes i repoet og logges her med dato og kort forklaring.</li>
          <li>Store endringer som påvirker resultater merkes også i kalkulatorens beta-banner inntil neste deploy.</li>
          <li>Små avvik i individuelle skatteberegninger er forventet — se <Link href="/metode">metode</Link> for avgrensninger.</li>
        </ul>
      </section>

      <nav className="doc-page__nav" aria-label="Relaterte sider">
        <Link href="/metode">Les metode</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/kilder">Se kilder</Link>
        <span aria-hidden="true"> · </span>
        <Link href="/">Tilbake til kalkulatoren</Link>
      </nav>
    </article>
  );
}
