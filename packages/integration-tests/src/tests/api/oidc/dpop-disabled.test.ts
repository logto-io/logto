import assert from 'node:assert';

import {
  type Application,
  ApplicationType,
  GrantType,
  demoAppApplicationId,
  type Resource,
} from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';

import { deleteUser } from '#src/api/admin-user.js';
import { oidcApi } from '#src/api/api.js';
import {
  createApplication,
  createApplicationWithSecret,
  deleteApplication,
  getApplicationSecrets,
} from '#src/api/application.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { createSubjectToken } from '#src/api/subject-token.js';
import { logtoUrl } from '#src/constants.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  generatePassword,
  generateResourceIndicator,
  generateResourceName,
  generateUsername,
  getAccessTokenPayload,
} from '#src/utils.js';

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
};

const impersonationTokenType = 'urn:logto:token-type:impersonation_token';
const tokenEndpoint = appendPath(new URL(logtoUrl), 'oidc/token').href;

/**
 * Create a DPoP proof JWT (RFC 9449) for the token endpoint that satisfies every check in
 * `oidc-provider`'s `validate_dpop.js`. DPoP is disabled, so the provider must ignore the proof;
 * if DPoP ever gets enabled unintentionally (e.g. `oidc-provider` v9 enables it by default), this
 * valid proof would bind the issued token to the key, which the assertions below catch loudly.
 */
const createDpopProof = async () => {
  const { publicKey, privateKey } = await generateKeyPair('ES256');

  return new SignJWT({ htm: 'POST', htu: tokenEndpoint, jti: crypto.randomUUID() })
    .setProtectedHeader({ alg: 'ES256', typ: 'dpop+jwt', jwk: await exportJWK(publicKey) })
    .setIssuedAt()
    .sign(privateKey);
};

/** Assert the response carries a plain Bearer token without a DPoP (`cnf.jkt`) binding. */
const expectNoDpopBinding = (response: TokenResponse) => {
  expect(response.token_type).toBe('Bearer');
  expect(getAccessTokenPayload(response.access_token)).not.toHaveProperty('cnf');
};

describe('token requests with a DPoP proof while DPoP is disabled', () => {
  const username = generateUsername();
  const password = generatePassword();

  /* eslint-disable @silverhand/fp/no-let */
  let testResource: Resource;
  let testUserId: string;
  let m2mApplication: Application;
  let exchangeApplication: Application;
  let exchangeAuthorizationHeader: string;
  /* eslint-enable @silverhand/fp/no-let */

  beforeAll(async () => {
    /* eslint-disable @silverhand/fp/no-mutation */
    await enableAllPasswordSignInMethods();

    testResource = await createResource(generateResourceName(), generateResourceIndicator());
    ({ id: testUserId } = await createUserByAdmin({ username, password }));

    m2mApplication = await createApplicationWithSecret(
      'dpop-disabled-m2m-app',
      ApplicationType.MachineToMachine
    );

    exchangeApplication = await createApplication(
      'dpop-disabled-token-exchange-app',
      ApplicationType.Traditional,
      {
        oidcClientMetadata: { redirectUris: ['http://localhost:3000'], postLogoutRedirectUris: [] },
        customClientMetadata: { allowTokenExchange: true },
      }
    );
    const secrets = await getApplicationSecrets(exchangeApplication.id);
    exchangeAuthorizationHeader = `Basic ${Buffer.from(
      `${exchangeApplication.id}:${secrets[0]!.value}`
    ).toString('base64')}`;
    /* eslint-enable @silverhand/fp/no-mutation */
  });

  afterAll(async () => {
    await Promise.all([
      deleteUser(testUserId),
      deleteResource(testResource.id),
      deleteApplication(m2mApplication.id),
      deleteApplication(exchangeApplication.id),
    ]);
  });

  it('should ignore the proof and issue an unbound token for the `client_credentials` grant', async () => {
    const response = await oidcApi
      .post('token', {
        headers: { ...formUrlEncodedHeaders, DPoP: await createDpopProof() },
        body: new URLSearchParams({
          grant_type: GrantType.ClientCredentials,
          client_id: m2mApplication.id,
          client_secret: m2mApplication.secret,
          resource: testResource.indicator,
        }),
      })
      .json<TokenResponse>();

    expectNoDpopBinding(response);
  });

  it('should ignore the proof and issue an unbound token for the `refresh_token` grant', async () => {
    const client = await initExperienceClient({
      config: { resources: [testResource.indicator] },
    });
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const refreshToken = await client.getRefreshToken();
    assert(refreshToken, new Error('No refresh token available'));

    const response = await oidcApi
      .post('token', {
        headers: { ...formUrlEncodedHeaders, DPoP: await createDpopProof() },
        body: new URLSearchParams({
          grant_type: GrantType.RefreshToken,
          client_id: demoAppApplicationId,
          refresh_token: refreshToken,
          resource: testResource.indicator,
        }),
      })
      .json<TokenResponse>();

    expectNoDpopBinding(response);
  });

  it('should ignore the proof and issue an unbound token for the token exchange grant', async () => {
    const { subjectToken } = await createSubjectToken(testUserId);

    const response = await oidcApi
      .post('token', {
        headers: {
          ...formUrlEncodedHeaders,
          Authorization: exchangeAuthorizationHeader,
          DPoP: await createDpopProof(),
        },
        body: new URLSearchParams({
          grant_type: GrantType.TokenExchange,
          subject_token: subjectToken,
          subject_token_type: impersonationTokenType,
          resource: testResource.indicator,
        }),
      })
      .json<TokenResponse>();

    expectNoDpopBinding(response);
  });
});
