import {
  MfaFactor,
  MfaPolicy,
  MfaVerificationCodeEnrollment,
  type Mfa,
  type User,
} from '@logto/schemas';

import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';

import { getAllUserEnabledMfaVerifications } from './mfa.js';

describe('getAllUserEnabledMfaVerifications', () => {
  it('puts WebAuthn first when available', () => {
    const mfaSettings: Mfa = {
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn, MfaFactor.BackupCode],
      policy: MfaPolicy.PromptAtSignInAndSignUp,
    };

    const user: User = {
      ...mockUser,
      mfaVerifications: [
        {
          ...mockUserWebAuthnMfaVerification,
          lastUsedAt: new Date('2023-01-01').toISOString(),
        },
        {
          ...mockUserBackupCodeMfaVerification,
          // Ensure there is at least one unused code
          codes: [{ code: 'A' }, { code: 'B', usedAt: undefined }],
          lastUsedAt: new Date('2025-01-01').toISOString(),
        },
        {
          ...mockUserTotpMfaVerification,
          lastUsedAt: new Date('2024-01-01').toISOString(),
        },
      ],
    };

    const result = getAllUserEnabledMfaVerifications(mfaSettings, user);

    expect(result).toEqual([MfaFactor.WebAuthn, MfaFactor.TOTP, MfaFactor.BackupCode]);
  });

  it('requires an email / phone record in explicit mode and puts them before backup codes', () => {
    const mfaSettings: Mfa = {
      factors: [
        MfaFactor.TOTP,
        MfaFactor.BackupCode,
        MfaFactor.EmailVerificationCode,
        MfaFactor.PhoneVerificationCode,
      ],
      policy: MfaPolicy.PromptAtSignInAndSignUp,
      verificationCodeEnrollment: MfaVerificationCodeEnrollment.Explicit,
    };

    const user: User = {
      ...mockUser,
      primaryEmail: 'foo@example.com',
      primaryPhone: '+123456789',
      mfaVerifications: [
        // The newest record must not move ahead of the other stored factors.
        {
          id: 'email',
          type: MfaFactor.EmailVerificationCode,
          createdAt: new Date('2025-01-01').toISOString(),
          lastUsedAt: new Date('2025-01-01').toISOString(),
        },
        { ...mockUserBackupCodeMfaVerification, codes: [{ code: 'A' }] },
        mockUserTotpMfaVerification,
      ],
    };

    expect(getAllUserEnabledMfaVerifications(mfaSettings, user)).toEqual([
      MfaFactor.TOTP,
      MfaFactor.EmailVerificationCode,
      MfaFactor.BackupCode,
    ]);
    // The phone staged in an interaction has no record either.
    expect(
      getAllUserEnabledMfaVerifications(
        mfaSettings,
        { ...user, primaryPhone: null },
        { primaryPhone: '+123456789' }
      )
    ).not.toContain(MfaFactor.PhoneVerificationCode);
    expect(
      getAllUserEnabledMfaVerifications(
        { ...mfaSettings, verificationCodeEnrollment: MfaVerificationCodeEnrollment.Implicit },
        user
      )
    ).toEqual([
      MfaFactor.TOTP,
      MfaFactor.PhoneVerificationCode,
      MfaFactor.EmailVerificationCode,
      MfaFactor.BackupCode,
    ]);
  });
});
