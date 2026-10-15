import { InteractionEvent, MfaFactor, VerificationType } from '@logto/schemas';
import * as s from 'superstruct';

import {
  mfaErrorDataGuard,
  trustedDeviceOptInErrorDataGuard,
  trustedDeviceOptInStateGuard,
  verificationIdsMapGuard,
} from './guard';

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

  it('mfaErrorDataGuard should accept passkey suggestion metadata', () => {
    expect(() => {
      s.assert(
        {
          availableFactors: [MfaFactor.TOTP, MfaFactor.EmailVerificationCode],
          skippable: true,
          suggestion: true,
          isWebAuthnUsedAsSignInPasskey: true,
        },
        mfaErrorDataGuard
      );
    }).not.toThrow();
  });

  it('should validate trusted-device error data and page state separately', () => {
    expect(() => {
      s.assert({ durationDays: 30 }, trustedDeviceOptInErrorDataGuard);
      s.assert(
        { durationDays: 30, interactionEvent: InteractionEvent.Register },
        trustedDeviceOptInStateGuard
      );
    }).not.toThrow();

    expect(() => {
      s.assert({ durationDays: '30' }, trustedDeviceOptInErrorDataGuard);
    }).toThrow();
  });
});
