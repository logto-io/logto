import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

// Tables for the MCP portal: the portals (hostnames), each portal's servers, and the switches and
// organization grants on both. Created here, not at runtime, because the tenant database user
// cannot create tables. The rename handles databases that got the earlier runtime-created table,
// where servers were keyed by owner_sub.
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table if not exists mcp_portals (
        id uuid primary key,
        name text not null,
        hostname text not null unique,
        created_at timestamptz not null default now(),
        organization_ids text[] not null default '{}'
      )
    `);

    await pool.query(sql`
      do $$
      begin
        if exists (
          select 1 from information_schema.columns
          where table_name = 'mcp_portal_upstreams' and column_name = 'owner_sub'
        ) then
          alter table mcp_portal_upstreams rename column owner_sub to portal_id;
        end if;
      end $$
    `);

    await pool.query(sql`
      create table if not exists mcp_portal_upstreams (
        portal_id text not null,
        name text not null,
        url text not null,
        created_at timestamptz not null default now(),
        enabled boolean not null default true,
        disabled_tools text[] not null default '{}',
        organization_ids text[] not null default '{}',
        primary key (portal_id, name),
        constraint mcp_portal_upstreams_name_format check (name ~ '^[a-z][a-z0-9-]{0,31}$')
      )
    `);

    // Tables created by the earlier runtime migration lack the newer columns.
    await pool.query(sql`
      alter table mcp_portal_upstreams
        add column if not exists enabled boolean not null default true,
        add column if not exists disabled_tools text[] not null default '{}',
        add column if not exists organization_ids text[] not null default '{}'
    `);
  },
  down: async (pool) => {
    await pool.query(sql`drop table if exists mcp_portal_upstreams`);
    await pool.query(sql`drop table if exists mcp_portals`);
  },
};

export default alteration;
