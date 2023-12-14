import { UserScope } from '@logto/core-kit';
import { ApplicationType } from '@logto/schemas';

import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createScope } from '#src/api/scope.js';
import { expectRejects } from '#src/helpers/index.js';

describe('assign user consent scopes to application', () => {
  const applicationIds = new Map<string, string>();
  const organizationScopes = new Map<string, string>();
  const resourceScopes = new Map<string, string>();
  const resourceIds = new Set<string>();

  const organizationScopeApi = new OrganizationScopeApi();

  beforeAll(async () => {
    const firstPartyApp = await createApplication('first-party-application', ApplicationType.SPA);
    const thirdPartyApp = await createApplication(
      'third-party-application',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
      }
    );

    applicationIds.set('firstPartyApp', firstPartyApp.id);
    applicationIds.set('thirdPartyApp', thirdPartyApp.id);

    const organizationScope1 = await organizationScopeApi.create({
      name: 'organization-scope-1',
    });

    const organizationScope2 = await organizationScopeApi.create({
      name: 'organization-scope-2',
    });

    organizationScopes.set('organizationScope1', organizationScope1.id);
    organizationScopes.set('organizationScope2', organizationScope2.id);

    const resource = await createResource();
    resourceIds.add(resource.id);

    const resourceScope1 = await createScope(resource.id);
    const resourceScope2 = await createScope(resource.id);

    resourceScopes.set('resourceScope1', resourceScope1.id);
    resourceScopes.set('resourceScope2', resourceScope2.id);
  });

  afterAll(async () => {
    await Promise.all(
      Array.from(resourceIds).map(async (resourceId) => deleteResource(resourceId))
    );
    await Promise.all(
      Array.from(organizationScopes.values()).map(async (organizationScopeId) =>
        organizationScopeApi.delete(organizationScopeId)
      )
    );
    await Promise.all(
      Array.from(applicationIds.values()).map(async (applicationId) =>
        deleteApplication(applicationId)
      )
    );
  });

  it('should throw error when trying to assign scopes to non-third-party application', async () => {
    await expectRejects(
      assignUserConsentScopes(applicationIds.get('firstPartyApp')!, {
        organizationScopes: Array.from(organizationScopes.values()),
        resourceScopes: Array.from(resourceScopes.values()),
      }),
      {
        code: 'application.user_consent_scopes_only_for_third_party_applications',
        statusCode: 400,
      }
    );
  });

  it('should throw error when trying to assign a non-existing organization scope', async () => {
    await expectRejects(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        organizationScopes: ['non-existing-organization-scope'],
      }),
      {
        code: 'application.user_consent_scopes_not_found',
        statusCode: 422,
      }
    );
  });

  it('should throw error when trying to assign a non-existing resource scope', async () => {
    await expectRejects(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        resourceScopes: ['non-existing-resource-scope'],
      }),
      {
        code: 'application.user_consent_scopes_not_found',
        statusCode: 422,
      }
    );
  });

  it('should assign scopes to third-party application successfully', async () => {
    await expect(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        organizationScopes: Array.from(organizationScopes.values()),
        resourceScopes: Array.from(resourceScopes.values()),
        userScopes: [UserScope.Profile, UserScope.Email, UserScope.OrganizationRoles],
      })
    ).resolves.not.toThrow();
  });

  it('should not throw error when trying to assign existing consent scopes', async () => {
    await expect(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        organizationScopes: [organizationScopes.get('organizationScope1')!],
        resourceScopes: [resourceScopes.get('resourceScope1')!],
        userScopes: [UserScope.Profile],
      })
    ).resolves.not.toThrow();
  });
});
