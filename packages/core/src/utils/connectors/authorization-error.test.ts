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

  it('should throw on a bare `error` as well', () => {
    expect(() => {
      assertNoAuthorizationError({ error: 'server_error', app_id: 'app-id' });
    }).toThrow(ConnectorError);
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
