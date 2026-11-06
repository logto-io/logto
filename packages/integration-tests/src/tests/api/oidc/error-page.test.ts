import { ApplicationType } from '@logto/schemas';

import { oidcApi } from '#src/api/api.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { devFeatureDisabledTest, devFeatureTest, generateTestName } from '#src/utils.js';

const requestApi = oidcApi.extend({
  redirect: 'manual',
  throwHttpErrors: false,
});

const browserAccept =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';
/** The default of `HttpURLConnection` on older JDKs, which prefers HTML over JSON. */
const javaDefaultAccept = 'text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2';
const unregisteredUri = 'https://example.com/unregistered';

const expectErrorPage = async (response: Response, detail: string) => {
  expect(response.status).toBe(400);
  expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');

  const page = await response.text();

  expect(page).toContain('<!DOCTYPE html>');
  expect(page).toContain(detail);

  return page;
};

const expectJsonError = async (response: Response): Promise<unknown> => {
  expect(response.status).toBe(400);
  expect(response.headers.get('content-type')).toContain('application/json');

  return response.json();
};

describe('OIDC error page', () => {
  // eslint-disable-next-line @silverhand/fp/no-let -- assigned in beforeAll
  let applicationId = '';

  const requestWithUnregisteredRedirectUri = async (
    headers: Record<string, string>,
    extraParameters?: Record<string, string>
  ) =>
    requestApi.get('auth', {
      headers,
      searchParams: {
        client_id: applicationId,
        redirect_uri: unregisteredUri,
        response_type: 'code',
        scope: 'openid',
        ...extraParameters,
      },
    });

  beforeAll(async () => {
    const application = await createApplication(generateTestName(), ApplicationType.SPA, {
      oidcClientMetadata: {
        redirectUris: ['https://example.com/callback'],
        postLogoutRedirectUris: [],
      },
    });
    // eslint-disable-next-line @silverhand/fp/no-mutation -- assigned once the app exists
    applicationId = application.id;
  });

  afterAll(async () => {
    await deleteApplication(applicationId);
  });

  devFeatureTest.it('shows a browser the page for an unregistered redirect URI', async () => {
    const response = await requestWithUnregisteredRedirectUri(
      { accept: browserAccept, 'accept-language': 'en' },
      { state: '<script>alert(1)</script>' }
    );
    const page = await expectErrorPage(response, 'oidc.invalid_redirect_uri');

    expect(page).toContain('<title>Something went wrong</title>');
    expect(page).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(page).not.toContain('<script');
    expect(response.headers.get('content-security-policy')).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
    );
    expect(response.headers.get('x-frame-options')).toBe('SAMEORIGIN');
  });

  devFeatureTest.it('shows the page for an unknown interaction', async () => {
    const response = await requestApi.get('auth/unknown-uid', {
      headers: { accept: browserAccept },
    });

    await expectErrorPage(response, 'session.not_found');
  });

  devFeatureTest.it('shows the page for an unregistered post-logout redirect URI', async () => {
    const response = await requestApi.get('session/end', {
      headers: { accept: browserAccept },
      searchParams: { client_id: applicationId, post_logout_redirect_uri: unregisteredUri },
    });

    await expectErrorPage(response, 'post_logout_redirect_uri');
  });

  devFeatureTest.it.each([
    ['de', 'ltr', 'Etwas ist schiefgelaufen'],
    ['ar', 'rtl', 'حدث خطأ ما'],
  ])('shows the page in %s', async (language, direction, title) => {
    const response = await requestWithUnregisteredRedirectUri({
      accept: browserAccept,
      'accept-language': language,
    });
    const page = await expectErrorPage(response, 'oidc.invalid_redirect_uri');

    expect(page).toContain(`<html lang="${language}" dir="${direction}">`);
    expect(page).toContain(`<title>${title}</title>`);
  });

  it.each(['application/json', '*/*'])('keeps the JSON body for Accept: %s', async (accept) => {
    const body = await expectJsonError(await requestWithUnregisteredRedirectUri({ accept }));

    expect(body).toMatchObject({
      code: 'oidc.invalid_redirect_uri',
      error: 'invalid_redirect_uri',
    });
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('error_description');
  });

  it('keeps the raw error body when parse_error is false', async () => {
    const body = await expectJsonError(
      await requestWithUnregisteredRedirectUri({ accept: browserAccept }, { parse_error: 'false' })
    );

    expect(body).toMatchObject({ error: 'invalid_redirect_uri' });
    expect(body).not.toHaveProperty('code');
  });

  it('keeps the JSON body on the token endpoint for a client preferring HTML', async () => {
    const response = await requestApi.post('token', {
      headers: { accept: javaDefaultAccept },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: 'unknown-client',
        client_secret: 'unknown-secret',
      }),
    });

    await expect(expectJsonError(response)).resolves.toMatchObject({ error: 'invalid_client' });
  });

  devFeatureDisabledTest.it('keeps the JSON body for a browser', async () => {
    const response = await requestWithUnregisteredRedirectUri({ accept: browserAccept });

    await expect(expectJsonError(response)).resolves.toMatchObject({
      code: 'oidc.invalid_redirect_uri',
    });
  });
});
