import { pickDefault } from '@logto/shared/esm';
import type { Context } from 'koa';
import type { IRouterParamContext } from 'koa-router';
import Provider from 'oidc-provider';
import Sinon from 'sinon';

import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { WithAuthContext } from './index.js';

const { jest } = import.meta;

const provider = new Provider('https://logto.test');
const mockAccessToken = {
  accountId: 'fooUser',
  clientId: 'fooClient',
  scopes: new Set(['openid']),
};

const koaOidcAuth = await pickDefault(import('./koa-oidc-auth.js'));

afterEach(() => {
  Sinon.restore();
});

describe('koaOidcAuth middleware', () => {
  const baseCtx = createContextWithRouteParameters();

  const ctx: WithAuthContext<Context & IRouterParamContext> = {
    ...baseCtx,
    auth: {
      type: 'user',
      id: '',
      scopes: new Set(),
    },
  };

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
  const unauthorizedError = new RequestError({ code: 'auth.unauthorized', status: 401 });
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

  it('should set user auth with given sub returned from accessToken', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };
    Sinon.stub(provider.AccessToken, 'find').resolves(mockAccessToken);
    await koaOidcAuth(provider)(ctx, next);
    expect(ctx.auth).toEqual({ type: 'user', id: 'fooUser', scopes: new Set(['openid']) });
  });

  it('expect to throw if authorization header is missing', async () => {
    await expect(koaOidcAuth(provider)(ctx, next)).rejects.toMatchError(authHeaderMissingError);
  });

  it('expect to throw if authorization header token type not recognized ', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'dummy access_token',
      },
    };

    await expect(koaOidcAuth(provider)(ctx, next)).rejects.toMatchError(tokenNotSupportedError);
  });

  it('expect to throw if access token is not found', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };
    Sinon.stub(provider.AccessToken, 'find').resolves();

    await expect(koaOidcAuth(provider)(ctx, next)).rejects.toMatchError(unauthorizedError);
  });

  it('expect to throw if sub is missing', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };
    Sinon.stub(provider.AccessToken, 'find').resolves({
      ...mockAccessToken,
      accountId: undefined,
    });

    await expect(koaOidcAuth(provider)(ctx, next)).rejects.toMatchError(unauthorizedError);
  });

  it('expect to throw if access token does not have openid scope', async () => {
    ctx.request = {
      ...ctx.request,
      headers: {
        authorization: 'Bearer access_token',
      },
    };
    Sinon.stub(provider.AccessToken, 'find').resolves({
      ...mockAccessToken,
      scopes: new Set(['foo']),
    });

    await expect(koaOidcAuth(provider)(ctx, next)).rejects.toMatchError(forbiddenError);
  });
});
