import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';

import { MockTenant } from '#src/test-utils/tenant.js';

import kuboRoutes from './kubo.js';
import { type ManagementApiRouter } from './types.js';

const { jest } = import.meta;

const createApp = () => {
  const app = new Koa();
  const router: ManagementApiRouter = new Router();

  kuboRoutes(router, new MockTenant());
  app.use(router.routes());

  return app.callback();
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('Kubo routes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes a stack with server-derived confirmation and the requested purge setting', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ deleted: true }));

    const response = await request(createApp()).delete(
      '/kubo/stacks/team-a/foundation?confirm=wrong&purge=true'
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ deleted: true });
    const [url, init] = fetchSpy.mock.calls[0] ?? [];
    expect(String(url)).toBe(
      'http://kubo-portal.kubo-system.svc.cluster.local:9090/api/stacks/team-a/foundation?confirm=team-a&purge=true'
    );
    expect(init?.method).toBe('DELETE');
  });

  it('rejects invalid stack coordinates before contacting Kubo', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch');

    const response = await request(createApp()).delete('/kubo/stacks/INVALID/foundation');

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'kubo.invalid_name' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reports an upstream deletion rejection as an error', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ error: 'blocked' }, 409));

    const response = await request(createApp()).delete('/kubo/stacks/team-a/foundation');

    expect(response.status).toBe(502);
    expect(response.body).toMatchObject({ code: 'kubo.upstream_error' });
  });
});
