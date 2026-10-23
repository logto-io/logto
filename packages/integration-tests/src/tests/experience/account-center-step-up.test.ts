import { ConnectorType } from '@logto/connector-kit';
import {
  accountCenterApplicationId,
  MfaPolicy,
  SignInIdentifier,
  SignInMode,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';

import { enableAllAccountCenterFields } from '#src/api/account-center.js';
import { createUser, deleteUser, getUser, postUserIdentity } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { logtoUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import { createDefaultTenantUserWithPassword } from '#src/helpers/profile.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { devFeatureTest, generateUsername, waitFor } from '#src/utils.js';

const accountUrl = (pathname: string) => appendPath(new URL(logtoUrl), 'account', pathname);

const waitForUsernameRemoval = async (userId: string) => {
  const deadline = Date.now() + 10_000;

  // eslint-disable-next-line @silverhand/fp/no-let
  let user = await getUser(userId);

  while (user.username !== null && Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    await waitFor(200);
    // eslint-disable-next-line no-await-in-loop, @silverhand/fp/no-mutation
    user = await getUser(userId);
  }

  return user;
};

/**
 * Account Center reads `acr` and `auth_time` from its ID token. A social sign-in carries no `acr`,
 * so it starts a step-up before every sensitive operation instead of sending a request that is
 * known to be challenged. A fresh password sign-in can use the Account API directly.
 */
devFeatureTest.describe('Account Center OIDC step-up', () => {
  // eslint-disable-next-line @silverhand/fp/no-let
  let socialConnectorId: string;

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
    const { id } = await setSocialConnector();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    socialConnectorId = id;
    await enableAllAccountCenterFields();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
  });

  const signInWithSocial = async (
    experience: ExpectExperience,
    pathname: string,
    userId: string
  ) => {
    const socialUserId = generateStandardId();
    await postUserIdentity(userId, socialConnectorId, {
      code: 'fake_code',
      userId: socialUserId,
      redirectUri: 'http://localhost:3000',
    });

    await experience.startWith(accountUrl(pathname), 'sign-in');
    await experience.toProcessSocialSignIn({ socialUserId });
    await experience.waitForUrl(accountUrl(pathname));
  };

  it('resumes the pending action once after the step-up', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
      socialSignInConnectorTargets: ['mock-social'],
      mfa: { factors: [], policy: MfaPolicy.UserControlled },
    });
    const { user, password } = await createDefaultTenantUserWithPassword();
    const experience = new ExpectExperience(await browser.newPage());

    try {
      await signInWithSocial(experience, 'security', user.id);

      // The username section renders before the social section, so this is its "Remove".
      await experience.toClickButton('Remove', false);
      await experience.toClick('[role=dialog] button', 'Remove', false);

      // The missing context sends the user to the step-up for the account they are signed in with.
      await experience.waitForPathname('step-up/password', undefined, accountCenterApplicationId);
      await experience.toFillInput('password', password, { submit: true, shouldNavigate: false });

      await experience.waitForUrl(accountUrl('security'));
      await expect(waitForUsernameRemoval(user.id)).resolves.toHaveProperty('username', null);
    } finally {
      await experience.page.close();
      await deleteUser(user.id);
    }
  });

  it('loads sessions directly after a fresh password sign-in', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
      socialSignInConnectorTargets: [],
      mfa: { factors: [], policy: MfaPolicy.UserControlled },
    });
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      await experience.startWith(accountUrl('sessions'), 'sign-in');
      await experience.toFillForm(
        { identifier: username, password },
        { submit: true, shouldNavigate: false }
      );
      await experience.waitForUrl(accountUrl('sessions'));

      // The fresh `1fa` context loads the protected list without a Manage click.
      await expect(experience.page).toMatchElement('span', { text: 'Current session' });
      await expect(experience.page).not.toMatchElement('button', { text: 'Manage' });
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });

  it('explains unmet authentication requirements and drops the action', async () => {
    // Nothing the user could verify or establish: social sign-in only.
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signIn: { methods: [] },
      socialSignInConnectorTargets: ['mock-social'],
      mfa: { factors: [], policy: MfaPolicy.UserControlled },
    });
    // A username keeps the shared sign-up configuration from prompting for one; it is not a
    // verification method, so the user still has nothing to satisfy the step-up.
    const user = await createUser({ name: 'social-only', username: generateUsername() });
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      await signInWithSocial(experience, 'sessions', user.id);

      await experience.toClickButton('Manage', false);

      // The authorization endpoint answers the step-up with the OIDC error.
      await experience.page.waitForFunction(
        () =>
          new URLSearchParams(window.location.search).get('error') ===
          'unmet_authentication_requirements',
        { timeout: 20_000 }
      );
      await expect(experience.page).toMatchElement('div', {
        text: 'No verification method available',
      });
      await experience.toClickButton('Go back', false);

      // Back on the page, still signed in, with the sessions not loaded.
      await experience.waitForUrl(accountUrl('sessions'));
      await expect(experience.page).toMatchElement('button', { text: 'Manage' });
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });
});
