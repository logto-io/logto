import {
  AlternativeSignUpIdentifier,
  MfaFactor,
  MfaVerificationCodeEnrollment,
  SignInIdentifier,
  type Mfa as MfaSettings,
  type SignUp,
  type UserMfaData,
} from '@logto/schemas';
import { maskEmail, maskPhone } from '@logto/shared';
import { conditional, condObject } from '@silverhand/essentials';

import { sortMfaFactors } from '../helpers.js';

export type AdditionalMfaSuggestionContext = {
  signUp: Pick<SignUp, 'identifiers' | 'secondaryIdentifiers'>;
  passkeySignInEnabled: boolean;
  effectiveEmail?: string | undefined;
  effectivePhone?: string | undefined;
  sessionBoundDualPurposeFactors?: {
    emailVerificationCode?: boolean;
    phoneVerificationCode?: boolean;
    webAuthn?: boolean;
  };
};

type AdditionalMfaSuggestionInput = {
  isDevFeaturesEnabled: boolean;
  mfaSettings: MfaSettings;
  userMfaConfig: Pick<UserMfaData, 'additionalBindingSuggestionSkipped'>;
  configuredFactors: readonly MfaFactor[];
  userFactors: readonly MfaFactor[];
  canBindMfa: boolean;
  additionalBindingSuggestionSkippedInSession?: boolean;
  primaryEmail?: string | undefined;
  primaryPhone?: string | undefined;
  additionalSuggestionContext?: AdditionalMfaSuggestionContext;
};

export const buildFactorMaskedIdentifiers = ({
  email,
  phone,
}: {
  email?: string | undefined;
  phone?: string | undefined;
}): Partial<Record<MfaFactor, string>> =>
  condObject({
    [MfaFactor.EmailVerificationCode]: email && maskEmail(email),
    [MfaFactor.PhoneVerificationCode]: phone && maskPhone(phone),
  });

const isSignupIdentifierConfigured = (
  signUp: AdditionalMfaSuggestionContext['signUp'],
  identifier: SignInIdentifier.Email | SignInIdentifier.Phone
): boolean =>
  signUp.identifiers.includes(identifier) ||
  Boolean(
    signUp.secondaryIdentifiers?.some(
      (item) =>
        item.identifier === identifier ||
        item.identifier === AlternativeSignUpIdentifier.EmailOrPhone
    )
  );

const shouldSuggestInExplicitMode = (
  userFactors: readonly MfaFactor[],
  { passkeySignInEnabled, sessionBoundDualPurposeFactors }: AdditionalMfaSuggestionContext
): boolean => {
  const hasDualPurposeFactorBoundInSession =
    sessionBoundDualPurposeFactors?.emailVerificationCode === true ||
    sessionBoundDualPurposeFactors?.phoneVerificationCode === true ||
    (sessionBoundDualPurposeFactors?.webAuthn === true && passkeySignInEnabled);

  return hasDualPurposeFactorBoundInSession && userFactors.length === 1;
};

const shouldSuggestInImplicitMode = (
  userFactors: readonly MfaFactor[],
  { signUp, passkeySignInEnabled }: AdditionalMfaSuggestionContext
): boolean =>
  !(
    (userFactors.includes(MfaFactor.EmailVerificationCode) &&
      !isSignupIdentifierConfigured(signUp, SignInIdentifier.Email)) ||
    (userFactors.includes(MfaFactor.PhoneVerificationCode) &&
      !isSignupIdentifierConfigured(signUp, SignInIdentifier.Phone)) ||
    userFactors.includes(MfaFactor.TOTP) ||
    userFactors.includes(MfaFactor.BackupCode) ||
    (userFactors.includes(MfaFactor.WebAuthn) && !passkeySignInEnabled)
  );

const resolveSuggestedIdentifier = ({
  factor,
  isDevFeaturesEnabled,
  userFactors,
  sortedFactors,
  effectiveValue,
  primaryValue,
}: {
  factor: MfaFactor.EmailVerificationCode | MfaFactor.PhoneVerificationCode;
  isDevFeaturesEnabled: boolean;
  userFactors: readonly MfaFactor[];
  sortedFactors: readonly MfaFactor[];
  effectiveValue: string | undefined;
  primaryValue: string | undefined;
}): string | undefined =>
  userFactors.includes(factor)
    ? effectiveValue
    : conditional(
        // Email / SMS MFA explicit enrollment: expose unenrolled existing primary identifier so the
        // suggestion list enrolls it instead of opening the new-identifier profile form.
        isDevFeaturesEnabled && sortedFactors.includes(factor) && primaryValue
      );

export const getCandidateAdditionalMfaFactors = ({
  mfaSettings,
  configuredFactors,
  userFactors,
  userMfaConfig,
  canBindMfa,
  additionalBindingSuggestionSkippedInSession,
}: Pick<
  AdditionalMfaSuggestionInput,
  | 'mfaSettings'
  | 'configuredFactors'
  | 'userFactors'
  | 'userMfaConfig'
  | 'canBindMfa'
  | 'additionalBindingSuggestionSkippedInSession'
>): MfaFactor[] | undefined => {
  if (
    mfaSettings.skipAdditionalBindingSuggestion === true ||
    additionalBindingSuggestionSkippedInSession === true ||
    userMfaConfig.additionalBindingSuggestionSkipped === true ||
    // A sign-in that may not enroll a factor must not offer enrollment: with existing factors it
    // would let a password-only visitor bind a new factor without proving one.
    !canBindMfa
  ) {
    return;
  }

  const sortedFactors = sortMfaFactors([...configuredFactors]);
  return sortedFactors.some((factor) => !userFactors.includes(factor)) ? sortedFactors : undefined;
};

export const evaluateAdditionalMfaSuggestion = (
  input: AdditionalMfaSuggestionInput
):
  | {
      availableFactors: MfaFactor[];
      maskedIdentifiers: Partial<Record<MfaFactor, string>>;
      boundFactors?: MfaFactor[];
      isWebAuthnUsedAsSignInPasskey: boolean;
    }
  | undefined => {
  const { additionalSuggestionContext, isDevFeaturesEnabled, mfaSettings, userFactors } = input;
  const sortedFactors = additionalSuggestionContext && getCandidateAdditionalMfaFactors(input);

  if (!additionalSuggestionContext || !sortedFactors) {
    return;
  }

  // Email / SMS MFA explicit enrollment: suggest another factor only when a dual-purpose factor
  // was bound in this interaction as the user's sole MFA factor.
  const isExplicitMode =
    isDevFeaturesEnabled &&
    mfaSettings.verificationCodeEnrollment === MfaVerificationCodeEnrollment.Explicit;
  const shouldSuggest = isExplicitMode
    ? shouldSuggestInExplicitMode(userFactors, additionalSuggestionContext)
    : shouldSuggestInImplicitMode(userFactors, additionalSuggestionContext);

  if (!shouldSuggest) {
    return;
  }

  const { effectiveEmail, effectivePhone, passkeySignInEnabled } = additionalSuggestionContext;

  return {
    availableFactors: sortedFactors,
    maskedIdentifiers: buildFactorMaskedIdentifiers({
      email: resolveSuggestedIdentifier({
        factor: MfaFactor.EmailVerificationCode,
        isDevFeaturesEnabled,
        userFactors,
        sortedFactors,
        effectiveValue: effectiveEmail,
        primaryValue: input.primaryEmail,
      }),
      phone: resolveSuggestedIdentifier({
        factor: MfaFactor.PhoneVerificationCode,
        isDevFeaturesEnabled,
        userFactors,
        sortedFactors,
        effectiveValue: effectivePhone,
        primaryValue: input.primaryPhone,
      }),
    }),
    // Email / SMS MFA explicit enrollment: distinguish already-bound factors from unenrolled
    // existing primary identifiers that also carry a `maskedIdentifiers` entry.
    ...conditional(isDevFeaturesEnabled && { boundFactors: [...userFactors] }),
    isWebAuthnUsedAsSignInPasskey: passkeySignInEnabled && userFactors.includes(MfaFactor.WebAuthn),
  };
};
