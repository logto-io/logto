import { accountCenterSocialStatePrefix, experienceSocialStatePrefix } from '@logto/schemas';
import Koa from 'koa';
import supertest from 'supertest';
import { ZodString } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

import { mountCallbackRouter } from './callback.js';

const { jest } = import.meta;

describe('social connector form post callback', () => {
  const app = new Koa();
  mountCallbackRouter(app);
  const request = supertest(app.callback());

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should redirect to the same path with query string', async () => {
    const response = await request.post('/callback/some_connector_id').send({ some: 'data' });

    expect(response.status).toBe(303);
    expect(response.header.location).toBe('/callback/some_connector_id?some=data');
  });

  it('should redirect to account center callback when state has the account center prefix on GET', async () => {
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

  it('should redirect to account center callback when state has the account center prefix on POST', async () => {
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

  it.each([
    ['sign-in experience', `${experienceSocialStatePrefix}12345`],
    // A `state` from a custom sign-in UI, or issued before the prefix was introduced
    ['unprefixed', 'ac12345'],
  ])(
    'should not redirect to account center callback for a %s state on GET',
    async (_, state: string) => {
      const response = await request.get(`/callback/some_connector_id?state=${state}&code=abc`);

      expect(response.status).not.toBe(303);
      expect(response.header.location).toBeUndefined();
    }
  );

  it.each([
    ['sign-in experience', `${experienceSocialStatePrefix}12345`],
    // A `state` from a custom sign-in UI, or issued before the prefix was introduced
    ['unprefixed', 'ac12345'],
  ])('should redirect a %s state to the same path on POST', async (_, state: string) => {
    const response = await request.post('/callback/some_connector_id').send({ state, code: 'abc' });

    expect(response.status).toBe(303);
    const location = response.header.location!;
    expect(location).toBeDefined();
    const redirectUrl = new URL(location, 'http://localhost');
    expect(redirectUrl.pathname).toBe('/callback/some_connector_id');
    expect(redirectUrl.searchParams.get('state')).toBe(state);
    expect(redirectUrl.searchParams.get('code')).toBe('abc');
  });

  it('should redirect account social callback form post to the same path with query string', async () => {
    const response = await request
      .post('/account/callback/social/some_connector_id')
      .send({ some: 'data' });

    expect(response.status).toBe(303);
    expect(response.header.location).toBe('/account/callback/social/some_connector_id?some=data');
  });

  it.each(['/callback/some_connector_id', '/account/callback/social/some_connector_id'])(
    'should stop validating a POST %s body after 100 invalid values',
    async (path) => {
      const parseString = jest.spyOn(ZodString.prototype, '_parse');
      const body = Object.fromEntries(Array.from({ length: 10_000 }, (_, index) => [index, index]));

      const response = await request.post(path).send(body);

      expect(response.status).toBe(400);
      expect(response.text).toBe(new RequestError('oidc.invalid_request').message);
      // Each visited entry parses its key and its value
      expect(parseString).toHaveBeenCalledTimes(202);
    }
  );
});
