import { ConnectorType } from '@logto/connector-kit';
import { MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { enableMandatoryMfaWithEmail, resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
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
      await experience.toCompleteVerification('continue', ConnectorType.Email);
      await experience.toClickButton('Continue');
      await experience.toOptInTrustedDevice();
      await experience.verifyThenEnd(false);
      await experience.clearDemoAppSession();
      await experience.page.close();
      const trustedDeviceExperience = new ExpectExperience(await browser.newPage());

      await trustedDeviceExperience.startWith(demoAppUrl, 'sign-in');
      await trustedDeviceExperience.toFillForm(
        { identifier: userProfile.username, password: userProfile.password },
        { submit: true }
      );
      await trustedDeviceExperience.verifyThenEnd();

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
      await experience.toCompleteMfaVerification(ConnectorType.Email, true);
      await experience.toOptInTrustedDevice();
      await experience.verifyThenEnd(false);
      await experience.clearDemoAppSession();
      await experience.page.close();
      const trustedDeviceExperience = new ExpectExperience(await browser.newPage());

      await trustedDeviceExperience.startWith(demoAppUrl, 'sign-in');
      await trustedDeviceExperience.toFillForm(
        { identifier: userProfile.username, password: userProfile.password },
        { submit: true }
      );
      await trustedDeviceExperience.verifyThenEnd();

      await deleteUser(user.id);
    });

    it('shows trusted-device opt-in after email verification and additional TOTP binding', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Email],
          password: true,
          verify: true,
        },
        mfa: {
          factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
          policy: MfaPolicy.Mandatory,
        },
      });

      const { userProfile, user } = await generateNewUser({
        username: true,
        password: true,
        primaryEmail: true,
      });
      const experience = new ExpectTotpExperience(await browser.newPage());

      try {
        await experience.startWith(demoAppUrl, 'sign-in');
        await experience.toFillForm(
          { identifier: userProfile.username, password: userProfile.password },
          { submit: true }
        );
        await experience.waitToBeAt(`mfa-verification/${MfaFactor.EmailVerificationCode}`);
        await experience.toCompleteMfaVerification(ConnectorType.Email, true);

        await experience.waitToBeAt('mfa-binding');
        await experience.toClick('button div[class$=name]', 'Authenticator app OTP');
        await experience.toBindTotp(false, true);

        await experience.toOptInTrustedDevice();
        await experience.verifyThenEnd(false);
        await experience.clearDemoAppSession();
      } finally {
        await experience.page.close();
        await deleteUser(user.id);
        await enableMandatoryMfaWithEmail();
        await updateSignInExperience({
          signUp: {
            identifiers: [SignInIdentifier.Username],
            password: true,
            verify: false,
          },
        });
      }
    });
  });
});
