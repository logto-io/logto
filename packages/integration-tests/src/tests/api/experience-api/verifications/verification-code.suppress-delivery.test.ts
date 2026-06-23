import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, SignInIdentifier, SignInMode } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import {
  createUserByAdmin,
  expectRejects,
  readConnectorMessage,
  removeConnectorMessage,
} from '#src/helpers/index.js';
import { defaultSignInSignUpConfigs } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateEmail } from '#src/utils.js';

// Registration is disabled (sign-in only) with email verification-code sign-in enabled. So an
// unregistered email has no path to become a user and must not receive a code.
devFeatureTest.describe('suppress sign-in verification-code delivery to unknown recipients', () => {
  beforeAll(async () => {
    await setEmailConnector();
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
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
            password: false,
            verificationCode: true,
            isPasswordPrimary: false,
          },
        ],
      },
    });
  });

  afterAll(async () => {
    // Restore the baseline so this suite does not leak its sign-up/sign-in changes into later files.
    await updateSignInExperience(defaultSignInSignUpConfigs);
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
  });

  it('creates the verification record but suppresses delivery to an unregistered email', async () => {
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
    const email = generateEmail();

    // Clear any prior connector message so the absence of a new one is meaningful.
    await removeConnectorMessage('Email');

    const { verificationId } = await client.sendVerificationCode({
      interactionEvent: InteractionEvent.SignIn,
      identifier: { type: SignInIdentifier.Email, value: email },
    });

    // The passcode record is still created (response shape matches a real send)...
    expect(verificationId).toBeTruthy();
    // ...but nothing is delivered to the unknown recipient (the message file stays empty).
    await expect(readConnectorMessage('Email')).rejects.toThrow();

    // Verifying returns a code mismatch, not `not_found`, so the suppression does not leak existence.
    await expectRejects(
      client.verifyVerificationCode({
        identifier: { type: SignInIdentifier.Email, value: email },
        verificationId,
        code: 'invalid_code',
      }),
      { code: 'verification_code.code_mismatch', status: 400 }
    );
  });

  it('still delivers to a registered email user', async () => {
    const email = generateEmail();
    const { id: userId } = await createUserByAdmin({ primaryEmail: email });

    const client = await initExperienceClient({ interactionEvent: InteractionEvent.SignIn });
    await removeConnectorMessage('Email');

    const { verificationId } = await client.sendVerificationCode({
      interactionEvent: InteractionEvent.SignIn,
      identifier: { type: SignInIdentifier.Email, value: email },
    });

    expect(verificationId).toBeTruthy();
    const emailMessage = await readConnectorMessage('Email');
    expect(emailMessage.address).toBe(email);
    expect(emailMessage.code).toBeTruthy();

    await deleteUser(userId);
  });
});
