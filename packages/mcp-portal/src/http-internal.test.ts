import { request as httpRequest } from 'node:http';
import { text } from 'node:stream/consumers';

import { afterAll, describe, expect, it, vi } from 'vitest';

import { createPortalHttpServer, type HttpDeps } from './http.js';
import { type UpstreamStore } from './registry.js';
import { PortalSetup } from './setup.js';
import { UpstreamPool } from './upstream-pool.js';

/**
 * Covers the internal channel in src/http.ts that Logto core uses to manage upstreams for a user.
 * The owner is trusted only when the shared secret matches, and bearer auth still works without it.
 */
const setup = await PortalSetup.create({
  load: async () => ({ internalSecret: 'shared-secret' }),
  saveInternalSecret: vi.fn<(secret: string) => Promise<void>>(),
  clear: vi.fn<() => Promise<void>>(),
});

describe('createPortalHttpServer internal channel', () => {
  const add = vi.fn(
    async ({ name, url, ownerSub }: { name: string; url: string; ownerSub: string }) => ({
      name,
      url,
      ownerSub,
      createdAt: new Date(0).toISOString(),
    })
  );

  const registry: UpstreamStore = {
    listForOwner: vi.fn(async () => []),
    findForOwner: vi.fn<() => Promise<undefined>>(),
    add,
    remove: vi.fn(async () => false),
  };

  const deps: HttpDeps = {
    verify: async (token) => {
      if (token !== 'good') {
        throw new Error('invalid');
      }

      return { sub: 'alice', scopes: ['mcp:use'] };
    },
    registry,
    pool: new UpstreamPool(),
    audit: vi.fn(),
    setup,
  };

  const server = createPortalHttpServer(deps);

  const listening = new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve(typeof address === 'object' && address ? address.port : 0);
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  const post = async (headers: Record<string, string>) => {
    const port = await listening;

    return new Promise<{ status: number; body: string }>((resolve, reject) => {
      const request = httpRequest(
        {
          port,
          host: '127.0.0.1',
          method: 'POST',
          path: '/upstreams',
          headers: { 'content-type': 'application/json', ...headers },
        },
        async (response) => {
          const body = await text(response);
          resolve({ status: response.statusCode ?? 0, body });
        }
      );

      request.on('error', reject);
      request.end(JSON.stringify({ name: 'kubo', url: 'https://93.184.216.34/mcp' }));
    });
  };

  it('stores the upstream for the owner named by core when the secret matches', async () => {
    const result = await post({
      'x-portal-internal-secret': 'shared-secret',
      'x-portal-owner': 'owner-1',
    });

    expect(result.status).toBe(201);
    expect(add.mock.calls[0]?.[0]).toMatchObject({ ownerSub: 'owner-1' });
  });

  it('rejects an owner header with the wrong secret', async () => {
    add.mockClear();
    const result = await post({
      'x-portal-internal-secret': 'guessed',
      'x-portal-owner': 'owner-1',
    });

    expect(result.status).toBe(401);
    expect(add).not.toHaveBeenCalled();
  });

  it('still accepts a valid bearer token without the internal headers', async () => {
    const result = await post({ authorization: 'Bearer good' });

    expect(result.status).toBe(201);
    expect(add.mock.calls[0]?.[0]).toMatchObject({ ownerSub: 'alice' });
  });
});
