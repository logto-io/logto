import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-core';
import { conditional } from '@silverhand/essentials';
import { Middleware } from 'koa';
import { z } from 'zod';

import RequestError from '@/errors/RequestError';

export default function koaConnectorErrorHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof ConnectorError)) {
        throw error;
      }

      const { code, data } = error;

      const errorDescriptionGuard = z.object({ errorDescription: z.string() });
      const result = errorDescriptionGuard.safeParse(data);
      const errorMessage = conditional(result.success && '\n' + result.data.errorDescription);
      const code = `connector.${code}`;

      switch (code) {
        case ConnectorErrorCodes.InvalidMetadata:
        case ConnectorErrorCodes.InvalidConfigGuard:
        case ConnectorErrorCodes.InsufficientRequestParameters:
        case ConnectorErrorCodes.InvalidConfig:
        case ConnectorErrorCodes.InvalidResponse:
          throw new RequestError({ code: `connector.${code}`, status: 400 }, data);
        case ConnectorErrorCodes.SocialAuthCodeInvalid:
        case ConnectorErrorCodes.SocialAccessTokenInvalid:
        case ConnectorErrorCodes.SocialIdTokenInvalid:
        case ConnectorErrorCodes.AuthorizationFailed:
          throw new RequestError({ code: `connector.${code}`, status: 401 }, data);
        case ConnectorErrorCodes.TemplateNotFound:
          throw new RequestError(
            {
              code: `connector.${code}`,
              status: 500,
            },
            data
          );
        case ConnectorErrorCodes.NotImplemented:
          throw new RequestError({ code: `connector.${code}`, status: 501 }, data);

        default:
          throw new RequestError(
            {
              code: `connector.${code}`,
              status: 500,
              errorDescription: errorMessage,
            },
            data
          );
      }
    }
  };
}
