import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import nodePath from 'node:path';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { afterAll, describe, expect, it, type Mock, vi } from 'vitest';

import { type AuditEvent } from './audit.js';
import { createPortalServer } from './portal.js';
import { JsonFileUpstreamStore } from './registry.js';
import { type UpstreamPool } from './upstream-pool.js';

const root = nodePath.join(tmpdir(), `mcp-portal-portal-${randomUUID()}`);

type FakeClient = {
  listTools: Mock<
    () => Promise<{ tools: Array<{ name: string; inputSchema: Record<string, unknown> }> }>
  >;
  callTool: Mock<(params: { name: string; arguments?: unknown }) => Promise<unknown>>;
};

/** Audit events recorded by a spy, for asserting on what was logged. */
const auditEvents = (audit: Mock<(event: AuditEvent) => void>) =>
  audit.mock.calls.map(([event]) => event);

const fakeUpstream = (): FakeClient => ({
  listTools: vi.fn(async () => ({ tools: [{ name: 'search', inputSchema: { type: 'object' } }] })),
  callTool: vi.fn(async ({ name }: { name: string }) => ({
    content: [{ type: 'text', text: `called ${name}` }],
  })),
});

/** A fresh registry, fake upstream clients, and audit spy for one test. */
const createFixture = async () => {
  const registry = new JsonFileUpstreamStore(nodePath.join(root, randomUUID(), 'upstreams.json'));
  await registry.load();

  const clientsByUpstream = new Map<string, FakeClient>();
  const audit = vi.fn<(event: AuditEvent) => void>();
  const pool = {
    get: vi.fn(async (upstream: { name: string }) => {
      const fake = clientsByUpstream.get(upstream.name);

      if (!fake) {
        throw new Error('no fake client');
      }

      return fake;
    }),
    invalidate: vi.fn<() => Promise<void>>(),
  } as unknown as UpstreamPool;

  const connect = async (sub: string) => {
    const server = createPortalServer(sub, { registry, pool, audit });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    const client = new Client({ name: 'test', version: '0.0.0' });
    await client.connect(clientTransport);

    return client;
  };

  return { registry, clientsByUpstream, audit, connect };
};

describe('createPortalServer', () => {
  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('namespaces each upstream tool as <upstream>__<tool>', async () => {
    const { registry, clientsByUpstream, connect } = await createFixture();
    await registry.add({ name: 'kubo', url: 'https://kubo.example.com/mcp', ownerSub: 'alice' });
    clientsByUpstream.set('kubo', fakeUpstream());

    const client = await connect('alice');
    const { tools } = await client.listTools();

    expect(tools.map(({ name }) => name)).toEqual(['kubo__search']);
  });

  it('routes a namespaced call to the matching upstream tool', async () => {
    const { registry, clientsByUpstream, connect } = await createFixture();
    await registry.add({ name: 'kubo', url: 'https://kubo.example.com/mcp', ownerSub: 'alice' });
    const upstream = fakeUpstream();
    clientsByUpstream.set('kubo', upstream);

    const client = await connect('alice');
    const result = await client.callTool({ name: 'kubo__search', arguments: { q: 'x' } });

    expect(upstream.callTool).toHaveBeenCalledWith({ name: 'search', arguments: { q: 'x' } });
    expect(result.content).toEqual([{ type: 'text', text: 'called search' }]);
  });

  it('refuses to call another owner’s upstream', async () => {
    const { registry, clientsByUpstream, audit, connect } = await createFixture();
    await registry.add({ name: 'kubo', url: 'https://kubo.example.com/mcp', ownerSub: 'alice' });
    clientsByUpstream.set('kubo', fakeUpstream());

    const client = await connect('bob');
    const result = await client.callTool({ name: 'kubo__search' });

    expect(result.isError).toBe(true);
    expect(auditEvents(audit)).toContainEqual(
      expect.objectContaining({ action: 'tool.call', sub: 'bob', outcome: 'denied' })
    );
  });

  it('rejects a tool name without the upstream prefix', async () => {
    const { connect } = await createFixture();
    const client = await connect('alice');
    const result = await client.callTool({ name: 'search' });

    expect(result.isError).toBe(true);
  });

  it('hides a failing upstream without hiding the others', async () => {
    const { registry, clientsByUpstream, audit, connect } = await createFixture();
    await registry.add({ name: 'kubo', url: 'https://kubo.example.com/mcp', ownerSub: 'alice' });
    await registry.add({ name: 'other', url: 'https://other.example.com/mcp', ownerSub: 'alice' });
    clientsByUpstream.set('kubo', fakeUpstream());
    const broken = fakeUpstream();
    broken.listTools.mockRejectedValue(new Error('connection refused'));
    clientsByUpstream.set('other', broken);

    const client = await connect('alice');
    const { tools } = await client.listTools();

    expect(tools.map(({ name }) => name)).toEqual(['kubo__search']);
    expect(auditEvents(audit)).toContainEqual(
      expect.objectContaining({ action: 'tool.list', upstream: 'other', outcome: 'error' })
    );
  });
});
