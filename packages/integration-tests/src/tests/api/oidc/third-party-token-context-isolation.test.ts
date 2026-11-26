import { ReservedResource, UserScope, buildOrganizationUrn } from '@logto/core-kit';
import { ApplicationType, GrantType } from '@logto/schemas';
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
  refresh_token?: string;
  scope?: string;
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
}): Promise<TokenEndpointResponse> => {
  const basicAuth = Buffer.from(`${appId}:${appSecret}`).toString('base64');

  return ky
    .post(`${defaultConfig.endpoint}/oidc/token`, {
      headers: {
        ...formUrlEncodedHeaders,
        authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams(
        removeUndefinedKeys({
          grant_type: GrantType.RefreshToken,
          refresh_token: refreshToken,
          resource,
          organization_id: organizationId,
        })
      ),
    })
    .json<TokenEndpointResponse>();
};

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
});
