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
  defaultSignUpMethod,
  enableMandatoryMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { generateEmail, generatePhone } from '#src/utils.js';

import TotpTestingContext from './totp-testing-context.js';

describe('MFA - TOTP', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await enableMandatoryMfaWithTotp();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  describe('email and verification code', () => {
    const context = new TotpTestingContext();

    beforeAll(async () => {
      await setEmailConnector();
      await updateSignInExperience({
        signUp: defaultSignUpMethod,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Email,
              password: false,
              verificationCode: true,
              isPasswordPrimary: false,
            },
          ],
        },
      });
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Email]);
    });

    it('should bind TOTP when registering', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Email],
          password: false,
          verify: true,
        },
      });
      context.setUpUserEmail(generateEmail());

      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'register');
      await experience.toFillInput('identifier', context.userEmail, { submit: true });
      await experience.toCompleteVerification('register', 'Email');
      context.setUpTotpSecret(await experience.toBindTotp());
      await experience.verifyThenEnd();

      // Reset sie settings
      await updateSignInExperience({
        signUp: defaultSignUpMethod,
      });
    });

    it('should verify TOTP when signing in', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillInput('identifier', context.userEmail, { submit: true });
      await experience.toCompleteVerification('sign-in', 'Email');
      await experience.toVerifyTotp(context.totpSecret);
      const userId = await experience.getUserIdFromDemoAppPage();
      await experience.verifyThenEnd();

      // Clear
      await deleteUser(userId);
    });

    it('should bind TOTP if an existing user has no TOTP', async () => {
      const { userProfile, user } = await generateNewUser({ primaryEmail: true });
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillInput('identifier', userProfile.primaryEmail, { submit: true });
      await experience.toCompleteVerification('sign-in', 'Email');
      await experience.toBindTotp();
      await experience.verifyThenEnd();
      // Clean up
      await deleteUser(user.id);
    });
  });

  describe('phone and verification code', () => {
    const context = new TotpTestingContext();

    beforeAll(async () => {
      await setSmsConnector();
      await updateSignInExperience({
        signUp: defaultSignUpMethod,
        signIn: {
          methods: [
            {
              identifier: SignInIdentifier.Phone,
              password: false,
              verificationCode: true,
              isPasswordPrimary: false,
            },
          ],
        },
      });
    });

    afterAll(async () => {
      await clearConnectorsByTypes([ConnectorType.Sms]);
    });

    it('should bind TOTP when registering', async () => {
      await updateSignInExperience({
        signUp: {
          identifiers: [SignInIdentifier.Phone],
          password: false,
          verify: true,
        },
      });

      context.setUpUserPhone(
        /**
         * Note: exclude the country code from the phone number
         * since the default country code and the generated phone number are both '1'.
         */
        generatePhone().slice(1)
      );

      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'register');
      await experience.toFillInput('identifier', context.userPhone, { submit: true });
      await experience.toCompleteVerification('register', 'Sms');

      context.setUpTotpSecret(await experience.toBindTotp());

      await experience.verifyThenEnd();

      // Reset sie settings
      await updateSignInExperience({
        signUp: defaultSignUpMethod,
      });
    });

    it('should verify TOTP when signing in', async () => {
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillInput('identifier', context.userPhone, { submit: true });
      await experience.toCompleteVerification('sign-in', 'Sms');
      await experience.toVerifyTotp(context.totpSecret);
      const userId = await experience.getUserIdFromDemoAppPage();
      await experience.verifyThenEnd();

      // Clear
      await deleteUser(userId);
    });

    it('should bind TOTP if an existing user has no TOTP', async () => {
      const { userProfile, user } = await generateNewUser({ primaryPhone: true });
      const experience = new ExpectTotpExperience(await browser.newPage());
      await experience.startWith(demoAppUrl, 'sign-in');
      await experience.toFillInput('identifier', userProfile.primaryPhone.slice(1), {
        submit: true,
      });
      await experience.toCompleteVerification('sign-in', 'Sms');
      await experience.toBindTotp();
      await experience.verifyThenEnd();

      // Clean up
      await deleteUser(user.id);
    });
  });
});
