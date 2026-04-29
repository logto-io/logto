import Koa from 'koa';
import request from 'supertest';

import koaJwksCacheControl, {
  cacheControlHeader,
  jwksBrowserCacheControl,
  jwksPath,
} from './koa-jwks-cache-control.js';

const createRequester = () => {
  const app = new Koa();

  app.use(koaJwksCacheControl());
  app.use(async (ctx) => {
    ctx.body = { ok: true };
  });

  return request(app.callback());
};

describe('koaJwksCacheControl', () => {
  it('sets browser revalidation policy for OIDC JWKS requests', async () => {
    await createRequester()
      .get(jwksPath)
      .expect(cacheControlHeader, jwksBrowserCacheControl)
      .expect(200);
  });

  it('does not set cache control for non-JWKS requests', async () => {
    const response = await createRequester().get('/.well-known/openid-configuration').expect(200);

    expect(response.headers['cache-control']).toBeUndefined();
  });
});
