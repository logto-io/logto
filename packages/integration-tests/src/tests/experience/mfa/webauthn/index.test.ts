import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import {
  enableMandatoryMfaWithWebAuthn,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectWebAuthnExperience from '#src/ui-helpers/expect-webauthn-experience.js';
import { generateUsername, waitFor } from '#src/utils.js';

describe('MFA - WebAuthn', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await enableMandatoryMfaWithWebAuthn();
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
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  it('should bind WebAuthn when registering and verify WebAuthn when signing in', async () => {
    const username = generateUsername();
    const password = 'l0gt0_T3st_P@ssw0rd';

    const experience = new ExpectWebAuthnExperience(await browser.newPage());
    await experience.setupVirtualAuthenticator();
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', username, { submit: true });
    experience.toBeAt('register/password');
    await experience.toFillNewPasswords(password);
    await experience.toCreatePasskey();
    await experience.verifyThenEnd(false);

    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillForm(
      {
        identifier: username,
        password,
      },
      { submit: true }
    );
    // Wait for the page to process submitting request.
    await waitFor(500);
    await experience.toVerifyViaPasskey();

    await experience.clearVirtualAuthenticator();
    const userId = await experience.getUserIdFromDemoAppPage();
    await experience.verifyThenEnd();
    await deleteUser(userId);
  });

  it('should bind WebAuthn if an existing user has no WebAuthn', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const experience = new ExpectWebAuthnExperience(await browser.newPage());
    await experience.setupVirtualAuthenticator();
    await experience.startWith(demoAppUrl, 'sign-in');

    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );
    // Wait for the page to process submitting request.
    await waitFor(500);
    await experience.toCreatePasskey();

    await experience.clearVirtualAuthenticator();
    await experience.verifyThenEnd();

    await deleteUser(user.id);
  });
});
