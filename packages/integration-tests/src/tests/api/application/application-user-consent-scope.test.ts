import { UserScope } from '@logto/core-kit';
import { ApplicationType, ApplicationUserConsentScopeType } from '@logto/schemas';

import {
  assignUserConsentScopes,
  getUserConsentScopes,
  deleteUserConsentScopes,
} from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createScope } from '#src/api/scope.js';
import { expectRejects } from '#src/helpers/index.js';

describe('assign user consent scopes to application', () => {
  const applicationIds = new Map<string, string>();
  const organizationScopes = new Map<string, string>();
  const resourceScopes = new Map<string, string>();
  const organizationResourceScopes = new Map<string, string>();
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

    const resourceScope3 = await createScope(resource.id);
    const resourceScope4 = await createScope(resource.id);

    organizationResourceScopes.set('resourceScope1', resourceScope3.id);
    organizationResourceScopes.set('resourceScope2', resourceScope4.id);
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
        organizationResourceScopes: Array.from(organizationResourceScopes.values()),
      }),
      {
        code: 'application.third_party_application_only',
        status: 422,
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
        status: 422,
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
        status: 422,
      }
    );
  });

  it('should throw error when trying to assign a non-existing organization resource scope', async () => {
    await expectRejects(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        organizationResourceScopes: ['non-existing-resource-scope'],
      }),
      {
        code: 'application.user_consent_scopes_not_found',
        status: 422,
      }
    );
  });

  it('should assign scopes to third-party application successfully', async () => {
    await expect(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        organizationScopes: Array.from(organizationScopes.values()),
        resourceScopes: Array.from(resourceScopes.values()),
        organizationResourceScopes: Array.from(organizationResourceScopes.values()),
        userScopes: [UserScope.Profile, UserScope.Email, UserScope.OrganizationRoles],
      })
    ).resolves.not.toThrow();
  });

  it('should not throw error when trying to assign existing consent scopes', async () => {
    await expect(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        organizationScopes: [organizationScopes.get('organizationScope1')!],
        resourceScopes: [resourceScopes.get('resourceScope1')!],
        organizationResourceScopes: [organizationResourceScopes.get('resourceScope1')!],
        userScopes: [UserScope.Profile],
      })
    ).resolves.not.toThrow();
  });

  it('should return 404 when trying to get consent scopes from non-existing application', async () => {
    await expectRejects(getUserConsentScopes('non-existing-application'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should return consent scopes successfully', async () => {
    // This test depends on the previous success assignment test
    const result = await getUserConsentScopes(applicationIds.get('thirdPartyApp')!);

    expect(result.organizationScopes.length).toBe(organizationScopes.size);

    for (const organizationScopeId of organizationScopes.values()) {
      expect(result.organizationScopes.some(({ id }) => id === organizationScopeId)).toBeTruthy();
    }

    expect(result.resourceScopes.length).toBe(1);
    expect(result.resourceScopes[0]!.resource.id).toBe(Array.from(resourceIds)[0]);
    expect(result.resourceScopes[0]!.scopes.length).toBe(resourceScopes.size);

    for (const resourceScopeId of resourceScopes.values()) {
      expect(
        result.resourceScopes[0]!.scopes.some(({ id }) => id === resourceScopeId)
      ).toBeTruthy();
    }

    expect(result.organizationResourceScopes.length).toBe(1);
    expect(result.organizationResourceScopes[0]!.resource.id).toBe(Array.from(resourceIds)[0]);
    expect(result.organizationResourceScopes[0]!.scopes.length).toBe(
      organizationResourceScopes.size
    );

    for (const resourceScopeId of organizationResourceScopes.values()) {
      expect(
        result.organizationResourceScopes[0]!.scopes.some(({ id }) => id === resourceScopeId)
      ).toBeTruthy();
    }

    expect(result.userScopes.length).toBe(3);

    for (const userScope of [UserScope.Profile, UserScope.Email, UserScope.OrganizationRoles]) {
      expect(result.userScopes.includes(userScope)).toBeTruthy();
    }
  });

  it('should return empty consent scopes when no scopes assigned', async () => {
    const newApp = await createApplication('new-app', ApplicationType.Traditional, {
      isThirdParty: true,
    });

    const result = await getUserConsentScopes(newApp.id);

    expect(result.organizationScopes.length).toBe(0);
    expect(result.resourceScopes.length).toBe(0);
    expect(result.organizationResourceScopes.length).toBe(0);
    expect(result.userScopes.length).toBe(0);

    await deleteApplication(newApp.id);
  });

  it('should return 404 when trying to delete consent scopes from non-existing application', async () => {
    await expectRejects(
      deleteUserConsentScopes(
        'non-existing-application',
        ApplicationUserConsentScopeType.OrganizationScopes,
        organizationScopes.get('organizationScope1')!
      ),
      {
        code: 'entity.not_exists_with_id',
        status: 404,
      }
    );
  });

  it('should return 404 when trying to delete non-existing consent scopes', async () => {
    await expectRejects(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.OrganizationScopes,
        'non-existing-organization-scope'
      ),
      {
        code: 'entity.not_found',
        status: 404,
      }
    );

    await expectRejects(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.ResourceScopes,
        'non-existing-resource-scope'
      ),
      {
        code: 'entity.not_found',
        status: 404,
      }
    );

    await expectRejects(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.OrganizationResourceScopes,
        'non-existing-resource-scope'
      ),
      {
        code: 'entity.not_found',
        status: 404,
      }
    );

    await expectRejects(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.UserScopes,
        'non-existing-user-scope'
      ),
      {
        code: 'entity.not_found',
        status: 404,
      }
    );
  });

  it('should delete consent scopes successfully', async () => {
    await expect(
      assignUserConsentScopes(applicationIds.get('thirdPartyApp')!, {
        organizationScopes: Array.from(organizationScopes.values()),
        resourceScopes: Array.from(resourceScopes.values()),
        organizationResourceScopes: Array.from(organizationResourceScopes.values()),
        userScopes: [UserScope.Profile, UserScope.Email, UserScope.OrganizationRoles],
      })
    ).resolves.not.toThrow();

    await expect(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.OrganizationScopes,
        organizationScopes.get('organizationScope1')!
      )
    ).resolves.not.toThrow();

    await expect(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.ResourceScopes,
        resourceScopes.get('resourceScope1')!
      )
    ).resolves.not.toThrow();

    await expect(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.OrganizationResourceScopes,
        organizationResourceScopes.get('resourceScope1')!
      )
    ).resolves.not.toThrow();

    await expect(
      deleteUserConsentScopes(
        applicationIds.get('thirdPartyApp')!,
        ApplicationUserConsentScopeType.UserScopes,
        UserScope.OrganizationRoles
      )
    ).resolves.not.toThrow();

    const result = await getUserConsentScopes(applicationIds.get('thirdPartyApp')!);

    expect(
      result.organizationScopes.find(
        ({ id }) => id === organizationScopes.get('organizationScope1')!
      )
    ).toBeUndefined();

    expect(
      result.resourceScopes[0]!.scopes.find(
        ({ id }) => id === resourceScopes.get('resourceScope1')!
      )
    ).toBeUndefined();

    expect(
      result.organizationResourceScopes[0]!.scopes.find(
        ({ id }) => id === organizationResourceScopes.get('resourceScope1')!
      )
    ).toBeUndefined();

    expect(result.userScopes.includes(UserScope.OrganizationRoles)).toBeFalsy();
  });
});
