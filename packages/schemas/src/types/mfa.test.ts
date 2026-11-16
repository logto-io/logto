import { describe, expect, it } from 'vitest';

import { MfaFactor, MfaVerificationCodeEnrollment } from '../foundations/jsonb-types/index.js';

import { resolveUserMfaFactors } from './mfa.js';

const { Implicit, Explicit } = MfaVerificationCodeEnrollment;
const { EmailVerificationCode, PhoneVerificationCode, TOTP, WebAuthn, BackupCode } = MfaFactor;

describe('resolveUserMfaFactors', () => {
  it.each([
    // Mode, has primary email, has email record, counts as an MFA factor
    [undefined, true, false, true],
    [Implicit, true, false, true],
    [Implicit, true, true, true],
    [Implicit, false, true, false],
    [Explicit, true, true, true],
    [Explicit, true, false, false],
    [Explicit, false, true, false],
  ] as const)(
    'mode %s, primary email %s, email record %s: email counts = %s',
    (verificationCodeEnrollment, hasPrimaryEmail, hasRecord, expected) => {
      expect(
        resolveUserMfaFactors({
          mfaSettings: { factors: [EmailVerificationCode], verificationCodeEnrollment },
          storedFactors: hasRecord ? [EmailVerificationCode] : [],
          hasPrimaryEmail,
          hasPrimaryPhone: false,
        })
      ).toEqual(expected ? [EmailVerificationCode] : []);
    }
  );

  it('checks each code factor against its own identifier and record', () => {
    expect(
      resolveUserMfaFactors({
        mfaSettings: {
          factors: [EmailVerificationCode, PhoneVerificationCode],
          verificationCodeEnrollment: Explicit,
        },
        storedFactors: [PhoneVerificationCode],
        hasPrimaryEmail: true,
        hasPrimaryPhone: true,
      })
    ).toEqual([PhoneVerificationCode]);
    expect(
      resolveUserMfaFactors({
        mfaSettings: { factors: [EmailVerificationCode, PhoneVerificationCode] },
        storedFactors: [],
        hasPrimaryEmail: false,
        hasPrimaryPhone: true,
      })
    ).toEqual([PhoneVerificationCode]);
  });

  it('ignores records of factors the sign-in experience does not enable', () => {
    expect(
      resolveUserMfaFactors({
        mfaSettings: { factors: [TOTP], verificationCodeEnrollment: Explicit },
        storedFactors: [EmailVerificationCode, WebAuthn, TOTP],
        hasPrimaryEmail: true,
        hasPrimaryPhone: false,
      })
    ).toEqual([TOTP]);
  });

  it('keeps the stored order and puts phone and email once, before backup codes', () => {
    expect(
      resolveUserMfaFactors({
        mfaSettings: {
          factors: [TOTP, WebAuthn, BackupCode, EmailVerificationCode, PhoneVerificationCode],
          verificationCodeEnrollment: Explicit,
        },
        storedFactors: [EmailVerificationCode, WebAuthn, EmailVerificationCode, TOTP, BackupCode],
        hasPrimaryEmail: true,
        hasPrimaryPhone: true,
      })
    ).toEqual([WebAuthn, TOTP, EmailVerificationCode, BackupCode]);
  });
});
