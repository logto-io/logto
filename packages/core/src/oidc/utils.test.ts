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

const clientApplicationGrantTypes = Object.freeze([
  GrantType.AuthorizationCode,
  GrantType.RefreshToken,
  GrantType.TokenExchange,
  GrantType.FederatedThirdPartyTokenExchange,
] as const);

describe('getConstantClientMetadata()', () => {
  expect(getConstantClientMetadata(mockEnvSet, ApplicationType.SPA)).toEqual({
    application_type: 'web',
    grant_types: clientApplicationGrantTypes,
    token_endpoint_auth_method: 'none',
  });
  expect(getConstantClientMetadata(mockEnvSet, ApplicationType.Native)).toEqual({
    application_type: 'native',
    grant_types: clientApplicationGrantTypes,
    token_endpoint_auth_method: 'none',
  });
  expect(getConstantClientMetadata(mockEnvSet, ApplicationType.Traditional)).toEqual({
    application_type: 'web',
    grant_types: clientApplicationGrantTypes,
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
    expect(buildLoginPromptUrl({}, 'foo')).toBe('sign-in?app_id=foo');
    expect(buildLoginPromptUrl({}, demoAppApplicationId)).toBe(
      'sign-in?app_id=' + demoAppApplicationId
    );
  });

  it('should return the correct url for firstScreen', () => {
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.Register })).toBe('register');
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.Register }, 'foo')).toBe(
      'register?app_id=foo'
    );
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.SignIn }, demoAppApplicationId)).toBe(
      'sign-in?app_id=demo-app'
    );
    expect(
      buildLoginPromptUrl({ first_screen: FirstScreen.SignIn, login_hint: 'user@mail.com' })
    ).toBe('sign-in?login_hint=user%40mail.com');
    expect(
      buildLoginPromptUrl({ first_screen: FirstScreen.IdentifierSignIn, identifier: 'email phone' })
    ).toBe('identifier-sign-in?identifier=email+phone');
    expect(
      buildLoginPromptUrl({
        first_screen: FirstScreen.IdentifierRegister,
        identifier: 'username',
      })
    ).toBe('identifier-register?identifier=username');
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.SingleSignOn })).toBe('single-sign-on');
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.ResetPassword })).toBe('reset-password');

    // Legacy interactionMode support
    expect(buildLoginPromptUrl({ interaction_mode: InteractionMode.SignUp })).toBe('register');

    // Legacy FirstScreen.SignInDeprecated support
    expect(buildLoginPromptUrl({ first_screen: FirstScreen.SignInDeprecated })).toBe('sign-in');
  });

  it('should return the correct url for directSignIn', () => {
    expect(buildLoginPromptUrl({ direct_sign_in: 'method:target' })).toBe(
      'direct/method/target?fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: 'method:target' }, 'foo')).toBe(
      'direct/method/target?app_id=foo&fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: 'method:target' }, demoAppApplicationId)).toBe(
      'direct/method/target?app_id=demo-app&fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: 'method' })).toBe(
      'direct/method?fallback=sign-in'
    );
    expect(buildLoginPromptUrl({ direct_sign_in: '' })).toBe('sign-in');
  });

  it('should return the correct url for mixed parameters', () => {
    expect(
      buildLoginPromptUrl({
        first_screen: FirstScreen.Register,
        direct_sign_in: 'method:target',
      })
    ).toBe('direct/method/target?fallback=register');
    expect(
      buildLoginPromptUrl(
        { first_screen: FirstScreen.Register, direct_sign_in: 'method:target' },
        demoAppApplicationId
      )
    ).toBe('direct/method/target?app_id=demo-app&fallback=register');
  });

  it('should return the correct url containing token and login_hint ', () => {
    expect(
      buildLoginPromptUrl({ one_time_token: 'token_value', login_hint: 'user@mail.com' })
    ).toBe('sign-in?one_time_token=token_value&login_hint=user%40mail.com');
  });
});
