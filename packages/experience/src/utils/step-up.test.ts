import { MfaFactor, VerificationType } from '@logto/schemas';
import { noop } from '@silverhand/essentials';

import {
  getDisplayedStepUpMethods,
  getMaskedIdentifier,
  isStepUpMethod,
  stepUpMethodToMfaFactor,
  stepUpMethods,
  toMfaFlowState,
} from './step-up';

const email = 'f***@logto.io';
const phone = '+1******1234';

const nativeSdk: NonNullable<Window['logtoNativeSdk']> = {
  platform: 'ios',
  callbackLink: 'io.logto://callback',
  getPostMessage: () => noop,
  supportedConnector: { universal: false, nativeTargets: [] },
};

const setNativeSdk = (value: Window['logtoNativeSdk']) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- tests stage the native SDK global
  window.logtoNativeSdk = value;
};

describe('stepUpMethods', () => {
  it('recognizes exactly the pinned-user first factors and the enrolled MFA factors', () => {
    expect([...stepUpMethods]).toEqual([
      VerificationType.Password,
      VerificationType.EmailVerificationCode,
      VerificationType.PhoneVerificationCode,
      VerificationType.TOTP,
      VerificationType.WebAuthn,
      VerificationType.BackupCode,
      VerificationType.MfaEmailVerificationCode,
      VerificationType.MfaPhoneVerificationCode,
    ]);

    for (const method of stepUpMethods) {
      expect(isStepUpMethod(method)).toBe(true);
    }

    for (const type of [
      VerificationType.Social,
      VerificationType.EnterpriseSso,
      VerificationType.SignInPasskey,
      VerificationType.NewPasswordIdentity,
      VerificationType.OneTimeToken,
    ]) {
      expect(isStepUpMethod(type)).toBe(false);
    }
  });

  it('maps only the MFA methods to the factor of their `/mfa-verification` page', () => {
    expect(stepUpMethodToMfaFactor).toEqual({
      [VerificationType.TOTP]: MfaFactor.TOTP,
      [VerificationType.WebAuthn]: MfaFactor.WebAuthn,
      [VerificationType.BackupCode]: MfaFactor.BackupCode,
      [VerificationType.MfaEmailVerificationCode]: MfaFactor.EmailVerificationCode,
      [VerificationType.MfaPhoneVerificationCode]: MfaFactor.PhoneVerificationCode,
    });
    expect(stepUpMethodToMfaFactor[VerificationType.Password]).toBeUndefined();
    expect(stepUpMethodToMfaFactor[VerificationType.EmailVerificationCode]).toBeUndefined();
    expect(stepUpMethodToMfaFactor[VerificationType.PhoneVerificationCode]).toBeUndefined();
  });
});

describe('getDisplayedStepUpMethods', () => {
  afterEach(() => {
    setNativeSdk(undefined);
  });

  it('keeps every step-up method in the order the server sent', () => {
    const serverOrder = [
      VerificationType.BackupCode,
      VerificationType.MfaPhoneVerificationCode,
      VerificationType.Password,
      VerificationType.WebAuthn,
      VerificationType.EmailVerificationCode,
      VerificationType.TOTP,
      VerificationType.MfaEmailVerificationCode,
      VerificationType.PhoneVerificationCode,
    ];

    expect(getDisplayedStepUpMethods(serverOrder)).toEqual(serverOrder);
  });

  it('drops the verification types the step-up screens cannot render', () => {
    expect(
      getDisplayedStepUpMethods([
        VerificationType.Social,
        VerificationType.Password,
        VerificationType.OneTimeToken,
        VerificationType.EnterpriseSso,
        VerificationType.EmailVerificationCode,
        VerificationType.SignInPasskey,
        VerificationType.NewPasswordIdentity,
      ])
    ).toEqual([VerificationType.Password, VerificationType.EmailVerificationCode]);
  });

  it('returns an empty list when the server offers nothing the screens know', () => {
    expect(getDisplayedStepUpMethods([])).toEqual([]);
    expect(
      getDisplayedStepUpMethods([VerificationType.Social, VerificationType.OneTimeToken])
    ).toEqual([]);
  });

  it('keeps WebAuthn alongside other methods outside a native webview', () => {
    expect(
      getDisplayedStepUpMethods([
        VerificationType.WebAuthn,
        VerificationType.Password,
        VerificationType.TOTP,
      ])
    ).toEqual([VerificationType.WebAuthn, VerificationType.Password, VerificationType.TOTP]);
  });

  it.each(['ios', 'android'] as const)(
    'drops WebAuthn on a native %s webview when another method remains',
    (platform) => {
      setNativeSdk({ ...nativeSdk, platform });

      expect(
        getDisplayedStepUpMethods([
          VerificationType.WebAuthn,
          VerificationType.Password,
          VerificationType.TOTP,
        ])
      ).toEqual([VerificationType.Password, VerificationType.TOTP]);
    }
  );

  it('keeps WebAuthn on a native webview when it is the only method', () => {
    setNativeSdk(nativeSdk);

    expect(getDisplayedStepUpMethods([VerificationType.WebAuthn])).toEqual([
      VerificationType.WebAuthn,
    ]);
  });

  it('keeps WebAuthn on a native webview when the other server methods are not renderable', () => {
    setNativeSdk(nativeSdk);

    expect(getDisplayedStepUpMethods([VerificationType.Social, VerificationType.WebAuthn])).toEqual(
      [VerificationType.WebAuthn]
    );
  });

  it('does not treat an unknown platform as a native webview', () => {
    // @ts-expect-error -- an SDK global whose platform the SPA does not know
    setNativeSdk({ ...nativeSdk, platform: 'web' });

    expect(
      getDisplayedStepUpMethods([VerificationType.WebAuthn, VerificationType.Password])
    ).toEqual([VerificationType.WebAuthn, VerificationType.Password]);
  });
});

describe('getMaskedIdentifier', () => {
  const maskedIdentifiers = { email, phone };

  it.each([
    VerificationType.EmailVerificationCode,
    VerificationType.MfaEmailVerificationCode,
  ] as const)('returns the masked email for %s', (method) => {
    expect(getMaskedIdentifier(method, maskedIdentifiers)).toBe(email);
  });

  it.each([
    VerificationType.PhoneVerificationCode,
    VerificationType.MfaPhoneVerificationCode,
  ] as const)('returns the masked phone for %s', (method) => {
    expect(getMaskedIdentifier(method, maskedIdentifiers)).toBe(phone);
  });

  it.each([
    VerificationType.Password,
    VerificationType.TOTP,
    VerificationType.WebAuthn,
    VerificationType.BackupCode,
  ] as const)('returns nothing for %s even when identifiers are available', (method) => {
    expect(getMaskedIdentifier(method, maskedIdentifiers)).toBeUndefined();
  });

  it('returns nothing when the server did not provide the identifier of a code method', () => {
    expect(getMaskedIdentifier(VerificationType.EmailVerificationCode, { phone })).toBeUndefined();
    expect(
      getMaskedIdentifier(VerificationType.MfaPhoneVerificationCode, { email })
    ).toBeUndefined();
    expect(getMaskedIdentifier(VerificationType.PhoneVerificationCode, {})).toBeUndefined();
  });
});

describe('toMfaFlowState', () => {
  it('maps the MFA methods to factors in order and ignores the first factors', () => {
    expect(
      toMfaFlowState(
        [
          VerificationType.Password,
          VerificationType.BackupCode,
          VerificationType.EmailVerificationCode,
          VerificationType.MfaPhoneVerificationCode,
          VerificationType.TOTP,
          VerificationType.PhoneVerificationCode,
          VerificationType.WebAuthn,
          VerificationType.MfaEmailVerificationCode,
        ],
        { maskedIdentifiers: {} }
      )
    ).toEqual({
      availableFactors: [
        MfaFactor.BackupCode,
        MfaFactor.PhoneVerificationCode,
        MfaFactor.TOTP,
        MfaFactor.WebAuthn,
        MfaFactor.EmailVerificationCode,
      ],
      maskedIdentifiers: {},
    });
  });

  it('yields no factors when only first factors are offered', () => {
    expect(
      toMfaFlowState(
        [
          VerificationType.Password,
          VerificationType.EmailVerificationCode,
          VerificationType.PhoneVerificationCode,
        ],
        { maskedIdentifiers: { email, phone } }
      )
    ).toEqual({ availableFactors: [], maskedIdentifiers: {} });

    expect(toMfaFlowState([], { maskedIdentifiers: { email, phone } })).toEqual({
      availableFactors: [],
      maskedIdentifiers: {},
    });
  });

  it('keys the masked identifiers by the enrolled code factors', () => {
    expect(
      toMfaFlowState(
        [VerificationType.MfaEmailVerificationCode, VerificationType.MfaPhoneVerificationCode],
        { maskedIdentifiers: { email, phone } }
      )
    ).toEqual({
      availableFactors: [MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
      maskedIdentifiers: {
        [MfaFactor.EmailVerificationCode]: email,
        [MfaFactor.PhoneVerificationCode]: phone,
      },
    });
  });

  it('omits the identifier of a code factor that is not offered', () => {
    expect(
      toMfaFlowState([VerificationType.TOTP, VerificationType.MfaEmailVerificationCode], {
        maskedIdentifiers: { email, phone },
      })
    ).toEqual({
      availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
      maskedIdentifiers: { [MfaFactor.EmailVerificationCode]: email },
    });
  });

  it('does not attribute a primary code identifier to an MFA factor', () => {
    expect(
      toMfaFlowState([VerificationType.EmailVerificationCode, VerificationType.TOTP], {
        maskedIdentifiers: { email },
      })
    ).toEqual({ availableFactors: [MfaFactor.TOTP], maskedIdentifiers: {} });
  });

  it('omits the identifier of an offered code factor when the server did not provide one', () => {
    expect(
      toMfaFlowState(
        [VerificationType.MfaEmailVerificationCode, VerificationType.MfaPhoneVerificationCode],
        { maskedIdentifiers: { phone } }
      )
    ).toEqual({
      availableFactors: [MfaFactor.EmailVerificationCode, MfaFactor.PhoneVerificationCode],
      maskedIdentifiers: { [MfaFactor.PhoneVerificationCode]: phone },
    });

    expect(
      toMfaFlowState([VerificationType.MfaEmailVerificationCode], {
        maskedIdentifiers: { email: '' },
      })
    ).toEqual({ availableFactors: [MfaFactor.EmailVerificationCode], maskedIdentifiers: {} });
  });
});
