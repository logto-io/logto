import { assertEnv, getEnv } from '@silverhand/essentials';

export const signIn = assertEnv('UI_SIGN_IN_ROUTE');
export const isProduction = getEnv('NODE_ENV') === 'production';
export const port = Number(getEnv('PORT', '3001'));
export const mountedApps = Object.freeze(['api', 'oidc']);
export const developmentUserId = getEnv('DEVELOPMENT_USER_ID');

// Trusting TLS offloading proxies: https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#trusting-tls-offloading-proxies
export const trustingTlsOffloadingProxies = getEnv('TRUSTING_TLS_OFFLOADING_PROXIES') === 'true';
