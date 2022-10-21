import type { LogtoErrorCode } from '@logto/phrases';
import decamelize from 'decamelize';
import type { Middleware } from 'koa';
import { errors } from 'oidc-provider';

import RequestError from '@/errors/RequestError';

/**
 * OIDC Provider Error Definition: https://github.com/panva/node-oidc-provider/blob/main/lib/helpers/errors.js
 */

export default function koaOIDCErrorHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  // Too many error types :-)
  // eslint-disable-next-line complexity
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof errors.OIDCProviderError)) {
        throw error;
      }

      const {
        status = 400,
        message,
        error_description,
        error_detail,
        name,
        expose,
        constructor,
        ...interpolation
      } = error;

      // Original OIDCProvider Error description and details are provided in the data field
      const data = { error_description, error_detail };

      switch (constructor) {
        case errors.InvalidScope:
        case errors.InvalidTarget:
        case errors.InvalidToken:
        case errors.InvalidClientMetadata:
        case errors.InvalidRedirectUri:
        case errors.AccessDenied:
        case errors.UnsupportedGrantType:
        case errors.UnsupportedResponseMode:
        case errors.UnsupportedResponseType:
        case errors.InvalidGrant:
          throw new RequestError(
            {
              // Manually mapped all OIDC error name to the LogtoErrorCode
              // eslint-disable-next-line no-restricted-syntax
              code: `oidc.${decamelize(name)}` as LogtoErrorCode,
              status,
              expose,
              ...interpolation,
            },
            data
          );
        case errors.SessionNotFound:
          throw new RequestError(
            {
              code: 'session.not_found',
              status,
              expose,
              ...interpolation,
            },
            data
          );
        case errors.InsufficientScope:
          throw new RequestError(
            {
              code: 'oidc.insufficient_scope',
              status,
              expose,
              ...interpolation,
            },
            data
          );
        default:
          throw new RequestError(
            {
              code: 'oidc.provider_error',
              status,
              expose,
              message,
            },
            data
          );
      }
    }
  };
}
