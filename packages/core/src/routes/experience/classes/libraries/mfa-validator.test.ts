import { MfaFactor, MfaPolicy, VerificationType } from '@logto/schemas';

import { mockUserWithMfaVerifications } from '#src/__mocks__/user.js';

import { type VerificationRecord } from '../verifications/index.js';

import { MfaValidator } from './mfa-validator.js';

const mfaSettings = {
  policy: MfaPolicy.Mandatory,
  factors: [MfaFactor.TOTP],
};

const totpRecord = (userId: string) =>
  ({
    type: VerificationType.TOTP,
    userId,
    isVerified: true,
    isNewBindMfaVerification: false,
  }) as unknown as VerificationRecord;

describe('MfaValidator verified-record ownership', () => {
  const user = mockUserWithMfaVerifications;
  const validator = new MfaValidator(mfaSettings, user);

  it('counts a verified record made against the same user', () => {
    expect(validator.isMfaVerified([totpRecord(user.id)])).toBe(true);
  });

  it('does not count a verified record made against another user', () => {
    expect(validator.isMfaVerified([totpRecord('another-user-id')])).toBe(false);
  });
});
