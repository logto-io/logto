import { ConnectorType } from '@logto/connector-kit';
import { ForgotPasswordMethod, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { enableMandatoryMfaWithTotp, resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { generateEmail, generatePhone, waitFor } from '#src/utils.js';

describe('MFA - TOTP', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await updateSignInExperience({
      forgotPasswordMethods: [],
    });
    await enableMandatoryMfaWithTotp();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  it('should add missing password before binding missing TOTP factor', async () => {
    await setEmailConnector();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Email,
            verificationCode: true,
            password: true,
            isPasswordPrimary: false,
          },
        ],
      },
      forgotPasswordMethods: [ForgotPasswordMethod.EmailVerificationCode],
    });

    const { userProfile, user } = await generateNewUser({ primaryEmail: true });
    const experience = new ExpectTotpExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', userProfile.primaryEmail, { submit: true });
    await experience.toCompleteVerification('sign-in', 'Email');

    // Add missing password
    await experience.toFillInput('newPassword', 'l0gt0_T3st_P@ssw0rd', { submit: true });

    // Bind TOTP
    await experience.toBindTotp();
    await experience.verifyThenEnd();

    // Clean up
    await deleteUser(user.id);
    await clearConnectorsByTypes([ConnectorType.Email]);
  });

  it('should add missing phone number before binding missing TOTP factor', async () => {
    await setSmsConnector();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Phone],
        password: true,
        verify: true,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Phone,
            password: true,
            verificationCode: true,
            isPasswordPrimary: true,
          },
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
      forgotPasswordMethods: [ForgotPasswordMethod.PhoneVerificationCode],
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const experience = new ExpectTotpExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', userProfile.username, {
      submit: true,
    });
    await experience.toFillInput('password', userProfile.password, { submit: true });

    // Add missing phone number
    await waitFor(500);
    await experience.toFillInput('identifier', generatePhone(), { submit: true });
    await experience.toCompleteVerification('continue', 'Sms');

    // Bind TOTP
    await experience.toBindTotp();
    await experience.verifyThenEnd();

    // Clean up
    await deleteUser(user.id);
    await clearConnectorsByTypes([ConnectorType.Sms]);
  });

  it('should add missing email before binding missing TOTP factor', async () => {
    await setEmailConnector();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: true,
            isPasswordPrimary: true,
          },
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
      forgotPasswordMethods: [ForgotPasswordMethod.EmailVerificationCode],
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });
    const experience = new ExpectTotpExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', userProfile.username, {
      submit: true,
    });
    await experience.toFillInput('password', userProfile.password, { submit: true });

    // Add missing email number
    await waitFor(500);
    await experience.toFillInput('identifier', generateEmail(), { submit: true });
    await experience.toCompleteVerification('continue', 'Email');

    // Bind TOTP
    await experience.toBindTotp();
    await experience.verifyThenEnd();

    // Clean up
    await deleteUser(user.id);
    await clearConnectorsByTypes([ConnectorType.Email]);
  });

  it('should verify required TOTP before adding missing profile', async () => {
    /* Bind TOTP */
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
            verificationCode: false,
            password: true,
            isPasswordPrimary: true,
          },
        ],
      },
    });

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
    const bindTotpSecret = await experience.toBindTotp();
    await experience.verifyThenEnd();
    /* Bind TOTP - End */

    // Verify TOTP before adding missing email
    await setEmailConnector();
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            verificationCode: false,
            password: true,
            isPasswordPrimary: true,
          },
          {
            identifier: SignInIdentifier.Email,
            verificationCode: true,
            password: true,
            isPasswordPrimary: true,
          },
        ],
      },
      forgotPasswordMethods: [ForgotPasswordMethod.EmailVerificationCode],
    });

    const verificationExperience = new ExpectTotpExperience(await browser.newPage());
    await verificationExperience.startWith(demoAppUrl, 'sign-in');
    await verificationExperience.toFillInput('identifier', userProfile.username, {
      submit: true,
    });
    await verificationExperience.toFillInput('password', userProfile.password, { submit: true });

    // Verify TOTP
    await verificationExperience.toVerifyTotp(bindTotpSecret, false);

    // Add missing email
    await verificationExperience.toFillInput('identifier', generateEmail(), { submit: true });
    await verificationExperience.toCompleteVerification('continue', 'Email');
    // Wait for the page to load
    await waitFor(500);
    await verificationExperience.verifyThenEnd();

    // Clean up
    await deleteUser(user.id);
    await clearConnectorsByTypes([ConnectorType.Email]);
  });
});
