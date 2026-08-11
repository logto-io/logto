import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Tighten the `cimd_grant_organizations` primary key to `(tenant_id, grant_id)` so the schema
 * itself enforces the at-most-one-organization-per-grant invariant that token issuance relies on,
 * instead of leaving it to the consent flow's composition. The table is dev-feature-gated and
 * empty in every environment, so swapping the constraint needs no data migration.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table cimd_grant_organizations
        drop constraint cimd_grant_organizations_pkey,
        add primary key (tenant_id, grant_id);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table cimd_grant_organizations
        drop constraint cimd_grant_organizations_pkey,
        add primary key (tenant_id, grant_id, organization_id);
    `);
  },
};

export default alteration;
