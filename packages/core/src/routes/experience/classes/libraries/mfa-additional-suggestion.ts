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
    : conditional(isDevFeaturesEnabled && sortedFactors.includes(factor) && primaryValue);

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
    ...conditional(isDevFeaturesEnabled && { boundFactors: [...userFactors] }),
    isWebAuthnUsedAsSignInPasskey: passkeySignInEnabled && userFactors.includes(MfaFactor.WebAuthn),
  };
};
