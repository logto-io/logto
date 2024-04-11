import {
  ApplicationType,
  CustomClientMetadataKey,
  FirstScreen,
  GrantType,
  InteractionMode,
  demoAppApplicationId,
} from '@logto/schemas';

import { mockEnvSet } from '#src/test-utils/env-set.js';

import {
  isOriginAllowed,
  buildOidcClientMetadata,
  getConstantClientMetadata,
  validateCustomClientMetadata,
  buildLoginPromptUrl,
} from './utils.js';

describe('getConstantClientMetadata()', () => {
  expect(getConstantClientMetadata(mockEnvSet, ApplicationType.SPA)).toEqual({
    application_type: 'web',
    grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken],
    token_endpoint_auth_method: 'none',
  });
  expect(getConstantClientMetadata(mockEnvSet, ApplicationType.Native)).toEqual({
    application_type: 'native',
    grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken],
    token_endpoint_auth_method: 'none',
  });
  expect(getConstantClientMetadata(mockEnvSet, ApplicationType.Traditional)).toEqual({
    application_type: 'web',
    grant_types: [GrantType.AuthorizationCode, GrantType.RefreshToken],
    token_endpoint_auth_method: 'client_secret_basic',
  });
  expect(getConstantClientMetadata(mockEnvSet, ApplicationType.MachineToMachine)).toEqual({
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

describe('buildLoginPromptUrl', () => {
  it('should return the correct url for empty parameters', () => {
    expect(buildLoginPromptUrl({})).toBe('sign-in');
    expect(buildLoginPromptUrl({}, 'foo')).toBe('sign-in');
    expect(buildLoginPromptUrl({}, demoAppApplicationId)).toBe('sign-in?no_cache=');
  });

  it('should return the correct url for firstScreen', () => {
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.Register })).toBe('register');
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.Register }, 'foo')).toBe('register');
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.SignIn }, demoAppApplicationId)).toBe(
      'sign-in?no_cache='
    );
    // Legacy interactionMode support
    expect(buildLoginPromptUrl({ interaction_mode: InteractionMode.SignUp })).toBe('register');
  });

  it('should return the correct url for directSignIn', () => {
    expect(buildLoginPromptUrl({ direct_sign_in: 'method:target' })).toBe(
      'direct/method/target?fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: 'method:target' }, 'foo')).toBe(
      'direct/method/target?fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: 'method:target' }, demoAppApplicationId)).toBe(
      'direct/method/target?no_cache=&fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: 'method' })).toBe(
      'direct/method?fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: '' })).toBe('sign-in');
  });

  it('should return the correct url for mixed parameters', () => {
    expect(
      buildLoginPromptUrl({ first_screen: FirstScreen.Register, direct_sign_in: 'method:target' })
    ).toBe('direct/method/target?fallback=register');
    expect(
      buildLoginPromptUrl(
        { first_screen: FirstScreen.Register, direct_sign_in: 'method:target' },
        demoAppApplicationId
      )
    ).toBe('direct/method/target?no_cache=&fallback=register');
  });
});
