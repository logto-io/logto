import {
  InteractionEvent,
  MfaFactor,
  MfaPolicy,
  type Mfa,
  type User,
  userMfaDataKey,
} from '@logto/schemas';

import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';

import {
  getAllUserEnabledMfaVerifications,
  getProfileMfaFactors,
  parseMfaPropertiesToUserConfig,
  sortMfaFactors,
} from './helpers.js';

describe('getProfileMfaFactors', () => {
  it('returns email and phone factors based on sign-in experience settings and profile', () => {
    const mfaSettings: Mfa = {
      factors: [MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
      policy: MfaPolicy.PromptAtSignInAndSignUp,
    };

    expect(
      getProfileMfaFactors(mfaSettings, {
        primaryEmail: 'foo@example.com',
        primaryPhone: '+123456789',
      })
    ).toEqual([MfaFactor.PhoneVerificationCode, MfaFactor.EmailVerificationCode]);
  });
});

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
});

describe('sortMfaFactors', () => {
  it('sorts factors by priority order', () => {
    expect(
      sortMfaFactors([
        MfaFactor.EmailVerificationCode,
        MfaFactor.BackupCode,
        MfaFactor.TOTP,
        MfaFactor.WebAuthn,
        MfaFactor.PhoneVerificationCode,
      ])
    ).toEqual([
      MfaFactor.WebAuthn,
      MfaFactor.TOTP,
      MfaFactor.PhoneVerificationCode,
      MfaFactor.EmailVerificationCode,
      MfaFactor.BackupCode,
    ]);
  });
});

describe('parseMfaPropertiesToUserConfig', () => {
  it('preserves existing mfa.enabled from db on subsequent interaction submit', () => {
    const existingLogtoConfig = {
      [userMfaDataKey]: {
        enabled: true,
      },
    };

    const parsed = parseMfaPropertiesToUserConfig(
      existingLogtoConfig,
      {
        mfaVerifications: [],
      },
      InteractionEvent.SignIn
    );

    expect(parsed).toEqual({
      [userMfaDataKey]: {
        enabled: true,
      },
    });
  });

  it('persists additionalBindingSuggestionSkipped to user mfa config', () => {
    expect(
      parseMfaPropertiesToUserConfig(
        {},
        {
          mfaEnabled: true,
          additionalBindingSuggestionSkipped: true,
          mfaVerifications: [],
        },
        InteractionEvent.SignIn
      )
    ).toEqual({
      [userMfaDataKey]: {
        enabled: true,
        additionalBindingSuggestionSkipped: true,
      },
    });
  });
});
