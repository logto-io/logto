import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { DuplicatePortalError, type NewPortal, type Portal, type PortalStore } from './portals.js';

type PortalRow = {
  id: string;
  name: string;
  hostname: string;
  organizationIds: string[];
  /** Slonik returns timestamptz as a string by default; a Date is accepted too. */
  createdAt: Date | string;
};

const toPortal = ({ id, name, hostname, createdAt, organizationIds }: PortalRow): Portal => ({
  id,
  name,
  hostname,
  createdAt: new Date(createdAt).toISOString(),
  organizationIds,
});

/** Creates the portals table if it does not exist. Idempotent, so it runs on every startup. */
export const migratePostgresPortals = async (pool: CommonQueryMethods): Promise<void> => {
  await pool.query(sql`
    create table if not exists mcp_portals (
      id uuid primary key,
      name text not null,
      hostname text not null unique,
      created_at timestamptz not null default now()
    )
  `);
  await pool.query(sql`
    alter table mcp_portals
      add column if not exists organization_ids text[] not null default '{}'
  `);
};

const selectColumns = sql`
  id,
  name,
  hostname,
  created_at as "createdAt",
  organization_ids as "organizationIds"
`;

/** Portal store backed by Postgres. Safe to share across portal instances. */
export class PostgresPortalStore implements PortalStore {
  constructor(private readonly pool: CommonQueryMethods) {}

  async list(): Promise<Portal[]> {
    const rows = await this.pool.any<PortalRow>(sql`
      select ${selectColumns} from mcp_portals order by created_at
    `);

    return rows.map((row) => toPortal(row));
  }

  async findByHostname(hostname: string): Promise<Portal | undefined> {
    const row = await this.pool.maybeOne<PortalRow>(sql`
      select ${selectColumns} from mcp_portals where hostname = ${hostname}
    `);

    return row ? toPortal(row) : undefined;
  }

  async findById(id: string): Promise<Portal | undefined> {
    const row = await this.pool.maybeOne<PortalRow>(sql`
      select ${selectColumns} from mcp_portals where id = ${id}
    `);

    return row ? toPortal(row) : undefined;
  }

  async add({ name, hostname }: NewPortal): Promise<Portal> {
    // ON CONFLICT DO NOTHING returns no row for a taken hostname, which avoids inspecting driver errors.
    const row = await this.pool.maybeOne<PortalRow>(sql`
      insert into mcp_portals (id, name, hostname)
      values (gen_random_uuid(), ${name}, ${hostname})
      on conflict (hostname) do nothing
      returning ${selectColumns}
    `);

    if (!row) {
      throw new DuplicatePortalError(`Portal "${hostname}" already exists`);
    }

    return toPortal(row);
  }

  async setOrganizations(id: string, organizationIds: string[]): Promise<Portal | undefined> {
    const row = await this.pool.maybeOne<PortalRow>(sql`
      update mcp_portals
      set organization_ids = ${sql.array(organizationIds, 'text')}
      where id = ${id}
      returning ${selectColumns}
    `);

    return row ? toPortal(row) : undefined;
  }

  async remove(id: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(sql`
      delete from mcp_portals where id = ${id}
    `);

    return rowCount > 0;
  }
}
