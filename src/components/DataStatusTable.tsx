import { PARTY_META } from '../config/parties.ts';
import { DATA_STATUS_CATEGORIES, DATA_STATUS_SNAPSHOT } from '../content/data-status-snapshot.ts';
import type { PartyId } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';
import { DATA_STATUS_HINTS } from '../utils/status-labels.ts';
import { StatusBadge } from './StatusBadge.tsx';

interface DataStatusTableProps {
  /** When true, show a note that the table is provisional until S7 lands. */
  provisional?: boolean;
}

export function DataStatusTable({ provisional = false }: DataStatusTableProps) {
  return (
    <div className="data-status">
      {provisional ? (
        <p className="data-status__note muted">
          Tabellen speiler <code>DATA_STATUS.md</code> per {new Date().toLocaleDateString('nb-NO')}. Ingen kategori er
          kontrollert ennå — alt er merket «ikke gjennomgått» til partidata er avstemt (S7).
        </p>
      ) : null}

      <div className="table-scroll" tabIndex={0} role="region" aria-label="Datastatus per parti og kategori">
        <table className="doc-table data-status__table">
          <caption className="visually-hidden">Dekning per parti og beregningskategori</caption>
          <thead>
            <tr>
              <th scope="col">Parti</th>
              {DATA_STATUS_CATEGORIES.map((cat) => (
                <th key={cat.id} scope="col">{cat.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARTY_IDS.map((id: PartyId) => (
              <tr key={id}>
                <th scope="row">{PARTY_META[id].shortName}</th>
                {DATA_STATUS_CATEGORIES.map((cat) => (
                  <td key={cat.id}>
                    <StatusBadge status={DATA_STATUS_SNAPSHOT[id][cat.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="status-legend">
        <summary>Forklaring av statuser</summary>
        <ul>
          {(['confirmed', 'estimated', 'unquantified', 'not-applicable', 'not-reviewed'] as const).map((status) => (
            <li key={status}>
              <StatusBadge status={status} /> — {DATA_STATUS_HINTS[status]}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
