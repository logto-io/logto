import { SiweConnector } from '@logto/connector-kit';

import RequestError from '#src/errors/RequestError/index.js';
import type TenantContext from '#src/tenants/TenantContext.js';

type OriginContext = Pick<TenantContext, 'envSet' | 'queries'>;

/**
 * Check whether the origin of the given redirect URI belongs to the current tenant.
 *
 * The redirect URI is provided by the caller and is never used to navigate in the SIWE flow;
 * only its origin is. A custom domain request is served by a tenant instance whose endpoint is
 * the custom domain itself, while the domain lookup covers deployments where the request is
 * proxied from a custom domain to the default endpoint.
 */
const isTrustedOrigin = async ({ envSet, queries }: OriginContext, redirectUri: string) => {
  try {
    const { origin, hostname } = new URL(redirectUri);

    if (origin === envSet.endpoint.origin) {
      return true;
    }

    return Boolean(await queries.domains.findActiveDomain(hostname));
  } catch {
    return false;
  }
};

/**
 * Ensure the redirect URI that seeds a SIWE connector session belongs to the current tenant.
 *
 * Unlike OAuth connectors, SIWE has no identity provider that enforces registered redirect URIs.
 * The connector derives the domain and URI of the signed message from this value and validates
 * the signature against them, so an unauthenticated origin would let a caller mint a nonce for
 * an arbitrary domain (such as a phishing site) and turn a signature for that domain into a
 * Logto identity.
 */
export const assertTrustedSiweRedirectUri = async (
  tenantContext: OriginContext,
  connectorTarget: string,
  redirectUri: string
): Promise<void> => {
  if (connectorTarget !== SiweConnector.target) {
    return;
  }

  if (!(await isTrustedOrigin(tenantContext, redirectUri))) {
    throw new RequestError('connector.invalid_request_parameters');
  }
};
