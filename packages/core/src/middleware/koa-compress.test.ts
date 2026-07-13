import Koa from 'koa';
import koaCompress from 'koa-compress';
import request from 'supertest';

/**
 * Regression net for the `koa-compress` version we ship (found during the Koa 3 upgrade):
 * every 5.2.x release turns a request whose `Accept-Encoding` rules out all supported
 * encodings (e.g. `identity;q=0`) into a 500 by writing an `undefined` `Content-Encoding`,
 * while 5.1.x answers 406. We stay on 5.1.1 until upstream fixes the negotiation path;
 * these tests fail loudly if a broken version ever gets resolved, whatever the route.
 */
const createApp = () => {
  const app = new Koa();
  app.use(koaCompress());
  app.use((ctx) => {
    ctx.type = 'application/json';
    ctx.body = JSON.stringify({ data: 'x'.repeat(4096) });
  });
  return app.callback();
};

describe('koa-compress content negotiation', () => {
  it('compresses when the client accepts gzip', async () => {
    const response = await request(createApp()).get('/').set('Accept-Encoding', 'gzip');
    expect(response.status).toBe(200);
    expect(response.headers['content-encoding']).toBe('gzip');
  });

  it('answers 406 (not 500) when the client rules out every supported encoding', async () => {
    const response = await request(createApp()).get('/').set('Accept-Encoding', 'identity;q=0');
    expect(response.status).toBe(406);
  });

  it('answers 406 (not 500) when only unsupported encodings are acceptable', async () => {
    const response = await request(createApp())
      .get('/')
      .set('Accept-Encoding', 'foo, identity;q=0');
    expect(response.status).toBe(406);
  });
});
