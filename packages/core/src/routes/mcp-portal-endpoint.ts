import { randomUUID } from 'node:crypto';
import { text } from 'node:stream/consumers';

import {
  AuthError,
  type Caller,
  createAudit,
  createOrganizationLookup,
  createPortalServer,
  createVerifier,
  extractBearerToken,
  type Portal,
} from '@logto/mcp-portal';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { type McpPortalStores, storesFor, unlockFor, upstreamPool } from './mcp-portal.js';
import type { AnonymousRouter, RouterInitArgs } from './types.js';

// The public endpoint agents connect to. The request's hostname picks the portal, and that portal's
// own server list is served at https://<hostname>/mcp. A caller must sign in to Logto and belong to
// an organization that is granted to the portal.

const requiredScope = 'mcp:use';
const audit = createAudit();

export type McpPortalEndpointDeps = {
  /** The stores for this request. Production reads the database; tests pass fakes. */
  load: () => Promise<McpPortalStores>;
  /** Logto's OIDC issuer. Access tokens are verified against it. */
  issuer: () => string;
};

const hostnameOf = (host: string | undefined) => (host ?? '').split(':')[0] ?? '';

const challengeFor = (hostname: string) =>
  `Bearer resource_metadata="https://${hostname}/.well-known/oauth-protected-resource"`;

// One lookup per issuer, so its answers are cached across requests.
const lookupByIssuer = new Map<string, (accessToken: string) => Promise<string[]>>();

const organizationLookupFor = (issuer: string) => {
  const cached = lookupByIssuer.get(issuer);

  if (cached) {
    return cached;
  }

  const lookup = createOrganizationLookup({ issuer });
  lookupByIssuer.set(issuer, lookup);

  return lookup;
};

/** Verifies the token. Undefined means Logto refused it; other failures are real errors. */
const verifiedCaller = async (token: string, hostname: string, issuer: string) => {
  const verify = createVerifier({
    issuer,
    audience: [`https://${hostname}/mcp`],
    requiredScope,
  });

  return verify(token).catch((error: unknown) => {
    if (error instanceof AuthError) {
      return;
    }

    throw error;
  });
};

/** The caller's organizations that are granted to the portal. Undefined means the caller is refused. */
const grantedOrganizations = async (
  portal: Portal,
  token: string,
  caller: Caller,
  lookup: (accessToken: string) => Promise<string[]>
): Promise<string[] | undefined> => {
  if (portal.organizationIds.length === 0) {
    audit({
      action: 'portal.access',
      sub: caller.sub,
      portal: portal.id,
      outcome: 'denied',
      reason: 'no_grants',
    });
    return undefined;
  }

  const organizationIds = await lookup(token).catch((error: unknown) => {
    process.stderr.write(
      `mcp_portal_error ${randomUUID()} organization lookup: ${String(error)}\n`
    );
  });

  if (!organizationIds) {
    audit({
      action: 'portal.access',
      sub: caller.sub,
      portal: portal.id,
      outcome: 'error',
      reason: 'lookup_failed',
    });
    return undefined;
  }

  const granted = organizationIds.filter((id) => portal.organizationIds.includes(id));

  audit({
    action: 'portal.access',
    sub: caller.sub,
    portal: portal.id,
    outcome: granted.length > 0 ? 'ok' : 'denied',
    ...(granted.length > 0 ? {} : { reason: 'not_in_granted_organization' }),
  });

  return granted.length > 0 ? granted : undefined;
};

/** Parses a JSON request body. Undefined means the body was not valid JSON. */
const parseBody = (raw: string): { value: unknown } | undefined => {
  if (!raw) {
    return { value: undefined };
  }

  try {
    return { value: JSON.parse(raw) as unknown };
  } catch {
    return undefined;
  }
};

/** Registers the public endpoint and its sign-in metadata. */
export const registerMcpPortalEndpoint = <T extends AnonymousRouter>(
  router: T,
  { load, issuer }: McpPortalEndpointDeps
) => {
  // Metadata that tells MCP clients where to sign in.
  router.get('/.well-known/oauth-protected-resource', async (ctx, next) => {
    const hostname = hostnameOf(ctx.host);
    const { portals } = await load();
    const portal = await portals.findByHostname(hostname);

    if (!portal) {
      ctx.status = 404;
      ctx.body = { code: 'mcp_portal.not_found', message: 'No portal for this host' };
      return;
    }

    ctx.body = {
      resource: `https://${hostname}/mcp`,
      authorization_servers: [issuer()],
      scopes_supported: [requiredScope],
      bearer_methods_supported: ['header'],
    };
    return;
  });

  router.all('/mcp', async (ctx, next) => {
    const hostname = hostnameOf(ctx.host);
    const { portals, upstreams } = await load();
    const portal = await portals.findByHostname(hostname);

    if (!portal) {
      // Not a portal host: the Logto MCP endpoint, registered after this one, handles it.
      return next();
    }

    if (ctx.method !== 'POST') {
      // Stateless mode: no server-initiated streams or sessions to resume.
      ctx.status = 405;
      ctx.body = { error: 'Only POST is supported on /mcp' };
      return;
    }

    const token = (() => {
      try {
        return extractBearerToken(ctx.get('authorization'));
      } catch {}
    })();
    const caller = token && (await verifiedCaller(token, hostname, issuer()));

    if (!token || !caller) {
      ctx.status = 401;
      ctx.set('www-authenticate', challengeFor(hostname));
      ctx.body = { error: 'Missing or invalid bearer token' };
      return;
    }

    const granted = await grantedOrganizations(
      portal,
      token,
      caller,
      organizationLookupFor(issuer())
    );

    if (!granted) {
      ctx.status = 403;
      ctx.body = { error: 'This portal is not open to your organizations' };
      return;
    }

    const parsed = parseBody(await text(ctx.req));

    if (!parsed) {
      ctx.status = 400;
      ctx.body = { error: 'Request body is not valid JSON' };
      return;
    }

    const server = createPortalServer(portal.id, caller.sub, granted, {
      registry: upstreams,
      pool: upstreamPool,
      audit,
      unlock: unlockFor(upstreams),
    });
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    // Koa must not write the response; the MCP transport does.
    ctx.respond = false;
    ctx.res.on('close', () => {
      void transport.close();
      void server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(ctx.req, ctx.res, parsed.value);
    return;
  });
};

export default function mcpPortalEndpointRoutes<T extends AnonymousRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  registerMcpPortalEndpoint(router, {
    load: async () => storesFor(tenant.envSet.pool),
    issuer: () => tenant.envSet.oidc.issuer,
  });
}
