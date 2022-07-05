import { ApplicationType, CustomClientMetadataKey } from '@logto/schemas';

import {
  isOriginAllowed,
  buildOidcClientMetadata,
  getApplicationTypeString,
  validateCustomClientMetadata,
} from './utils';

it('getApplicationTypeString', () => {
  expect(getApplicationTypeString(ApplicationType.SPA)).toEqual('web');
  expect(getApplicationTypeString(ApplicationType.Native)).toEqual('native');
  expect(getApplicationTypeString(ApplicationType.Traditional)).toEqual('web');
});

it('buildOidcClientMetadata', () => {
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
