import {
  InteractionEvent,
  MfaFactor,
  type Mfa as MfaSettings,
  MfaPolicy,
  type OrganizationWithRoles,
  OrganizationRequiredMfaPolicy,
  SignInIdentifier,
  userMfaDataKey,
  type User,
} from '@logto/schemas';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';

import { type InteractionContext } from '../types.js';

import { type SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';
import { Mfa } from './mfa.js';

const { jest } = import.meta;

const createMfa = ({
  mfaSettings = {
    policy: MfaPolicy.NoPrompt,
    factors: [],
    organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
  },
  interactionEvent = InteractionEvent.SignIn,
  user = {
    id: 'user-id',
    logtoConfig: {},
    mfaVerifications: [],
  },
  currentProfile = {},
  organizations = [],
}: {
  mfaSettings?: MfaSettings;
  interactionEvent?: InteractionEvent;
  user?: Partial<User>;
  currentProfile?: Record<string, unknown>;
  organizations?: Readonly<OrganizationWithRoles[]>;
} = {}) => {
  const getIdentifiedUser = jest.fn(async () => user as User);
  const interactionContext: InteractionContext = {
    getInteractionEvent: () => interactionEvent,
    getIdentifiedUser,
    consumeForBind: () => {
      throw new Error('should not be called');
    },
    consumeForBindByType: () => {
      throw new Error('should not be called');
    },
    recordEstablishedPassword: () => {
      throw new Error('should not be called');
    },
    getCurrentProfile: () => currentProfile,
  };

  const getOrganizationsByUserId = jest.fn(async () => organizations);
  const queries = {
    organizations: { relations: { users: { getOrganizationsByUserId } } },
  } as unknown as Queries;
  const mfa = new Mfa({} as Libraries, queries, {}, interactionContext);
  const { signInExperienceValidator } = mfa as unknown as {
    signInExperienceValidator: SignInExperienceValidator;
  };
  const getMfaSettings = jest
    .spyOn(signInExperienceValidator, 'getMfaSettings')
    .mockResolvedValue(mfaSettings);
  const getConfiguredMfaFactors = jest
    .spyOn(signInExperienceValidator, 'getConfiguredMfaFactors')
    .mockResolvedValue(mfaSettings.factors.filter((factor) => factor !== MfaFactor.BackupCode));

  return {
    mfa,
    getIdentifiedUser,
    getMfaSettings,
    getConfiguredMfaFactors,
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

    expect(mandatorySpy).toHaveBeenCalledWith(expect.any(Object));
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
});
