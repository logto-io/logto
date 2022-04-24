import { jwtVerify } from 'jose';
import { Context } from 'koa';
import { IRouterParamContext } from 'koa-router';

import envSet from '@/env-set';
import RequestError from '@/errors/RequestError';
import { createContextWithRouteParameters } from '@/utils/test-utils';

import koaAuth, { WithAuthContext } from './koa-auth';

jest.mock('jose', () => ({
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
    const spy = jest
      .spyOn(envSet, 'values', 'get')
      .mockReturnValue({ ...envSet.values, developmentUserId: 'foo' });

    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual('foo');

    spy.mockRestore();
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
