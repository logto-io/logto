import { demoAppApplicationId } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { oidcApi } from '#src/api/api.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';

const requestApi = oidcApi.extend({
  redirect: 'manual',
  throwHttpErrors: false,
});

const authorizationParameters = new URLSearchParams({
  client_id: demoAppApplicationId,
  code_challenge: 'a'.repeat(43),
  code_challenge_method: 'S256',
  redirect_uri: demoAppRedirectUri,
  response_type: 'code',
  scope: 'openid',
  state: 'state',
});

const getRedirectPath = (response: Response) => {
  const location = response.headers.get('location');
  assert(location, new Error('Redirect location is missing'));

  return new URL(location, demoAppRedirectUri).pathname;
};

const normalizeLogoutPage = (body: string) =>
  body.replace(/name="xsrf" value="[^"]+"/, 'name="xsrf" value="xsrf"');

describe('POST authorization and logout endpoints', () => {
  const userApi = new UserApiTest();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('should start the same authorization interaction with GET and form POST', async () => {
    const [getResponse, postResponse] = await Promise.all([
      requestApi.get('auth', { searchParams: authorizationParameters }),
      requestApi.post('auth', { body: authorizationParameters }),
    ]);

    expect(getResponse.status).toBe(303);
    expect(postResponse.status).toBe(303);
    expect(getRedirectPath(postResponse)).toBe(getRedirectPath(getResponse));
  });

  it('should preserve repeated parameters for duplicate rejection', async () => {
    const repeatedParameters = new URLSearchParams(authorizationParameters);
    repeatedParameters.append('client_id', demoAppApplicationId);

    const response = await requestApi.post('auth', { body: repeatedParameters });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: 'invalid_request',
    });
  });

  it('should forward a JSON POST with scalar values like the equivalent GET request', async () => {
    const searchParams = new URLSearchParams(authorizationParameters);
    searchParams.set('max_age', '300');

    const [getResponse, jsonResponse] = await Promise.all([
      requestApi.get('auth', { searchParams }),
      requestApi.post('auth', {
        /** Override the form content type inherited from `oidcApi` so the body is sent as JSON. */
        headers: { 'content-type': 'application/json' },
        json: { ...Object.fromEntries(authorizationParameters), max_age: 300 },
      }),
    ]);

    expect(getResponse.status).toBe(303);
    expect(jsonResponse.status).toBe(303);
    expect(getRedirectPath(jsonResponse)).toBe(getRedirectPath(getResponse));
  });

  it('should render the same logout confirmation for GET and form POST and keep confirm POST working', async () => {
    const profile = generateNewUserProfile({ username: true, password: true });
    await userApi.create(profile);

    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, profile.username, profile.password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);

    const idToken = await client.getIdToken();
    assert(idToken, new Error('ID token is missing'));

    const logoutParameters = new URLSearchParams({ id_token_hint: idToken });
    const headers = { cookie: client.getCookieHeader('/oidc/session/end') };
    const getResponse = await requestApi.get('session/end', {
      headers,
      searchParams: logoutParameters,
    });
    const postResponse = await requestApi.post('session/end', {
      headers,
      body: logoutParameters,
    });
    const [getBody, postBody] = await Promise.all([getResponse.text(), postResponse.text()]);

    expect(getResponse.status).toBe(200);
    expect(postResponse.status).toBe(200);
    expect(normalizeLogoutPage(postBody)).toBe(normalizeLogoutPage(getBody));
    /** ETag semantics apply to real GET requests only, not to forwarded POST requests. */
    expect(getResponse.headers.get('etag')).not.toBeNull();
    expect(postResponse.headers.get('etag')).toBeNull();

    const xsrf = /name="xsrf" value="([^"]+)"/.exec(postBody)?.[1];
    assert(xsrf, new Error('Logout XSRF token is missing'));
    client.mergeRawCookies(postResponse.headers.getSetCookie());

    const confirmResponse = await requestApi.post('session/end/confirm', {
      headers: { cookie: client.getCookieHeader('/oidc/session/end/confirm') },
      body: new URLSearchParams({ logout: 'yes', xsrf }),
    });

    expect(confirmResponse.status).toBe(303);
  });
});
