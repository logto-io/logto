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
import {
  devFeatureTest,
  generateEmail,
  generatePassword,
  generateUsername,
  waitFor,
} from '#src/utils.js';

const accountUrl = (pathname: string) => appendPath(new URL(logtoUrl), 'account', pathname);

/** Account Center's proactive `max_age`; see `authenticationFreshnessMaxAgeSeconds`. */
const proactiveMaxAge = '540';

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

/** Username and password only; no social connector is offered on the sign-in page. */
const usePasswordSignIn = async () =>
  updateSignInExperience({
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

/**
 * Password and social sign-in. A user who only has a social identity has no Logto-verifiable first
 * factor, so a step-up can only reach `1fa` by establishing a password after re-running the linked
 * social connector as subject proof.
 */
const usePasswordAndSocialSignIn = async () =>
  updateSignInExperience({
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

/**
 * The requests the Account Center page made, for assertions on the proof and the resume.
 *
 * The arrays are appended to from the page's request listener, which is the only way Puppeteer
 * exposes them; they are read after the flow finishes.
 */
/* eslint-disable @silverhand/fp/no-mutating-methods -- collector arrays owned by the listener */
const recordRequests = (experience: ExpectExperience) => {
  const authorizationUrls: string[] = [];
  const accountApiRequests: Array<{
    method: string;
    url: string;
    headers: Record<string, string>;
  }> = [];
  const verificationApiUrls: string[] = [];

  experience.page.on('request', (request) => {
    const url = request.url();

    if (url.includes('/oidc/auth')) {
      authorizationUrls.push(url);
    }

    if (url.includes('/api/verifications/')) {
      verificationApiUrls.push(url);
    }

    // The bare `/api/my-account` path is a mutation (e.g. removing the username), so it has no
    // trailing slash.
    if (url.includes('/api/my-account')) {
      accountApiRequests.push({ method: request.method(), url, headers: request.headers() });
    }
  });

  return { authorizationUrls, accountApiRequests, verificationApiUrls };
};
/* eslint-enable @silverhand/fp/no-mutating-methods */

/** Poll until `condition` holds; throw with `description` when it never does. */
const waitForCondition = async (condition: () => boolean, description: string) => {
  const deadline = Date.now() + 30_000;

  while (!condition()) {
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for ${description}`);
    }

    // eslint-disable-next-line no-await-in-loop
    await waitFor(100);
  }
};

const signInWithPassword = async (
  experience: ExpectExperience,
  pathname: string,
  { username, password }: { username: string; password: string }
) => {
  await experience.startWith(accountUrl(pathname), 'sign-in');
  await experience.toFillForm(
    { identifier: username, password },
    { submit: true, shouldNavigate: false }
  );
  await experience.waitForUrl(accountUrl(pathname));
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

    return socialUserId;
  };

  it('resumes the pending action once after the step-up', async () => {
    await usePasswordAndSocialSignIn();
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
    await usePasswordSignIn();
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      await signInWithPassword(experience, 'sessions', { username, password });

      // The fresh `1fa` context loads the protected list without a Manage click.
      await expect(experience.page).toMatchElement('span', { text: 'Current session' });
      await expect(experience.page).not.toMatchElement('button', { text: 'Manage' });
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });

  it('loads trusted devices directly after a fresh password sign-in', async () => {
    await usePasswordSignIn();
    const { user, username, password } = await createDefaultTenantUserWithPassword();
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      const requests = recordRequests(experience);
      await signInWithPassword(experience, 'security', { username, password });

      // The trusted devices section auto-loads from the fresh context instead of offering Manage.
      await expect(experience.page).toMatchElement('div', { text: 'No trusted devices.' });
      expect(requests.verificationApiUrls).toEqual([]);
      expect(
        requests.accountApiRequests.filter(({ headers }) => 'logto-verification-id' in headers)
      ).toEqual([]);
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });

  it('starts a step-up from an RFC 9470 challenge and resumes the action', async () => {
    await usePasswordSignIn();
    // The primary email stays after the removal, so the username is not the last identifier.
    const { user, username, password } = await createDefaultTenantUserWithPassword({
      primaryEmail: generateEmail(),
    });
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    // What the Account API answers once the elevated token ages out. The first username removal
    // is challenged; every later request is served normally, so the resume can succeed.
    // The values are deliberately not Account Center's own fallback (`max_age=600`), so a client
    // that ignored the header and used the fallback cannot pass the assertions below.
    // eslint-disable-next-line @silverhand/fp/no-let -- the interceptor answers exactly one request
    let isChallengePending = true;
    const challenge =
      'Bearer error="insufficient_user_authentication", ' +
      'error_description="Recent user authentication is required", ' +
      'acr_values="urn:logto:acr:1fa", max_age="700"';

    try {
      const requests = recordRequests(experience);
      await experience.page.setRequestInterception(true);
      experience.page.on('request', (request) => {
        if (
          isChallengePending &&
          request.method() === 'PATCH' &&
          request.url().endsWith('/api/my-account')
        ) {
          // eslint-disable-next-line @silverhand/fp/no-mutation -- one-shot interceptor state
          isChallengePending = false;
          void request.respond({
            status: 401,
            contentType: 'application/json',
            headers: { 'WWW-Authenticate': challenge },
            body: JSON.stringify({
              code: 'verification_record.permission_denied',
              message: 'Permission denied, please re-authenticate.',
            }),
          });
          return;
        }

        void request.continue();
      });

      await signInWithPassword(experience, 'security', { username, password });

      // A challenged username removal is only sent again when the pending action resumes; the
      // page does not replay it on its own, so a lost action leaves the username in place.
      await experience.toClickButton('Remove', false);
      await experience.toClick('[role=dialog] button', 'Remove', false);

      const usernameRemovals = () =>
        requests.accountApiRequests.filter(
          ({ method, url }) => method === 'PATCH' && url.endsWith('/api/my-account')
        );
      await waitForCondition(
        () => requests.authorizationUrls.some((url) => url.includes('acr_values')),
        'the step-up authorization started from the challenge'
      );
      await waitForCondition(
        () => usernameRemovals().length >= 2,
        'the resumed username removal'
      );

      await experience.waitForUrl(accountUrl('security'));
      await expect(waitForUsernameRemoval(user.id)).resolves.toHaveProperty('username', null);
      // The action resumed once, and the elevated token stayed the only proof.
      expect(usernameRemovals()).toHaveLength(2);
      expect(requests.verificationApiUrls).toEqual([]);

      const challengeAuthorizationUrl = requests.authorizationUrls.find((url) =>
        url.includes('acr_values')
      );
      const { searchParams } = new URL(challengeAuthorizationUrl ?? '');
      // The values come from the challenge header, not from Account Center's fallback.
      expect(searchParams.get('acr_values')).toBe('urn:logto:acr:1fa');
      expect(searchParams.get('max_age')).toBe('700');
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });

  it('starts a new step-up when the elevated token ages out', async () => {
    await usePasswordSignIn();
    // The primary email stays after the removal, so the username is not the last identifier.
    const { user, username, password } = await createDefaultTenantUserWithPassword({
      primaryEmail: generateEmail(),
    });
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      const requests = recordRequests(experience);
      await signInWithPassword(experience, 'security', { username, password });

      // Age the local clock past Account Center's freshness window and trigger an inline action.
      // The server's session is still fresh, so the authorization completes without a prompt;
      // what this asserts is that Account Center asked for `1fa` again and resumed the action.
      await experience.page.evaluate(() => {
        const { now } = Date;
        // eslint-disable-next-line @silverhand/fp/no-mutation -- age the page's clock for this test
        Date.now = () => now() + 600_000;
      });

      await experience.toClickButton('Remove', false);
      await experience.toClick('[role=dialog] button', 'Remove', false);

      await experience.waitForUrl(accountUrl('security'));
      await expect(waitForUsernameRemoval(user.id)).resolves.toHaveProperty('username', null);

      // The sign-in itself starts an authorization; the step-up one is the one asking for `1fa`.
      const authorizationUrl = requests.authorizationUrls.find((url) => url.includes('acr_values'));
      expect(authorizationUrl).toBeTruthy();
      const { searchParams } = new URL(authorizationUrl ?? '');
      expect(searchParams.get('acr_values')).toBe('urn:logto:acr:1fa');
      expect(searchParams.get('max_age')).toBe(proactiveMaxAge);

      // The elevated token is the only proof: no verification record, no Verification API call.
      expect(requests.verificationApiUrls).toEqual([]);
      expect(
        requests.accountApiRequests.filter(({ headers }) => 'logto-verification-id' in headers)
      ).toEqual([]);
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });

  it('does not run the pending action when the step-up is abandoned', async () => {
    await usePasswordAndSocialSignIn();
    const { user } = await createDefaultTenantUserWithPassword();
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      const requests = recordRequests(experience);
      await signInWithSocial(experience, 'sessions', user.id);

      await experience.toClickButton('Manage', false);
      await experience.waitForPathname('step-up/password', undefined, accountCenterApplicationId);

      // The action is persisted before the redirect, so the abandon below has one to discard.
      await expect(
        experience.page.evaluate(() => {
          const raw = sessionStorage.getItem('logto:account-center:pending-step-up');
          return raw === null
            ? null
            : (JSON.parse(raw) as { action: { type: string }; phase: string });
        })
      ).resolves.toMatchObject({ action: { type: 'load-sessions' }, phase: 'authorizing' });

      // Walk away from the step-up instead of finishing it.
      await experience.navigateTo(accountUrl('sessions'));

      // The abandoned record is discarded, and the protected list is not loaded.
      await expect(experience.page).toMatchElement('button', { text: 'Manage' });
      await expect(experience.page).not.toMatchElement('span', { text: 'Current session' });
      await expect(
        experience.page.evaluate(() =>
          sessionStorage.getItem('logto:account-center:pending-step-up')
        )
      ).resolves.toBeNull();
      expect(requests.accountApiRequests.filter(({ url }) => url.includes('/sessions'))).toEqual(
        []
      );
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });

  it('explains a failed authorization and does not run the pending action', async () => {
    await usePasswordAndSocialSignIn();
    const { user } = await createDefaultTenantUserWithPassword();
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      const requests = recordRequests(experience);
      await signInWithSocial(experience, 'sessions', user.id);

      await experience.toClickButton('Manage', false);
      await experience.waitForPathname('step-up/password', undefined, accountCenterApplicationId);

      // The authorization endpoint answers the step-up with an OIDC error instead of a code. The
      // state parameter is irrelevant here: only the error branch is under test.
      const failureUrl = appendPath(new URL(logtoUrl), 'account');
      failureUrl.searchParams.set('error', 'access_denied');
      await experience.navigateTo(failureUrl);

      await expect(experience.page).toMatchElement('div', {
        text: 'Identity verification was not completed. No changes were made to your account.',
      });
      await experience.toClickButton('Go back', false);

      // Back on the page, still signed in, with the protected list untouched. Asserting the
      // absence of the request is what proves a leaked pending action did not run: the stale
      // social token would answer `401` and render the same "Manage" state either way.
      await experience.waitForUrl(accountUrl('sessions'));
      await expect(experience.page).toMatchElement('button', { text: 'Manage' });
      await expect(experience.page).not.toMatchElement('span', { text: 'Current session' });
      expect(requests.accountApiRequests.filter(({ url }) => url.includes('/sessions'))).toEqual(
        []
      );
    } finally {
      await context.close();
      await deleteUser(user.id);
    }
  });

  it('lets a social-only user establish a password inside the step-up and resumes the action', async () => {
    await usePasswordAndSocialSignIn();
    // A username keeps the shared sign-up configuration from prompting for one; it is not a
    // verification method, so the user still has nothing to satisfy the step-up with.
    const user = await createUser({ name: 'social-only', username: generateUsername() });
    const newPassword = generatePassword();
    const context = await browser.createBrowserContext();
    const experience = new ExpectExperience(await context.newPage());

    try {
      const socialUserId = await signInWithSocial(experience, 'security', user.id);

      await experience.toClickButton('Remove', false);
      await experience.toClick('[role=dialog] button', 'Remove', false);

      // Nothing enrolled to verify: the linked connector is offered as subject proof instead.
      await experience.waitForPathname('step-up', undefined, accountCenterApplicationId);
      await expect(experience.page).toMatchElement('div', {
        text: 'through an account linked to yours',
      });
      await experience.toProcessSocialSignIn({ socialUserId });

      // A fresh subject proof licenses establishing the missing first factor.
      await experience.waitForPathname('continue/password', undefined, accountCenterApplicationId);
      await experience.toFillNewPasswords(newPassword);

      await experience.waitForUrl(accountUrl('security'));
      await expect(waitForUsernameRemoval(user.id)).resolves.toHaveProperty('username', null);

      // The password the step-up established now satisfies `1fa` for this user.
      const userAfterStepUp = await getUser(user.id);
      expect(userAfterStepUp.hasPassword).toBe(true);
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
