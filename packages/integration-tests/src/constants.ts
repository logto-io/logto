import { SignInIdentifier, demoAppApplicationId } from '@logto/schemas';
import { assertEnv } from '@silverhand/essentials';

export const logtoUrl = assertEnv('INTEGRATION_TESTS_LOGTO_URL');

export const discoveryUrl = `${logtoUrl}/oidc/.well-known/openid-configuration`;

export const demoAppRedirectUri = `${logtoUrl}/${demoAppApplicationId}`;
export const adminConsoleRedirectUri = `${logtoUrl}/console/callback`;

export const signUpIdentifiers = {
  username: [SignInIdentifier.Username],
  email: [SignInIdentifier.Email],
  sms: [SignInIdentifier.Sms],
  emailOrSms: [SignInIdentifier.Email, SignInIdentifier.Sms],
  none: [],
};
