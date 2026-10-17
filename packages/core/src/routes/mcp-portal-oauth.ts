import {
  buildAuthorizationUrl,
  createPkce,
  decryptCredential,
  discoverAuthorizationServer,
  encryptCredential,
  exchangeCode,
  type OAuthRecord,
  parseCredential,
  parseCredentialKey,
  registerClient,
  serializeOAuthRecord,
  upstreamNamePattern,
} from '@logto/mcp-portal';
import { randomBytes } from 'node:crypto';

import Router from 'koa-router';

import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';

import { storesFor } from './mcp-portal.js';
import type { ManagementApiRouter, RouterInitArgs } from './types.js';

// The one-time OAuth state, kept in memory. A state is single-use and expires after ten minutes.
// Restarting core drops pending sign-ins, which then need to be started again.
type PendingAuthorization = {
  tenantId: string;
  portalId: string;
  upstreamName: string;
  verifier: string;
  expiresAt: number;
};

const pendingTtlMs = 10 * 60 * 1000;
const pending = new Map<string, PendingAuthorization>();

// Routes inside the management router are relative to its `/api` mount.
const callbackRoute = '/mcp-portal/oauth/callback';
// The public address the MCP server redirects to, under the tenant's `/api` mount.
const callbackUrlPath = '/api/mcp-portal/oauth/callback';

const prunePending = (now: number) => {
  for (const [state, value] of pending) {
    if (value.expiresAt <= now) {
      pending.delete(state);
    }
  }
};

const credentialKey = () => parseCredentialKey(process.env.MCP_PORTAL_ENCRYPTION_KEY);

/** Where the MCP server sends the browser back, on the tenant's own host. */
const redirectUriFor = (tenantId: string) =>
  new URL(callbackUrlPath, getTenantEndpoint(tenantId, EnvSet.values)).toString();

/** Where the console goes after the callback, to show the result on the server's page. */
const consoleResultUrl = (tenantId: string, portalId: string, outcome: string) => {
  const url = new URL(
    `/console/${tenantId}/mcp-portal/${portalId}`,
    EnvSet.values.adminUrlSet.endpoint.origin
  );
  url.searchParams.set('oauth', outcome);

  return url.toString();
};

/**
 * Starts an OAuth connection for an upstream: discovers its authorization server, registers the portal
 * as a client if it is not registered yet, and returns the URL the admin approves access at.
 * Authenticated, like the rest of the management API.
 */
export const mcpPortalOauthStart = <T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) => {
  router.post('/mcp-portal/portals/:portalId/upstreams/:name/oauth/start', async (ctx, next) => {
    const { portalId, name } = ctx.params;
    const stores = storesFor(tenant.envSet.pool);

    if (!portalId || !name || !upstreamNamePattern.test(name)) {
      throw new RequestError({ code: 'entity.not_found', status: 404 });
    }

    const upstream = await stores.upstreams.findForPortal(portalId, name);

    if (!upstream) {
      throw new RequestError({ code: 'entity.not_found', status: 404 });
    }

    // A server without OAuth discovery, or without dynamic client registration, cannot use this flow.
    // Report that as a client error so the console can tell the admin to paste a bearer token instead.
    const unsupported = () => {
      ctx.status = 422;
      ctx.body = {
        code: 'mcp_portal.oauth_unsupported',
        message: 'This server does not offer OAuth sign-in. Paste a bearer token instead.',
      };
      return next();
    };

    const metadata = await discoverAuthorizationServer(new URL(upstream.url)).catch(
      () => undefined
    );

    if (!metadata) {
      return unsupported();
    }

    const existing = await stores.upstreams.findCredential(portalId, name);
    const current =
      existing === undefined
        ? undefined
        : parseCredential(decryptCredential(existing, credentialKey()));
    const resource = upstream.url;
    const redirectUri = redirectUriFor(tenant.id);

    // Reuse the registered client when there is one, so re-authorising does not register again.
    const clientId =
      current?.kind === 'oauth'
        ? current.clientId
        : await registerClient(metadata, { redirectUri, clientName: 'MeshX MCP Portal' }).then(
            ({ client_id: id }) => id,
            () => undefined
          );

    if (!clientId) {
      return unsupported();
    }

    const record: OAuthRecord = {
      kind: 'oauth',
      clientId,
      authorizationEndpoint: metadata.authorization_endpoint,
      tokenEndpoint: metadata.token_endpoint,
      resource,
    };
    await stores.upstreams.setCredential(
      portalId,
      name,
      encryptCredential(serializeOAuthRecord(record), credentialKey())
    );

    const now = Date.now();
    prunePending(now);
    const state = randomBytes(32).toString('base64url');
    const { verifier, challenge } = createPkce();
    pending.set(state, {
      tenantId: tenant.id,
      portalId,
      upstreamName: name,
      verifier,
      expiresAt: now + pendingTtlMs,
    });

    ctx.body = {
      authorizationUrl: buildAuthorizationUrl(metadata, {
        clientId,
        redirectUri,
        state,
        codeChallenge: challenge,
        resource,
      }),
    };

    return next();
  });
};

/**
 * The callback the MCP server redirects the browser to. It is not behind the admin's token, because the
 * browser carries no token here. It is protected by the one-time state instead: an unknown, reused or
 * expired state is refused, and the tokens are only stored for the tenant and server that started it.
 */
export const mcpPortalOauthCallback = (tenant: TenantContext) => {
  const router = new Router();

  router.get(callbackRoute, async (ctx) => {
    const state = typeof ctx.query.state === 'string' ? ctx.query.state : '';
    const code = typeof ctx.query.code === 'string' ? ctx.query.code : '';
    const entry = pending.get(state);
    pending.delete(state);

    if (!entry || entry.expiresAt <= Date.now() || entry.tenantId !== tenant.id || !code) {
      ctx.status = 400;
      ctx.body = {
        code: 'mcp_portal.oauth_state_invalid',
        message: 'This sign-in expired. Start it again.',
      };
      return;
    }

    const stores = storesFor(tenant.envSet.pool);
    const upstream = await stores.upstreams.findForPortal(entry.portalId, entry.upstreamName);
    const existing = await stores.upstreams.findCredential(entry.portalId, entry.upstreamName);

    if (!upstream || existing === undefined) {
      ctx.redirect(consoleResultUrl(tenant.id, entry.portalId, 'error'));
      return;
    }

    const current = parseCredential(decryptCredential(existing, credentialKey()));

    if (current.kind !== 'oauth') {
      ctx.redirect(consoleResultUrl(tenant.id, entry.portalId, 'error'));
      return;
    }

    const metadata = await discoverAuthorizationServer(new URL(upstream.url));
    const tokens = await exchangeCode(metadata, {
      clientId: current.clientId,
      redirectUri: redirectUriFor(tenant.id),
      code,
      verifier: entry.verifier,
      resource: current.resource,
    });

    const record: OAuthRecord = {
      ...current,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
    };
    await stores.upstreams.setCredential(
      entry.portalId,
      entry.upstreamName,
      encryptCredential(serializeOAuthRecord(record), credentialKey())
    );

    ctx.redirect(consoleResultUrl(tenant.id, entry.portalId, 'connected'));
  });

  return router;
};
