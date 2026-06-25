import {
  SignInIdentifier,
  SsoProviderName,
  demoAppApplicationId,
  type CreateSsoConnector,
} from '@logto/schemas';
import { appendPath, getEnv, yes } from '@silverhand/essentials';

export const logtoUrl = getEnv('INTEGRATION_TESTS_LOGTO_URL', 'http://localhost:3001');
export const logtoOidcUrl = appendPath(new URL(logtoUrl), 'oidc').toString();
export const logtoConsoleUrl = getEnv(
  'INTEGRATION_TESTS_LOGTO_CONSOLE_URL',
  'http://localhost:3002'
);
export const logtoCloudUrl = getEnv('INTEGRATION_TESTS_LOGTO_CLOUD_URL', 'http://localhost:3003');
export const demoAppUrl = appendPath(new URL(logtoUrl), 'demo-app');

export const discoveryUrl = `${logtoUrl}/oidc/.well-known/openid-configuration`;

export const demoAppRedirectUri = appendPath(new URL(logtoUrl), demoAppApplicationId).href;
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
export const mockSocialAuthPageUrl = 'http://mock-social';

export const newOidcSsoConnectorPayload = {
  providerName: SsoProviderName.OIDC,
  connectorName: 'test-oidc',
  domains: ['example.io'], // Auto-generated email domain
  branding: {
    displayName: 'test oidc connector',
    logo: 'https://logto.io/oidc-logo.png',
    darkLogo: 'https://logto.io/oidc-dark-logo.png',
  },
  config: {
    clientId: 'foo',
    clientSecret: 'bar',
    issuer: `${logtoUrl}/oidc`,
  },
} satisfies Partial<CreateSsoConnector>;

export const isDevFeaturesEnabled = yes(getEnv('DEV_FEATURES_ENABLED'));
