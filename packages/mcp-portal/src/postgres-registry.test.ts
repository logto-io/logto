import { randomUUID } from 'node:crypto';

import { createPool, sql } from '@silverhand/slonik';
import { afterAll, describe, expect, it } from 'vitest';

import { PostgresUpstreamStore, migratePostgresUpstreams } from './postgres-registry.js';
import { DuplicateUpstreamError } from './registry.js';

/**
 * Covers `PostgresUpstreamStore` in src/postgres-registry.ts. Runs only when
 * PORTAL_TEST_DATABASE_URL is set, so the suite stays green without a database. Each test uses a
 * unique owner, so runs against a shared database do not collide. The table is never dropped.
 */
const databaseUrl = process.env.PORTAL_TEST_DATABASE_URL;

const createFixture = async () => {
  const pool = await createPool(databaseUrl ?? '');
  await migratePostgresUpstreams(pool);

  return { pool, store: new PostgresUpstreamStore(pool) };
};

describe.skipIf(!databaseUrl)('PostgresUpstreamStore', () => {
  const fixturePromise = createFixture();

  afterAll(async () => {
    const { pool } = await fixturePromise;
    await pool.end();
  });

  it('adds and lists an owner’s upstreams with an ISO timestamp', async () => {
    const owner = randomUUID();
    const { store } = await fixturePromise;
    const added = await store.add({
      name: 'kubo',
      url: 'https://kubo.example.com/mcp',
      portalId: owner,
    });

    expect(added.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(await store.listForPortal(owner)).toEqual([added]);
  });

  it('rejects a duplicate name for the same owner', async () => {
    const owner = randomUUID();
    const { store } = await fixturePromise;
    await store.add({ name: 'kubo', url: 'https://kubo.example.com/mcp', portalId: owner });

    await expect(
      store.add({ name: 'kubo', url: 'https://other.example.com/mcp', portalId: owner })
    ).rejects.toBeInstanceOf(DuplicateUpstreamError);
  });

  it('keeps owners isolated on find and remove', async () => {
    const alice = randomUUID();
    const bob = randomUUID();
    const { store } = await fixturePromise;
    await store.add({ name: 'kubo', url: 'https://kubo.example.com/mcp', portalId: alice });

    expect(await store.findForPortal(bob, 'kubo')).toBeUndefined();
    expect(await store.remove(bob, 'kubo')).toBe(false);
    expect(await store.remove(alice, 'kubo')).toBe(true);
    expect(await store.listForPortal(alice)).toEqual([]);
  });

  it('rejects an invalid name at the database level', async () => {
    const { pool } = await fixturePromise;

    await expect(
      pool.query(sql`
        insert into mcp_portal_upstreams (portal_id, name, url)
        values (${randomUUID()}, ${'Bad_Name'}, ${'https://kubo.example.com/mcp'})
      `)
    ).rejects.toThrow();
  });
});
