import {
  type AuthenticationFactor,
  type JsonObject,
  type Mfa,
  MfaFactor,
  type UserMfaData,
  VerificationType,
  getAuthenticationFactor,
  userMfaDataGuard,
  userMfaDataKey,
} from '@logto/schemas';
import { type Optional } from '@silverhand/essentials';

import { isNoSkipMfaPolicy } from '#src/libraries/sign-in-experience/mfa-policy.js';

import { type AdaptiveMfaResult } from './adaptive-mfa-validator/types.js';

export const mfaFactorToVerificationType = Object.freeze({
  [MfaFactor.TOTP]: VerificationType.TOTP,
  [MfaFactor.WebAuthn]: VerificationType.WebAuthn,
  [MfaFactor.BackupCode]: VerificationType.BackupCode,
  [MfaFactor.EmailVerificationCode]: VerificationType.MfaEmailVerificationCode,
  [MfaFactor.PhoneVerificationCode]: VerificationType.MfaPhoneVerificationCode,
}) satisfies Record<MfaFactor, VerificationType>;

export enum MfaVerificationReason {
  SsoExempt = 'ssoExempt',
  PasskeyExempt = 'passkeyExempt',
  RequestedAcrSatisfied = 'requestedAcrSatisfied',
  AdaptiveNotTriggered = 'adaptiveNotTriggered',
  NoFactors = 'noFactors',
  UserOptedOut = 'userOptedOut',
  AlreadyVerified = 'alreadyVerified',
  TrustedDevice = 'trustedDevice',
  Required = 'required',
}

export type MfaVerificationSnapshot = {
  mfaSettings: Pick<Mfa, 'policy'>;
  adaptiveMfaResult?: Optional<AdaptiveMfaResult>;
  userFactors: readonly MfaFactor[];
  userMfaConfig: Pick<UserMfaData, 'enabled' | 'skipMfaOnSignIn'>;
  isMfaRequiredByUser: boolean;
  hasVerifiedSsoIdentity: boolean;
  hasVerifiedSignInPasskey: boolean;
  hasVerifiedMfaRecord: boolean;
  isTrustedDeviceVerified: boolean;
  requestedAcr?: {
    isRequestedMfaUnmet: boolean;
    isRequestedMfaSatisfied: boolean;
    provenFirstFactors?: readonly AuthenticationFactor[];
    hasFreshFirstFactor?: boolean;
    eligibleMethods?: readonly VerificationType[];
  };
  allowSoftExemptions?: boolean;
};

export type MfaVerificationDecision = {
  required: boolean;
  reason: MfaVerificationReason;
  availableFactors: MfaFactor[];
};

export const parseUserMfaConfig = (logtoConfig: JsonObject): UserMfaData => {
  const parsed = userMfaDataGuard.safeParse(logtoConfig[userMfaDataKey]);
  return parsed.success ? parsed.data : {};
};

export const filterPairableMfaFactors = (
  factors: readonly MfaFactor[],
  {
    hasFreshFirstFactor,
    provenFirstFactors,
  }: {
    hasFreshFirstFactor: boolean;
    provenFirstFactors: readonly AuthenticationFactor[];
  }
): MfaFactor[] => {
  if (!hasFreshFirstFactor) {
    return [];
  }

  const firstFactors = new Set(provenFirstFactors);

  return factors.filter((factor) => {
    const mfaFactor = getAuthenticationFactor(mfaFactorToVerificationType[factor]);

    return [...firstFactors].some((firstFactor) => firstFactor !== mfaFactor);
  });
};

const resolveAvailableFactors = ({
  userFactors,
  requestedAcr,
  allowSoftExemptions = true,
}: MfaVerificationSnapshot): MfaFactor[] => {
  if (!requestedAcr?.isRequestedMfaUnmet) {
    return [...userFactors];
  }

  if (!requestedAcr.hasFreshFirstFactor) {
    // Binding guard keeps all factors so users with MFA must prove one before enrolling.
    return allowSoftExemptions ? [] : [...userFactors];
  }

  const eligibleMethods = new Set(requestedAcr.eligibleMethods ?? []);

  return filterPairableMfaFactors(userFactors, {
    hasFreshFirstFactor: true,
    provenFirstFactors: requestedAcr.provenFirstFactors ?? [],
  }).filter((factor) => eligibleMethods.has(mfaFactorToVerificationType[factor]));
};

const resolveUnconditionalExemption = ({
  hasVerifiedSsoIdentity,
  hasVerifiedSignInPasskey,
  requestedAcr,
}: MfaVerificationSnapshot): MfaVerificationDecision | undefined => {
  if (requestedAcr?.isRequestedMfaUnmet) {
    return;
  }

  if (hasVerifiedSsoIdentity) {
    return { required: false, reason: MfaVerificationReason.SsoExempt, availableFactors: [] };
  }

  if (hasVerifiedSignInPasskey) {
    return { required: false, reason: MfaVerificationReason.PasskeyExempt, availableFactors: [] };
  }

  if (requestedAcr?.isRequestedMfaSatisfied) {
    return {
      required: false,
      reason: MfaVerificationReason.RequestedAcrSatisfied,
      availableFactors: [],
    };
  }
};

const isUserOptedOut = ({
  mfaSettings,
  adaptiveMfaResult,
  userMfaConfig,
  isMfaRequiredByUser,
  allowSoftExemptions = true,
}: MfaVerificationSnapshot): boolean =>
  allowSoftExemptions &&
  adaptiveMfaResult === undefined &&
  (userMfaConfig.enabled === false || Boolean(userMfaConfig.skipMfaOnSignIn)) &&
  !isNoSkipMfaPolicy(mfaSettings.policy) &&
  !isMfaRequiredByUser;

const resolvePostFactorExemption = (
  snapshot: MfaVerificationSnapshot
): MfaVerificationDecision | undefined => {
  const {
    hasVerifiedMfaRecord,
    isTrustedDeviceVerified,
    requestedAcr,
    allowSoftExemptions = true,
  } = snapshot;

  if (requestedAcr?.isRequestedMfaUnmet) {
    return;
  }

  if (isUserOptedOut(snapshot)) {
    return { required: false, reason: MfaVerificationReason.UserOptedOut, availableFactors: [] };
  }

  if (hasVerifiedMfaRecord) {
    return {
      required: false,
      reason: MfaVerificationReason.AlreadyVerified,
      availableFactors: [],
    };
  }

  if (allowSoftExemptions && isTrustedDeviceVerified) {
    return { required: false, reason: MfaVerificationReason.TrustedDevice, availableFactors: [] };
  }
};

export const resolveMfaVerificationRequirement = (
  snapshot: MfaVerificationSnapshot
): MfaVerificationDecision => {
  const unconditionalExemption = resolveUnconditionalExemption(snapshot);

  if (unconditionalExemption) {
    return unconditionalExemption;
  }

  const { adaptiveMfaResult, requestedAcr, allowSoftExemptions = true } = snapshot;

  if (
    !requestedAcr?.isRequestedMfaUnmet &&
    allowSoftExemptions &&
    adaptiveMfaResult?.requiresMfa === false
  ) {
    return {
      required: false,
      reason: MfaVerificationReason.AdaptiveNotTriggered,
      availableFactors: [],
    };
  }

  const availableFactors = resolveAvailableFactors(snapshot);

  if (availableFactors.length === 0) {
    return { required: false, reason: MfaVerificationReason.NoFactors, availableFactors: [] };
  }

  return (
    resolvePostFactorExemption(snapshot) ?? {
      required: true,
      reason: MfaVerificationReason.Required,
      availableFactors,
    }
  );
};
