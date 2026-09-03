import { describe, expect, it } from 'vitest';

import {
  AuthenticationMethodReference,
  LogtoAcr,
  buildAuthenticationMethodReferences,
  getAchievedAcr,
  getAuthenticationMethodReferences,
  logtoAcrValues,
} from './authentication-context.js';
import { VerificationType } from './verification-records/verification-type.js';

describe('logtoAcrValues', () => {
  it('advertises exactly the two Logto classes in order', () => {
    expect(logtoAcrValues).toEqual(['urn:logto:acr:1fa', 'urn:logto:acr:mfa']);
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
});

describe('buildAuthenticationMethodReferences', () => {
  it('returns an empty list for no types', () => {
    expect(buildAuthenticationMethodReferences([])).toEqual([]);
  });

  it('unions references in first-seen order without duplicates', () => {
    expect(
      buildAuthenticationMethodReferences([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.Social,
        VerificationType.OneTimeToken,
      ])
    ).toEqual(['pwd', 'otp', 'fed']);
  });

  it('keeps mfa last whenever a type carries it', () => {
    expect(
      buildAuthenticationMethodReferences([VerificationType.SignInPasskey, VerificationType.Social])
    ).toEqual(['pop', 'user', 'fed', 'mfa']);
  });
});

describe('getAchievedAcr', () => {
  it('reaches mfa when the references carry mfa', () => {
    expect(
      getAchievedAcr([
        AuthenticationMethodReference.ProofOfPossession,
        AuthenticationMethodReference.UserPresence,
        AuthenticationMethodReference.Mfa,
      ])
    ).toBe(LogtoAcr.Mfa);
  });

  it('reaches 1fa for a factor Logto verified itself', () => {
    expect(getAchievedAcr([AuthenticationMethodReference.Password])).toBe(LogtoAcr.FirstFactor);
    expect(
      getAchievedAcr([AuthenticationMethodReference.Federated, AuthenticationMethodReference.Otp])
    ).toBe(LogtoAcr.FirstFactor);
  });

  it('reaches no ACR for a federated assertion alone or no references', () => {
    expect(getAchievedAcr([AuthenticationMethodReference.Federated])).toBeUndefined();
    expect(getAchievedAcr([])).toBeUndefined();
  });
});
