import { InteractionEvent, MfaFactor, MfaPolicy, type User } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type WithHooksAndLogsContext } from '../types.js';

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

  it('computes MFA requirement based on adaptive decision only', () => {
    const cases = [
      // Adaptive MFA enabled: only requires MFA when triggered and user has MFA.
      { adaptive: true, requires: false, hasMfa: false, fallbackRequired: false },
      { adaptive: true, requires: false, hasMfa: false, fallbackRequired: true },
      { adaptive: true, requires: false, hasMfa: true, fallbackRequired: false },
      { adaptive: true, requires: false, hasMfa: true, fallbackRequired: true },
      { adaptive: true, requires: true, hasMfa: false, fallbackRequired: false },
      { adaptive: true, requires: true, hasMfa: false, fallbackRequired: true },
      { adaptive: true, requires: true, hasMfa: true, fallbackRequired: false },
      { adaptive: true, requires: true, hasMfa: true, fallbackRequired: true },
      // Adaptive MFA disabled: fall back to policy requirement.
      { adaptive: false, requires: false, hasMfa: true, fallbackRequired: false },
      { adaptive: false, requires: false, hasMfa: true, fallbackRequired: true },
    ];

    for (const testCase of cases) {
      const { adaptive, requires, hasMfa, fallbackRequired } = testCase;
      const result = ExperienceInteraction.getMfaRequirement(
        adaptive,
        requires,
        hasMfa,
        fallbackRequired
      );

      if (adaptive) {
        if (requires && hasMfa) {
          expect(result).toEqual({ required: true, source: 'adaptive' });
        } else if (requires && !hasMfa) {
          expect(result).toEqual({ required: false, source: 'adaptive' });
        } else {
          expect(result).toEqual({ required: false, source: 'none' });
        }
      } else {
        expect(result).toEqual({
          required: fallbackRequired,
          source: fallbackRequired ? 'policy' : 'none',
        });
      }
    }
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
