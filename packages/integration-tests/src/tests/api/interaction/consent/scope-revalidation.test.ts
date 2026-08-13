import { UserScope } from '@logto/core-kit';
import { ApplicationType, ApplicationUserConsentScopeType, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import {
  assignUserConsentScopes,
  deleteUserConsentScopes,
} from '#src/api/application-user-consent-scope.js';
import { createApplicationWithSecret, deleteApplication } from '#src/api/application.js';
import { consent } from '#src/api/interaction.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';

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

    await expectRejects(client.send(consent), {
      code: 'oidc.invalid_scope',
      status: 400,
    });

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
});
