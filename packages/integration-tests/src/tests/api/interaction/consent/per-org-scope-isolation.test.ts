import { UserScope } from '@logto/core-kit';
import { Prompt } from '@logto/node';
import { ApplicationType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteUser, getUserApplicationGrants } from '#src/api/admin-user.js';
import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplicationWithSecret, deleteApplication } from '#src/api/application.js';
import { consent, getConsentInfo } from '#src/api/interaction.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { assignUsersToRole, createRole, deleteRole } from '#src/api/role.js';
import { createScope } from '#src/api/scope.js';
import { ExperienceClient } from '#src/client/experience/index.js';
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

const redirectUri = 'http://example.com';

const getResourceScopeField = (container: unknown, indicator: string): string | undefined => {
  if (typeof container !== 'object' || container === null) {
    return;
  }

  const value: unknown = Reflect.get(container, indicator);
  return typeof value === 'string' ? value : undefined;
};

const getGrantScopes = (payload: Record<string, unknown>, indicator: string) => ({
  granted: getResourceScopeField(payload.resources, indicator),
  rejected: getResourceScopeField(
    typeof payload.rejected === 'object' && payload.rejected !== null
      ? Reflect.get(payload.rejected, 'resources')
      : undefined,
    indicator
  ),
});

type OrgFixtureSpec = { name: string; scopeKeys: string[] };

const setupConsentScenario = async ({
  scopeKeys,
  globalScopeKeys,
  orgSpecs,
}: {
  scopeKeys: string[];
  globalScopeKeys: string[];
  orgSpecs: OrgFixtureSpec[];
}) => {
  const username = generateUsername();
  const password = generatePassword();
  const organizationApi = new OrganizationApiTest();
  const user = await createUserByAdmin({ username, password });
  const resource = await createResource(generateResourceName(), generateResourceIndicator());
  const scopes = new Map(
    await Promise.all(
      scopeKeys.map(
        async (key) => [key, await createScope(resource.id, `${key}:${randomString()}`)] as const
      )
    )
  );
  const scopeId = (key: string) => {
    const scope = scopes.get(key);
    assert(scope, new Error(`Missing scope ${key}`));
    return scope.id;
  };
  const globalRole = await createRole({
    name: generateRoleName(),
    scopeIds: globalScopeKeys.map((key) => scopeId(key)),
  });
  const app = await createApplicationWithSecret(
    `third-party-per-org-consent-${randomString()}`,
    ApplicationType.Traditional,
    {
      isThirdParty: true,
      oidcClientMetadata: { redirectUris: [redirectUri], postLogoutRedirectUris: [] },
      customClientMetadata: { alwaysIssueRefreshToken: true },
    }
  );

  const cleanup = async () =>
    Promise.all([
      deleteApplication(app.id),
      deleteResource(resource.id),
      deleteRole(globalRole.id),
      organizationApi.cleanUp(),
      deleteUser(user.id),
    ]);

  try {
    await assignUsersToRole([user.id], globalRole.id);

    const orgs = await Promise.all(
      orgSpecs.map(async ({ name, scopeKeys: orgScopeKeys }) => {
        const org = await organizationApi.create({ name: `${name}:${randomString()}` });
        await organizationApi.addUsers(org.id, [user.id]);

        if (orgScopeKeys.length > 0) {
          const role = await organizationApi.roleApi.create({
            name: `${name}-role:${randomString()}`,
            resourceScopeIds: orgScopeKeys.map((key) => scopeId(key)),
          });
          await organizationApi.addUserRoles(org.id, user.id, [role.id]);
        }

        return org;
      })
    );

    // Configure all API scopes ONLY in `organizationResourceScopes` (not personal `resourceScopes`).
    await assignUserConsentScopes(app.id, {
      userScopes: [UserScope.Profile, UserScope.Organizations],
      organizationResourceScopes: [...scopes.values()].map(({ id }) => id),
    });

    const signInToConsent = async (authOrganizationId?: string) => {
      const client = await initExperienceClient({
        config: {
          appId: app.id,
          appSecret: app.secret,
          resources: [resource.indicator],
          scopes: [
            UserScope.Profile,
            UserScope.Organizations,
            ...[...scopes.values()].map(({ name }) => name),
          ],
        },
        redirectUri,
        options: authOrganizationId
          ? { extraParams: { organization_id: authOrganizationId } }
          : undefined,
      });

      await identifyUserWithUsernamePassword(client, username, password);
      const { redirectTo } = await client.submitInteraction();
      await client.processSession(redirectTo, false);
      return client;
    };

    return { user, resource, scopes, app, orgs, signInToConsent, cleanup };
  } catch (error: unknown) {
    await cleanup();
    throw error;
  }
};

describe('third-party per-org consent scope isolation', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it.each([false, true])(
    'completes consent without looping and keeps global-only scopes out of Grant (withOrganizationId=%s)',
    async (withOrganizationId) => {
      const fixture = await setupConsentScenario({
        scopeKeys: ['global:only'],
        globalScopeKeys: ['global:only'],
        orgSpecs: [{ name: 'org', scopeKeys: [] }],
      });

      try {
        const [organization] = fixture.orgs;
        assert(organization, new Error('Expected organization'));
        const client = await fixture.signInToConsent(
          withOrganizationId ? organization.id : undefined
        );

        const consentInfo = await client.send(getConsentInfo);
        expect(consentInfo.missingResourceScopes).toEqual([]);
        expect(
          consentInfo.organizations?.find(({ id }) => id === organization.id)?.missingResourceScopes
        ).toEqual([]);

        const { redirectTo } = await client.send(consent, { organizationIds: [organization.id] });
        await client.resumeAuthorization(redirectTo);
        await expect(client.isAuthenticated()).resolves.toBe(true);

        const { grants } = await getUserApplicationGrants(fixture.user.id, 'thirdParty');
        const grant = grants.find((item) => item.payload.clientId === fixture.app.id);
        assert(grant, new Error('Expected persisted third-party Grant'));
        expect(getGrantScopes(grant.payload, fixture.resource.indicator).granted).toBeUndefined();

        const token = await client.getAccessToken(fixture.resource.indicator, organization.id);
        expect(getAccessTokenPayload(token).scope ?? '').toBe('');
      } finally {
        await fixture.cleanup();
      }
    }
  );

  it('omits global-only scopes from per-org consent list and Grant when another org holds the scope', async () => {
    const fixture = await setupConsentScenario({
      scopeKeys: ['shared', 'org-a'],
      globalScopeKeys: ['shared'],
      orgSpecs: [
        { name: 'org-a', scopeKeys: ['org-a'] },
        { name: 'org-b', scopeKeys: ['shared'] },
      ],
    });

    try {
      const [orgA, orgB] = fixture.orgs;
      assert(orgA && orgB, new Error('Expected two organizations'));
      const sharedScope = fixture.scopes.get('shared');
      const orgAScope = fixture.scopes.get('org-a');
      assert(sharedScope && orgAScope, new Error('Expected scopes'));

      const client = await fixture.signInToConsent();
      const consentInfo = await client.send(getConsentInfo);
      expect(consentInfo.missingResourceScopes).toEqual([]);

      const orgScopes = (orgId: string) =>
        consentInfo.organizations
          ?.find(({ id }) => id === orgId)
          ?.missingResourceScopes?.find(
            ({ resource: item }) => item.indicator === fixture.resource.indicator
          )
          ?.scopes.map(({ name }) => name);
      expect(orgScopes(orgA.id)).toEqual([orgAScope.name]);
      expect(orgScopes(orgB.id)).toEqual([sharedScope.name]);

      const { redirectTo } = await client.send(consent, { organizationIds: [orgA.id] });
      await client.resumeAuthorization(redirectTo);

      const { grants } = await getUserApplicationGrants(fixture.user.id, 'thirdParty');
      const grant = grants.find((item) => item.payload.clientId === fixture.app.id);
      assert(grant, new Error('Expected persisted third-party Grant'));
      expect(getGrantScopes(grant.payload, fixture.resource.indicator).granted).toBe(
        orgAScope.name
      );

      const token = await client.getAccessToken(fixture.resource.indicator, orgA.id);
      expect(getAccessTokenPayload(token)).toMatchObject({
        aud: fixture.resource.indicator,
        organization_id: orgA.id,
        scope: orgAScope.name,
      });
    } finally {
      await fixture.cleanup();
    }
  });

  it('completes consent and subsequent prompt=none auth cleanly when selected org has zero scopes on the API', async () => {
    const fixture = await setupConsentScenario({
      scopeKeys: ['shared'],
      globalScopeKeys: ['shared'],
      orgSpecs: [
        { name: 'org-a-empty', scopeKeys: [] },
        { name: 'org-b-holder', scopeKeys: ['shared'] },
      ],
    });

    try {
      const [orgA, orgB] = fixture.orgs;
      assert(orgA && orgB, new Error('Expected two organizations'));
      const sharedScope = fixture.scopes.get('shared');
      assert(sharedScope, new Error('Expected shared scope'));

      const client = await fixture.signInToConsent();
      const consentInfo = await client.send(getConsentInfo);
      expect(consentInfo.missingResourceScopes).toEqual([]);
      expect(
        consentInfo.organizations?.find(({ id }) => id === orgA.id)?.missingResourceScopes
      ).toEqual([]);
      expect(
        consentInfo.organizations
          ?.find(({ id }) => id === orgB.id)
          ?.missingResourceScopes?.find(
            ({ resource: item }) => item.indicator === fixture.resource.indicator
          )
          ?.scopes.map(({ name }) => name)
      ).toEqual([sharedScope.name]);

      const { redirectTo } = await client.send(consent, { organizationIds: [orgA.id] });
      await client.resumeAuthorization(redirectTo);
      await expect(client.isAuthenticated()).resolves.toBe(true);

      const { grants } = await getUserApplicationGrants(fixture.user.id, 'thirdParty');
      const grant = grants.find((item) => item.payload.clientId === fixture.app.id);
      assert(grant, new Error('Expected persisted third-party Grant'));
      expect(getGrantScopes(grant.payload, fixture.resource.indicator)).toEqual({
        granted: undefined,
        rejected: undefined,
      });

      const token = await client.getAccessToken(fixture.resource.indicator, orgA.id);
      expect(getAccessTokenPayload(token).scope ?? '').toBe('');

      // Repeat `/oidc/auth` on the same session with `prompt=none` must succeed silently instead
      // of returning `consent_required` or reopening an empty consent page without an org picker.
      const silentClient = new ExperienceClient({
        appId: fixture.app.id,
        appSecret: fixture.app.secret,
        resources: [fixture.resource.indicator],
        scopes: [UserScope.Profile, UserScope.Organizations, sharedScope.name],
        prompt: Prompt.None,
      });
      const silentAuth = await silentClient.startAuthorization(
        redirectUri,
        {},
        client.getCookieHeader('/oidc/auth')
      );
      expect(silentAuth.status).toBe(303);
      const silentLocation = silentAuth.headers.get('location') ?? '';
      expect(silentLocation.startsWith(redirectUri)).toBe(true);
      expect(new URL(silentLocation).searchParams.get('code')).toEqual(expect.any(String));
      expect(new URL(silentLocation).searchParams.has('error')).toBe(false);
    } finally {
      await fixture.cleanup();
    }
  });
});
