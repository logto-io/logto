import { ApplicationType, CustomClientMetadataKey, GrantType } from '@logto/schemas';

import {
  isOriginAllowed,
  buildOidcClientMetadata,
  getConstantClientMetadata,
  validateCustomClientMetadata,
} from './utils.js';

describe('getConstantClientMetadata()', () => {
  expect(getConstantClientMetadata(ApplicationType.SPA)).toEqual({
    application_type: 'web',
    grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken],
    token_endpoint_auth_method: 'none',
  });
  expect(getConstantClientMetadata(ApplicationType.Native)).toEqual({
    application_type: 'native',
    grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken],
    token_endpoint_auth_method: 'none',
  });
  expect(getConstantClientMetadata(ApplicationType.Traditional)).toEqual({
    application_type: 'web',
    grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken],
    token_endpoint_auth_method: 'client_secret_basic',
  });
  expect(getConstantClientMetadata(ApplicationType.MachineToMachine)).toEqual({
    application_type: 'web',
    grant_types: [GrantType.ClientCredentials],
    token_endpoint_auth_method: 'client_secret_basic',
    response_types: [],
  });
});

describe('buildOidcClientMetadata()', () => {
  const metadata = {
    redirectUris: ['logto.dev'],
    postLogoutRedirectUris: ['logto.dev'],
    logoUri: 'logto.pnf',
  };
  expect(buildOidcClientMetadata()).toEqual({ redirectUris: [], postLogoutRedirectUris: [] });
  expect(buildOidcClientMetadata(metadata)).toEqual(metadata);
});

describe('validateMetadata', () => {
  describe('corsAllowedOrigins', () => {
    it('should not throw when corsAllowedOrigins is empty', () => {
      expect(() => {
        validateCustomClientMetadata('corsAllowedOrigins', []);
      }).not.toThrow();
    });

    it('should not throw when corsAllowedOrigins are all valid', () => {
      expect(() => {
        validateCustomClientMetadata('corsAllowedOrigins', [
          'http://localhost:3001',
          'https://logto.dev',
        ]);
      }).not.toThrow();
    });

    it('should throw when corsAllowedOrigins are not all valid', () => {
      expect(() => {
        validateCustomClientMetadata('corsAllowedOrigins', ['', 'logto.dev']);
      }).toThrow();
    });
  });

  describe.each(['idTokenTtl', 'refreshTokenTtl'])('%s', (ttlKey) => {
    test(`${ttlKey} should not throw when it is a number`, () => {
      expect(() => {
        validateCustomClientMetadata(ttlKey, 5000);
      }).not.toThrow();
    });

    test(`${ttlKey} should throw when it is not a number`, () => {
      expect(() => {
        validateCustomClientMetadata(ttlKey, 'string_value');
      }).toThrow();
    });
  });
});

describe('isOriginAllowed', () => {
  it('should return false if there is no corsAllowOrigins', () => {
    expect(isOriginAllowed('https://logto.dev', {})).toBeFalsy();
  });

  it('should return false if corsAllowOrigins is empty', () => {
    expect(
      isOriginAllowed('https://logto.dev', { [CustomClientMetadataKey.CorsAllowedOrigins]: [] })
    ).toBeFalsy();
  });

  it('should return false if corsAllowOrigins do not include the origin', () => {
    expect(
      isOriginAllowed('http://localhost:3001', {
        [CustomClientMetadataKey.CorsAllowedOrigins]: ['https://logto.dev'],
      })
    ).toBeFalsy();
  });

  it('should return true if corsAllowOrigins include the origin', () => {
    expect(
      isOriginAllowed('https://logto.dev', {
        [CustomClientMetadataKey.CorsAllowedOrigins]: ['https://logto.dev'],
      })
    ).toBeTruthy();
  });

  it('should return true if redirectUris include the origin', () => {
    expect(
      isOriginAllowed(
        'https://logto.dev',
        {
          [CustomClientMetadataKey.CorsAllowedOrigins]: [],
        },
        ['https://logto.dev/callback']
      )
    ).toBeTruthy();
  });
});
