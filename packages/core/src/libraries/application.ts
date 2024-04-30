import {
  OrganizationScopes,
  Scopes,
  type Scope,
  ApplicationUserConsentScopeType,
  getManagementApiResourceIndicator,
  ApplicationType,
} from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

const groupResourceScopesByResourceId = (
  scopes: readonly Scope[]
): Array<{
  resourceId: string;
  scopes: Scope[];
}> => {
  const resourceMap = new Map<string, Scope[]>();

  for (const scope of scopes) {
    const existingScopes = resourceMap.get(scope.resourceId) ?? [];
    resourceMap.set(scope.resourceId, [...existingScopes, scope]);
  }

  return Array.from(resourceMap, ([resourceId, scopes]) => ({ resourceId, scopes }));
};

export const createApplicationLibrary = (queries: Queries) => {
  const {
    applications: {
      findApplicationById,
      userConsentOrganizationScopes,
      userConsentOrganizationResourceScopes,
      userConsentResourceScopes,
      userConsentUserScopes,
    },
    applicationsRoles: { findApplicationsRolesByApplicationId },
    rolesScopes: { findRolesScopesByRoleIds },
    organizations: { scopes: organizationScopesQuery, relations: organizationRelations },
    scopes: { findScopesByIdsAndResourceIndicator, findScopesByIds },
    resources: { findResourceById },
  } = queries;

  const findApplicationScopesForResourceIndicator = async (
    applicationId: string,
    resourceIndicator: string
  ): Promise<readonly Scope[]> => {
    const applicationsRoles = await findApplicationsRolesByApplicationId(applicationId);
    const rolesScopes = await findRolesScopesByRoleIds(
      applicationsRoles.map(({ roleId }) => roleId)
    );
    const scopes = await findScopesByIdsAndResourceIndicator(
      rolesScopes.map(({ scopeId }) => scopeId),
      resourceIndicator
    );

    return scopes;
  };

  // Guard application exists and is a third party application
  const validateThirdPartyApplicationById = async (applicationId: string) => {
    const application = await findApplicationById(applicationId);

    assertThat(
      application.isThirdParty,
      new RequestError({
        code: 'application.third_party_application_only',
        status: 422,
      })
    );
  };

  // Guard that all scopes exist
  const validateApplicationUserConsentScopes = async (
    {
      organizationScopes = [],
      resourceScopes = [],
      organizationResourceScopes = [],
    }: {
      organizationScopes?: string[];
      resourceScopes?: string[];
      organizationResourceScopes?: string[];
    },
    tenantId: string
  ) => {
    const [organizationScopesData, resourceScopesData, organizationResourceScopesData] =
      await Promise.all([
        organizationScopesQuery.findByIds(organizationScopes),
        findScopesByIds(resourceScopes),
        findScopesByIds(organizationResourceScopes),
      ]);

    const invalidOrganizationScopes = organizationScopes.filter(
      (scope) => !organizationScopesData.some(({ id }) => id === scope)
    );

    const invalidResourceScopes = resourceScopes.filter(
      (scope) => !resourceScopesData.some(({ id }) => id === scope)
    );

    const invalidOrganizationResourceScopes = organizationResourceScopes.filter(
      (scope) => !organizationResourceScopesData.some(({ id }) => id === scope)
    );

    // Assert that all scopes exist, return the missing ones
    assertThat(
      invalidOrganizationScopes.length === 0 &&
        invalidResourceScopes.length === 0 &&
        invalidOrganizationResourceScopes.length === 0,
      new RequestError(
        {
          code: 'application.user_consent_scopes_not_found',
          status: 422,
        },
        { invalidOrganizationScopes, invalidResourceScopes, invalidOrganizationResourceScopes }
      )
    );

    const managementApiResourceIndicator = getManagementApiResourceIndicator(tenantId);

    const managementApiScopes = await findScopesByIdsAndResourceIndicator(
      [...resourceScopes, ...organizationResourceScopes],
      managementApiResourceIndicator
    );

    assertThat(
      managementApiScopes.length === 0,
      new RequestError({
        code: 'application.consent_management_api_scopes_not_allowed',
        status: 422,
      })
    );
  };

  // Assign consent scopes to application
  const assignApplicationUserConsentScopes = async (
    applicationId: string,
    {
      organizationScopes,
      resourceScopes,
      organizationResourceScopes,
      userScopes,
    }: {
      organizationScopes?: string[];
      resourceScopes?: string[];
      organizationResourceScopes?: string[];
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

    if (organizationResourceScopes) {
      await userConsentOrganizationResourceScopes.insert(
        ...organizationResourceScopes.map<[string, string]>((scope) => [applicationId, scope])
      );
    }

    if (userScopes) {
      await Promise.all(
        userScopes.map(async (userScope) =>
          userConsentUserScopes.insert({ applicationId, userScope })
        )
      );
    }
  };

  // Get application user consent organization scopes
  const getApplicationUserConsentOrganizationScopes = async (applicationId: string) => {
    const [, scopes] = await userConsentOrganizationScopes.getEntities(OrganizationScopes, {
      applicationId,
    });

    return scopes;
  };

  const getApplicationUserConsentResourceScopes = async (applicationId: string) => {
    const [, scopes] = await userConsentResourceScopes.getEntities(Scopes, {
      applicationId,
    });

    const groupedScopes = groupResourceScopesByResourceId(scopes);

    return Promise.all(
      groupedScopes.map(async ({ resourceId, scopes }) => ({
        resource: await findResourceById(resourceId),
        scopes,
      }))
    );
  };

  const getApplicationUserConsentOrganizationResourceScopes = async (applicationId: string) => {
    const [, scopes] = await userConsentOrganizationResourceScopes.getEntities(Scopes, {
      applicationId,
    });

    const groupedScopes = groupResourceScopesByResourceId(scopes);

    return Promise.all(
      groupedScopes.map(async ({ resourceId, scopes }) => ({
        resource: await findResourceById(resourceId),
        scopes,
      }))
    );
  };

  const getApplicationUserConsentScopes = async (applicationId: string) =>
    userConsentUserScopes.findAllByApplicationId(applicationId);

  const deleteApplicationUserConsentScopesByTypeAndScopeId = async (
    applicationId: string,
    type: ApplicationUserConsentScopeType,
    scopeId: string
  ) => {
    switch (type) {
      case ApplicationUserConsentScopeType.OrganizationScopes: {
        await userConsentOrganizationScopes.delete({ applicationId, organizationScopeId: scopeId });
        break;
      }
      case ApplicationUserConsentScopeType.ResourceScopes: {
        await userConsentResourceScopes.delete({ applicationId, scopeId });
        break;
      }
      case ApplicationUserConsentScopeType.OrganizationResourceScopes: {
        await userConsentOrganizationResourceScopes.delete({ applicationId, scopeId });
        break;
      }
      case ApplicationUserConsentScopeType.UserScopes: {
        await userConsentUserScopes.deleteByApplicationIdAndScopeId(applicationId, scopeId);
        break;
      }
    }
  };

  const validateUserConsentOrganizationMembership = async (
    userId: string,
    organizationIds: string[]
  ) => {
    // If no organization ids, skip
    if (organizationIds.length === 0) {
      return;
    }

    // Assert that user is a member of all organizations
    const userOrganizations = await organizationRelations.users.getOrganizationsByUserId(userId);

    const invalidOrganizationIds = organizationIds.filter(
      (organizationId) => !userOrganizations.some(({ id }) => id === organizationId)
    );

    assertThat(
      invalidOrganizationIds.length === 0,
      new RequestError({
        code: 'organization.require_membership',
        status: 422,
      })
    );
  };

  // Guard application exists and is a protected app
  const validateProtectedApplicationById = async (applicationId: string) => {
    const application = await findApplicationById(applicationId);

    assertThat(
      application.type === ApplicationType.Protected,
      new RequestError({
        code: 'application.protected_application_only',
        status: 422,
      })
    );
  };

  return {
    validateThirdPartyApplicationById,
    findApplicationScopesForResourceIndicator,
    validateApplicationUserConsentScopes,
    assignApplicationUserConsentScopes,
    getApplicationUserConsentOrganizationScopes,
    getApplicationUserConsentResourceScopes,
    getApplicationUserConsentOrganizationResourceScopes,
    getApplicationUserConsentScopes,
    deleteApplicationUserConsentScopesByTypeAndScopeId,
    validateUserConsentOrganizationMembership,
    validateProtectedApplicationById,
  };
};
