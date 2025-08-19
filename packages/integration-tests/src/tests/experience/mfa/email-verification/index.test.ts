import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { readConnectorMessage } from '#src/helpers/index.js';
import { enableMandatoryMfaWithEmail, resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { devFeatureTest, generateEmail, waitFor } from '#src/utils.js';

devFeatureTest.describe('email MFA verification', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await enableMandatoryMfaWithEmail();
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
    await clearConnectorsByTypes([ConnectorType.Email]);
    await resetMfaSettings();
  });

  it('binds email MFA then verifies via email code on next sign-in', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const email = generateEmail();

    // First sign-in: bind email MFA
    const experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );

    await waitFor(500);
    experience.toBeAt('mfa-binding/EmailVerificationCode');
    await experience.page.waitForSelector('input[name="identifier"]');
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toCompleteVerification('continue', ConnectorType.Email);
    await experience.verifyThenEnd(false);

    // Second sign-in: verify via email MFA verification page
    const experience2 = new ExpectExperience(await browser.newPage());
    await experience2.startWith(demoAppUrl, 'sign-in');
    await experience2.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );

    await waitFor(300);
    experience2.toBeAt(`mfa-verification/${MfaFactor.EmailVerificationCode}`);

    // Read email code and fill inputs named mfaCode_0..5
    const { code } = await readConnectorMessage('Email');
    for (const [index, char] of code.split('').entries()) {
      // eslint-disable-next-line no-await-in-loop
      await experience2.toFillInput(`mfaCode_${index}`, char);
    }
    await experience2.toClick('button', 'Continue');
    await experience2.verifyThenEnd();

    await deleteUser(user.id);
  });
});
