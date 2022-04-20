import { jwtVerify } from 'jose/jwt/verify';
import { Context } from 'koa';
import { IRouterParamContext } from 'koa-router';

import RequestError from '@/errors/RequestError';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaAuth, { WithAuthContext } from './koa-auth';

jest.mock('jose/jwt/verify', () => ({
  jwtVerify: jest.fn(() => ({ payload: { sub: 'fooUser' } })),
}));

describe('koaAuth middleware', () => {
  const baseCtx = createContextWithRouteParameters();

  const ctx: WithAuthContext<Context & IRouterParamContext> = {
    ...baseCtx,
    auth: '',
  };

  const unauthorizedError = new RequestError({ code: 'auth.unauthorized', status: 401 });

  const next = jest.fn();

  beforeEach(() => {
    ctx.auth = '';
    ctx.request = baseCtx.request;
    jest.resetModules();
  });

  it('should read DEVELOPMENT_USER_ID from env variable first if not production', async () => {
    // Mock the @/env/consts
    process.env.DEVELOPMENT_USER_ID = 'foo';

    /* eslint-disable @typescript-eslint/no-require-imports */
    /* eslint-disable @typescript-eslint/no-var-requires */
    /* eslint-disable unicorn/prefer-module */
    const koaAuthModule = require('./koa-auth') as { default: typeof koaAuth };
    /* eslint-enable @typescript-eslint/no-require-imports */
    /* eslint-enable @typescript-eslint/no-var-requires */
    /* eslint-enable unicorn/prefer-module */

    await koaAuthModule.default()(ctx, next);
    expect(ctx.auth).toEqual('foo');
  });

  it('should set user auth with given sub returned from accessToken', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };
    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual('fooUser');
  });

  it('expect to throw if authorization header is missing', async () => {
    await expect(koaAuth()(ctx, next)).rejects.toMatchError(unauthorizedError);
  });

  it('expect to throw if authorization header token type not recognized ', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'dummy access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(unauthorizedError);
  });

  it('expect to throw if jwt sub is missing', async () => {
    const mockJwtVerify = jwtVerify as jest.Mock;
    mockJwtVerify.mockImplementationOnce(() => ({ payload: {} }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(unauthorizedError);
  });
});
