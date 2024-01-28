import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table organization_invitation_role_relations
        rename column invitation_id to organization_invitation_id;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organization_invitation_role_relations
        rename column organization_invitation_id to invitation_id;
    `);
  },
};

export default alteration;
