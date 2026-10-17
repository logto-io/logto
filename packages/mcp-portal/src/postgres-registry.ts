import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import {
  DuplicateUpstreamError,
  type NewUpstream,
  type Upstream,
  type UpstreamPatch,
  type UpstreamStore,
} from './registry.js';

type UpstreamRow = {
  portalId: string;
  name: string;
  url: string;
  enabled: boolean;
  disabledTools: string[];
  organizationIds: string[];
  hasCredential: boolean;
  /** Slonik returns timestamptz as a string by default; a Date is accepted too. */
  createdAt: Date | string;
};

const toUpstream = ({
  portalId,
  name,
  url,
  enabled,
  disabledTools,
  organizationIds,
  hasCredential,
  createdAt,
}: UpstreamRow): Upstream => ({
  portalId,
  name,
  url,
  enabled,
  disabledTools,
  organizationIds,
  hasCredential,
  createdAt: new Date(createdAt).toISOString(),
});

/**
 * Creates the upstreams table if it does not exist, and adds the per-server switches to tables
 * created before they existed. Idempotent, so it runs on every startup. The name check mirrors
 * `upstreamNamePattern` so the database rejects bad names too.
 */
export const migratePostgresUpstreams = async (pool: CommonQueryMethods): Promise<void> => {
  // Upstreams used to belong to an admin (owner_sub). They now belong to a portal, so the column is
  // renamed in place. Rows keep their data, and the primary key follows the rename.
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
      primary key (portal_id, name),
      constraint mcp_portal_upstreams_name_format check (name ~ '^[a-z][a-z0-9-]{0,31}$')
    )
  `);
  await pool.query(sql`
    alter table mcp_portal_upstreams
      add column if not exists enabled boolean not null default true,
      add column if not exists organization_ids text[] not null default '{}',
      add column if not exists disabled_tools text[] not null default '{}',
      add column if not exists credential_ciphertext text
  `);
};

const selectColumns = sql`
  portal_id as "portalId",
  name,
  url,
  enabled,
  disabled_tools as "disabledTools",
  organization_ids as "organizationIds",
  credential_ciphertext is not null as "hasCredential",
  created_at as "createdAt"
`;

/** Upstream store backed by Postgres. Safe to share across portal instances. */
export class PostgresUpstreamStore implements UpstreamStore {
  constructor(private readonly pool: CommonQueryMethods) {}

  async listForPortal(portalId: string): Promise<Upstream[]> {
    const rows = await this.pool.any<UpstreamRow>(sql`
      select ${selectColumns}
      from mcp_portal_upstreams
      where portal_id = ${portalId}
      order by name
    `);

    return rows.map((row) => toUpstream(row));
  }

  async findForPortal(portalId: string, name: string): Promise<Upstream | undefined> {
    const row = await this.pool.maybeOne<UpstreamRow>(sql`
      select ${selectColumns}
      from mcp_portal_upstreams
      where portal_id = ${portalId} and name = ${name}
    `);

    return row ? toUpstream(row) : undefined;
  }

  async add({ portalId, name, url }: NewUpstream): Promise<Upstream> {
    // ON CONFLICT DO NOTHING returns no row for a duplicate, which avoids inspecting driver errors.
    const row = await this.pool.maybeOne<UpstreamRow>(sql`
      insert into mcp_portal_upstreams (portal_id, name, url)
      values (${portalId}, ${name}, ${url})
      on conflict (portal_id, name) do nothing
      returning ${selectColumns}
    `);

    if (!row) {
      throw new DuplicateUpstreamError(`Upstream "${name}" already exists`);
    }

    return toUpstream(row);
  }

  async findCredential(portalId: string, name: string): Promise<string | undefined> {
    const row = await this.pool.maybeOne<{ credential?: string }>(sql`
      select credential_ciphertext as credential
      from mcp_portal_upstreams
      where portal_id = ${portalId} and name = ${name}
    `);

    return row?.credential ?? undefined;
  }

  async setCredential(portalId: string, name: string, ciphertext?: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(sql`
      update mcp_portal_upstreams
      set credential_ciphertext = ${ciphertext ?? null}
      where portal_id = ${portalId} and name = ${name}
    `);

    return rowCount > 0;
  }

  async remove(portalId: string, name: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(sql`
      delete from mcp_portal_upstreams
      where portal_id = ${portalId} and name = ${name}
    `);

    return rowCount > 0;
  }

  async update(
    portalId: string,
    name: string,
    patch: UpstreamPatch
  ): Promise<Upstream | undefined> {
    const current = await this.findForPortal(portalId, name);

    if (!current) {
      return undefined;
    }

    const next = { ...current, ...patch };
    const row = await this.pool.maybeOne<UpstreamRow>(sql`
      update mcp_portal_upstreams
      set enabled = ${next.enabled},
        disabled_tools = ${sql.array(next.disabledTools, 'text')},
        organization_ids = ${sql.array(next.organizationIds, 'text')}
      where portal_id = ${portalId} and name = ${name}
      returning ${selectColumns}
    `);

    return row ? toUpstream(row) : undefined;
  }
}
