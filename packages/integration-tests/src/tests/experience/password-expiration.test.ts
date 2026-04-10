import { SignInIdentifier, SignInMode } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { deleteUser, expireUserPassword } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import {
  disablePasswordExpiration,
  enablePasswordExpiration,
} from '#src/helpers/sign-in-experience.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

describe('password expiration', () => {
  const context = new (class Context {
    userId?: string;
    username = generateUsername();
    password = generatePassword();
  })();

  beforeAll(async () => {
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
        ],
      },
      passwordExpiration: {
        enabled: true,
        validPeriodDays: 30,
        reminderPeriodDays: 5,
      },
    });

    const user = await createUserByAdmin({
      username: context.username,
      password: context.password,
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    context.userId = user.id;
  });

  afterAll(async () => {
    if (!context.userId) {
      return;
    }

    await disablePasswordExpiration();
    await trySafe(deleteUser(context.userId));
  });

  it('should force password reset on next sign-in after password is marked as expired', async () => {
    await enablePasswordExpiration({ validPeriodDays: 30, reminderPeriodDays: 5 });
    await expireUserPassword(context.userId!);

    const experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', context.username);
    await experience.toFillInput('password', context.password, { submit: true });

    await experience.waitForPathname('sign-in/password-expiration/reset');

    const newPassword = generatePassword();
    await experience.toFillNewPasswords(newPassword);
    await experience.verifyThenEnd();

    // eslint-disable-next-line @silverhand/fp/no-mutation
    context.password = newPassword;
  });

  it('should show the password expiration reminder modal when password is near expiration', async () => {
    await enablePasswordExpiration({ validPeriodDays: 2, reminderPeriodDays: 2 });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', context.username);
    await experience.toFillInput('password', context.password, {
      submit: true,
      shouldNavigate: false,
    });

    await experience.toMatchElement('*[role=dialog]', {
      text: /password will expire in .* day\(s\)/i,
    });
    await experience.toMatchElement('button', { text: /skip for now/i });
    await experience.toMatchElement('button', { text: /reset password/i });

    await experience.page.close();
  });

  it('should continue sign-in when skipping password expiration reminder', async () => {
    await enablePasswordExpiration({ validPeriodDays: 2, reminderPeriodDays: 2 });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', context.username);
    await experience.toFillInput('password', context.password, {
      submit: true,
      shouldNavigate: false,
    });

    await experience.toClickButton(/skip for now/i);

    await experience.verifyThenEnd();
  });

  it('should navigate to password reset page when choosing to reset from reminder modal', async () => {
    await enablePasswordExpiration({ validPeriodDays: 2, reminderPeriodDays: 2 });

    const experience = new ExpectExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', context.username);
    await experience.toFillInput('password', context.password, {
      submit: true,
      shouldNavigate: false,
    });

    await experience.toClickButton(/reset password/i);

    await experience.waitForPathname('sign-in/password-expiration/reset');
    await experience.page.close();
  });
});
