import { PARTY_META } from '../config/parties.ts';
import { DATA_STATUS_CATEGORIES, buildDataStatusTable } from '../data/data-status.ts';
import type { PartyId } from '../types/index.ts';
import { PARTY_IDS } from '../types/index.ts';
import { DATA_STATUS_HINTS } from '../utils/status-labels.ts';
import { StatusBadge } from './StatusBadge.tsx';

const DATA_STATUS_TABLE = buildDataStatusTable();

export function DataStatusTable() {
  const table = DATA_STATUS_TABLE;

  return (
    <div className="data-status">
        <p className="data-status__note muted">
          Tabellen speiler <code>DATA_STATUS.md</code> (generert fra <code>src/data/</code>). Ingen kategori er
          bekreftet ennå — kodede endringer er merket anslått eller uavklart.
        </p>

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
                    <StatusBadge status={table[id][cat.id]} />
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
