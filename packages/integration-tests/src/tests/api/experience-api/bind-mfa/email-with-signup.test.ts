import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import {
  successfullySendMfaVerificationCode,
  successfullySendVerificationCode,
  successfullyVerifyMfaVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { enableMandatoryMfaWithEmail, resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { devFeatureTest, generateEmail, generatePassword } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('Register with email identifier and bind as email MFA automaticly', () => {
  beforeAll(async () => {
    // Use only email connector and allow email sign-up via verification code
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
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
            verificationCode: false,
            password: true,
            isPasswordPrimary: false,
          },
        ],
      },
      forgotPasswordMethods: [],
    });
    await enableMandatoryMfaWithEmail();
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await resetMfaSettings();
  });

  it('treats MFA step as email factor when sign-up identifier is email', async () => {
    const email = generateEmail();
    const password = generatePassword();

    // Start register interaction and verify email identifier
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });
    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: email },
      interactionEvent: InteractionEvent.Register,
    });
    const verifiedId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: email },
      verificationId,
      code,
    });
    await client.updateProfile({ type: 'password', value: password });

    // Identify the user (complete sign-up identifier step)
    await client.identifyUser({ verificationId: verifiedId });

    // Now MFA is mandatory with Email factor; send and verify MFA code using email factor
    const { verificationId: mfaVerificationId, code: mfaCode } =
      await successfullySendMfaVerificationCode(client, {
        identifierType: SignInIdentifier.Email,
        expectedIdentifierValue: email,
      });

    await successfullyVerifyMfaVerificationCode(client, {
      identifierType: SignInIdentifier.Email,
      verificationId: mfaVerificationId,
      code: mfaCode,
    });

    // Finish interaction and clean up created user
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });
});
