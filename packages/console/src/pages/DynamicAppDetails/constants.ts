/**
 * The consent scopes ceiling of CIMD clients is tenant-level, so it has its own endpoint instead of
 * the per-application one.
 */
export const cimdUserConsentScopesEndpoint = 'api/cimd/user-consent-scopes';
