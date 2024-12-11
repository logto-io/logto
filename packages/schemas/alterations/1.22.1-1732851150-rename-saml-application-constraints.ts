import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs 
        rename constraint application_type 
        to saml_application_configs__application_type;
    `);

    await pool.query(sql`
      alter table saml_application_secrets
        rename constraint application_type 
        to saml_application_secrets__application_type;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs 
        rename constraint saml_application_configs__application_type 
        to application_type;
    `);

    await pool.query(sql`
      alter table saml_application_secrets
        rename constraint saml_application_secrets__application_type 
        to application_type;
    `);
  },
};

export default alteration;
