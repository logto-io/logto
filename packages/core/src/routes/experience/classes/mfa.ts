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
  MfaFactor,
  MfaPolicy,
  type User,
  VerificationType,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { deduplicate } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { type LogEntry } from '#src/middleware/koa-audit-log.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type InteractionContext } from '../types.js';

import { SignInExperienceValidator } from './libraries/sign-in-experience-validator.js';

export type MfaData = {
  mfaSkipped?: boolean;
  totp?: BindTotp;
  webAuthn?: BindWebAuthn[];
  backupCode?: BindBackupCode;
};

export const mfaDataGuard = z.object({
  mfaSkipped: z.boolean().optional(),
  totp: bindTotpGuard.optional(),
  webAuthn: z.array(bindWebAuthnGuard).optional(),
  backupCode: bindBackupCodeGuard.optional(),
}) satisfies ToZodObject<MfaData>;

export const userMfaDataKey = 'mfa';

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

/**
 * Filter out backup codes mfa verifications that have been used
 */
const filterOutEmptyBackupCodes = (
  mfaVerifications: User['mfaVerifications']
): User['mfaVerifications'] =>
  mfaVerifications.filter((mfa) => {
    if (mfa.type === MfaFactor.BackupCode) {
      return mfa.codes.some((code) => !code.usedAt);
    }
    return true;
  });

/**
 * This class stores all the pending new MFA settings for a user.
 */
export class Mfa {
  private readonly signInExperienceValidator: SignInExperienceValidator;
  #mfaSkipped?: boolean;
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
    const { mfaSkipped, totp, webAuthn, backupCode } = data;

    this.#mfaSkipped = mfaSkipped;
    this.#totp = totp;
    this.#webAuthn = webAuthn;
    this.#backupCode = backupCode;
  }

  get mfaSkipped() {
    return this.#mfaSkipped;
  }

  get bindMfaFactorsArray(): BindMfa[] {
    return [this.#totp, ...(this.#webAuthn ?? []), this.#backupCode].filter(Boolean);
  }

  /**
   * Format the MFA verifications data to be updated in the user account
   */
  toUserMfaVerifications(): {
    mfaSkipped?: boolean;
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
      mfaVerifications: [...verificationSet],
    };
  }

  /**
   * @throws {RequestError} with status 422 if the MFA policy is not user controlled
   */
  async skip() {
    const { policy } = await this.signInExperienceValidator.getMfaSettings();

    assertThat(
      policy === MfaPolicy.UserControlled,
      new RequestError({
        code: 'session.mfa.mfa_policy_not_user_controlled',
        status: 422,
      })
    );

    this.#mfaSkipped = true;
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

    const { mfaVerifications } = await this.interactionContext.getIdentifiedUser();
    const userHasOtherMfa = mfaVerifications.some((mfa) => mfa.type !== MfaFactor.BackupCode);
    const hasOtherNewMfa = Boolean(this.#totp ?? this.#webAuthn?.length);
    assertThat(
      userHasOtherMfa || hasOtherNewMfa,
      new RequestError({
        code: 'session.mfa.backup_code_can_not_be_alone',
        status: 422,
      })
    );

    this.#backupCode = verificationRecord.toBindMfa();
  }

  /**
   * @throws {RequestError} with status 400 if the mfa factors are not enabled in the sign-in experience
   */
  async checkAvailability() {
    const newBindMfaFactors = deduplicate(this.bindMfaFactorsArray.map(({ type }) => type));
    await this.checkMfaFactorsEnabledInSignInExperience(newBindMfaFactors);
  }

  /**
   * @throws {RequestError} with status 422 if the user has not bound the required MFA factors
   * @throws {RequestError} with status 422 if the user has not bound the backup code but enabled in the sign-in experience
   * @throws {RequestError} with status 422 if the user existing backup codes is empty, new backup codes is required
   */
  async assertUserMandatoryMfaFulfilled() {
    const { factors, policy } = await this.signInExperienceValidator.getMfaSettings();

    // If there are no factors, then there is nothing to check
    if (factors.length === 0) {
      return;
    }

    const { mfaVerifications, logtoConfig } = await this.interactionContext.getIdentifiedUser();

    // If the policy is user controlled and the user has skipped MFA, then there is nothing to check
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if ((policy === MfaPolicy.UserControlled && this.#mfaSkipped) || isMfaSkipped(logtoConfig)) {
      return;
    }

    const availableFactors = factors.filter((factor) => factor !== MfaFactor.BackupCode);

    const factorsInUser = filterOutEmptyBackupCodes(mfaVerifications).map(({ type }) => type);
    const factorsInBind = this.bindMfaFactorsArray.map(({ type }) => type);
    const linkedFactors = deduplicate([...factorsInUser, ...factorsInBind]);

    // Assert that the user has at least one of the required factors bound
    assertThat(
      availableFactors.some((factor) => linkedFactors.includes(factor)),
      new RequestError(
        { code: 'user.missing_mfa', status: 422 },
        policy === MfaPolicy.Mandatory
          ? { availableFactors }
          : { availableFactors, skippable: true }
      )
    );

    // Assert backup code
    assertThat(
      !factors.includes(MfaFactor.BackupCode) || linkedFactors.includes(MfaFactor.BackupCode),
      new RequestError({
        code: 'session.mfa.backup_code_required',
        status: 422,
      })
    );
  }

  get data(): MfaData {
    return {
      mfaSkipped: this.mfaSkipped,
      totp: this.#totp,
      webAuthn: this.#webAuthn,
      backupCode: this.#backupCode,
    };
  }

  private async checkMfaFactorsEnabledInSignInExperience(factors: MfaFactor[]) {
    const { factors: enabledFactors } = await this.signInExperienceValidator.getMfaSettings();

    const isFactorsEnabled = factors.every((factor) => enabledFactors.includes(factor));

    assertThat(isFactorsEnabled, new RequestError({ code: 'session.mfa.mfa_factor_not_enabled' }));
  }
}
