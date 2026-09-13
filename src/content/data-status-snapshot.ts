import {
  buildDataStatusTable,
  DATA_STATUS_CATEGORIES,
  partyColumnStatus,
  type DataStatusCategory,
  type PartyDataStatusRow,
} from '../data/data-status.ts';

export {
  buildDataStatusTable,
  DATA_STATUS_CATEGORIES,
  partyColumnStatus,
  type DataStatusCategory,
  type PartyDataStatusRow,
};

/** Live status table — same source as `DATA_STATUS.md` / `gen-data-status.ts`. */
export const DATA_STATUS_TABLE = buildDataStatusTable();
