import { LogtoErrorCode, LogtoErrorI18nKey } from '@logto/phrases';
import { RequestErrorBody } from '@logto/schemas';
import decamelize from 'decamelize';
import i18next from 'i18next';
import pick from 'lodash.pick';
import { errors } from 'oidc-provider';

export default class OIDCRequestError extends Error {
  code: LogtoErrorCode;
  status: number;
  expose: boolean;
  data: unknown;

  constructor(error: errors.OIDCProviderError) {
    const {
      status = 400,
      message,
      error_description,
      error_detail,
      name,
      expose = true,
      constructor,
      ...interpolation
    } = error;

    super(message);

    switch (constructor) {
      case errors.InvalidScope:
      case errors.InvalidTarget:
      case errors.InvalidToken:
      case errors.InvalidClientMetadata:
      case errors.InvalidGrant:
        this.code = `oidc.${decamelize(name)}` as LogtoErrorCode;
        this.message = i18next.t<string, LogtoErrorI18nKey>(`errors:${this.code}`, interpolation);
        break;
      case errors.SessionNotFound:
        this.code = 'session.not_found';
        this.message = i18next.t<string, LogtoErrorI18nKey>(`errors:${this.code}`, interpolation);
        break;
      case errors.InsufficientScope:
        this.code = 'oidc.insufficient_scope';
        this.message = i18next.t<string, LogtoErrorI18nKey>(`errors:${this.code}`, {
          scopes: error_detail,
        });
        break;
      default:
        this.code = 'oidc.provider_error';
        this.message = i18next.t<string, LogtoErrorI18nKey>(`errors:${this.code}`, {
          message: this.message,
        });
        break;
    }

    this.status = status;
    this.expose = expose;

    // Original OIDCProvider Error description and details are provided in the data field
    this.data = { error_description, error_detail };
  }

  get body(): RequestErrorBody {
    return pick(this, 'message', 'code', 'data');
  }
}
