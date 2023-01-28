import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table oidc_model_instances
        drop constraint oidc_model_instances_pkey,
        add primary key (id);
    `);

    await pool.query(sql`
      create index oidc_model_instances__model_name_id
        on oidc_model_instances (model_name, id);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`drop index oidc_model_instances__model_name_id;`);
    await pool.query(sql`
      alter table oidc_model_instances
        drop constraint oidc_model_instances_pkey,
        add primary key (model_name, id);
    `);
  },
};

export default alteration;
