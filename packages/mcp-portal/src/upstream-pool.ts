import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { type Upstream } from './registry.js';
import { assertPublicHttpsUrl } from './ssrf.js';

const clientInfo = { name: 'logto-mcp-portal', version: '0.1.0' };

/**
 * Keeps one MCP client per owner and upstream, so a user's upstreams are not reconnected on every
 * request. A failed client is dropped so the next call reconnects.
 */
export class UpstreamPool {
  private readonly clients = new Map<string, Promise<Client>>();

  async get(upstream: Upstream): Promise<Client> {
    const key = `${upstream.ownerSub}\u0000${upstream.name}`;
    const existing = this.clients.get(key);

    if (existing) {
      return existing;
    }

    const connecting = this.connect(upstream);
    this.clients.set(key, connecting);

    try {
      return await connecting;
    } catch (error: unknown) {
      this.clients.delete(key);
      throw error;
    }
  }

  /** Drops the cached client so the next call reconnects, e.g. after a transport error. */
  async invalidate(upstream: Upstream): Promise<void> {
    const key = `${upstream.ownerSub}\u0000${upstream.name}`;
    const existing = this.clients.get(key);
    this.clients.delete(key);

    if (existing) {
      await existing
        .then(async (client) => client.close())
        .catch(() => {
          // Closing is best effort; the cached entry is already gone.
        });
    }
  }

  private async connect(upstream: Upstream): Promise<Client> {
    // Re-checked on every connection, not only at registration.
    const url = await assertPublicHttpsUrl(upstream.url);
    const client = new Client(clientInfo);
    await client.connect(new StreamableHTTPClientTransport(url));

    return client;
  }
}
