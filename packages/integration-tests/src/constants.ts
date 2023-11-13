import { type CreateSsoConnector, SignInIdentifier, demoAppApplicationId } from '@logto/schemas';
import { appendPath, getEnv } from '@silverhand/essentials';

export const logtoUrl = getEnv('INTEGRATION_TESTS_LOGTO_URL', 'http://localhost:3001');
export const logtoConsoleUrl = getEnv(
  'INTEGRATION_TESTS_LOGTO_CONSOLE_URL',
  'http://localhost:3002'
);
export const logtoCloudUrl = getEnv('INTEGRATION_TESTS_LOGTO_CLOUD_URL', 'http://localhost:3003');
export const demoAppUrl = appendPath(new URL(logtoUrl), 'demo-app');

export const discoveryUrl = `${logtoUrl}/oidc/.well-known/openid-configuration`;

export const demoAppRedirectUri = `${logtoUrl}/${demoAppApplicationId}`;
export const adminConsoleRedirectUri = `${logtoConsoleUrl}/console/callback`;

export const signUpIdentifiers = {
  username: [SignInIdentifier.Username],
  email: [SignInIdentifier.Email],
  sms: [SignInIdentifier.Phone],
  emailOrSms: [SignInIdentifier.Email, SignInIdentifier.Phone],
  none: [],
};

export const consoleUsername = 'svhd';
export const consolePassword = 'silverhandasd_1';
export const mockSocialAuthPageUrl = 'http://mock.social.com';

// @see {@link packages/core/src/sso/types}
export enum ProviderName {
  OIDC = 'OIDC',
}

export const newOidcSsoConnectorPayload = {
  providerName: ProviderName.OIDC,
  connectorName: 'test-oidc',
  domains: ['example.io'], // Auto-generated email domain
  branding: {
    logo: 'https://logto.io/oidc-logo.png',
    darkLogo: 'https://logto.io/oidc-dark-logo.png',
  },
  config: {
    clientId: 'foo',
    clientSecret: 'bar',
    issuer: `${logtoUrl}/oidc`,
  },
} satisfies Partial<CreateSsoConnector>;
