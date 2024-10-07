import { VerificationType } from '@logto/schemas';
import * as s from 'superstruct';

import { verificationIdsMapGuard } from './guard';

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
});
