import { ReservedScope, UserScope } from '@logto/core-kit';
import { decodeIdToken } from '@logto/js';
import { ApplicationUserConsentScopeType } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { deleteUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { deleteApplication } from '#src/api/application.js';
import { createAppAndSignInWithPassword, refreshTokens } from '#src/helpers/session.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';

describe('user scopes at refresh', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('should stop issuing a user scope removed from the application consent configuration', async () => {
    const { user, userProfile } = await generateNewUser({
      username: true,
      password: true,
      primaryEmail: true,
    });
    const { app, refreshToken } = await createAppAndSignInWithPassword({
      username: userProfile.username,
      password: userProfile.password,
      isThirdParty: true,
      scopes: [ReservedScope.OpenId, UserScope.Profile, UserScope.Email],
    });
    assert(refreshToken, new Error('No refresh token issued'));

    const granted = await refreshTokens({ clientId: app.id, refreshToken });
    assert(granted.idToken, new Error('No ID token issued'));
    expect(granted.scope.split(' ')).toContain(UserScope.Email);
    expect(decodeIdToken(granted.idToken)).toHaveProperty('email', userProfile.primaryEmail);

    await deleteUserConsentScopes(
      app.id,
      ApplicationUserConsentScopeType.UserScopes,
      UserScope.Email
    );

    // The rotated token, since the first refresh consumed the original one.
    const narrowed = await refreshTokens({
      clientId: app.id,
      refreshToken: granted.refreshToken ?? refreshToken,
    });
    assert(narrowed.idToken, new Error('No ID token issued'));
    expect(narrowed.scope.split(' ')).not.toContain(UserScope.Email);
    expect(decodeIdToken(narrowed.idToken)).not.toHaveProperty('email');
    // The rest of the consent configuration is untouched.
    expect(narrowed.scope.split(' ')).toContain(UserScope.Profile);

    await Promise.all([deleteApplication(app.id), deleteUser(user.id)]);
  });
});
