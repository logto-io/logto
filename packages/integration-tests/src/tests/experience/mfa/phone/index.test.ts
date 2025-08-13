import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSmsConnector } from '#src/helpers/connector.js';
import { enableMandatoryMfaWithPhone, resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import {
  devFeatureTest,
  generatePhone,
  generatePassword,
  generateUsername,
  waitFor,
} from '#src/utils.js';

devFeatureTest.describe('phone MFA binding', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Sms]);
    await setSmsConnector();
    await enableMandatoryMfaWithPhone();
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
    await clearConnectorsByTypes([ConnectorType.Sms]);
    await resetMfaSettings();
  });

  it('should bind phone MFA on register', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const phone = generatePhone();
    const experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', username, { submit: true });
    experience.toBeAt('register/password');
    await experience.toFillNewPasswords(password);

    await waitFor(500);
    experience.toBeAt('mfa-binding/PhoneVerificationCode');
    await experience.page.waitForSelector('input[name="identifier"]');
    await experience.toFillInput('identifier', phone, { submit: true });
    await experience.toCompleteVerification('continue', ConnectorType.Sms);
    await experience.verifyThenEnd();
  });

  it('should bind phone MFA on sign in', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const phone = generatePhone();
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
    experience.toBeAt('mfa-binding/PhoneVerificationCode');
    await experience.page.waitForSelector('input[name="identifier"]');
    await experience.toFillInput('identifier', phone, { submit: true });
    await experience.toCompleteVerification('continue', ConnectorType.Sms);
    await experience.verifyThenEnd();

    await deleteUser(user.id);
  });
});
