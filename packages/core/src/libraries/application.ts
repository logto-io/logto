import type { Scope } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

export const createApplicationLibrary = (queries: Queries) => {
  const {
    applications: {
      findApplicationById,
      userConsentOrganizationScopes,
      userConsentResourceScopes,
      useConsentUserScopes,
    },
    applicationsRoles: { findApplicationsRolesByApplicationId },
    rolesScopes: { findRolesScopesByRoleIds },
    organizations: { scopes: organizationScopesQuery },
    scopes: { findScopesByIdsAndResourceIndicator, findScopesByIds },
  } = queries;

  const findApplicationScopesForResourceIndicator = async (
    applicationId: string,
    resourceId: string
  ): Promise<readonly Scope[]> => {
    const applicationsRoles = await findApplicationsRolesByApplicationId(applicationId);
    const rolesScopes = await findRolesScopesByRoleIds(
      applicationsRoles.map(({ roleId }) => roleId)
    );
    const scopes = await findScopesByIdsAndResourceIndicator(
      rolesScopes.map(({ scopeId }) => scopeId),
      resourceId
    );

    return scopes;
  };

  // Guard application exists and is a third party application
  const validateThirdPartyApplicationById = async (applicationId: string) => {
    const application = await findApplicationById(applicationId);

    assertThat(
      application.isThirdParty,
      'application.user_consent_scopes_only_for_third_party_applications'
    );
  };

  // Guard that all scopes exist
  const validateApplicationUserConsentScopes = async ({
    organizationScopes = [],
    resourceScopes = [],
  }: {
    organizationScopes?: string[];
    resourceScopes?: string[];
  }) => {
    const [organizationScopesData, resourceScopesData] = await Promise.all([
      organizationScopesQuery.findByIds(organizationScopes),
      findScopesByIds(resourceScopes),
    ]);

    // Assert that all scopes exist, return the missing ones
    const invalidOrganizationScopes = organizationScopes.filter(
      (scope) => !organizationScopesData.some(({ id }) => id === scope)
    );

    const invalidResourceScopes = resourceScopes.filter(
      (scope) => !resourceScopesData.some(({ id }) => id === scope)
    );

    assertThat(
      invalidOrganizationScopes.length === 0 && invalidResourceScopes.length === 0,
      new RequestError(
        {
          code: 'application.user_consent_scopes_not_found',
          status: 422,
        },
        { invalidOrganizationScopes, invalidResourceScopes }
      )
    );
  };

  // Assign consent scopes to application
  const assignApplicationUserConsentScopes = async (
    applicationId: string,
    {
      organizationScopes,
      resourceScopes,
      userScopes,
    }: {
      organizationScopes?: string[];
      resourceScopes?: string[];
      userScopes?: string[];
    }
  ) => {
    if (organizationScopes) {
      await userConsentOrganizationScopes.insert(
        ...organizationScopes.map<[string, string]>((scope) => [applicationId, scope])
      );
    }

    if (resourceScopes) {
      await userConsentResourceScopes.insert(
        ...resourceScopes.map<[string, string]>((scope) => [applicationId, scope])
      );
    }

    if (userScopes) {
      await Promise.all(
        userScopes.map(async (userScope) =>
          useConsentUserScopes.insert({ applicationId, userScope })
        )
      );
    }
  };

  return {
    validateThirdPartyApplicationById,
    findApplicationScopesForResourceIndicator,
    validateApplicationUserConsentScopes,
    assignApplicationUserConsentScopes,
  };
};
