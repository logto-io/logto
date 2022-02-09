import { LogtoErrorCode } from '@logto/phrases';
import decamelize from 'decamelize';
import { errors } from 'oidc-provider';

import RequestError from '../RequestError';

export default class OIDCRequestError extends RequestError {
  constructor(error: errors.OIDCProviderError) {
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
        super(
          {
            code: `oidc.${decamelize(name)}` as LogtoErrorCode,
            status,
            expose,
            ...interpolation,
          },
          data
        );
        break;
      case errors.SessionNotFound:
        super(
          {
            code: 'session.not_found',
            status,
            expose,
            ...interpolation,
          },
          data
        );
        break;
      case errors.InsufficientScope:
        super(
          {
            code: 'oidc.insufficient_scope',
            status,
            expose,
            scopes: error_detail,
          },
          data
        );
        break;
      default:
        super(
          {
            code: 'oidc.provider_error',
            status,
            expose,
            message,
          },
          data
        );
        break;
    }
  }
}
