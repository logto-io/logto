import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import {
  enableMandatoryMfaWithWebAuthn,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectWebAuthnExperience from '#src/ui-helpers/expect-webauthn-experience.js';
import { setupUsernameAndEmailExperience } from '#src/ui-helpers/index.js';
import { devFeatureTest, generateUsername } from '#src/utils.js';

const { describe, it } = devFeatureTest;

const setupSignInExperience = async (options: {
  passkeyEnabled?: boolean;
  passwordEnabled?: boolean;
  verificationCodeEnabled?: boolean;
  isPasswordPrimary?: boolean;
}) => {
  const {
    passkeyEnabled = false,
    passwordEnabled = true,
    verificationCodeEnabled = false,
    isPasswordPrimary = true,
  } = options;

  await updateSignInExperience({
    signIn: {
      methods: [
        {
          identifier: SignInIdentifier.Email,
          password: passwordEnabled,
          verificationCode: verificationCodeEnabled,
          isPasswordPrimary,
        },
        {
          identifier: SignInIdentifier.Username,
          password: true,
          verificationCode: false,
          isPasswordPrimary: true,
        },
      ],
    },
    forgotPasswordMethods: [],
    passkeySignIn: {
      enabled: passkeyEnabled,
      showPasskeyButton: passkeyEnabled,
    },
  });
};

/**
 * Tests for identifier-first sign-in flow with verification method switching.
 *
 * These tests verify the behavior when users can choose between multiple verification methods
 * (passkey, password, verification code) after entering their identifier.
 *
 * Key scenarios tested:
 * 1. When passkey sign-in is enabled but user has no passkeys, fall back to password
 * 2. When passkey sign-in is disabled, navigate directly to password page
 *
 * Note: Full passkey sign-in flow with users who have passkeys is tested in:
 * - mfa/webauthn/index.test.ts (uses devFeatureTest for passkey sign-in)
 */
describe('identifier-first verification method switching', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    await setupUsernameAndEmailExperience();
  });

  afterAll(async () => {
    // Reset to default sign-in experience
    await resetMfaSettings();
    await updateSignInExperience({
      passkeySignIn: {
        enabled: false,
        showPasskeyButton: false,
        allowAutofill: false,
      },
    });
  });

  describe('fallback behavior for users without passkeys', () => {
    it('should fall back to password page when passkey is enabled but user has no passkeys', async () => {
      await setupSignInExperience({
        passkeyEnabled: true,
        passwordEnabled: true,
      });

      // Create a user WITHOUT passkeys (via API, not registration flow)
      const { userProfile, user } = await generateNewUser({
        primaryEmail: true,
        password: true,
      });

      const experience = new ExpectWebAuthnExperience(await browser.newPage());
      await experience.startWith(demoAppUrl);

      // Fill in email without expecting immediate navigation (submit: false)
      await experience.toFillInput('identifier', userProfile.primaryEmail, { submit: true });

      // Should fall back to password page (user has no passkeys registered)
      experience.toBeAt('sign-in/password');

      // Clean up
      await deleteUser(user.id);
      await experience.page.close();
    });

    it('should show password form directly when passkey sign-in is disabled and password-only', async () => {
      await setupSignInExperience({
        passkeyEnabled: false,
        passwordEnabled: true,
      });

      const { userProfile, user } = await generateNewUser({
        primaryEmail: true,
        username: true,
        password: true,
      });

      const experience = new ExpectWebAuthnExperience(await browser.newPage());
      await experience.startWith(demoAppUrl);

      // When passkey is disabled and password-only, PasswordSignInForm is shown directly
      // with both identifier and password fields on the same page
      await experience.toFillInput('identifier', userProfile.primaryEmail);
      await experience.toFillInput('password', userProfile.password, { submit: true });

      await experience.verifyThenEnd();
      // Clean up
      await deleteUser(user.id);
    });

    it('should navigate to verification code page when password is not primary', async () => {
      await setupSignInExperience({
        passkeyEnabled: false,
        passwordEnabled: true,
        verificationCodeEnabled: true,
        isPasswordPrimary: false,
      });

      const { userProfile, user } = await generateNewUser({
        primaryEmail: true,
        password: true,
      });

      const experience = new ExpectWebAuthnExperience(await browser.newPage());
      await experience.startWith(demoAppUrl);

      await experience.toFillInput('identifier', userProfile.primaryEmail, { submit: true });

      // Should fall back to verification code page (since password is not primary)
      experience.toBeAt('sign-in/verification-code');

      // Clean up
      await deleteUser(user.id);
      await experience.page.close();
    });
  });

  describe('passkey sign-in with registered passkeys', () => {
    it('should navigate to passkey page when user has passkeys registered', async () => {
      // Step 1: Setup for user registration (without passkeySignIn enabled)
      await setupSignInExperience({});
      await enableMandatoryMfaWithWebAuthn();

      const username = generateUsername();
      const password = 'l0gt0_T3st_P@ssw0rd';

      const experience = new ExpectWebAuthnExperience(await browser.newPage());
      await experience.setupVirtualAuthenticator();

      // Register a user with password (through the full registration flow)
      await experience.startWith(demoAppUrl, 'register');
      await experience.toFillInput('identifier', username, { submit: true });
      experience.toBeAt('register/password');
      await experience.toFillNewPasswords(password);

      // Bind passkey during registration (uses mfa-binding/WebAuthn route)
      experience.toBeAt('mfa-binding/WebAuthn');
      await experience.toCreatePasskey();

      const userId = await experience.getUserIdFromDemoAppPage();
      await experience.verifyThenEnd(false);

      // Step 2: Enable passkeySignIn for sign-in testing
      await updateSignInExperience({
        passkeySignIn: {
          enabled: true,
          showPasskeyButton: true,
          allowAutofill: false,
        },
      });

      await experience.startWith(demoAppUrl);

      // Fill in username
      await experience.toFillInput('identifier', username, { submit: true });

      // Should navigate to passkey verification page (user has passkeys)
      experience.toBeAt('sign-in/passkey');

      // Passkey sign-in should succeed without prompting MFA again
      await experience.toClick('button', 'Verify via passkey');

      await experience.clearVirtualAuthenticator();
      await experience.verifyThenEnd();
      await deleteUser(userId);
    });

    it('should show switch link and navigate to password page when switching methods', async () => {
      // Step 1: Setup for user registration (without passkeySignIn enabled)
      await setupSignInExperience({});
      await enableMandatoryMfaWithWebAuthn();

      const username = generateUsername();
      const password = 'l0gt0_T3st_P@ssw0rd';

      const experience = new ExpectWebAuthnExperience(await browser.newPage());
      await experience.setupVirtualAuthenticator();

      // Register a user with passkey
      await experience.startWith(demoAppUrl, 'register');
      await experience.toFillInput('identifier', username, { submit: true });
      await experience.waitForPathname('register/password');
      await experience.toFillNewPasswords(password);

      // Bind passkey during registration
      await experience.waitForPathname('mfa-binding/WebAuthn');
      await experience.toCreatePasskey();
      const userId = await experience.getUserIdFromDemoAppPage();
      await experience.verifyThenEnd(false);

      // Step 2: Enable passkeySignIn and clear MFA for sign-in testing
      await updateSignInExperience({
        passkeySignIn: {
          enabled: true,
          showPasskeyButton: true,
          allowAutofill: false,
        },
      });

      // Start the identifier-first sign-in flow
      await experience.startWith(demoAppUrl);

      await experience.toFillInput('identifier', username, { submit: true });

      // Wait for passkey page navigation
      await experience.waitForPathname('sign-in/passkey');

      // Should show direct "Sign in with password" link (since only 2 methods: passkey + password)
      await expect(experience.page).toMatchElement('a', {
        text: /sign in with password/i,
      });

      // Click the switch link
      await experience.toClick('a', /sign in with password/i);
      await experience.waitForPathname('sign-in/password');

      // Can complete sign-in with password
      await experience.toFillInput('password', password, { submit: true });

      // Prompt for passkey verification again due to MFA
      await experience.toVerifyViaPasskey();

      await experience.clearVirtualAuthenticator();
      await experience.verifyThenEnd();
      await deleteUser(userId);
    });
  });
});
