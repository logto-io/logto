/**
 * @fileoverview Baseline coverage for everything that shapes an OIDC response *around*
 * `oidc-provider`'s own route handlers: the ETag/304 and JWKS cache-control middlewares mounted
 * on the provider (`packages/core/src/oidc/init.ts`), and the compression plus security-header
 * middlewares mounted on the tenant app before it (`packages/core/src/tenants/Tenant.ts`). The
 * provider's client-based CORS check (`clientBasedCORS`) is covered here too — it only has unit
 * coverage otherwise.
 *
 * None of these live inside the provider's internal router, so a provider upgrade must leave them
 * intact. These assertions are what turn that expectation into a regression test.
 */

import { ApplicationType, SignInIdentifier } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import ky from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { logtoUrl } from '#src/constants.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

const oidcApi = ky.extend({
  prefixUrl: new URL('/oidc', logtoUrl),
  throwHttpErrors: false,
  retry: 0,
});

/** Mirrors `basicSecurityHeaderSettings` in `packages/core/src/middleware/koa-security-headers.ts`. */
const expectBasicSecurityHeaders = (headers: Headers) => {
  expect(headers.get('x-content-type-options')).toBe('nosniff');
  expect(headers.get('x-frame-options')).toBe('SAMEORIGIN');
  expect(headers.get('referrer-policy')).toBe('strict-origin-when-cross-origin');
  expect(headers.get('cross-origin-resource-policy')).toBe('same-origin');
  expect(headers.get('strict-transport-security')).toContain('max-age=');
  // `/oidc` is a mounted app, so it gets the basic settings, which disable CSP and COOP.
  expect(headers.get('content-security-policy')).toBeNull();
  expect(headers.get('cross-origin-opener-policy')).toBeNull();
};

describe('OIDC route post-processing', () => {
  const username = generateUsername();
  const password = generatePassword();

  /* eslint-disable @silverhand/fp/no-let */
  let userId: string;
  /** An opaque access token for the userinfo endpoint (issued without a resource). */
  let userinfoAccessToken: string;
  /* eslint-enable @silverhand/fp/no-let */

  /* eslint-disable @silverhand/fp/no-mutation */
  beforeAll(async () => {
    const user = await createUserByAdmin({ username, password });
    userId = user.id;
    await enableAllPasswordSignInMethods();

    const client = await initExperienceClient();
    const { verificationId } = await client.verifyPassword({
      identifier: { type: SignInIdentifier.Username, value: username },
      password,
    });
    await client.identifyUser({ verificationId });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    userinfoAccessToken = await client.getAccessToken();
  });
  /* eslint-enable @silverhand/fp/no-mutation */

  afterAll(async () => {
    await deleteUser(userId);
  });

  const getUserinfo = async (headers: Record<string, string> = {}) =>
    oidcApi.get('me', {
      /**
       * Node's `fetch` appends `Cache-Control: no-cache` to any request carrying `If-None-Match`,
       * and the `fresh` module behind `ctx.fresh` honours that by forcing a full revalidation — the
       * 304 branch would never be reached. The `no-cache` cache mode sends `Cache-Control: max-age=0`
       * instead, which is what a browser revalidation looks like.
       */
      cache: 'no-cache',
      headers: { authorization: `Bearer ${userinfoAccessToken}`, ...headers },
    });

  describe('ETag and conditional requests', () => {
    it('sets an ETag on the userinfo response', async () => {
      const response = await getUserinfo();

      expect(response.status).toBe(200);
      expect(response.headers.get('etag')).toMatch(/^(W\/)?".+"$/);
    });

    it('answers 304 with an empty body when the ETag still matches', async () => {
      const original = await getUserinfo();
      const etag = original.headers.get('etag') ?? '';
      expect(etag).not.toBe('');

      const response = await getUserinfo({ 'if-none-match': etag });

      expect(response.status).toBe(304);
      expect(await response.text()).toBe('');
    });

    it('answers 200 when the ETag no longer matches', async () => {
      const response = await getUserinfo({ 'if-none-match': '"not-the-current-etag"' });

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toHaveProperty('sub', userId);
    });
  });

  describe('JWKS cache control', () => {
    it('tells browsers to revalidate the JWKS on every use', async () => {
      const response = await oidcApi.get('jwks');

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toBe('no-cache, max-age=0, must-revalidate');
    });
  });

  describe('security headers', () => {
    it('applies them to a JSON response from the token endpoint', async () => {
      const response = await oidcApi.post('token', {
        headers: formUrlEncodedHeaders,
        body: new URLSearchParams({ grant_type: 'refresh_token' }).toString(),
      });

      expect(response.status).toBe(400);
      expect(response.headers.get('content-type')).toContain('application/json');
      expectBasicSecurityHeaders(response.headers);
    });

    it('applies them to an HTML response from the end-session endpoint', async () => {
      const response = await oidcApi.get('session/end');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      expectBasicSecurityHeaders(response.headers);
    });
  });

  describe('compression', () => {
    it('gzips a provider response when the client accepts it', async () => {
      const response = await oidcApi.get('.well-known/openid-configuration', {
        headers: { 'accept-encoding': 'gzip' },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-encoding')).toBe('gzip');
      // `fetch` transparently inflates the payload, so the body must still be readable JSON.
      await expect(response.json()).resolves.toHaveProperty('issuer');
    });

    it('leaves the response uncompressed when the client rules out every encoding', async () => {
      const response = await oidcApi.get('.well-known/openid-configuration', {
        headers: { 'accept-encoding': 'identity' },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-encoding')).toBeNull();
    });
  });

  describe('client-based CORS on the token endpoint', () => {
    const allowedOrigin = 'https://cors-allowed.example.com';
    const foreignOrigin = 'https://cors-foreign.example.com';

    // eslint-disable-next-line @silverhand/fp/no-let
    let applicationId: string;

    /* eslint-disable @silverhand/fp/no-mutation */
    beforeAll(async () => {
      const application = await createApplication('CORS test app', ApplicationType.SPA, {
        oidcClientMetadata: {
          redirectUris: [`${allowedOrigin}/callback`],
          postLogoutRedirectUris: [],
        },
      });
      applicationId = application.id;
    });
    /* eslint-enable @silverhand/fp/no-mutation */

    afterAll(async () => {
      await deleteApplication(applicationId);
    });

    /**
     * The provider resolves the client before running any grant, so the CORS decision lands before
     * the (deliberately invalid) authorization code is ever looked up.
     */
    const postToken = async (origin: string) =>
      oidcApi.post('token', {
        headers: { ...formUrlEncodedHeaders, origin },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: applicationId,
          code: 'this-code-does-not-exist',
          redirect_uri: `${allowedOrigin}/callback`,
        }).toString(),
      });

    it('allows an origin that matches one of the client redirect URIs', async () => {
      const response = await postToken(allowedOrigin);

      expect(response.headers.get('access-control-allow-origin')).toBe(allowedOrigin);
      // The request gets as far as the grant, which rejects the made-up code.
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toHaveProperty('error', 'invalid_grant');
    });

    it('rejects an origin unknown to the client and strips the CORS header', async () => {
      const response = await postToken(foreignOrigin);

      expect(response.headers.get('access-control-allow-origin')).toBeNull();
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        error: 'invalid_request',
        error_description: `origin ${foreignOrigin} not allowed for client: ${applicationId}`,
      });
    });
  });
});
