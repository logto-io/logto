import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { demoAppUrl } from '#src/constants.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import {
  enableUserControlledMfaWithTotp,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import ExpectTotpExperience from '#src/ui-helpers/expect-totp-experience.js';
import { waitFor } from '#src/utils.js';

describe('MFA - User controlled', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms, ConnectorType.Social]);
    await setSocialConnector();
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
    });

    await enableUserControlledMfaWithTotp();
  });

  afterAll(async () => {
    await resetMfaSettings();
  });

  it('can skip MFA binding when signing in at the first time', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    const experience = new ExpectTotpExperience(await browser.newPage());
    await experience.startWith(demoAppUrl, 'sign-in');

    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true, shouldNavigate: false }
    );
    // Wait for the TOTP page rendered
    await waitFor(1000);
    await experience.toClick('div[role=button][class$=skipButton]');
    // Wait for the sign-in requests to be handled
    await experience.page.waitForNetworkIdle();
    await experience.verifyThenEnd();
    await deleteUser(user.id);
  });

  it('should verify MFA when the user has not skip the MFA binding', async () => {
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
    const totpSecret = await experience.toBindTotp();
    await experience.verifyThenEnd(false);

    await experience.startWith(demoAppUrl, 'sign-in');
    await experience.toFillForm(
      {
        identifier: userProfile.username,
        password: userProfile.password,
      },
      { submit: true }
    );

    await experience.toVerifyTotp(totpSecret);
    await experience.verifyThenEnd();

    await deleteUser(user.id);
  });
});
