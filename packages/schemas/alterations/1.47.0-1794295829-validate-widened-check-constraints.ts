import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { withoutStatementTimeout } from './utils/1792569975-statement-timeout.js';

/**
 * The tenant-id widening alteration re-added these check constraints as `not valid` to avoid
 * full-table validation scans under its exclusive locks. Validate them here: `validate
 * constraint` takes only a share-update-exclusive lock, so it runs without blocking writes.
 */
const constraints: Array<[table: string, constraint: string]> = [
  ['application_secrets', 'application_type'],
  [
    'application_access_control_user_role_relations',
    'application_access_control_user_role_relations__role_type',
  ],
  ['applications_roles', 'applications_roles__role_type'],
  ['organization_application_relations', 'application_type'],
  ['saml_application_configs', 'saml_application_configs__application_type'],
  ['saml_application_secrets', 'saml_application_secrets__application_type'],
  ['saml_application_sessions', 'saml_application_sessions__application_type'],
  ['sso_connector_idp_initiated_auth_configs', 'application_type'],
  ['users_roles', 'users_roles__role_type'],
];

const alteration: AlterationScript = {
  beforeUp: async (pool) => {
    await withoutStatementTimeout(pool, async (connection) => {
      for (const [table, constraint] of constraints) {
        // eslint-disable-next-line no-await-in-loop -- validations run sequentially
        await connection.query(sql`
          alter table ${sql.identifier([table])}
            validate constraint ${sql.identifier([constraint])};
        `);
      }
    });
  },
  up: async () => {
    /** Validation runs outside the transaction to keep it online. */
  },
  down: async () => {
    /** Constraint validity is not reverted; the widening alteration's down re-adds them. */
  },
};

export default alteration;
