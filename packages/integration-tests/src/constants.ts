import { getEnv } from '@silverhand/essentials';

export const logtoUrl = getEnv('LOGTO_URL');

export const discoveryUrl = `${logtoUrl}/oidc/.well-known/openid-configuration`;

export const redirectUri = `${logtoUrl}/console/callback`;
