import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  type Mfa as MfaSettings,
  type UserMfaData,
} from '@logto/schemas';
import { conditional, deduplicate } from '@silverhand/essentials';

import {
  isNoSkipMfaPolicy,
  isPromptOnlyAtSignInPolicy,
} from '#src/libraries/sign-in-experience/mfa-policy.js';

import {
  type AdditionalMfaSuggestionContext,
  buildFactorMaskedIdentifiers,
  evaluateAdditionalMfaSuggestion,
} from './mfa-additional-suggestion.js';

export enum MfaEnrollmentKind {
  None = 'none',
  SuggestEnable = 'suggestEnable',
  Missing = 'missing',
  SuggestAdditional = 'suggestAdditional',
  BackupCode = 'backupCode',
}

export enum MfaEnrollmentReason {
  NoFactors = 'noFactors',
  PromptOnlyAtSignInRegister = 'promptOnlyAtSignInRegister',
  NoPromptExempt = 'noPromptExempt',
  UserSkipped = 'userSkipped',
  SuggestEnable = 'suggestEnable',
  Missing = 'missing',
  SuggestAdditional = 'suggestAdditional',
  BackupCodeRequired = 'backupCodeRequired',
  Fulfilled = 'fulfilled',
}

export const isEnrollmentExemptionReason = (reason: MfaEnrollmentReason): boolean =>
  [
    MfaEnrollmentReason.NoFactors,
    MfaEnrollmentReason.PromptOnlyAtSignInRegister,
    MfaEnrollmentReason.NoPromptExempt,
    MfaEnrollmentReason.UserSkipped,
  ].includes(reason);

export type MfaEnrollmentSnapshot = {
  isDevFeaturesEnabled: boolean;
  mfaSettings: MfaSettings;
  interactionEvent: InteractionEvent;
  userMfaConfig: Pick<UserMfaData, 'enabled' | 'skipped' | 'additionalBindingSuggestionSkipped'>;
  isMfaRequiredByUser: boolean;
  asNoSkipMandatoryPolicy?: boolean;
  enrollmentFactors?: readonly MfaFactor[];
  configuredFactors: readonly MfaFactor[];
  userFactors: readonly MfaFactor[];
  boundMfaFactors: readonly MfaFactor[];
  canBindMfa: boolean;
  additionalBindingSuggestionSkippedInSession?: boolean;
  primaryEmail?: string | undefined;
  primaryPhone?: string | undefined;
  additionalSuggestionContext?: AdditionalMfaSuggestionContext;
};

export type MfaEnrollmentDecision = {
  kind: MfaEnrollmentKind;
  reason: MfaEnrollmentReason;
  skippable: boolean;
  availableFactors: MfaFactor[];
  shouldBackfillMfaEnabled: boolean;
  maskedIdentifiers?: Partial<Record<MfaFactor, string>>;
  boundFactors?: MfaFactor[];
  isWebAuthnUsedAsSignInPasskey?: boolean;
};

const noneDecision = (
  reason: MfaEnrollmentReason,
  shouldBackfillMfaEnabled = false
): MfaEnrollmentDecision => ({
  kind: MfaEnrollmentKind.None,
  reason,
  skippable: false,
  availableFactors: [],
  shouldBackfillMfaEnabled,
});

const isPairableFactor = (factor: MfaFactor, asNoSkipMandatoryPolicy: boolean): boolean =>
  !asNoSkipMandatoryPolicy ||
  (factor !== MfaFactor.EmailVerificationCode && factor !== MfaFactor.PhoneVerificationCode);

const resolveOptionalEnablement = ({
  mfaSettings: { policy },
  interactionEvent,
  userMfaConfig,
  isMfaRequiredByUser,
  asNoSkipMandatoryPolicy = false,
  userFactors,
}: MfaEnrollmentSnapshot): { suggestEnable: boolean; shouldBackfillMfaEnabled: boolean } => {
  if (
    asNoSkipMandatoryPolicy ||
    isNoSkipMfaPolicy(policy) ||
    policy === MfaPolicy.NoPrompt ||
    (interactionEvent === InteractionEvent.Register && policy === MfaPolicy.PromptOnlyAtSignIn) ||
    userMfaConfig.skipped === true ||
    isMfaRequiredByUser
  ) {
    return { suggestEnable: false, shouldBackfillMfaEnabled: false };
  }

  if (userMfaConfig.enabled === undefined) {
    return userFactors.length === 0
      ? { suggestEnable: true, shouldBackfillMfaEnabled: false }
      : { suggestEnable: false, shouldBackfillMfaEnabled: true };
  }

  return { suggestEnable: !userMfaConfig.enabled, shouldBackfillMfaEnabled: false };
};

const resolveMandatoryExemptionReason = ({
  mfaSettings: { policy },
  userMfaConfig,
  isMfaRequiredByUser,
  asNoSkipMandatoryPolicy = false,
}: MfaEnrollmentSnapshot): MfaEnrollmentReason | undefined => {
  if (asNoSkipMandatoryPolicy || isMfaRequiredByUser) {
    return;
  }
  if (policy === MfaPolicy.NoPrompt) {
    return MfaEnrollmentReason.NoPromptExempt;
  }
  if (!isNoSkipMfaPolicy(policy) && userMfaConfig.skipped === true) {
    return MfaEnrollmentReason.UserSkipped;
  }
};

const resolveMissingMfaDecision = (
  snapshot: MfaEnrollmentSnapshot,
  linkedFactors: readonly MfaFactor[],
  shouldBackfillMfaEnabled: boolean
): MfaEnrollmentDecision | undefined => {
  const {
    isDevFeaturesEnabled,
    mfaSettings: { policy },
    isMfaRequiredByUser,
    asNoSkipMandatoryPolicy = false,
    enrollmentFactors,
    configuredFactors,
    primaryEmail,
    primaryPhone,
  } = snapshot;
  const requiredFactors = (enrollmentFactors ?? configuredFactors).filter((factor) =>
    isPairableFactor(factor, asNoSkipMandatoryPolicy)
  );

  if (
    requiredFactors.length === 0 ||
    requiredFactors.some((factor) => linkedFactors.includes(factor))
  ) {
    return;
  }

  const maskedIdentifiers = isDevFeaturesEnabled
    ? buildFactorMaskedIdentifiers({
        email: requiredFactors.includes(MfaFactor.EmailVerificationCode) ? primaryEmail : undefined,
        phone: requiredFactors.includes(MfaFactor.PhoneVerificationCode) ? primaryPhone : undefined,
      })
    : {};

  return {
    kind: MfaEnrollmentKind.Missing,
    reason: MfaEnrollmentReason.Missing,
    skippable: !asNoSkipMandatoryPolicy && !isNoSkipMfaPolicy(policy) && !isMfaRequiredByUser,
    availableFactors: requiredFactors,
    shouldBackfillMfaEnabled,
    ...conditional(Object.keys(maskedIdentifiers).length > 0 && { maskedIdentifiers }),
  };
};

const resolveAdditionalOrBackupDecision = (
  snapshot: MfaEnrollmentSnapshot,
  linkedFactors: readonly MfaFactor[],
  shouldBackfillMfaEnabled: boolean
): MfaEnrollmentDecision | undefined => {
  const suggestion = evaluateAdditionalMfaSuggestion(snapshot);

  if (suggestion) {
    return {
      kind: MfaEnrollmentKind.SuggestAdditional,
      reason: MfaEnrollmentReason.SuggestAdditional,
      skippable: true,
      shouldBackfillMfaEnabled,
      ...suggestion,
    };
  }

  if (
    snapshot.mfaSettings.factors.includes(MfaFactor.BackupCode) &&
    !linkedFactors.includes(MfaFactor.BackupCode) &&
    snapshot.canBindMfa
  ) {
    return {
      kind: MfaEnrollmentKind.BackupCode,
      reason: MfaEnrollmentReason.BackupCodeRequired,
      skippable: false,
      availableFactors: [MfaFactor.BackupCode],
      shouldBackfillMfaEnabled,
    };
  }
};

export const resolveMfaEnrollmentRequirement = (
  snapshot: MfaEnrollmentSnapshot
): MfaEnrollmentDecision => {
  const {
    mfaSettings: { policy, factors },
    interactionEvent,
    asNoSkipMandatoryPolicy = false,
    userFactors,
    boundMfaFactors,
  } = snapshot;

  if (factors.length === 0) {
    return noneDecision(MfaEnrollmentReason.NoFactors);
  }

  if (
    !asNoSkipMandatoryPolicy &&
    interactionEvent === InteractionEvent.Register &&
    isPromptOnlyAtSignInPolicy(policy)
  ) {
    return noneDecision(MfaEnrollmentReason.PromptOnlyAtSignInRegister);
  }

  const { suggestEnable, shouldBackfillMfaEnabled } = resolveOptionalEnablement(snapshot);

  if (suggestEnable) {
    return {
      kind: MfaEnrollmentKind.SuggestEnable,
      reason: MfaEnrollmentReason.SuggestEnable,
      skippable: true,
      availableFactors: [],
      shouldBackfillMfaEnabled: false,
    };
  }

  const mandatoryExemption = resolveMandatoryExemptionReason(snapshot);

  if (mandatoryExemption) {
    return noneDecision(mandatoryExemption, shouldBackfillMfaEnabled);
  }

  const linkedFactors = deduplicate([
    ...userFactors.filter((factor) => isPairableFactor(factor, asNoSkipMandatoryPolicy)),
    ...boundMfaFactors,
  ]);

  return (
    resolveMissingMfaDecision(snapshot, linkedFactors, shouldBackfillMfaEnabled) ??
    resolveAdditionalOrBackupDecision(snapshot, linkedFactors, shouldBackfillMfaEnabled) ??
    noneDecision(MfaEnrollmentReason.Fulfilled, shouldBackfillMfaEnabled)
  );
};
