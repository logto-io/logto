import { ApplicationType, GrantType } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { deleteUser } from '#src/api/admin-user.js';
import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { createSubjectToken } from '#src/api/subject-token.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

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
  });
});
