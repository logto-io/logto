import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';
import { backfillUsersLowerKeys } from './utils/1795421620-backfill-users-lower-keys.js';

/** Fill `primary_email_lower` and `username_lower` of users written before their trigger existed. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, backfillUsersLowerKeys);
  },
  up: async () => {
    /** Batches commit one by one, so the fill cannot run in this transaction. */
  },
  down: async () => {
    /** Filled columns match the trigger's output, so there is nothing to revert. */
  },
};

export default alteration;
