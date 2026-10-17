import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { registerMcpPortalEndpoint } from './mcp-portal-endpoint.js';
import { type McpPortalStores } from './mcp-portal.js';
import { type AnonymousRouter } from './types.js';

/**
 * Covers the public endpoint in src/routes/mcp-portal-endpoint.ts. The stores are fakes. Token
 * verification needs Logto's signing keys, so these tests cover the paths that come before it.
 */
const { jest } = import.meta;

const portal = {
  id: 'portal-1',
  name: 'Team',
  hostname: 'mcp.example.com',
  createdAt: new Date(0).toISOString(),
  organizationIds: ['org-a'],
};

const createApp = (portalFound = true) => {
  const stores = {
    portals: {
      findByHostname: jest.fn(async (hostname: string) =>
        portalFound && hostname === portal.hostname ? portal : undefined
      ),
    },
    upstreams: {},
  } as unknown as McpPortalStores;

  const app = new Koa();
  const router: AnonymousRouter = new Router();
  registerMcpPortalEndpoint(router, {
    load: async () => stores,
    issuer: () => 'https://auth.example.com/oidc',
  });
  app.use(router.routes()).use(router.allowedMethods());

  return app.callback();
};

describe('mcp-portal public endpoint', () => {
  it('publishes the sign-in server for a portal host', async () => {
    const response = await request(createApp())
      .get('/.well-known/oauth-protected-resource')
      .set('host', 'mcp.example.com');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      resource: 'https://mcp.example.com/mcp',
      authorization_servers: ['https://auth.example.com/oidc'],
    });
  });

  it('answers 404 for the metadata on a host with no portal', async () => {
    const response = await request(createApp())
      .get('/.well-known/oauth-protected-resource')
      .set('host', 'unknown.example.com');

    expect(response.status).toBe(404);
  });

  it('answers 404 on /mcp for a host with no portal', async () => {
    const response = await request(createApp(false))
      .post('/mcp')
      .set('host', 'mcp.example.com')
      .send({});

    expect(response.status).toBe(404);
  });

  it('points a caller without a token at the sign-in metadata', async () => {
    const response = await request(createApp())
      .post('/mcp')
      .set('host', 'mcp.example.com')
      .send({});

    expect(response.status).toBe(401);
    expect(response.headers['www-authenticate']).toBe(
      'Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource"'
    );
  });

  it('accepts only POST on /mcp', async () => {
    const response = await request(createApp()).get('/mcp').set('host', 'mcp.example.com');

    expect(response.status).toBe(405);
  });
});
