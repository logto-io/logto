import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// Logto requires row-level security on every business table, so the MCP portal tables are scoped
// to their tenant the same way as the rest of the tenant data. The trigger sets tenant_id on insert,
// and the restrictive policy only lets the tenant's own database user see its rows.
const mcpPortalTables = ['mcp_portals', 'mcp_portal_upstreams'];

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = sql.identifier([`logto_tenant_${database}`]);

    for (const table of mcpPortalTables) {
      const tableId = sql.identifier([table]);

      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        alter table ${tableId}
          add column tenant_id varchar(21) not null
            references tenants (id) on update cascade on delete cascade;

        create index ${sql.identifier([`${table}__tenant_id`])}
          on ${tableId} (tenant_id);

        create trigger set_tenant_id before insert on ${tableId}
          for each row execute procedure set_tenant_id();

        alter table ${tableId} enable row level security;

        create policy ${sql.identifier([`${table}_tenant_id`])} on ${tableId}
          as restrictive
          using (tenant_id = (select id from tenants where db_user = current_user));

        create policy ${sql.identifier([`${table}_modification`])} on ${tableId}
          using (true);

        grant select, insert, update, delete on ${tableId} to ${baseRoleId};
      `);
    }
  },
  down: async (pool) => {
    for (const table of mcpPortalTables) {
      const tableId = sql.identifier([table]);

      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        drop policy if exists ${sql.identifier([`${table}_modification`])} on ${tableId};
        drop policy if exists ${sql.identifier([`${table}_tenant_id`])} on ${tableId};
        alter table ${tableId} disable row level security;
        drop trigger if exists set_tenant_id on ${tableId};
        drop index if exists ${sql.identifier([`${table}__tenant_id`])};
        alter table ${tableId} drop column if exists tenant_id;
      `);
    }
  },
};

export default alteration;
