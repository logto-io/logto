import { createHash } from 'node:crypto';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import { type Upstream } from './registry.js';
import { assertPublicHttpsUrl, guardedFetch } from './ssrf.js';

const clientInfo = { name: 'logto-mcp-portal', version: '0.1.0' };

type Entry = { fingerprint: string; client: Promise<Client> };

// The fingerprint keeps the token out of memory keys and lets a changed token reconnect.
const fingerprintOf = (token: string | undefined) =>
  token === undefined ? '' : createHash('sha256').update(token).digest('hex');

const keyOf = (upstream: Upstream) => `${upstream.portalId}\u0000${upstream.name}`;

/**
 * Keeps one MCP client per portal and upstream, so a user's upstreams are not reconnected on every
 * request. A failed client is dropped so the next call reconnects. When an upstream's stored token
 * changes, its client is replaced, so the new token is used from the next call on.
 */
export class UpstreamPool {
  private readonly clients = new Map<string, Entry>();

  /**
   * `token` is the upstream's bearer token, already decrypted by the caller. It is sent as the
   * Authorization header on every request to that upstream, and never to any other host.
   */
  async get(upstream: Upstream, token?: string): Promise<Client> {
    const key = keyOf(upstream);
    const fingerprint = fingerprintOf(token);
    const existing = this.clients.get(key);

    if (existing && existing.fingerprint === fingerprint) {
      return existing.client;
    }

    if (existing) {
      await this.close(existing);
    }

    const client = this.connect(upstream, token);
    this.clients.set(key, { fingerprint, client });

    try {
      return await client;
    } catch (error: unknown) {
      this.clients.delete(key);
      throw error;
    }
  }

  /** Drops the cached client so the next call reconnects, e.g. after a transport error. */
  async invalidate(upstream: Upstream): Promise<void> {
    const key = keyOf(upstream);
    const existing = this.clients.get(key);
    this.clients.delete(key);

    if (existing) {
      await this.close(existing);
    }
  }

  private async close({ client }: Entry): Promise<void> {
    await client
      .then(async (connected) => connected.close())
      .catch(() => {
        // Closing is best effort; the cached entry is already gone.
      });
  }

  private async connect(upstream: Upstream, token?: string): Promise<Client> {
    // Re-checked on every connection, not only at registration.
    const url = await assertPublicHttpsUrl(upstream.url);
    const client = new Client(clientInfo);
    const requestInit = token ? { headers: { authorization: `Bearer ${token}` } } : {};
    // Every redirect hop is validated, since the upstream controls where it sends the client.
    await client.connect(
      new StreamableHTTPClientTransport(url, { fetch: guardedFetch, requestInit })
    );

    return client;
  }
}
