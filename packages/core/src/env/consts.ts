import { assertEnv, getEnv } from '@/utils/env';

export const signIn = assertEnv('UI_SIGN_IN_ROUTE');
export const isProduction = getEnv('NODE_ENV') === 'production';
export const port = Number(getEnv('PORT', '3001'));
export const oidcIssuer = getEnv('OIDC_ISSUER', `http://localhost:${port}/oidc`);
export const mountedApps = Object.freeze(['api', 'oidc']);
