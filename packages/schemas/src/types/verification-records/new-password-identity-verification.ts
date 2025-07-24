/**
 * @deprecated
 * This verification record type is deprecated.
 * DO NOT use this verification record type in new code.
 */

import { z } from 'zod';

import { UsersPasswordEncryptionMethod } from '../../db-entries/custom-types.js';
import { type ToZodObject } from '../../utils/zod.js';
import { interactionIdentifierGuard, type InteractionIdentifier } from '../interactions.js';

import { VerificationType } from './verification-type.js';

export type NewPasswordIdentityVerificationRecordData = {
  id: string;
  type: VerificationType.NewPasswordIdentity;
  /**
   * For now we only support username identifier for new password identity registration.
   * For email and phone new identity registration, a `CodeVerification` record is required.
   */
  identifier: InteractionIdentifier;
  passwordEncrypted?: string;
  passwordEncryptionMethod?: UsersPasswordEncryptionMethod.Argon2i;
};

export const newPasswordIdentityVerificationRecordDataGuard = z.object({
  id: z.string(),
  type: z.literal(VerificationType.NewPasswordIdentity),
  identifier: interactionIdentifierGuard,
  passwordEncrypted: z.string().optional(),
  passwordEncryptionMethod: z.literal(UsersPasswordEncryptionMethod.Argon2i).optional(),
}) satisfies ToZodObject<NewPasswordIdentityVerificationRecordData>;

export type SanitizedNewPasswordIdentityVerificationRecordData = Omit<
  NewPasswordIdentityVerificationRecordData,
  'passwordEncrypted' | 'passwordEncryptionMethod'
>;

export const sanitizedNewPasswordIdentityVerificationRecordDataGuard =
  newPasswordIdentityVerificationRecordDataGuard.omit({
    passwordEncrypted: true,
    passwordEncryptionMethod: true,
  }) satisfies ToZodObject<SanitizedNewPasswordIdentityVerificationRecordData>;
