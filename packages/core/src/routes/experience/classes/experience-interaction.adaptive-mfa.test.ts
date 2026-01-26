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
});
