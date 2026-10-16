import { request as httpRequest } from 'node:http';

import { afterAll, describe, expect, it, vi } from 'vitest';

import { createPortalHttpServer, type HttpDeps } from './http.js';
import { type UpstreamStore } from './registry.js';
import { PortalSetup } from './setup.js';
import { UpstreamPool } from './upstream-pool.js';

/**
 * Covers the body size cap in `readBody` (src/http.ts). A chunked request larger than the limit
 * must never reach the registry, whether or not it declares a content length.
 */
const setup = await PortalSetup.create({
  load: async () => ({}),
  saveInternalSecret: vi.fn<(secret: string) => Promise<void>>(),
  clear: vi.fn<() => Promise<void>>(),
});

describe('createPortalHttpServer body limit', () => {
  const add = vi.fn();
  const registry: UpstreamStore = {
    listForOwner: vi.fn(async () => []),
    findForOwner: vi.fn<() => Promise<undefined>>(),
    add,
    remove: vi.fn(async () => false),
  };

  const deps: HttpDeps = {
    verify: async () => ({ sub: 'alice', scopes: ['mcp:use'] }),
    registry,
    setup,
    pool: new UpstreamPool(),
    audit: vi.fn(),
  };

  const server = createPortalHttpServer(deps);

  const listening = new Promise<number>((resolve) => {
    server.listen(0, () => {
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

  it('rejects a chunked body over the limit without storing the upstream', async () => {
    const port = await listening;
    const chunk = Buffer.alloc(64 * 1024, 'a');

    const outcome = await new Promise<string>((resolve) => {
      const request = httpRequest(
        {
          port,
          method: 'POST',
          path: '/upstreams',
          headers: {
            authorization: 'Bearer token',
            'content-type': 'application/json',
            'transfer-encoding': 'chunked',
          },
        },
        (response) => {
          resolve(`status ${response.statusCode ?? 0}`);
          response.resume();
        }
      );

      request.on('error', () => {
        resolve('connection closed');
      });

      // 40 chunks of 64 KB is about 2.5 MB, well over the 1 MB limit.
      const chunks = Array.from({ length: 40 }, () => chunk);
      for (const part of chunks) {
        request.write(part);
      }
      request.end();
    });

    expect(outcome).not.toBe('status 201');
    expect(add).not.toHaveBeenCalled();
  });
});
