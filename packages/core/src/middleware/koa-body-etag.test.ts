import { Readable } from 'node:stream';

import Koa from 'koa';
import request from 'supertest';

import koaBodyEtag from './koa-body-etag.js';

const createRequester = (getBody: () => unknown, type?: string) => {
  const app = new Koa();
  app.use(koaBodyEtag());
  app.use(async (ctx) => {
    if (type) {
      ctx.type = type;
    }

    ctx.body = getBody();
  });

  return request(app.callback());
};

describe('koaBodyEtag()', () => {
  it('sets an ETag for JSON bodies and answers a conditional GET with 304', async () => {
    const requester = createRequester(() => ({ hello: 'world' }));
    const first = await requester.get('/');

    expect(first.status).toBe(200);
    expect(first.headers.etag).toBeDefined();

    const second = await requester.get('/').set('If-None-Match', first.headers.etag!);

    expect(second.status).toBe(304);
    expect(second.text).toBe('');
  });

  it('does not set an ETag for streamed bodies or answer 304 from a stale tag', async () => {
    const first = await createRequester(() => Readable.from('first download'), 'text/plain').get(
      '/'
    );

    expect(first.status).toBe(200);
    expect(first.headers.etag).toBeUndefined();
    expect(first.text).toBe('first download');

    const staleTag = first.headers.etag ?? '"stale"';
    const second = await createRequester(() => Readable.from('second download'), 'text/plain')
      .get('/')
      .set('If-None-Match', staleTag);

    expect(second.status).toBe(200);
    expect(second.text).toBe('second download');
  });
});
