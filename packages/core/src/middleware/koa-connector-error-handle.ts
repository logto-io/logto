import { Middleware } from 'koa';

import { ConnectorError, ConnectorErrorCodes } from '@/connectors/types';
import RequestError from '@/errors/RequestError';

export default function koaConnectorErrorHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof ConnectorError)) {
        throw error;
      }

      const { code, message } = error;

      // Original OIDCProvider Error description and details are provided in the data field
      const data = { message };

      switch (code) {
        case ConnectorErrorCodes.InvalidConfig:
          throw new RequestError(
            {
              code: 'connector.invalid_config',
              status: 400,
            },
            data
          );
        case ConnectorErrorCodes.SocialAccessTokenInvalid:
          throw new RequestError(
            {
              code: 'connector.access_token_invalid',
              status: 401,
            },
            data
          );
        case ConnectorErrorCodes.SocialAuthCodeInvalid:
          throw new RequestError(
            {
              code: 'connector.oauth_code_invalid',
              status: 401,
            },
            data
          );
        case ConnectorErrorCodes.TemplateNotFound:
          throw new RequestError(
            {
              code: 'connector.template_not_found',
              status: 500,
            },
            data
          );

        default:
          throw new RequestError(
            {
              code: 'connector.general',
              status: 500,
            },
            data
          );
      }
    }
  };
}
