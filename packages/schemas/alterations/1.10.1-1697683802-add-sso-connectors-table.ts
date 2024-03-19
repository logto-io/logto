import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getId = (value: string) => sql.identifier([value]);

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = getId(`logto_tenant_${database}`);

    await pool.query(sql`
      create table sso_connectors (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(128) not null,
        provider_name varchar(128) not null,
        connector_name varchar(128) not null,
        config jsonb not null default '{}'::jsonb,
        domains jsonb not null default '[]'::jsonb,
        branding jsonb not null default '{}'::jsonb,
        sync_profile boolean not null default FALSE,
        sso_only boolean not null default FALSE,
        created_at timestamptz not null default(now()),
        primary key (id)
      );

      create index sso_connectors__id
        on sso_connectors (tenant_id, id);

      create index sso_connectors__id__provider_name
        on sso_connectors (tenant_id, id, provider_name);

      create trigger set_tenant_id before insert on sso_connectors
        for each row execute procedure set_tenant_id();

      alter table sso_connectors enable row level security;

      create policy sso_connectors_tenant_id on sso_connectors
        as restrictive
        using (tenant_id = (select id from tenants where db_user = current_user));

      create policy sso_connectors_modification on sso_connectors
        using (true);

      grant select, insert, update, delete on sso_connectors to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop policy sso_connectors_modification on sso_connectors;
      drop policy sso_connectors_tenant_id on sso_connectors;
      drop table sso_connectors;
    `);
  },
};

export default alteration;
