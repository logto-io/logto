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
import { mockUser, mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type Interaction, type WithHooksAndLogsContext } from '../types.js';

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
    trustedDevices: { validateCredential },
  }
);

const trustedDevice: TrustedDevice = {
  tenantId: tenant.id,
  id: 'trusteddeviceid',
  userId: mockUserWithMfaVerifications.id,
  secretHash: Buffer.alloc(32, 1),
  userAgent: null,
  ip: null,
  country: null,
  city: null,
  createdAt: 1,
  lastUsedAt: 1,
  expiresAt: 2,
};

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

describe('ExperienceInteraction trusted-device MFA fulfillment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Toggle the mocked feature environment per test.
    mockEnvSetValues.isDevFeaturesEnabled = true;
    findDefaultSignInExperience.mockResolvedValue(requiredMfaSignInExperience);
    findUserById.mockResolvedValue(mockUserWithMfaVerifications);
    getEffectivePolicy.mockResolvedValue({ enabled: true, durationDays: 30 });
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

  it('restores matching interaction fulfillment before resolving effective policy', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce(adaptiveMfaSignInExperience);
    const fulfillment = {
      userId: mockUserWithMfaVerifications.id,
      trustedDeviceId: trustedDevice.id,
      fulfilledAt: 1_786_435_200_000,
    };
    const { ctx, experienceInteraction } = createInteraction(
      { trustedDeviceFulfillment: fulfillment },
      { 'x-logto-cf-bot-score': '10' }
    );

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(experienceInteraction.toJson().trustedDeviceFulfillment).toEqual(fulfillment);
    expect(getEffectivePolicy).not.toHaveBeenCalled();
    expect(validateCredential).not.toHaveBeenCalled();
    expect(ctx.assignReleaseAnywayInteractionHookResult).not.toHaveBeenCalled();
  });

  it('does not use fulfillment stored for another user', async () => {
    getEffectivePolicy.mockResolvedValueOnce({ enabled: false, durationDays: 30 });
    const { experienceInteraction } = createInteraction({
      trustedDeviceFulfillment: {
        userId: 'another-user',
        trustedDeviceId: trustedDevice.id,
        fulfilledAt: 1_786_435_200_000,
      },
    });

    await expectConventionalMfaRequired(experienceInteraction);

    expect(getEffectivePolicy).toHaveBeenCalledWith(mockUserWithMfaVerifications.id);
    expect(validateCredential).not.toHaveBeenCalled();
  });

  it('falls back to conventional MFA when credential validation does not fulfill the guard', async () => {
    const { ctx, experienceInteraction } = createInteraction();

    await expectConventionalMfaRequired(experienceInteraction);

    expect(getEffectivePolicy).toHaveBeenCalledWith(mockUserWithMfaVerifications.id);
    expect(validateCredential).toHaveBeenCalledWith(ctx, mockUserWithMfaVerifications.id);
    expect(experienceInteraction.toJson().trustedDeviceFulfillment).toBeUndefined();
  });

  it('stores valid credential fulfillment internally without exposing it publicly', async () => {
    const fulfilledAt = 1_786_435_200_000;
    jest.spyOn(Date, 'now').mockReturnValue(fulfilledAt);
    validateCredential.mockResolvedValueOnce(trustedDevice);
    const { ctx, experienceInteraction } = createInteraction();

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(validateCredential).toHaveBeenCalledWith(ctx, mockUserWithMfaVerifications.id);
    expect(experienceInteraction.toJson().trustedDeviceFulfillment).toEqual({
      userId: mockUserWithMfaVerifications.id,
      trustedDeviceId: trustedDevice.id,
      fulfilledAt,
    });
    expect(experienceInteraction.toSanitizedJson()).not.toHaveProperty('trustedDeviceFulfillment');
  });

  it('allows a valid trusted device to fulfill adaptive MFA', async () => {
    findDefaultSignInExperience.mockResolvedValueOnce(adaptiveMfaSignInExperience);
    validateCredential.mockResolvedValueOnce(trustedDevice);
    const { ctx, experienceInteraction } = createInteraction({}, { 'x-logto-cf-bot-score': '10' });

    await expect(experienceInteraction.guardMfaVerificationStatus()).resolves.toBeUndefined();

    expect(experienceInteraction.toJson().trustedDeviceFulfillment).toEqual(
      expect.objectContaining({
        userId: mockUserWithMfaVerifications.id,
        trustedDeviceId: trustedDevice.id,
      })
    );
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

  it('does not enable trusted-device fulfillment when dev features are disabled', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Verify the feature-level runtime guard.
    mockEnvSetValues.isDevFeaturesEnabled = false;
    validateCredential.mockResolvedValueOnce(trustedDevice);
    const { experienceInteraction } = createInteraction();

    await expectConventionalMfaRequired(experienceInteraction);

    expect(getEffectivePolicy).not.toHaveBeenCalled();
    expect(validateCredential).not.toHaveBeenCalled();
  });
});
