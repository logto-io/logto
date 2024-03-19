import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table oidc_model_instances
        drop constraint oidc_model_instances_pkey,
        add primary key (id),
        add constraint oidc_model_instances__model_name_id
          unique (model_name, id);
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table oidc_model_instances
        drop constraint oidc_model_instances_pkey,
        drop constraint oidc_model_instances__model_name_id,
        add primary key (model_name, id);
    `);
  },
};

export default alteration;
