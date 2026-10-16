import { randomBytes } from 'node:crypto';

import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, ManagementApiRouterContext, RouterInitArgs } from './types.js';

// Manages the signed-in admin's MCP portal upstreams on the MCP portal service. Mounted on the
// management API router, so Logto's admin auth applies first. The portal is told who the caller is
// over a shared-secret channel; it never sees the caller's token.
//
// The connection (portal URL and shared secret) is set up once from the console and stored in
// Logto's config. Requests read it from the database; nothing is read from environment variables.
const upstreamNamePattern = /^[a-z][\da-z-]{0,31}$/;

const createUpstreamBody = object({
  name: string().regex(upstreamNamePattern),
  url: string().url(),
});

const setupBody = object({
  url: string()
    .url()
    .refine((value) => value.startsWith('https://'), 'The portal URL must use https'),
  token: string().min(1),
});

const notConfigured = (ctx: ManagementApiRouterContext) => {
  ctx.status = 503;
  ctx.body = { code: 'mcp_portal.not_configured', message: 'MCP portal is not set up' };
};

const forward = async (
  ctx: ManagementApiRouterContext,
  connection: { url: string; internalSecret: string } | undefined,
  init: { method: 'GET' | 'POST' | 'DELETE'; path: string; body?: unknown }
) => {
  if (!connection) {
    notConfigured(ctx);
    return;
  }

  const response = await fetch(new URL(init.path, connection.url), {
    method: init.method,
    headers: {
      accept: 'application/json',
      ...(init.body === undefined ? {} : { 'content-type': 'application/json' }),
      'x-portal-internal-secret': connection.internalSecret,
      'x-portal-owner': ctx.auth.id,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(10_000),
  });

  ctx.status = response.status;

  if (response.status === 204) {
    ctx.body = undefined;
    return;
  }

  const text = await response.text();
  ctx.body = text ? JSON.parse(text) : undefined;
};

export default function mcpPortalRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const { logtoConfigs } = tenant.queries;

  router.get('/mcp-portal/connection', async (ctx, next) => {
    const connection = await logtoConfigs.getMcpPortalConnection();
    // The secret is never returned.
    ctx.body = connection ? { configured: true, url: connection.url } : { configured: false };
    return next();
  });

  // One-time setup. Core generates the shared secret, gives it to the portal together with the
  // one-time token the admin copied from the portal log, and stores it only if the portal accepts.
  router.post(
    '/mcp-portal/connection',
    koaGuard({ body: setupBody, status: [201, 401, 409, 502] }),
    async (ctx, next) => {
      const { url, token } = ctx.guard.body;
      const internalSecret = randomBytes(32).toString('hex');

      const response = await fetch(new URL('/setup', url), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, internalSecret }),
        signal: AbortSignal.timeout(10_000),
      });

      if (response.status === 201) {
        // Saved before confirming. The portal accepts the pending secret, so requests already work.
        await logtoConfigs.upsertMcpPortalConnection({ url, internalSecret });

        const confirmation = await fetch(new URL('/setup/confirm', url), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token, internalSecret }),
          signal: AbortSignal.timeout(10_000),
        });

        if (confirmation.status !== 201) {
          // The connection works, but the portal still holds its token. Surfaced so it can be retried.
          ctx.status = 502;
          ctx.body = { code: 'mcp_portal.unconfirmed', message: 'Portal setup is not confirmed' };
          return next();
        }

        ctx.status = 201;
        ctx.body = { configured: true, url };
        return next();
      }

      if (response.status === 401) {
        ctx.status = 401;
        ctx.body = { code: 'mcp_portal.invalid_setup_token', message: 'Setup token is not valid' };
        return next();
      }

      if (response.status === 409) {
        ctx.status = 409;
        ctx.body = { code: 'mcp_portal.already_configured', message: 'Portal is already set up' };
        return next();
      }

      ctx.status = 502;
      ctx.body = { code: 'mcp_portal.upstream_error', message: 'Portal setup failed' };
      return next();
    }
  );

  // Clears the connection so setup can run again. The portal is asked to reset first. A portal that
  // no longer holds this secret (it restarted mid-setup, or was already reset) answers 401, and only
  // core's copy is left to clear.
  router.delete('/mcp-portal/connection', async (ctx, next) => {
    const connection = await logtoConfigs.getMcpPortalConnection();

    if (connection) {
      try {
        const response = await fetch(new URL('/setup/reset', connection.url), {
          method: 'POST',
          headers: { 'x-portal-internal-secret': connection.internalSecret },
          signal: AbortSignal.timeout(10_000),
        });

        if (response.status !== 200 && response.status !== 401) {
          throw new Error(`Portal reset returned ${response.status}`);
        }
      } catch {
        ctx.status = 502;
        ctx.body = { code: 'mcp_portal.reset_failed', message: 'Could not reset the MCP portal' };
        return next();
      }

      await logtoConfigs.deleteMcpPortalConnection();
    }

    ctx.status = 204;
    return next();
  });

  router.get('/mcp-portal/upstreams', async (ctx, next) => {
    await forward(ctx, await logtoConfigs.getMcpPortalConnection(), {
      method: 'GET',
      path: '/upstreams',
    });
    return next();
  });

  router.post(
    '/mcp-portal/upstreams',
    koaGuard({ body: createUpstreamBody, status: [200, 201, 400, 409, 503] }),
    async (ctx, next) => {
      await forward(ctx, await logtoConfigs.getMcpPortalConnection(), {
        method: 'POST',
        path: '/upstreams',
        body: ctx.guard.body,
      });
      return next();
    }
  );

  router.delete('/mcp-portal/upstreams/:name', async (ctx, next) => {
    const { name } = ctx.params;

    if (!name || !upstreamNamePattern.test(name)) {
      ctx.status = 400;
      ctx.body = { code: 'mcp_portal.invalid_name', message: 'Invalid upstream name' };
      return next();
    }

    await forward(ctx, await logtoConfigs.getMcpPortalConnection(), {
      method: 'DELETE',
      path: `/upstreams/${encodeURIComponent(name)}`,
    });
    return next();
  });
}
