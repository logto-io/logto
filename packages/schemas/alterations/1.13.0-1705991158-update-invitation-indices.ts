import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * @fileoverview Separates the index (tenant_id, inviter_id, organization_id) to two indices. Also
 * makes the inviter_id nullable.
 */

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table organization_invitations
        drop constraint organization_invitations_tenant_id_inviter_id_organization_fkey,
        add foreign key (inviter_id) references users (id) on update cascade on delete cascade,
        add foreign key (organization_id) references organizations (id) on update cascade on delete cascade,
        alter column inviter_id drop not null;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table organization_invitations
        drop constraint organization_invitations_inviter_id_fkey,
        drop constraint organization_invitations_organization_id_fkey,
        add foreign key (tenant_id, inviter_id, organization_id) references organization_user_relations
          (tenant_id, user_id, organization_id) on update cascade on delete cascade,
        alter column inviter_id set not null;
    `);
  },
};

export default alteration;
