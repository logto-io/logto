import { InteractionEvent, MfaFactor, userMfaDataKey } from '@logto/schemas';

import { parseMfaPropertiesToUserConfig, sortMfaFactors } from './helpers.js';

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
