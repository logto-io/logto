import { z } from 'zod';

import {
  MfaFactor,
  MfaVerificationCodeEnrollment,
  webAuthnTransportGuard,
  type Mfa,
} from '../foundations/jsonb-types/index.js';

const isVerificationCodeMfaFactor = (factor: MfaFactor) =>
  factor === MfaFactor.EmailVerificationCode || factor === MfaFactor.PhoneVerificationCode;

/**
 * The MFA factors a user has: the one rule sign-in, step-up, token issuance, Account Center, and
 * Console share.
 *
 * Only factors the sign-in experience enables count. The email / phone verification code factor
 * needs the primary identifier its code is sent to; in
 * {@link MfaVerificationCodeEnrollment.Explicit} mode it also needs a stored record of that type,
 * while in the default {@link MfaVerificationCodeEnrollment.Implicit} mode the identifier alone
 * counts and the record is ignored.
 *
 * @param storedFactors The types of the user's stored MFA verifications, in the order the caller
 * wants them; the other stored factors keep that order.
 * @returns The other stored factors, then phone, then email, then backup codes; each code factor
 * at most once.
 */
export const resolveUserMfaFactors = ({
  mfaSettings: { factors, verificationCodeEnrollment },
  storedFactors,
  hasPrimaryEmail,
  hasPrimaryPhone,
}: {
  mfaSettings: Pick<Mfa, 'factors' | 'verificationCodeEnrollment'>;
  storedFactors: readonly MfaFactor[];
  hasPrimaryEmail: boolean;
  hasPrimaryPhone: boolean;
}): MfaFactor[] => {
  const hasCodeFactor = (factor: MfaFactor, hasPrimaryIdentifier: boolean) =>
    factors.includes(factor) &&
    hasPrimaryIdentifier &&
    (verificationCodeEnrollment !== MfaVerificationCodeEnrollment.Explicit ||
      storedFactors.includes(factor));

  const enabledStoredFactors = storedFactors.filter(
    (factor) => !isVerificationCodeMfaFactor(factor) && factors.includes(factor)
  );

  return [
    ...enabledStoredFactors.filter((factor) => factor !== MfaFactor.BackupCode),
    ...(hasCodeFactor(MfaFactor.PhoneVerificationCode, hasPrimaryPhone)
      ? [MfaFactor.PhoneVerificationCode]
      : []),
    ...(hasCodeFactor(MfaFactor.EmailVerificationCode, hasPrimaryEmail)
      ? [MfaFactor.EmailVerificationCode]
      : []),
    ...enabledStoredFactors.filter((factor) => factor === MfaFactor.BackupCode),
  ];
};

export const webAuthnRegistrationOptionsGuard = z.object({
  rp: z.object({
    name: z.string(),
    id: z.string().optional(),
  }),
  user: z.object({
    id: z.string(),
    name: z.string(),
    displayName: z.string(),
  }),
  challenge: z.string(),
  pubKeyCredParams: z.array(
    z.object({
      type: z.literal('public-key'),
      alg: z.number(),
    })
  ),
  timeout: z.number().optional(),
  excludeCredentials: z
    .array(
      z.object({
        type: z.literal('public-key'),
        id: z.string(),
        transports: webAuthnTransportGuard.array().optional(),
      })
    )
    .optional(),
  authenticatorSelection: z
    .object({
      authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
      requireResidentKey: z.boolean().optional(),
      residentKey: z.enum(['discouraged', 'preferred', 'required']).optional(),
      userVerification: z.enum(['required', 'preferred', 'discouraged']).optional(),
    })
    .optional(),
  attestation: z.enum(['none', 'indirect', 'direct', 'enterprise']).optional(),
  extensions: z
    .object({
      appid: z.string().optional(),
      credProps: z.boolean().optional(),
      hmacCreateSecret: z.boolean().optional(),
    })
    .optional(),
});

export type WebAuthnRegistrationOptions = z.infer<typeof webAuthnRegistrationOptionsGuard>;

export const webAuthnAuthenticationOptionsGuard = z.object({
  challenge: z.string(),
  timeout: z.number().optional(),
  rpId: z.string().optional(),
  allowCredentials: z
    .array(
      z.object({
        type: z.literal('public-key'),
        id: z.string(),
        transports: webAuthnTransportGuard.array().optional(),
      })
    )
    .optional(),
  userVerification: z.enum(['required', 'preferred', 'discouraged']).optional(),
  extensions: z
    .object({
      appid: z.string().optional(),
      credProps: z.boolean().optional(),
      hmacCreateSecret: z.boolean().optional(),
    })
    .optional(),
});

export type WebAuthnAuthenticationOptions = z.infer<typeof webAuthnAuthenticationOptionsGuard>;
