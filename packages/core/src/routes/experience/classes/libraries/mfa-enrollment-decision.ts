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

export type MfaPreBindEnrollmentSnapshot = {
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
  additionalBindingSuggestionSkippedInSession?: boolean;
  primaryEmail?: string | undefined;
  primaryPhone?: string | undefined;
};

export type MfaEnrollmentSnapshot = MfaPreBindEnrollmentSnapshot & {
  canBindMfa: boolean;
  additionalSuggestionContext?: AdditionalMfaSuggestionContext;
};

export type MfaEnrollmentDecision = {
  kind: MfaEnrollmentKind;
  skippable: boolean;
  availableFactors: MfaFactor[];
  shouldBackfillMfaEnabled: boolean;
  maskedIdentifiers?: Partial<Record<MfaFactor, string>>;
  boundFactors?: MfaFactor[];
  isWebAuthnUsedAsSignInPasskey?: boolean;
};

const noneDecision = (shouldBackfillMfaEnabled = false): MfaEnrollmentDecision => ({
  kind: MfaEnrollmentKind.None,
  skippable: false,
  availableFactors: [],
  shouldBackfillMfaEnabled,
});

// A requested `mfa` reaching this check means the proofs are still below the class, and the
// implicit email / phone factors derived from the primary identifiers cannot lift them: only
// stored and newly bound factors count, so the user is asked to enroll one that completes the pair.
const isPairableFactor = (factor: MfaFactor, asNoSkipMandatoryPolicy: boolean): boolean =>
  !asNoSkipMandatoryPolicy ||
  (factor !== MfaFactor.EmailVerificationCode && factor !== MfaFactor.PhoneVerificationCode);

const getLinkedFactors = (
  userFactors: readonly MfaFactor[],
  boundMfaFactors: readonly MfaFactor[],
  asNoSkipMandatoryPolicy: boolean
): MfaFactor[] =>
  deduplicate([
    ...userFactors.filter((factor) => isPairableFactor(factor, asNoSkipMandatoryPolicy)),
    ...boundMfaFactors,
  ]);

const resolveOptionalEnablement = ({
  mfaSettings: { policy },
  interactionEvent,
  userMfaConfig,
  isMfaRequiredByUser,
  asNoSkipMandatoryPolicy = false,
  userFactors,
}: MfaPreBindEnrollmentSnapshot): { suggestEnable: boolean; shouldBackfillMfaEnabled: boolean } => {
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

  // Legacy users created before `enabled` was introduced have factors without the flag:
  // treat them as already opted in and backfill `enabled: true` instead of prompting.
  if (userMfaConfig.enabled === undefined) {
    return userFactors.length === 0
      ? { suggestEnable: true, shouldBackfillMfaEnabled: false }
      : { suggestEnable: false, shouldBackfillMfaEnabled: true };
  }

  return { suggestEnable: !userMfaConfig.enabled, shouldBackfillMfaEnabled: false };
};

const isMandatoryExempt = ({
  mfaSettings: { policy },
  userMfaConfig,
  isMfaRequiredByUser,
  asNoSkipMandatoryPolicy = false,
}: MfaPreBindEnrollmentSnapshot): boolean =>
  !asNoSkipMandatoryPolicy &&
  !isMfaRequiredByUser &&
  (policy === MfaPolicy.NoPrompt || (!isNoSkipMfaPolicy(policy) && userMfaConfig.skipped === true));

const resolveMissingMfaDecision = (
  snapshot: MfaPreBindEnrollmentSnapshot,
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

  // Email / SMS MFA explicit enrollment: expose masked existing primary identifiers so the
  // onboarding list can offer sending a verification code to the user's existing address.
  const maskedIdentifiers = isDevFeaturesEnabled
    ? buildFactorMaskedIdentifiers({
        email: requiredFactors.includes(MfaFactor.EmailVerificationCode) ? primaryEmail : undefined,
        phone: requiredFactors.includes(MfaFactor.PhoneVerificationCode) ? primaryPhone : undefined,
      })
    : {};

  return {
    kind: MfaEnrollmentKind.Missing,
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
      skippable: true,
      shouldBackfillMfaEnabled,
      ...suggestion,
    };
  }

  if (
    snapshot.mfaSettings.factors.includes(MfaFactor.BackupCode) &&
    !linkedFactors.includes(MfaFactor.BackupCode) &&
    // A sign-in that may not bind a factor must not require backup codes it cannot enroll.
    snapshot.canBindMfa
  ) {
    return {
      kind: MfaEnrollmentKind.BackupCode,
      skippable: false,
      availableFactors: [MfaFactor.BackupCode],
      shouldBackfillMfaEnabled,
    };
  }
};

export const resolvePreBindMfaEnrollment = (
  snapshot: MfaPreBindEnrollmentSnapshot
): MfaEnrollmentDecision & { exempted: boolean } => {
  const {
    mfaSettings: { policy, factors },
    interactionEvent,
    asNoSkipMandatoryPolicy = false,
    userFactors,
    boundMfaFactors,
  } = snapshot;

  if (factors.length === 0) {
    return { ...noneDecision(), exempted: true };
  }

  if (
    !asNoSkipMandatoryPolicy &&
    interactionEvent === InteractionEvent.Register &&
    isPromptOnlyAtSignInPolicy(policy)
  ) {
    return { ...noneDecision(), exempted: true };
  }

  const { suggestEnable, shouldBackfillMfaEnabled } = resolveOptionalEnablement(snapshot);

  if (suggestEnable) {
    return {
      kind: MfaEnrollmentKind.SuggestEnable,
      skippable: true,
      availableFactors: [],
      shouldBackfillMfaEnabled: false,
      exempted: false,
    };
  }

  if (isMandatoryExempt(snapshot)) {
    return { ...noneDecision(shouldBackfillMfaEnabled), exempted: true };
  }

  const linkedFactors = getLinkedFactors(userFactors, boundMfaFactors, asNoSkipMandatoryPolicy);
  const missingDecision = resolveMissingMfaDecision(
    snapshot,
    linkedFactors,
    shouldBackfillMfaEnabled
  );

  if (missingDecision) {
    return { ...missingDecision, exempted: false };
  }

  return { ...noneDecision(shouldBackfillMfaEnabled), exempted: false };
};

export const resolveMfaEnrollmentRequirement = (
  snapshot: MfaEnrollmentSnapshot
): MfaEnrollmentDecision => {
  const { exempted, ...preBindDecision } = resolvePreBindMfaEnrollment(snapshot);

  if (preBindDecision.kind !== MfaEnrollmentKind.None || exempted) {
    return preBindDecision;
  }

  const linkedFactors = getLinkedFactors(
    snapshot.userFactors,
    snapshot.boundMfaFactors,
    snapshot.asNoSkipMandatoryPolicy ?? false
  );

  return (
    resolveAdditionalOrBackupDecision(
      snapshot,
      linkedFactors,
      preBindDecision.shouldBackfillMfaEnabled
    ) ?? noneDecision(preBindDecision.shouldBackfillMfaEnabled)
  );
};
