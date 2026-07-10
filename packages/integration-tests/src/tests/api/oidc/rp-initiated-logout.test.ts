import { formUrlEncodedHeaders } from '@logto/shared';
import { assert } from '@silverhand/essentials';
import ky from 'ky';

import { deleteUser } from '#src/api/index.js';
import { logtoUrl } from '#src/constants.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

const getHtmlAttribute = (element: string, attribute: string) =>
  new RegExp(`\\b${attribute}=["']([^"']*)["']`, 'i').exec(element)?.[1];

describe('RP-initiated logout pages', () => {
  const username = generateUsername();
  const password = generatePassword();
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId = '';

  beforeAll(async () => {
    const user = await createUserByAdmin({ username, password });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = user.id;
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await deleteUser(userId);
  });

  it('renders the custom confirmation and localized success pages without an ID token hint', async () => {
    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);

    const endSessionUrl = new URL('/oidc/session/end', logtoUrl);
    const confirmationResponse = await ky.get(endSessionUrl, {
      headers: {
        'accept-language': 'zh-CN',
        cookie: client.getCookieHeader(endSessionUrl.pathname),
      },
      redirect: 'manual',
    });
    const confirmationPage = await confirmationResponse.text();
    const form = /<form\b[^>]*id=["']op\.logoutform["'][^>]*>/i.exec(confirmationPage)?.[0];

    expect(confirmationResponse.status).toBe(200);
    expect(confirmationPage).toContain('<title>Sign Out</title>');
    expect(confirmationPage).toContain(
      'onload="document.getElementById(\'op.logoutForm\').submit();"'
    );
    expect(confirmationPage).toContain('name="logout"');
    assert(form, new Error('Missing logout confirmation form'));

    const action = getHtmlAttribute(form, 'action');
    const xsrfInput = /<input\b[^>]*name=["']xsrf["'][^>]*>/i.exec(confirmationPage)?.[0];
    const xsrf = xsrfInput && getHtmlAttribute(xsrfInput, 'value');
    assert(action && xsrf, new Error('Missing logout confirmation form values'));

    client.mergeRawCookies(confirmationResponse.headers.getSetCookie());
    const confirmUrl = new URL(action, logtoUrl);
    const confirmResponse = await ky.post(confirmUrl, {
      body: new URLSearchParams({ logout: 'yes', xsrf }),
      headers: {
        ...formUrlEncodedHeaders,
        cookie: client.getCookieHeader(confirmUrl.pathname),
      },
      redirect: 'manual',
      throwHttpErrors: false,
    });
    const successLocation = confirmResponse.headers.get('location');

    expect(confirmResponse.status).toBe(303);
    assert(successLocation, new Error('Missing post-logout success page location'));

    const successResponse = await ky.get(new URL(successLocation, logtoUrl), {
      headers: { 'accept-language': 'zh-CN' },
    });
    const successPage = await successResponse.text();

    expect(successResponse.status).toBe(200);
    expect(successPage).toContain('<title>Sign Out</title>');
    expect(successPage).toContain('你已经成功登出。');
  });
});
