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
  scopes: ReadonlyArray<{ name: string; id: string }>
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
   * A resource can sit behind the ceiling as a plain API resource or as an organization
   * resource; scope ids are globally unique, so the flat union mirrors the third-party
   * filter's per-indicator merge of the two application consent tables.
   */
  const [ceilingResourceScopes, ceilingOrganizationResourceScopes] = await Promise.all([
    cimd.resourceScopes.findAll(),
    cimd.organizationResourceScopes.findAll(),
  ]);
  const ceilingScopeIds = new Set(
    [...ceilingResourceScopes, ...ceilingOrganizationResourceScopes].map(({ id }) => id)
  );

  return scopes.filter(({ id }) => ceilingScopeIds.has(id));
};
