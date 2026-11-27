import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';
import { backfillLogsKeys } from './utils/1795403636-backfill-logs-keys.js';

/** Fill the `payload_*` key columns of `logs` rows written before their trigger existed. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, backfillLogsKeys);
  },
  up: async () => {
    /** Batches commit one by one, so the fill cannot run in this transaction. */
  },
  down: async () => {
    /** Filled columns match the trigger's output, so there is nothing to revert. */
  },
};

export default alteration;
