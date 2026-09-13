import type { SourceManifestEntry } from '../content/manifest.ts';
import { MANIFEST_STATUS_LABELS } from '../utils/status-labels.ts';

interface SourceManifestSectionProps {
  title: string;
  entries: readonly SourceManifestEntry[];
  emptyMessage?: string;
}

function formatRetrieved(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('nb-NO', { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

export function SourceManifestSection({ title, entries, emptyMessage }: SourceManifestSectionProps) {
  if (entries.length === 0) {
    return emptyMessage ? (
      <section>
        <h2>{title}</h2>
        <p className="muted">{emptyMessage}</p>
      </section>
    ) : null;
  }

  return (
    <section>
      <h2>{title}</h2>
      <ul className="source-list">
        {entries.map((entry) => (
          <li key={entry.id} className={`source-list__item source-list__item--${entry.status}`}>
            <div className="source-list__head">
              <h3 className="source-list__title">
                {entry.url ? (
                  <a href={entry.url} rel="noopener noreferrer">
                    {entry.title}
                  </a>
                ) : (
                  entry.title
                )}
              </h3>
              <span className="source-list__meta">
                {entry.publisher} · {MANIFEST_STATUS_LABELS[entry.status]} · hentet {formatRetrieved(entry.retrievedAt)}
                {entry.pages ? ` · ${entry.pages} s.` : ''}
              </span>
            </div>
            {entry.note ? <p className="source-list__note">{entry.note}</p> : null}
            {entry.summaryTablePages && entry.summaryTablePages.length > 0 ? (
              <p className="source-list__pages muted">
                Oppsummeringstabeller: s. {entry.summaryTablePages.join(', ')}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
