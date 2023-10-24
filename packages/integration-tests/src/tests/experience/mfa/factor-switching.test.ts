import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import { resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { waitFor } from '#src/utils.js';

describe('MFA - Factor switching', () => {
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

  it('should be able to switch between different factors', async () => {
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

    experience.toBeAt('mfa-binding');

    // Wait for the page rendered
    await waitFor(500);

    // Select TOTP
    await experience.toClick('button div[class$=name]', 'Authenticator app OTP');
    experience.toBeAt('mfa-binding/Totp');

    // Navigate back
    await experience.toClick('a[class*=switchLink');
    experience.toBeAt('mfa-binding');
    await expect(experience.page).toMatchElement('div[class$=title]', {
      text: 'Add 2-step authentication',
    });

    // Select WebAuthn
    await experience.toClick('button div[class$=name]', 'Passkey');
    experience.toBeAt('mfa-binding/WebAuthn');
    await experience.toClick('a[class*=switchLink');
    experience.toBeAt('mfa-binding');
    await expect(experience.page).toMatchElement('div[class$=title]', {
      text: 'Add 2-step authentication',
    });

    await experience.page.close();
    await deleteUser(user.id);
  });
});
