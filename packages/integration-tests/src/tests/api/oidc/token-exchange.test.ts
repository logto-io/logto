import { UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { decodeAccessToken } from '@logto/js';
import { ApplicationType, GrantType, MfaFactor } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { createUserMfaVerification, deleteUser } from '#src/api/admin-user.js';
import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { createSubjectToken } from '#src/api/subject-token.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { devFeatureTest, getAccessTokenPayload, randomString, generateName } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('Token Exchange', () => {
  /* eslint-disable @silverhand/fp/no-let */
  let userId: string;
  let applicationId: string;
  /* eslint-enable @silverhand/fp/no-let */

  /* eslint-disable @silverhand/fp/no-mutation */
  beforeAll(async () => {
    const user = await createUserByAdmin();
    userId = user.id;
    const applicationName = 'test-token-exchange-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
    });
    applicationId = application.id;
  });
  /* eslint-enable @silverhand/fp/no-mutation */

  afterAll(async () => {
    await deleteUser(userId);
    await deleteApplication(applicationId);
  });

  describe('Basic flow', () => {
    it('should exchange an access token by a subject token', async () => {
      const { subjectToken } = await createSubjectToken(userId);

      const body = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: applicationId,
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
      const { subjectToken } = await createSubjectToken(userId);

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
            client_id: applicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: 'invalid_subject_token',
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
      ).rejects.toThrow();
    });

    it('should failed with consumed subject token', async () => {
      const { subjectToken } = await createSubjectToken(userId);

      await oidcApi.post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: applicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: subjectToken,
          subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
        }),
      });
      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: applicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
          }),
        })
      ).rejects.toThrow();
    });

    it('should fail with a third-party application', async () => {
      const { subjectToken } = await createSubjectToken(userId);
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
      const { subjectToken } = await createSubjectToken(userId);

      const body = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: applicationId,
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
      await organizationApi.addUsers(testOrganizationId, [userId]);

      const scope = await organizationApi.scopeApi.create({ name: scopeName });
      testApiScopeId = scope.id;

      const role = await organizationApi.roleApi.create({ name: `role1:${randomString()}` });
      await organizationApi.roleApi.addScopes(role.id, [scope.id]);
      await organizationApi.addUserRoles(testOrganizationId, userId, [role.id]);
    });
    /* eslint-enable @silverhand/fp/no-mutation */

    afterAll(async () => {
      await organizationApi.cleanUp();
    });

    it('should be able to get access token for organization with correct scopes', async () => {
      const { subjectToken } = await createSubjectToken(userId);

      const { access_token } = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: applicationId,
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
      const { subjectToken } = await createSubjectToken(userId);
      await organizationApi.update(testOrganizationId, { isMfaRequired: true });

      await expect(
        oidcApi.post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: applicationId,
            grant_type: GrantType.TokenExchange,
            subject_token: subjectToken,
            subject_token_type: 'urn:ietf:params:oauth:token-type:access_token',
            organization_id: testOrganizationId,
          }),
        })
      ).rejects.toThrow();
    });

    it('should be able to get access token for organization when user has mfa configured', async () => {
      const { subjectToken } = await createSubjectToken(userId);
      await createUserMfaVerification(userId, MfaFactor.TOTP);
      const { access_token } = await oidcApi
        .post('token', {
          headers: formUrlEncodedHeaders,
          body: new URLSearchParams({
            client_id: applicationId,
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
});
