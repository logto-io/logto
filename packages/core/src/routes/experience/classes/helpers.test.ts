import { InteractionEvent, MfaFactor, userMfaDataKey, type User } from '@logto/schemas';

import {
  mergeUserMfaVerifications,
  parseMfaPropertiesToUserConfig,
  sortMfaFactors,
} from './helpers.js';

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

describe('mergeUserMfaVerifications', () => {
  it('replaces existing backup code, email, and phone records while preserving others', () => {
    const existingVerifications: User['mfaVerifications'] = [
      {
        id: 'totp-1',
        type: MfaFactor.TOTP,
        key: 'secret',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'backup-1',
        type: MfaFactor.BackupCode,
        codes: [{ code: 'old' }],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'email-1',
        type: MfaFactor.EmailVerificationCode,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 'phone-1',
        type: MfaFactor.PhoneVerificationCode,
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ];
    const newVerifications: User['mfaVerifications'] = [
      {
        id: 'email-2',
        type: MfaFactor.EmailVerificationCode,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'backup-2',
        type: MfaFactor.BackupCode,
        codes: [{ code: 'new' }],
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    expect(mergeUserMfaVerifications(existingVerifications, newVerifications)).toEqual([
      existingVerifications[0],
      existingVerifications[3],
      ...newVerifications,
    ]);
  });
});
