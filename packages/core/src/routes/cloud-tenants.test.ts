import { adminTenantId } from '@logto/schemas';
import Koa from 'koa';
import request from 'supertest';

import { type EnvSet } from '#src/env-set/index.js';

import { cloudTenantRoutes } from './cloud-tenants.js';

// Only the auth path is exercised here: a request without a bearer token must be refused before any
// database access, so the env set needs no pool.
const createApp = () => {
  const envSet = {
    tenantId: adminTenantId,
    oidc: { publicJwks: [], issuer: 'https://admin.example.com/oidc' },
    pool: {},
  } as unknown as EnvSet;

  const app = new Koa();
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      const status = (error as { status?: number }).status ?? 500;
      ctx.status = status;
      ctx.body = { message: (error as Error).message };
    }
  });
  app.use(cloudTenantRoutes(envSet).routes());
  return app.callback();
};

describe('cloud tenant routes', () => {
  it('refuses listing tenants without a bearer token', async () => {
    const response = await request(createApp()).get('/api/tenants');
    expect(response.status).toBe(401);
  });

  it('refuses reading a tenant without a bearer token', async () => {
    const response = await request(createApp()).get('/api/tenants/some-tenant');
    expect(response.status).toBe(401);
  });

  it('refuses creating a tenant without a bearer token', async () => {
    const response = await request(createApp())
      .post('/api/tenants')
      .send({ name: 'Acme', tag: 'development' });
    expect(response.status).toBe(401);
  });
});
