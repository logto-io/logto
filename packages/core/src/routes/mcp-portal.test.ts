import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { type McpPortalStores, registerMcpPortalRoutes } from './mcp-portal.js';
import { type ManagementApiRouter } from './types.js';

const { jest } = import.meta;

/**
 * Covers the admin routes in src/routes/mcp-portal.ts. The stores are fakes, so these tests check
 * the status codes and what each route asks the stores to do.
 */
const portal = {
  id: '0b6f2c1e-7a5d-4c1e-9d55-2f1a3b4c5d6e',
  name: 'Team',
  hostname: 'mcp.example.com',
  createdAt: new Date(0).toISOString(),
  organizationIds: ['org-a'],
};

const createApp = (overrides: Partial<McpPortalStores> = {}) => {
  const stores = {
    portals: {
      list: jest.fn(async () => [portal]),
      findByHostname: jest.fn(async () => {}),
      findById: jest.fn(async (id: string) => (id === portal.id ? portal : undefined)),
      add: jest.fn(async (input: { name: string; hostname: string }) => ({
        ...portal,
        ...input,
      })),
      remove: jest.fn(async () => true),
      setOrganizations: jest.fn(async (id: string, organizationIds: string[]) =>
        id === portal.id ? { ...portal, organizationIds } : undefined
      ),
    },
    settings: {
      get: jest.fn(async () => ({ baseDomain: 'mcp.example.com' })),
      setBaseDomain: jest.fn(async (baseDomain: string) => ({ baseDomain })),
    },
    upstreams: {
      listForPortal: jest.fn(async () => []),
      findForPortal: jest.fn(async () => {}),
      add: jest.fn(),
      remove: jest.fn(async () => false),
      update: jest.fn(async () => {}),
    },
    ...overrides,
  } as unknown as McpPortalStores;

  const app = new Koa();
  const router: ManagementApiRouter = new Router();
  registerMcpPortalRoutes(router, async () => stores);
  app.use(async (ctx, next) => {
    // Stands in for Logto's management auth, which sets ctx.auth before these routes run.
    ctx.auth = { id: 'admin-1' } as typeof ctx.auth;
    return next();
  });
  app.use(router.routes()).use(router.allowedMethods());

  return { callback: app.callback(), stores };
};

describe('mcp-portal admin routes', () => {
  it('lists portals from the database', async () => {
    const { callback, stores } = createApp();

    const response = await request(callback).get('/mcp-portal/portals');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ portals: [{ id: portal.id }] });
    expect(stores.portals.list).toHaveBeenCalled();
  });

  it('creates a portal under the base domain from its subdomain', async () => {
    const { callback, stores } = createApp();
    const created = await request(callback)
      .post('/mcp-portal/portals')
      .send({ name: 'Team', subdomain: 'eng' });

    expect(created.status).toBe(201);
    expect(stores.portals.add).toHaveBeenCalledWith({
      name: 'Team',
      hostname: 'eng.mcp.example.com',
    });
  });

  it('refuses to create a portal until the base domain is set', async () => {
    const { callback, stores } = createApp({
      settings: {
        get: jest.fn(async () => ({})),
        setBaseDomain: jest.fn(),
      } as unknown as McpPortalStores['settings'],
    });

    const response = await request(callback)
      .post('/mcp-portal/portals')
      .send({ name: 'Team', subdomain: 'eng' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'mcp_portal.base_domain_not_set' });
    expect(stores.portals.add).not.toHaveBeenCalled();
  });

  it('rejects a subdomain that is not a valid DNS label before touching the database', async () => {
    const { callback, stores } = createApp();

    const response = await request(callback)
      .post('/mcp-portal/portals')
      .send({ name: 'Team', subdomain: 'NOT A LABEL' });

    expect(response.status).toBe(400);
    expect(stores.portals.add).not.toHaveBeenCalled();
  });

  it('saves the base domain from the console', async () => {
    const { callback, stores } = createApp();

    const response = await request(callback)
      .put('/mcp-portal/settings')
      .send({ baseDomain: 'mcp.meshx.foundation' });

    expect(response.status).toBe(200);
    expect(stores.settings.setBaseDomain).toHaveBeenCalledWith('mcp.meshx.foundation');
  });

  it('reads the base domain for the console', async () => {
    const { callback } = createApp();

    const response = await request(callback).get('/mcp-portal/settings');

    expect(response.body).toEqual({ baseDomain: 'mcp.example.com' });
  });

  it('replaces a portal’s organizations, and de-duplicates them', async () => {
    const { callback, stores } = createApp();

    const response = await request(callback)
      .put(`/mcp-portal/portals/${portal.id}/organizations`)
      .send({ organizationIds: ['org-a', 'org-a', 'org-b'] });

    expect(response.status).toBe(200);
    expect(stores.portals.setOrganizations).toHaveBeenCalledWith(portal.id, ['org-a', 'org-b']);
  });

  it('lists no servers for a portal that has none', async () => {
    const { callback } = createApp();

    const response = await request(callback).get(
      '/mcp-portal/portals/00000000-0000-4000-8000-000000000000/upstreams'
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ upstreams: [] });
  });

  it('answers 404 when adding a server to a missing portal', async () => {
    const { callback } = createApp();

    const response = await request(callback)
      .post('/mcp-portal/portals/00000000-0000-4000-8000-000000000000/upstreams')
      .send({ name: 'kubo', url: 'https://kubo.example.com/mcp' });

    expect(response.status).toBe(404);
  });

  it('refuses a server URL that is not public https before storing it', async () => {
    const { callback, stores } = createApp();

    const response = await request(callback)
      .post(`/mcp-portal/portals/${portal.id}/upstreams`)
      .send({ name: 'kubo', url: 'http://127.0.0.1/mcp' });

    expect(response.status).toBe(400);
    expect(stores.upstreams.add).not.toHaveBeenCalled();
  });

  it('removes a portal’s servers before the portal itself', async () => {
    const remove = jest.fn(async () => true);
    const { callback, stores } = createApp({
      upstreams: {
        listForPortal: jest.fn(async () => [{ name: 'kubo', portalId: portal.id }]),
        findForPortal: jest.fn(async () => {}),
        add: jest.fn(),
        remove,
        update: jest.fn(async () => {}),
      } as unknown as McpPortalStores['upstreams'],
    });

    const response = await request(callback).delete(`/mcp-portal/portals/${portal.id}`);

    expect(response.status).toBe(204);
    expect(remove).toHaveBeenCalledWith(portal.id, 'kubo');
    expect(stores.portals.remove).toHaveBeenCalledWith(portal.id);
  });
});
