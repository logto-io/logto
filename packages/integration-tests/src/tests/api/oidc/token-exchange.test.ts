import { UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { decodeAccessToken } from '@logto/js';
import {
  ApplicationType,
  GrantType,
  InteractionEvent,
  MfaFactor,
  type Resource,
} from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { createUserMfaVerification, deleteUser } from '#src/api/admin-user.js';
import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { putInteraction } from '#src/api/interaction.js';
import { deleteJwtCustomizer, upsertJwtCustomizer } from '#src/api/logto-config.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createSubjectToken } from '#src/api/subject-token.js';
import type MockClient from '#src/client/index.js';
import { initClient, processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  getAccessTokenPayload,
  randomString,
  generateName,
  generatePassword,
  generateUsername,
} from '#src/utils.js';

describe('Token Exchange', () => {
  const username = generateUsername();
  const password = generatePassword();
  // Add test resource to ensure that the access token is JWT,
  // make it easy to check claims.
  const testApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'test-api-resource',
    indicator: 'https://foo.logto.io/api',
  };

  /* eslint-disable @silverhand/fp/no-let */
  let testApiResourceId: string;
  let testApplicationId: string;
  let testUserId: string;
  let testAccessToken: string;
  let client: MockClient;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();

    /* eslint-disable @silverhand/fp/no-mutation */
    const resource = await createResource(testApiResourceInfo.name, testApiResourceInfo.indicator);
    testApiResourceId = resource.id;
    const applicationName = 'test-token-exchange-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
    });
    testApplicationId = application.id;
    const { id } = await createUserByAdmin({ username, password });
    testUserId = id;
    client = await initClient({
      resources: [testApiResourceInfo.indicator],
    });
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    testAccessToken = await client.getAccessToken();
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await deleteUser(testUserId);
    await deleteResource(testApiResourceId);
    await deleteApplication(testApplicationId);
  });

  describe('Basic flow', () => {
    it('should exchange an access token by a subject token', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const body = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
        .json();

      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('token_type', 'Bearer');
      expect(body).toHaveProperty('expires_in');
      expect(body).toHaveProperty('scope', '');
    });

    it('should fail without valid client_id', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
      ).rejects.toThrow();
    });

    it('should failed with invalid subject token', async () => {
      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: 'invalid_subject_token',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
      ).rejects.toThrow();
    });

    it('should failed with consumed subject token', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      await oidcApi.post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: subjectToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        }),
      });
      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
      ).rejects.toThrow();
    });

    it('should fail with a third-party application', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);
      const thirdPartyApplication = await createApplication(
        generateName(),
        ApplicationType.Traditional,
        {
          isThirdParty: true,
        }
      );

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: thirdPartyApplication.id,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
      ).rejects.toThrow();

      await deleteApplication(thirdPartyApplication.id);
    });

    it('should filter out non-oidc scopes', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const body = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            scope: [UserScope.Profile, 'non-oidc-scope'].join(' '),
          }),
        })
        .json();

      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('token_type', 'Bearer');
      expect(body).toHaveProperty('expires_in');
      expect(body).toHaveProperty('scope', UserScope.Profile);
    });
  });

  describe('get access token for resource', () => {
    it('should exchange an access token with resource as `aud`', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const { access_token } = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            resource: testApiResourceInfo.indicator,
          }),
        })
        .json<{ access_token: string }>();

      expect(getAccessTokenPayload(access_token)).toHaveProperty(
        'aud',
        testApiResourceInfo.indicator
      );
    });

    it('should fail with invalid resource', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            resource: 'invalid_resource',
          }),
        })
      ).rejects.toThrow();
    });
  });

  describe('get access token for organization', () => {
    const scopeName = `read:${randomString()}`;

    /* eslint-disable @silverhand/fp/no-let */
    let testApiScopeId: string;
    let testOrganizationId: string;
    /* eslint-enable @silverhand/fp/no-let */

    const organizationApi = new OrganizationApiTest();

    /* eslint-disable @silverhand/fp/no-mutation */
    beforeAll(async () => {
      const organization = await organizationApi.create({ name: 'org1' });
      testOrganizationId = organization.id;
      await organizationApi.addUsers(testOrganizationId, [testUserId]);

      const scope = await organizationApi.scopeApi.create({ name: scopeName });
      testApiScopeId = scope.id;

      const role = await organizationApi.roleApi.create({ name: `role1:${randomString()}` });
      await organizationApi.roleApi.addScopes(role.id, [scope.id]);
      await organizationApi.addUserRoles(testOrganizationId, testUserId, [role.id]);
    });
    /* eslint-enable @silverhand/fp/no-mutation */

    afterAll(async () => {
      await organizationApi.cleanUp();
    });

    it('should be able to get access token for organization with correct scopes', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const { access_token } = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            organization_id: testOrganizationId,
            scope: scopeName,
          }),
        })
        .json<{ access_token: string }>();

      expect(getAccessTokenPayload(access_token)).toMatchObject({
        aud: buildOrganizationUrn(testOrganizationId),
        scope: scopeName,
      });
    });

    it('should throw when organization requires mfa but user has not configured', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);
      await organizationApi.update(testOrganizationId, { isMfaRequired: true });

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            organization_id: testOrganizationId,
          }),
        })
      ).rejects.toThrow();
    });

    it('should be able to get access token for organization when user has mfa configured', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);
      await createUserMfaVerification(testUserId, MfaFactor.TOTP);
      const { access_token } = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            organization_id: testOrganizationId,
          }),
        })
        .json<{ access_token: string }>();

      expect(decodeAccessToken(access_token)).toMatchObject({
        aud: buildOrganizationUrn(testOrganizationId),
      });
    });
  });

  describe('with actor token', () => {
    it('should exchange an access token with `act` claim', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const { access_token } = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            actor_token: testAccessToken,
            actor_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            resource: testApiResourceInfo.indicator,
          }),
        })
        .json<{ access_token: string }>();

      expect(getAccessTokenPayload(access_token)).toHaveProperty('act', { sub: testUserId });
    });

    it('should fail with invalid actor_token_type', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            actor_token: testAccessToken,
            actor_token_type: 'invalid_actor_token_type',
            resource: testApiResourceInfo.indicator,
          }),
        })
      ).rejects.toThrow();
    });

    it('should fail with invalid actor_token', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            actor_token: 'invalid_actor_token',
            actor_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            resource: testApiResourceInfo.indicator,
          }),
        })
      ).rejects.toThrow();
    });

    it('should fail when the actor token do not have `openid` scope', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);
      // Set `resource` to ensure that the access token is JWT, and then it won't have `openid` scope.
      const accessToken = await client.getAccessToken(testApiResourceInfo.indicator);

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            actor_token: accessToken,
            actor_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            resource: testApiResourceInfo.indicator,
          }),
        })
      ).rejects.toThrow();
    });
  });

  describe('custom jwt', () => {
    it('should get context from subject token', async () => {
      const { subjectToken } = await createSubjectToken(testUserId, { foo: 'bar' });
      await upsertJwtCustomizer('access-token', {
        script: `const getCustomJwtClaims = async ({ token, context, environmentVariables }) => {
  return { foo: context?.grant?.subjectTokenContext?.foo };
};`,
      });

      const { access_token } = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            resource: testApiResourceInfo.indicator,
          }),
        })
        .json<{ access_token: string }>();

      expect(getAccessTokenPayload(access_token)).toHaveProperty('foo', 'bar');
      await deleteJwtCustomizer('access-token');
    });
  });
});
