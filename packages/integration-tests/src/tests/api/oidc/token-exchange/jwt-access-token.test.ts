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
import { devFeatureTest, generatePassword, generateUsername, getAccessTokenPayload } from '#src/utils.js';

const subjectTokenType = 'urn:ietf:params:oauth:token-type:jwt';

devFeatureTest.describe('Token Exchange (JWT Access Token)', () => {
  const username = generateUsername();
  const password = generatePassword();

  const testApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'test-jwt-exchange-resource',
    indicator: 'https://jwt-exchange.logto.io/api',
  };

  const secondApiResourceInfo: Pick<Resource, 'name' | 'indicator'> = {
    name: 'second-jwt-exchange-resource',
    indicator: 'https://jwt-exchange-2.logto.io/api',
  };

  /* eslint-disable @silverhand/fp/no-let */
  let testApiResourceId: string;
  let secondApiResourceId: string;
  let testApplicationId: string;
  let testUserId: string;
  let jwtAccessToken: string;
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

    const applicationName = 'test-jwt-exchange-app';
    const applicationType = ApplicationType.SPA;
    const application = await createApplication(applicationName, applicationType, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
    });
    testApplicationId = application.id;

    const { id } = await createUserByAdmin({ username, password });
    testUserId = id;

    // Sign in and get a JWT access token
    const client = await initClient({
      resources: [testApiResourceInfo.indicator],
    });
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    jwtAccessToken = await client.getAccessToken(testApiResourceInfo.indicator);
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await deleteUser(testUserId);
    await deleteResource(testApiResourceId);
    await deleteResource(secondApiResourceId);
    await deleteApplication(testApplicationId);
  });

  it('should exchange a JWT access token for another access token', async () => {
    const body = await oidcApi
      .post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: jwtAccessToken,
          subject_token_type: subjectTokenType,
        }),
      })
      .json();

    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('token_type', 'Bearer');
    expect(body).toHaveProperty('expires_in');
  });

  it('should exchange a JWT access token for an access token with a different resource', async () => {
    const { access_token } = await oidcApi
      .post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: jwtAccessToken,
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

  it('should allow the same JWT access token to be exchanged multiple times', async () => {
    // First exchange
    const body1 = await oidcApi
      .post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: jwtAccessToken,
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
          subject_token: jwtAccessToken,
          subject_token_type: subjectTokenType,
        }),
      })
      .json();
    expect(body2).toHaveProperty('access_token');
  });

  it('should fail with an invalid JWT', async () => {
    await expect(
      oidcApi.post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({
          client_id: testApplicationId,
          grant_type: GrantType.TokenExchange,
          subject_token: 'invalid.jwt.token',
          subject_token_type: subjectTokenType,
        }),
      })
    ).rejects.toThrow();
  });

  it('should fail with a JWT signed by a different issuer', async () => {
    // Create a fake JWT with wrong signature (just modify the signature part)
    const parts = jwtAccessToken.split('.');
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
