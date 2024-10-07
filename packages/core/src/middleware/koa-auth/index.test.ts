import { defaultManagementApi } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import type { Context } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { WithAuthContext } from './index.js';

const { jest } = import.meta;
const { mockEsmWithActual, mockEsm } = createMockUtils(jest);

await mockEsmWithActual('./utils.js', () => ({
  getAdminTenantTokenValidationSet: jest.fn().mockResolvedValue({ keys: [], issuer: [] }),
}));

const { jwtVerify } = mockEsm('jose', () => ({
  createLocalJWKSet: jest.fn(),
  jwtVerify: jest.fn().mockReturnValue({
    payload: {
      sub: 'fooUser',
      scope: defaultManagementApi.scopes.map((scope) => scope.name).join(' '),
    },
  }),
}));

const audience = defaultManagementApi.resource.indicator;
const koaAuth = await pickDefault(import('./index.js'));

describe('koaAuth middleware', () => {
  const baseCtx = createContextWithRouteParameters();

  const ctx: WithAuthContext<Context & IRouterParamContext> = {
    ...baseCtx,
    auth: {
      type: 'user',
      id: '',
      scopes: new Set(),
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
      scopes: new Set(),
    };
    ctx.request = baseCtx.request;
    jest.resetModules();
  });

  it('should read DEVELOPMENT_USER_ID from env variable first if not production and not integration test', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      developmentUserId: 'foo',
    });

    await koaAuth(mockEnvSet, audience)(ctx, next);
    expect(ctx.auth).toEqual({ type: 'user', id: 'foo', scopes: new Set(['all']) });

    stub.restore();
  });

  it('should read `development-user-id` from headers if not production and not integration test', async () => {
    const mockCtx = {
      ...ctx,
      request: {
        ...ctx.request,
        headers: { ...ctx.request.headers, 'development-user-id': 'foo' },
      },
    };

    await koaAuth(mockEnvSet, audience)(mockCtx, next);
    expect(mockCtx.auth).toEqual({ type: 'user', id: 'foo', scopes: new Set(['all']) });
  });

  it('should read DEVELOPMENT_USER_ID from env variable first if is in production and integration test', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      developmentUserId: 'foo',
      isProduction: true,
      isIntegrationTest: true,
    });

    await koaAuth(mockEnvSet, audience)(ctx, next);
    expect(ctx.auth).toEqual({ type: 'user', id: 'foo', scopes: new Set(['all']) });

    stub.restore();
  });

  it('should read `development-user-id` from headers if is in production and integration test', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
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

    await koaAuth(mockEnvSet, audience)(mockCtx, next);
    expect(mockCtx.auth).toEqual({ type: 'user', id: 'foo', scopes: new Set(['all']) });

    stub.restore();
  });

  it('should set user auth with given sub returned from accessToken', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };
    await koaAuth(mockEnvSet, audience)(ctx, next);
    expect(ctx.auth).toEqual({ type: 'user', id: 'fooUser', scopes: new Set(['all']) });
  });

  it('expect to throw if authorization header is missing', async () => {
    await expect(koaAuth(mockEnvSet, audience)(ctx, next)).rejects.toMatchError(
      authHeaderMissingError
    );
  });

  it('expect to throw if authorization header token type not recognized ', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'dummy access_token',
      },
    };

    await expect(koaAuth(mockEnvSet, audience)(ctx, next)).rejects.toMatchError(
      tokenNotSupportedError
    );
  });

  it('expect to throw if jwt sub is missing', async () => {
    jwtVerify.mockImplementationOnce(() => ({ payload: {} }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth(mockEnvSet, audience)(ctx, next)).rejects.toMatchError(jwtSubMissingError);
  });

  it('expect to have `client` type per jwt verify result', async () => {
    jwtVerify.mockImplementationOnce(() => ({
      payload: { sub: 'bar', client_id: 'bar', scope: 'all' },
    }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await koaAuth(mockEnvSet, audience)(ctx, next);
    expect(ctx.auth).toEqual({ type: 'app', id: 'bar', scopes: new Set(['all']) });
  });

  it('expect to throw if jwt scope is missing', async () => {
    jwtVerify.mockImplementationOnce(() => ({ payload: { sub: 'fooUser' } }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth(mockEnvSet, audience)(ctx, next)).rejects.toMatchError(forbiddenError);
  });

  it('expect to throw if jwt scope does not include management resource scope', async () => {
    jwtVerify.mockImplementationOnce(() => ({
      payload: { sub: 'fooUser', scope: 'foo' },
    }));

    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };

    await expect(koaAuth(mockEnvSet, audience)(ctx, next)).rejects.toMatchError(forbiddenError);
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

    await expect(koaAuth(mockEnvSet, audience)(ctx, next)).rejects.toMatchError(
      new RequestError({ code: 'auth.unauthorized', status: 401 }, new Error('unknown error'))
    );
  });
});
