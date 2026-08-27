import { ReservedResource } from '@logto/core-kit';
import {
  isBuiltInApplicationId,
  isCimdClientId,
  Organizations,
  type Resource,
} from '@logto/schemas';
import { trySafe, type Nullable } from '@silverhand/essentials';
import { type ResourceServer } from 'oidc-provider';

import { type EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

export const isReservedResource = (indicator: string): indicator is ReservedResource =>
  // eslint-disable-next-line no-restricted-syntax -- it's the best way to do it
  Object.values(ReservedResource).includes(indicator as ReservedResource);

export const getSharedResourceServerData = (
  envSet: EnvSet
): Pick<ResourceServer, 'accessTokenFormat' | 'jwt'> => ({
  accessTokenFormat: 'jwt',
  jwt: {
    sign: { alg: envSet.oidc.jwkSigningAlg },
  },
});

// TODO: Refactor me. This function is too complex.
/**
 * Find the scopes for a given resource indicator according to the subject in the context. The
 * subject can be either a user or an application (user takes priority).
 *
 * Resolution order:
 * 1. `ReservedResource.Organization` — short-circuits with all org scopes.
 * 2. `userId` — resolves from user roles and optionally from organization roles when
 *    `findFromOrganizations` is true. `organizationId` narrows org-role scopes.
 * 3. `applicationId + organizationId` — resolves scopes from org role assignments.
 * 4. `applicationId` (alone) — resolves from direct role assignments.
 * 5. Fallback — empty array.
 *
 * `findFromOrganizations` only applies to the `userId` path.
 *
 * @see {@link ReservedResource} for the list of reserved resources.
 */
export const findResourceScopes = async ({
  queries,
  libraries,
  userId,
  applicationId,
  indicator,
  organizationId,
  organizationIds,
  findFromOrganizations,
}: {
  queries: Queries;
  libraries: Libraries;
  indicator: string;
  /**
   * In consent or code exchange flow, the `organizationId` is `undefined`, and all the scopes
   * inherited from the all organization roles should be granted.
   *
   * In the flow of granting token for a specific organization with API resource, `organizationId`
   * is provided, and only the scopes inherited from that organization should be granted.
   *
   * Note: This value does not affect the reserved resources and application subjects.
   */
  findFromOrganizations: boolean;
  userId?: string;
  applicationId?: string;
  organizationId?: string;
  /**
   * Only count organization-role contributions from these organizations (an empty array counts
   * none); personal role scopes are unaffected. `organizationId` takes precedence when set.
   */
  organizationIds?: readonly string[];
}): Promise<ReadonlyArray<{ name: string; id: string }>> => {
  if (isReservedResource(indicator)) {
    switch (indicator) {
      case ReservedResource.Organization: {
        const [, rows] = await queries.organizations.scopes.findAll();
        return rows;
      }
    }
  }

  const {
    users: { findUserScopesForResourceIndicator },
    applications: { findApplicationScopesForResourceIndicator },
  } = libraries;

  if (userId) {
    return findUserScopesForResourceIndicator(
      userId,
      indicator,
      findFromOrganizations,
      organizationId ? [organizationId] : organizationIds
    );
  }

  if (applicationId && organizationId) {
    return queries.organizations.relations.appsRoles.getApplicationResourceScopes(
      organizationId,
      applicationId,
      indicator
    );
  }

  if (applicationId) {
    return findApplicationScopesForResourceIndicator(applicationId, indicator);
  }

  return [];
};

/**
 * The default TTL (Time To Live) of the access token for the reversed resources.
 * It may be configurable in the future.
 */
export const reversedResourceAccessTokenTtl = 3600;

/**
 * Find the resource for a given indicator. This function also handles the reserved
 * resources.
 *
 * @see {@link ReservedResource} for the list of reserved resources.
 */
export const findResource = async (
  queries: Queries,
  indicator: string
): Promise<Nullable<Pick<Resource, 'indicator' | 'accessTokenTtl'>>> => {
  if (isReservedResource(indicator)) {
    return {
      indicator,
      accessTokenTtl: reversedResourceAccessTokenTtl,
    };
  }

  return queries.resources.findResourceByIndicator(indicator);
};

/**
 * Resolve whether the given client is third-party, or `undefined` when no application matches the
 * identifier.
 *
 * @remarks
 * Unlike {@link isThirdPartyApplication}, a failed lookup (a database outage, say) is rethrown
 * rather than folded into "third-party", so callers can tell "this client does not exist" from "we
 * could not find out". Use this when the answer drives a hard reject and a transient failure must
 * not masquerade as a client error.
 */
export const resolveIsThirdPartyApplication = async (
  { applications }: Queries,
  applicationId: string
): Promise<boolean | undefined> => {
  // Built-in clients have no applications row and are always first-party.
  if (isBuiltInApplicationId(applicationId)) {
    return false;
  }

  // A CIMD client identifier is a URL and never names a registered application.
  if (isCimdClientId(applicationId)) {
    return true;
  }

  try {
    const application = await applications.findApplicationById(applicationId);
    return application.isThirdParty;
  } catch (error: unknown) {
    if (error instanceof RequestError && error.code === 'entity.not_exists_with_id') {
      return undefined;
    }

    throw error;
  }
};

export const isThirdPartyApplication = async (queries: Queries, applicationId: string) => {
  const isThirdParty = await trySafe(async () =>
    resolveIsThirdPartyApplication(queries, applicationId)
  );

  // Fail closed: an unresolvable client is never first-party.
  return isThirdParty ?? true;
};

/**
 * Filter out the unsupported scopes for the third-party application.
 *
 * third-party application can only request the scopes that are enabled in the client scope metadata  @see {@link https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#clients}
 * However, the client scope metadata does not support prefix matching and resource scopes name are not unique, so we need to filter out the resource and organization scopes specifically based on the resource indicator.
 *
 * Available resource scopes can be found using {@link findResourceScopes}.
 */
export const filterResourceScopesForTheThirdPartyApplication = async (
  libraries: Libraries,
  applicationId: string,
  indicator: string,
  scopes: ReadonlyArray<{ name: string; id: string }>,
  {
    includeOrganizationResourceScopes = true,
    includeResourceScopes = true,
  }: { includeOrganizationResourceScopes?: boolean; includeResourceScopes?: boolean } = {}
) => {
  const {
    applications: {
      getApplicationUserConsentOrganizationScopes,
      getApplicationUserConsentResourceScopes,
      getApplicationUserConsentOrganizationResourceScopes,
    },
  } = libraries;

  if (isReservedResource(indicator)) {
    switch (indicator) {
      case ReservedResource.Organization: {
        const userConsentOrganizationScopes =
          await getApplicationUserConsentOrganizationScopes(applicationId);

        // Filter out the organization scopes that are not enabled in the application
        return scopes.filter(({ id: organizationScopeId }) =>
          userConsentOrganizationScopes.some(
            ({ id: consentOrganizationId }) => consentOrganizationId === organizationScopeId
          )
        );
      }
      // FIXME: @simeng double check if it's necessary
      // Return all the scopes for the reserved resources
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default: {
        return scopes;
      }
    }
  }

  // Get the API resource scopes that are enabled in the application
  const userConsentResources = includeResourceScopes
    ? await getApplicationUserConsentResourceScopes(applicationId)
    : [];
  const userConsentResource = userConsentResources.find(
    ({ resource }) => resource.indicator === indicator
  );
  const userConsentOrganizationResources = includeOrganizationResourceScopes
    ? await getApplicationUserConsentOrganizationResourceScopes(applicationId)
    : [];
  const userConsentOrganizationResource = userConsentOrganizationResources.find(
    ({ resource }) => resource.indicator === indicator
  );

  const resourceScopes = [
    ...(userConsentResource?.scopes ?? []),
    ...(userConsentOrganizationResource?.scopes ?? []),
  ];

  return scopes.filter(({ id: resourceScopeId }) =>
    resourceScopes.some(
      ({ id: consentResourceScopeId }) => consentResourceScopeId === resourceScopeId
    )
  );
};

/**
 * Check if the user has consented to the application for the specific organization.
 *
 * User will be asked to grant the organization access to the application on the consent page.
 * User application organization grant status can be managed using management API.
 */
export const isOrganizationConsentedToApplication = async (
  { applications: { userConsentOrganizations } }: Queries,
  applicationId: string,
  accountId: string,
  organizationId: string
) => {
  return userConsentOrganizations.exists({ applicationId, userId: accountId, organizationId });
};

/**
 * Find the organizations the user has consented to the application, to bound the
 * organization-role aggregation at token issuance: the grant records the requested ceiling for
 * a registered third-party client, so a token without an `organization_id` has no other
 * consent boundary left. Resolves to `undefined` (no bounding) everywhere else; authorization
 * and consent rendering keep the full aggregation, which is what builds and displays the
 * ceiling in the first place. The registered-client path owns the call; CIMD branches off
 * before it, its grant being per-organization already.
 */
export const findIssuanceConsentedOrganizationIds = async (
  queries: Queries,
  {
    isTokenIssuance,
    isThirdParty,
    clientId,
    userId,
    organizationId,
  }: {
    isTokenIssuance: boolean;
    isThirdParty: boolean;
    clientId: string | undefined;
    userId: string | undefined;
    organizationId: string | undefined;
  }
): Promise<readonly string[] | undefined> => {
  if (!isTokenIssuance || !isThirdParty || !clientId || !userId || organizationId) {
    return undefined;
  }

  const [, entities] = await queries.applications.userConsentOrganizations.getEntities(
    Organizations,
    { applicationId: clientId, userId }
  );

  return entities.map(({ id }) => id);
};
