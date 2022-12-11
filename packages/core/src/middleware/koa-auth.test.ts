import { UserRole } from '@logto/schemas';
import { mockEsm, pickDefault } from '@logto/shared/esm';
import type { Context } from 'koa';
import type { IRouterParamContext } from 'koa-router';

import envSet from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { WithAuthContext } from './koa-auth.js';

const { jest } = import.meta;

const { jwtVerify } = mockEsm('jose', () => ({
  jwtVerify: jest.fn().mockReturnValue({ payload: { sub: 'fooUser', role_names: ['admin'] } }),
}));

const koaAuth = await pickDefault(import('./koa-auth.js'));

describe('koaAuth middleware', () => {
  const baseCtx = createContextWithRouteParameters();

  const ctx: WithAuthContext<Context & IRouterParamContext> = {
    ...baseCtx,
    auth: {
      type: 'user',
      id: '',
    },
  };

  const jwtSubMissingError = new RequestError({ code: 'auth.jwt_sub_missing', status: 401 });
  const authHeaderMissingError = new RequestError({
    code: 'auth.authorization_header_missing',
    status: 401,
  });
  const tokenNotSupportedError = new RequestError(
    {
      code: 'auth.authorization_token_type_not_supported',
      status: 401,
    },
    { supportedTypes: ['Bearer'] }
  );
  const forbiddenError = new RequestError({ code: 'auth.forbidden', status: 403 });

  const next = jest.fn();

  beforeEach(() => {
    ctx.auth = {
      type: 'user',
      id: '',
    };
    ctx.request = baseCtx.request;
    jest.resetModules();
  });

  it('should read DEVELOPMENT_USER_ID from env variable first if not production and not integration test', async () => {
    const spy = jest
      .spyOn(envSet, 'values', 'get')
      .mockReturnValue({ ...envSet.values, developmentUserId: 'foo' });

    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual({ type: 'user', id: 'foo' });

    spy.mockRestore();
  });

  it('should read `development-user-id` from headers if not production and not integration test', async () => {
    const mockCtx = {
      ...ctx,
      request: {
        ...ctx.request,
        headers: { ...ctx.request.headers, 'development-user-id': 'foo' },
      },
    };

    await koaAuth()(mockCtx, next);
    expect(mockCtx.auth).toEqual({ type: 'user', id: 'foo' });
  });

  it('should read DEVELOPMENT_USER_ID from env variable first if is in production and integration test', async () => {
    const spy = jest.spyOn(envSet, 'values', 'get').mockReturnValue({
      ...envSet.values,
      developmentUserId: 'foo',
      isProduction: true,
      isIntegrationTest: true,
    });

    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual({ type: 'user', id: 'foo' });

    spy.mockRestore();
  });

  it('should read `development-user-id` from headers if is in production and integration test', async () => {
    const spy = jest.spyOn(envSet, 'values', 'get').mockReturnValue({
      ...envSet.values,
      isProduction: true,
      isIntegrationTest: true,
    });

    const mockCtx = {
      ...ctx,
      request: {
        ...ctx.request,
        headers: { ...ctx.request.headers, 'development-user-id': 'foo' },
      },
    };

    await koaAuth()(mockCtx, next);
    expect(mockCtx.auth).toEqual({ type: 'user', id: 'foo' });

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
    expect(ctx.auth).toEqual({ type: 'user', id: 'fooUser' });
  });

  it('expect to throw if authorization header is missing', async () => {
    await expect(koaAuth()(ctx, next)).rejects.toMatchError(authHeaderMissingError);
  });

  it('expect to throw if authorization header token type not recognized ', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'dummy access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(tokenNotSupportedError);
  });

  it('expect to throw if jwt sub is missing', async () => {
    jwtVerify.mockImplementationOnce(() => ({ payload: {} }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(jwtSubMissingError);
  });

  it('expect to have `client` type per jwt verify result', async () => {
    jwtVerify.mockImplementationOnce(() => ({ payload: { sub: 'bar', client_id: 'bar' } }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await koaAuth()(ctx, next);
    expect(ctx.auth).toEqual({ type: 'app', id: 'bar' });
  });

  it('expect to throw if jwt role_names is missing', async () => {
    jwtVerify.mockImplementationOnce(() => ({ payload: { sub: 'fooUser' } }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth(UserRole.Admin)(ctx, next)).rejects.toMatchError(forbiddenError);
  });

  it('expect to throw if jwt role_names does not include admin', async () => {
    jwtVerify.mockImplementationOnce(() => ({
      payload: { sub: 'fooUser', role_names: ['foo'] },
    }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth(UserRole.Admin)(ctx, next)).rejects.toMatchError(forbiddenError);
  });

  it('expect to throw unauthorized error if unknown error occurs', async () => {
    jwtVerify.mockImplementationOnce(() => {
      throw new Error('unknown error');
    });
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth()(ctx, next)).rejects.toMatchError(
      new RequestError({ code: 'auth.unauthorized', status: 401 }, new Error('unknown error'))
    );
  });
});
