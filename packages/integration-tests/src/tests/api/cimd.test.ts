import { UserScope } from '@logto/core-kit';
import { ApplicationUserConsentScopeType } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import {
  assignCimdUserConsentScopes,
  deleteCimdUserConsentScope,
  getCimdUserConsentScopes,
} from '#src/api/cimd.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createScope } from '#src/api/scope.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureDisabledTest, devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('CIMD user consent scopes', () => {
  const organizationScopes = new Map<string, string>();
  const resourceScopes = new Map<string, string>();
  const organizationResourceScopes = new Map<string, string>();
  const resourceIds = new Set<string>();

  const organizationScopeApi = new OrganizationScopeApi();

  beforeAll(async () => {
    const organizationScope1 = await organizationScopeApi.create({
      name: 'cimd-organization-scope-1',
    });
    const organizationScope2 = await organizationScopeApi.create({
      name: 'cimd-organization-scope-2',
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

    organizationResourceScopes.set('resourceScope1', resourceScope3.id);
  });

  afterAll(async () => {
    // Deleting the resources and organization scopes cascades to the CIMD relations.
    await Promise.all(
      Array.from(resourceIds).map(async (resourceId) => deleteResource(resourceId))
    );
    await Promise.all(
      Array.from(organizationScopes.values()).map(async (organizationScopeId) =>
        organizationScopeApi.delete(organizationScopeId)
      )
    );
    await deleteCimdUserConsentScope(
      ApplicationUserConsentScopeType.UserScopes,
      UserScope.Profile
    ).catch(() => {
      // The scope may already be removed by individual tests.
    });
  });

  it('should return empty consent scopes when nothing is assigned', async () => {
    const result = await getCimdUserConsentScopes();

    expect(result.organizationScopes.length).toBe(0);
    expect(result.resourceScopes.length).toBe(0);
    expect(result.organizationResourceScopes.length).toBe(0);
    expect(result.userScopes.length).toBe(0);
  });

  it('should throw error when trying to assign a non-existing scope', async () => {
    await expectRejects(
      assignCimdUserConsentScopes({ organizationScopes: ['non-existing-organization-scope'] }),
      {
        code: 'application.user_consent_scopes_not_found',
        status: 422,
      }
    );

    await expectRejects(assignCimdUserConsentScopes({ resourceScopes: ['non-existing-scope'] }), {
      code: 'application.user_consent_scopes_not_found',
      status: 422,
    });

    await expectRejects(
      assignCimdUserConsentScopes({ organizationResourceScopes: ['non-existing-scope'] }),
      {
        code: 'application.user_consent_scopes_not_found',
        status: 422,
      }
    );
  });

  it('should assign consent scopes successfully and idempotently', async () => {
    await expect(
      assignCimdUserConsentScopes({
        organizationScopes: Array.from(organizationScopes.values()),
        resourceScopes: Array.from(resourceScopes.values()),
        organizationResourceScopes: Array.from(organizationResourceScopes.values()),
        userScopes: [UserScope.Profile, UserScope.Email],
      })
    ).resolves.not.toThrow();

    // Re-assigning existing scopes does not throw.
    await expect(
      assignCimdUserConsentScopes({
        organizationScopes: [organizationScopes.get('organizationScope1')!],
        resourceScopes: [resourceScopes.get('resourceScope1')!],
        userScopes: [UserScope.Profile],
      })
    ).resolves.not.toThrow();
  });

  it('should return the assigned scopes grouped by resource', async () => {
    const result = await getCimdUserConsentScopes();

    expect(result.organizationScopes.length).toBe(organizationScopes.size);
    for (const organizationScopeId of organizationScopes.values()) {
      expect(result.organizationScopes.some(({ id }) => id === organizationScopeId)).toBeTruthy();
    }

    expect(result.resourceScopes.length).toBe(1);
    expect(result.resourceScopes[0]!.resource.id).toBe(Array.from(resourceIds)[0]);
    expect(result.resourceScopes[0]!.scopes.length).toBe(resourceScopes.size);

    expect(result.organizationResourceScopes.length).toBe(1);
    expect(result.organizationResourceScopes[0]!.scopes.length).toBe(
      organizationResourceScopes.size
    );

    expect(result.userScopes.length).toBe(2);
    expect(result.userScopes.includes(UserScope.Profile)).toBeTruthy();
    expect(result.userScopes.includes(UserScope.Email)).toBeTruthy();
  });

  it('should return 404 when trying to delete a non-existing consent scope', async () => {
    await expectRejects(
      deleteCimdUserConsentScope(
        ApplicationUserConsentScopeType.OrganizationScopes,
        'non-existing-organization-scope'
      ),
      {
        code: 'entity.not_found',
        status: 404,
      }
    );

    await expectRejects(
      deleteCimdUserConsentScope(
        ApplicationUserConsentScopeType.UserScopes,
        'non-existing-user-scope'
      ),
      {
        code: 'entity.not_found',
        status: 404,
      }
    );
  });

  it('should delete consent scopes of every type successfully', async () => {
    await expect(
      deleteCimdUserConsentScope(
        ApplicationUserConsentScopeType.OrganizationScopes,
        organizationScopes.get('organizationScope1')!
      )
    ).resolves.not.toThrow();

    await expect(
      deleteCimdUserConsentScope(
        ApplicationUserConsentScopeType.ResourceScopes,
        resourceScopes.get('resourceScope1')!
      )
    ).resolves.not.toThrow();

    await expect(
      deleteCimdUserConsentScope(
        ApplicationUserConsentScopeType.OrganizationResourceScopes,
        organizationResourceScopes.get('resourceScope1')!
      )
    ).resolves.not.toThrow();

    await expect(
      deleteCimdUserConsentScope(ApplicationUserConsentScopeType.UserScopes, UserScope.Email)
    ).resolves.not.toThrow();

    const result = await getCimdUserConsentScopes();

    expect(
      result.organizationScopes.some(
        ({ id }) => id === organizationScopes.get('organizationScope1')!
      )
    ).toBeFalsy();
    expect(
      result.resourceScopes[0]!.scopes.some(
        ({ id }) => id === resourceScopes.get('resourceScope1')!
      )
    ).toBeFalsy();
    expect(result.organizationResourceScopes.length).toBe(0);
    expect(result.userScopes.includes(UserScope.Email)).toBeFalsy();
  });
});

devFeatureDisabledTest.describe('CIMD routes when dev features are disabled', () => {
  it('should not expose the CIMD user consent scope routes', async () => {
    const response = await authedAdminApi.get('cimd/user-consent-scopes', {
      throwHttpErrors: false,
    });

    expect(response.status).toBe(404);
  });
});
