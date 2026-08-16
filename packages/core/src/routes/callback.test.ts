import { accountCenterSocialStatePrefix } from '@logto/schemas';
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

  it('should redirect to account center callback when state starts with ac_ on GET', async () => {
    const response = await request.get(
      `/callback/some_connector_id?state=${accountCenterSocialStatePrefix}12345&code=abc`
    );

    expect(response.status).toBe(303);
    const location = response.header.location!;
    expect(location).toBeDefined();
    const redirectUrl = new URL(location, 'http://localhost');
    expect(redirectUrl.pathname).toBe('/account/callback/social/some_connector_id');
    expect(redirectUrl.searchParams.get('state')).toBe(`${accountCenterSocialStatePrefix}12345`);
    expect(redirectUrl.searchParams.get('code')).toBe('abc');
  });

  it('should redirect to account center callback when state starts with ac_ on POST', async () => {
    const response = await request
      .post('/callback/some_connector_id')
      .send({ state: `${accountCenterSocialStatePrefix}12345`, code: 'abc' });

    expect(response.status).toBe(303);
    const location = response.header.location!;
    expect(location).toBeDefined();
    const redirectUrl = new URL(location, 'http://localhost');
    expect(redirectUrl.pathname).toBe('/account/callback/social/some_connector_id');
    expect(redirectUrl.searchParams.get('state')).toBe(`${accountCenterSocialStatePrefix}12345`);
    expect(redirectUrl.searchParams.get('code')).toBe('abc');
  });

  it('should redirect account social callback form post to the same path with query string', async () => {
    const response = await request
      .post('/account/callback/social/some_connector_id')
      .send({ some: 'data' });

    expect(response.status).toBe(303);
    expect(response.header.location).toBe('/account/callback/social/some_connector_id?some=data');
  });

  // No counter-case here since `koa-body` has a high tolerance for invalid requests
});
