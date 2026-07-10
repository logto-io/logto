import { Prompt } from '@logto/js';
import { ApplicationType, InteractionEvent, type Application } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import ky from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { discoveryUrl } from '#src/constants.js';
import { processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateTestName, generateUsername } from '#src/utils.js';

const wildcardRedirectUri = 'https://*.example.com/callback';
const matchingRedirectUri = 'https://tenant.example.com/callback';
const wildcardPostLogoutRedirectUri = 'https://*.example.com/signed-out';
const matchingPostLogoutRedirectUri = 'https://tenant.example.com/signed-out';
const nonMatchingRedirectUri = 'https://tenant.example.net/callback';
const nonMatchingPostLogoutRedirectUri = 'https://tenant.example.net/signed-out';

const expectInvalidRedirectResponse = async (
  response: Response,
  parameter: 'redirect_uri' | 'post_logout_redirect_uri'
) => {
  expect(response.status).toBe(400);
  await expect(response.text()).resolves.toContain(parameter);
};

const getHtmlAttribute = (element: string, attribute: string) =>
  new RegExp(`\\b${attribute}=(['"])(.*?)\\1`, 'i').exec(element)?.[2];

const getLogoutConfirmation = (html: string) => {
  const form = /<form\b[^>]*>/i.exec(html)?.[0];
  assert(form, new Error('Missing logout confirmation form'));
  const action = getHtmlAttribute(form, 'action');
  assert(action, new Error('Missing logout confirmation form action'));

  const xsrfInput = [...html.matchAll(/<input\b[^>]*>/gi)].find(
    ([input]) => getHtmlAttribute(input, 'name') === 'xsrf'
  )?.[0];
  assert(xsrfInput, new Error('Missing logout confirmation XSRF input'));
  const xsrf = getHtmlAttribute(xsrfInput, 'value');
  assert(xsrf, new Error('Missing logout confirmation XSRF value'));

  return { action, xsrf };
};

describe('wildcard redirect URI round trip', () => {
  const username = generateUsername();
  const password = generatePassword();
  // eslint-disable-next-line @silverhand/fp/no-let
  let application: Application;
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId = '';
  // eslint-disable-next-line @silverhand/fp/no-let
  let endSessionEndpoint = '';

  beforeAll(async () => {
    const [createdApplication, user, discovery] = await Promise.all([
      createApplication(generateTestName(), ApplicationType.SPA, {
        oidcClientMetadata: {
          redirectUris: [wildcardRedirectUri],
          postLogoutRedirectUris: [wildcardPostLogoutRedirectUri],
        },
      }),
      createUserByAdmin({ username, password }),
      ky.get(discoveryUrl).json<{ end_session_endpoint: string }>(),
      enableAllPasswordSignInMethods(),
    ]);

    // eslint-disable-next-line @silverhand/fp/no-mutation
    application = createdApplication;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = user.id;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    endSessionEndpoint = discovery.end_session_endpoint;
  });

  afterAll(async () => {
    await Promise.all([deleteApplication(application.id), deleteUser(userId)]);
  });

  it('completes sign-in and post-logout redirects for matching subdomains', async () => {
    const client = new ExperienceClient({
      appId: application.id,
      prompt: Prompt.Login,
      scopes: [],
    });

    await client.initSession(matchingRedirectUri);
    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();

    await expect(processSession(client, redirectTo)).resolves.toBe(userId);

    const logoutUrl = new URL(
      `${endSessionEndpoint}?${new URLSearchParams({
        client_id: application.id,
        post_logout_redirect_uri: matchingPostLogoutRedirectUri,
      }).toString()}`
    );

    const logoutResponse = await ky.get(logoutUrl, {
      headers: { cookie: client.getCookieHeader(logoutUrl.pathname) },
      redirect: 'manual',
      throwHttpErrors: false,
    });
    expect(logoutResponse.status).toBe(200);
    client.mergeRawCookies(logoutResponse.headers.getSetCookie());

    const { action, xsrf } = getLogoutConfirmation(await logoutResponse.text());
    const confirmationUrl = new URL(action, endSessionEndpoint);
    const confirmationResponse = await ky.post(confirmationUrl, {
      headers: { cookie: client.getCookieHeader(confirmationUrl.pathname) },
      body: new URLSearchParams({ xsrf, logout: 'yes' }),
      redirect: 'manual',
      throwHttpErrors: false,
    });

    expect(confirmationResponse.status).toBe(303);
    expect(confirmationResponse.headers.get('location')).toBe(matchingPostLogoutRedirectUri);
  });

  it('rejects non-matching hosts for sign-in and post-logout redirects', async () => {
    const client = new ExperienceClient({
      appId: application.id,
      prompt: Prompt.Login,
      scopes: [],
    });

    const authorizationResponse = await client.startAuthorization(nonMatchingRedirectUri);
    await expectInvalidRedirectResponse(authorizationResponse, 'redirect_uri');

    const logoutResponse = await ky.get(endSessionEndpoint, {
      searchParams: {
        client_id: application.id,
        post_logout_redirect_uri: nonMatchingPostLogoutRedirectUri,
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });
    await expectInvalidRedirectResponse(logoutResponse, 'post_logout_redirect_uri');
  });
});
