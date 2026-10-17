import {
  assertPublicHttpsUrl,
  checkReachable,
  createAudit,
  DuplicatePortalError,
  CredentialKeyError,
  decryptCredential,
  DuplicateUpstreamError,
  encryptCredential,
  hostnamePattern,
  parseCredentialKey,
  PostgresPortalStore,
  PostgresPortalSettingsStore,
  PostgresUpstreamStore,
  type PortalSettingsStore,
  type PortalStore,
  type Upstream,
  type UpstreamStore,
  UpstreamPool,
  UpstreamUrlError,
  upstreamNamePattern,
} from '@logto/mcp-portal';
import { type CommonQueryMethods } from '@silverhand/slonik';
import { array, boolean, object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import { clearCustomDomainCache } from '#src/utils/tenant.js';

import type { ManagementApiRouter, ManagementApiRouterContext, RouterInitArgs } from './types.js';

// Admin side of the MCP portal: portals, their servers, and who may use them. Mounted on the
// management API, so Logto's admin auth applies first. Everything is stored in Logto's database.
// The public endpoint that agents use is in mcp-portal-endpoint.ts.

export type McpPortalStores = {
  portals: PortalStore;
  upstreams: UpstreamStore;
  settings: PortalSettingsStore;
};

const audit = createAudit();
/** One connection pool for the whole process, shared with the public endpoint. */
export const upstreamPool = new UpstreamPool();

/**
 * The stores over a tenant's database. The portal tables are created by a schema alteration, so
 * requests only read and write them.
 */
export const storesFor = (db: CommonQueryMethods): McpPortalStores => ({
  portals: new PostgresPortalStore(db),
  upstreams: new PostgresUpstreamStore(db),
  settings: new PostgresPortalSettingsStore(db),
});

/** The deployment's key, read on each use so a restart with a new key takes effect at once. */
const credentialKey = () => parseCredentialKey(process.env.MCP_PORTAL_ENCRYPTION_KEY);

/**
 * Decrypts an upstream's stored token just before the endpoint connects to it. Returns undefined when
 * the server has no token. Throws `CredentialKeyError` when a token exists but the key is missing.
 */
export const unlockFor = (upstreams: UpstreamStore) => async (upstream: Upstream) => {
  const stored = await upstreams.findCredential(upstream.portalId, upstream.name);

  return stored === undefined ? undefined : decryptCredential(stored, credentialKey());
};

// A DNS label: letters, digits and hyphens, no leading or trailing hyphen.
const subdomainPattern = /^[\da-z](?:[\da-z-]{0,61}[\da-z])?$/;

const portalIdPattern = /^[\w-]{1,64}$/;

const createPortalBody = object({
  name: string().min(1).max(100),
  subdomain: string().regex(subdomainPattern),
}).strict();

const updateSettingsBody = object({
  baseDomain: string().regex(hostnamePattern),
}).strict();

const createUpstreamBody = object({
  name: string().regex(upstreamNamePattern),
  url: string().url(),
});

// Per-server and per-tool switches, and the organizations that can see a server.
const updateUpstreamBody = object({
  enabled: boolean().optional(),
  disabledTools: array(string().min(1).max(200)).max(500).optional(),
  organizationIds: array(string().min(1).max(64)).max(100).optional(),
}).strict();

// The bearer token an admin stores for one server. It is accepted here and never returned.
const credentialBody = object({
  token: string().min(1).max(4096),
}).strict();

const updatePortalOrganizationsBody = object({
  organizationIds: array(string().min(1).max(64)).max(100),
}).strict();

const invalidPortal = (ctx: ManagementApiRouterContext) => {
  ctx.status = 400;
  ctx.body = { code: 'mcp_portal.invalid_portal_id', message: 'Invalid portal id' };
};

const invalidName = (ctx: ManagementApiRouterContext) => {
  ctx.status = 400;
  ctx.body = { code: 'mcp_portal.invalid_name', message: 'Invalid portal or upstream name' };
};

const notFound = (ctx: ManagementApiRouterContext, message: string) => {
  ctx.status = 404;
  ctx.body = { code: 'mcp_portal.not_found', message };
};

/**
 * Registers the admin routes. `load` returns the stores for this request; production uses the
 * database, and tests pass fakes.
 */
export const registerMcpPortalRoutes = <T extends ManagementApiRouter>(
  router: T,
  load: () => Promise<McpPortalStores>
) => {
  router.get('/mcp-portal/portals', async (ctx, next) => {
    ctx.body = { portals: await (await load()).portals.list() };
    return next();
  });

  // The base domain is set from the console. A portal's hostname is <subdomain>.<base domain>.
  router.get('/mcp-portal/settings', async (ctx, next) => {
    ctx.body = await (await load()).settings.get();
    return next();
  });

  router.put(
    '/mcp-portal/settings',
    koaGuard({ body: updateSettingsBody, status: [200, 400] }),
    async (ctx, next) => {
      ctx.body = await (await load()).settings.setBaseDomain(ctx.guard.body.baseDomain);
      audit({ action: 'portal.settings', sub: ctx.auth.id, outcome: 'ok' });
      return next();
    }
  );

  router.post(
    '/mcp-portal/portals',
    koaGuard({ body: createPortalBody, status: [201, 400, 409] }),
    async (ctx, next) => {
      const { portals, settings } = await load();
      const { baseDomain } = await settings.get();

      if (!baseDomain) {
        ctx.status = 400;
        ctx.body = { code: 'mcp_portal.base_domain_not_set', message: 'Set the base domain first' };
        return next();
      }

      const hostname = `${ctx.guard.body.subdomain}.${baseDomain}`;

      if (!hostnamePattern.test(hostname)) {
        ctx.status = 400;
        ctx.body = { code: 'mcp_portal.invalid_hostname', message: 'The hostname is not valid' };
        return next();
      }

      try {
        ctx.status = 201;
        ctx.body = await portals.add({ name: ctx.guard.body.name, hostname });
        await clearCustomDomainCache(hostname);
      } catch (error: unknown) {
        if (!(error instanceof DuplicatePortalError)) {
          throw error;
        }

        ctx.status = 409;
        ctx.body = { code: 'mcp_portal.duplicate', message: error.message };
      }

      return next();
    }
  );

  router.delete('/mcp-portal/portals/:portalId', async (ctx, next) => {
    const { portalId } = ctx.params;

    if (!portalId || !portalIdPattern.test(portalId)) {
      invalidPortal(ctx);
      return next();
    }

    const { portals, upstreams } = await load();
    const portal = await portals.findById(portalId);

    if (!portal) {
      notFound(ctx, 'Portal not found');
      return next();
    }

    // Upstreams belong to the portal, so they go with it.
    for (const upstream of await upstreams.listForPortal(portalId)) {
      await upstreams.remove(portalId, upstream.name);
      await upstreamPool.invalidate(upstream);
    }

    if (!(await portals.remove(portalId))) {
      notFound(ctx, 'Portal not found');
      return next();
    }

    await clearCustomDomainCache(portal.hostname);

    audit({ action: 'portal.remove', sub: ctx.auth.id, portal: portalId, outcome: 'ok' });
    ctx.status = 204;
    return next();
  });

  router.put(
    '/mcp-portal/portals/:portalId/organizations',
    koaGuard({ body: updatePortalOrganizationsBody, status: [200, 400, 404] }),
    async (ctx, next) => {
      const { portalId } = ctx.params;

      if (!portalId || !portalIdPattern.test(portalId)) {
        invalidPortal(ctx);
        return next();
      }

      const portal = await (
        await load()
      ).portals.setOrganizations(portalId, [...new Set(ctx.guard.body.organizationIds)]);

      if (!portal) {
        notFound(ctx, 'Portal not found');
        return next();
      }

      audit({ action: 'portal.organizations', sub: ctx.auth.id, portal: portalId, outcome: 'ok' });
      ctx.body = portal;
      return next();
    }
  );

  router.get('/mcp-portal/portals/:portalId/upstreams', async (ctx, next) => {
    const { portalId } = ctx.params;

    if (!portalId || !portalIdPattern.test(portalId)) {
      invalidPortal(ctx);
      return next();
    }

    const { upstreams } = await load();
    ctx.body = {
      upstreams: (await upstreams.listForPortal(portalId)).map(
        ({ name, url, createdAt, enabled, disabledTools, organizationIds }) => ({
          name,
          url,
          createdAt,
          enabled,
          disabledTools,
          organizationIds,
        })
      ),
    };
    return next();
  });

  router.post(
    '/mcp-portal/portals/:portalId/upstreams',
    koaGuard({ body: createUpstreamBody, status: [201, 400, 404, 409] }),
    async (ctx, next) => {
      const { portalId } = ctx.params;
      const { name, url } = ctx.guard.body;

      if (!portalId || !portalIdPattern.test(portalId)) {
        invalidPortal(ctx);
        return next();
      }

      const { portals, upstreams } = await load();

      if (!(await portals.findById(portalId))) {
        notFound(ctx, 'Portal not found');
        return next();
      }

      try {
        await assertPublicHttpsUrl(url);
      } catch (error: unknown) {
        if (!(error instanceof UpstreamUrlError)) {
          throw error;
        }

        ctx.status = 400;
        ctx.body = { code: 'mcp_portal.invalid_url', message: error.message };
        return next();
      }

      try {
        const upstream = await upstreams.add({ name, url, portalId });
        audit({ action: 'upstream.add', sub: ctx.auth.id, upstream: name, outcome: 'ok' });
        // The server is kept either way, so a server that is down right now can be fixed later.
        const reachable = await checkReachable(upstreamPool, upstream);
        ctx.status = 201;
        ctx.body = {
          name: upstream.name,
          url: upstream.url,
          createdAt: upstream.createdAt,
          reachable,
        };
      } catch (error: unknown) {
        if (!(error instanceof DuplicateUpstreamError)) {
          throw error;
        }

        ctx.status = 409;
        ctx.body = { code: 'mcp_portal.duplicate', message: error.message };
      }

      return next();
    }
  );

  router.get('/mcp-portal/portals/:portalId/upstreams/:name/tools', async (ctx, next) => {
    const { portalId, name } = ctx.params;

    if (!portalId || !portalIdPattern.test(portalId) || !name || !upstreamNamePattern.test(name)) {
      invalidName(ctx);
      return next();
    }

    const upstream = await (await load()).upstreams.findForPortal(portalId, name);

    if (!upstream) {
      notFound(ctx, `Upstream "${name}" not found`);
      return next();
    }

    try {
      const client = await upstreamPool.get(upstream);
      const { tools } = await client.listTools();
      ctx.body = {
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description ?? '',
          enabled: !upstream.disabledTools.includes(tool.name),
        })),
      };
    } catch {
      await upstreamPool.invalidate(upstream);
      ctx.status = 503;
      ctx.body = {
        code: 'mcp_portal.upstream_unavailable',
        message: `Upstream "${name}" did not answer`,
      };
    }

    return next();
  });

  router.patch(
    '/mcp-portal/portals/:portalId/upstreams/:name',
    koaGuard({ body: updateUpstreamBody, status: [200, 400, 404] }),
    async (ctx, next) => {
      const { portalId, name } = ctx.params;

      if (
        !portalId ||
        !portalIdPattern.test(portalId) ||
        !name ||
        !upstreamNamePattern.test(name)
      ) {
        invalidName(ctx);
        return next();
      }

      const upstream = await (await load()).upstreams.update(portalId, name, ctx.guard.body);

      if (!upstream) {
        notFound(ctx, `Upstream "${name}" not found`);
        return next();
      }

      audit({ action: 'upstream.update', sub: ctx.auth.id, upstream: name, outcome: 'ok' });
      ctx.body = upstreamView(upstream);
      return next();
    }
  );

  router.delete('/mcp-portal/portals/:portalId/upstreams/:name', async (ctx, next) => {
    const { portalId, name } = ctx.params;

    if (!portalId || !portalIdPattern.test(portalId) || !name || !upstreamNamePattern.test(name)) {
      invalidName(ctx);
      return next();
    }

    const { upstreams } = await load();
    const existing = await upstreams.findForPortal(portalId, name);

    if (!existing || !(await upstreams.remove(portalId, name))) {
      notFound(ctx, `Upstream "${name}" not found`);
      return next();
    }

    await upstreamPool.invalidate(existing);
    audit({ action: 'upstream.remove', sub: ctx.auth.id, upstream: name, outcome: 'ok' });
    ctx.status = 204;
    return next();
  });

  // Write-only: the token goes in, and only `hasCredential` comes back. Changing it drops the cached
  // connection so the next call uses the new token.
  router.put(
    '/mcp-portal/portals/:portalId/upstreams/:name/credential',
    koaGuard({ body: credentialBody, status: [200, 400, 404, 503] }),
    async (ctx, next) => {
      const { portalId, name } = ctx.params;

      if (
        !portalId ||
        !portalIdPattern.test(portalId) ||
        !name ||
        !upstreamNamePattern.test(name)
      ) {
        invalidName(ctx);
        return next();
      }

      const { upstreams } = await load();
      const existing = await upstreams.findForPortal(portalId, name);

      if (!existing) {
        notFound(ctx, `Upstream "${name}" not found`);
        return next();
      }

      try {
        const ciphertext = encryptCredential(ctx.guard.body.token, credentialKey());
        await upstreams.setCredential(portalId, name, ciphertext);
      } catch (error: unknown) {
        if (!(error instanceof CredentialKeyError)) {
          throw error;
        }

        ctx.status = 503;
        ctx.body = { code: 'mcp_portal.encryption_key_missing', message: error.message };
        return next();
      }

      await upstreamPool.invalidate(existing);
      audit({ action: 'upstream.update', sub: ctx.auth.id, upstream: name, outcome: 'ok' });
      ctx.body = upstreamView({ ...existing, hasCredential: true });
      return next();
    }
  );

  router.delete('/mcp-portal/portals/:portalId/upstreams/:name/credential', async (ctx, next) => {
    const { portalId, name } = ctx.params;

    if (!portalId || !portalIdPattern.test(portalId) || !name || !upstreamNamePattern.test(name)) {
      invalidName(ctx);
      return next();
    }

    const { upstreams } = await load();
    const existing = await upstreams.findForPortal(portalId, name);

    if (!existing || !(await upstreams.setCredential(portalId, name))) {
      notFound(ctx, `Upstream "${name}" not found`);
      return next();
    }

    await upstreamPool.invalidate(existing);
    audit({ action: 'upstream.update', sub: ctx.auth.id, upstream: name, outcome: 'ok' });
    ctx.body = upstreamView({ ...existing, hasCredential: false });
    return next();
  });
};

const upstreamView = ({
  name,
  url,
  createdAt,
  enabled,
  disabledTools,
  organizationIds,
  hasCredential,
}: Upstream) => ({
  name,
  url,
  createdAt,
  enabled,
  disabledTools,
  organizationIds,
  hasCredential,
});

export default function mcpPortalRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  registerMcpPortalRoutes(router, async () => storesFor(tenant.envSet.pool));
}
