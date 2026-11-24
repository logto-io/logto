import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  AuthenticationProofRole,
  InteractionEvent,
  LogtoAcr,
  MfaFactor,
  MfaPolicy,
  OrganizationRequiredMfaPolicy,
  VerificationType,
  type Mfa,
  type User,
  userMfaDataKey,
} from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { createMockTrustedDevice } from '#src/__mocks__/trusted-device.js';
import { mockUser, mockUserWithMfaVerifications } from '#src/__mocks__/user.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { type Interaction, type WithHooksAndLogsContext } from '../../types.js';

import { MfaVerificationReason } from './mfa-verification-decision.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    values: { isDevFeaturesEnabled: false },
  },
}));

const ExperienceInteraction = await pickDefault(import('../experience-interaction.js'));

const createInteraction = ({
  user = mockUserWithMfaVerifications,
  mfa = {
    policy: MfaPolicy.Mandatory,
    factors: [MfaFactor.TOTP],
    organizationRequiredMfaPolicy: OrganizationRequiredMfaPolicy.NoPrompt,
  },
  adaptiveMfaEnabled = false,
  interactionResult = {},
  headers,
  trustedDeviceValid = false,
}: {
  user?: User;
  mfa?: Mfa;
  adaptiveMfaEnabled?: boolean;
  interactionResult?: Record<string, unknown>;
  headers?: Record<string, string>;
  trustedDeviceValid?: boolean;
} = {}) => {
  const findDefaultSignInExperience = jest.fn().mockResolvedValue({
    ...mockSignInExperience,
    adaptiveMfa: { enabled: adaptiveMfaEnabled },
    mfa,
  });
  const findUserById = jest.fn().mockResolvedValue(user);
  const getEffectivePolicy = jest
    .fn()
    .mockResolvedValue({ enabled: trustedDeviceValid, durationDays: 30 });
  const hasCredential = jest.fn().mockReturnValue(trustedDeviceValid);
  const validateCredential = jest
    .fn()
    .mockResolvedValue(
      trustedDeviceValid
        ? createMockTrustedDevice({ tenantId: 'default', id: 'td-1', userId: user.id })
        : null
    );

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
  jest
    .spyOn(tenant.queries.organizations.relations.users, 'getOrganizationsByUserId')
    .mockResolvedValue([]);

  const interactionDetails = {
    jti: 'interaction-id',
    params: { client_id: 'application-id' },
    result: {
      interactionEvent: InteractionEvent.SignIn,
      userId: user.id,
      ...interactionResult,
    },
  } as unknown as Interaction;
  const { createLog, mockAppend } = createMockLogContext();
  const ctx = {
    assignReleaseOnSuccessInteractionHookResult: jest.fn(),
    assignReleaseAnywayInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
    appendExceptionHookContext: jest.fn(),
    ...createContextWithRouteParameters({ headers }),
    createLog,
    prependAllLogEntries: jest.fn(),
    interactionDetails,
  } as unknown as WithHooksAndLogsContext;

  const log = createLog('Interaction.SignIn.Submit');
  const experienceInteraction = new ExperienceInteraction(ctx, tenant, interactionDetails);

  return { experienceInteraction, log, mockAppend };
};

describe('ExperienceInteraction MFA verification audit log and binding agreement', () => {
  it.each<{
    name: string;
    setup: () => ReturnType<typeof createInteraction>;
    expectedReason: MfaVerificationReason;
    expectVerificationError: boolean;
    expectBindingError: boolean;
  }>([
    {
      name: 'ssoExempt: passes both verification and binding',
      setup: () =>
        createInteraction({
          interactionResult: {
            authenticationProofs: [
              {
                id: 'sso-id',
                factor: AuthenticationFactor.Federated,
                class: AuthenticationFactorClass.FirstFactor,
                amr: [AuthenticationMethodReference.Federated],
                role: AuthenticationProofRole.Identify,
              },
            ],
            verificationRecords: [
              {
                id: 'sso-id',
                type: VerificationType.EnterpriseSso,
                connectorId: 'sso-connector-id',
                enterpriseSsoUserInfo: { id: 'sso-user-id' },
                issuer: 'issuer',
              },
            ],
          },
        }),
      expectedReason: MfaVerificationReason.SsoExempt,
      expectVerificationError: false,
      expectBindingError: false,
    },
    {
      name: 'passkeyExempt: passes both verification and binding',
      setup: () =>
        createInteraction({
          interactionResult: {
            authenticationProofs: [
              {
                id: 'passkey-id',
                factor: AuthenticationFactor.WebAuthn,
                class: AuthenticationFactorClass.Both,
                amr: [AuthenticationMethodReference.Mfa],
                role: AuthenticationProofRole.Identify,
              },
            ],
            verificationRecords: [
              {
                id: 'passkey-id',
                type: VerificationType.SignInPasskey,
                userId: mockUserWithMfaVerifications.id,
                verified: true,
              },
            ],
          },
        }),
      expectedReason: MfaVerificationReason.PasskeyExempt,
      expectVerificationError: false,
      expectBindingError: false,
    },
    {
      name: 'requestedAcrSatisfied: passes both verification and binding',
      setup: () =>
        createInteraction({
          interactionResult: {
            authenticationContext: { requestedAcrValues: [LogtoAcr.Mfa] },
            authenticationProofs: [
              {
                id: 'pwd-id',
                factor: AuthenticationFactor.Password,
                class: AuthenticationFactorClass.FirstFactor,
                amr: [AuthenticationMethodReference.Password],
                role: AuthenticationProofRole.Identify,
              },
              {
                id: 'new-totp-id',
                factor: AuthenticationFactor.Totp,
                class: AuthenticationFactorClass.Mfa,
                amr: [AuthenticationMethodReference.Otp],
                role: AuthenticationProofRole.Bind,
              },
            ],
          },
        }),
      expectedReason: MfaVerificationReason.RequestedAcrSatisfied,
      expectVerificationError: false,
      expectBindingError: false,
    },
    {
      name: 'adaptiveNotTriggered: passes verification, blocks binding',
      setup: () =>
        createInteraction({
          user: { ...mockUserWithMfaVerifications, lastSignInAt: Date.now() },
          mfa: { policy: MfaPolicy.PromptAtSignInAndSignUpMandatory, factors: [MfaFactor.TOTP] },
          adaptiveMfaEnabled: true,
          headers: { 'x-logto-cf-bot-score': '99' },
        }),
      expectedReason: MfaVerificationReason.AdaptiveNotTriggered,
      expectVerificationError: false,
      expectBindingError: true,
    },
    {
      name: 'noFactors: passes both verification and binding',
      setup: () => createInteraction({ user: mockUser }),
      expectedReason: MfaVerificationReason.NoFactors,
      expectVerificationError: false,
      expectBindingError: false,
    },
    {
      name: 'userOptedOut: passes verification, blocks binding',
      setup: () =>
        createInteraction({
          user: {
            ...mockUserWithMfaVerifications,
            logtoConfig: { [userMfaDataKey]: { skipMfaOnSignIn: true } },
          },
          mfa: { policy: MfaPolicy.PromptAtSignInAndSignUp, factors: [MfaFactor.TOTP] },
        }),
      expectedReason: MfaVerificationReason.UserOptedOut,
      expectVerificationError: false,
      expectBindingError: true,
    },
    {
      name: 'alreadyVerified: passes both verification and binding',
      setup: () =>
        createInteraction({
          interactionResult: {
            verificationRecords: [
              {
                id: 'totp-id',
                type: VerificationType.TOTP,
                userId: mockUserWithMfaVerifications.id,
                verified: true,
              },
            ],
          },
        }),
      expectedReason: MfaVerificationReason.AlreadyVerified,
      expectVerificationError: false,
      expectBindingError: false,
    },
    {
      name: 'trustedDevice: passes verification, blocks binding',
      setup: () => createInteraction({ trustedDeviceValid: true }),
      expectedReason: MfaVerificationReason.TrustedDevice,
      expectVerificationError: false,
      expectBindingError: true,
    },
    {
      name: 'required: rejects both verification and binding',
      setup: () => createInteraction(),
      expectedReason: MfaVerificationReason.Required,
      expectVerificationError: true,
      expectBindingError: true,
    },
  ])('$name', async ({ setup, expectedReason, expectVerificationError, expectBindingError }) => {
    const { experienceInteraction, log, mockAppend } = setup();

    await (expectVerificationError
      ? expect(experienceInteraction.guardMfaVerificationStatus(log)).rejects.toMatchObject({
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        })
      : expect(experienceInteraction.guardMfaVerificationStatus(log)).resolves.toBeUndefined());

    expect(mockAppend).toHaveBeenCalledWith({ mfaVerificationReason: expectedReason });

    await (expectBindingError
      ? expect(experienceInteraction.guardMfaBinding()).rejects.toMatchObject({
          code: 'session.mfa.require_mfa_verification',
          status: 403,
        })
      : expect(experienceInteraction.guardMfaBinding()).resolves.toBeUndefined());
  });
});
