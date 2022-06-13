import { getEnv } from '@silverhand/essentials';

export const logtoUrl = getEnv('LOGTO_URL');

export const adminConsoleAppId = 'admin_console';

export const redirectUri = `${logtoUrl}/console/callback`;

export const authorizationEndpoint = `${logtoUrl}/oidc/auth`;

export const tokenEndpoint = `${logtoUrl}/oidc/token`;
