import { z } from 'zod';

import { type ToZodObject } from '../../utils/zod.js';

import { VerificationType } from './verification-type.js';

export type BackupCodeVerificationRecordData = {
  id: string;
  type: VerificationType.BackupCode;
  /** UserId is required for backup code verification */
  userId: string;
  code?: string;
  backupCodes?: string[];
};
export const backupCodeVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.BackupCode),
  userId: z.string(),
  code: z.string().optional(),
  backupCodes: z.string().array().optional(),
}) satisfies ToZodObject<BackupCodeVerificationRecordData>;

export type SanitizedBackupCodeVerificationRecordData = Omit<
  BackupCodeVerificationRecordData,
  'backupCodes'
>;

export const sanitizedBackupCodeVerificationRecordDataGuard =
  backupCodeVerificationRecordDataGuard.omit({
    backupCodes: true,
  }) satisfies ToZodObject<SanitizedBackupCodeVerificationRecordData>;
