import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum NameIdFormat {
  /** Uses unique and persistent identifiers for the user. */
  Persistent = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
}

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs
        add column encryption jsonb,
        add column name_id_format varchar(128);
    `);
    await pool.query(sql`
      update saml_application_configs
      set name_id_format = ${NameIdFormat.Persistent};
    `);
    await pool.query(sql`
      alter table saml_application_configs
        alter column name_id_format set not null;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table saml_application_configs
        drop column encryption,
        drop column name_id_format;
    `);
  },
};

export default alteration;
