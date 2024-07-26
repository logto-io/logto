import { type ToZodObject } from '@logto/connector-kit';
import { MfaFactor, VerificationType, type MfaVerificationBackupCode } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';

import { type MfaVerificationRecord } from './verification-record.js';

export type BackupCodeVerificationRecordData = {
  id: string;
  type: VerificationType.BackupCode;
  /** UserId is required for backup code verification */
  userId: string;
  code?: string;
};

export const backupCodeVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.BackupCode),
  userId: z.string(),
  code: z.string().optional(),
}) satisfies ToZodObject<BackupCodeVerificationRecordData>;

export class BackupCodeVerification implements MfaVerificationRecord<VerificationType.BackupCode> {
  /**
   * Factory method to create a new BackupCodeVerification instance
   *
   * @param userId The user id is required for backup code verification.
   * A BackupCodeVerification instance can only be created if the interaction is identified.
   */
  static create(libraries: Libraries, queries: Queries, userId: string) {
    return new BackupCodeVerification(libraries, queries, {
      id: generateStandardId(),
      type: VerificationType.BackupCode,
      userId,
    });
  }

  public readonly id: string;
  public readonly type = VerificationType.BackupCode;
  public readonly userId: string;
  private code?: string;

  constructor(
    private readonly libraries: Libraries,
    private readonly queries: Queries,
    data: BackupCodeVerificationRecordData
  ) {
    const { id, userId, code } = data;

    this.id = id;
    this.userId = userId;
    this.code = code;
  }

  get isVerified() {
    return Boolean(this.code);
  }

  get isNewBindMfaVerification() {
    return false;
  }

  async verify(code: string) {
    const {
      users: { findUserById, updateUserById },
    } = this.queries;

    // Directly return if the code has been verified
    if (code === this.code) {
      return;
    }

    // Find the backupCodes record for the user
    const { mfaVerifications } = await findUserById(this.userId);
    const backupCodes = mfaVerifications.find(
      (mfa): mfa is MfaVerificationBackupCode => mfa.type === MfaFactor.BackupCode
    );

    assertThat(backupCodes, 'session.mfa.invalid_backup_code');

    assertThat(
      backupCodes.codes.some((backupCode) => backupCode.code === code && !backupCode.usedAt),
      'session.mfa.invalid_backup_code'
    );

    // Mark the backup code as used with used time
    await updateUserById(this.userId, {
      mfaVerifications: mfaVerifications.map((mfa) => {
        if (mfa.id !== backupCodes.id || mfa.type !== MfaFactor.BackupCode) {
          return mfa;
        }

        return {
          ...mfa,
          codes: mfa.codes.map((backupCode) => {
            if (backupCode.code !== code) {
              return backupCode;
            }

            return {
              ...backupCode,
              usedAt: new Date().toISOString(),
            };
          }),
        };
      }),
    });

    this.code = code;
  }

  toJson(): BackupCodeVerificationRecordData {
    const { id, type, userId, code } = this;

    return {
      id,
      type,
      userId,
      code,
    };
  }
}
