import { describe, expect, it } from 'vitest';

import {
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  LogtoAcr,
  acrSatisfies,
  buildAuthenticationMethodReferences,
  getAuthenticationFactorClass,
  getAuthenticationMethodReferences,
  isLogtoAcr,
  logtoAcrValues,
} from './authentication-context.js';
import { VerificationType } from './verification-records/verification-type.js';

describe('logtoAcrValues', () => {
  it('advertises exactly the two Logto classes in order', () => {
    expect(logtoAcrValues).toEqual(['urn:logto:acr:1fa', 'urn:logto:acr:mfa']);
  });

  it.each(['urn:logto:acr:1fa', 'urn:logto:acr:mfa'])('recognizes %s', (value) => {
    expect(isLogtoAcr(value)).toBe(true);
  });

  it.each(['phr', 'urn:logto:acr:3fa', '', undefined, 1])('rejects %o', (value) => {
    expect(isLogtoAcr(value)).toBe(false);
  });
});

describe('acrSatisfies', () => {
  it.each([
    [LogtoAcr.FirstFactor, LogtoAcr.FirstFactor, true],
    [LogtoAcr.Mfa, LogtoAcr.Mfa, true],
    [LogtoAcr.Mfa, LogtoAcr.FirstFactor, true],
    [LogtoAcr.FirstFactor, LogtoAcr.Mfa, false],
  ])('achieved %s vs requested %s → %s', (achieved, requested, expected) => {
    expect(acrSatisfies(achieved, requested)).toBe(expected);
  });

  it('never satisfies an unsupported requested value', () => {
    expect(acrSatisfies(LogtoAcr.Mfa, 'phr')).toBe(false);
    expect(acrSatisfies(LogtoAcr.Mfa, 'urn:logto:acr:3fa')).toBe(false);
  });

  it('never satisfies from an unsupported or missing achieved value', () => {
    expect(acrSatisfies('phr', LogtoAcr.FirstFactor)).toBe(false);
    expect(acrSatisfies(undefined, LogtoAcr.FirstFactor)).toBe(false);
    expect(acrSatisfies('', LogtoAcr.FirstFactor)).toBe(false);
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
