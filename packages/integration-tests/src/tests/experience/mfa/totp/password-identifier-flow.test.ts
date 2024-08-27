import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import {
  defaultSignUpMethod,
  enableMandatoryMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { generateUsername } from '#src/utils.js';

import TotpTestingContext from './totp-testing-context.js';

describe('MFA - TOTP', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await enableMandatoryMfaWithTotp();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe('username and password', () => {
    const context = new TotpTestingContext();

    beforeAll(async () => {
      await updateSignInExperience({
        signUp: defaultSignUpMethod,
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

    it('should bind TOTP when registering', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Username],
          password: true,
          verify: false,
        },
      });

      context.setUpUsername(generateUsername());
      context.setUpUserPassword('l0gt0_T3st_P@ssw0rd');

      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'register');
      await experience.toFillInput('identifier', context.username, { submit: true });

      experience.toBeAt('register/password');
      await experience.toFillNewPasswords(context.userPassword);
      context.setUpTotpSecret(await experience.toBindTotp());
      await experience.verifyThenEnd();

      // Reset sign up settings
      await updateSignInExperience({ signUp: defaultSignUpMethod });
    });

    it('should verify TOTP when signing in', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: context.username, password: context.userPassword },
        { submit: true }
      );
      await experience.toVerifyTotp(context.totpSecret);

      const userId = await experience.getUserIdFromDemoAppPage();

      await experience.verifyThenEnd();

      // Clean up
      await deleteUser(userId);
    });

    it('should bind TOTP if an existing user has no TOTP', async () => {
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

      await experience.toBindTotp();

      await experience.verifyThenEnd();

      // Clean up
      await deleteUser(user.id);
    });
  });

  describe('email and password', () => {
    const context = new TotpTestingContext();

    beforeAll(async () => {
      await updateSignInExperience({
        signUp: defaultSignUpMethod,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Email,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });

      // Generate a new user for testing
      const { userProfile, user } = await generateNewUser({ primaryEmail: true, password: true });
      context.setUpUserId(user.id);
      context.setUpUserEmail(userProfile.primaryEmail);
      context.setUpUserPassword(userProfile.password);
    });

    afterAll(async () => {
      await deleteUser(context.userId);
    });

    it('should bind TOTP if an existing user has no TOTP', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: context.userEmail, password: context.userPassword },
        { submit: true }
      );

      context.setUpTotpSecret(await experience.toBindTotp());
      await experience.verifyThenEnd();
    });

    it('should verify TOTP when signing in', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: context.userEmail, password: context.userPassword },
        { submit: true }
      );
      await experience.toVerifyTotp(context.totpSecret);
      await experience.verifyThenEnd();
    });
  });

  describe('phone and password', () => {
    const context = new TotpTestingContext();

    beforeAll(async () => {
      await updateSignInExperience({
        signUp: defaultSignUpMethod,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Phone,
              password: true,
              verificationCode: false,
              isPasswordPrimary: true,
            },
          ],
        },
      });

      // Generate a new user for testing
      const { userProfile, user } = await generateNewUser({ primaryPhone: true, password: true });
      context.setUpUserId(user.id);
      context.setUpUserPhone(
        /**
         * Note: exclude the country code from the phone number
         * since the default country code and the generated phone number are both '1'.
         */
        userProfile.primaryPhone.slice(1)
      );
      context.setUpUserPassword(userProfile.password);
    });

    afterAll(async () => {
      await deleteUser(context.userId);
    });

    it('should bind TOTP if an existing user has no TOTP', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: context.userPhone, password: context.userPassword },
        { submit: true }
      );
      context.setUpTotpSecret(await experience.toBindTotp());
      await experience.verifyThenEnd();
    });

    it('should verify TOTP when signing in', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillForm(
        { identifier: context.userPhone, password: context.userPassword },
        { submit: true }
      );
      await experience.toVerifyTotp(context.totpSecret);
      await experience.verifyThenEnd();
    });
  });
});
