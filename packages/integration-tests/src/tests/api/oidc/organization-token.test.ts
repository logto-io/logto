import assert from 'node:assert';

import { UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { LogtoRequestError } from '@logto/js';
import { InteractionEvent, MfaFactor } from '@logto/schemas';

import { createUserMfaVerification, deleteUser } from '#src/api/admin-user.js';
import { putInteraction } from '#src/api/index.js';
import MockClient from '#src/client/index.js';
import { processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername, randomString } from '#src/utils.js';

describe('get access token for organization', () => {
  const username = generateUsername();
  const password = generatePassword();
  const scopeName = `read:${randomString()}`;
  const scopeName2 = `read:other:${randomString()}`;
  const client = new MockClient({
    scopes: [scopeName, scopeName2, UserScope.Organizations],
  });

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
    await client.initSession();
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
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
    await createUserMfaVerification(testUserId, MfaFactor.TOTP);
    await expect(client.getOrganizationTokenClaims(testOrganizationId)).resolves.toMatchObject({
      aud: buildOrganizationUrn(testOrganizationId),
    });
  });
});
