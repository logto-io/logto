import { ReservedResource, UserScope } from '@logto/core-kit';
import { type Application, InteractionEvent, ApplicationType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { consent, getConsentInfo, putInteraction } from '#src/api/interaction.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
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
  const firstPartyApplicationName = 'consent-first-party-app';
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

    const firstPartyApplication = await createApplication(
      firstPartyApplicationName,
      ApplicationType.Traditional,
      {
        isThirdParty: false,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
      }
    );

    applications.set(thirdPartyApplicationName, thirdPartyApplication);
    applications.set(firstPartyApplicationName, firstPartyApplication);

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

  describe('get consent info with organization resource scopes', () => {
    const roleApi = new OrganizationRoleApiTest();
    const organizationApi = new OrganizationApiTest();

    afterEach(async () => {
      await roleApi.cleanUp();
      await organizationApi.cleanUp();
    });

    it('should get scope list from orgniazation roles', async () => {
      const application = applications.get(thirdPartyApplicationName);
      assert(application, new Error('application.not_found'));

      const resource = await createResource(generateResourceName(), generateResourceIndicator());
      const scope = await createScope(resource.id, generateScopeName());
      const scope2 = await createScope(resource.id, generateScopeName());
      const role = await roleApi.create({
        name: generateRoleName(),
        resourceScopeIds: [scope.id],
      });
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

      await deleteResource(resource.id);
      await deleteUser(user.id);
    });

    it('should handle duplicated scopes which are assigned to either personal or organization', async () => {
      const application = applications.get(thirdPartyApplicationName);
      assert(application, new Error('application.not_found'));

      const resource = await createResource(generateResourceName(), generateResourceIndicator());
      const scope = await createScope(resource.id, generateScopeName());
      const role = await roleApi.create({
        name: generateRoleName(),
        resourceScopeIds: [scope.id],
      });
      const organization = await organizationApi.create({ name: 'test_org' });
      const { userProfile, user } = await generateNewUser({ username: true, password: true });
      await organizationApi.addUsers(organization.id, [user.id]);
      await organizationApi.addUserRoles(organization.id, user.id, [role.id]);

      // Assign the scope to resourceScopes but not to organizationResourceScopes
      await assignUserConsentScopes(application.id, {
        resourceScopes: [scope.id],
        userScopes: [UserScope.Organizations],
      });

      const client = await initClient(
        {
          appId: application.id,
          appSecret: application.secret,
          scopes: [UserScope.Organizations, UserScope.Profile, scope.name],
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
      // No missing resource scopes, because the scope is only assigned to resourceScopes
      expect(result.organizations?.[0]?.missingResourceScopes).toHaveLength(0);

      await deleteResource(resource.id);
      await deleteUser(user.id);
    });
  });

  describe('submit consent info', () => {
    it('should not affect first party app', async () => {
      const application = applications.get(firstPartyApplicationName);
      assert(application, new Error('application.not_found'));

      const { userProfile, user } = await generateNewUser({ username: true, password: true });
      const resource = await createResource(generateResourceName(), generateResourceIndicator());
      const scope = await createScope(resource.id, generateScopeName());
      const role = await createRole({ name: generateRoleName(), scopeIds: [scope.id] });
      await assignUsersToRole([user.id], role.id);

      const client = await initClient(
        {
          appId: application.id,
          appSecret: application.secret,
          // First party app should block the scope, even though it is not assigned to the app
          scopes: [UserScope.Profile, scope.name],
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

      await client.processSession(redirectTo);

      await deleteResource(resource.id);
      await deleteUser(user.id);
      await deleteRole(role.id);
    });

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
