import i18next from 'i18next';
import { type Context } from 'koa';
import { errors } from 'oidc-provider';

import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaOidcErrorHandler, { errorOut } from './koa-oidc-error-handler.js';

const { jest } = import.meta;

describe('koaOidcErrorHandler middleware', () => {
  const next = jest.fn();

  const expectErrorResponse = async (
    ctx: Context,
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
    const ctx = createContextWithRouteParameters();
    const error = new Error('err');

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
    const ctx = createContextWithRouteParameters();
    const error_description = 'Insufficient scope for access_token';
    const scope = 'read:foo';

    await expectErrorResponse(ctx, new errors.InsufficientScope(error_description, scope), {
      scope,
    });
  });

  it('should add error uri when available', async () => {
    const ctx = createContextWithRouteParameters();
    const error = new errors.InvalidGrant('invalid grant');

    await expectErrorResponse(ctx, error, {
      error_uri: 'https://openid.sh/debug/invalid_grant',
    });
  });

  it('should handle unrecognized oidc error', async () => {
    const ctx = createContextWithRouteParameters();
    const unrecognizedError = { error: 'some_error', error_description: 'some error description' };

    ctx.status = 500;
    ctx.body = unrecognizedError;

    await koaOidcErrorHandler()(ctx, next);

    expect(ctx.status).toBe(500);
    expect(ctx.body).toMatchObject({ ...unrecognizedError, code: 'oidc.some_error' });
  });
});
