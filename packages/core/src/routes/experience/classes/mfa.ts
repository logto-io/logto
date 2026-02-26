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
  InteractionEvent,
  type JsonObject,
  MfaPolicy,
  type User,
  VerificationType,
  type Mfa as MfaSettings,
  OrganizationRequiredMfaPolicy,
  MfaFactor,
  SignInIdentifier,
  AlternativeSignUpIdentifier,
  userMfaDataKey,
  userPasskeySignInDataKey,
} from '@logto/schemas';
import { generateStandardId, maskEmail, maskPhone } from '@logto/shared';
import { cond, condObject, deduplicate, pick, type Optional } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type InteractionContext } from '../types.js';

import {
  getAllUserEnabledMfaVerifications,
  getProfileMfaFactors,
  sortMfaFactors,
} from './helpers.js';
import type { AdaptiveMfaResult } from './libraries/adaptive-mfa-validator/types.js';
import { SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';

export type MfaData = {
  mfaSkipped?: boolean;
  /**
   * Whether user skipped the optional suggestion to add another MFA factor during registration.
   * This flag lives only in the current interaction and should NOT be persisted to user profile.
   */
  additionalBindingSuggestionSkipped?: boolean;
  passkeySkipped?: boolean;
  totp?: BindTotp;
  webAuthn?: BindWebAuthn[];
  backupCode?: BindBackupCode;
};

export type SanitizedMfaData = {
  mfaSkipped?: boolean;
  passkeySkipped?: boolean;
  totp?: Pick<BindTotp, 'type'>;
  webAuthn?: BindWebAuthn[];
  backupCode?: Omit<BindBackupCode, 'codes'>;
};

export const mfaDataGuard = z.object({
  mfaSkipped: z.boolean().optional(),
  additionalBindingSuggestionSkipped: z.boolean().optional(),
  passkeySkipped: z.boolean().optional(),
  totp: bindTotpGuard.optional(),
  webAuthn: z.array(bindWebAuthnGuard).optional(),
  backupCode: bindBackupCodeGuard.optional(),
}) satisfies ToZodObject<MfaData>;

export const sanitizedMfaDataGuard = z.object({
  mfaSkipped: z.boolean().optional(),
  passkeySkipped: z.boolean().optional(),
  totp: z.object({ type: z.literal(MfaFactor.TOTP) }).optional(),
  webAuthn: z.array(bindWebAuthnGuard).optional(),
  backupCode: bindBackupCodeGuard.pick({ type: true }).optional(),
}) satisfies ToZodObject<SanitizedMfaData>;

/**
 * Check if the user has skipped MFA binding
 */
const isMfaSkipped = (logtoConfig: JsonObject): boolean => {
  const userMfaDataGuard = z.object({
    skipped: z.boolean().optional(),
  });

  const parsed = z.object({ [userMfaDataKey]: userMfaDataGuard }).safeParse(logtoConfig);

  return parsed.success ? parsed.data[userMfaDataKey].skipped === true : false;
};

const isPasskeySkipped = (logtoConfig: JsonObject): boolean => {
  const userPasskeySignInDataGuard = z.object({
    skipped: z.boolean().optional(),
  });

  const parsed = z
    .object({ [userPasskeySignInDataKey]: userPasskeySignInDataGuard })
    .safeParse(logtoConfig);

  return parsed.success ? parsed.data[userPasskeySignInDataKey].skipped === true : false;
};

type SubmitMfaValidationContext = {
  mfaSettings: MfaSettings;
  user: User;
  userFactors: MfaFactor[];
};

/**
 * This class stores all the pending new MFA settings for a user.
 */
export class Mfa {
  private readonly signInExperienceValidator: SignInExperienceValidator;
  #mfaSkipped?: boolean;
  #additionalBindingSuggestionSkipped?: boolean;
  #passkeySkipped?: boolean;
  #totp?: BindTotp;
  #webAuthn?: BindWebAuthn[];
  #backupCode?: BindBackupCode;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: MfaData,
    private readonly interactionContext: InteractionContext
  ) {
    this.signInExperienceValidator = new SignInExperienceValidator(libraries, queries);

    this.#mfaSkipped = data.mfaSkipped;
    this.#additionalBindingSuggestionSkipped = data.additionalBindingSuggestionSkipped;
    this.#passkeySkipped = data.passkeySkipped;
    this.#totp = data.totp;
    this.#webAuthn = data.webAuthn;
    this.#backupCode = data.backupCode;
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

  /**
   * Format the MFA verifications data to be updated in the user account
   */
  toUserMfaVerifications(): {
    mfaSkipped?: boolean;
    passkeySkipped?: boolean;
    mfaVerifications: User['mfaVerifications'];
  } {
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

    return {
      mfaSkipped: this.mfaSkipped,
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
      policy !== MfaPolicy.Mandatory &&
        !(await this.isMfaRequiredByUserOrganizations(mfaSettings, user.id)),
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
   *
   * - Any existing TOTP factor will be replaced with the new one.
   */
  async addTotpByVerificationId(verificationId: string, log?: LogEntry) {
    const verificationRecord = this.interactionContext.getVerificationRecordByTypeAndId(
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
    const verificationRecord = this.interactionContext.getVerificationRecordByTypeAndId(
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
    const verificationRecord = this.interactionContext.getVerificationRecordByTypeAndId(
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
   * Mark the optional suggestion as skipped for this interaction.
   * No persistence to user account.
   */
  skipAdditionalBindingSuggestion() {
    this.#additionalBindingSuggestionSkipped = true;
  }

  /**
   * @throws {RequestError} with status 400 if the mfa factors are not enabled in the sign-in experience
   */
  async checkAvailability() {
    const newBindMfaFactors = deduplicate(this.bindMfaFactorsArray.map(({ type }) => type));
    await this.checkMfaFactorsEnabledInSignInExperience(newBindMfaFactors);
  }

  /**
   * Optionally suggest user to bind additional MFA factors during registration.
   * Encapsulates suggestion logic and throws a 422 with `session.mfa.suggest_additional_mfa`
   * when conditions are met.
   * The purpose is to suggest another MFA factor if the user has only one Email or Phone factor.
   */
  // eslint-disable-next-line complexity
  async guardAdditionalBindingSuggestion(
    factorsInUser: MfaFactor[],
    availableFactors: MfaFactor[]
  ) {
    // Only suggest during registration flow
    if (this.interactionContext.getInteractionEvent() !== InteractionEvent.Register) {
      return;
    }

    // If no Email/Phone factor in use, then the user is not registered by Email/Phone
    if (
      !factorsInUser.includes(MfaFactor.EmailVerificationCode) &&
      !factorsInUser.includes(MfaFactor.PhoneVerificationCode)
    ) {
      return;
    }

    const { signUp } = await this.signInExperienceValidator.getSignInExperienceData();
    // If the user has email, but not registered by email, no suggestion
    if (
      factorsInUser.includes(MfaFactor.EmailVerificationCode) &&
      !signUp.identifiers.includes(SignInIdentifier.Email) &&
      !signUp.secondaryIdentifiers?.some(
        ({ identifier }) =>
          identifier === SignInIdentifier.Email ||
          identifier === AlternativeSignUpIdentifier.EmailOrPhone
      )
    ) {
      return;
    }
    // If the user has phone, but not registered by phone, no suggestion
    if (
      factorsInUser.includes(MfaFactor.PhoneVerificationCode) &&
      !signUp.identifiers.includes(SignInIdentifier.Phone) &&
      !signUp.secondaryIdentifiers?.some(
        ({ identifier }) =>
          identifier === SignInIdentifier.Phone ||
          identifier === AlternativeSignUpIdentifier.EmailOrPhone
      )
    ) {
      return;
    }

    const sortedFactors = sortMfaFactors(availableFactors);

    const additionalFactors = sortedFactors.filter((factor) => !factorsInUser.includes(factor));

    // Respect user's choice to skip suggestion for this interaction
    if (this.additionalBindingSuggestionSkipped) {
      return;
    }

    // If user already bound an MFA in this interaction, don't suggest again
    if (this.bindMfaFactorsArray.length > 0) {
      return;
    }

    // No available factors to suggest
    if (additionalFactors.length === 0) {
      return;
    }

    // Get user data for masking
    const user = await this.interactionContext.getIdentifiedUser();
    const { primaryEmail, primaryPhone } = user;

    // Build masked identifiers for bound factors
    const maskedIdentifiers = condObject({
      [MfaFactor.EmailVerificationCode]:
        factorsInUser.includes(MfaFactor.EmailVerificationCode) &&
        primaryEmail &&
        maskEmail(primaryEmail),
      [MfaFactor.PhoneVerificationCode]:
        factorsInUser.includes(MfaFactor.PhoneVerificationCode) &&
        primaryPhone &&
        maskPhone(primaryPhone),
    });

    throw new RequestError(
      { code: 'session.mfa.suggest_additional_mfa', status: 422 },
      {
        availableFactors: sortedFactors,
        maskedIdentifiers,
        skippable: true,
        suggestion: true,
      }
    );
  }

  /** Assert MFA fulfillment for the current interaction submit. */
  async assertMfaFulfilled({
    adaptiveMfaResult,
  }: {
    adaptiveMfaResult: Optional<AdaptiveMfaResult>;
  }) {
    // Compute shared async context once per submit to avoid duplicated reads
    // across adaptive and mandatory phases.
    const submitMfaValidationContext = await this.buildSubmitMfaValidationContext();

    await this.assertAdaptiveMfaBindingFulfilled(submitMfaValidationContext, adaptiveMfaResult);

    await this.assertUserMandatoryMfaFulfilled(submitMfaValidationContext);
  }

  async assertPasskeySignInFulfilled() {
    const { passkeySignIn } = await this.signInExperienceValidator.getSignInExperienceData();
    const { logtoConfig, mfaVerifications } = await this.interactionContext.getIdentifiedUser();

    if (passkeySignIn.enabled && !(this.#passkeySkipped ?? isPasskeySkipped(logtoConfig))) {
      const hasPasskey =
        Boolean(this.data.webAuthn?.length) ||
        mfaVerifications.some((verification) => verification.type === MfaFactor.WebAuthn);

      assertThat(hasPasskey, new RequestError({ code: 'user.passkey_preferred', status: 422 }));
    }
  }

  get data(): MfaData {
    return {
      mfaSkipped: this.mfaSkipped,
      additionalBindingSuggestionSkipped: this.additionalBindingSuggestionSkipped,
      passkeySkipped: this.#passkeySkipped,
      totp: this.#totp,
      webAuthn: this.#webAuthn,
      backupCode: this.#backupCode,
    };
  }

  get sanitizedData(): SanitizedMfaData {
    return {
      mfaSkipped: this.mfaSkipped,
      passkeySkipped: this.#passkeySkipped,
      totp: cond(this.#totp && pick(this.#totp, 'type')),
      webAuthn: this.#webAuthn,
      backupCode: cond(this.#backupCode && pick(this.#backupCode, 'type')),
    };
  }

  private async assertAdaptiveMfaBindingFulfilled(
    submitMfaValidationContext: SubmitMfaValidationContext,
    adaptiveMfaResult: Optional<AdaptiveMfaResult>
  ) {
    if (!EnvSet.values.isDevFeaturesEnabled || !adaptiveMfaResult?.requiresMfa) {
      return;
    }

    const { userFactors: availableFactorsForVerification } = submitMfaValidationContext;

    // Adaptive MFA binding is only needed when risk requires MFA and there is no available
    // factor for verification in the current interaction context.
    const shouldEnforceAdaptiveMfaBinding = availableFactorsForVerification.length === 0;

    if (!shouldEnforceAdaptiveMfaBinding) {
      return;
    }

    // Adaptive binding should only expose factors that users can bind right now.
    // This excludes non-bindable factors (e.g. backup code) for actionability.
    const bindableFactors = await this.signInExperienceValidator.getAvailableMfaFactorsForBinding();

    // Tenant has no bindable MFA factors enabled in SIE (e.g. all disabled).
    // In this case there is no actionable binding step for end users, so skip
    // adaptive binding enforcement instead of throwing a non-actionable error.
    if (bindableFactors.length === 0) {
      return;
    }

    throw new RequestError(
      { code: 'user.missing_mfa', status: 422 },
      { availableFactors: bindableFactors }
    );
  }

  /**
   * @throws {RequestError} with status 422 if the user has not bound the required MFA factors
   * @throws {RequestError} with status 422 if the user has not bound the backup code but enabled in the sign-in experience
   * @throws {RequestError} with status 422 if the user existing backup codes is empty, new backup codes is required
   */
  // eslint-disable-next-line complexity
  private async assertUserMandatoryMfaFulfilled(
    submitMfaValidationContext: SubmitMfaValidationContext
  ) {
    const { mfaSettings } = submitMfaValidationContext;
    const { policy, factors } = mfaSettings;

    // If there are no factors, then there is nothing to check
    if (factors.length === 0) {
      return;
    }

    const { user: identifiedUser } = submitMfaValidationContext;
    const { logtoConfig, id: userId } = identifiedUser;

    const isMfaRequiredByUserOrganizations = await this.isMfaRequiredByUserOrganizations(
      mfaSettings,
      userId
    );

    // If the policy is no prompt, and mfa is not required by the user organizations, then there is nothing to check
    if (policy === MfaPolicy.NoPrompt && !isMfaRequiredByUserOrganizations) {
      return;
    }

    // If the policy is not mandatory and the user has skipped MFA,
    // and MFA is not required by the user organizations, then there is nothing to check
    if (
      policy !== MfaPolicy.Mandatory &&
      (this.#mfaSkipped ?? isMfaSkipped(logtoConfig)) &&
      !isMfaRequiredByUserOrganizations
    ) {
      return;
    }

    // If the policy is prompt only at sign-in, and the event is register, skip check
    if (
      this.interactionContext.getInteractionEvent() === InteractionEvent.Register &&
      policy === MfaPolicy.PromptOnlyAtSignIn
    ) {
      return;
    }

    // Mandatory policy should check the factor set configured by tenant/org policy.
    // This is policy-required scope (may include backup requirement via separate assertion),
    // not the bindable-factor scope used by adaptive binding enforcement.
    const requiredFactors = sortMfaFactors(
      factors.filter((factor) => factor !== MfaFactor.BackupCode)
    );

    const { userFactors: factorsInUser } = submitMfaValidationContext;
    const factorsInBind = this.bindMfaFactorsArray.map(({ type }) => type);
    const linkedFactors = deduplicate([...factorsInUser, ...factorsInBind]);

    // Assert that the user has at least one of the required factors bound
    assertThat(
      requiredFactors.some((factor) => linkedFactors.includes(factor)),
      new RequestError(
        { code: 'user.missing_mfa', status: 422 },
        policy === MfaPolicy.Mandatory || isMfaRequiredByUserOrganizations
          ? { availableFactors: requiredFactors }
          : { availableFactors: requiredFactors, skippable: true }
      )
    );

    // Optional suggestion: Let Mfa decide whether to suggest additional binding during registration
    await this.guardAdditionalBindingSuggestion(factorsInUser, requiredFactors);

    // Assert backup code
    assertThat(
      !factors.includes(MfaFactor.BackupCode) || linkedFactors.includes(MfaFactor.BackupCode),
      new RequestError({
        code: 'session.mfa.backup_code_required',
        status: 422,
      })
    );
  }

  private async checkMfaFactorsEnabledInSignInExperience(newBindMfaFactors: MfaFactor[]) {
    const availableFactors = await this.signInExperienceValidator.getEnabledMfaFactorsForBinding();

    const isFactorsEnabled = newBindMfaFactors.every((newBindFactor) =>
      availableFactors.includes(newBindFactor)
    );

    assertThat(isFactorsEnabled, new RequestError({ code: 'session.mfa.mfa_factor_not_enabled' }));
  }

  private async isMfaRequiredByUserOrganizations(mfaSettings: MfaSettings, userId: string) {
    if (mfaSettings.organizationRequiredMfaPolicy !== OrganizationRequiredMfaPolicy.Mandatory) {
      return false;
    }

    const organizations =
      await this.queries.organizations.relations.users.getOrganizationsByUserId(userId);

    return organizations.some(({ isMfaRequired }) => isMfaRequired);
  }

  /**
   * Build shared context for submit-time MFA fulfillment checks.
   *
   * @remarks
   * This context is shared by both adaptive MFA binding check and mandatory MFA policy check,
   * so we can reuse the same resolved values and avoid duplicated async logic in one submit flow.
   *
   * Although we still call async getters here, both of them already rely on internal caching:
   * - `signInExperienceValidator.getMfaSettings()` reads from cached sign-in experience data.
   * - `interactionContext.getIdentifiedUser()` resolves to the interaction-level user cache.
   */
  private async buildSubmitMfaValidationContext(): Promise<SubmitMfaValidationContext> {
    const [mfaSettings, user] = await Promise.all([
      this.signInExperienceValidator.getMfaSettings(),
      this.interactionContext.getIdentifiedUser(),
    ]);
    const userFactors = await this.getUserMfaFactors({ mfaSettings, user });

    return {
      mfaSettings,
      user,
      userFactors,
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

    const existingFactors = getAllUserEnabledMfaVerifications(resolvedMfaSettings, resolvedUser);
    const inSessionBoundFactors = [
      ...(this.#totp ? [MfaFactor.TOTP] : []),
      ...(this.#webAuthn?.length ? [MfaFactor.WebAuthn] : []),
      ...getProfileMfaFactors(resolvedMfaSettings, currentProfile),
    ];

    return deduplicate([...existingFactors, ...inSessionBoundFactors]);
  }
}
/* eslint-enable max-lines */
