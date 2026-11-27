/* eslint-disable max-lines -- MFA binding and mandatory policy scenarios share the same test harness. */
import { TemplateType } from '@logto/connector-kit';
import {
  InteractionEvent,
  MfaFactor,
  type Mfa as MfaSettings,
  MfaPolicy,
  MfaVerificationCodeEnrollment,
  type OrganizationWithRoles,
  OrganizationRequiredMfaPolicy,
  SignInIdentifier,
  VerificationType,
  userMfaDataKey,
  type User,
} from '@logto/schemas';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { type InteractionContext } from '../types.js';

import { type SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';
import { Mfa, type MfaData } from './mfa.js';
import { EmailCodeVerification, PhoneCodeVerification } from './verifications/code-verification.js';

const { jest } = import.meta;

const createMfa = ({
  mfaSettings = {
    policy: MfaPolicy.NoPrompt,
    factors: [],
    organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
  },
  mfaData = {},
  interactionEvent = InteractionEvent.SignIn,
  user = {
    id: 'user-id',
    logtoConfig: {},
    mfaVerifications: [],
  },
  currentProfile = {},
  organizations = [],
  canBindMfa = true,
  consumeForBindByType,
  mfaFactorsEnabledForBinding,
}: {
  mfaSettings?: MfaSettings;
  mfaData?: MfaData;
  interactionEvent?: InteractionEvent;
  user?: Partial<User>;
  currentProfile?: Record<string, unknown>;
  organizations?: Readonly<OrganizationWithRoles[]>;
  canBindMfa?: boolean;
  consumeForBindByType?: InteractionContext['consumeForBindByType'];
  mfaFactorsEnabledForBinding?: MfaFactor[];
} = {}) => {
  const getIdentifiedUser = jest.fn(async () => user as User);
  const interactionContext: InteractionContext = {
    getInteractionEvent: () => interactionEvent,
    getIdentifiedUser,
    consumeForBind: () => {
      throw new Error('should not be called');
    },
    consumeForBindByType:
      consumeForBindByType ??
      (() => {
        throw new Error('should not be called');
      }),
    recordEstablishedPassword: () => {
      throw new Error('should not be called');
    },
    getCurrentProfile: () => currentProfile,
    canBindMfa: async () => canBindMfa,
  };

  const getOrganizationsByUserId = jest.fn(async () => organizations);
  const queries = {
    organizations: { relations: { users: { getOrganizationsByUserId } } },
  } as unknown as Queries;
  const mfa = new Mfa({} as Libraries, queries, mfaData, interactionContext);
  const { signInExperienceValidator } = mfa as unknown as {
    signInExperienceValidator: SignInExperienceValidator;
  };
  const getMfaSettings = jest
    .spyOn(signInExperienceValidator, 'getMfaSettings')
    .mockResolvedValue(mfaSettings);
  const getConfiguredMfaFactors = jest
    .spyOn(signInExperienceValidator, 'getConfiguredMfaFactors')
    .mockResolvedValue(mfaSettings.factors.filter((factor) => factor !== MfaFactor.BackupCode));
  const getMfaFactorsEnabledForBinding = jest
    .spyOn(signInExperienceValidator, 'getMfaFactorsEnabledForBinding')
    .mockResolvedValue(
      mfaFactorsEnabledForBinding ??
        mfaSettings.factors.filter((factor) => factor !== MfaFactor.BackupCode)
    );

  return {
    mfa,
    getIdentifiedUser,
    getMfaSettings,
    getConfiguredMfaFactors,
    getMfaFactorsEnabledForBinding,
    getOrganizationsByUserId,
  };
};

describe('Mfa.assertMfaFulfilled', () => {
  it('runs mandatory check for sign-in', async () => {
    const { mfa } = createMfa();
    const mandatorySpy = jest
      .spyOn(
        mfa as unknown as {
          assertUserMandatoryMfaFulfilled: (...args: unknown[]) => Promise<void>;
        },
        'assertUserMandatoryMfaFulfilled'
      )
      .mockResolvedValue();

    await mfa.assertMfaFulfilled();

    expect(mandatorySpy).toHaveBeenCalledWith(expect.any(Object), false, undefined);
  });

  it('reuses submit async context during mandatory check', async () => {
    const mandatoryMfaSettings: MfaSettings = {
      policy: MfaPolicy.Mandatory,
      factors: [MfaFactor.TOTP],
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    };

    const { mfa, getIdentifiedUser, getMfaSettings } = createMfa({
      mfaSettings: mandatoryMfaSettings,
      user: {
        id: 'user-id',
        logtoConfig: {},
        mfaVerifications: [
          {
            type: MfaFactor.TOTP,
            id: 'totp-id',
            key: 'totp-secret',
            createdAt: new Date(0).toISOString(),
          },
        ],
      },
    });

    const getUserMfaFactorsSpy = jest.spyOn(
      mfa as unknown as {
        getUserMfaFactors: (...args: unknown[]) => Promise<unknown>;
      },
      'getUserMfaFactors'
    );

    await mfa.assertMfaFulfilled();

    expect(getMfaSettings).toHaveBeenCalledTimes(1);
    expect(getIdentifiedUser).toHaveBeenCalledTimes(1);
    expect(getUserMfaFactorsSpy).toHaveBeenCalledTimes(1);
  });

  it('allows binding WebAuthn when passkey sign-in is enabled even if WebAuthn is not an MFA factor', async () => {
    const { mfa } = createMfa();

    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };

    jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
      passkeySignIn: { enabled: true },
    } as never);
    jest
      .spyOn(signInExperienceValidator, 'getMfaFactorsEnabledForBinding')
      .mockResolvedValue([MfaFactor.TOTP]);

    expect(async () => {
      await (
        mfa as unknown as {
          checkMfaFactorsEnabledInSignInExperience: (factors: MfaFactor[]) => Promise<void>;
        }
      ).checkMfaFactorsEnabledInSignInExperience([MfaFactor.WebAuthn]);
    }).not.toThrow();
  });

  it('returns non-skippable missing_mfa for adaptive no-skip policy', async () => {
    const adaptiveNoSkipSettings: MfaSettings = {
      policy: MfaPolicy.PromptAtSignInAndSignUpMandatory,
      factors: [MfaFactor.TOTP],
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    };

    const { mfa } = createMfa({
      mfaSettings: adaptiveNoSkipSettings,
      user: {
        id: 'user-id',
        logtoConfig: {},
        mfaVerifications: [],
      },
    });

    await expect(mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'user.missing_mfa',
      status: 422,
      data: {
        availableFactors: [MfaFactor.TOTP],
      },
    });
  });

  it('applies no skip and omits `skippable` for a no-skip mandatory requirement', async () => {
    const { mfa } = createMfa({
      // A skippable policy the user has already opted out of: only the requirement itself is
      // mandatory, and it neither suggests nor stays skippable.
      mfaSettings: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: { [userMfaDataKey]: { enabled: true, skipped: true } },
        mfaVerifications: [],
      },
    });

    const assertion = mfa.assertMfaFulfilled({ asNoSkipMandatoryPolicy: true });

    await expect(assertion).rejects.toMatchObject({
      code: 'user.missing_mfa',
      status: 422,
      data: { availableFactors: [MfaFactor.TOTP] },
    });
    await expect(assertion).rejects.not.toHaveProperty('data.skippable');
  });

  it('enforces MFA for a user required to set up MFA regardless of policy and prior skip', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.NoPrompt,
        factors: [MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: {
          [userMfaDataKey]: { enabled: false, skipped: true, required: true },
        },
        mfaVerifications: [],
      },
    });

    const assertion = mfa.assertMfaFulfilled();

    await expect(assertion).rejects.toMatchObject({
      code: 'user.missing_mfa',
      status: 422,
      data: { availableFactors: [MfaFactor.TOTP] },
    });
    await expect(assertion).rejects.not.toHaveProperty('data.skippable');
  });

  it('bypasses the optional MFA suggestion when the user is required to set up MFA', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: { [userMfaDataKey]: { enabled: false, required: true } },
        mfaVerifications: [],
      },
    });

    await expect(mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'user.missing_mfa',
      status: 422,
      data: { availableFactors: [MfaFactor.TOTP] },
    });
  });

  it('does not enforce a user requirement when no MFA factors are enabled', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: { [userMfaDataKey]: { required: true } },
        mfaVerifications: [],
      },
    });

    await expect(mfa.assertMfaFulfilled()).resolves.toBeUndefined();
  });

  it('honors the policy skips and marks the requirement skippable without the option', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: { [userMfaDataKey]: { enabled: true } },
        mfaVerifications: [],
      },
    });

    await expect(mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'user.missing_mfa',
      status: 422,
      data: { availableFactors: [MfaFactor.TOTP], skippable: true },
    });
  });

  it('keeps optional MFA suggestion data independent from trusted-device state', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.PromptOnlyAtSignIn,
        factors: [MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: { [userMfaDataKey]: { enabled: false } },
        mfaVerifications: [],
      },
    });

    await expect(mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'user.suggest_mfa',
      status: 422,
      data: undefined,
    });
  });

  it('reuses loaded organization rows for MFA policy checks', async () => {
    const organizations = [
      { isMfaRequired: true, isTrustedDeviceAllowed: false },
    ] as unknown as Readonly<OrganizationWithRoles[]>;
    const { mfa, getOrganizationsByUserId } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.NoPrompt,
        factors: [MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
      },
      organizations,
    });

    const assertion = mfa.assertMfaFulfilled();

    await expect(assertion).rejects.toMatchObject({
      code: 'user.missing_mfa',
      data: { availableFactors: [MfaFactor.TOTP] },
    });
    await expect(assertion).rejects.not.toHaveProperty('data.trustedDevice');
    expect(getOrganizationsByUserId).toHaveBeenCalledTimes(1);
  });

  it('keeps additional-factor suggestion data independent from trusted-device state', async () => {
    const organizations = [
      { isMfaRequired: false, isTrustedDeviceAllowed: true },
    ] as unknown as Readonly<OrganizationWithRoles[]>;
    const { mfa } = createMfa({
      interactionEvent: InteractionEvent.Register,
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.Mandatory,
      },
      organizations,
      user: {
        id: 'user-id',
        logtoConfig: {},
        primaryEmail: 'foo@example.com',
        mfaVerifications: [],
      },
    });
    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };
    jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
      signUp: { identifiers: [SignInIdentifier.Email] },
      passkeySignIn: { enabled: false },
    } as never);

    const assertion = mfa.assertMfaFulfilled();

    await expect(assertion).rejects.toMatchObject({
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      data: {
        availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
      },
    });
    await expect(assertion).rejects.not.toHaveProperty('data.trustedDevice');
  });

  it('skips additional MFA suggestion when user has persisted skipped flag', async () => {
    const mandatoryMfaSettings: MfaSettings = {
      policy: MfaPolicy.Mandatory,
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    };

    const { mfa } = createMfa({
      interactionEvent: InteractionEvent.Register,
      mfaSettings: mandatoryMfaSettings,
      user: {
        id: 'user-id',
        logtoConfig: {
          [userMfaDataKey]: {
            additionalBindingSuggestionSkipped: true,
          },
        },
        primaryEmail: 'foo@example.com',
        mfaVerifications: [],
      },
    });

    await expect(mfa.assertMfaFulfilled()).resolves.toBeUndefined();
  });

  it.each([
    {
      trigger: 'sign-up email',
      interactionEvent: InteractionEvent.Register,
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      user: { primaryEmail: 'foo@example.com', mfaVerifications: [] },
      signUpIdentifier: SignInIdentifier.Email,
      passkeySignInEnabled: false,
    },
    {
      trigger: 'sign-up email',
      interactionEvent: InteractionEvent.SignIn,
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      user: { primaryEmail: 'foo@example.com', mfaVerifications: [] },
      signUpIdentifier: SignInIdentifier.Email,
      passkeySignInEnabled: false,
    },
    {
      trigger: 'sign-up phone',
      interactionEvent: InteractionEvent.Register,
      factors: [MfaFactor.PhoneVerificationCode, MfaFactor.TOTP],
      user: { primaryPhone: '13000000000', mfaVerifications: [] },
      signUpIdentifier: SignInIdentifier.Phone,
      passkeySignInEnabled: false,
    },
    {
      trigger: 'passkey sign-in',
      interactionEvent: InteractionEvent.SignIn,
      factors: [MfaFactor.WebAuthn, MfaFactor.TOTP],
      user: {
        mfaVerifications: [
          {
            id: 'webauthn-id',
            type: MfaFactor.WebAuthn,
            credentialId: 'credential-id',
            publicKey: 'public-key',
            counter: 0,
            agent: 'agent',
            createdAt: new Date(0).toISOString(),
          },
        ],
      },
      signUpIdentifier: SignInIdentifier.Username,
      passkeySignInEnabled: true,
    },
  ] satisfies Array<{
    trigger: string;
    interactionEvent: InteractionEvent;
    factors: MfaFactor[];
    user: Partial<User>;
    signUpIdentifier: SignInIdentifier;
    passkeySignInEnabled: boolean;
  }>)(
    'stops suggesting additional MFA after $trigger on $interactionEvent when the tenant skips it',
    async ({ interactionEvent, factors, user, signUpIdentifier, passkeySignInEnabled }) => {
      const assertMfaFulfilled = async (skipAdditionalBindingSuggestion: boolean) => {
        const { mfa } = createMfa({
          interactionEvent,
          mfaSettings: {
            policy: MfaPolicy.Mandatory,
            factors,
            organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
            skipAdditionalBindingSuggestion,
          },
          user: { id: 'user-id', logtoConfig: {}, ...user },
        });
        const { signInExperienceValidator } = mfa as unknown as {
          signInExperienceValidator: SignInExperienceValidator;
        };
        jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
          signUp: { identifiers: [signUpIdentifier] },
          passkeySignIn: { enabled: passkeySignInEnabled },
        } as never);

        return mfa.assertMfaFulfilled();
      };

      // The same user and settings are suggested another factor while the tenant allows it.
      await expect(assertMfaFulfilled(false)).rejects.toMatchObject({
        code: 'session.mfa.suggest_additional_mfa',
      });
      await expect(assertMfaFulfilled(true)).resolves.toBeUndefined();
    }
  );

  it('still requires backup codes when the tenant skips the additional MFA suggestion', async () => {
    const { mfa } = createMfa({
      interactionEvent: InteractionEvent.Register,
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP, MfaFactor.BackupCode],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
        skipAdditionalBindingSuggestion: true,
      },
      user: {
        id: 'user-id',
        logtoConfig: {},
        primaryEmail: 'foo@example.com',
        mfaVerifications: [],
      },
    });
    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };
    jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
      signUp: { identifiers: [SignInIdentifier.Email] },
      passkeySignIn: { enabled: false },
    } as never);

    await expect(mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'session.mfa.backup_code_required',
      status: 422,
    });
  });

  it('does not suggest additional MFA on sign-in when existing factors were not verified', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      interactionEvent: InteractionEvent.SignIn,
      user: {
        id: 'user-id',
        logtoConfig: {},
        primaryEmail: 'foo@example.com',
        mfaVerifications: [],
      },
      canBindMfa: false,
    });
    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };
    jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
      signUp: { identifiers: [SignInIdentifier.Email] },
      passkeySignIn: { enabled: false },
    } as never);

    await expect(mfa.assertMfaFulfilled()).resolves.toBeUndefined();
  });

  it('suggests additional MFA on sign-in after an existing factor was verified', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      interactionEvent: InteractionEvent.SignIn,
      user: {
        id: 'user-id',
        logtoConfig: {},
        primaryEmail: 'foo@example.com',
        mfaVerifications: [],
      },
      canBindMfa: true,
    });
    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };
    jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
      signUp: { identifiers: [SignInIdentifier.Email] },
      passkeySignIn: { enabled: false },
    } as never);

    await expect(mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      data: {
        availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
      },
    });
  });

  it('does not require backup codes on a sign-in that may not bind MFA', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      interactionEvent: InteractionEvent.SignIn,
      user: {
        id: 'user-id',
        logtoConfig: {},
        mfaVerifications: [
          {
            id: 'totp-id',
            type: MfaFactor.TOTP,
            key: 'totp-secret',
            createdAt: new Date(0).toISOString(),
          },
        ],
      },
      canBindMfa: false,
    });

    await expect(mfa.assertMfaFulfilled()).resolves.toBeUndefined();
  });

  it('requires backup codes when the sign-in may bind MFA', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      interactionEvent: InteractionEvent.SignIn,
      user: {
        id: 'user-id',
        logtoConfig: {},
        mfaVerifications: [
          {
            id: 'totp-id',
            type: MfaFactor.TOTP,
            key: 'totp-secret',
            createdAt: new Date(0).toISOString(),
          },
        ],
      },
      canBindMfa: true,
    });

    await expect(mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'session.mfa.backup_code_required',
      status: 422,
    });
  });
});

describe('Mfa.skip', () => {
  it('rejects skip for adaptive no-skip policies', async () => {
    const adaptiveNoSkipSettings: MfaSettings = {
      policy: MfaPolicy.PromptOnlyAtSignInMandatory,
      factors: [MfaFactor.TOTP],
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    };

    const { mfa } = createMfa({
      mfaSettings: adaptiveNoSkipSettings,
      user: {
        id: 'user-id',
        logtoConfig: {},
        mfaVerifications: [],
      },
    });

    await expect(mfa.skip()).rejects.toMatchObject({
      code: 'session.mfa.mfa_policy_not_user_controlled',
      status: 422,
    });
  });

  it('rejects skip when the user is required to set up MFA', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: { [userMfaDataKey]: { required: true } },
        mfaVerifications: [],
      },
    });

    await expect(mfa.skip()).rejects.toMatchObject({
      code: 'session.mfa.mfa_policy_not_user_controlled',
      status: 422,
    });
  });

  it('allows skip when no MFA factors are enabled even if the user is required', async () => {
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [],
        organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
      },
      user: {
        id: 'user-id',
        logtoConfig: { [userMfaDataKey]: { required: true } },
        mfaVerifications: [],
      },
    });

    await expect(mfa.skip()).resolves.toBeUndefined();
  });
});

const createPasskeyMfa = (canBindMfa: boolean) => {
  const { mfa } = createMfa({
    interactionEvent: InteractionEvent.SignIn,
    user: {
      id: 'user-id',
      logtoConfig: {},
      mfaVerifications: [],
    },
    canBindMfa,
  });
  const { signInExperienceValidator } = mfa as unknown as {
    signInExperienceValidator: SignInExperienceValidator;
  };
  jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
    passkeySignIn: { enabled: true },
  } as never);

  return mfa;
};

describe('Mfa.assertPasskeySignInFulfilled', () => {
  it('does not prompt when the sign-in may not bind MFA', async () => {
    await expect(createPasskeyMfa(false).assertPasskeySignInFulfilled()).resolves.toBeUndefined();
  });

  it('prompts when the sign-in may bind MFA', async () => {
    await expect(createPasskeyMfa(true).assertPasskeySignInFulfilled()).rejects.toMatchObject({
      code: 'user.passkey_preferred',
      status: 422,
    });
  });
});

const buildEmailRecord = ({
  value = 'foo@example.com',
  verified = true,
  userId,
}: { value?: string; verified?: boolean; userId?: string } = {}) =>
  new EmailCodeVerification({} as Libraries, {} as Queries, {
    id: 'email-verification-id',
    type: VerificationType.EmailVerificationCode,
    identifier: { type: SignInIdentifier.Email, value },
    templateType: TemplateType.BindMfa,
    verified,
    userId,
  });

const buildPhoneRecord = ({
  value = '16502530000',
  verified = true,
  userId,
}: { value?: string; verified?: boolean; userId?: string } = {}) =>
  new PhoneCodeVerification({} as Libraries, {} as Queries, {
    id: 'phone-verification-id',
    type: VerificationType.PhoneVerificationCode,
    identifier: { type: SignInIdentifier.Phone, value },
    templateType: TemplateType.BindMfa,
    verified,
    userId,
  });

const mockSignInExperience = (
  mfa: Mfa,
  { passkeyEnabled = false }: { passkeyEnabled?: boolean } = {}
) => {
  jest
    .spyOn(
      (
        mfa as unknown as {
          signInExperienceValidator: SignInExperienceValidator;
        }
      ).signInExperienceValidator,
      'getSignInExperienceData'
    )
    .mockResolvedValue({
      signUp: { identifiers: [SignInIdentifier.Email] },
      passkeySignIn: { enabled: passkeyEnabled },
    } as never);
};

describe('Email and Phone MFA explicit enrollment', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists staged email/phone records and hides them from sanitizedData', () => {
    const { mfa } = createMfa({
      mfaData: { emailVerificationCode: true, phoneVerificationCode: true },
    });

    expect(mfa.data).toMatchObject({
      emailVerificationCode: true,
      phoneVerificationCode: true,
    });
    expect(mfa.sanitizedData).not.toHaveProperty('emailVerificationCode');
    expect(mfa.sanitizedData).not.toHaveProperty('phoneVerificationCode');

    const enabledResult = mfa.toUserMfaVerifications();
    const [firstVerification, secondVerification] = enabledResult.mfaVerifications;
    expect(enabledResult.mfaVerifications).toHaveLength(2);
    expect(firstVerification).toMatchObject({ type: MfaFactor.EmailVerificationCode });
    expect(typeof firstVerification?.id).toBe('string');
    expect(typeof firstVerification?.createdAt).toBe('string');
    expect(firstVerification).not.toHaveProperty('lastUsedAt');
    expect(secondVerification).toMatchObject({ type: MfaFactor.PhoneVerificationCode });
    expect(typeof secondVerification?.id).toBe('string');
    expect(typeof secondVerification?.createdAt).toBe('string');

    mfa.cleanUp();
    expect(mfa.stagedVerificationCodeFactors).toEqual([]);
  });

  it('matches existing primary email case-insensitively and existing primary phone after normalization', async () => {
    const emailRecord = buildEmailRecord({ value: 'FOO@EXAMPLE.COM' });
    const phoneRecord = buildPhoneRecord({ value: '+1 (650) 253-0000', userId: 'user-id' });
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
      },
      user: {
        id: 'user-id',
        primaryEmail: 'foo@example.com',
        primaryPhone: '16502530000',
        logtoConfig: {},
        mfaVerifications: [],
      },
      consumeForBindByType: ((type: VerificationType) =>
        type === VerificationType.EmailVerificationCode
          ? emailRecord
          : phoneRecord) as unknown as InteractionContext['consumeForBindByType'],
    });
    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };
    jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
      passkeySignIn: { enabled: false },
    } as never);

    const append = jest.fn();
    await expect(
      mfa.addVerificationCodeByVerificationId(MfaFactor.EmailVerificationCode, emailRecord.id, {
        append,
      } as never)
    ).resolves.toEqual({
      identifierValue: 'FOO@EXAMPLE.COM',
      isExistingPrimaryIdentifier: true,
    });
    expect(append).toHaveBeenCalledWith({ verification: emailRecord.toJson() });

    await expect(
      mfa.addVerificationCodeByVerificationId(MfaFactor.PhoneVerificationCode, phoneRecord.id)
    ).resolves.toEqual({
      identifierValue: '+1 (650) 253-0000',
      isExistingPrimaryIdentifier: true,
    });
    expect(mfa.stagedVerificationCodeFactors).toEqual([
      MfaFactor.EmailVerificationCode,
      MfaFactor.PhoneVerificationCode,
    ]);
  });

  it('treats verification code enrollment as a profile update when the value differs from the primary identifier', async () => {
    const emailRecord = buildEmailRecord({ value: 'other@example.com' });
    const { mfa } = createMfa({
      mfaSettings: {
        policy: MfaPolicy.Mandatory,
        factors: [MfaFactor.EmailVerificationCode],
      },
      user: {
        id: 'user-id',
        primaryEmail: 'foo@example.com',
        logtoConfig: {},
        mfaVerifications: [],
      },
      consumeForBindByType: (() =>
        emailRecord) as unknown as InteractionContext['consumeForBindByType'],
    });
    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };
    jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
      passkeySignIn: { enabled: false },
    } as never);

    await expect(
      mfa.addVerificationCodeByVerificationId(MfaFactor.EmailVerificationCode, emailRecord.id)
    ).resolves.toEqual({
      identifierValue: 'other@example.com',
      isExistingPrimaryIdentifier: false,
    });
  });

  it('rejects disabled factors, unverified records, and mismatched userIds when adding verification code MFA', async () => {
    const buildWithRecord = (record: EmailCodeVerification, factors = [MfaFactor.TOTP]) => {
      const { mfa } = createMfa({
        mfaSettings: {
          policy: MfaPolicy.Mandatory,
          factors,
        },
        user: {
          id: 'user-id',
          primaryEmail: 'foo@example.com',
          logtoConfig: {},
          mfaVerifications: [],
        },
        consumeForBindByType: (() =>
          record) as unknown as InteractionContext['consumeForBindByType'],
      });
      const { signInExperienceValidator } = mfa as unknown as {
        signInExperienceValidator: SignInExperienceValidator;
      };
      jest.spyOn(signInExperienceValidator, 'getSignInExperienceData').mockResolvedValue({
        passkeySignIn: { enabled: false },
      } as never);
      return mfa;
    };

    await expect(
      buildWithRecord(buildEmailRecord(), [MfaFactor.TOTP]).addVerificationCodeByVerificationId(
        MfaFactor.EmailVerificationCode,
        'email-verification-id'
      )
    ).rejects.toMatchObject({ code: 'session.mfa.mfa_factor_not_enabled' });

    await expect(
      buildWithRecord(buildEmailRecord({ verified: false }), [
        MfaFactor.EmailVerificationCode,
      ]).addVerificationCodeByVerificationId(
        MfaFactor.EmailVerificationCode,
        'email-verification-id'
      )
    ).rejects.toMatchObject({ code: 'session.verification_failed' });

    await expect(
      buildWithRecord(buildEmailRecord({ userId: 'other-user-id' }), [
        MfaFactor.EmailVerificationCode,
      ]).addVerificationCodeByVerificationId(
        MfaFactor.EmailVerificationCode,
        'email-verification-id'
      )
    ).rejects.toMatchObject({
      code: 'session.verification_session_not_found',
      status: 404,
    });
  });

  it('includes maskedIdentifiers on user.missing_mfa in explicit mode', async () => {
    const mfaSettings: MfaSettings = {
      policy: MfaPolicy.Mandatory,
      factors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
      verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    };
    const user: Partial<User> = {
      id: 'user-id',
      primaryEmail: 'alice@logto.io',
      primaryPhone: '16502530000',
      logtoConfig: {},
      mfaVerifications: [],
    };

    await expect(createMfa({ mfaSettings, user }).mfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'user.missing_mfa',
      status: 422,
      data: {
        availableFactors: [
          MfaFactor.TOTP,
          MfaFactor.EmailVerificationCode,
          MfaFactor.PhoneVerificationCode,
        ],
        maskedIdentifiers: {
          [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
          [MfaFactor.PhoneVerificationCode]: '****0000',
        },
      },
    });
  });

  it('suggests another MFA factor in explicit mode only when a dual-purpose factor was bound in this session', async () => {
    const explicitSettings: MfaSettings = {
      policy: MfaPolicy.Mandatory,
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    };

    // Binding EmailVerificationCode for a new address (username sign-up) triggers the suggestion
    // with the masked staged email even when `signUp.identifiers` does not include Email.
    const { mfa: enrolledEmailMfa } = createMfa({
      mfaSettings: explicitSettings,
      mfaData: { emailVerificationCode: true },
      user: { id: 'user-id', primaryEmail: null, logtoConfig: {}, mfaVerifications: [] },
      currentProfile: { primaryEmail: 'new@logto.io' },
    });
    jest
      .spyOn(
        (
          enrolledEmailMfa as unknown as {
            signInExperienceValidator: SignInExperienceValidator;
          }
        ).signInExperienceValidator,
        'getSignInExperienceData'
      )
      .mockResolvedValue({
        signUp: { identifiers: [SignInIdentifier.Username] },
        passkeySignIn: { enabled: false },
      } as never);

    await expect(enrolledEmailMfa.assertMfaFulfilled()).rejects.toMatchObject({
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      data: {
        availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
        maskedIdentifiers: { [MfaFactor.EmailVerificationCode]: '****@logto.io' },
        boundFactors: [MfaFactor.EmailVerificationCode],
        skippable: true,
        suggestion: true,
      },
    });

    // Previously stored EmailVerificationCode without session binding does not re-suggest.
    const { mfa: previouslyEnrolledMfa } = createMfa({
      mfaSettings: explicitSettings,
      user: {
        id: 'user-id',
        primaryEmail: 'old@logto.io',
        logtoConfig: {},
        mfaVerifications: [
          {
            id: 'email-mfa-1',
            type: MfaFactor.EmailVerificationCode,
            createdAt: new Date(0).toISOString(),
          },
        ],
      },
    });
    jest
      .spyOn(
        (
          previouslyEnrolledMfa as unknown as {
            signInExperienceValidator: SignInExperienceValidator;
          }
        ).signInExperienceValidator,
        'getSignInExperienceData'
      )
      .mockResolvedValue({
        signUp: { identifiers: [SignInIdentifier.Username] },
        passkeySignIn: { enabled: false },
      } as never);

    await expect(previouslyEnrolledMfa.assertMfaFulfilled()).resolves.toBeUndefined();

    // Binding sign-in passkey in explicit mode triggers the suggestion; plain WebAuthn without
    // passkey sign-in does not.
    const webAuthnBind = {
      type: MfaFactor.WebAuthn as const,
      rpId: 'logto.dev',
      credentialId: 'cred-1',
      publicKey: 'pub-1',
      transports: [],
      counter: 0,
      agent: 'agent',
    };
    const buildPasskeyExplicit = (passkeyEnabled: boolean) => {
      const { mfa } = createMfa({
        mfaSettings: {
          policy: MfaPolicy.Mandatory,
          factors: [MfaFactor.WebAuthn, MfaFactor.TOTP],
          verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
          organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
        },
        mfaData: { webAuthn: [webAuthnBind] },
      });
      jest
        .spyOn(
          (
            mfa as unknown as {
              signInExperienceValidator: SignInExperienceValidator;
            }
          ).signInExperienceValidator,
          'getSignInExperienceData'
        )
        .mockResolvedValue({
          signUp: { identifiers: [SignInIdentifier.Username] },
          passkeySignIn: { enabled: passkeyEnabled },
        } as never);
      return mfa;
    };

    await expect(buildPasskeyExplicit(true).assertMfaFulfilled()).rejects.toMatchObject({
      code: 'session.mfa.suggest_additional_mfa',
      data: { isWebAuthnUsedAsSignInPasskey: true },
    });
    await expect(buildPasskeyExplicit(false).assertMfaFulfilled()).resolves.toBeUndefined();
  });

  it('exposes unenrolled primary identifiers and boundFactors on suggest_additional_mfa in explicit mode', async () => {
    const user: Partial<User> = {
      id: 'user-id',
      primaryEmail: 'alice@logto.io',
      primaryPhone: '16502530000',
      logtoConfig: {},
      mfaVerifications: [],
    };
    const buildExplicitMfa = (
      factors: MfaFactor[],
      mfaData: MfaData,
      options?: { passkeyEnabled?: boolean }
    ) => {
      const { mfa } = createMfa({
        mfaSettings: {
          policy: MfaPolicy.Mandatory,
          factors,
          verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
          organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
        },
        mfaData,
        user,
      });
      mockSignInExperience(mfa, options);
      return mfa;
    };

    // Enrolling EmailVerificationCode when the user also has an unenrolled primaryPhone exposes
    // both masked identifiers while marking only EmailVerificationCode as bound.
    await expect(
      buildExplicitMfa(
        [MfaFactor.TOTP, MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
        { emailVerificationCode: true }
      ).assertMfaFulfilled()
    ).rejects.toMatchObject({
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      data: {
        availableFactors: [
          MfaFactor.TOTP,
          MfaFactor.PhoneVerificationCode,
          MfaFactor.EmailVerificationCode,
        ],
        maskedIdentifiers: {
          [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
          [MfaFactor.PhoneVerificationCode]: '****0000',
        },
        boundFactors: [MfaFactor.EmailVerificationCode],
      },
    });

    // Does not expose PhoneVerificationCode in maskedIdentifiers when Phone MFA is not offered.
    const withoutPhoneAssertion = buildExplicitMfa(
      [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
      { emailVerificationCode: true }
    ).assertMfaFulfilled();
    await expect(withoutPhoneAssertion).rejects.toMatchObject({
      code: 'session.mfa.suggest_additional_mfa',
      data: {
        maskedIdentifiers: { [MfaFactor.EmailVerificationCode]: 'alic****@logto.io' },
        boundFactors: [MfaFactor.EmailVerificationCode],
      },
    });
    await expect(withoutPhoneAssertion).rejects.not.toHaveProperty([
      'data',
      'maskedIdentifiers',
      MfaFactor.PhoneVerificationCode,
    ]);

    // Binding a sign-in passkey first exposes both unenrolled email and phone primary identifiers.
    const webAuthnBind = {
      type: MfaFactor.WebAuthn as const,
      rpId: 'logto.dev',
      credentialId: 'cred-1',
      publicKey: 'pub-1',
      transports: [],
      counter: 0,
      agent: 'agent',
    };
    await expect(
      buildExplicitMfa(
        [MfaFactor.WebAuthn, MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
        { webAuthn: [webAuthnBind] },
        { passkeyEnabled: true }
      ).assertMfaFulfilled()
    ).rejects.toMatchObject({
      code: 'session.mfa.suggest_additional_mfa',
      status: 422,
      data: {
        maskedIdentifiers: {
          [MfaFactor.EmailVerificationCode]: 'alic****@logto.io',
          [MfaFactor.PhoneVerificationCode]: '****0000',
        },
        boundFactors: [MfaFactor.WebAuthn],
        isWebAuthnUsedAsSignInPasskey: true,
      },
    });
  });
});
/* eslint-enable max-lines */
