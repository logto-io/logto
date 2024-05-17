import { UserScope } from '@logto/core-kit';
import { InteractionEvent, type Resource } from '@logto/schemas';

import { createResource, deleteResource, deleteUser, putInteraction } from '#src/api/index.js';
import { createScope, deleteScope } from '#src/api/scope.js';
import MockClient from '#src/client/index.js';
import { processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateUsername, generatePassword, getAccessTokenPayload } from '#src/utils.js';

describe('get access token for organization API resource', () => {
  const username = generateUsername();
  const password = generatePassword();
  const testApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'test-api-resource',
    indicator: 'https://foo.logto.io/api',
  };
  const scopeName = 'read';
  const scopeName2 = 'read:other';

  /* eslint-disable @silverhand/fp/no-let */
  let testApiResourceId: string;
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
    const testApiResource = await createResource(
      testApiResourceInfo.name,
      testApiResourceInfo.indicator
    );
    testApiResourceId = testApiResource.id;
    const scope = await createScope(testApiResource.id, scopeName);
    testApiScopeId = scope.id;
    const scope2 = await createScope(testApiResource.id, scopeName2);
    testApiScopeId2 = scope2.id;

    const organization = await organizationApi.create({ name: 'org1' });
    testOrganizationId = organization.id;
    await organizationApi.addUsers(testOrganizationId, [user.id]);
    const role = await organizationApi.roleApi.create({ name: 'role1' });
    await organizationApi.roleApi.addResourceScopes(role.id, [scope.id]);
    await organizationApi.addUserRoles(testOrganizationId, user.id, [role.id]);

    const organization2 = await organizationApi.create({ name: 'org2' });
    testOrganizationId2 = organization2.id;
    await organizationApi.addUsers(testOrganizationId2, [user.id]);
    const role2 = await organizationApi.roleApi.create({ name: 'role2' });
    await organizationApi.roleApi.addResourceScopes(role2.id, [scope2.id]);
    await organizationApi.addUserRoles(testOrganizationId2, user.id, [role2.id]);

    await enableAllPasswordSignInMethods();
  });
  /* eslint-enable @silverhand/fp/no-mutation */

  afterAll(async () => {
    if (testApiResourceId && testApiScopeId && testApiScopeId2) {
      await deleteScope(testApiResourceId, testApiScopeId);
      await deleteScope(testApiResourceId, testApiScopeId2);
      await deleteResource(testApiResourceId);
    }
    if (testUserId) {
      await deleteUser(testUserId);
    }
    await organizationApi.cleanUp();
    await organizationApi.roleApi.cleanUp();
  });

  it('can sign in and get access token with resource and organization_id', async () => {
    const client = new MockClient({
      resources: [testApiResourceInfo.indicator],
      scopes: [scopeName, scopeName2, UserScope.Organizations],
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(
      testApiResourceInfo.indicator,
      testOrganizationId
    );

    // No scopeName2, because we narrow down to only organization1
    expect(getAccessTokenPayload(accessToken)).toHaveProperty('scope', scopeName);
    expect(getAccessTokenPayload(accessToken)).toHaveProperty(
      'organization_id',
      testOrganizationId
    );
    expect(getAccessTokenPayload(accessToken)).toHaveProperty('aud', testApiResourceInfo.indicator);
  });

  it('can sign in and get normal access token with all scopes', async () => {
    const client = new MockClient({
      resources: [testApiResourceInfo.indicator],
      scopes: [scopeName, scopeName2],
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(testApiResourceInfo.indicator);

    expect(getAccessTokenPayload(accessToken)).toHaveProperty(
      'scope',
      [scopeName, scopeName2].join(' ')
    );
    expect(getAccessTokenPayload(accessToken)).not.toHaveProperty(
      'organization_id',
      testOrganizationId
    );
    expect(getAccessTokenPayload(accessToken)).toHaveProperty('aud', testApiResourceInfo.indicator);
  });

  it('should throw if the user is not in the organization', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const guestUser = await createUserByAdmin({ username, password });
    const client = new MockClient({
      resources: [testApiResourceInfo.indicator],
      scopes: [scopeName, UserScope.Organizations],
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await expect(
      client.getAccessToken(testApiResourceInfo.indicator, testOrganizationId)
    ).rejects.toThrow();
    await deleteUser(guestUser.id);
  });

  it('should not get the scope if the user organization role does not have the scope', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const guestUser = await createUserByAdmin({ username, password });
    await organizationApi.addUsers(testOrganizationId, [guestUser.id]);
    const role = await organizationApi.roleApi.create({ name: 'role3' });
    // Noted that we do not add the scope to the role.
    await organizationApi.addUserRoles(testOrganizationId, guestUser.id, [role.id]);
    const client = new MockClient({
      resources: [testApiResourceInfo.indicator],
      scopes: [scopeName, UserScope.Organizations],
    });
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const accessToken = await client.getAccessToken(
      testApiResourceInfo.indicator,
      testOrganizationId
    );

    expect(getAccessTokenPayload(accessToken)).not.toHaveProperty('scope', scopeName);
    await deleteUser(guestUser.id);
  });
});
