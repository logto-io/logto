import { ConnectorType } from '@logto/connector-kit';
import {
  AlternativeSignUpIdentifier,
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  SignInIdentifier,
} from '@logto/schemas';
import { authenticator } from 'otplib';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { fulfillUserEmail } from '#src/helpers/experience/index.js';
import {
  successfullySendVerificationCode,
  successfullyVerifyVerificationCode,
} from '#src/helpers/experience/verification-code.js';
import { expectRejects } from '#src/helpers/index.js';
import { resetMfaSettings } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';
import { generatePhone } from '#src/utils.js';

const emailPrimarySignInExperience = {
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
};

describe('Register interaction - optional additional MFA suggestion', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await setEmailConnector();
    await setSmsConnector();
    // Set up sign-in experience upfront (refer to email-with-signup.test.ts pattern)
    await updateSignInExperience(emailPrimarySignInExperience);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
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

    await expectRejects<{
      availableFactors: MfaFactor[];
      skippable: boolean;
      maskedIdentifiers?: Record<string, string>;
      suggestion?: boolean;
    }>(client.submitInteraction(), {
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      expectData: (data) => {
        // Should now include both Email and TOTP
        expect(data.availableFactors).toEqual([MfaFactor.TOTP, MfaFactor.EmailVerificationCode]);
        expect(data.maskedIdentifiers).toBeDefined();
        expect(data.maskedIdentifiers?.[MfaFactor.EmailVerificationCode]).toMatch(/\*{4}/);
        expect(data.skippable).toBe(true);
        expect(data.suggestion).toBe(true);
      },
    });

    // Skip suggestion
    await client.skipMfaSuggestion();

    // Submit again should succeed
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
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
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });

  it('should suggest additional MFA when email is required as a secondary identifier', async () => {
    const secondaryEmailExperience = {
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: true,
        secondaryIdentifiers: [
          {
            identifier: SignInIdentifier.Email,
            verify: true,
          },
        ],
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
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
    };

    await updateSignInExperience(secondaryEmailExperience);

    const { username, password, primaryEmail } = generateNewUserProfile({
      username: true,
      password: true,
      primaryEmail: true,
    });

    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    await client.updateProfile({ type: SignInIdentifier.Username, value: username });
    await client.updateProfile({ type: 'password', value: password });

    await fulfillUserEmail(client, primaryEmail);

    await client.identifyUser();

    await expectRejects<{
      availableFactors: MfaFactor[];
      skippable: boolean;
      maskedIdentifiers?: Record<string, string>;
      suggestion?: boolean;
    }>(client.submitInteraction(), {
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      expectData: (data) => {
        expect(data.availableFactors).toEqual([MfaFactor.TOTP, MfaFactor.EmailVerificationCode]);
        expect(data.maskedIdentifiers).toBeDefined();
        expect(data.maskedIdentifiers?.[MfaFactor.EmailVerificationCode]).toMatch(/\*{4}/);
        expect(data.skippable).toBe(true);
        expect(data.suggestion).toBe(true);
      },
    });

    await client.skipMfaSuggestion();

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await deleteUser(userId);
  });

  it('should suggest additional MFA when email or phone is required as a secondary identifier', async () => {
    await updateSignInExperience({
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: true,
        secondaryIdentifiers: [
          {
            identifier: AlternativeSignUpIdentifier.EmailOrPhone,
            verify: true,
          },
        ],
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
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

    const { username, password, primaryEmail } = generateNewUserProfile({
      username: true,
      password: true,
      primaryEmail: true,
    });

    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    await client.updateProfile({ type: SignInIdentifier.Username, value: username });
    await client.updateProfile({ type: 'password', value: password });

    await fulfillUserEmail(client, primaryEmail);

    await client.identifyUser();

    await expectRejects<{
      availableFactors: MfaFactor[];
      skippable: boolean;
      maskedIdentifiers?: Record<string, string>;
      suggestion?: boolean;
    }>(client.submitInteraction(), {
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      expectData: (data) => {
        expect(data.availableFactors).toEqual([MfaFactor.TOTP, MfaFactor.EmailVerificationCode]);
        expect(data.maskedIdentifiers).toBeDefined();
        expect(data.maskedIdentifiers?.[MfaFactor.EmailVerificationCode]).toMatch(/\*{4}/);
        expect(data.skippable).toBe(true);
        expect(data.suggestion).toBe(true);
      },
    });

    await client.skipMfaSuggestion();

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });

  it('should not suggest MFA after fulfilling phone verification when both email and SMS factors are enabled', async () => {
    // Configure MFA with email, phone, and TOTP factors
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
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode, MfaFactor.TOTP],
        policy: MfaPolicy.Mandatory,
      },
    });

    const { primaryEmail, password } = generateNewUserProfile({
      primaryEmail: true,
      password: true,
    });
    const phoneNumber = generatePhone();
    const client = await initExperienceClient({ interactionEvent: InteractionEvent.Register });

    // Register with email
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

    // Submit should trigger MFA suggestion
    await expectRejects<{
      availableFactors: MfaFactor[];
      skippable: boolean;
      maskedIdentifiers?: Record<string, string>;
      suggestion?: boolean;
    }>(client.submitInteraction(), {
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      expectData: (data) => {
        // Should include Email, Phone and TOTP
        expect(data.availableFactors).toEqual([
          MfaFactor.TOTP,
          MfaFactor.PhoneVerificationCode,
          MfaFactor.EmailVerificationCode,
        ]);
        expect(data.maskedIdentifiers).toBeDefined();
        expect(data.maskedIdentifiers?.[MfaFactor.EmailVerificationCode]).toMatch(/\*{4}/);
        expect(data.skippable).toBe(true);
        expect(data.suggestion).toBe(true);
      },
    });

    // Fulfill phone verification instead of skipping
    const { verificationId: phoneVerificationId, code: phoneCode } =
      await successfullySendVerificationCode(client, {
        identifier: { type: SignInIdentifier.Phone, value: phoneNumber },
        interactionEvent: InteractionEvent.Register,
      });

    const finalPhoneVerificationId = await successfullyVerifyVerificationCode(client, {
      identifier: { type: SignInIdentifier.Phone, value: phoneNumber },
      verificationId: phoneVerificationId,
      code: phoneCode,
    });

    await client.bindMfa(MfaFactor.PhoneVerificationCode, finalPhoneVerificationId);

    // Now submit should succeed without MFA suggestion
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);
    await logoutClient(client);
    await deleteUser(userId);
  });
});
