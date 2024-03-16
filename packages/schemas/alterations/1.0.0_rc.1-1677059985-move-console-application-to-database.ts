import { generateStandardId } from '@logto/shared/universal';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      insert into applications (
        tenant_id,
        id,
        name,
        secret,
        description,
        type,
        oidc_client_metadata
      ) values (
        'admin',
        'admin-console',
        'Admin Console',
        ${generateStandardId()},
        'Logto Admin Console.',
        'SPA',
        '{ "redirectUris": [], "postLogoutRedirectUris": [] }'::jsonb
      );
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from applications
        where tenant_id = 'admin'
        and id = 'admin-console';
    `);
  },
};

export default alteration;
