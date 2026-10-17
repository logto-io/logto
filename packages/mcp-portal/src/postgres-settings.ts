import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { hostnamePattern } from './portals.js';

export type PortalSettings = {
  /** The domain portal hostnames are created under, e.g. mcp.example.com. Unset until an admin sets it. */
  baseDomain?: string;
};

export type PortalSettingsStore = {
  get: () => Promise<PortalSettings>;
  setBaseDomain: (baseDomain: string) => Promise<PortalSettings>;
};

/** Settings store backed by the tenant's database. There is one row for the tenant. */
export class PostgresPortalSettingsStore implements PortalSettingsStore {
  constructor(private readonly pool: CommonQueryMethods) {}

  async get(): Promise<PortalSettings> {
    const row = await this.pool.maybeOne<{ baseDomain?: string }>(sql`
      select base_domain as "baseDomain" from mcp_portal_settings where id = 'default'
    `);

    return row?.baseDomain ? { baseDomain: row.baseDomain } : {};
  }

  async setBaseDomain(baseDomain: string): Promise<PortalSettings> {
    if (!hostnamePattern.test(baseDomain)) {
      throw new Error('Base domain must be a valid hostname');
    }

    await this.pool.query(sql`
      insert into mcp_portal_settings (id, base_domain)
      values ('default', ${baseDomain})
      on conflict (tenant_id, id) do update set base_domain = excluded.base_domain
    `);

    return this.get();
  }
}
