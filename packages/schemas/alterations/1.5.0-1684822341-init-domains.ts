import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

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
      create table domains (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        domain varchar(256) not null,
        status varchar(32) not null default('PendingVerification'),
        error_message varchar(1024),
        dns_records jsonb /* @use DomainDnsRecords */ not null default '[]'::jsonb,
        cloudflare_data jsonb /* @use CloudflareData */,
        updated_at timestamptz not null default(now()),
        created_at timestamptz not null default(now()),
        primary key (id),
        constraint domains__domain
          unique (domain)
      );

      create index domains__id on domains (tenant_id, id);

      create trigger set_tenant_id before insert on domains
        for each row execute procedure set_tenant_id();

      alter table domains enable row level security;

      create policy domains_tenant_id on domains
        as restrictive
        using (tenant_id = (select id from tenants where db_user = current_user));
      create policy domains_modification on domains
        using (true);

      grant select, insert, update, delete on domains to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop policy domains_tenant_id on domains;
      drop policy domains_modification on domains;

      alter table domains disable row level security;

      drop table domains;
    `);
  },
};

export default alteration;
