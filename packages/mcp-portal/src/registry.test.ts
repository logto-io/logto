import { randomUUID } from 'node:crypto';
import { readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

import { DuplicateUpstreamError, JsonFileUpstreamStore } from './registry.js';

const root = nodePath.join(tmpdir(), `mcp-portal-test-${randomUUID()}`);

/** Each test gets its own registry file under the shared temp root. */
const createRegistry = async () => {
  const path = nodePath.join(root, randomUUID(), 'upstreams.json');
  const registry = new JsonFileUpstreamStore(path);
  await registry.load();

  return { registry, path };
};

describe('JsonFileUpstreamStore', () => {
  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('starts empty when the file does not exist', async () => {
    const { registry } = await createRegistry();

    expect(await registry.listForPortal('alice')).toEqual([]);
  });

  it('persists upstreams and reloads them', async () => {
    const { registry, path } = await createRegistry();
    await registry.add({ name: 'kubo', url: 'https://kubo.example.com/mcp', portalId: 'alice' });

    const reloaded = new JsonFileUpstreamStore(path);
    await reloaded.load();

    expect(await reloaded.listForPortal('alice')).toHaveLength(1);
    expect(JSON.parse(await readFile(path, 'utf8'))).toHaveLength(1);
  });

  it('keeps upstreams isolated per owner', async () => {
    const { registry } = await createRegistry();
    await registry.add({ name: 'kubo', url: 'https://a.example.com/mcp', portalId: 'alice' });

    expect(await registry.listForPortal('bob')).toEqual([]);
    expect(await registry.findForPortal('bob', 'kubo')).toBeUndefined();
  });

  it('allows the same name for different owners but not twice for one owner', async () => {
    const { registry } = await createRegistry();
    await registry.add({ name: 'kubo', url: 'https://a.example.com/mcp', portalId: 'alice' });
    await registry.add({ name: 'kubo', url: 'https://b.example.com/mcp', portalId: 'bob' });

    await expect(
      registry.add({ name: 'kubo', url: 'https://c.example.com/mcp', portalId: 'alice' })
    ).rejects.toBeInstanceOf(DuplicateUpstreamError);
  });

  it('reports a stored credential without returning its value', async () => {
    const { registry } = await createRegistry();
    await registry.add({ name: 'kubo', url: 'https://a.example.com/mcp', portalId: 'alice' });

    expect(await registry.setCredential('alice', 'kubo', 'v1.cipher')).toBe(true);

    const [listed] = await registry.listForPortal('alice');
    expect(listed?.hasCredential).toBe(true);
    expect(JSON.stringify(listed)).not.toContain('v1.cipher');
    expect(await registry.findCredential('alice', 'kubo')).toBe('v1.cipher');
  });

  it('clears a stored credential', async () => {
    const { registry } = await createRegistry();
    await registry.add({ name: 'kubo', url: 'https://a.example.com/mcp', portalId: 'alice' });
    await registry.setCredential('alice', 'kubo', 'v1.cipher');

    expect(await registry.setCredential('alice', 'kubo')).toBe(true);
    expect(await registry.findCredential('alice', 'kubo')).toBeUndefined();
    expect(await registry.findForPortal('alice', 'kubo')).toMatchObject({ hasCredential: false });
  });

  it('does not set a credential on another portal’s upstream', async () => {
    const { registry } = await createRegistry();
    await registry.add({ name: 'kubo', url: 'https://a.example.com/mcp', portalId: 'alice' });

    expect(await registry.setCredential('bob', 'kubo', 'v1.cipher')).toBe(false);
    expect(await registry.findCredential('alice', 'kubo')).toBeUndefined();
  });

  it('removes only the caller’s own upstream', async () => {
    const { registry } = await createRegistry();
    await registry.add({ name: 'kubo', url: 'https://a.example.com/mcp', portalId: 'alice' });

    expect(await registry.remove('bob', 'kubo')).toBe(false);
    expect(await registry.remove('alice', 'kubo')).toBe(true);
    expect(await registry.listForPortal('alice')).toEqual([]);
  });
});
