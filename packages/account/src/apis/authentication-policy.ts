import ky from 'ky';

/** The public freshness window the Account API enforces for sensitive operations. */
export type AuthenticationPolicy = {
  maximumAuthenticationAgeInSeconds: number;
};

/**
 * The tenant's recent-authentication window, which decides how recent a sign-in must be for the
 * Account API to allow sensitive operations. Account Center reads it from the public configuration
 * so its proactive step-up uses the same window as the Account API.
 */
export const getAuthenticationPolicy = async (): Promise<AuthenticationPolicy> =>
  ky.get('/api/.well-known/authentication-policy').json<AuthenticationPolicy>();
