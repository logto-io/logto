import { ConnectorType, ForgotPasswordMethod, SignInIdentifier, SignInMode } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';

import { deleteUser, expireUserPassword } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { disablePasswordExpiration } from '#src/helpers/sign-in-experience.js';
import ExpectExperience from '#src/ui-helpers/expect-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

describe('password expiration', () => {
  const context = new (class Context {
    username = generateUsername();
    password = generatePassword();
    userId?: string;
  })();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();

    await updateSignInExperience({
      signInMode: SignInMode.SignInAndRegister,
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: true,
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
      forgotPasswordMethods: [ForgotPasswordMethod.EmailVerificationCode],
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
    await disablePasswordExpiration();
    await trySafe(deleteUser(context.userId!));
  });

  it('should force password reset on next sign-in after password is marked as expired', async () => {
    await expireUserPassword(context.userId!);

    const experience = new ExpectExperience(await browser.newPage(), { forgotPassword: true });
    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillInput('identifier', context.username);
    await experience.toFillInput('password', context.password, {
      submit: true,
      shouldNavigate: false,
    });

    await experience.toMatchElement('*[role=dialog]');
    await experience.toMatchElement('button', {
      text: /reset password/i,
    });

    await experience.toClickButton(/reset password/i);
    await experience.waitForPathname('forgot-password');
    await experience.page.close();
  });
});
