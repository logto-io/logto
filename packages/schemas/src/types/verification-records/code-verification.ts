import { z } from 'zod';

import { SignInIdentifier, TemplateType } from '../../foundations/index.js';
import { type ToZodObject } from '../../utils/zod.js';
import { type VerificationCodeIdentifier } from '../interactions.js';

import { VerificationType } from './verification-type.js';

// One-time code verification record
export type CodeVerificationType =
  | VerificationType.EmailVerificationCode
  | VerificationType.PhoneVerificationCode
  | VerificationType.MfaEmailVerificationCode
  | VerificationType.MfaPhoneVerificationCode;

type SignInIdentifierTypeOf = {
  [VerificationType.EmailVerificationCode]: SignInIdentifier.Email;
  [VerificationType.PhoneVerificationCode]: SignInIdentifier.Phone;
  [VerificationType.MfaEmailVerificationCode]: SignInIdentifier.Email;
  [VerificationType.MfaPhoneVerificationCode]: SignInIdentifier.Phone;
};

export type VerificationCodeIdentifierOf<T extends CodeVerificationType> =
  VerificationCodeIdentifier<SignInIdentifierTypeOf[T]>;

/** The JSON data type for the `CodeVerification` record */
export type CodeVerificationRecordData<T extends CodeVerificationType = CodeVerificationType> = {
  id: string;
  type: T;
  identifier: VerificationCodeIdentifierOf<T>;
  templateType: TemplateType;
  verified: boolean;
};

const basicCodeVerificationRecordDataGuard = z.object({
  id: z.string(),
  templateType: z.nativeEnum(TemplateType),
  verified: z.boolean(),
});

export const emailCodeVerificationRecordDataGuard = basicCodeVerificationRecordDataGuard.extend({
  type: z.literal(VerificationType.EmailVerificationCode),
  identifier: z.object({
    type: z.literal(SignInIdentifier.Email),
    value: z.string(),
  }),
}) satisfies ToZodObject<CodeVerificationRecordData<VerificationType.EmailVerificationCode>>;

export const phoneCodeVerificationRecordDataGuard = basicCodeVerificationRecordDataGuard.extend({
  type: z.literal(VerificationType.PhoneVerificationCode),
  identifier: z.object({
    type: z.literal(SignInIdentifier.Phone),
    value: z.string(),
  }),
}) satisfies ToZodObject<CodeVerificationRecordData<VerificationType.PhoneVerificationCode>>;

export const mfaEmailCodeVerificationRecordDataGuard = basicCodeVerificationRecordDataGuard.extend({
  type: z.literal(VerificationType.MfaEmailVerificationCode),
  identifier: z.object({
    type: z.literal(SignInIdentifier.Email),
    value: z.string(),
  }),
}) satisfies ToZodObject<CodeVerificationRecordData<VerificationType.MfaEmailVerificationCode>>;

export const mfaPhoneCodeVerificationRecordDataGuard = basicCodeVerificationRecordDataGuard.extend({
  type: z.literal(VerificationType.MfaPhoneVerificationCode),
  identifier: z.object({
    type: z.literal(SignInIdentifier.Phone),
    value: z.string(),
  }),
}) satisfies ToZodObject<CodeVerificationRecordData<VerificationType.MfaPhoneVerificationCode>>;
