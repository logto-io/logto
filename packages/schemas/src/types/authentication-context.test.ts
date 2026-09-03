import { describe, expect, it } from 'vitest';

import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  LogtoAcr,
  buildAuthenticationMethodReferences,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  getAuthenticationMethodReferences,
  logtoAcrValues,
} from './authentication-context.js';
import { VerificationType } from './verification-records/verification-type.js';

describe('logtoAcrValues', () => {
  it('advertises exactly the two Logto classes in order', () => {
    expect(logtoAcrValues).toEqual(['urn:logto:acr:1fa', 'urn:logto:acr:mfa']);
  });
});

describe('getAuthenticationFactorClass', () => {
  it.each([
    VerificationType.Password,
    VerificationType.EmailVerificationCode,
    VerificationType.PhoneVerificationCode,
    VerificationType.OneTimeToken,
    VerificationType.NewPasswordIdentity,
  ])('classifies %s as 1fa', (type) => {
    expect(getAuthenticationFactorClass(type)).toBe(AuthenticationFactorClass.FirstFactor);
  });

  it.each([
    VerificationType.TOTP,
    VerificationType.MfaEmailVerificationCode,
    VerificationType.MfaPhoneVerificationCode,
    VerificationType.BackupCode,
    VerificationType.WebAuthn,
    VerificationType.SignInPasskey,
  ])('classifies %s as mfa', (type) => {
    expect(getAuthenticationFactorClass(type)).toBe(AuthenticationFactorClass.Mfa);
  });

  it.each([VerificationType.Social, VerificationType.EnterpriseSso])(
    'gives %s no class',
    (type) => {
      expect(getAuthenticationFactorClass(type)).toBeUndefined();
    }
  );
});

describe('getAuthenticationFactor', () => {
  it.each([
    [VerificationType.Password, AuthenticationFactor.Password],
    [VerificationType.NewPasswordIdentity, AuthenticationFactor.Password],
    [VerificationType.EmailVerificationCode, AuthenticationFactor.Email],
    [VerificationType.MfaEmailVerificationCode, AuthenticationFactor.Email],
    [VerificationType.OneTimeToken, AuthenticationFactor.Email],
    [VerificationType.PhoneVerificationCode, AuthenticationFactor.Phone],
    [VerificationType.MfaPhoneVerificationCode, AuthenticationFactor.Phone],
    [VerificationType.TOTP, AuthenticationFactor.Totp],
    [VerificationType.BackupCode, AuthenticationFactor.BackupCode],
    [VerificationType.WebAuthn, AuthenticationFactor.WebAuthn],
    [VerificationType.SignInPasskey, AuthenticationFactor.WebAuthn],
    [VerificationType.Social, AuthenticationFactor.Federated],
    [VerificationType.EnterpriseSso, AuthenticationFactor.Federated],
  ])('maps %s to the %s factor', (type, expected) => {
    expect(getAuthenticationFactor(type)).toBe(expected);
  });
});

describe('getAuthenticationMethodReferences', () => {
  it.each([
    [VerificationType.Password, ['pwd']],
    [VerificationType.NewPasswordIdentity, ['pwd']],
    [VerificationType.EmailVerificationCode, ['otp']],
    [VerificationType.OneTimeToken, ['otp']],
    [VerificationType.TOTP, ['otp']],
    [VerificationType.MfaEmailVerificationCode, ['otp']],
    [VerificationType.BackupCode, ['otp']],
    [VerificationType.PhoneVerificationCode, ['sms']],
    [VerificationType.MfaPhoneVerificationCode, ['sms']],
    [VerificationType.WebAuthn, ['pop', 'user', 'mfa']],
    [VerificationType.SignInPasskey, ['pop', 'user', 'mfa']],
    [VerificationType.Social, ['fed']],
    [VerificationType.EnterpriseSso, ['fed']],
  ])('maps %s to %j', (type, expected) => {
    expect(getAuthenticationMethodReferences(type)).toEqual(expected);
  });

  it('maps every verification type', () => {
    for (const type of Object.values(VerificationType)) {
      expect(getAuthenticationMethodReferences(type).length).toBeGreaterThan(0);
    }
  });

  it('emits `fed` as the only unregistered AMR value', () => {
    // RFC 8176 / IANA registered values used by Logto.
    const registered = new Set(['pwd', 'otp', 'sms', 'pop', 'user', 'mfa']);
    const emitted = new Set(
      Object.values(VerificationType).flatMap((type) => getAuthenticationMethodReferences(type))
    );

    expect([...emitted].filter((value) => !registered.has(value))).toEqual([
      AuthenticationMethodReference.Federated,
    ]);
  });
});

describe('buildAuthenticationMethodReferences', () => {
  it('unions references in first-seen order without duplicates', () => {
    expect(
      buildAuthenticationMethodReferences(
        [VerificationType.Password, VerificationType.TOTP, VerificationType.BackupCode],
        LogtoAcr.FirstFactor
      )
    ).toEqual(['pwd', 'otp']);
  });

  it('appends `mfa` when the achieved ACR is mfa', () => {
    expect(
      buildAuthenticationMethodReferences(
        [VerificationType.Password, VerificationType.TOTP],
        LogtoAcr.Mfa
      )
    ).toEqual(['pwd', 'otp', 'mfa']);
  });

  it('does not duplicate `mfa` for WebAuthn', () => {
    expect(buildAuthenticationMethodReferences([VerificationType.WebAuthn], LogtoAcr.Mfa)).toEqual([
      'pop',
      'user',
      'mfa',
    ]);
  });

  it('keeps `mfa` last when a WebAuthn record precedes another factor', () => {
    expect(
      buildAuthenticationMethodReferences(
        [VerificationType.WebAuthn, VerificationType.Password],
        LogtoAcr.Mfa
      )
    ).toEqual(['pop', 'user', 'pwd', 'mfa']);
    // WebAuthn carries `mfa` on its own even when no ACR is passed.
    expect(
      buildAuthenticationMethodReferences([VerificationType.WebAuthn, VerificationType.Password])
    ).toEqual(['pop', 'user', 'pwd', 'mfa']);
  });

  it('keeps `fed` next to an established factor without an ACR', () => {
    expect(
      buildAuthenticationMethodReferences([VerificationType.Social, VerificationType.Password])
    ).toEqual(['fed', 'pwd']);
    expect(buildAuthenticationMethodReferences([VerificationType.Social])).toEqual(['fed']);
  });
});
