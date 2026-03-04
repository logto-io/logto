import {
  InteractionEvent,
  MfaFactor,
  type Mfa as MfaSettings,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
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
  user = {
    id: 'user-id',
    logtoConfig: {},
    mfaVerifications: [],
  },
  currentProfile = {},
}: {
  mfaSettings?: MfaSettings;
  user?: Partial<User>;
  currentProfile?: Record<string, unknown>;
} = {}) => {
  const getIdentifiedUser = jest.fn(async () => user as User);
  const interactionContext: InteractionContext = {
    getInteractionEvent: () => InteractionEvent.SignIn,
    getIdentifiedUser,
    getVerificationRecordById: () => {
      throw new Error('should not be called');
    },
    getVerificationRecordByTypeAndId: () => {
      throw new Error('should not be called');
    },
    getCurrentProfile: () => currentProfile,
  };

  const mfa = new Mfa({} as Libraries, {} as Queries, {}, interactionContext);
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

  it('does not trigger additional binding suggestion in sign-in flow', async () => {
    const mandatoryMfaSettings: MfaSettings = {
      policy: MfaPolicy.Mandatory,
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.TOTP],
      organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
    };

    const { mfa } = createMfa({
      mfaSettings: mandatoryMfaSettings,
      user: {
        id: 'user-id',
        logtoConfig: {},
        mfaVerifications: [],
        primaryEmail: 'bound@logto.dev',
        primaryPhone: null,
      },
    });

    const { signInExperienceValidator } = mfa as unknown as {
      signInExperienceValidator: SignInExperienceValidator;
    };

    const getSignInExperienceDataSpy = jest.spyOn(
      signInExperienceValidator,
      'getSignInExperienceData'
    );

    await expect(mfa.assertMfaFulfilled()).resolves.toBeUndefined();

    expect(getSignInExperienceDataSpy).not.toHaveBeenCalled();
  });
});
