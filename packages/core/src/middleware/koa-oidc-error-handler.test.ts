import { type IRouterContext } from 'koa-router';
import { errors } from 'oidc-provider';

import { i18next } from '#src/utils/i18n.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithI18nContext } from './koa-i18next.js';
import koaOidcErrorHandler, { errorOut } from './koa-oidc-error-handler.js';

const { jest } = import.meta;

describe('koaOidcErrorHandler middleware', () => {
  const next = jest.fn();

  const expectErrorResponse = async (
    ctx: WithI18nContext<IRouterContext>,
    error: errors.OIDCProviderError,
    extraMatch?: Record<string, unknown>
  ) => {
    next.mockImplementationOnce(() => {
      throw error;
    });

    const out = errorOut(error);
    const code = `oidc.${out.error}`;
    await koaOidcErrorHandler()(ctx, next);
    expect(ctx.status).toBe(error.statusCode);
    expect(ctx.body).toMatchObject({
      ...out,
      code,
      message: i18next.t('errors:' + code),
      ...extraMatch,
    });
  };

  it('should throw no errors if no errors are caught', async () => {
    const ctx = createContextWithRouteParameters();
    await expect(koaOidcErrorHandler()(ctx, next)).resolves.not.toThrow();
  });

  it('should throw original error if error type is not OIDCProviderError', async () => {
    const error = new Error('err');
    const ctx = createContextWithRouteParameters();

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaOidcErrorHandler()(ctx, next)).rejects.toMatchError(error);
  });

  it('should recognize invalid scope error', async () => {
    const ctx = createContextWithRouteParameters();
    const error_description = 'Mock scope is invalid';
    const mockScope = 'read:foo';
    await expectErrorResponse(ctx, new errors.InvalidScope(error_description, mockScope));
  });

  it('should transform session not found error code', async () => {
    const ctx = createContextWithRouteParameters();
    await expectErrorResponse(ctx, new errors.SessionNotFound('session not found'), {
      code: 'session.not_found',
      message: i18next.t('errors:session.not_found'),
    });
  });

  it('should add scope in response when needed', async () => {
    const error_description = 'Insufficient scope for access_token';
    const scope = 'read:foo';
    const ctx = createContextWithRouteParameters();

    await expectErrorResponse(ctx, new errors.InsufficientScope(error_description, scope), {
      scope,
    });
  });

  it('should add error uri when available', async () => {
    const error = new errors.InvalidGrant('invalid grant');
    const ctx = createContextWithRouteParameters();

    await expectErrorResponse(ctx, error, {
      error_uri: 'https://openid.sh/debug/invalid_grant',
    });
  });

  it('should handle unrecognized oidc error', async () => {
    const unrecognizedError = { error: 'some_error', error_description: 'some error description' };
    const ctx = createContextWithRouteParameters();

    ctx.status = 500;
    ctx.body = unrecognizedError;

    await koaOidcErrorHandler()(ctx, next);

    expect(ctx.status).toBe(500);
    expect(ctx.body).toMatchObject({ ...unrecognizedError, code: 'oidc.some_error' });
  });
});
