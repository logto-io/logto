import { MfaFactor, MfaPolicy, type User, VerificationType } from '@logto/schemas';

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

describe('MfaValidator enforced requirements', () => {
  it.each([undefined, { requiresMfa: false, triggeredRules: [] }])(
    'enforces a user requirement regardless of adaptive result %j',
    (adaptiveMfaResult) => {
      const settings = {
        policy: MfaPolicy.NoPrompt,
        factors: [MfaFactor.EmailVerificationCode],
      };
      const user: User = {
        ...mockUserWithMfaVerifications,
        primaryEmail: 'user@example.com',
        mfaVerifications: [],
        logtoConfig: { mfa: { enabled: false, skipMfaOnSignIn: true } },
      };
      const context = { adaptiveMfaResult, isMfaRequiredByUser: true };

      expect(new MfaValidator(settings, user, context).isMfaRequired).toBe(true);
      expect(
        new MfaValidator(settings, { ...user, primaryEmail: null }, context).isMfaRequired
      ).toBe(false);
    }
  );
});
