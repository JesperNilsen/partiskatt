import { PARTY_META } from '../config/parties.ts';
import { Link } from 'wouter';
import type { PartyResult } from '../types/index.ts';
import { formatSignedKr } from '../utils/format.ts';
import { BreakdownBars } from './BreakdownBars.tsx';
import { partyRuleRows, sourceLine, type RuleRow } from './rule-provenance.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface PartyCardProps {
  result: PartyResult;
  rank: number;
  expanded?: boolean;
  onToggle?: () => void;
}

const GROUP_LABELS = {
  direct: 'Direkte skatt',
  consumption: 'Moms og særavgifter',
  benefit: 'Kontantytelser',
} as const;

function topReasons(result: PartyResult, limit = 3): string[] {
  return result.components
    .filter((c) => c.keptDelta !== 0)
    .sort((a, b) => Math.abs(b.keptDelta) - Math.abs(a.keptDelta))
    .slice(0, limit)
    .map((c) => `${c.label}: ${formatSignedKr(c.keptDelta)} kr`);
}

/** One rule: title, status as text, and the source document + page(s) from its provenance. */
function RuleProvenanceItem({ row }: { row: RuleRow }) {
  const src = row.provenance ? sourceLine(row.provenance) : null;
  return (
    <li className="rule-row">
      <div className="rule-row__head">
        <strong className="rule-row__title">{row.title}</strong> <StatusBadge status={row.status} />
        {row.uncertain ? <span className="rule-row__flag"> Usikkert</span> : null}
      </div>
      {row.effectiveNote ? <p className="rule-row__effective">{row.effectiveNote}</p> : null}
      {row.reason ? <p className="rule-row__reason">{row.reason}</p> : null}
      {src && row.provenance ? (
        <>
          <p className="rule-row__source">
            Kilde:{' '}
            <a href={src.url} rel="noopener noreferrer" title={src.fullTitle}>
              {src.title}
            </a>
            , <span className="rule-row__pages">{src.pages}</span>
          </p>
          <details className="rule-row__method">
            <summary>Slik er tallet hentet</summary>
            <p>{row.provenance.method}</p>
          </details>
        </>
      ) : (
        <p className="rule-row__source">Kilde mangler i datagrunnlaget.</p>
      )}
    </li>
  );
}

export function PartyCard({ result, rank, expanded = false, onToggle }: PartyCardProps) {
  const meta = PARTY_META[result.party];
  const gain = result.headline > 0;
  const loss = result.headline < 0;
  const neutral = result.headline === 0;
  const deltaCls = gain ? 'party-card--gain' : loss ? 'party-card--loss' : 'party-card--neutral';
  const isReference = meta.inGovernment && neutral;
  const rules = expanded ? partyRuleRows(result) : null;

  return (
    <article
      className={`party-card ${deltaCls}`}
      style={{ '--party-color': meta.color, '--party-on': meta.onColor } as React.CSSProperties}
      aria-labelledby={`party-${result.party}-name`}
    >
      <header className="party-card__header">
        <div className="party-card__rank" aria-hidden="true">{rank}</div>
        <div className="party-card__identity">
          <span className="party-card__swatch" aria-hidden="true" />
          <div>
            <h3 id={`party-${result.party}-name`} className="party-card__name">
              {meta.name}
              <span className="party-card__short"> ({meta.shortName})</span>
            </h3>
            {isReference ? (
              <p className="party-card__ref-note">
                Referanseparti — det vedtatte 2026-systemet er regjeringens politikk, så avviket er null per konstruksjon.
              </p>
            ) : null}
          </div>
        </div>
        <div className="party-card__amounts">
          <p className={`party-card__headline ${gain ? 'gain' : loss ? 'loss' : ''}`}>
            {formatSignedKr(result.headline)} <span className="party-card__unit">kr/år</span>
          </p>
          <p className="party-card__monthly">{formatSignedKr(result.monthly)} kr/mnd</p>
        </div>
      </header>

      <BreakdownBars byGroup={result.byGroup} />

      <dl className="party-card__groups">
        {(Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>).map((key) => (
          <div key={key} className="party-card__group-row">
            <dt>{GROUP_LABELS[key]}</dt>
            <dd className={result.byGroup[key] > 0 ? 'gain' : result.byGroup[key] < 0 ? 'loss' : ''}>
              {formatSignedKr(result.byGroup[key])} kr
            </dd>
          </div>
        ))}
      </dl>

      {result.employerDelta !== null ? (
        <p className="party-card__employer">
          Arbeidsgiveravgift, utvidet scenario (ikke med i tallet over): {formatSignedKr(result.employerDelta)} kr/år
        </p>
      ) : null}

      {onToggle ? (
        <button type="button" className="btn btn--ghost party-card__toggle" onClick={onToggle} aria-expanded={expanded}>
          {expanded ? 'Skjul detaljer' : 'Vis årsaker, kilder og utelatte forslag'}
        </button>
      ) : null}

      {rules ? (
        <div className="party-card__details">
          {topReasons(result).length > 0 ? (
            <section>
              <h4>Største årsaker</h4>
              <ul>
                {topReasons(result).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ) : (
            <p>Ingen beregnede endringer mot referansen.</p>
          )}
          {rules.applied.length > 0 ? (
            <section>
              <h4 id={`party-${result.party}-rules`}>Regelendringer i beregningen</h4>
              <ul className="rule-list" aria-labelledby={`party-${result.party}-rules`}>
                {rules.applied.map((row) => (
                  <RuleProvenanceItem key={row.key} row={row} />
                ))}
              </ul>
            </section>
          ) : null}
          {rules.excluded.length > 0 ? (
            <section>
              <h4 id={`party-${result.party}-excluded`}>Ikke medregnet i hovedtallet</h4>
              <ul className="rule-list excluded-list" aria-labelledby={`party-${result.party}-excluded`}>
                {rules.excluded.map((row) => (
                  <RuleProvenanceItem key={row.key} row={row} />
                ))}
              </ul>
            </section>
          ) : null}
          <p className="party-card__meta">
            {result.appliedRuleCount} regel{result.appliedRuleCount === 1 ? '' : 'er'} inngår i beregningen. Alle
            dokumentene og arkivstatus: <Link href="/kilder">Kilder</Link>.
          </p>
        </div>
      ) : null}
    </article>
  );
}
