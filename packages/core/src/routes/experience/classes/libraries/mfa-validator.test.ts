import { MfaFactor, MfaPolicy, VerificationType, userMfaDataKey } from '@logto/schemas';

import { mockUserWithMfaVerifications } from '#src/__mocks__/user.js';

import { type VerificationRecord } from '../verifications/index.js';

import { MfaValidator } from './mfa-validator.js';

const mfaSettings = {
  policy: MfaPolicy.Mandatory,
  factors: [MfaFactor.TOTP],
};

const totpRecord = (userId?: string) =>
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

  it('does not count a verified record that names no user', () => {
    expect(validator.isMfaVerified([totpRecord()])).toBe(false);
  });
});

describe('MfaValidator.isMfaRequired with skipMfaOnSignIn', () => {
  const user = {
    ...mockUserWithMfaVerifications,
    logtoConfig: { [userMfaDataKey]: { skipMfaOnSignIn: true } },
  };
  const optionalMfaSettings = { policy: MfaPolicy.NoPrompt, factors: [MfaFactor.TOTP] };

  it('lets the user skip MFA verification under an optional policy', () => {
    expect(new MfaValidator(optionalMfaSettings, user).isMfaRequired).toBe(false);
  });

  it('requires MFA verification when MFA is required for the user', () => {
    expect(new MfaValidator(optionalMfaSettings, user, undefined, true).isMfaRequired).toBe(true);
  });
});
