import { describe, expect, it } from 'vitest';

import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  AuthenticationProofRole,
  AuthenticationContextMode,
  LogtoAcr,
  acrSatisfies,
  authenticationProofGuard,
  buildAuthenticationMethodReferences,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  getAuthenticationMethodReferences,
  isLogtoAcr,
  logtoAcrValues,
  requestedAuthenticationContextGuard,
} from './authentication-context.js';
import { VerificationType } from './verification-records/verification-type.js';

describe('logtoAcrValues', () => {
  it('advertises exactly the two Logto classes in order', () => {
    expect(logtoAcrValues).toEqual(['urn:logto:acr:1fa', 'urn:logto:acr:mfa']);
  });
});

describe('isLogtoAcr', () => {
  it.each(logtoAcrValues)('accepts %s', (acr) => {
    expect(isLogtoAcr(acr)).toBe(true);
  });

  it.each(['urn:logto:acr:2fa', 'phr', '', undefined, null, 1, ['urn:logto:acr:mfa']])(
    'rejects %j',
    (value) => {
      expect(isLogtoAcr(value)).toBe(false);
    }
  );
});

describe('acrSatisfies', () => {
  it.each([
    [LogtoAcr.FirstFactor, LogtoAcr.FirstFactor, true],
    [LogtoAcr.Mfa, LogtoAcr.Mfa, true],
    // `mfa` is a `1fa` context plus more, so it satisfies the weaker class as well.
    [LogtoAcr.Mfa, LogtoAcr.FirstFactor, true],
    [LogtoAcr.FirstFactor, LogtoAcr.Mfa, false],
  ])('%s satisfies %s: %s', (achieved, required, expected) => {
    expect(acrSatisfies(achieved, required)).toBe(expected);
  });

  it.each(['urn:logto:acr:2fa', 'phr', '', undefined])(
    'never lets the unsupported achieved value %j satisfy a class',
    (achieved) => {
      for (const required of logtoAcrValues) {
        expect(acrSatisfies(achieved, required)).toBe(false);
      }
    }
  );
});

describe('requestedAuthenticationContextGuard', () => {
  it('accepts a sign-in context that carries only the requested values', () => {
    expect(
      requestedAuthenticationContextGuard.parse({ requestedAcrValues: [LogtoAcr.Mfa] })
    ).toEqual({ requestedAcrValues: [LogtoAcr.Mfa] });
  });

  it('accepts a step-up context', () => {
    const context = {
      requestedAcrValues: [LogtoAcr.Mfa, LogtoAcr.FirstFactor],
      selectedAcr: LogtoAcr.Mfa,
      mode: AuthenticationContextMode.StepUp,
    };

    expect(requestedAuthenticationContextGuard.parse(context)).toEqual(context);
  });

  it('rejects unsupported classes and modes', () => {
    expect(
      requestedAuthenticationContextGuard.safeParse({ requestedAcrValues: ['urn:logto:acr:2fa'] })
        .success
    ).toBe(false);
    expect(
      requestedAuthenticationContextGuard.safeParse({
        requestedAcrValues: [LogtoAcr.Mfa],
        mode: 'signIn',
      }).success
    ).toBe(false);
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
  ])('classifies %s as mfa', (type) => {
    expect(getAuthenticationFactorClass(type)).toBe(AuthenticationFactorClass.Mfa);
  });

  // A user-verified WebAuthn authenticator is possession plus user verification in one act, and
  // Logto requires user verification for the registration and the authentication ceremony alike.
  it.each([VerificationType.WebAuthn, VerificationType.SignInPasskey])(
    'classifies %s as both',
    (type) => {
      expect(getAuthenticationFactorClass(type)).toBe(AuthenticationFactorClass.Both);
    }
  );

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

const references = (...types: VerificationType[]) =>
  types.map((type) => getAuthenticationMethodReferences(type));

describe('buildAuthenticationMethodReferences', () => {
  it('unions references in first-seen order without duplicates', () => {
    expect(
      buildAuthenticationMethodReferences(
        references(VerificationType.Password, VerificationType.TOTP, VerificationType.BackupCode),
        LogtoAcr.FirstFactor
      )
    ).toEqual(['pwd', 'otp']);
  });

  it('appends `mfa` when the achieved ACR is mfa', () => {
    expect(
      buildAuthenticationMethodReferences(
        references(VerificationType.Password, VerificationType.TOTP),
        LogtoAcr.Mfa
      )
    ).toEqual(['pwd', 'otp', 'mfa']);
  });

  it('does not duplicate `mfa` for WebAuthn', () => {
    expect(
      buildAuthenticationMethodReferences(references(VerificationType.WebAuthn), LogtoAcr.Mfa)
    ).toEqual(['pop', 'user', 'mfa']);
  });

  it('keeps `mfa` last when a WebAuthn record precedes another factor', () => {
    expect(
      buildAuthenticationMethodReferences(
        references(VerificationType.WebAuthn, VerificationType.Password),
        LogtoAcr.Mfa
      )
    ).toEqual(['pop', 'user', 'pwd', 'mfa']);
    // WebAuthn carries `mfa` on its own even when no ACR is passed.
    expect(
      buildAuthenticationMethodReferences(
        references(VerificationType.WebAuthn, VerificationType.Password)
      )
    ).toEqual(['pop', 'user', 'pwd', 'mfa']);
  });

  it('keeps `fed` next to an established factor without an ACR', () => {
    expect(
      buildAuthenticationMethodReferences(
        references(VerificationType.Social, VerificationType.Password)
      )
    ).toEqual(['fed', 'pwd']);
    expect(buildAuthenticationMethodReferences(references(VerificationType.Social))).toEqual([
      'fed',
    ]);
  });

  it('returns nothing for no references', () => {
    expect(buildAuthenticationMethodReferences([])).toEqual([]);
  });
});

describe('authenticationProofGuard', () => {
  it.each([
    { id: '', amr: ['otp'] },
    { id: 'totp', amr: [] },
  ])('rejects a proof with an empty id or AMR list: %j', ({ id, amr }) => {
    expect(
      authenticationProofGuard.safeParse({
        id,
        factor: AuthenticationFactor.Totp,
        class: AuthenticationFactorClass.Mfa,
        amr,
        role: AuthenticationProofRole.Mfa,
      }).success
    ).toBe(false);
  });

  it('accepts a proof with and without a class', () => {
    expect(
      authenticationProofGuard.safeParse({
        id: 'totp',
        factor: AuthenticationFactor.Totp,
        class: AuthenticationFactorClass.Mfa,
        amr: ['otp'],
        role: AuthenticationProofRole.Mfa,
      }).success
    ).toBe(true);
    expect(
      authenticationProofGuard.safeParse({
        id: 'social',
        factor: AuthenticationFactor.Federated,
        amr: ['fed'],
        role: AuthenticationProofRole.Identify,
      }).success
    ).toBe(true);
  });
});
