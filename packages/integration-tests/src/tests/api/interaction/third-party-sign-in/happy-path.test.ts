import { ReservedResource, UserScope } from '@logto/core-kit';
import { type Application, InteractionEvent, ApplicationType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { consent, getConsentInfo, putInteraction } from '#src/api/interaction.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createScope } from '#src/api/scope.js';
import { initClient } from '#src/helpers/client.js';
import { OrganizationApiTest, OrganizationRoleApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import {
  generateResourceIndicator,
  generateResourceName,
  generateRoleName,
  generateScopeName,
  getAccessTokenPayload,
} from '#src/utils.js';

describe('consent api', () => {
  const applications = new Map<string, Application>();
  const thirdPartyApplicationName = 'consent-third-party-app';
  const redirectUri = 'http://example.com';

  const bootStrapApplication = async () => {
    const thirdPartyApplication = await createApplication(
      thirdPartyApplicationName,
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
      }
    );

    applications.set(thirdPartyApplicationName, thirdPartyApplication);

    await assignUserConsentScopes(thirdPartyApplication.id, {
      userScopes: [UserScope.Profile],
    });
  };

  beforeAll(async () => {
    await Promise.all([enableAllPasswordSignInMethods(), bootStrapApplication()]);
  });

  it('get consent info', async () => {
    const application = applications.get(thirdPartyApplicationName);
    assert(application, new Error('application.not_found'));

    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const client = await initClient(
      {
        appId: application.id,
        appSecret: application.secret,
      },
      redirectUri
    );

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await client.processSession(redirectTo, false);

    const result = await client.send(getConsentInfo);

    expect(result.application.id).toBe(application.id);
    expect(result.user.id).toBe(user.id);
    expect(result.redirectUri).toBe(redirectUri);
    expect(result.missingOIDCScope).toEqual([UserScope.Profile]);

    await deleteUser(user.id);
  });

  it('get consent info with organization scope', async () => {
    const application = applications.get(thirdPartyApplicationName);
    assert(application, new Error('application.not_found'));

    const organizationScopeApi = new OrganizationScopeApi();

    const organizationScope = await organizationScopeApi.create({
      name: generateScopeName(),
    });

    await assignUserConsentScopes(application.id, {
      organizationScopes: [organizationScope.id],
      userScopes: [UserScope.Organizations],
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const client = await initClient(
      {
        appId: application.id,
        appSecret: application.secret,
        scopes: [UserScope.Organizations, UserScope.Profile, organizationScope.name],
      },
      redirectUri
    );

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await client.processSession(redirectTo, false);

    const result = await client.send(getConsentInfo);

    expect(
      result.missingResourceScopes?.find(
        ({ resource }) => resource.name === ReservedResource.Organization
      )
    ).not.toBeUndefined();

    await organizationScopeApi.delete(organizationScope.id);
    await deleteUser(user.id);
  });

  it('get consent info with organization resource scopes', async () => {
    const application = applications.get(thirdPartyApplicationName);
    assert(application, new Error('application.not_found'));

    const resource = await createResource(generateResourceName(), generateResourceIndicator());
    const scope = await createScope(resource.id, generateScopeName());
    const scope2 = await createScope(resource.id, generateScopeName());
    const roleApi = new OrganizationRoleApiTest();
    const role = await roleApi.create({
      name: generateRoleName(),
      resourceScopeIds: [scope.id],
    });
    const organizationApi = new OrganizationApiTest();
    const organization = await organizationApi.create({ name: 'test_org' });
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    await organizationApi.addUsers(organization.id, [user.id]);
    await organizationApi.addUserRoles(organization.id, user.id, [role.id]);

    await assignUserConsentScopes(application.id, {
      organizationResourceScopes: [scope.id],
      userScopes: [UserScope.Organizations],
    });

    const client = await initClient(
      {
        appId: application.id,
        appSecret: application.secret,
        scopes: [UserScope.Organizations, UserScope.Profile, scope.name, scope2.name],
        resources: [resource.indicator],
      },
      redirectUri
    );

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await client.processSession(redirectTo, false);

    const result = await client.send(getConsentInfo);

    expect(result.missingResourceScopes).toHaveLength(0);
    // Only scope1, scope2 is removed
    expect(result.organizations?.[0]?.missingResourceScopes).toHaveLength(1);

    await roleApi.cleanUp();
    await organizationApi.cleanUp();
    await deleteResource(resource.id);
    await deleteUser(user.id);
  });

  describe('submit consent info', () => {
    it('should perform manual consent successfully', async () => {
      const application = applications.get(thirdPartyApplicationName);
      assert(application, new Error('application.not_found'));

      const { userProfile, user } = await generateNewUser({ username: true, password: true });

      const client = await initClient(
        {
          appId: application.id,
          appSecret: application.secret,
        },
        redirectUri
      );

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          username: userProfile.username,
          password: userProfile.password,
        },
      });

      const { redirectTo } = await client.submitInteraction();

      await client.processSession(redirectTo, false);
      const { redirectTo: consentRedirectTo } = await client.send(consent);
      await client.manualConsent(consentRedirectTo);

      await deleteUser(user.id);
    });

    it('consent with organization id and verify access token scope', async () => {
      const application = applications.get(thirdPartyApplicationName);
      assert(application, new Error('application.not_found'));

      const resource = await createResource(generateResourceName(), generateResourceIndicator());
      const scope = await createScope(resource.id, generateScopeName());
      const scope2 = await createScope(resource.id, generateScopeName());
      const roleApi = new OrganizationRoleApiTest();
      const role = await roleApi.create({
        name: generateRoleName(),
        resourceScopeIds: [scope.id],
      });
      const role2 = await roleApi.create({
        name: generateRoleName(),
        resourceScopeIds: [scope2.id],
      });
      const organizationApi = new OrganizationApiTest();
      const organization = await organizationApi.create({ name: 'test_org_1' });
      const { userProfile, user } = await generateNewUser({ username: true, password: true });
      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.addUserRoles(organization.id, user.id, [role.id]);

      const organization2 = await organizationApi.create({ name: 'test_org_2' });
      await organizationApi.addUsers(organization2.id, [user.id]);
      await organizationApi.addUserRoles(organization2.id, user.id, [role2.id]);

      await assignUserConsentScopes(application.id, {
        organizationResourceScopes: [scope.id],
        userScopes: [UserScope.Organizations],
      });

      const client = await initClient(
        {
          appId: application.id,
          appSecret: application.secret,
          scopes: [UserScope.Organizations, UserScope.Profile, scope.name, scope2.name],
          resources: [resource.indicator],
        },
        redirectUri
      );

      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          username: userProfile.username,
          password: userProfile.password,
        },
      });

      const { redirectTo } = await client.submitInteraction();

      await client.processSession(redirectTo, false);
      const { redirectTo: consentRedirectTo } = await client.send(consent, {
        organizationIds: [organization.id],
      });
      await client.manualConsent(consentRedirectTo);
      const accessToken = await client.getAccessToken(resource.indicator, organization.id);
      // Scope2 is removed because organization2 is not consented
      expect(getAccessTokenPayload(accessToken)).toHaveProperty('scope', scope.name);

      await roleApi.cleanUp();
      await organizationApi.cleanUp();
      await deleteResource(resource.id);
      await deleteUser(user.id);
    });
  });

  afterAll(async () => {
    for (const application of applications.values()) {
      void deleteApplication(application.id);
    }
  });
});
