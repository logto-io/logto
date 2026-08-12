/**
 * @overview The tenant-wide CIMD permission ceiling filter for resource scopes.
 */

import { ReservedResource } from '@logto/core-kit';

import type Queries from '#src/tenants/Queries.js';

import { isReservedResource } from '../resource.js';

/**
 * Filter out the scopes that fall outside the tenant-wide CIMD permission ceiling.
 *
 * CIMD clients are unregistered, so there is no application-level user consent configuration
 * to consult — the tenant-wide ceiling tables take that role, with the same filtering shape
 * as `filterResourceScopesForTheThirdPartyApplication`. Out-of-ceiling scopes are
 * silently dropped before they can enter a grant: consent computes missing scopes against
 * the filtered set, and the refresh-token resource path re-intersects with it on every
 * issuance. On the authorization-code path the persisted grant stays authoritative until
 * revoked — the same enforcement geometry as third-party applications.
 */
export const filterResourceScopesForTheCimdClient = async (
  { cimd }: Queries,
  indicator: string,
  scopes: ReadonlyArray<{ name: string; id: string }>,
  {
    includeOrganizationResourceScopes = true,
    includeResourceScopes = true,
  }: { includeOrganizationResourceScopes?: boolean; includeResourceScopes?: boolean } = {}
) => {
  if (isReservedResource(indicator)) {
    switch (indicator) {
      case ReservedResource.Organization: {
        const ceilingOrganizationScopes = await cimd.organizationScopes.findAll();
        const ceilingOrganizationScopeIds = new Set(ceilingOrganizationScopes.map(({ id }) => id));

        return scopes.filter(({ id }) => ceilingOrganizationScopeIds.has(id));
      }
      // Mirror the third-party filter: other reserved resources are not ceiling-governed
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default: {
        return scopes;
      }
    }
  }

  /**
   * The two ceiling tables carry different authorization contexts, mirroring the
   * third-party filter's include flags: a scope configured only as an organization
   * resource scope must stay out of an ordinary (organization-less) grant, where no
   * organization membership is ever checked.
   */
  const [ceilingResourceScopes, ceilingOrganizationResourceScopes] = await Promise.all([
    includeResourceScopes ? cimd.resourceScopes.findAll() : [],
    includeOrganizationResourceScopes ? cimd.organizationResourceScopes.findAll() : [],
  ]);
  const ceilingScopeIds = new Set(
    [...ceilingResourceScopes, ...ceilingOrganizationResourceScopes].map(({ id }) => id)
  );

  return scopes.filter(({ id }) => ceilingScopeIds.has(id));
};
