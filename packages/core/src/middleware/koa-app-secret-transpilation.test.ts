import { type Context } from 'koa';
import { type IRouterParamContext } from 'koa-router';

import { MockQueries } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaAppSecretTranspilation from './koa-app-secret-transpilation.js';

const { jest } = import.meta;

describe('koaAppSecretTranspilation middleware', () => {
  const next = jest.fn();
  const findByCredentials = jest.fn();
  const queries = new MockQueries({ applicationSecrets: { findByCredentials } });

  type Values = {
    authorization?: string;
    body?: Record<string, unknown>;
    query?: Record<string, unknown>;
  };

  const expectNothingChanged = (
    ctx: Context & IRouterParamContext,
    { authorization, body, query }: Values = {},
    calledCount = 0
  ) => {
    expect(ctx.headers.authorization).toBe(authorization);
    expect(ctx.request.body).toStrictEqual(body);
    expect(ctx.query).toStrictEqual(query);
    expect(findByCredentials).toHaveBeenCalledTimes(calledCount);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should do nothing if no credentials are found', async () => {
    const ctx = createContextWithRouteParameters();
    await koaAppSecretTranspilation(queries)(ctx, next);
    expectNothingChanged(ctx);
  });

  it('should do nothing if Authorization header is not valid', async () => {
    const ctx = createContextWithRouteParameters();

    for (const authorization of [
      'Bearer',
      'Bearer invalid',
      'Basic invalid',
      `Basic ${Buffer.from('\u0019:1').toString('base64')}`,
    ]) {
      ctx.headers.authorization = authorization;
      // eslint-disable-next-line no-await-in-loop
      await koaAppSecretTranspilation(queries)(ctx, next);
      expectNothingChanged(ctx, { authorization });
    }
  });

  it('should do nothing if params are not valid', async () => {
    const ctx = createContextWithRouteParameters();

    ctx.method = 'POST';
    for (const body of [
      {},
      { client_id: 1 },
      { client_secret: 1 },
      { client_id: '1', client_secret: 1 },
    ]) {
      ctx.request.body = body;
      // eslint-disable-next-line no-await-in-loop
      await koaAppSecretTranspilation(queries)(ctx, next);
      expectNothingChanged(ctx, { body });
    }

    ctx.method = 'GET';
    for (const query of [
      {},
      { client_id: 1 },
      { client_secret: 1 },
      { client_id: '1', client_secret: 1 },
    ]) {
      ctx.request.body = undefined;
      // @ts-expect-error
      ctx.query = query;
      // eslint-disable-next-line no-await-in-loop
      await koaAppSecretTranspilation(queries)(ctx, next);
      expectNothingChanged(ctx, { query });
    }
  });

  it('should do nothing if client credentials have the wrong combination', async () => {
    const ctx = createContextWithRouteParameters();

    for (const [authorization, body] of [
      ['Basic ' + Buffer.from('1:').toString('base64'), { client_id: '2', client_secret: '1' }],
      ['Basic ' + Buffer.from('1:1').toString('base64'), { client_id: '1', client_secret: '1' }],
    ] as const) {
      ctx.headers.authorization = authorization;
      ctx.method = 'POST';
      ctx.request.body = body;
      // eslint-disable-next-line no-await-in-loop
      await koaAppSecretTranspilation(queries)(ctx, next);
      expectNothingChanged(ctx, { authorization, body });
    }
  });

  it('should do nothing if client credentials cannot be found', async () => {
    const ctx = createContextWithRouteParameters();
    const authorization = 'Basic ' + Buffer.from('1:1').toString('base64');
    ctx.headers.authorization = authorization;
    await koaAppSecretTranspilation(queries)(ctx, next);
    expectNothingChanged(ctx, { authorization }, 1);
  });

  it('should throw an error if client credentials are expired', async () => {
    const ctx = createContextWithRouteParameters();
    const authorization = 'Basic ' + Buffer.from('1:1').toString('base64');
    ctx.headers.authorization = authorization;
    findByCredentials.mockResolvedValueOnce({ expiresAt: new Date(Date.now() - 1000) });
    await expect(koaAppSecretTranspilation(queries)(ctx, next)).rejects.toThrowError(
      'invalid_request'
    );
    expectNothingChanged(ctx, { authorization }, 1);
  });

  it('should rewrite the client secret in the header', async () => {
    const ctx = createContextWithRouteParameters();
    const authorization = 'Basic ' + Buffer.from('1:1').toString('base64');
    ctx.headers.authorization = authorization;
    findByCredentials.mockResolvedValueOnce({ originalSecret: '2' });
    await koaAppSecretTranspilation(queries)(ctx, next);
    expect(ctx.headers.authorization).toBe('Basic ' + Buffer.from('1:2').toString('base64'));
  });

  it('should rewrite the client secret in the body', async () => {
    const ctx = createContextWithRouteParameters();
    const body = { client_id: '1', client_secret: '1' };
    ctx.method = 'POST';
    ctx.request.body = body;
    findByCredentials.mockResolvedValueOnce({ originalSecret: '2' });
    await koaAppSecretTranspilation(queries)(ctx, next);
    expect(ctx.request.body.client_secret).toBe('2');
  });

  it('should rewrite the client secret in the query', async () => {
    const ctx = createContextWithRouteParameters();
    const query = { client_id: '1', client_secret: '1' };
    ctx.method = 'GET';
    ctx.query = query;
    findByCredentials.mockResolvedValueOnce({ originalSecret: '2' });
    await koaAppSecretTranspilation(queries)(ctx, next);
    expect(ctx.query.client_secret).toBe('2');
  });
});
