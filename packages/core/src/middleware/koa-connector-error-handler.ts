import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';
import { conditional, trySafe } from '@silverhand/essentials';
import type { Middleware } from 'koa';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { formatZodError } from '#src/errors/utils/index.js';

export default function koaConnectorErrorHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  // Too many error types :-)
  // eslint-disable-next-line complexity
  return async (_, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof ConnectorError)) {
        throw error;
      }

      const { code, data, zodError, name } = error;
      const requestErrorData = {
        data,
        name,
        zodErrorMessage: conditional(zodError && formatZodError(zodError).join('\n')),
      };

      const errorDescriptionGuard = z.object({ errorDescription: z.string() });
      const message = trySafe(() => errorDescriptionGuard.parse(data))?.errorDescription;

      switch (code) {
        case ConnectorErrorCodes.InvalidMetadata:
        case ConnectorErrorCodes.InvalidConfigGuard:
        case ConnectorErrorCodes.InvalidRequestParameters:
        case ConnectorErrorCodes.InsufficientRequestParameters:
        case ConnectorErrorCodes.InvalidConfig:
        case ConnectorErrorCodes.InvalidResponse: {
          throw new RequestError({ code: `connector.${code}`, status: 400 }, requestErrorData);
        }

        case ConnectorErrorCodes.SocialAuthCodeInvalid:
        case ConnectorErrorCodes.SocialAccessTokenInvalid:
        case ConnectorErrorCodes.SocialIdTokenInvalid:
        case ConnectorErrorCodes.AuthorizationFailed: {
          throw new RequestError({ code: `connector.${code}`, status: 401 }, requestErrorData);
        }

        case ConnectorErrorCodes.TemplateNotFound: {
          throw new RequestError(
            {
              code: `connector.${code}`,
              status: 400,
            },
            requestErrorData
          );
        }

        case ConnectorErrorCodes.NotImplemented: {
          throw new RequestError({ code: `connector.${code}`, status: 501 }, requestErrorData);
        }

        case ConnectorErrorCodes.RateLimitExceeded: {
          throw new RequestError({ code: `connector.${code}`, status: 429 }, requestErrorData);
        }

        default: {
          throw new RequestError(
            {
              code: `connector.${code}`,
              status: 400, // Temporarily use 400 to avoid false positives. May update later.
              errorDescription: message,
            },
            requestErrorData
          );
        }
      }
    }
  };
}
