import { DomainVerificationFileContentType } from '@logto/schemas';
import Koa from 'koa';
import request from 'supertest';

import { mockDomain } from '#src/__mocks__/domain.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import koaServeDomainVerificationFiles from './koa-serve-domain-verification-files.js';

const { jest } = import.meta;

const verificationFile = {
  path: '/MP_verify_example.txt',
  content: 'verification-content',
  contentType: DomainVerificationFileContentType.Text,
};

const findDomain = jest.fn(async () => ({
  ...mockDomain,
  verificationFiles: [verificationFile],
}));
const queries = new MockQueries({ domains: { findDomain } });

const createRequester = () => {
  const app = new Koa();

  app.use(koaServeDomainVerificationFiles(`https://${mockDomain.domain}`, queries));

  return request(app.callback());
};

describe('koaServeDomainVerificationFiles', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('serves an exact verification file match', async () => {
    const response = await createRequester().get(verificationFile.path).expect(200);

    expect(response.text).toBe(verificationFile.content);
    expect(response.headers['content-type']).toMatch(/^text\/plain/);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(findDomain).toHaveBeenCalledWith(mockDomain.domain);
  });

  it('supports HEAD without returning the content', async () => {
    const response = await createRequester().head(verificationFile.path).expect(200);

    expect(response.text).toBeUndefined();
    expect(response.headers['content-length']).toBe(
      String(Buffer.byteLength(verificationFile.content))
    );
  });

  it('does not query the domain for paths outside the verification file boundary', async () => {
    await createRequester().get('/nested/verification.txt').expect(404);

    expect(findDomain).not.toHaveBeenCalled();
  });

  it('does not override an existing Logto response', async () => {
    const app = new Koa();

    app.use(async (ctx, next) => {
      ctx.body = 'existing-response';

      return next();
    });
    app.use(koaServeDomainVerificationFiles(`https://${mockDomain.domain}`, queries));

    await request(app.callback())
      .get(verificationFile.path)
      .expect(200)
      .expect('existing-response');
    expect(findDomain).not.toHaveBeenCalled();
  });

  it('returns 404 when no configured path matches', async () => {
    await createRequester().get('/not-configured.txt').expect(404);

    expect(findDomain).toHaveBeenCalledWith(mockDomain.domain);
  });
});
