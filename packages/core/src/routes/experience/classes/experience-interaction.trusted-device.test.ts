import {
  InteractionEvent,
  InteractionHookEvent,
  MfaFactor,
  MfaPolicy,
  type SignInExperience,
  type TrustedDevice,
  VerificationType,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { createMockTrustedDevice } from '#src/__mocks__/trusted-device.js';
import { mockUser, mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type Interaction, type WithHooksAndLogsContext } from '../types.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    values: { isDevFeaturesEnabled: false },
  },
}));

const requiredMfaSignInExperience: SignInExperience = {
  ...mockSignInExperience,
  adaptiveMfa: { enabled: false },
  mfa: {
    policy: MfaPolicy.Mandatory,
    factors: [MfaFactor.TOTP],
  },
};

const adaptiveMfaSignInExperience: SignInExperience = {
  ...requiredMfaSignInExperience,
  adaptiveMfa: { enabled: true },
  mfa: {
    policy: MfaPolicy.PromptAtSignInAndSignUp,
    factors: [MfaFactor.TOTP],
  },
};

const findDefaultSignInExperience = jest.fn().mockResolvedValue(requiredMfaSignInExperience);
const findUserById = jest.fn().mockResolvedValue(mockUserWithMfaVerifications);
const getEffectivePolicy = jest.fn().mockResolvedValue({ enabled: true, durationDays: 30 });
const hasCredential = jest.fn().mockReturnValue(true);
const validateCredential = jest.fn();

const tenant = new MockTenant(
  createMockProvider(),
  {
    signInExperiences: { findDefaultSignInExperience },
    users: { findUserById },
  },
  undefined,
  {
    trustedDevicePolicy: { getEffectivePolicy },
    trustedDevices: { hasCredential, validateCredential },
  }
);

const trustedDevice: TrustedDevice = createMockTrustedDevice({
  tenantId: tenant.id,
  id: 'trusteddeviceid',
  userId: mockUserWithMfaVerifications.id,
});

const ExperienceInteraction = await pickDefault(import('./experience-interaction.js'));

const createInteraction = (
  interactionResult: Record<string, unknown> = {},
  headers?: Record<string, string>
) => {
  const interactionDetails = {
    jti: 'interaction-id',
    params: { client_id: 'application-id' },
    result: {
      interactionEvent: InteractionEvent.SignIn,
      userId: mockUserWithMfaVerifications.id,
      ...interactionResult,
    },
  } as unknown as Interaction;
  const ctx = {
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    appendExceptionHookContext: jest.fn(),
    ...createContextWithRouteParameters({ headers }),
    ...createMockLogContext(),
    interactionDetails,
  } as unknown as WithHooksAndLogsContext;

  return {
    ctx,
    experienceInteraction: new ExperienceInteraction(ctx, tenant, interactionDetails),
  };
};

const expectConventionalMfaRequired = async (
  experienceInteraction: InstanceType<typeof ExperienceInteraction>
) => {
  await expect(experienceInteraction.guardMfaVerificationStatus()).rejects.toMatchError(
    new RequestError(
      { code: 'session.mfa.require_mfa_verification', status: 403 },
      {
        availableFactors: [MfaFactor.TOTP],
        maskedIdentifiers: {},
      }
    )
  );
};

describe('ExperienceInteraction trusted-device MFA verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findDefaultSignInExperience.mockResolvedValue(requiredMfaSignInExperience);
    findUserById.mockResolvedValue(mockUserWithMfaVerifications);
    getEffectivePolicy.mockResolvedValue({ enabled: true, durationDays: 30 });
    hasCredential.mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps the existing no-MFA-required early exit before trusted-device evaluation', async () => {
    findUserById.mockResolvedValueOnce(mockUser);
    const { experienceInteraction } = createInteraction({ userId: mockUser.id });

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(getEffectivePolicy).not.toHaveBeenCalled();
    expect(validateCredential).not.toHaveBeenCalled();
  });

  it('keeps verified interactive MFA ahead of trusted-device evaluation', async () => {
    const { experienceInteraction } = createInteraction({
      verificationRecords: [
        {
          id: 'totp-verification-id',
          type: VerificationType.TOTP,
          verified: true,
          userId: mockUserWithMfaVerifications.id,
        },
      ],
    });

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(getEffectivePolicy).not.toHaveBeenCalled();
    expect(validateCredential).not.toHaveBeenCalled();
  });

  it('ignores legacy interaction fulfillment and revalidates the trusted-device credential', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce(adaptiveMfaSignInExperience);
    validateCredential.mockResolvedValueOnce(trustedDevice);
    const { ctx, experienceInteraction } = createInteraction(
      {
        // A pending interaction created before request-local fulfillment may still contain this field.
        trustedDeviceFulfillment: {
          userId: mockUserWithMfaVerifications.id,
          trustedDeviceId: trustedDevice.id,
          fulfilledAt: 1_786_435_200_000,
        },
      },
      { 'x-logto-cf-bot-score': '10' }
    );

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(getEffectivePolicy).toHaveBeenCalledTimes(1);
    expect(validateCredential).toHaveBeenCalledWith(ctx, mockUserWithMfaVerifications.id);
  });

  it('rechecks policy instead of reusing legacy interaction fulfillment', async () => {
    getEffectivePolicy.mockResolvedValueOnce({ enabled: false, durationDays: 30 });
    const { experienceInteraction } = createInteraction({
      trustedDeviceFulfillment: {
        userId: mockUserWithMfaVerifications.id,
        trustedDeviceId: trustedDevice.id,
        fulfilledAt: 1_786_435_200_000,
      },
    });

    await expectConventionalMfaRequired(experienceInteraction);

    expect(getEffectivePolicy).toHaveBeenCalledTimes(1);
    expect(validateCredential).not.toHaveBeenCalled();
  });

  it('skips policy and credential validation when no cookie is present', async () => {
    hasCredential.mockReturnValueOnce(false);
    const { ctx, experienceInteraction } = createInteraction();

    await expectConventionalMfaRequired(experienceInteraction);

    expect(hasCredential).toHaveBeenCalledWith(ctx, mockUserWithMfaVerifications.id);
    expect(getEffectivePolicy).not.toHaveBeenCalled();
    expect(validateCredential).not.toHaveBeenCalled();
  });

  it('falls back to conventional MFA when credential validation does not verify the guard', async () => {
    const { ctx, experienceInteraction } = createInteraction();

    await expectConventionalMfaRequired(experienceInteraction);

    expect(getEffectivePolicy).toHaveBeenCalledTimes(1);
    expect(validateCredential).toHaveBeenCalledWith(ctx, mockUserWithMfaVerifications.id);
  });

  it('revalidates the trusted-device credential every time the guard runs', async () => {
    validateCredential.mockResolvedValue(trustedDevice);
    const { ctx, experienceInteraction } = createInteraction();

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();
    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(getEffectivePolicy).toHaveBeenCalledTimes(1);
    expect(validateCredential).toHaveBeenCalledTimes(2);
    expect(validateCredential).toHaveBeenCalledWith(ctx, mockUserWithMfaVerifications.id);
  });

  it('allows a valid trusted device to verify adaptive MFA', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce(adaptiveMfaSignInExperience);
    validateCredential.mockResolvedValueOnce(trustedDevice);
    const { ctx, experienceInteraction } = createInteraction({}, { 'x-logto-cf-bot-score': '10' });

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(ctx.assignReleaseAnywayInteractionHookResult).toHaveBeenCalledWith({
      event: InteractionHookEvent.PostSignInAdaptiveMfaTriggered,
      payload: {
        adaptiveMfaResult: expect.objectContaining({
          requiresMfa: true,
          triggeredRules: expect.arrayContaining([
            expect.objectContaining({ rule: 'untrusted_ip' }),
          ]) as unknown,
        }) as unknown,
      },
      userId: mockUserWithMfaVerifications.id,
    });
  });
});
