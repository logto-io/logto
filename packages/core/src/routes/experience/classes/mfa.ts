/* eslint-disable max-lines */
import { type ToZodObject } from '@logto/connector-kit';
import {
  type BindBackupCode,
  bindBackupCodeGuard,
  type BindMfa,
  type BindTotp,
  bindTotpGuard,
  type BindWebAuthn,
  bindWebAuthnGuard,
  type JsonObject,
  type OrganizationWithRoles,
  type User,
  VerificationType,
  type Mfa as MfaSettings,
  OrganizationRequiredMfaPolicy,
  MfaFactor,
  userPasskeySignInDataKey,
} from '@logto/schemas';
import { generateStandardId, PhoneNumberParser } from '@logto/shared';
import { cond, conditional, deduplicate, pick } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { getAllUserEnabledMfaVerifications } from '#src/libraries/mfa.js';
import {
  isMfaRequiredByUser,
  isNoSkipMfaPolicy,
} from '#src/libraries/sign-in-experience/mfa-policy.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type UserMfaVerificationsData, type InteractionContext } from '../types.js';

import { getCandidateAdditionalMfaFactors } from './libraries/mfa-additional-suggestion.js';
import {
  isEnrollmentExemptionReason,
  MfaEnrollmentKind,
  type MfaEnrollmentSnapshot,
  resolveMfaEnrollmentRequirement,
} from './libraries/mfa-enrollment-decision.js';
import { parseUserMfaConfig } from './libraries/mfa-verification-decision.js';
import { SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';

export type MfaData = {
  mfaEnabled?: boolean;
  mfaSkipped?: boolean;
  /**
   * Whether user skipped the optional suggestion to add another MFA factor.
   * This value is persisted to user profile and can be overridden in current interaction.
   */
  additionalBindingSuggestionSkipped?: boolean;
  passkeySkipped?: boolean;
  totp?: BindTotp;
  webAuthn?: BindWebAuthn[];
  backupCode?: BindBackupCode;
  emailVerificationCode?: boolean;
  phoneVerificationCode?: boolean;
};

export type SanitizedMfaData = {
  mfaEnabled?: boolean;
  mfaSkipped?: boolean;
  passkeySkipped?: boolean;
  totp?: Pick<BindTotp, 'type'>;
  webAuthn?: BindWebAuthn[];
  backupCode?: Omit<BindBackupCode, 'codes'>;
};

export const mfaDataGuard = z.object({
  mfaEnabled: z.boolean().optional(),
  mfaSkipped: z.boolean().optional(),
  additionalBindingSuggestionSkipped: z.boolean().optional(),
  passkeySkipped: z.boolean().optional(),
  totp: bindTotpGuard.optional(),
  webAuthn: z.array(bindWebAuthnGuard).optional(),
  backupCode: bindBackupCodeGuard.optional(),
  emailVerificationCode: z.boolean().optional(),
  phoneVerificationCode: z.boolean().optional(),
}) satisfies ToZodObject<MfaData>;

export const sanitizedMfaDataGuard = z.object({
  mfaEnabled: z.boolean().optional(),
  mfaSkipped: z.boolean().optional(),
  passkeySkipped: z.boolean().optional(),
  totp: z.object({ type: z.literal(MfaFactor.TOTP) }).optional(),
  webAuthn: z.array(bindWebAuthnGuard).optional(),
  backupCode: bindBackupCodeGuard.pick({ type: true }).optional(),
}) satisfies ToZodObject<SanitizedMfaData>;

const isPasskeySkipped = (logtoConfig: JsonObject): boolean => {
  const userPasskeySignInDataGuard = z.object({
    skipped: z.boolean().optional(),
  });

  const parsed = z
    .object({ [userPasskeySignInDataKey]: userPasskeySignInDataGuard })
    .safeParse(logtoConfig);

  return parsed.success ? parsed.data[userPasskeySignInDataKey].skipped === true : false;
};

const normalizePhoneNumber = (phone: string): string =>
  new PhoneNumberParser(phone).internationalNumber ?? phone;

type SubmitMfaValidationContext = {
  mfaSettings: MfaSettings;
  organizations?: Readonly<OrganizationWithRoles[]>;
  user: User;
  userFactors: MfaFactor[];
};

/**
 * This class stores all the pending new MFA settings for a user.
 */
export class Mfa {
  private readonly signInExperienceValidator: SignInExperienceValidator;
  #mfaEnabled?: boolean;
  #mfaSkipped?: boolean;
  #additionalBindingSuggestionSkipped?: boolean;
  #passkeySkipped?: boolean;
  #totp?: BindTotp;
  #webAuthn?: BindWebAuthn[];
  #backupCode?: BindBackupCode;
  #emailVerificationCode?: boolean;
  #phoneVerificationCode?: boolean;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: MfaData,
    private readonly interactionContext: InteractionContext
  ) {
    this.signInExperienceValidator = new SignInExperienceValidator(libraries, queries);

    this.#mfaEnabled = data.mfaEnabled;
    this.#mfaSkipped = data.mfaSkipped;
    this.#additionalBindingSuggestionSkipped = data.additionalBindingSuggestionSkipped;
    this.#passkeySkipped = data.passkeySkipped;
    this.#totp = data.totp;
    this.#webAuthn = data.webAuthn;
    this.#backupCode = data.backupCode;
    this.#emailVerificationCode = data.emailVerificationCode;
    this.#phoneVerificationCode = data.phoneVerificationCode;
  }

  get mfaEnabled() {
    return this.#mfaEnabled;
  }

  get mfaSkipped() {
    return this.#mfaSkipped;
  }

  get additionalBindingSuggestionSkipped() {
    return this.#additionalBindingSuggestionSkipped;
  }

  get bindMfaFactorsArray(): BindMfa[] {
    return [this.#totp, ...(this.#webAuthn ?? []), this.#backupCode].filter(Boolean);
  }

  get stagedVerificationCodeFactors(): MfaFactor[] {
    return [
      ...(this.#emailVerificationCode ? [MfaFactor.EmailVerificationCode] : []),
      ...(this.#phoneVerificationCode ? [MfaFactor.PhoneVerificationCode] : []),
    ];
  }

  /** Whether this interaction bound a TOTP or a WebAuthn factor, the factors backup codes back up. */
  get hasNewAuthenticatorFactor(): boolean {
    return Boolean(this.#totp ?? this.#webAuthn?.length);
  }

  markMfaEnabled() {
    this.#mfaEnabled = true;
  }

  /**
   * Discard everything staged here. Every value is a decision made for the user identified at the
   * time, from a bound factor's secret to a skip, so none may outlive that identification and be
   * written to another account. The counterpart of `Profile.cleanUp()`.
   */
  cleanUp() {
    this.#mfaEnabled = undefined;
    this.#mfaSkipped = undefined;
    this.#additionalBindingSuggestionSkipped = undefined;
    this.#passkeySkipped = undefined;
    this.#totp = undefined;
    this.#webAuthn = undefined;
    this.#backupCode = undefined;
    this.#emailVerificationCode = undefined;
    this.#phoneVerificationCode = undefined;
  }

  /**
   * Format the MFA verifications data to be updated in the user account
   */
  toUserMfaVerifications(): UserMfaVerificationsData {
    const verificationSet = new Set<User['mfaVerifications'][number]>();

    if (this.#totp) {
      verificationSet.add({
        type: MfaFactor.TOTP,
        key: this.#totp.secret,
        id: generateStandardId(),
        createdAt: new Date().toISOString(),
      });
    }

    if (this.#webAuthn) {
      for (const webAuthn of this.#webAuthn) {
        verificationSet.add({
          ...webAuthn,
          id: generateStandardId(),
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (this.#backupCode) {
      verificationSet.add({
        id: generateStandardId(),
        createdAt: new Date().toISOString(),
        type: MfaFactor.BackupCode,
        codes: this.#backupCode.codes.map((code) => ({ code })),
      });
    }

    // Email / SMS MFA explicit enrollment: persist enrolled verification code factors
    if (EnvSet.values.isDevFeaturesEnabled) {
      if (this.#emailVerificationCode) {
        verificationSet.add({
          id: generateStandardId(),
          createdAt: new Date().toISOString(),
          type: MfaFactor.EmailVerificationCode,
        });
      }

      if (this.#phoneVerificationCode) {
        verificationSet.add({
          id: generateStandardId(),
          createdAt: new Date().toISOString(),
          type: MfaFactor.PhoneVerificationCode,
        });
      }
    }

    return {
      mfaEnabled: this.mfaEnabled,
      mfaSkipped: this.mfaSkipped,
      additionalBindingSuggestionSkipped: this.additionalBindingSuggestionSkipped,
      passkeySkipped: this.#passkeySkipped,
      mfaVerifications: [...verificationSet],
    };
  }

  /**
   * @throws {RequestError} with status 422 if the MFA policy is not user controlled
   */
  async skip() {
    const mfaSettings = await this.signInExperienceValidator.getMfaSettings();
    const { policy } = mfaSettings;
    const user = await this.interactionContext.getIdentifiedUser();

    assertThat(
      !isNoSkipMfaPolicy(policy) && !(await isMfaRequiredByUser(this.queries, mfaSettings, user)),
      new RequestError({
        code: 'session.mfa.mfa_policy_not_user_controlled',
        status: 422,
      })
    );

    this.#mfaSkipped = true;
  }

  /**
   * Mark the passkey binding as skipped and persist to user config.
   */
  skipPasskey() {
    this.#passkeySkipped = true;
  }

  /**
   * @throws {RequestError} with status 400 if the verification record is not verified
   * @throws {RequestError} with status 400 if the verification record has no secret
   * @throws {RequestError} with status 404 if the verification record is not found
   * @throws {RequestError} with status 400 if TOTP is not enabled in the sign-in experience
   * @throws {RequestError} with status 422 if the user already has a TOTP factor
   */
  async addTotpByVerificationId(verificationId: string, log?: LogEntry) {
    const verificationRecord = this.interactionContext.consumeForBindByType(
      VerificationType.TOTP,
      verificationId
    );

    log?.append({
      verification: verificationRecord.toJson(),
    });

    const bindTotp = verificationRecord.toBindMfa();

    await this.checkMfaFactorsEnabledInSignInExperience([MfaFactor.TOTP]);
    const { mfaVerifications } = await this.interactionContext.getIdentifiedUser();

    // A user can only bind one TOTP factor
    assertThat(
      mfaVerifications.every(({ type }) => type !== MfaFactor.TOTP),
      new RequestError({
        code: 'user.totp_already_in_use',
        status: 422,
      })
    );

    this.#totp = bindTotp;
  }

  /**
   * @throws {RequestError} with status 400 if the verification record is not verified
   * @throws {RequestError} with status 400 if the verification record has no registration data
   * @throws {RequestError} with status 404 if the verification record is not found
   * @throws {RequestError} with status 400 if WebAuthn is not enabled in the sign-in experience
   */
  async addWebAuthnByVerificationId(verificationId: string, log?: LogEntry) {
    const verificationRecord = this.interactionContext.consumeForBindByType(
      VerificationType.WebAuthn,
      verificationId
    );

    log?.append({
      verification: verificationRecord.toJson(),
    });

    const bindWebAuthn = verificationRecord.toBindMfa();

    await this.checkMfaFactorsEnabledInSignInExperience([MfaFactor.WebAuthn]);
    this.#webAuthn = [...(this.#webAuthn ?? []), bindWebAuthn];
  }

  /**
   * Add new backup codes to the user account.
   *
   * - Any existing backup code factor will be replaced with the new one.
   *
   * @throws {RequestError} with status 404 if no pending backup codes are found
   * @throws {RequestError} with status 400 if Backup Code is not enabled in the sign-in experience
   * @throws {RequestError} with status 422 if the backup code is the only MFA factor
   */
  async addBackupCodeByVerificationId(verificationId: string, log?: LogEntry) {
    const verificationRecord = this.interactionContext.consumeForBindByType(
      VerificationType.BackupCode,
      verificationId
    );

    log?.append({
      verification: verificationRecord.toJson(),
    });

    await this.checkMfaFactorsEnabledInSignInExperience([MfaFactor.BackupCode]);

    const userFactors = await this.getUserMfaFactors();
    const hasOtherMfaFactors = userFactors.some((factor) => factor !== MfaFactor.BackupCode);

    assertThat(
      hasOtherMfaFactors,
      new RequestError({
        code: 'session.mfa.backup_code_can_not_be_alone',
        status: 422,
      })
    );

    this.#backupCode = verificationRecord.toBindMfa();
  }

  /**
   * Enroll an email or phone verification code factor from a verified code record.
   *
   * When the verified identifier matches the user's existing primary identifier under explicit
   * enrollment, no profile update needs to be staged.
   *
   * @throws {RequestError} with status 400 if the factor is not enabled or record is not verified
   * @throws {RequestError} with status 404 if the verification record belongs to another user
   */
  async addVerificationCodeByVerificationId(
    factor: MfaFactor.EmailVerificationCode | MfaFactor.PhoneVerificationCode,
    verificationId: string,
    log?: LogEntry
  ): Promise<{
    identifierValue: string;
    isExistingPrimaryIdentifier: boolean;
  }> {
    const verificationType =
      factor === MfaFactor.EmailVerificationCode
        ? VerificationType.EmailVerificationCode
        : VerificationType.PhoneVerificationCode;

    const verificationRecord = this.interactionContext.consumeForBindByType(
      verificationType,
      verificationId
    );

    await this.checkMfaFactorsEnabledInSignInExperience([factor]);

    const user = await this.interactionContext.getIdentifiedUser();

    assertThat(
      !verificationRecord.userId || verificationRecord.userId === user.id,
      new RequestError({ code: 'session.verification_session_not_found', status: 404 })
    );

    const profile = verificationRecord.toUserProfile();
    const identifierValue = 'primaryEmail' in profile ? profile.primaryEmail : profile.primaryPhone;

    // Email / SMS MFA explicit enrollment: allow enrolling the user's existing primary email or
    // phone without staging a duplicate profile update.
    const isExistingPrimaryIdentifier =
      EnvSet.values.isDevFeaturesEnabled &&
      this.matchesExistingPrimaryIdentifier(factor, user, identifierValue);

    if (isExistingPrimaryIdentifier) {
      log?.append({
        verification: verificationRecord.toJson(),
      });
    }

    if (factor === MfaFactor.EmailVerificationCode) {
      this.#emailVerificationCode = true;
    } else {
      this.#phoneVerificationCode = true;
    }

    return { identifierValue, isExistingPrimaryIdentifier };
  }

  /**
   * Mark the optional suggestion as skipped and persist to user config.
   */
  skipAdditionalBindingSuggestion() {
    this.#additionalBindingSuggestionSkipped = true;
  }

  /**
   * @throws {RequestError} with status 400 if the mfa factors are not enabled in the sign-in experience
   */
  async checkAvailability() {
    const newBindMfaFactors = deduplicate([
      ...this.bindMfaFactorsArray.map(({ type }) => type),
      ...this.stagedVerificationCodeFactors,
    ]);
    await this.checkMfaFactorsEnabledInSignInExperience(newBindMfaFactors);
  }

  /**
   * Assert MFA fulfillment for the current interaction submit.
   *
   * @param asNoSkipMandatoryPolicy Run the check exactly as a no-skip mandatory policy would:
   * neither the policy's nor the user's skips apply and `user.missing_mfa` is thrown without
   * `skippable`. A requested class is enforced this way, since the relying party asked for the
   * class; the tenant's backup-code and additional-factor rules apply unchanged.
   * @param enrollmentFactors The factors the interaction may bind to reach the class it pursues,
   * defaulting to the configured factors. A requested class offers only the factors that reach
   * it, so binding one cannot leave the submission below the class.
   */
  async assertMfaFulfilled({
    asNoSkipMandatoryPolicy = false,
    enrollmentFactors,
  }: {
    asNoSkipMandatoryPolicy?: boolean;
    enrollmentFactors?: readonly MfaFactor[];
  } = {}) {
    const submitMfaValidationContext = await this.buildSubmitMfaValidationContext();

    // For optional MFA, prompt an MFA enrollment page in prior if user hasn't set up or skipped MFA binding yet.
    // A no-skip mandatory requirement has no optional step to offer, exactly as its policy bypasses this check.
    if (!asNoSkipMandatoryPolicy) {
      await this.assertOptionalMfaEnablement(submitMfaValidationContext);
    }

    await this.assertUserMandatoryMfaFulfilled(
      submitMfaValidationContext,
      asNoSkipMandatoryPolicy,
      enrollmentFactors
    );
  }

  async assertPasskeySignInFulfilled() {
    const { passkeySignIn } = await this.signInExperienceValidator.getSignInExperienceData();
    const { logtoConfig, mfaVerifications } = await this.interactionContext.getIdentifiedUser();

    if (passkeySignIn.enabled && !(this.#passkeySkipped ?? isPasskeySkipped(logtoConfig))) {
      const hasPasskey =
        Boolean(this.data.webAuthn?.length) ||
        mfaVerifications.some((verification) => verification.type === MfaFactor.WebAuthn);

      // Do not prompt for a passkey the binding route would reject: a sign-in that skipped MFA
      // verification may not enroll a factor until it proves an existing one.
      assertThat(
        hasPasskey || !(await this.interactionContext.canBindMfa()),
        new RequestError({ code: 'user.passkey_preferred', status: 422 })
      );
    }
  }

  get data(): MfaData {
    return {
      mfaEnabled: this.mfaEnabled,
      mfaSkipped: this.mfaSkipped,
      additionalBindingSuggestionSkipped: this.additionalBindingSuggestionSkipped,
      passkeySkipped: this.#passkeySkipped,
      totp: this.#totp,
      webAuthn: this.#webAuthn,
      backupCode: this.#backupCode,
      emailVerificationCode: this.#emailVerificationCode,
      phoneVerificationCode: this.#phoneVerificationCode,
    };
  }

  get sanitizedData(): SanitizedMfaData {
    return {
      mfaEnabled: this.mfaEnabled,
      mfaSkipped: this.mfaSkipped,
      passkeySkipped: this.#passkeySkipped,
      totp: cond(this.#totp && pick(this.#totp, 'type')),
      webAuthn: this.#webAuthn,
      backupCode: cond(this.#backupCode && pick(this.#backupCode, 'type')),
    };
  }

  private async assertOptionalMfaEnablement(
    submitMfaValidationContext: SubmitMfaValidationContext
  ) {
    const snapshot = await this.buildEnrollmentSnapshot(submitMfaValidationContext);
    const decision = resolveMfaEnrollmentRequirement(snapshot);

    if (decision.shouldBackfillMfaEnabled) {
      this.markMfaEnabled();
    }

    if (decision.kind === MfaEnrollmentKind.SuggestEnable) {
      throw new RequestError({ code: 'user.suggest_mfa', status: 422 });
    }
  }

  private async assertUserMandatoryMfaFulfilled(
    submitMfaValidationContext: SubmitMfaValidationContext,
    asNoSkipMandatoryPolicy = false,
    enrollmentFactors?: readonly MfaFactor[]
  ) {
    const { mfaSettings } = submitMfaValidationContext;
    const configuredFactors =
      mfaSettings.factors.length > 0
        ? await this.signInExperienceValidator.getConfiguredMfaFactors()
        : [];
    const baseSnapshot = await this.buildEnrollmentSnapshot(submitMfaValidationContext, {
      asNoSkipMandatoryPolicy,
      enrollmentFactors,
      configuredFactors,
    });
    const preBindDecision = resolveMfaEnrollmentRequirement(baseSnapshot);

    if (preBindDecision.kind === MfaEnrollmentKind.Missing) {
      throw new RequestError(
        { code: 'user.missing_mfa', status: 422 },
        {
          availableFactors: preBindDecision.availableFactors,
          ...conditional(
            preBindDecision.maskedIdentifiers && {
              maskedIdentifiers: preBindDecision.maskedIdentifiers,
            }
          ),
          ...conditional(preBindDecision.skippable && { skippable: true }),
        }
      );
    }

    if (
      preBindDecision.kind === MfaEnrollmentKind.None &&
      isEnrollmentExemptionReason(preBindDecision.reason)
    ) {
      return;
    }

    const canBindMfa = await this.interactionContext.canBindMfa();

    if (!mfaSettings.skipAdditionalBindingSuggestion) {
      await this.guardAdditionalBindingSuggestion({ ...baseSnapshot, canBindMfa });
    }

    const postBindDecision = resolveMfaEnrollmentRequirement({ ...baseSnapshot, canBindMfa });

    assertThat(
      postBindDecision.kind !== MfaEnrollmentKind.BackupCode,
      new RequestError({
        code: 'session.mfa.backup_code_required',
        status: 422,
      })
    );
  }

  /**
   * Optionally suggest user to bind additional MFA factors.
   * Encapsulates suggestion logic and throws a 422 with `session.mfa.suggest_additional_mfa`
   * when conditions are met.
   * The purpose is to suggest another MFA factor if the user has only Email, Phone, or Passkey factor,
   * which can technically be used for both sign-in and MFA verification, not for MFA verification only.
   */
  private async guardAdditionalBindingSuggestion(snapshot: MfaEnrollmentSnapshot) {
    if (!getCandidateAdditionalMfaFactors(snapshot)) {
      return;
    }

    const { signUp, passkeySignIn } =
      await this.signInExperienceValidator.getSignInExperienceData();
    const currentProfile = this.interactionContext.getCurrentProfile();
    const decision = resolveMfaEnrollmentRequirement({
      ...snapshot,
      additionalSuggestionContext: {
        signUp,
        passkeySignInEnabled: Boolean(passkeySignIn.enabled),
        effectiveEmail: currentProfile.primaryEmail ?? snapshot.primaryEmail,
        effectivePhone: currentProfile.primaryPhone ?? snapshot.primaryPhone,
        sessionBoundDualPurposeFactors: {
          emailVerificationCode: this.#emailVerificationCode,
          phoneVerificationCode: this.#phoneVerificationCode,
          webAuthn: Boolean(this.#webAuthn?.length),
        },
      },
    });

    if (decision.kind === MfaEnrollmentKind.SuggestAdditional) {
      throw new RequestError(
        { code: 'session.mfa.suggest_additional_mfa', status: 422 },
        {
          availableFactors: decision.availableFactors,
          maskedIdentifiers: decision.maskedIdentifiers ?? {},
          ...conditional(decision.boundFactors && { boundFactors: decision.boundFactors }),
          isWebAuthnUsedAsSignInPasskey: decision.isWebAuthnUsedAsSignInPasskey ?? false,
          skippable: true,
          suggestion: true,
        }
      );
    }
  }

  private matchesExistingPrimaryIdentifier(
    factor: MfaFactor.EmailVerificationCode | MfaFactor.PhoneVerificationCode,
    user: User,
    identifierValue: string
  ): boolean {
    if (factor === MfaFactor.EmailVerificationCode) {
      return Boolean(
        user.primaryEmail && user.primaryEmail.toLowerCase() === identifierValue.toLowerCase()
      );
    }

    return Boolean(
      user.primaryPhone &&
        normalizePhoneNumber(user.primaryPhone) === normalizePhoneNumber(identifierValue)
    );
  }

  private async checkMfaFactorsEnabledInSignInExperience(newBindMfaFactors: MfaFactor[]) {
    const { passkeySignIn } = await this.signInExperienceValidator.getSignInExperienceData();
    const availableFactors = await this.signInExperienceValidator.getMfaFactorsEnabledForBinding();

    const isFactorsEnabled = newBindMfaFactors.every(
      (newBindFactor) =>
        availableFactors.includes(newBindFactor) ||
        // Bypass binding WebAuthn when passkey sign-in is enabled, regardless of whether WebAuthn is enabled as an MFA factor.
        (newBindFactor === MfaFactor.WebAuthn && passkeySignIn.enabled)
    );

    assertThat(isFactorsEnabled, new RequestError({ code: 'session.mfa.mfa_factor_not_enabled' }));
  }

  private async buildSubmitMfaValidationContext(): Promise<SubmitMfaValidationContext> {
    const [mfaSettings, user] = await Promise.all([
      this.signInExperienceValidator.getMfaSettings(),
      this.interactionContext.getIdentifiedUser(),
    ]);
    const [userFactors, organizations] = await Promise.all([
      this.getUserMfaFactors({ mfaSettings, user }),
      mfaSettings.factors.length > 0 &&
      mfaSettings.organizationRequiredMfaPolicy === OrganizationRequiredMfaPolicy.Mandatory
        ? this.queries.organizations.relations.users.getOrganizationsByUserId(user.id)
        : undefined,
    ]);

    return {
      mfaSettings,
      organizations,
      user,
      userFactors,
    };
  }

  private async buildEnrollmentSnapshot(
    submitMfaValidationContext: SubmitMfaValidationContext,
    {
      asNoSkipMandatoryPolicy = false,
      enrollmentFactors,
      configuredFactors = [],
    }: {
      asNoSkipMandatoryPolicy?: boolean;
      enrollmentFactors?: readonly MfaFactor[];
      configuredFactors?: readonly MfaFactor[];
    } = {}
  ): Promise<MfaEnrollmentSnapshot> {
    const { mfaSettings, organizations, user, userFactors } = submitMfaValidationContext;
    const userMfaData = parseUserMfaConfig(user.logtoConfig);
    const isMfaRequired = await isMfaRequiredByUser(this.queries, mfaSettings, user, organizations);

    return {
      isDevFeaturesEnabled: EnvSet.values.isDevFeaturesEnabled,
      mfaSettings,
      interactionEvent: this.interactionContext.getInteractionEvent(),
      userMfaConfig: {
        ...userMfaData,
        enabled: this.#mfaEnabled ?? userMfaData.enabled,
        skipped: this.#mfaSkipped ?? userMfaData.skipped,
      },
      isMfaRequiredByUser: isMfaRequired,
      asNoSkipMandatoryPolicy,
      enrollmentFactors,
      configuredFactors,
      userFactors,
      boundMfaFactors: this.bindMfaFactorsArray.map(({ type }) => type),
      canBindMfa: false,
      additionalBindingSuggestionSkippedInSession: this.additionalBindingSuggestionSkipped,
      primaryEmail: user.primaryEmail ?? undefined,
      primaryPhone: user.primaryPhone ?? undefined,
    };
  }

  private async getUserMfaFactors({
    mfaSettings,
    user,
  }: {
    mfaSettings?: MfaSettings;
    user?: User;
  } = {}): Promise<MfaFactor[]> {
    const resolvedMfaSettings =
      mfaSettings ?? (await this.signInExperienceValidator.getMfaSettings());
    const resolvedUser = user ?? (await this.interactionContext.getIdentifiedUser());
    const currentProfile = this.interactionContext.getCurrentProfile();

    // Both staged profile fields and staged MFA slots count toward active factors here.
    const existingFactors = getAllUserEnabledMfaVerifications(
      resolvedMfaSettings,
      resolvedUser,
      currentProfile,
      this.stagedVerificationCodeFactors
    );
    const inSessionBoundFactors = [
      ...(this.#totp ? [MfaFactor.TOTP] : []),
      ...(this.#webAuthn?.length ? [MfaFactor.WebAuthn] : []),
    ];

    return deduplicate([...existingFactors, ...inSessionBoundFactors]);
  }
}
/* eslint-enable max-lines */
