import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create type organization_invitation_status as enum ('Pending', 'Accepted', 'Expired', 'Revoked');

      create table organization_invitations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The unique identifier of the invitation. */
        id varchar(21) not null,
        /** The user ID who sent the invitation. */
        inviter_id varchar(21) not null,
        /** The email address or other identifier of the invitee. */
        invitee varchar(256) not null,
        /** The user ID of who accepted the invitation. */
        accepted_user_id varchar(21)
          references users (id) on update cascade on delete cascade,
        /** The ID of the organization to which the invitee is invited. */
        organization_id varchar(21) not null,
        /** The status of the invitation. */
        status organization_invitation_status not null,
        /** The ID of the magic link that can be used to accept the invitation. */
        magic_link_id varchar(21)
          references magic_links (id) on update cascade on delete cascade,
        /** The time when the invitation was created. */
        created_at timestamptz not null default (now()),
        /** The time when the invitation status was last updated. */
        updated_at timestamptz not null default (now()),
        /** The time when the invitation expires. */
        expires_at timestamptz not null,
        primary key (id),
        foreign key (tenant_id, inviter_id, organization_id)
          references organization_user_relations (tenant_id, user_id, organization_id)
          on update cascade on delete cascade
      );

      -- Ensure there is only one pending invitation for a given invitee and organization.
      create unique index organization_invitations__invitee_organization_id
        on organization_invitations (tenant_id, invitee, organization_id)
        where status = 'Pending';
    `);
    await applyTableRls(pool, 'organization_invitations');

    await pool.query(sql`
      create table organization_invitation_role_relations (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        /** The ID of the invitation. */
        invitation_id varchar(21) not null
          references organization_invitations (id) on update cascade on delete cascade,
        /** The ID of the organization role. */
        organization_role_id varchar(21) not null
          references organization_roles (id) on update cascade on delete cascade,
        primary key (tenant_id, invitation_id, organization_role_id)
      );
    `);
    await applyTableRls(pool, 'organization_invitation_role_relations');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'organization_invitation_role_relations');
    await pool.query(sql`
      drop table organization_invitation_role_relations;
    `);
    await dropTableRls(pool, 'organization_invitations');
    await pool.query(sql`
      drop table organization_invitations;
      drop type organization_invitation_status;
    `);
  },
};

export default alteration;
