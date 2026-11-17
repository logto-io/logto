import { MfaFactor } from '@logto/schemas';

import { type MfaFlowState } from '@/types/guard';

/**
 * Check whether an MFA factor is already bound on an additional-MFA suggestion (`flowState.suggestion`).
 *
 * Uses `boundFactors` when provided by Core, and falls back to `maskedIdentifiers` and
 * `isWebAuthnUsedAsSignInPasskey` when `boundFactors` is absent.
 */
export const isFactorBoundInSuggestion = (factor: MfaFactor, flowState: MfaFlowState): boolean => {
  if (!flowState.suggestion) {
    return false;
  }

  const isWebAuthnBound =
    factor === MfaFactor.WebAuthn && Boolean(flowState.isWebAuthnUsedAsSignInPasskey);

  if (flowState.boundFactors) {
    return flowState.boundFactors.includes(factor) || isWebAuthnBound;
  }

  const isEmailOrPhone =
    factor === MfaFactor.EmailVerificationCode || factor === MfaFactor.PhoneVerificationCode;
  const maskedIdentifier = isEmailOrPhone ? flowState.maskedIdentifiers?.[factor] : undefined;

  return Boolean(maskedIdentifier) || isWebAuthnBound;
};
