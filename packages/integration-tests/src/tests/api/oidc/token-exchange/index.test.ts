/* eslint-disable max-lines */
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
import {
  createApplication,
  deleteApplication,
  getApplicationSecrets,
  updateApplication,
} from '#src/api/application.js';
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

const impersonationTokenType = 'urn:logto:token-type:impersonation_token';
const legacyAccessTokenType = 'urn:ietf:params:oauth:token-type:access_token';

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
  let client: MockClient;
  let authorizationHeader: string;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();

    /* eslint-disable @silverhand/fp/no-mutation */
    const resource = await createResource(testApiResourceInfo.name, testApiResourceInfo.indicator);
    testApiResourceId = resource.id;
    const applicationName = 'test-token-exchange-app';
    // Use Traditional (confidential client) and explicitly enable token exchange
    const applicationType = ApplicationType.Traditional;
    const application = await createApplication(applicationName, applicationType, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
      customClientMetadata: { allowTokenExchange: true },
    });
    testApplicationId = application.id;
    const secrets = await getApplicationSecrets(application.id);
    authorizationHeader = `Basic ${Buffer.from(`${application.id}:${secrets[0]!.value}`).toString(
      'base64'
    )}`;
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
    await client.getAccessToken();
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await deleteUser(testUserId);
    await deleteResource(testApiResourceId);
    await deleteApplication(testApplicationId);
  });

  describe('Basic flow', () => {
    it('should exchange an access token by an impersonation token', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const body = await oidcApi
        .post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
          }),
        })
        .json();

      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('token_type', 'Bearer');
      expect(body).toHaveProperty('expires_in');
      expect(body).toHaveProperty('scope', '');
    });

    it('should exchange an access token using legacy access_token type for backward compatibility', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const body = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: testApplicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: legacyAccessTokenType,
          }),
        })
        .json();

      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('token_type', 'Bearer');
      expect(body).toHaveProperty('expires_in');
    });

    it('should fail without valid client credentials', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
          }),
        })
      ).rejects.toThrow();
    });

    it('should failed with invalid subject token', async () => {
      await expect(
        oidcApi.post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: 'sub_invalid_subject_token',
            subject_token_type: impersonationTokenType,
          }),
        })
      ).rejects.toThrow();
    });

    it('should failed with consumed subject token', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      await oidcApi.post('token', {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: authorizationHeader,
        },
        body: new URLSearchParams({
          grant_type: GrantType.TokenExchange,
          subject_token: subjectToken,
          subject_token_type: impersonationTokenType,
        }),
      });
      await expect(
        oidcApi.post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
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
      const thirdPartySecrets = await getApplicationSecrets(thirdPartyApplication.id);
      const thirdPartyAuthorizationHeader = `Basic ${Buffer.from(
        `${thirdPartyApplication.id}:${thirdPartySecrets[0]!.value}`
      ).toString('base64')}`;

      await expect(
        oidcApi.post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: thirdPartyAuthorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
          }),
        })
      ).rejects.toThrow();

      await deleteApplication(thirdPartyApplication.id);
    });

    it('should fail when token exchange is disabled for the application', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);
      const application = await createApplication(generateName(), ApplicationType.Traditional, {
        oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
      });
      // Disable token exchange for this application
      await updateApplication(application.id, {
        customClientMetadata: { allowTokenExchange: false },
      });
      const secrets = await getApplicationSecrets(application.id);
      const disabledAppAuthorizationHeader = `Basic ${Buffer.from(
        `${application.id}:${secrets[0]!.value}`
      ).toString('base64')}`;

      await expect(
        oidcApi.post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: disabledAppAuthorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
      ).rejects.toThrow();

      await deleteApplication(application.id);
    });

    it('should filter out non-oidc scopes', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const body = await oidcApi
        .post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
            scope: [UserScope.Profile, 'non-oidc-scope'].join(' '),
          }),
        })
        .json();

      expect(body).toHaveProperty('access_token');
      expect(body).toHaveProperty('token_type', 'Bearer');
      expect(body).toHaveProperty('expires_in');
      expect(body).toHaveProperty('scope', UserScope.Profile);
    });

    it('should exchange an access token with a machine-to-machine application', async () => {
      const m2mApp = await createApplication(generateName(), ApplicationType.MachineToMachine, {
        customClientMetadata: { allowTokenExchange: true },
      });
      const m2mSecrets = await getApplicationSecrets(m2mApp.id);
      const m2mAuthorizationHeader = `Basic ${Buffer.from(
        `${m2mApp.id}:${m2mSecrets[0]!.value}`
      ).toString('base64')}`;

      const { subjectToken } = await createSubjectToken(testUserId);

      const body = await oidcApi
        .post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: m2mAuthorizationHeader,
          },
          body: new URLSearchParams({
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

      await deleteApplication(m2mApp.id);
    });
  });

  describe('get access token for resource', () => {
    it('should exchange an access token with resource as `aud`', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const { access_token } = await oidcApi
        .post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
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
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
            resource: 'invalid_resource',
          }),
        })
      ).rejects.toThrow();
    });
  });

  describe('get access token for organization', () => {
    const scopeName = `read:${randomString()}`;

    /* eslint-disable @silverhand/fp/no-let */
    let testOrganizationId: string;
    /* eslint-enable @silverhand/fp/no-let */

    const organizationApi = new OrganizationApiTest();

    beforeAll(async () => {
      /* eslint-disable @silverhand/fp/no-mutation */
      const organization = await organizationApi.create({ name: 'org1' });
      testOrganizationId = organization.id;
      /* eslint-enable @silverhand/fp/no-mutation */
      await organizationApi.addUsers(testOrganizationId, [testUserId]);

      const scope = await organizationApi.scopeApi.create({ name: scopeName });
      const role = await organizationApi.roleApi.create({ name: `role1:${randomString()}` });
      await organizationApi.roleApi.addScopes(role.id, [scope.id]);
      await organizationApi.addUserRoles(testOrganizationId, testUserId, [role.id]);
    });

    afterAll(async () => {
      await organizationApi.cleanUp();
    });

    it('should be able to get access token for organization with correct scopes', async () => {
      const { subjectToken } = await createSubjectToken(testUserId);

      const { access_token } = await oidcApi
        .post('token', {
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
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
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
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
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
            organization_id: testOrganizationId,
          }),
        })
        .json<{ access_token: string }>();

      expect(decodeAccessToken(access_token)).toMatchObject({
        aud: buildOrganizationUrn(testOrganizationId),
      });
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
          headers: {
            ...formUrlEncodedHeaders,
            Authorization: authorizationHeader,
          },
          body: new URLSearchParams({
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: impersonationTokenType,
            resource: testApiResourceInfo.indicator,
          }),
        })
        .json<{ access_token: string }>();

      expect(getAccessTokenPayload(access_token)).toHaveProperty('foo', 'bar');
      await deleteJwtCustomizer('access-token');
    });
  });
});
/* eslint-enable max-lines */
