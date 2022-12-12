import { errors } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaOIDCErrorHandler from './koa-oidc-error-handler.js';

const { jest } = import.meta;

describe('koaOIDCErrorHandler middleware', () => {
  const next = jest.fn();
  const ctx = createContextWithRouteParameters();

  it('should throw no errors if no errors are caught', async () => {
    await expect(koaOIDCErrorHandler()(ctx, next)).resolves.not.toThrow();
  });

  it('should throw original error if error type is not OIDCProviderError', async () => {
    const error = new Error('err');

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaOIDCErrorHandler()(ctx, next)).rejects.toMatchError(error);
  });

  it('Invalid Scope', async () => {
    const error_description = 'Mock scope is invalid';
    const mockScope = 'read:foo';
    const error = new errors.InvalidScope(error_description, mockScope);
    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaOIDCErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'oidc.invalid_scope',
          status: error.status,
          expose: true,
          scope: mockScope,
        },
        { error_description }
      )
    );
  });

  it('Session Not Found', async () => {
    const error_description = 'session not found';
    const error = new errors.SessionNotFound('session not found');

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaOIDCErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'session.not_found',
          status: error.status,
          expose: true,
        },
        {
          error_description,
        }
      )
    );
  });

  it('Insufficient Scope', async () => {
    const error_description = 'Insufficient scope for access_token';
    const scope = 'read:foo';

    const error = new errors.InsufficientScope(error_description, scope);

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaOIDCErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'oidc.insufficient_scope',
          status: error.status,
          expose: true,
          scopes: scope,
        },
        {
          error_description,
        }
      )
    );
  });

  it('Unhandled OIDCProvider Error', async () => {
    const error = new errors.AuthorizationPending();

    next.mockImplementationOnce(() => {
      throw error;
    });

    await expect(koaOIDCErrorHandler()(ctx, next)).rejects.toMatchError(
      new RequestError(
        {
          code: 'oidc.provider_error',
          status: error.status,
          expose: true,
          message: error.message,
        },
        {
          error_description: error.error_description,
          error_detail: error.error_detail,
        }
      )
    );
  });
});
