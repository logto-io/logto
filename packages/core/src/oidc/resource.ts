import { ReservedResource } from '@logto/core-kit';
import { type Resource } from '@logto/schemas';
import { trySafe, type Nullable } from '@silverhand/essentials';
import { type ResourceServer } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

const isReservedResource = (indicator: string): indicator is ReservedResource =>
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

/**
 * Find the scopes for a given resource indicator according to the subject in the
 * context. The subject can be either a user or an application.
 *
 * This function also handles the reserved resources.
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
  findFromOrganizations,
}: {
  queries: Queries;
  libraries: Libraries;
  indicator: string;
  findFromOrganizations: boolean;
  userId?: string;
  applicationId?: string;
  organizationId?: string;
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
      organizationId
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

export const isThirdPartyApplication = async ({ applications }: Queries, applicationId: string) => {
  // Demo-app not exist in the database
  const application = await trySafe(async () => applications.findApplicationById(applicationId));

  return application?.isThirdParty ?? false;
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
  scopes: ReadonlyArray<{ name: string; id: string }>
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
        const userConsentOrganizationScopes = await getApplicationUserConsentOrganizationScopes(
          applicationId
        );

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
  const userConsentResources = await getApplicationUserConsentResourceScopes(applicationId);
  const userConsentResource = userConsentResources.find(
    ({ resource }) => resource.indicator === indicator
  );
  const userConsentOrganizationResources = EnvSet.values.isDevFeaturesEnabled
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
  return userConsentOrganizations.exists(applicationId, accountId, organizationId);
};
