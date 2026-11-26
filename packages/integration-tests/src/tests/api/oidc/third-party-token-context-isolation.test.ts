import assert from 'node:assert';
import { createHash, randomBytes } from 'node:crypto';

import { ReservedResource, UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { ApplicationType, GrantType, InteractionEvent } from '@logto/schemas';
import { formUrlEncodedHeaders } from '@logto/shared';
import { removeUndefinedKeys } from '@silverhand/essentials';
import ky from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplicationWithSecret, deleteApplication } from '#src/api/application.js';
import { consent } from '#src/api/interaction.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { defaultConfig } from '#src/client/index.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  generatePassword,
  generateResourceIndicator,
  generateResourceName,
  generateRoleName,
  generateUsername,
  getAccessTokenPayload,
  randomString,
} from '#src/utils.js';

type TokenEndpointResponse = {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
};

const postTokenEndpoint = async ({
  appId,
  appSecret,
  body,
}: {
  appId: string;
  appSecret: string;
  body: Record<string, string | undefined>;
}): Promise<TokenEndpointResponse> => {
  const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString('base64');

  return ky
    .post(`${defaultConfig.endpoint}/oidc/token`, {
      headers: {
        ...formUrlEncodedHeaders,
        authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams(removeUndefinedKeys(body)),
    })
    .json<TokenEndpointResponse>();
};

const exchangeRefreshToken = async ({
  appId,
  appSecret,
  refreshToken,
  resource,
  organizationId,
}: {
  appId: string;
  appSecret: string;
  refreshToken: string;
  resource?: string;
  organizationId?: string;
}): Promise<TokenEndpointResponse> =>
  postTokenEndpoint({
    appId,
    appSecret,
    body: {
      grant_type: GrantType.RefreshToken,
      refresh_token: refreshToken,
      resource,
      organization_id: organizationId,
    },
  });

describe('third-party application token context isolation (Cases 1, 2 & 4)', () => {
  const redirectUri = 'http://example.com';

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('isolates personal API (Case 1), org API (Case 2), and reserved org resource (Case 4) tokens', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const personalScopeName = `global:billing:${randomString()}`;
    const orgApiScopeName = `org:doc:${randomString()}`;
    const personalOnlyScopeName = `global:only:${randomString()}`;
    const orgScopeName = `invite:member:${randomString()}`;

    const organizationApi = new OrganizationApiTest();
    const user = await createUserByAdmin({ username, password });
    const sharedResource = await createResource(
      generateResourceName(),
      generateResourceIndicator()
    );
    const personalOnlyResource = await createResource(
      generateResourceName(),
      generateResourceIndicator()
    );
    const personalScope = await createScope(sharedResource.id, personalScopeName);
    const orgApiScope = await createScope(sharedResource.id, orgApiScopeName);
    const personalOnlyScope = await createScope(personalOnlyResource.id, personalOnlyScopeName);

    const personalRole = await createRole({
      name: generateRoleName(),
      scopeIds: [personalScope.id, personalOnlyScope.id],
    });

    const app = await createApplicationWithSecret(
      `third-party-token-isolation-${randomString()}`,
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
        customClientMetadata: {
          alwaysIssueRefreshToken: true,
        },
      }
    );

    try {
      await assignUsersToRole([user.id], personalRole.id);

      const organization = await organizationApi.create({ name: `org:${randomString()}` });
      await organizationApi.addUsers(organization.id, [user.id]);

      const orgScope = await organizationApi.scopeApi.create({ name: orgScopeName });
      const orgRole = await organizationApi.roleApi.create({
        name: `org-role:${randomString()}`,
        organizationScopeIds: [orgScope.id],
        resourceScopeIds: [orgApiScope.id],
      });
      await organizationApi.addUserRoles(organization.id, user.id, [orgRole.id]);

      await assignUserConsentScopes(app.id, {
        userScopes: [UserScope.Profile, UserScope.Organizations],
        resourceScopes: [personalScope.id, personalOnlyScope.id],
        organizationResourceScopes: [orgApiScope.id],
        organizationScopes: [orgScope.id],
      });

      const client = await initExperienceClient({
        config: {
          appId: app.id,
          appSecret: app.secret,
          resources: [sharedResource.indicator, personalOnlyResource.indicator],
          scopes: [
            UserScope.Organizations,
            personalScope.name,
            orgApiScope.name,
            personalOnlyScope.name,
            orgScope.name,
          ],
        },
        redirectUri,
      });

      await identifyUserWithUsernamePassword(client, username, password);
      const { redirectTo } = await client.submitInteraction();
      await client.processSession(redirectTo, false);
      const { redirectTo: consentRedirectTo } = await client.send(consent, {
        organizationIds: [organization.id],
      });
      await client.manualConsent(consentRedirectTo);

      // Sanity check (Case 3): Grant[urn:logto:resource:organizations] carries `orgScopeName`.
      await expect(client.getOrganizationTokenClaims(organization.id)).resolves.toMatchObject({
        aud: buildOrganizationUrn(organization.id),
        scope: orgScopeName,
      });

      // Case 1: Personal API token (no `organization_id`) carries personal global-role scopes only
      // and omits org-role API scopes even though the user belongs to a consented organization.
      const personalApiToken = await client.getAccessToken(sharedResource.indicator);
      const personalPayload = getAccessTokenPayload(personalApiToken);
      expect(personalPayload).toMatchObject({
        aud: sharedResource.indicator,
        scope: personalScopeName,
      });
      expect(personalPayload).not.toHaveProperty('organization_id');

      // Case 2a: Org API token (`resource` + `organization_id`) carries target org-role scopes only
      // and omits global-role scopes even when configured on the same API resource.
      const orgApiToken = await client.getAccessToken(sharedResource.indicator, organization.id);
      expect(getAccessTokenPayload(orgApiToken)).toMatchObject({
        aud: sharedResource.indicator,
        organization_id: organization.id,
        scope: orgApiScopeName,
      });

      // Case 2b: Org API token for a resource with only personal `resourceScopes` (no
      // `organizationResourceScopes` configured) must not inherit global-role scopes.
      const orgPersonalOnlyToken = await client.getAccessToken(
        personalOnlyResource.indicator,
        organization.id
      );
      const orgPersonalOnlyPayload = getAccessTokenPayload(orgPersonalOnlyToken);
      expect(orgPersonalOnlyPayload).toMatchObject({
        aud: personalOnlyResource.indicator,
        organization_id: organization.id,
      });
      expect(orgPersonalOnlyPayload.scope ?? '').toBe('');

      // Case 4a: `POST /oidc/token` with `resource=urn:logto:resource:organizations` (without
      // `organization_id`) returns empty scope and no `organization_id` claim.
      const initialRefreshToken = await client.getRefreshToken();
      expect(initialRefreshToken).toBeTruthy();

      const case4WithoutOrg = await exchangeRefreshToken({
        appId: app.id,
        appSecret: app.secret,
        refreshToken: String(initialRefreshToken),
        resource: ReservedResource.Organization,
      });
      const case4WithoutOrgPayload = getAccessTokenPayload(case4WithoutOrg.access_token);
      expect(case4WithoutOrgPayload.aud).toBe(ReservedResource.Organization);
      expect(case4WithoutOrgPayload.scope ?? '').toBe('');
      expect(case4WithoutOrgPayload).not.toHaveProperty('organization_id');

      // Case 4b: `POST /oidc/token` with `resource=urn:logto:resource:organizations` AND
      // `organization_id` also returns empty scope and skips the `organization_id` claim.
      const nextRefreshToken = case4WithoutOrg.refresh_token ?? String(initialRefreshToken);
      const case4WithOrg = await exchangeRefreshToken({
        appId: app.id,
        appSecret: app.secret,
        refreshToken: nextRefreshToken,
        resource: ReservedResource.Organization,
        organizationId: organization.id,
      });
      const case4WithOrgPayload = getAccessTokenPayload(case4WithOrg.access_token);
      expect(case4WithOrgPayload.aud).toBe(ReservedResource.Organization);
      expect(case4WithOrgPayload.scope ?? '').toBe('');
      expect(case4WithOrgPayload).not.toHaveProperty('organization_id');
    } finally {
      await Promise.all([
        deleteApplication(app.id),
        deleteResource(sharedResource.id),
        deleteResource(personalOnlyResource.id),
        deleteRole(personalRole.id),
        organizationApi.cleanUp(),
        deleteUser(user.id),
      ]);
    }
  });

  it('Case 4 implicit fallback: handles OAuth-only authorization without openid and sole ReservedResource.Organization', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const orgScopeName = `invite:member:${randomString()}`;
    const codeVerifier = randomBytes(32).toString('base64url');
    const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

    const organizationApi = new OrganizationApiTest();
    const user = await createUserByAdmin({ username, password });
    const app = await createApplicationWithSecret(
      `third-party-oauth-only-fallback-${randomString()}`,
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
        customClientMetadata: {
          alwaysIssueRefreshToken: true,
        },
      }
    );

    try {
      const organization = await organizationApi.create({ name: `org:${randomString()}` });
      await organizationApi.addUsers(organization.id, [user.id]);

      const orgScope = await organizationApi.scopeApi.create({ name: orgScopeName });
      const orgRole = await organizationApi.roleApi.create({
        name: `org-role:${randomString()}`,
        organizationScopeIds: [orgScope.id],
      });
      await organizationApi.addUserRoles(organization.id, user.id, [orgRole.id]);

      await assignUserConsentScopes(app.id, {
        userScopes: [UserScope.Organizations],
        organizationScopes: [orgScope.id],
      });

      // Start an OAuth-only authorization request without `openid` and with
      // `urn:logto:resource:organizations` as its sole resource indicator.
      const authUrl = new URL('/oidc/auth', defaultConfig.endpoint);
      authUrl.searchParams.set('client_id', app.id);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', [UserScope.Organizations, orgScope.name].join(' '));
      authUrl.searchParams.set('resource', ReservedResource.Organization);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      const authResponse = await ky.get(authUrl, { redirect: 'manual', throwHttpErrors: false });
      expect(authResponse.status).toBe(303);
      expect(authResponse.headers.get('location')).toMatch(/^\/sign-in/);

      const client = new ExperienceClient({ appId: app.id, appSecret: app.secret });
      client.assignRawCookies(authResponse.headers.getSetCookie());
      await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
      await identifyUserWithUsernamePassword(client, username, password);
      const { redirectTo } = await client.submitInteraction();
      await client.processSession(redirectTo, false);

      const { redirectTo: consentRedirectTo } = await client.send(consent, {
        organizationIds: [organization.id],
      });
      const callbackResponse = await ky.get(consentRedirectTo, {
        headers: { cookie: client.getCookieHeader(new URL(consentRedirectTo).pathname) },
        redirect: 'manual',
        throwHttpErrors: false,
      });
      expect(callbackResponse.status).toBe(303);
      const callbackLocation = callbackResponse.headers.get('location');
      assert(callbackLocation, 'Expected authorization callback redirect location');
      const code = new URL(callbackLocation).searchParams.get('code');
      assert(code, 'Expected authorization code in callback URL');

      // 1. Code exchange omits `resource`: oidc-provider's `resolve_resource.js` falls back to
      // `ReservedResource.Organization` because `openid` was omitted. Must succeed with empty
      // scope and no `organization_id` claim instead of failing with `invalid_target`.
      const codeExchangeResponse = await postTokenEndpoint({
        appId: app.id,
        appSecret: app.secret,
        body: {
          grant_type: GrantType.AuthorizationCode,
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        },
      });
      expect(codeExchangeResponse.id_token).toBeUndefined();
      assert(codeExchangeResponse.refresh_token, 'Expected refresh_token from code exchange');
      const codeAccessTokenPayload = getAccessTokenPayload(codeExchangeResponse.access_token);
      expect(codeAccessTokenPayload.aud).toBe(ReservedResource.Organization);
      expect(codeAccessTokenPayload.scope ?? '').toBe('');
      expect(codeAccessTokenPayload).not.toHaveProperty('organization_id');

      // 2. Refresh without `resource` or `organization_id` also triggers the implicit fallback
      // and returns an empty scope with no `organization_id` claim.
      const fallbackRefreshResponse = await exchangeRefreshToken({
        appId: app.id,
        appSecret: app.secret,
        refreshToken: codeExchangeResponse.refresh_token,
      });
      const fallbackRefreshPayload = getAccessTokenPayload(fallbackRefreshResponse.access_token);
      expect(fallbackRefreshPayload.aud).toBe(ReservedResource.Organization);
      expect(fallbackRefreshPayload.scope ?? '').toBe('');
      expect(fallbackRefreshPayload).not.toHaveProperty('organization_id');

      // 3. The same refresh token still exchanges for a consented organization token (Case 3)
      // when `organization_id` is explicitly requested.
      const orgTokenResponse = await exchangeRefreshToken({
        appId: app.id,
        appSecret: app.secret,
        refreshToken: fallbackRefreshResponse.refresh_token ?? codeExchangeResponse.refresh_token,
        organizationId: organization.id,
      });
      const orgTokenPayload = getAccessTokenPayload(orgTokenResponse.access_token);
      expect(orgTokenPayload).toMatchObject({
        aud: buildOrganizationUrn(organization.id),
        scope: orgScopeName,
      });
    } finally {
      await Promise.all([
        deleteApplication(app.id),
        organizationApi.cleanUp(),
        deleteUser(user.id),
      ]);
    }
  });
});
