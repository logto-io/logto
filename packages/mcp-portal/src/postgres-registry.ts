import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import {
  DuplicateUpstreamError,
  type NewUpstream,
  type Upstream,
  type UpstreamStore,
} from './registry.js';

type UpstreamRow = {
  ownerSub: string;
  name: string;
  url: string;
  /** Slonik returns timestamptz as a string by default; a Date is accepted too. */
  createdAt: Date | string;
};

const toUpstream = ({ ownerSub, name, url, createdAt }: UpstreamRow): Upstream => ({
  ownerSub,
  name,
  url,
  createdAt: new Date(createdAt).toISOString(),
});

/**
 * Creates the upstreams table if it does not exist. Idempotent, so it runs on every startup.
 * The name check mirrors `upstreamNamePattern` so the database rejects bad names too.
 */
export const migratePostgresUpstreams = async (pool: CommonQueryMethods): Promise<void> => {
  await pool.query(sql`
    create table if not exists mcp_portal_upstreams (
      owner_sub text not null,
      name text not null,
      url text not null,
      created_at timestamptz not null default now(),
      primary key (owner_sub, name),
      constraint mcp_portal_upstreams_name_format check (name ~ '^[a-z][a-z0-9-]{0,31}$')
    )
  `);
};

/** Upstream store backed by Postgres. Safe to share across portal instances. */
export class PostgresUpstreamStore implements UpstreamStore {
  constructor(private readonly pool: CommonQueryMethods) {}

  async listForOwner(ownerSub: string): Promise<Upstream[]> {
    const rows = await this.pool.any<UpstreamRow>(sql`
      select owner_sub as "ownerSub", name, url, created_at as "createdAt"
      from mcp_portal_upstreams
      where owner_sub = ${ownerSub}
      order by name
    `);

    return rows.map((row) => toUpstream(row));
  }

  async findForOwner(ownerSub: string, name: string): Promise<Upstream | undefined> {
    const row = await this.pool.maybeOne<UpstreamRow>(sql`
      select owner_sub as "ownerSub", name, url, created_at as "createdAt"
      from mcp_portal_upstreams
      where owner_sub = ${ownerSub} and name = ${name}
    `);

    return row ? toUpstream(row) : undefined;
  }

  async add({ ownerSub, name, url }: NewUpstream): Promise<Upstream> {
    // ON CONFLICT DO NOTHING returns no row for a duplicate, which avoids inspecting driver errors.
    const row = await this.pool.maybeOne<UpstreamRow>(sql`
      insert into mcp_portal_upstreams (owner_sub, name, url)
      values (${ownerSub}, ${name}, ${url})
      on conflict (owner_sub, name) do nothing
      returning owner_sub as "ownerSub", name, url, created_at as "createdAt"
    `);

    if (!row) {
      throw new DuplicateUpstreamError(`Upstream "${name}" already exists`);
    }

    return toUpstream(row);
  }

  async remove(ownerSub: string, name: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(sql`
      delete from mcp_portal_upstreams
      where owner_sub = ${ownerSub} and name = ${name}
    `);

    return rowCount > 0;
  }
}
