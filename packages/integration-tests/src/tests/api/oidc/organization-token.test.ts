import assert from 'node:assert';

import { UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { LogtoRequestError } from '@logto/js';
import { ApplicationType, ApplicationUserConsentScopeType, MfaFactor } from '@logto/schemas';

import { createUserMfaVerification, deleteUser } from '#src/api/admin-user.js';
import {
  assignUserConsentScopes,
  deleteUserConsentScopes,
} from '#src/api/application-user-consent-scope.js';
import { createApplicationWithSecret, deleteApplication } from '#src/api/application.js';
import { consent } from '#src/api/interaction.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { type ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  enableAllPasswordSignInMethods,
  enableUserControlledMfaWithTotp,
} from '#src/helpers/sign-in-experience.js';
import {
  generatePassword,
  generateResourceIndicator,
  generateResourceName,
  generateRoleName,
  generateUsername,
  randomString,
} from '#src/utils.js';

describe('get access token for organization', () => {
  const username = generateUsername();
  const password = generatePassword();
  const scopeName = `read:${randomString()}`;
  const scopeName2 = `read:other:${randomString()}`;
  // eslint-disable-next-line @silverhand/fp/no-let
  let client: ExperienceClient;

  /* eslint-disable @silverhand/fp/no-let */
  let testApiScopeId: string;
  let testApiScopeId2: string;
  let testUserId: string;
  let testOrganizationId: string;
  let testOrganizationId2: string;
  /* eslint-enable @silverhand/fp/no-let */

  const organizationApi = new OrganizationApiTest();

  /* eslint-disable @silverhand/fp/no-mutation */
  beforeAll(async () => {
    const user = await createUserByAdmin({ username, password });
    testUserId = user.id;

    const organization = await organizationApi.create({ name: 'org1' });
    testOrganizationId = organization.id;
    await organizationApi.addUsers(testOrganizationId, [user.id]);

    const scope = await organizationApi.scopeApi.create({ name: scopeName });
    testApiScopeId = scope.id;
    const scope2 = await organizationApi.scopeApi.create({ name: scopeName2 });
    testApiScopeId2 = scope2.id;

    const role = await organizationApi.roleApi.create({ name: `role1:${randomString()}` });
    await organizationApi.roleApi.addScopes(role.id, [scope.id]);
    await organizationApi.addUserRoles(testOrganizationId, user.id, [role.id]);

    const organization2 = await organizationApi.create({ name: 'org2' });
    testOrganizationId2 = organization2.id;
    await organizationApi.addUsers(testOrganizationId2, [user.id]);
    const role2 = await organizationApi.roleApi.create({ name: `role2:${randomString()}` });
    await organizationApi.roleApi.addScopes(role2.id, [scope2.id]);
    await organizationApi.addUserRoles(testOrganizationId2, user.id, [role2.id]);

    await enableAllPasswordSignInMethods();

    // Prepare client
    client = await initExperienceClient({
      config: {
        scopes: [scopeName, scopeName2, UserScope.Organizations],
      },
    });
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
  });
  /* eslint-enable @silverhand/fp/no-mutation */

  afterAll(async () => {
    await Promise.all([organizationApi.cleanUp(), deleteUser(testUserId)]);
  });

  it('should be able to get access token for organization with correct scopes', async () => {
    await expect(client.getOrganizationTokenClaims(testOrganizationId)).resolves.toMatchObject({
      aud: buildOrganizationUrn(testOrganizationId),
      scope: scopeName,
    });
    await expect(client.getOrganizationTokenClaims(testOrganizationId2)).resolves.toMatchObject({
      aud: buildOrganizationUrn(testOrganizationId2),
      scope: scopeName2,
    });
  });

  it('should be able to dynamically get access token according to the status quo', async () => {
    const newOrganization = await organizationApi.create({ name: 'foo' });

    await organizationApi.addUsers(newOrganization.id, [testUserId]);
    await expect(client.getOrganizationTokenClaims(newOrganization.id)).resolves.toMatchObject({
      aud: buildOrganizationUrn(newOrganization.id),
    });

    await organizationApi.deleteUser(newOrganization.id, testUserId);
    await client.clearAccessToken();

    const error = await client
      .getOrganizationTokenClaims(newOrganization.id)
      .catch((error: unknown) => error);

    assert(error instanceof LogtoRequestError);
    expect(error.code).toBe('oidc.access_denied');
  });

  it('should throw when organization requires mfa but user has not configured', async () => {
    await organizationApi.update(testOrganizationId, { isMfaRequired: true });
    await client.clearAccessToken();

    const error = await client
      .getOrganizationTokenClaims(testOrganizationId)
      .catch((error: unknown) => error);

    assert(error instanceof LogtoRequestError);
    expect(error.code).toBe('oidc.access_denied');
  });

  it('should be able to get access token for organization when user has mfa configured', async () => {
    // Organization tokens follow the sign-in rule: a stored factor only counts when it is enabled
    // in the sign-in experience.
    await enableUserControlledMfaWithTotp();
    await createUserMfaVerification(testUserId, MfaFactor.TOTP);
    await expect(client.getOrganizationTokenClaims(testOrganizationId)).resolves.toMatchObject({
      aud: buildOrganizationUrn(testOrganizationId),
    });
  });
});

describe('third-party application organization token scope isolation', () => {
  const redirectUri = 'http://example.com';

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('should enforce live organizationScopes and Grant[Org] on registered third-party org tokens', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const collidedScopeName = `read:${randomString()}`;
    const enabledOrgScopeName = `invite:${randomString()}`;
    const removableOrgScopeName = `manage:${randomString()}`;

    const organizationApi = new OrganizationApiTest();
    const user = await createUserByAdmin({ username, password });
    const resource = await createResource(generateResourceName(), generateResourceIndicator());
    const apiScope = await createScope(resource.id, collidedScopeName);
    const personalRole = await createRole({ name: generateRoleName(), scopeIds: [apiScope.id] });
    const app = await createApplicationWithSecret(
      `third-party-org-token-isolation-${randomString()}`,
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
        customClientMetadata: {
          alwaysIssueRefreshToken: true,
        },
      }
    );

    try {
      await assignUsersToRole([user.id], personalRole.id);

      const organization = await organizationApi.create({ name: `org:${randomString()}` });
      await organizationApi.addUsers(organization.id, [user.id]);

      const enabledOrgScope = await organizationApi.scopeApi.create({ name: enabledOrgScopeName });
      const removableOrgScope = await organizationApi.scopeApi.create({
        name: removableOrgScopeName,
      });
      const unenabledOrgScope = await organizationApi.scopeApi.create({ name: collidedScopeName });

      const orgRole = await organizationApi.roleApi.create({
        name: `org-role:${randomString()}`,
        organizationScopeIds: [enabledOrgScope.id, removableOrgScope.id, unenabledOrgScope.id],
      });
      await organizationApi.addUserRoles(organization.id, user.id, [orgRole.id]);

      // Enable the colliding scope on the API resource, but omit it from organizationScopes.
      await assignUserConsentScopes(app.id, {
        userScopes: [UserScope.Profile, UserScope.Organizations],
        resourceScopes: [apiScope.id],
        organizationScopes: [enabledOrgScope.id, removableOrgScope.id],
      });

      const client = await initExperienceClient({
        config: {
          appId: app.id,
          appSecret: app.secret,
          resources: [resource.indicator],
          scopes: [
            UserScope.Organizations,
            enabledOrgScope.name,
            removableOrgScope.name,
            collidedScopeName,
          ],
        },
        redirectUri,
      });

      await identifyUserWithUsernamePassword(client, username, password);
      const { redirectTo } = await client.submitInteraction();
      await client.processSession(redirectTo, false);
      const { redirectTo: consentRedirectTo } = await client.send(consent, {
        organizationIds: [organization.id],
      });
      await client.manualConsent(consentRedirectTo);

      // 1. Enabled & consented org scopes are issued; colliding API resource scope does not leak.
      const initialClaims = await client.getOrganizationTokenClaims(organization.id);
      expect(initialClaims).toMatchObject({
        aud: buildOrganizationUrn(organization.id),
      });
      expect(new Set(initialClaims?.scope?.split(' '))).toEqual(
        new Set([enabledOrgScopeName, removableOrgScopeName])
      );

      // 2. Removing an organizationScope from the third-party app immediately drops it on refresh.
      await deleteUserConsentScopes(
        app.id,
        ApplicationUserConsentScopeType.OrganizationScopes,
        removableOrgScope.id
      );
      await client.clearAccessToken();

      await expect(client.getOrganizationTokenClaims(organization.id)).resolves.toMatchObject({
        aud: buildOrganizationUrn(organization.id),
        scope: enabledOrgScopeName,
      });

      // 3. Enabling the colliding org scope after consent still must not leak it from RT.scope
      // because it was never granted under Grant[urn:logto:resource:organizations].
      await assignUserConsentScopes(app.id, {
        organizationScopes: [unenabledOrgScope.id],
      });
      await client.clearAccessToken();

      await expect(client.getOrganizationTokenClaims(organization.id)).resolves.toMatchObject({
        aud: buildOrganizationUrn(organization.id),
        scope: enabledOrgScopeName,
      });
    } finally {
      await Promise.all([
        deleteApplication(app.id),
        deleteResource(resource.id),
        deleteRole(personalRole.id),
        organizationApi.cleanUp(),
        deleteUser(user.id),
      ]);
    }
  });
});
