import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import {
  enableUserControlledMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { generateUsername, waitFor } from '#src/utils.js';

describe('MFA - User controlled', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await setSocialConnector();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
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
    });

    await enableUserControlledMfaWithTotp();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  it('can skip MFA binding when registering and no need to verify MFA when signing in', async () => {
    const username = generateUsername();
    const password = 'l0gt0_T3st_P@ssw0rd';

    const experience = new ExpectTotpExperience(await browser.newPage());

    // Register
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', username, { submit: true });
    experience.toBeAt('register/password');
    await experience.toFillNewPasswords(password);

    // Skip MFA
    await experience.toClick('div[role=button][class$=skipButton]');
    await experience.page.waitForNetworkIdle();
    await experience.verifyThenEnd(false);

    // Sign in
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillForm(
      {
        identifier: username,
        password,
      },
      { submit: true }
    );

    const userId = await experience.getUserIdFromDemoAppPage();
    // Sign in successfully
    await experience.verifyThenEnd();
    await deleteUser(userId);
  });

  it('can skip MFA binding when signing in at the first time', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const experience = new ExpectTotpExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');

    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true, shouldNavigate: false }
    );
    // Wait for the TOTP page rendered
    await waitFor(1000);
    await experience.toClick('div[role=button][class$=skipButton]');
    // Wait for the sign-in requests to be handled
    await experience.page.waitForNetworkIdle();
    await experience.verifyThenEnd();
    await deleteUser(user.id);
  });

  it('should verify MFA when the user has not skip the MFA binding', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const experience = new ExpectTotpExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');

    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );
    const totpSecret = await experience.toBindTotp();
    await experience.verifyThenEnd(false);

    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );

    await experience.toVerifyTotp(totpSecret);
    await experience.verifyThenEnd();

    await deleteUser(user.id);
  });
});
