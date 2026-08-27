import { UserScope } from '@logto/core-kit';
import { ApplicationType, ApplicationUserConsentScopeType, SignInIdentifier } from '@logto/schemas';
import ky from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import {
  assignUserConsentScopes,
  deleteUserConsentScopes,
} from '#src/api/application-user-consent-scope.js';
import { createApplicationWithSecret, deleteApplication } from '#src/api/application.js';
import { consent } from '#src/api/interaction.js';
import { logtoUrl } from '#src/constants.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateRoleName, generateScopeName } from '#src/utils.js';

describe('consent scope revalidation', () => {
  const redirectUri = 'http://example.com';

  const bootstrapConsentFlow = async (requestedScopes: string[]) => {
    const application = await createApplicationWithSecret(
      'consent-scope-revalidation-app',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
      }
    );

    await assignUserConsentScopes(application.id, {
      userScopes: [UserScope.Profile, UserScope.Email],
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const client = await initExperienceClient({
      config: {
        appId: application.id,
        appSecret: application.secret,
        scopes: requestedScopes,
      },
      redirectUri,
    });

    const { verificationId } = await client.verifyPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: userProfile.username,
      },
      password: userProfile.password,
    });

    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    await client.processSession(redirectTo, false);

    return { application, user, client };
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('should reject the submission when a requested user scope was removed mid-interaction', async () => {
    const { application, user, client } = await bootstrapConsentFlow([
      UserScope.Profile,
      UserScope.Email,
    ]);

    await deleteUserConsentScopes(
      application.id,
      ApplicationUserConsentScopeType.UserScopes,
      UserScope.Email
    );

    const response = await ky.post(`${logtoUrl}/api/interaction/consent`, {
      headers: { cookie: client.interactionCookie },
      json: {},
      throwHttpErrors: false,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'oidc.invalid_scope' });

    await Promise.all([deleteApplication(application.id), deleteUser(user.id)]);
  });

  it('should keep the submission working when the removed scope was never requested', async () => {
    const { application, user, client } = await bootstrapConsentFlow([UserScope.Profile]);

    await deleteUserConsentScopes(
      application.id,
      ApplicationUserConsentScopeType.UserScopes,
      UserScope.Email
    );

    const { redirectTo } = await client.send(consent);
    await client.manualConsent(redirectTo);

    await Promise.all([deleteApplication(application.id), deleteUser(user.id)]);
  });

  it('should drop an organization scope removed from the consent configuration mid-interaction', async () => {
    const organizationApi = new OrganizationApiTest();
    const orgScope = await organizationApi.scopeApi.create({ name: generateScopeName() });
    const orgScope2 = await organizationApi.scopeApi.create({ name: generateScopeName() });
    const role = await organizationApi.roleApi.create({
      name: generateRoleName(),
      organizationScopeIds: [orgScope.id, orgScope2.id],
    });

    const application = await createApplicationWithSecret(
      'consent-scope-revalidation-org-app',
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
      }
    );

    await assignUserConsentScopes(application.id, {
      userScopes: [UserScope.Profile, UserScope.Organizations],
      organizationScopes: [orgScope.id, orgScope2.id],
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const organization = await organizationApi.create({ name: 'test_org_revalidation' });
    await organizationApi.addUsers(organization.id, [user.id]);
    await organizationApi.addUserRoles(organization.id, user.id, [role.id]);

    const client = await initExperienceClient({
      config: {
        appId: application.id,
        appSecret: application.secret,
        scopes: [UserScope.Profile, UserScope.Organizations, orgScope.name, orgScope2.name],
      },
      redirectUri,
    });

    const { verificationId } = await client.verifyPassword({
      identifier: {
        type: SignInIdentifier.Username,
        value: userProfile.username,
      },
      password: userProfile.password,
    });
    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    await client.processSession(redirectTo, false);

    // The configuration change lands while the consent screen is open
    await deleteUserConsentScopes(
      application.id,
      ApplicationUserConsentScopeType.OrganizationScopes,
      orgScope2.id
    );

    const { redirectTo: consentRedirectTo } = await client.send(consent, {
      organizationIds: [organization.id],
    });
    await client.manualConsent(consentRedirectTo);

    // The grant records only what the current configuration allows, so the role-carried but
    // configuration-removed scope never reaches the organization token
    await expect(client.getOrganizationTokenClaims(organization.id)).resolves.toHaveProperty(
      'scope',
      orgScope.name
    );

    await Promise.all([
      organizationApi.cleanUp(),
      deleteApplication(application.id),
      deleteUser(user.id),
    ]);
  });
});
