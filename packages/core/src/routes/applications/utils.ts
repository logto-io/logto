import { defaultProtectedAppPageRules, defaultProtectedAppSessionDuration } from './constants.js';

/**
 * Build application data for protected app
 * generate default protectedAppMetadata based on host and origin
 * generate redirectUris and postLogoutRedirectUris based on host
 */
export const buildProtectedAppData = ({ host, origin }: { host: string; origin: string }) => ({
  protectedAppMetadata: {
    host,
    origin,
    sessionDuration: defaultProtectedAppSessionDuration,
    pageRules: defaultProtectedAppPageRules,
  },
  oidcClientMetadata: {
    redirectUris: [`https://${host}/callback`],
    postLogoutRedirectUris: [`https://${host}`],
  },
});
