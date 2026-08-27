import { MfaFactor, VerificationType } from '@logto/schemas';
import * as s from 'superstruct';

import { mfaErrorDataGuard, mfaFlowStateGuard, verificationIdsMapGuard } from './guard';

describe('guard', () => {
  it.each(Object.values(VerificationType))('verificationIdsMapGuard: %s', (type) => {
    expect(() => {
      s.assert({ [type]: 'verificationId' }, verificationIdsMapGuard);
    }).not.toThrow();
  });

  it('should throw with invalid key', () => {
    expect(() => {
      s.assert({ invalidKey: 'verificationId' }, verificationIdsMapGuard);
    }).toThrow();
  });

  it('should successfully parse the value', () => {
    const record = {
      [VerificationType.EmailVerificationCode]: 'verificationId',
      [VerificationType.PhoneVerificationCode]: 'verificationId',
      [VerificationType.Social]: 'verificationId',
    };

    const [error, value] = verificationIdsMapGuard.validate(record);

    expect(error).toBeUndefined();
    expect(value).toEqual(record);
  });

  it('mfaErrorDataGuard should accept passkey suggestion and trusted-device metadata', () => {
    expect(() => {
      s.assert(
        {
          availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
          skippable: true,
          suggestion: true,
          isWebAuthnUsedAsSignInPasskey: true,
          trustedDevice: { canCreate: true, durationDays: 30 },
        },
        mfaErrorDataGuard
      );
    }).not.toThrow();
  });

  it('mfaFlowStateGuard should accept page-specific route state', () => {
    const state = {
      availableFactors: [MfaFactor.WebAuthn, MfaFactor.BackupCode],
      maskedIdentifiers: {},
      trustedDevice: { canCreate: true, durationDays: 365 },
      options: { challenge: 'challenge' },
    };

    expect(() => {
      s.assert(state, mfaFlowStateGuard);
    }).not.toThrow();
  });
});
