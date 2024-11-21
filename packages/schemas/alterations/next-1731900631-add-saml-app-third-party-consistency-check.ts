import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table applications
        add constraint check_saml_app_third_party_consistency
          check (type != 'SAML' OR (type = 'SAML' AND is_third_party = true));
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table applications drop constraint check_saml_app_third_party_consistency;
    `);
  },
};

export default alteration;
