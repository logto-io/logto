import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, MfaFactor, MfaPolicy, SignInIdentifier } from '@logto/schemas';
import { authenticator } from 'otplib';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const { describe, it } = devFeatureTest;

describe('Register interaction - optional additional MFA suggestion', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    // Set up sign-in experience upfront (refer to email-with-signup.test.ts pattern)
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
            verificationCode: false,
            isPasswordPrimary: false,
          },
        ],
      },
      mfa: {
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
        policy: MfaPolicy.Mandatory,
      },
    });
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await resetMfaSettings();
  });

  it('should suggest adding another MFA after email sign-up and allow skip', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      interactionEvent: InteractionEvent.Register,
    });

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      verificationId,
      code,
    });

    // Fulfill required password before identifying the user
    await client.updateProfile({ type: 'password', value: password });
    await client.identifyUser({ verificationId });

    await expectRejects<{ availableFactors: MfaFactor[]; skippable: boolean }>(
      client.submitInteraction(),
      {
        code: 'session.mfa.suggest_additional_mfa',
        status: 422,
        expectData: (data) => {
          expect(data.availableFactors).toEqual([MfaFactor.TOTP]);
          expect(data.skippable).toBe(true);
        },
      }
    );

    // Skip suggestion
    await client.skipMfaSuggestion();

    // Submit again should succeed
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);
  });

  it('should allow binding TOTP instead of skipping and then complete', async () => {
    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    const { verificationId, code } = await successfullySendVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      interactionEvent: InteractionEvent.Register,
    });

    await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Email, value: primaryEmail },
      verificationId,
      code,
    });

    // Fulfill required password before identifying the user
    await client.updateProfile({ type: 'password', value: password });
    await client.identifyUser({ verificationId });

    // Before submitting (which would suggest), bind a TOTP factor instead
    const { secret, verificationId: totpVid } = await client.createTotpSecret();
    const totpCode = authenticator.generate(secret);
    const { verificationId: finalTotpVid } = await client.verifyTotp({
      verificationId: totpVid,
      code: totpCode,
    });
    await client.bindMfa(MfaFactor.TOTP, finalTotpVid);

    // Now submit should succeed
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    await logoutClient(client);
  });
});
