import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { DuplicatePortalError, JsonFilePortalStore, hostnamePattern } from './portals.js';

const root = nodePath.join(tmpdir(), `mcp-portal-portals-${randomUUID()}`);

describe('JsonFilePortalStore', () => {
  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('adds a portal and finds it by hostname', async () => {
    const store = new JsonFilePortalStore(nodePath.join(root, randomUUID(), 'portals.json'));
    await store.load();

    const portal = await store.add({ name: 'Team A', hostname: 'mcp1.example.com' });

    expect(await store.findByHostname('mcp1.example.com')).toMatchObject({
      id: portal.id,
      name: 'Team A',
    });
    expect(await store.findById(portal.id)).toMatchObject({ hostname: 'mcp1.example.com' });
  });

  it('refuses a second portal on the same hostname', async () => {
    const store = new JsonFilePortalStore(nodePath.join(root, randomUUID(), 'portals.json'));
    await store.load();
    await store.add({ name: 'One', hostname: 'mcp1.example.com' });

    await expect(store.add({ name: 'Two', hostname: 'mcp1.example.com' })).rejects.toBeInstanceOf(
      DuplicatePortalError
    );
  });

  it('starts with no organization grants and saves the ones it is given', async () => {
    const store = new JsonFilePortalStore(nodePath.join(root, randomUUID(), 'portals.json'));
    await store.load();
    const portal = await store.add({ name: 'Team', hostname: 'mcp-grants.example.com' });

    expect(portal.organizationIds).toEqual([]);
    expect(await store.setOrganizations(portal.id, ['org-a'])).toMatchObject({
      organizationIds: ['org-a'],
    });
    expect(await store.findById(portal.id)).toMatchObject({ organizationIds: ['org-a'] });
    expect(await store.setOrganizations('missing', ['org-a'])).toBeUndefined();
  });

  it('keeps portals after a reload', async () => {
    const filePath = nodePath.join(root, randomUUID(), 'portals.json');
    const first = new JsonFilePortalStore(filePath);
    await first.load();
    const portal = await first.add({ name: 'Team B', hostname: 'mcp2.example.com' });

    const reloaded = new JsonFilePortalStore(filePath);
    await reloaded.load();

    expect(await reloaded.findById(portal.id)).toBeDefined();
  });

  it('removes a portal and reports unknown ids', async () => {
    const store = new JsonFilePortalStore(nodePath.join(root, randomUUID(), 'portals.json'));
    await store.load();
    const portal = await store.add({ name: 'Team C', hostname: 'mcp3.example.com' });

    expect(await store.remove(portal.id)).toBe(true);
    expect(await store.remove(portal.id)).toBe(false);
  });
});

describe('hostnamePattern', () => {
  it('accepts a DNS hostname and rejects paths and uppercase', () => {
    expect(hostnamePattern.test('mcp1.example.com')).toBe(true);
    expect(hostnamePattern.test('MCP1.example.com')).toBe(false);
    expect(hostnamePattern.test('example.com/mcp')).toBe(false);
    expect(hostnamePattern.test('localhost')).toBe(false);
  });
});
