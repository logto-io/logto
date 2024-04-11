import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table organization_invitation_role_relations
        rename column invitation_id to organization_invitation_id;
      alter table organization_invitation_role_relations
        rename constraint organization_invitation_role_relations_invitation_id_fkey to organization_invitation_role_re_organization_invitation_id_fkey;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organization_invitation_role_relations
        rename column organization_invitation_id to invitation_id;
        alter table organization_invitation_role_relations
        rename constraint organization_invitation_role_re_organization_invitation_id_fkey to organization_invitation_role_relations_invitation_id_fkey;
    `);
  },
};

export default alteration;
