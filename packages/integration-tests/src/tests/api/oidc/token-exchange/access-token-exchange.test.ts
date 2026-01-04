import { ApplicationType, GrantType, InteractionEvent, type Resource } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { deleteUser } from '#src/api/admin-user.js';
import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { putInteraction } from '#src/api/interaction.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { initClient, processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  devFeatureTest,
  generatePassword,
  generateUsername,
  getAccessTokenPayload,
} from '#src/utils.js';

const subjectTokenType = 'urn:ietf:params:oauth:token-type:access_token';

devFeatureTest.describe('Token Exchange (Access Token)', () => {
  const username = generateUsername();
  const password = generatePassword();

  const testApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'test-token-exchange-resource',
    indicator: 'https://token-exchange.logto.io/api',
  };

  const secondApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'second-token-exchange-resource',
    indicator: 'https://token-exchange-2.logto.io/api',
  };

  /* eslint-disable @silverhand/fp/no-let */
  let testApiResourceId: string;
  let secondApiResourceId: string;
  let testApplicationId: string;
  let testUserId: string;
  let accessToken: string;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();

    /* eslint-disable @silverhand/fp/no-mutation */
    const resource = await createResource(testApiResourceInfo.name, testApiResourceInfo.indicator);
    testApiResourceId = resource.id;

    const secondResource = await createResource(
      secondApiResourceInfo.name,
      secondApiResourceInfo.indicator
    );
    secondApiResourceId = secondResource.id;

    const applicationName = 'test-token-exchange-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
    });
    testApplicationId = application.id;

    const { id } = await createUserByAdmin({ username, password });
    testUserId = id;

    // Sign in and get an access token (JWT format when resource is specified)
    const client = await initClient({
      resources: [testApiResourceInfo.indicator],
    });
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    accessToken = await client.getAccessToken(testApiResourceInfo.indicator);
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await deleteUser(testUserId);
    await deleteResource(testApiResourceId);
    await deleteResource(secondApiResourceId);
    await deleteApplication(testApplicationId);
  });

  it('should exchange an access token for another access token', async () => {
    const body = await oidcApi
      .post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: accessToken,
          subject_token_type: subjectTokenType,
        }),
      })
      .json();

    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('token_type', 'Bearer');
    expect(body).toHaveProperty('expires_in');
  });

  it('should exchange an access token for an access token with a different resource', async () => {
    const { access_token } = await oidcApi
      .post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: accessToken,
          subject_token_type: subjectTokenType,
          resource: secondApiResourceInfo.indicator,
        }),
      })
      .json<{ access_token: string }>();

    expect(getAccessTokenPayload(access_token)).toHaveProperty(
      'aud',
      secondApiResourceInfo.indicator
    );
  });

  it('should allow the same access token to be exchanged multiple times', async () => {
    // First exchange
    const body1 = await oidcApi
      .post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: accessToken,
          subject_token_type: subjectTokenType,
        }),
      })
      .json();
    expect(body1).toHaveProperty('access_token');

    // Second exchange with the same token should also succeed
    const body2 = await oidcApi
      .post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: accessToken,
          subject_token_type: subjectTokenType,
        }),
      })
      .json();
    expect(body2).toHaveProperty('access_token');
  });

  it('should fail with an invalid access token', async () => {
    await expect(
      oidcApi.post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: 'invalid.access.token',
          subject_token_type: subjectTokenType,
        }),
      })
    ).rejects.toThrow();
  });

  it('should fail with an access token signed by a different issuer', async () => {
    // Create a fake token with wrong signature (just modify the signature part)
    const parts = accessToken.split('.');
    const fakeToken = `${parts[0]}.${parts[1]}.invalid_signature`;

    await expect(
      oidcApi.post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: fakeToken,
          subject_token_type: subjectTokenType,
        }),
      })
    ).rejects.toThrow();
  });
});
