/* eslint-disable max-lines */
import {
  InteractionEvent,
  InteractionHookEvent,
  MfaFactor,
  MfaPolicy,
  VerificationType,
  type User,
  userMfaDataKey,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { type Optional } from '@silverhand/essentials';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../types.js';

import { type TriggeredRule } from './libraries/adaptive-mfa-validator/types.js';
import { MfaValidator } from './libraries/mfa-validator.js';
import { SignInWebAuthnVerification } from './verifications/web-authn-verification.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const mockEnvSetValues = {
  isDevFeaturesEnabled: true,
};

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    values: mockEnvSetValues,
  },
}));

const signInExperiences = {
  findDefaultSignInExperience: jest.fn().mockResolvedValue({
    ...mockSignInExperience,
    adaptiveMfa: { enabled: true },
    mfa: {
      policy: MfaPolicy.PromptAtSignInAndSignUp,
      factors: [MfaFactor.TOTP],
    },
  }),
};

const users = {
  findUserById: jest.fn(),
  updateUserById: jest.fn(),
  hasUser: jest.fn().mockResolvedValue(false),
  hasUserWithEmail: jest.fn().mockResolvedValue(false),
  hasUserWithNormalizedPhone: jest.fn().mockResolvedValue(false),
  hasUserWithIdentity: jest.fn().mockResolvedValue(false),
};

const tenant = new MockTenant(createMockProvider(), { signInExperiences, users });

const ExperienceInteraction = await pickDefault(import('./experience-interaction.js'));

describe('ExperienceInteraction adaptive MFA', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockEnvSetValues.isDevFeaturesEnabled = true;
  });

  // Truth table for MfaValidator.isMfaRequired
  // Columns: adaptiveMfaResult | hasMfa | skipMfaOnSignIn | expected isMfaRequired
  it.each<{
    adaptiveMfaResult: Optional<{ requiresMfa: boolean; triggeredRules: TriggeredRule[] }>;
    hasMfa: boolean;
    skipMfaOnSignIn: boolean;
    expected: boolean;
  }>([
    // Adaptive MFA enabled and triggered
    {
      adaptiveMfaResult: { requiresMfa: true, triggeredRules: [] },
      hasMfa: true,
      skipMfaOnSignIn: false,
      expected: true,
    },
    {
      adaptiveMfaResult: { requiresMfa: true, triggeredRules: [] },
      hasMfa: true,
      skipMfaOnSignIn: true,
      expected: true,
    },
    {
      adaptiveMfaResult: { requiresMfa: true, triggeredRules: [] },
      hasMfa: false,
      skipMfaOnSignIn: false,
      expected: false,
    },
    {
      adaptiveMfaResult: { requiresMfa: true, triggeredRules: [] },
      hasMfa: false,
      skipMfaOnSignIn: true,
      expected: false,
    },
    // Adaptive MFA enabled but not triggered
    {
      adaptiveMfaResult: { requiresMfa: false, triggeredRules: [] },
      hasMfa: true,
      skipMfaOnSignIn: false,
      expected: false,
    },
    {
      adaptiveMfaResult: { requiresMfa: false, triggeredRules: [] },
      hasMfa: true,
      skipMfaOnSignIn: true,
      expected: false,
    },
    {
      adaptiveMfaResult: { requiresMfa: false, triggeredRules: [] },
      hasMfa: false,
      skipMfaOnSignIn: false,
      expected: false,
    },
    {
      adaptiveMfaResult: { requiresMfa: false, triggeredRules: [] },
      hasMfa: false,
      skipMfaOnSignIn: true,
      expected: false,
    },
    // Adaptive MFA disabled (fallback to policy)
    { adaptiveMfaResult: undefined, hasMfa: true, skipMfaOnSignIn: false, expected: true },
    { adaptiveMfaResult: undefined, hasMfa: true, skipMfaOnSignIn: true, expected: false },
    { adaptiveMfaResult: undefined, hasMfa: false, skipMfaOnSignIn: false, expected: false },
    { adaptiveMfaResult: undefined, hasMfa: false, skipMfaOnSignIn: true, expected: false },
  ])(
    'isMfaRequired: adaptive=$adaptiveMfaResult, hasMfa=$hasMfa, skip=$skipMfaOnSignIn → $expected',
    ({ adaptiveMfaResult, hasMfa, skipMfaOnSignIn, expected }) => {
      const mfaSettings = {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
      };
      const user: User = {
        ...mockUserWithMfaVerifications,
        mfaVerifications: hasMfa ? mockUserWithMfaVerifications.mfaVerifications : [],
        logtoConfig: skipMfaOnSignIn ? { mfa: { skipMfaOnSignIn: true } } : {},
      };
      const mfaValidator = new MfaValidator(mfaSettings, user, adaptiveMfaResult);
      expect(mfaValidator.isMfaRequired).toBe(expected);
    }
  );

  it('requires MFA even when skipMfaOnSignIn is true if adaptive MFA triggers', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {
        mfa: {
          skipMfaOnSignIn: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);
    const { createLog } = createMockLogContext();
    const log = createLog('Interaction.SignIn.Submit');

    await expect(experienceInteraction.guardMfaVerificationStatus(log)).rejects.toMatchError(
      new RequestError(
        { code: 'session.mfa.require_mfa_verification', status: 403 },
        {
          availableFactors: [MfaFactor.TOTP],
          maskedIdentifiers: {},
        }
      )
    );

    expect(ctx.assignInteractionHookResult).toHaveBeenCalledWith({
      event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
      payload: {
        adaptiveMfaResult: expect.objectContaining({
          requiresMfa: true,
          triggeredRules: expect.arrayContaining([
            expect.objectContaining({ rule: 'untrusted_ip' }),
          ]) as unknown,
        }) as unknown,
      },
      userId: user.id,
    });
  });

  it('does not require MFA verification when adaptive MFA triggers and user has no factors', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [],
      logtoConfig: {},
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);
    const { createLog } = createMockLogContext();
    const log = createLog('Interaction.SignIn.Submit');

    await expect(experienceInteraction.guardMfaVerificationStatus(log)).resolves.toBeUndefined();

    expect(ctx.assignInteractionHookResult).not.toHaveBeenCalled();
  });

  it('assigns adaptive MFA hook result even when log is not provided', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {
        mfa: {
          skipMfaOnSignIn: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).rejects.toMatchError(
      new RequestError(
        { code: 'session.mfa.require_mfa_verification', status: 403 },
        {
          availableFactors: [MfaFactor.TOTP],
          maskedIdentifiers: {},
        }
      )
    );

    expect(ctx.assignInteractionHookResult).toHaveBeenCalledWith(
      expect.objectContaining({
        event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
        userId: user.id,
      })
    );
  });

  it('allows sign-in when adaptive MFA does not trigger and skipMfaOnSignIn is true', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {
        mfa: {
          skipMfaOnSignIn: true,
        },
      },
      lastSignInAt: Date.now(),
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '99',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();
    expect(ctx.assignInteractionHookResult).not.toHaveBeenCalled();
  });

  it('allows sign-in when adaptive MFA does not trigger even if skipMfaOnSignIn is false', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {},
      lastSignInAt: Date.now(),
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '99',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();
  });

  it('does not require MFA verification when adaptive MFA triggers but user has no supported factors', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [
        {
          id: 'backup-code-id',
          type: MfaFactor.BackupCode,
          createdAt: new Date().toISOString(),
          codes: [{ code: 'mock-backup-code' }],
        },
      ],
      logtoConfig: {},
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();
    expect(ctx.assignInteractionHookResult).not.toHaveBeenCalled();
  });

  it('does not force MFA binding on submit when adaptive MFA triggers and user has no factors', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [],
      logtoConfig: {
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.submit()).resolves.toBeUndefined();
  });

  it('does not force MFA binding on submit when adaptive MFA triggers but user only has disabled factors', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [
        {
          id: 'backup-code-id',
          type: MfaFactor.BackupCode,
          createdAt: new Date().toISOString(),
          codes: [{ code: 'mock-backup-code' }],
        },
      ],
      logtoConfig: {
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);
    users.updateUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.submit()).resolves.toBeUndefined();
  });

  it('allows submit after binding TOTP in current interaction when adaptive MFA triggers', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [],
      logtoConfig: {
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);
    users.updateUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
        mfa: {
          totp: {
            type: MfaFactor.TOTP,
            secret: 'mock-secret',
          },
        },
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.submit()).resolves.toBeUndefined();
  });

  it.each([
    {
      name: 'email',
      factor: MfaFactor.EmailVerificationCode,
      profile: { primaryEmail: 'bound@logto.dev', primaryPhone: null },
    },
    {
      name: 'phone',
      factor: MfaFactor.PhoneVerificationCode,
      profile: { primaryEmail: null, primaryPhone: '13100000000' },
    },
  ])(
    'does not enforce adaptive MFA binding after binding $name MFA factor in current interaction',
    async ({ factor, profile }) => {
      const signInExperienceWithFactor = {
        ...mockSignInExperience,
        adaptiveMfa: { enabled: true },
        mfa: {
          policy: MfaPolicy.PromptAtSignInAndSignUp,
          factors: [factor],
        },
      };

      signInExperiences.findDefaultSignInExperience
        .mockResolvedValueOnce(signInExperienceWithFactor)
        .mockResolvedValueOnce(signInExperienceWithFactor)
        .mockResolvedValueOnce(signInExperienceWithFactor)
        .mockResolvedValueOnce(signInExperienceWithFactor);

      const user: User = {
        ...mockUserWithMfaVerifications,
        mfaVerifications: [],
        primaryEmail: null,
        primaryPhone: null,
        logtoConfig: {
          [userMfaDataKey]: {
            skipped: true,
          },
        },
      };

      users.findUserById.mockResolvedValueOnce(user);
      users.updateUserById.mockResolvedValueOnce(user);

      // @ts-expect-error -- mock test context
      const ctx: WithHooksAndLogsContext = {
        assignInteractionHookResult: jest.fn(),
        appendDataHookContext: jest.fn(),
        ...createContextWithRouteParameters({
          headers: {
            'x-logto-cf-bot-score': '10',
          },
        }),
        ...createMockLogContext(),
      };

      const interactionDetails = {
        result: {
          interactionEvent: InteractionEvent.SignIn,
          userId: user.id,
          profile,
        },
      } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
      const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

      await expect(experienceInteraction.submit()).resolves.toBeUndefined();
    }
  );

  it('skips submit-stage MFA fulfillment checks when sign-in passkey is already verified', async () => {
    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [],
      logtoConfig: {
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);
    users.updateUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    experienceInteraction.setVerificationRecord(
      new SignInWebAuthnVerification(tenant.libraries, tenant.queries, {
        id: 'mock-sign-in-webauthn-verification-id',
        type: VerificationType.SignInWebAuthn,
        verified: true,
        userId: user.id,
      })
    );

    await expect(experienceInteraction.submit()).resolves.toBeUndefined();
  });

  it('allows submit when adaptive MFA triggers and no MFA factors are enabled in SIE', async () => {
    signInExperiences.findDefaultSignInExperience.mockResolvedValue({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: true },
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [],
      },
    });

    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [],
      logtoConfig: {
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);
    users.updateUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.submit()).resolves.toBeUndefined();
  });

  it('does not force adaptive MFA binding on submit when dev features are disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockEnvSetValues.isDevFeaturesEnabled = false;
    const user: User = {
      ...mockUserWithMfaVerifications,
      mfaVerifications: [],
      logtoConfig: {
        [userMfaDataKey]: {
          skipped: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);
    users.updateUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.submit()).resolves.toBeUndefined();
  });

  it('keeps skipMfaOnSignIn behavior when adaptive MFA is disabled', async () => {
    signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: false },
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
      },
    });

    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {
        mfa: {
          skipMfaOnSignIn: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();
  });

  it('requires MFA when adaptive MFA is disabled and skipMfaOnSignIn is false', async () => {
    signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: false },
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
      },
    });

    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {},
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '99',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).rejects.toMatchError(
      new RequestError(
        { code: 'session.mfa.require_mfa_verification', status: 403 },
        {
          availableFactors: [MfaFactor.TOTP],
          maskedIdentifiers: {},
        }
      )
    );
  });

  it('falls back to policy when dev features are disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockEnvSetValues.isDevFeaturesEnabled = false;
    signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: true },
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
      },
    });

    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {},
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).rejects.toMatchError(
      new RequestError(
        { code: 'session.mfa.require_mfa_verification', status: 403 },
        {
          availableFactors: [MfaFactor.TOTP],
          maskedIdentifiers: {},
        }
      )
    );

    expect(ctx.assignInteractionHookResult).not.toHaveBeenCalled();
  });

  it('allows skipMfaOnSignIn when dev features are disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockEnvSetValues.isDevFeaturesEnabled = false;
    signInExperiences.findDefaultSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      adaptiveMfa: { enabled: true },
      mfa: {
        policy: MfaPolicy.PromptAtSignInAndSignUp,
        factors: [MfaFactor.TOTP],
      },
    });

    const user: User = {
      ...mockUserWithMfaVerifications,
      logtoConfig: {
        mfa: {
          skipMfaOnSignIn: true,
        },
      },
    };

    users.findUserById.mockResolvedValueOnce(user);

    // @ts-expect-error -- mock test context
    const ctx: WithHooksAndLogsContext = {
      assignInteractionHookResult: jest.fn(),
      appendDataHookContext: jest.fn(),
      ...createContextWithRouteParameters({
        headers: {
          'x-logto-cf-bot-score': '10',
        },
      }),
      ...createMockLogContext(),
    };

    const interactionDetails = {
      result: {
        interactionEvent: InteractionEvent.SignIn,
        userId: user.id,
      },
    } as unknown as ConstructorParameters<typeof ExperienceInteraction>[2];
    const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();
  });
});

/* eslint-enable max-lines */
