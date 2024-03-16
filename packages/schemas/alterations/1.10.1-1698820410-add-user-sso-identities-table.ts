import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getId = (value: string) => sql.identifier([value]);

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

/** The alteration script for adding `sso_identities` column to the users table. */
const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = getId(`logto_tenant_${database}`);

    await pool.query(sql`
      create table user_sso_identities (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        user_id varchar(12) not null
          references users (id) on update cascade on delete cascade,
        issuer varchar(256) not null,
        identity_id varchar(128) not null,
        detail jsonb not null default '{}'::jsonb,
        created_at timestamp not null default(now()),
        primary key (id),
        constraint user_sso_identities__issuer__identity_id
          unique (tenant_id, issuer, identity_id)
      );

      create trigger set_tenant_id before insert on user_sso_identities
        for each row execute procedure set_tenant_id();

      alter table user_sso_identities enable row level security;

      create policy user_sso_identities_tenant_id on user_sso_identities
        as restrictive
        using (tenant_id = (select id from tenants where db_user = current_user));

      create policy user_sso_identities_modification on user_sso_identities
        using (true);

      grant select, insert, update, delete on user_sso_identities to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop policy user_sso_identities_modification on user_sso_identities;
      drop policy user_sso_identities_tenant_id on user_sso_identities;
      drop table user_sso_identities;
    `);
  },
};

export default alteration;
