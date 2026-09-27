import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { DataBanner } from '../components/DataBanner.tsx';
import { HeadlineVerdict } from '../components/HeadlineVerdict.tsx';
import { PartyCard } from '../components/PartyCard.tsx';
import { useApp } from '../state/app.tsx';
import { hasNoIncome } from '../state/profile.ts';
import { toggleEffects, toggleSummary } from '../state/toggle-effects.ts';
import type { PartyId } from '../types/index.ts';

export function ResultsView() {
  const [, navigate] = useLocation();
  const { data, dataLoading, dataError, results, submitted, recalculate, toggles, profile } = useApp();
  const [expanded, setExpanded] = useState<PartyId | null>(null);

  useEffect(() => {
    if (!submitted) {
      navigate('/');
      return;
    }
    if (!dataLoading && data) recalculate();
  }, [submitted, dataLoading, data, recalculate, navigate, profile, toggles]);

  if (!submitted) {
    return (
      <section className="empty-state">
        <h1>Ingen beregning ennå</h1>
        <p>Fyll inn situasjonen din i kalkulatoren og trykk «Se resultat».</p>
        <Link href="/" className="btn btn--primary">Til kalkulatoren</Link>
      </section>
    );
  }

  if (dataLoading) {
    return (
      <>
        <DataBanner data={data} loading={dataLoading} error={dataError} />
        <section className="loading-state" role="status" aria-live="polite">
          <h1>Beregner …</h1>
          <p>Laster regelsett og regner ut alle ni partier.</p>
        </section>
      </>
    );
  }

  if (!data || !results) {
    return (
      <>
        <DataBanner data={data} loading={false} error={dataError} />
        <section className="error-state" role="alert">
          <h1>Kunne ikke beregne</h1>
          <p>{dataError ?? 'Regelsettet er ikke tilgjengelig.'}</p>
          <Link href="/" className="btn btn--primary">Tilbake til inndata</Link>
        </section>
      </>
    );
  }

  const top = results[0];

  return (
    <>
      <DataBanner data={data} loading={false} error={dataError} />

      {hasNoIncome(profile) ? (
        <div className="banner banner--notice" role="status">
          <p>Ingen inntekt lagt inn: tallene viser bare avgifter, ytelser og eventuell formuesskatt.</p>
        </div>
      ) : null}

      <div className="results-toolbar">
        <Link href="/" className="btn btn--ghost">Endre inndata</Link>
      </div>

      {top ? <HeadlineVerdict top={top} /> : null}

      <section className="results-list" aria-label="Alle partier rangert">
        <h2 className="results-list__title">Alle ni partier</h2>
        <p className="results-list__sub">Sortert etter mest penger igjen per år mot det vedtatte 2026-systemet.</p>
        <p className="results-list__sub">
          Forslag partiene ikke har tallfestet er ikke med i rangeringen; chipen på partikortet viser hvor mange.
        </p>
        <ol className="party-list">
          {results.map((result, i) => (
            <li key={result.party}>
              <PartyCard
                result={result}
                rank={i + 1}
               
                expanded={expanded === result.party}
                onToggle={() => setExpanded((cur) => (cur === result.party ? null : result.party))}
              />
            </li>
          ))}
        </ol>
      </section>

      <section className="card card--calm">
        <h2>Kilder og antagelser</h2>
        <p>
          Hovedtallet består av direkte skatt, moms/særavgifter og direkte kontantytelser.{' '}
          {toggleSummary(toggleEffects(data.bundle), toggles)}
        </p>
        <p>
          <Link href="/metode">Les metode</Link> · <Link href="/kilder">Se kilder</Link> ·{' '}
          <Link href="/rettelseslogg">Rettelseslogg</Link>
        </p>
      </section>
    </>
  );
}
