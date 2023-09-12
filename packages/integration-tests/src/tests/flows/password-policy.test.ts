/* Test the sign-in with different password policies. */

import { ConnectorType, SignInIdentifier, SignInMode } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import ExpectJourney from '#src/ui-helpers/expect-journey.js';
import { waitFor } from '#src/utils.js';

describe('password policy', () => {
  const username = 'test_pass_policy_30';
  const emailName = 'a_good_foo_30';
  const email = emailName + '@bar.com';
  const invalidPasswords: Array<[string, string | RegExp]> = [
    ['123', 'minimum length'],
    ['12345678', 'at least 3 types'],
    ['123456aA', 'simple password'],
    ['defghiZ@', 'sequential characters'],
    ['TTTTTT@z', 'repeated characters'],
  ];

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await updateSignInExperience({
      signInMode: SignInMode.SignInAndRegister,
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
          {
            identifier: SignInIdentifier.Email,
            password: true,
            verificationCode: true,
            isPasswordPrimary: true,
          },
        ],
      },
      passwordPolicy: {
        length: { min: 8, max: 32 },
        characterTypes: { min: 3 },
        rejects: {
          pwned: true,
          repetitionAndSequence: true,
          userInfo: true,
          words: [username],
        },
      },
    });
  });

  it('should work for username + password', async () => {
    const journey = new ExpectJourney(await browser.newPage(), { forgotPassword: true });

    // Open the demo app and navigate to the register page
    await journey.startWith(demoAppUrl, 'register');
    await journey.toFillInput('identifier', username, { submit: true });

    // Password tests
    journey.toBeAt('register/password');
    await journey.toFillPasswords(
      ...invalidPasswords,
      [username + 'A', /product context .* personal information/],
      username + 'ABCD_ok'
    );

    await journey.verifyThenEnd();
  });

  it('should work for email + password', async () => {
    // Enable email verification and make password primary
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      },
    });
    const journey = new ExpectJourney(await browser.newPage(), { forgotPassword: true });

    // Open the demo app and navigate to the register page
    await journey.startWith(demoAppUrl, 'register');

    // Complete verification code flow
    await journey.toFillInput('identifier', email, { submit: true });
    await journey.toCompleteVerification('register');

    // Wait for the password page to load
    await waitFor(100);
    journey.toBeAt('continue/password');
    await journey.toFillPasswords(
      ...invalidPasswords,
      [emailName, 'personal information'],
      emailName + 'ABCD@# $'
    );

    await journey.verifyThenEnd();
  });

  it('should work for forgot password', async () => {
    const journey = new ExpectJourney(await browser.newPage(), { forgotPassword: true });

    // Open the demo app and navigate to the register page
    await journey.startWith(demoAppUrl, 'sign-in');

    // Click the forgot password link
    await journey.toFillInput('identifier', email, { submit: true });
    await journey.toClick('a', 'Forgot your password');

    // Submit to continue
    await journey.toClickSubmit();

    // Complete verification code flow
    await journey.toCompleteVerification('forgot-password');

    // Wait for the password page to load
    await waitFor(100);
    journey.toBeAt('forgot-password/reset');
    await journey.toFillPasswords(
      ...invalidPasswords,
      [emailName, 'personal information'],
      [emailName + 'ABCD@# $', 'be the same as'],
      emailName + 'ABCD135'
    );

    await journey.waitForToast(/password changed/i);
    await journey.toFillInput('identifier', email, { submit: true });
    await journey.toFillInput('password', emailName + 'ABCD135', { submit: true });
    await journey.verifyThenEnd();
  });
});
