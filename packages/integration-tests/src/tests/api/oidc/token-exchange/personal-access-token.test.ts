import { ApplicationType, GrantType, type Resource } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';

import { createPersonalAccessToken } from '#src/api/admin-user.js';
import { oidcApi } from '#src/api/api.js';
import {
  createApplication,
  deleteApplication,
  getApplicationSecrets,
} from '#src/api/application.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { generatePassword, generateUsername, getAccessTokenPayload } from '#src/utils.js';

const tokenType = 'urn:logto:token-type:personal_access_token';

describe('Token Exchange (Personal Access Token)', () => {
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
  let testToken: string;
  let authorizationHeader: string;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    const resource = await createResource(testApiResourceInfo.name, testApiResourceInfo.indicator);
    testApiResourceId = resource.id;
    const applicationName = 'test-pat-app';
    const applicationType = ApplicationType.Traditional;
    const application = await createApplication(applicationName, applicationType, {
      oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
    });
    testApplicationId = application.id;
    const secrets = await getApplicationSecrets(application.id);
    authorizationHeader = `Basic ${Buffer.from(`${application.id}:${secrets[0]?.value}`).toString(
      'base64'
    )}`;
    const { id } = await createUserByAdmin({ username, password });
    testUserId = id;
    const { value } = await createPersonalAccessToken({
      userId: testUserId,
      name: 'test-pat',
    });
    testToken = value;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    // Await deleteUser(testUserId);
    await deleteResource(testApiResourceId);
    await deleteApplication(testApplicationId);
  });

  it('should exchange an access token by a subject token', async () => {
    const body = await oidcApi
      .post('token', {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: authorizationHeader,
        },
        body: new URLSearchParams({
          grant_type: GrantType.TokenExchange,
          subject_token: testToken,
          subject_token_type: tokenType,
          scope: 'openid profile',
        }),
      })
      .json<{ access_token: string }>();

    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('token_type', 'Bearer');
    expect(body).toHaveProperty('expires_in');
    expect(body).toHaveProperty('scope', 'openid profile');

    const { access_token } = body;
    // Send to introspection endpoint
    const introspectionResponse = await oidcApi
      .post('token/introspection', {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: authorizationHeader,
        },
        body: new URLSearchParams({
          token: access_token,
          token_type_hint: 'access_token',
        }),
      })
      .json();
    expect(introspectionResponse).toHaveProperty('active', true);
    expect(introspectionResponse).toHaveProperty('sub', testUserId);

    // Should be able to get user info
    const userInfoResponse = await oidcApi
      .get('me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .json();
    expect(userInfoResponse).toHaveProperty('sub', testUserId);
  });

  it('should be able to use for multiple times', async () => {
    await oidcApi.post('token', {
      headers: {
        ...formUrlEncodedHeaders,
        Authorization: authorizationHeader,
      },
      body: new URLSearchParams({
        grant_type: GrantType.TokenExchange,
        subject_token: testToken,
        subject_token_type: tokenType,
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
          subject_token: testToken,
          subject_token_type: tokenType,
        }),
      })
    ).resolves.not.toThrow();
  });

  it('should exchange a JWT access token', async () => {
    const { access_token } = await oidcApi
      .post('token', {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: authorizationHeader,
        },
        body: new URLSearchParams({
          grant_type: GrantType.TokenExchange,
          subject_token: testToken,
          subject_token_type: tokenType,
          resource: testApiResourceInfo.indicator,
        }),
      })
      .json<{ access_token: string }>();

    const payload = getAccessTokenPayload(access_token);
    expect(payload).toHaveProperty('aud', testApiResourceInfo.indicator);
    expect(payload).toHaveProperty('scope', '');
    expect(payload).toHaveProperty('sub', testUserId);
  });

  it('should fail with invalid PAT', async () => {
    await expect(
      oidcApi.post('token', {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: authorizationHeader,
        },
        body: new URLSearchParams({
          grant_type: GrantType.TokenExchange,
          subject_token: 'invalid_pat',
          subject_token_type: tokenType,
        }),
      })
    ).rejects.toThrow();
  });

  it('should failed with expired PAT', async () => {
    const expiredToken = await createPersonalAccessToken({
      userId: testUserId,
      name: 'expired-pat',
      expiresAt: Date.now() + 100,
    });
    // Wait for the token to be expired
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    await expect(
      oidcApi.post('token', {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: authorizationHeader,
        },
        body: new URLSearchParams({
          grant_type: GrantType.TokenExchange,
          subject_token: expiredToken.value,
          subject_token_type: tokenType,
        }),
      })
    ).rejects.toThrow();
  });
});
