import {
  type InteractionAuthenticationContext,
  type MaskedIdentifiers,
  MfaFactor,
  VerificationType,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type MfaFlowState } from '@/types/guard';

import { isNativeWebview } from './native-sdk';

/**
 * The verification types the step-up screens can render: the pinned-user first factors and the
 * enrolled MFA factors. Core decides which of them are offered; the SPA never computes
 * eligibility, it only renders what `availableMethods` carries.
 */
export const stepUpMethods = Object.freeze([
  VerificationType.Password,
  VerificationType.EmailVerificationCode,
  VerificationType.PhoneVerificationCode,
  VerificationType.TOTP,
  VerificationType.WebAuthn,
  VerificationType.BackupCode,
  VerificationType.MfaEmailVerificationCode,
  VerificationType.MfaPhoneVerificationCode,
] as const);

export type StepUpMethod = (typeof stepUpMethods)[number];

const stepUpMethodSet: ReadonlySet<VerificationType> = new Set(stepUpMethods);

export const isStepUpMethod = (type: VerificationType): type is StepUpMethod =>
  stepUpMethodSet.has(type);

/** The MFA factor a step-up method verifies through the existing `/mfa-verification` pages. */
export const stepUpMethodToMfaFactor: Readonly<Partial<Record<StepUpMethod, MfaFactor>>> =
  Object.freeze({
    [VerificationType.TOTP]: MfaFactor.TOTP,
    [VerificationType.WebAuthn]: MfaFactor.WebAuthn,
    [VerificationType.BackupCode]: MfaFactor.BackupCode,
    [VerificationType.MfaEmailVerificationCode]: MfaFactor.EmailVerificationCode,
    [VerificationType.MfaPhoneVerificationCode]: MfaFactor.PhoneVerificationCode,
  });

/**
 * The methods the screens render, in the server's order. Only the types the screens know are
 * kept; WebAuthn is dropped on a native webview when the user has another option, since the
 * webview cannot run the ceremony. This is a client capability, not an eligibility rule.
 */
export const getDisplayedStepUpMethods = (
  availableMethods: readonly VerificationType[]
): StepUpMethod[] => {
  const methods = availableMethods.filter((method): method is StepUpMethod =>
    isStepUpMethod(method)
  );

  return isNativeWebview() && methods.length > 1
    ? methods.filter((method) => method !== VerificationType.WebAuthn)
    : methods;
};

/** The masked identifier a code method sends to, from the server-provided masked identifiers. */
export const getMaskedIdentifier = (
  method: StepUpMethod,
  { email, phone }: MaskedIdentifiers
): string | undefined => {
  switch (method) {
    case VerificationType.EmailVerificationCode:
    case VerificationType.MfaEmailVerificationCode: {
      return email;
    }
    case VerificationType.PhoneVerificationCode:
    case VerificationType.MfaPhoneVerificationCode: {
      return phone;
    }
    default: {
      return undefined;
    }
  }
};

/**
 * The flow state the existing MFA verification pages expect, built from the displayed methods:
 * the enrolled factors Core offers, with the masked identifiers keyed the way those pages read
 * them. Until the MFA pages read the server context themselves, this is what they receive
 * through `location.state`.
 */
export const toMfaFlowState = (
  methods: readonly StepUpMethod[],
  { maskedIdentifiers }: Pick<InteractionAuthenticationContext, 'maskedIdentifiers'>
): MfaFlowState => {
  const availableFactors = methods
    .map((method) => stepUpMethodToMfaFactor[method])
    .filter((factor): factor is MfaFactor => factor !== undefined);
  const { email, phone } = maskedIdentifiers;
  const maskedFactorIdentifiers = {
    ...conditional(
      availableFactors.includes(MfaFactor.EmailVerificationCode) &&
        email && { [MfaFactor.EmailVerificationCode]: email }
    ),
    ...conditional(
      availableFactors.includes(MfaFactor.PhoneVerificationCode) &&
        phone && { [MfaFactor.PhoneVerificationCode]: phone }
    ),
  };

  return {
    availableFactors,
    // The MFA flow state guard infers a full record, while only the enrolled code factors carry
    // an identifier; the MFA pages read it per factor, so a partial record is what they expect.
    // eslint-disable-next-line no-restricted-syntax
    maskedIdentifiers: maskedFactorIdentifiers as MfaFlowState['maskedIdentifiers'],
  };
};
