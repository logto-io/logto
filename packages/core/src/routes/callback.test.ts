import Koa from 'koa';
import supertest from 'supertest';

import { mountCallbackRouter } from './callback.js';

describe('social connector form post callback', () => {
  const app = new Koa();
  mountCallbackRouter(app);
  const request = supertest(app.callback());

  it('should redirect to the same path with query string', async () => {
    const response = await request.post('/callback/some_connector_id').send({ some: 'data' });

    expect(response.status).toBe(303);
    expect(response.header.location).toBe('/callback/some_connector_id?some=data');
  });

  // No counter-case here since `koa-body` has a high tolerance for invalid requests
});
