import Koa from 'koa';
import supertest from 'supertest';

import { mountCallbackRouter } from './callback.js';

describe('social connector callback routes', () => {
  const app = new Koa();
  mountCallbackRouter(app);
  const request = supertest(app.callback());

  describe('standard callback', () => {
    it('should redirect to the same path with query string', async () => {
      const response = await request.post('/callback/some_connector_id').send({ some: 'data' });

      expect(response.status).toBe(303);
      expect(response.header.location).toBe('/callback/some_connector_id?some=data');
    });
  });

  describe('CORS preflight requests', () => {
    it('should handle OPTIONS requests', async () => {
      const response = await request.options('/callback/some_connector_id');

      expect(response.status).toBe(204);
    });
  });

  describe('external callback with isExternal parameter', () => {
    it('should set cookies and redirect for form requests', async () => {
      const response = await request
        .post('/callback/google?isExternal=true')
        .type('form')
        .send({ credential: 'test_credential' });

      expect(response.status).toBe(303);
      expect(response.header.location).toMatch(/\/external-google-one-tap/);

      // Check if cookies are set
      const cookies = response.header['set-cookie'] as string[] | undefined;
      expect(cookies).toBeDefined();
      expect(
        cookies?.some((cookie: string) => cookie.includes('external-callback-data'))
      ).toBeTruthy();
      expect(
        cookies?.some((cookie: string) => cookie.includes('external-connector-id'))
      ).toBeTruthy();
    });

    it('should return JSON response for API requests', async () => {
      const response = await request
        .post('/callback/google?isExternal=true')
        .type('json')
        .send({ credential: 'test_credential' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('redirectUrl');
      expect(response.body.redirectUrl).toMatch(/\/external-google-one-tap/);
    });
  });

  describe('content type handling', () => {
    it('should handle application/json requests', async () => {
      const response = await request
        .post('/callback/some_connector_id')
        .type('json')
        .send({ some: 'data' });

      expect(response.status).toBe(303);
      expect(response.header.location).toBe('/callback/some_connector_id?some=data');
    });

    it('should handle form-urlencoded requests', async () => {
      const response = await request
        .post('/callback/some_connector_id')
        .type('form')
        .send({ some: 'data' });

      expect(response.status).toBe(303);
      expect(response.header.location).toBe('/callback/some_connector_id?some=data');
    });
  });

  // No counter-case here since `koa-body` has a high tolerance for invalid requests
});
