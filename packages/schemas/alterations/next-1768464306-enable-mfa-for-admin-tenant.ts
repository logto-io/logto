import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

/**
 * Enable MFA (TOTP and WebAuthn) for the admin tenant with NoPrompt policy.
 * This allows users to optionally set up MFA via the account center.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      update sign_in_experiences
      set mfa = '{"factors":["Totp","WebAuthn","BackupCode"],"policy":"NoPrompt"}'::jsonb
      where tenant_id = ${adminTenantId}
        and id = 'default'
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      update sign_in_experiences
      set mfa = '{"factors":[],"policy":"UserControlled"}'::jsonb
      where tenant_id = ${adminTenantId}
        and id = 'default'
    `);
  },
};

export default alteration;
