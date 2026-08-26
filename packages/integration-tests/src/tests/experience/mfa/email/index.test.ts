import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { enableMandatoryMfaWithEmail, resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import {
  devFeatureTest,
  generateEmail,
  generatePassword,
  generateUsername,
  waitFor,
} from '#src/utils.js';

describe('email MFA binding', () => {
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

  it('should bind email MFA on register', async () => {
    const username = generateUsername();
    const password = generatePassword();
    const email = generateEmail();
    const experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', username, { submit: true });
    experience.toBeAt('register/password');
    await experience.toFillNewPasswords(password);

    await waitFor(500);
    experience.toBeAt('mfa-binding/EmailVerificationCode');
    await experience.page.waitForSelector('input[name="identifier"]');
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toCompleteVerification('continue', ConnectorType.Email);
    await experience.verifyThenEnd();
  });

  it('should bind email MFA on sign in', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const email = generateEmail();
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
    await experience.verifyThenEnd();

    await deleteUser(user.id);
  });

  devFeatureTest.describe('trusted device opt-in', () => {
    beforeAll(async () => {
      await updateSignInExperience({ trustedDevice: { enabled: true, durationDays: 365 } });
    });

    afterAll(async () => {
      await updateSignInExperience({ trustedDevice: { enabled: false } });
    });

    it('creates a trusted device from email MFA binding and skips MFA on the next sign-in', async () => {
      const { userProfile, user } = await generateNewUser({ username: true, password: true });
      const experience = new ExpectExperience(await browser.newPage());

      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: userProfile.username, password: userProfile.password },
        { submit: true }
      );
      await experience.waitToBeAt(`mfa-binding/${MfaFactor.EmailVerificationCode}`);
      await experience.toFillInput('identifier', generateEmail(), { submit: true });
      await experience.toOptInTrustedDevice();
      await experience.toCompleteVerification('continue', ConnectorType.Email);
      await experience.toClickButton('Continue');
      await experience.verifyThenEnd(false);

      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: userProfile.username, password: userProfile.password },
        { submit: true }
      );
      await experience.verifyThenEnd();

      await deleteUser(user.id);
    });

    it('creates a trusted device from email MFA verification and skips MFA on the next sign-in', async () => {
      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
        primaryEmail: true,
      });
      const experience = new ExpectExperience(await browser.newPage());

      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: userProfile.username, password: userProfile.password },
        { submit: true }
      );
      await experience.waitToBeAt(`mfa-verification/${MfaFactor.EmailVerificationCode}`);
      await experience.toOptInTrustedDevice();
      await experience.toCompleteMfaVerification(ConnectorType.Email, true);
      await experience.verifyThenEnd(false);

      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: userProfile.username, password: userProfile.password },
        { submit: true }
      );
      await experience.verifyThenEnd();

      await deleteUser(user.id);
    });
  });
});
