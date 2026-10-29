import { ConnectorError, ConnectorErrorCodes } from '@logto/connector-kit';

import { assertNoAuthorizationError } from './authorization-error.js';

describe('assertNoAuthorizationError()', () => {
  it('should throw `AuthorizationFailed` with the provider error on an error response', () => {
    const callback = {
      error: 'access_denied',
      error_description: 'AADSTS65004: User declined to consent to access the app.',
      error_subcode: 'cancel',
      state: 'state',
      redirectUri: 'https://logto.example.com/callback/connector-id',
    };

    expect(() => {
      assertNoAuthorizationError(callback);
    }).toThrow(ConnectorError);

    try {
      assertNoAuthorizationError(callback);
    } catch (error: unknown) {
      expect(error).toMatchObject({
        code: ConnectorErrorCodes.AuthorizationFailed,
        data: {
          error: 'access_denied',
          error_description: 'AADSTS65004: User declined to consent to access the app.',
        },
      });
      // Only the standard error response fields are kept
      expect(error).toHaveProperty('data', {
        error: 'access_denied',
        error_description: 'AADSTS65004: User declined to consent to access the app.',
      });
    }
  });

  it('should throw on a bare `access_denied` as well', () => {
    expect(() => {
      assertNoAuthorizationError({ error: 'access_denied', app_id: 'app-id' });
    }).toThrow(ConnectorError);
  });

  it('should throw on the cancellation codes of Sign in with Apple and LinkedIn', () => {
    for (const error of ['user_cancelled_authorize', 'user_cancelled_login']) {
      expect(() => {
        assertNoAuthorizationError({ error, state: 'state' });
      }).toThrow(new ConnectorError(ConnectorErrorCodes.AuthorizationFailed, { error }));
    }
  });

  it('should leave the other error codes to the connector', () => {
    for (const error of ['server_error', 'redirect_uri_mismatch', 'invalid_scope']) {
      expect(() => {
        assertNoAuthorizationError({ error, error_description: 'details' });
      }).not.toThrow();
    }
  });

  it('should let an authorization result through', () => {
    expect(() => {
      assertNoAuthorizationError({ code: 'auth-code', state: 'state' });
    }).not.toThrow();
    expect(() => {
      assertNoAuthorizationError({ credential: 'google-one-tap-credential' });
    }).not.toThrow();
    expect(() => {
      assertNoAuthorizationError({ error: '' });
    }).not.toThrow();
  });

  it('should ignore data that is not an object', () => {
    expect(() => {
      assertNoAuthorizationError(null);
    }).not.toThrow();
    expect(() => {
      assertNoAuthorizationError('access_denied');
    }).not.toThrow();
  });
});
