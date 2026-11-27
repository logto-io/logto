import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';
import { backfillOidcModelInstanceKeys } from './utils/1795399551-backfill-oidc-model-instance-keys.js';

/** Fill the `payload_*` key columns of live `oidc_model_instances` rows written before their trigger existed. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, backfillOidcModelInstanceKeys);
  },
  up: async () => {
    /** Batches commit one by one, so the fill cannot run in this transaction. */
  },
  down: async () => {
    /** Filled columns match the trigger's output, so there is nothing to revert. */
  },
};

export default alteration;
