import pick from 'lodash.pick';
import { errors } from 'oidc-provider';

import OIDCRequestError from '.';
import RequestError from '../RequestError';

describe('OIDCRequestError', () => {
  it('Invalid Scope Error', () => {
    const scope = 'read:user';
    const description = 'requested scope is not allowed';

    const error = new errors.InvalidScope(description, scope);
    const normalizedError = new OIDCRequestError(error);

    expect(normalizedError instanceof RequestError).toEqual(true);
    expect(normalizedError.code).toEqual('oidc.invalid_scope');
    expect(normalizedError.status).toEqual(400);
    expect(normalizedError.data).toEqual(pick(error, 'error_description', 'error_detail'));
  });

  it('InvalidToken Error', () => {
    const description = 'token not found';

    const error = new errors.InvalidToken(description);
    const normalizedError = new OIDCRequestError(error);

    expect(normalizedError instanceof RequestError).toEqual(true);
    expect(normalizedError.code).toEqual('oidc.invalid_token');
    expect(normalizedError.status).toEqual(401);
    expect(normalizedError.data).toEqual(pick(error, 'error_description', 'error_detail'));
  });

  it('SessionNotFound Error', () => {
    const description = 'session not found';

    const error = new errors.SessionNotFound(description);
    const normalizedError = new OIDCRequestError(error);

    expect(normalizedError instanceof RequestError).toEqual(true);
    expect(normalizedError.code).toEqual('session.not_found');
    expect(normalizedError.status).toEqual(400);
    expect(normalizedError.data).toEqual(pick(error, 'error_description', 'error_detail'));
  });

  it('InsufficientScope Error', () => {
    const description = 'access token missing openid scope';
    const scope = 'openid';

    const error = new errors.InsufficientScope(description, scope);
    const normalizedError = new OIDCRequestError(error);

    expect(normalizedError instanceof RequestError).toEqual(true);
    expect(normalizedError.code).toEqual('oidc.insufficient_scope');
    expect(normalizedError.status).toEqual(403);
    expect(normalizedError.data).toEqual(pick(error, 'error_description', 'error_detail'));
  });

  it('Unknow OIDC Error', () => {
    const error = new errors.RegistrationNotSupported();
    const normalizedError = new OIDCRequestError(error);

    expect(normalizedError instanceof RequestError).toEqual(true);
    expect(normalizedError.code).toEqual('oidc.provider_error');
    expect(normalizedError.status).toEqual(error.status);
    expect(normalizedError.data).toEqual(pick(error, 'error_description', 'error_detail'));
  });
});

// TODO: need to add message assertation test with i18n mock
