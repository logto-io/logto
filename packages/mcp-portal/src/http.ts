import { randomUUID, timingSafeEqual } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

import { type AuditEvent } from './audit.js';
import { AuthError, extractBearerToken, type Caller, type Verifier } from './auth.js';
import { createPortalServer } from './portal.js';
import { DuplicateUpstreamError, type UpstreamStore, upstreamNamePattern } from './registry.js';
import { type PortalSetup } from './setup.js';
import { UpstreamUrlError, assertPublicHttpsUrl } from './ssrf.js';
import { type UpstreamPool } from './upstream-pool.js';

const setupBodySchema = z.object({
  token: z.string().min(1),
  internalSecret: z.string().min(32),
});

/**
 * First-time setup, in two steps. Core sends the one-time token the admin copied from the portal log,
 * plus the secret it generated. `setup` holds the secret as pending; `confirm` makes it permanent.
 * Once confirmed, both steps answer 409 and nothing changes.
 */
const handleSetup = async (
  step: 'setup' | 'confirm',
  request: IncomingMessage,
  response: ServerResponse,
  deps: HttpDeps
) => {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: `Only POST is supported on /${step}` });
    return;
  }

  const parsed = setupBodySchema.safeParse(await readJson(request));

  if (!parsed.success) {
    throw new HttpError(400, 'Invalid setup request');
  }

  const { token, internalSecret } = parsed.data;
  const result =
    step === 'setup'
      ? await deps.setup.complete(token, internalSecret)
      : await deps.setup.confirm(token, internalSecret);

  if (result === 'already-configured') {
    throw new HttpError(409, 'Portal is already configured');
  }

  if (result === 'invalid-token') {
    deps.audit({ action: 'portal.setup', sub: 'system', outcome: 'denied' });
    throw new HttpError(401, 'Invalid setup token');
  }

  if (result === 'pending') {
    sendJson(response, 201, { configured: false });
    return;
  }

  deps.audit({ action: 'portal.setup', sub: 'system', outcome: 'ok' });
  sendJson(response, 201, { configured: true });
};

export type HttpDeps = {
  verify: Verifier;
  registry: UpstreamStore;
  pool: UpstreamPool;
  audit: (event: AuditEvent) => void;
  /** Holds the internal secret, set once through the setup route. */
  setup: PortalSetup;
};

const secretsMatch = (provided: string, expected: string): boolean => {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
};

/**
 * Identity asserted by Logto core over the internal channel. Core is the only caller that knows the
 * secret, and it rebuilds the forwarded request, so client-supplied headers never reach this check.
 */
const internalCaller = (request: IncomingMessage, deps: HttpDeps): Caller | undefined => {
  const internalSecret = deps.setup.internalSecret();
  const provided = request.headers['x-portal-internal-secret'];
  const owner = request.headers['x-portal-owner'];

  if (!internalSecret || typeof provided !== 'string' || typeof owner !== 'string' || !owner) {
    return undefined;
  }

  return secretsMatch(provided, internalSecret) ? { sub: owner, scopes: [] } : undefined;
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

const maxBodyBytes = 1024 * 1024;

/**
 * Collects the request body, stopping as soon as it passes the size limit. The socket is destroyed
 * at that point, so an oversized body is never fully buffered, whether or not it declares a length.
 */
const readBody = async (request: IncomingMessage): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    // Collecting chunks into a buffer is the purpose of this function. The size limit keeps it bounded.
    /* eslint-disable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */
    const chunks: Uint8Array[] = [];
    let size = 0;

    request.on('data', (chunk: Uint8Array) => {
      size += chunk.length;

      if (size > maxBodyBytes) {
        reject(new HttpError(413, 'Request body too large'));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });
    request.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    request.on('error', reject);
    /* eslint-enable @silverhand/fp/no-let, @silverhand/fp/no-mutation, @silverhand/fp/no-mutating-methods */
  });

const readJson = async (request: IncomingMessage): Promise<unknown> => {
  const declared = Number(request.headers['content-length'] ?? 0);

  if (declared > maxBodyBytes) {
    throw new HttpError(413, 'Request body too large');
  }

  const body = await readBody(request);

  if (body.length === 0) {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(body));

    return parsed;
  } catch {
    throw new HttpError(400, 'Request body is not valid JSON');
  }
};

const sendJson = (response: ServerResponse, status: number, body: unknown) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};

const upstreamBodySchema = z.object({
  name: z.string().regex(upstreamNamePattern, 'Use lowercase letters, digits and hyphens'),
  url: z.string().url(),
});

const authenticate = async (request: IncomingMessage, deps: HttpDeps): Promise<Caller> => {
  try {
    return await deps.verify(extractBearerToken(request.headers.authorization));
  } catch (error: unknown) {
    if (error instanceof AuthError) {
      throw new HttpError(401, error.message);
    }

    throw error;
  }
};

const handleMcp = async (request: IncomingMessage, response: ServerResponse, deps: HttpDeps) => {
  if (request.method !== 'POST') {
    // Stateless mode: no server-initiated streams or sessions to resume.
    sendJson(response, 405, { error: 'Only POST is supported on /mcp' });
    return;
  }

  const caller = await authenticate(request, deps);
  const body = await readJson(request);
  const server = createPortalServer(caller.sub, deps);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  response.on('close', () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(request, response, body);
};

const listUpstreams = async (response: ServerResponse, caller: Caller, deps: HttpDeps) => {
  const upstreams = await deps.registry.listForOwner(caller.sub);
  sendJson(response, 200, {
    upstreams: upstreams.map(({ name, url, createdAt }) => ({ name, url, createdAt })),
  });
};

const addUpstream = async (
  request: IncomingMessage,
  response: ServerResponse,
  caller: Caller,
  deps: HttpDeps
) => {
  const parsed = upstreamBodySchema.safeParse(await readJson(request));

  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? 'Invalid upstream');
  }

  const { name, url } = parsed.data;

  try {
    await assertPublicHttpsUrl(url);
  } catch (error: unknown) {
    if (error instanceof UpstreamUrlError) {
      deps.audit({
        action: 'upstream.add',
        sub: caller.sub,
        upstream: name,
        outcome: 'denied',
        reason: error.message,
      });
      throw new HttpError(400, error.message);
    }

    throw error;
  }

  try {
    const upstream = await deps.registry.add({ name, url, ownerSub: caller.sub });
    deps.audit({ action: 'upstream.add', sub: caller.sub, upstream: name, outcome: 'ok' });
    sendJson(response, 201, {
      name: upstream.name,
      url: upstream.url,
      createdAt: upstream.createdAt,
    });
  } catch (error: unknown) {
    if (error instanceof DuplicateUpstreamError) {
      throw new HttpError(409, error.message);
    }

    throw error;
  }
};

const removeUpstream = async (
  response: ServerResponse,
  caller: Caller,
  name: string,
  deps: HttpDeps
) => {
  const removed = await deps.registry.remove(caller.sub, name);

  if (!removed) {
    throw new HttpError(404, `Upstream "${name}" not found`);
  }

  await deps.pool.invalidate({ name, url: '', ownerSub: caller.sub, createdAt: '' });
  deps.audit({ action: 'upstream.remove', sub: caller.sub, upstream: name, outcome: 'ok' });
  response.writeHead(204).end();
};

const handleUpstreams = async (
  request: IncomingMessage,
  response: ServerResponse,
  path: string,
  deps: HttpDeps
) => {
  const caller = internalCaller(request, deps) ?? (await authenticate(request, deps));
  const removeName = /^\/upstreams\/([a-z][\da-z-]{0,31})$/.exec(path)?.[1];

  if (path === '/upstreams' && request.method === 'GET') {
    await listUpstreams(response, caller, deps);
    return;
  }

  if (path === '/upstreams' && request.method === 'POST') {
    return addUpstream(request, response, caller, deps);
  }

  if (removeName && request.method === 'DELETE') {
    return removeUpstream(response, caller, removeName, deps);
  }

  throw new HttpError(404, 'Not found');
};

/**
 * Clears the saved connection so setup can run again. Core calls this with the internal secret it
 * holds. A portal that has already lost that secret answers 401, and core treats that as reset too.
 */
const handleReset = async (request: IncomingMessage, response: ServerResponse, deps: HttpDeps) => {
  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Only POST is supported on /setup/reset' });
    return;
  }

  const provided = request.headers['x-portal-internal-secret'];
  const expected = deps.setup.internalSecret();

  if (typeof provided !== 'string' || !expected || !secretsMatch(provided, expected)) {
    throw new HttpError(401, 'Not authorized');
  }

  const token = await deps.setup.reset();
  process.stdout.write(
    `MCP portal was reset. New setup token: ${token}\n` +
      'Enter this token in the Logto console under MCP servers to finish setup.\n'
  );
  deps.audit({ action: 'portal.reset', sub: 'system', outcome: 'ok' });
  sendJson(response, 200, { configured: false });
};

export const createPortalHttpServer = (deps: HttpDeps) =>
  createServer(async (request, response) => {
    try {
      const path = new URL(request.url ?? '/', 'http://localhost').pathname;

      if (path === '/healthz') {
        sendJson(response, 200, { ok: true });
        return;
      }

      if (path === '/mcp') {
        await handleMcp(request, response, deps);
        return;
      }

      if (path === '/setup') {
        await handleSetup('setup', request, response, deps);
        return;
      }

      if (path === '/setup/reset') {
        await handleReset(request, response, deps);
        return;
      }

      if (path === '/setup/confirm') {
        await handleSetup('confirm', request, response, deps);
        return;
      }

      await handleUpstreams(request, response, path, deps);
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }

      // Log an id, not the error text, so internal details stay out of responses.
      const errorId = randomUUID();
      process.stderr.write(`mcp_portal_error ${errorId} ${String(error)}\n`);

      if (!response.headersSent) {
        sendJson(response, 500, { error: 'Internal error', errorId });
      }
    }
  });
