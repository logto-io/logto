import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import { resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectWebAuthnExperience from '#src/ui-helpers/expect-webauthn-experience.js';
import { waitFor } from '#src/utils.js';

describe('MFA - Multi factors', () => {
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
      mfa: {
        factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
        policy: MfaPolicy.Mandatory,
      },
    });
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  it('should be able to complete MFA flow with multi factors', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const experience = new ExpectWebAuthnExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.setupVirtualAuthenticator();
    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );

    experience.toBeAt('mfa-binding');

    // Wait for the page rendered
    await waitFor(500);

    // Select TOTP
    await experience.toClick('button div[class$=name]', 'Authenticator app OTP');
    experience.toBeAt('mfa-binding/Totp');

    // Navigate back
    await experience.toClickSwitchFactorsLink({ isBinding: true });
    experience.toBeAt('mfa-binding');
    await expect(experience.page).toMatchElement('div[class$=title]', {
      text: 'Add 2-step verification',
    });

    // Switch to WebAuthn
    await experience.toClick('button div[class$=name]', 'Passkey');
    experience.toBeAt('mfa-binding/WebAuthn');
    await experience.toClickSwitchFactorsLink({ isBinding: true });
    experience.toBeAt('mfa-binding');
    await expect(experience.page).toMatchElement('div[class$=title]', {
      text: 'Add 2-step verification',
    });

    // Bind WebAuthn
    await experience.toClick('button div[class$=name]', 'Passkey');
    // Wait the WebAuthn to be prepared
    await experience.page.waitForNetworkIdle();
    experience.toBeAt('mfa-binding/WebAuthn');
    await experience.toCreatePasskey();

    // Backup codes page
    await experience.toClick('button', 'Continue');
    await experience.verifyThenEnd(false);

    // Sign in with latest used factor
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );

    await experience.page.waitForNetworkIdle();
    experience.toBeAt('mfa-verification/WebAuthn');
    await experience.toVerifyViaPasskey();

    await experience.clearVirtualAuthenticator();
    await experience.verifyThenEnd();
    await deleteUser(user.id);
  });
});
