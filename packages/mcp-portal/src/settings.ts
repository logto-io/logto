import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import nodePath from 'node:path';

import { type CommonQueryMethods, sql } from '@silverhand/slonik';
import { z } from 'zod';

/**
 * Settings the portal keeps after setup. Saved once, from the console, and read at startup only.
 */
export type PortalSettings = {
  internalSecret?: string;
};

export type SettingsStore = {
  load: () => Promise<PortalSettings>;
  saveInternalSecret: (secret: string) => Promise<void>;
  /** Removes the saved secret, so setup can run again. */
  clear: () => Promise<void>;
};

const settingsSchema = z.object({
  internalSecret: z.string().min(32).optional(),
});

/** JSON-file store for local development. */
export class JsonFileSettingsStore implements SettingsStore {
  constructor(private readonly filePath: string) {}

  async load(): Promise<PortalSettings> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return settingsSchema.parse(JSON.parse(raw));
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return {};
      }

      throw error;
    }
  }

  async clear(): Promise<void> {
    await rm(this.filePath, { force: true });
  }

  async saveInternalSecret(secret: string): Promise<void> {
    await mkdir(nodePath.dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.${randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify({ internalSecret: secret }, null, 2));
    await rename(temporary, this.filePath);
  }
}

/** Postgres-backed store. The single settings row is keyed by id = 1. */
export class PostgresSettingsStore implements SettingsStore {
  constructor(private readonly pool: CommonQueryMethods) {}

  async load(): Promise<PortalSettings> {
    const row = await this.pool.maybeOne<{ internalSecret: string }>(sql`
      select internal_secret as "internalSecret"
      from mcp_portal_settings
      where id = 1
    `);

    return row ? { internalSecret: row.internalSecret } : {};
  }

  async clear(): Promise<void> {
    await this.pool.query(sql`delete from mcp_portal_settings where id = 1`);
  }

  async saveInternalSecret(secret: string): Promise<void> {
    await this.pool.query(sql`
      insert into mcp_portal_settings (id, internal_secret)
      values (1, ${secret})
      on conflict (id) do update set internal_secret = excluded.internal_secret
    `);
  }
}

/** Creates the settings table if needed. Idempotent, like the upstreams table. */
export const migratePostgresSettings = async (pool: CommonQueryMethods): Promise<void> => {
  await pool.query(sql`
    create table if not exists mcp_portal_settings (
      id integer primary key check (id = 1),
      internal_secret text not null
    )
  `);
};
