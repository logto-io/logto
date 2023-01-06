import { emailRegEx, phoneRegEx } from '@logto/core-kit';
import { z } from 'zod';

const emailIdentifierGuard = z.string().regex(emailRegEx);
const phoneIdentifierGuard = z.string().regex(phoneRegEx);
const codeGuard = z.string().min(1);

// Used when requesting Logto to send a verification code to email or phone
export const requestVerificationCodePayloadGuard = z.union([
  z.object({ email: emailIdentifierGuard }),
  z.object({ phone: phoneIdentifierGuard }),
]);

export type RequestVerificationCodePayload = z.infer<typeof requestVerificationCodePayloadGuard>;

export const emailVerificationCodePayloadGuard = z.object({
  email: emailIdentifierGuard,
  verificationCode: codeGuard,
});
export type EmailVerificationCodePayload = z.infer<typeof emailVerificationCodePayloadGuard>;

export const phoneVerificationCodePayloadGuard = z.object({
  phone: phoneIdentifierGuard,
  verificationCode: codeGuard,
});
export type PhoneVerificationCodePayload = z.infer<typeof phoneVerificationCodePayloadGuard>;

// Used when requesting Logto to verify the validity of a verification code
export const verifyVerificationCodePayloadGuard = z.union([
  emailVerificationCodePayloadGuard,
  phoneVerificationCodePayloadGuard,
]);

export type VerifyVerificationCodePayload =
  | EmailVerificationCodePayload
  | PhoneVerificationCodePayload;
