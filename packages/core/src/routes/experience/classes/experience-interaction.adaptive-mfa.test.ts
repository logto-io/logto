/* eslint-disable max-lines */
import { InteractionEvent, MfaFactor, MfaPolicy, type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import { type Optional } from '@silverhand/essentials';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../types.js';

import { type TriggeredRule } from './libraries/adaptive-mfa-validator/types.js';
import { MfaValidator } from './libraries/mfa-validator.js';

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
};

const tenant = new MockTenant(undefined, { signInExperiences, users });

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

  it('logs MFA requirement metadata via logMfaRequirement', () => {
    const mfaSettings = {
      policy: MfaPolicy.PromptAtSignInAndSignUp,
      factors: [MfaFactor.TOTP],
    };
    const adaptiveMfaResult = { requiresMfa: true, triggeredRules: [] };
    const mfaValidator = new MfaValidator(
      mfaSettings,
      mockUserWithMfaVerifications,
      adaptiveMfaResult
    );
    const mockLog = { append: jest.fn() };
    // @ts-expect-error -- mock log entry
    mfaValidator.logMfaRequirement(mockLog);
    expect(mockLog.append).toHaveBeenCalledWith({
      adaptiveMfaResult,
      mfaRequirement: { required: true, source: 'adaptive' },
    });
  });

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

  it('allows sign-in when adaptive MFA triggers but user has no supported factors', async () => {
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

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();
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
