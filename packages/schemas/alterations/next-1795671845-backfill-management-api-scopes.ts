import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';
import {
  backfillManagementApiScopes,
  revertManagementApiScopes,
  verifyManagementApiScopes,
} from './utils/1795671845-backfill-management-api-scopes.js';

/** Backfill the 30 built-in Phase 1 Management API scopes for all existing non-admin tenants. */
const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, backfillManagementApiScopes);
  },
  up: async (connection) => {
    await verifyManagementApiScopes(connection);
  },
  down: async (connection) => {
    await revertManagementApiScopes(connection);
  },
};

export default alteration;
