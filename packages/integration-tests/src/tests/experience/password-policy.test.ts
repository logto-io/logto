/* Test the sign-in with different password policies. */

import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { setupUsernameAndEmailExperience } from '#src/ui-helpers/index.js';
import { randomString } from '#src/utils.js';

describe('password policy', () => {
  const username = 'test_' + randomString();
  const emailName = 'foo_' + randomString();
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
    await setupUsernameAndEmailExperience({
      length: { min: 8, max: 32 },
      characterTypes: { min: 3 },
      rejects: {
        pwned: true,
        repetitionAndSequence: true,
        userInfo: true,
        words: [username],
      },
    });
  });

  it('should work for username + password', async () => {
    const experience = new ExpectExperience(await browser.newPage(), { forgotPassword: true });

    // Open the demo app and navigate to the register page
    await experience.startWith(demoAppUrl, 'register');
    await experience.toFillInput('identifier', username, { submit: true });

    // Password tests
    await experience.waitForPathname('register/password');
    await experience.toFillNewPasswords(
      ...invalidPasswords,
      [username + 'A', /product context .* personal information/],
      username + 'ABCD_ok'
    );

    await experience.verifyThenEnd();
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
    const experience = new ExpectExperience(await browser.newPage(), { forgotPassword: true });

    // Open the demo app and navigate to the register page
    await experience.startWith(demoAppUrl, 'register');

    // Complete verification code flow
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toCompleteVerification('register', 'Email');

    await experience.waitForPathname('continue/password');
    await experience.toFillNewPasswords(
      ...invalidPasswords,
      [emailName, 'personal information'],
      emailName + 'ABCD@# $'
    );

    await experience.verifyThenEnd();
  });

  it('should work for forgot password', async () => {
    const experience = new ExpectExperience(await browser.newPage(), { forgotPassword: true });

    // Open the demo app and navigate to the register page
    await experience.startWith(demoAppUrl, 'sign-in');

    // Click the forgot password link
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toClick('a', 'Forgot your password');

    // Submit to continue
    await experience.toClickSubmit();

    // Complete verification code flow
    await experience.toCompleteVerification('forgot-password', 'Email');

    // Wait for the password page to load
    await experience.waitForPathname('forgot-password/reset');
    await experience.toFillNewPasswords(
      ...invalidPasswords,
      [emailName, 'personal information'],
      [emailName + 'ABCD@# $', 'be the same as'],
      emailName + 'ABCD135'
    );

    await experience.waitForPathname('sign-in');
    await experience.waitForToast(/password changed/i);
    await experience.toFillInput('identifier', email, { submit: true });
    await experience.toFillInput('password', emailName + 'ABCD135', { submit: true });
    await experience.verifyThenEnd();
  });
});
