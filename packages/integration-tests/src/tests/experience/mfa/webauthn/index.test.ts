import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';

import { createUserMfaVerification, deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import {
  enableMandatoryMfaWithWebAuthn,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectWebAuthnExperience from '#src/ui-helpers/expect-webauthn-experience.js';
import { devFeatureTest, generateUsername, waitFor } from '#src/utils.js';

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
      forgotPasswordMethods: [],
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

devFeatureTest.describe('MFA - Passkey sign-in should skip MFA verification', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    // Enable mandatory MFA with WebAuthn so passkey is registered during registration
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
      forgotPasswordMethods: [],
    });
  });

  afterAll(async () => {
    await resetMfaSettings();
    // Reset passkey sign-in settings
    await updateSignInExperience({
      passkeySignIn: {
        enabled: false,
        showPasskeyButton: false,
        allowAutofill: false,
      },
    });
  });

  it('should sign in with passkey and skip MFA verification even when mandatory TOTP MFA is enabled', async () => {
    const username = generateUsername();
    const password = 'l0gt0_T3st_P@ssw0rd';

    // Step 1: Register a user with passkey (WebAuthn MFA binding during registration)
    const experience = new ExpectWebAuthnExperience(await browser.newPage());
    await experience.setupVirtualAuthenticator();
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', username, { submit: true });
    experience.toBeAt('register/password');
    await experience.toFillNewPasswords(password);
    await experience.toCreatePasskey();
    const userId = await experience.getUserIdFromDemoAppPage();
    await experience.verifyThenEnd(false);

    // Step 2: Add TOTP MFA to the user via admin API, so the user has mandatory TOTP MFA
    await createUserMfaVerification(userId, MfaFactor.TOTP);

    // Step 3: Enable mandatory TOTP MFA and passkey sign-in
    await updateSignInExperience({
      mfa: {
        factors: [MfaFactor.TOTP],
        policy: MfaPolicy.Mandatory,
      },
      passkeySignIn: {
        enabled: true,
        showPasskeyButton: true,
        allowAutofill: false,
      },
    });

    // Step 4: Sign in using the passkey sign-in button
    // The passkey sign-in creates a SignInWebAuthn verification record,
    // which should skip MFA verification according to the new logic
    await experience.startWith(demoAppUrl, 'sign-in');

    // Wait for the page and passkey sign-in button to load
    await waitFor(1000);

    // Click the "Continue with Passkey" button
    await experience.toClick('button', 'Continue with Passkey');

    // Step 5: Verify the user is signed in successfully without MFA verification prompt
    // If MFA was not skipped, the user would be redirected to the MFA verification page
    await experience.verifyThenEnd(false);

    await experience.clearVirtualAuthenticator();
    await experience.page.close();
    await deleteUser(userId);
  });
});
