import type { McpPortalConnection } from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { MockTenant } from '#src/test-utils/tenant.js';

import mcpPortalRoutes from './mcp-portal.js';
import { type ManagementApiRouter } from './types.js';

/**
 * Covers the routes in src/routes/mcp-portal.ts. The connection is read from Logto's config, and the
 * portal is replaced by a fetch spy, so these tests check what core stores and sends.
 */
const { jest } = import.meta;

const portalUrl = 'https://mcp-portal.example.com';
const secret = 'a'.repeat(64);

const storedConnection = { url: portalUrl, internalSecret: secret };

const createApp = (connection?: typeof storedConnection) => {
  const getMcpPortalConnection = jest.fn(async () => connection);
  const upsertMcpPortalConnection = jest
    .fn<Promise<void>, [McpPortalConnection]>()
    .mockResolvedValue();
  const app = new Koa();
  const router: ManagementApiRouter = new Router();

  // Stands in for Logto's management auth, which sets ctx.auth before these routes run.
  app.use(async (ctx, next) => {
    ctx.auth = { type: 'user', id: 'admin-1', scopes: new Set(['all']) };
    return next();
  });

  const deleteMcpPortalConnection = jest.fn<Promise<void>, unknown[]>().mockResolvedValue();

  const tenant = new MockTenant(undefined, {
    logtoConfigs: { getMcpPortalConnection, upsertMcpPortalConnection, deleteMcpPortalConnection },
  } as never);

  mcpPortalRoutes(router, tenant);
  app.use(router.routes());

  return { callback: app.callback(), upsertMcpPortalConnection, deleteMcpPortalConnection };
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('mcp-portal routes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports the connection without returning the secret', async () => {
    const { callback } = createApp(storedConnection);

    const response = await request(callback).get('/mcp-portal/connection');

    expect(response.body).toEqual({ configured: true, url: portalUrl });
    expect(JSON.stringify(response.body)).not.toContain(secret);
  });

  it('forwards upstream requests with the stored secret and the caller id', async () => {
    const { callback } = createApp(storedConnection);
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ upstreams: [] }));

    const response = await request(callback).get('/mcp-portal/upstreams');

    expect(response.status).toBe(200);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(String(url)).toBe(`${portalUrl}/upstreams`);
    expect(init?.headers).toMatchObject({
      'x-portal-internal-secret': secret,
      'x-portal-owner': 'admin-1',
    });
  });

  it('answers 503 for upstream requests before setup', async () => {
    const { callback } = createApp();
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    const response = await request(callback).get('/mcp-portal/upstreams');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ code: 'mcp_portal.not_configured' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a non-https portal URL before contacting anything', async () => {
    const { callback } = createApp();
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    const response = await request(callback)
      .post('/mcp-portal/connection')
      .send({ url: 'http://mcp-portal.example.com', token: 'token' });

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('stores the connection only after the portal accepts the setup', async () => {
    const { callback, upsertMcpPortalConnection } = createApp();
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ configured: false }, 201))
      .mockResolvedValueOnce(jsonResponse({ configured: true }, 201));

    const response = await request(callback)
      .post('/mcp-portal/connection')
      .send({ url: portalUrl, token: 'one-time' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ configured: true, url: portalUrl });
    const saved = upsertMcpPortalConnection.mock.calls[0]?.[0];
    expect(saved?.url).toBe(portalUrl);
    expect(saved?.internalSecret).toMatch(/^[\da-f]{64}$/);
  });

  it('clears nothing when there is no connection to reset', async () => {
    const { callback, deleteMcpPortalConnection } = createApp();
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    const response = await request(callback).delete('/mcp-portal/connection');

    expect(response.status).toBe(204);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(deleteMcpPortalConnection).not.toHaveBeenCalled();
  });

  it('resets the portal with the stored secret, then clears the connection', async () => {
    const { callback, deleteMcpPortalConnection } = createApp(storedConnection);
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 200));

    const response = await request(callback).delete('/mcp-portal/connection');

    expect(response.status).toBe(204);
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(String(url)).toBe(`${portalUrl}/setup/reset`);
    expect(init?.headers).toMatchObject({ 'x-portal-internal-secret': secret });
    expect(deleteMcpPortalConnection).toHaveBeenCalled();
  });

  it('clears core’s copy when the portal no longer holds the secret', async () => {
    const { callback, deleteMcpPortalConnection } = createApp(storedConnection);
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 401));

    const response = await request(callback).delete('/mcp-portal/connection');

    expect(response.status).toBe(204);
    expect(deleteMcpPortalConnection).toHaveBeenCalled();
  });

  it('keeps the connection when the portal reset fails', async () => {
    const { callback, deleteMcpPortalConnection } = createApp(storedConnection);
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({}, 500));

    const response = await request(callback).delete('/mcp-portal/connection');

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({ code: 'mcp_portal.reset_failed' });
    expect(deleteMcpPortalConnection).not.toHaveBeenCalled();
  });

  it('keeps the connection and reports 502 when the portal confirmation fails', async () => {
    const { callback, upsertMcpPortalConnection } = createApp();
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ configured: false }, 201))
      .mockResolvedValueOnce(jsonResponse({ error: 'no' }, 401));

    const response = await request(callback)
      .post('/mcp-portal/connection')
      .send({ url: portalUrl, token: 'one-time' });

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({ code: 'mcp_portal.unconfirmed' });
    expect(upsertMcpPortalConnection).toHaveBeenCalledTimes(1);
  });

  it('stores nothing when the portal rejects the token', async () => {
    const { callback, upsertMcpPortalConnection } = createApp();
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'no' }, 401));

    const response = await request(callback)
      .post('/mcp-portal/connection')
      .send({ url: portalUrl, token: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: 'mcp_portal.invalid_setup_token' });
    expect(upsertMcpPortalConnection).not.toHaveBeenCalled();
  });

  it('answers 409 when the portal is already set up', async () => {
    const { callback, upsertMcpPortalConnection } = createApp();
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'no' }, 409));

    const response = await request(callback)
      .post('/mcp-portal/connection')
      .send({ url: portalUrl, token: 'token' });

    expect(response.status).toBe(409);
    expect(upsertMcpPortalConnection).not.toHaveBeenCalled();
  });
});
