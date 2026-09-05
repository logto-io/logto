import { GrantType } from '@logto/schemas';
import { type AuthorizationCode, type Client } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import { createOidcContext } from '#src/test-utils/oidc-provider.js';

import { getExtraTokenClaimsForAuthenticationContext } from './authentication-context-claims.js';

type AuthenticationContext = Pick<AuthorizationCode, 'acr' | 'amr' | 'authTime'>;

const { provider } = createOidcContext().oidc;
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- token constructors only read the client identifier in these tests
const client = { clientId: 'client-id' } as Client;
const tokenProperties = {
  client,
  accountId: 'account-id',
  scope: 'openid',
  grantId: 'grant-id',
  gty: GrantType.AuthorizationCode,
};
const codeContext = {
  acr: 'urn:logto:acr:1fa',
  amr: ['pwd'],
  authTime: 1000,
};
const refreshContext = {
  acr: 'urn:logto:acr:mfa',
  amr: ['pwd', 'otp', 'mfa'],
  authTime: 2000,
};

const buildContext = (
  grantType: string | undefined,
  {
    authorizationCode,
    refreshToken,
  }: { authorizationCode?: AuthenticationContext; refreshToken?: AuthenticationContext } = {}
) => {
  const session = new provider.Session();
  session.loginAccount({
    accountId: tokenProperties.accountId,
    acr: 'session-acr',
    amr: ['session-amr'],
    loginTs: 3000,
  });

  return createOidcContext({
    provider,
    client,
    session,
    acr: 'request-acr',
    amr: ['request-amr'],
    params: { grant_type: grantType, acr_values: 'requested-acr' },
    entities: {
      ...(authorizationCode && {
        AuthorizationCode: new provider.AuthorizationCode({
          ...tokenProperties,
          ...authorizationCode,
        }),
      }),
      ...(refreshToken && {
        RefreshToken: new provider.RefreshToken({ ...tokenProperties, ...refreshToken }),
      }),
    },
  });
};

const createAccessToken = () =>
  new provider.AccessToken({
    ...tokenProperties,
    extra: { acr: 'previous-acr', amr: ['previous-amr'], auth_time: 4000 },
  });

describe('getExtraTokenClaimsForAuthenticationContext', () => {
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

  beforeEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
  });

  afterEach(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it.each([
    [GrantType.AuthorizationCode, codeContext],
    [GrantType.RefreshToken, refreshContext],
  ])('should use the %s source when both grant entities are present', (grantType, source) => {
    const ctx = buildContext(grantType, {
      authorizationCode: codeContext,
      refreshToken: refreshContext,
    });

    expect(getExtraTokenClaimsForAuthenticationContext(ctx, createAccessToken())).toEqual({
      acr: source.acr,
      amr: source.amr,
      auth_time: source.authTime,
    });
  });

  describe.each([GrantType.AuthorizationCode, GrantType.RefreshToken])('%s', (grantType) => {
    const buildSourceContext = (source: AuthenticationContext) =>
      buildContext(grantType, {
        [grantType === GrantType.AuthorizationCode ? 'authorizationCode' : 'refreshToken']: source,
      });

    it.each([
      { source: { acr: codeContext.acr }, expected: { acr: codeContext.acr } },
      { source: { amr: codeContext.amr }, expected: { amr: codeContext.amr } },
      { source: { authTime: codeContext.authTime }, expected: { auth_time: codeContext.authTime } },
      { source: { amr: [], authTime: 0 }, expected: { amr: [], auth_time: 0 } },
    ])('should copy only defined source values: $source', ({ source, expected }) => {
      expect(
        getExtraTokenClaimsForAuthenticationContext(buildSourceContext(source), createAccessToken())
      ).toEqual(expected);
    });

    it('should omit authentication claims from legacy grant entities', () => {
      expect(
        getExtraTokenClaimsForAuthenticationContext(buildSourceContext({}), createAccessToken())
      ).toBeUndefined();
    });

    it('should not fall back to unrelated entities, the session, request, or token extras', () => {
      const ctx = buildContext(grantType, {
        [grantType === GrantType.AuthorizationCode ? 'refreshToken' : 'authorizationCode']:
          refreshContext,
      });

      expect(getExtraTokenClaimsForAuthenticationContext(ctx, createAccessToken())).toBeUndefined();
    });

    it('should not emit authentication context when dev features are disabled', () => {
      Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

      expect(
        getExtraTokenClaimsForAuthenticationContext(
          buildSourceContext(codeContext),
          createAccessToken()
        )
      ).toBeUndefined();
    });
  });

  it.each([GrantType.ClientCredentials, GrantType.TokenExchange, GrantType.DeviceCode, undefined])(
    'should not reuse unrelated authentication context for grant %s',
    (grantType) => {
      const ctx = buildContext(grantType, {
        authorizationCode: codeContext,
        refreshToken: refreshContext,
      });

      expect(getExtraTokenClaimsForAuthenticationContext(ctx, createAccessToken())).toBeUndefined();
    }
  );

  it.each([
    new provider.ClientCredentials({ client, scope: 'read' }),
    new provider.AuthorizationCode({ ...tokenProperties, ...codeContext }),
    new provider.RefreshToken({ ...tokenProperties, ...refreshContext }),
    {},
  ])('should ignore non-user access tokens', (token) => {
    const ctx = buildContext(GrantType.AuthorizationCode, { authorizationCode: codeContext });

    expect(getExtraTokenClaimsForAuthenticationContext(ctx, token)).toBeUndefined();
  });
});
