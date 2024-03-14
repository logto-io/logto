import { ReservedResource, UserScope } from '@logto/core-kit';
import { type Application, InteractionEvent, ApplicationType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { getConsentInfo, putInteraction } from '#src/api/interaction.js';
import { OrganizationScopeApi } from '#src/api/organization-scope.js';
import { initClient } from '#src/helpers/client.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';

describe('consent api', () => {
  const applications = new Map<string, Application>();
  const thirdPartyApplicationName = 'consent-third-party-app';
  const redirectUri = 'http://example.com';

  const bootStrapApplication = async () => {
    const thirdPartyApplication = await createApplication(
      thirdPartyApplicationName,
      ApplicationType.Traditional,
      {
        isThirdParty: true,
        oidcClientMetadata: {
          redirectUris: [redirectUri],
          postLogoutRedirectUris: [],
        },
      }
    );

    applications.set(thirdPartyApplicationName, thirdPartyApplication);

    await assignUserConsentScopes(thirdPartyApplication.id, {
      userScopes: [UserScope.Profile],
    });
  };

  beforeAll(async () => {
    await Promise.all([enableAllPasswordSignInMethods(), bootStrapApplication()]);
  });

  it('get consent info', async () => {
    const application = applications.get(thirdPartyApplicationName);
    assert(application, new Error('application.not_found'));

    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const client = await initClient(
      {
        appId: application.id,
        appSecret: application.secret,
      },
      redirectUri
    );

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await client.processSession(redirectTo, false);

    const result = await client.send(getConsentInfo);

    expect(result.application.id).toBe(application.id);
    expect(result.user.id).toBe(user.id);
    expect(result.redirectUri).toBe(redirectUri);
    expect(result.missingOIDCScope).toEqual([UserScope.Profile]);

    await deleteUser(user.id);
  });

  it('get consent info with organization scope', async () => {
    const application = applications.get(thirdPartyApplicationName);
    assert(application, new Error('application.not_found'));

    const organizationScopeApi = new OrganizationScopeApi();

    const organizationScope = await organizationScopeApi.create({
      name: 'organization-scope',
    });

    await assignUserConsentScopes(application.id, {
      organizationScopes: [organizationScope.id],
      userScopes: [UserScope.Organizations],
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const client = await initClient(
      {
        appId: application.id,
        appSecret: application.secret,
        scopes: [UserScope.Organizations, UserScope.Profile, organizationScope.name],
      },
      redirectUri
    );

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: {
        username: userProfile.username,
        password: userProfile.password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    await client.processSession(redirectTo, false);

    const result = await client.send(getConsentInfo);

    expect(
      result.missingResourceScopes?.find(
        ({ resource }) => resource.name === ReservedResource.Organization
      )
    ).not.toBeUndefined();

    await organizationScopeApi.delete(organizationScope.id);
    await deleteUser(user.id);
  });

  afterAll(async () => {
    for (const application of applications.values()) {
      void deleteApplication(application.id);
    }
  });
});
