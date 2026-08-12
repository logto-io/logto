import RequestError from '#src/errors/RequestError/index.js';
import { isThirdPartyApplication } from '#src/oidc/resource.js';
import type Queries from '#src/tenants/Queries.js';

/**
 * Assert that the access token behind this request was issued to a first-party application.
 *
 * The Account API is the user managing their own account at the identity provider, and was built
 * for the first-party Account Center. Third-party applications reach it because `openid` is
 * unconditionally part of their client scopes, and the per-route scope checks reuse the OIDC claim
 * scopes: an admin who enables `email` for a third-party application is told the application reads
 * the user's email address, and the end user consents to "Your email address" — neither grants
 * mutation of the primary email. Call this alongside the scope check on routes that change account
 * data or mint a verification record.
 *
 * Note: CIMD clients are not covered. `isThirdPartyApplication` resolves an unregistered client
 * identifier URL to first-party through its not-found fallback, so they pass this assertion. That
 * is handled by a separate change.
 */
export const assertFirstPartyClient = async (queries: Queries, clientId?: string) => {
  if (clientId !== undefined && (await isThirdPartyApplication(queries, clientId))) {
    throw new RequestError({ code: 'auth.third_party_application_forbidden', status: 403 });
  }
};
