import { ApplicationType, GrantType, InteractionEvent, type Resource } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { deleteUser } from '#src/api/admin-user.js';
import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { putInteraction } from '#src/api/interaction.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createSubjectToken } from '#src/api/subject-token.js';
import type MockClient from '#src/client/index.js';
import { initClient, processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername, getAccessTokenPayload } from '#src/utils.js';

describe('Token Exchange (Actor Token)', () => {
  const username = generateUsername();
  const password = generatePassword();

  const testApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'test-actor-token-resource',
    indicator: 'https://actor-token.logto.io/api',
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

    const applicationName = 'test-actor-token-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
      customClientMetadata: { allowTokenExchange: true },
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
