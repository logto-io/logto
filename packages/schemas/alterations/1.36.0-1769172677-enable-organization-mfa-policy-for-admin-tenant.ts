import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

/**
 * Enable organization required MFA policy for the admin tenant.
 * This allows tenant admins to require MFA for all tenant members
 * by setting `isMfaRequired: true` on the organization.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update sign_in_experiences
      set mfa = jsonb_set(mfa, '{organizationRequiredMfaPolicy}', '"Mandatory"')
      where tenant_id = ${adminTenantId}
        and id = 'default'
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      update sign_in_experiences
      set mfa = mfa - 'organizationRequiredMfaPolicy'
      where tenant_id = ${adminTenantId}
        and id = 'default'
    `);
  },
};

export default alteration;
