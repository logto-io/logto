import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { getEnv } from '@silverhand/essentials';

export const logtoUrl = getEnv('INTEGRATION_TESTS_LOGTO_URL');

export const discoveryUrl = `${logtoUrl}/oidc/.well-known/openid-configuration`;

export const demoAppRedirectUri = `${logtoUrl}/${demoAppApplicationId}`;
export const adminConsoleRedirectUri = `${logtoUrl}/console/callback`;
