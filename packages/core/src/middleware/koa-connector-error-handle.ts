import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-types';
import { Middleware } from 'koa';

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
        case ConnectorErrorCodes.InsufficientRequestParameters:
          throw new RequestError(
            {
              code: 'connector.insufficient_request_parameters',
              status: 400,
            },
            data
          );
        case ConnectorErrorCodes.InvalidConfig:
          throw new RequestError(
            {
              code: 'connector.invalid_config',
              status: 400,
            },
            data
          );
        case ConnectorErrorCodes.InvalidResponse:
          throw new RequestError(
            {
              code: 'connector.invalid_response',
              status: 400,
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
        case ConnectorErrorCodes.SocialAuthCodeInvalid:
          throw new RequestError(
            {
              code: 'connector.oauth_code_invalid',
              status: 401,
            },
            data
          );
        case ConnectorErrorCodes.SocialAccessTokenInvalid:
          throw new RequestError(
            {
              code: 'connector.invalid_access_token',
              status: 401,
            },
            data
          );
        case ConnectorErrorCodes.SocialIdTokenInvalid:
          throw new RequestError(
            {
              code: 'connector.invalid_id_token',
              status: 401,
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
