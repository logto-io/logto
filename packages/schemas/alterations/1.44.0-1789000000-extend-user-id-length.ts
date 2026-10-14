import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * Widen `users.id` and every column that references it to varchar(128).
 *
 * Users migrated from other identity providers may carry over their original IDs, which are
 * often longer than the 12 or 21 characters previously allowed.
 */

type Column = [table: string, column: string, originalLength: 12 | 21];

const columns: Column[] = [
  ['users', 'id', 12],
  ['user_sign_in_countries', 'user_id', 12],
  ['user_geo_locations', 'user_id', 12],
  ['trusted_devices', 'user_id', 12],
  ['user_sso_identities', 'user_id', 12],
  ['oidc_session_extensions', 'account_id', 12],
  ['users_roles', 'user_id', 21],
  ['organization_user_relations', 'user_id', 21],
  ['organization_role_user_relations', 'user_id', 21],
  ['organization_invitations', 'inviter_id', 21],
  ['organization_invitations', 'accepted_user_id', 21],
  ['subject_tokens', 'user_id', 21],
  ['verification_statuses', 'user_id', 21],
  ['verification_records', 'user_id', 21],
  ['secrets', 'user_id', 21],
  ['personal_access_tokens', 'user_id', 21],
  ['application_access_control_user_relations', 'user_id', 21],
  ['application_user_consent_organizations', 'user_id', 21],
  ['cimd_grant_organizations', 'user_id', 21],
  ['daily_active_users', 'user_id', 21],
  ['aggregated_daily_active_users', 'user_id', 21],
];

const alteration: AlterationScript = {
  up: async (pool) => {
    for (const [table, column] of columns) {
      // eslint-disable-next-line no-await-in-loop -- DDL statements must run sequentially
      await pool.query(sql`
        alter table ${sql.identifier([table])}
        alter column ${sql.identifier([column])} type varchar(128)
      `);
    }
  },
  down: async (pool) => {
    // Shrinking fails if any existing value is longer than the original limit; there is no
    // safe way to truncate an ID, so let Postgres reject the rollback in that case.
    for (const [table, column, originalLength] of columns) {
      // eslint-disable-next-line no-await-in-loop -- DDL statements must run sequentially
      await pool.query(sql`
        alter table ${sql.identifier([table])}
        alter column ${sql.identifier([column])} type varchar(${sql.raw(String(originalLength))})
      `);
    }
  },
};

export default alteration;
