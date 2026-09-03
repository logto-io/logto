import { TemplateType } from '@logto/connector-kit';
import {
  MfaFactor,
  SignInIdentifier,
  UsersPasswordEncryptionMethod,
  VerificationType,
  type User,
} from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { BackupCodeVerification } from '../verifications/backup-code-verification.js';
import {
  EmailCodeVerification,
  MfaEmailCodeVerification,
  MfaPhoneCodeVerification,
  PhoneCodeVerification,
} from '../verifications/code-verification.js';
import { NewPasswordIdentityVerification } from '../verifications/new-password-identity-verification.js';
import { PasswordVerification } from '../verifications/password-verification.js';
import { SocialVerification } from '../verifications/social-verification.js';
import { TotpVerification } from '../verifications/totp-verification.js';
import {
  SignInPasskeyVerification,
  WebAuthnVerification,
} from '../verifications/web-authn-verification.js';

import { deriveAuthenticationContext } from './authentication-context.js';
import { MfaValidator } from './mfa-validator.js';

const { jest } = import.meta;

const { libraries, queries } = new MockTenant();
const userId = mockUser.id;
const email = 'foo@bar.com';
const phone = '+11234567890';

/** A user with every MFA factor enrolled, and the sign-in experience enabling all of them. */
const user: User = {
  ...mockUser,
  primaryEmail: email,
  primaryPhone: phone,
  mfaVerifications: [
    mockUserTotpMfaVerification,
    mockUserWebAuthnMfaVerification,
    mockUserBackupCodeMfaVerification,
  ],
};
const allFactorsEnabled = new MfaValidator(
  { ...mockSignInExperience.mfa, factors: Object.values(MfaFactor) },
  user
);
const noFactorEnabled = new MfaValidator({ ...mockSignInExperience.mfa, factors: [] }, user);

const derive = async (records: Parameters<typeof deriveAuthenticationContext>[0]) =>
  deriveAuthenticationContext(records, userId, allFactorsEnabled);

/** Marks an identifier record that identifies no account. */
const noAccount = Symbol('no account');

/**
 * Stub which account an identifier record identifies: the given user, or none (the record then
 * rejects the way a real one does for an unregistered identifier or an unlinked identity).
 */
const identifying = <T extends { identifyUser: () => Promise<User> }>(
  record: T,
  identifiedUserId: string | typeof noAccount = userId
): T => {
  const target: { identifyUser: () => Promise<User> } = record;
  jest.spyOn(target, 'identifyUser').mockImplementation(async () => {
    if (identifiedUserId === noAccount) {
      throw new RequestError({ code: 'user.user_not_exist', status: 404 });
    }

    return { ...user, id: identifiedUserId };
  });

  return record;
};

const password = (verifiedAt?: number, verified = true) =>
  identifying(
    new PasswordVerification(libraries, queries, {
      id: 'password',
      type: VerificationType.Password,
      identifier: { type: SignInIdentifier.Username, value: 'foo' },
      verified,
      verifiedAt,
    })
  );

const emailCode = (verifiedAt?: number, identifiedUserId: string | typeof noAccount = userId) =>
  identifying(
    new EmailCodeVerification(libraries, queries, {
      id: 'email',
      type: VerificationType.EmailVerificationCode,
      identifier: { type: SignInIdentifier.Email, value: email },
      templateType: TemplateType.SignIn,
      verified: true,
      verifiedAt,
    }),
    identifiedUserId
  );

const phoneCode = (verifiedAt?: number) =>
  identifying(
    new PhoneCodeVerification(libraries, queries, {
      id: 'phone',
      type: VerificationType.PhoneVerificationCode,
      identifier: { type: SignInIdentifier.Phone, value: phone },
      templateType: TemplateType.SignIn,
      verified: true,
      verifiedAt,
    })
  );

/** An MFA code sent to the user's primary email, as the MFA verification-code route creates it. */
const mfaEmailCode = (verifiedAt?: number) =>
  identifying(
    new MfaEmailCodeVerification(libraries, queries, {
      id: 'mfa-email',
      type: VerificationType.MfaEmailVerificationCode,
      identifier: { type: SignInIdentifier.Email, value: email },
      templateType: TemplateType.MfaVerification,
      verified: true,
      verifiedAt,
    })
  );

const mfaPhoneCode = (verifiedAt?: number) =>
  identifying(
    new MfaPhoneCodeVerification(libraries, queries, {
      id: 'mfa-phone',
      type: VerificationType.MfaPhoneVerificationCode,
      identifier: { type: SignInIdentifier.Phone, value: phone },
      templateType: TemplateType.MfaVerification,
      verified: true,
      verifiedAt,
    })
  );

const totp = ({
  verifiedAt,
  secret,
  ownerId = userId,
}: { verifiedAt?: number; secret?: string; ownerId?: string } = {}) =>
  new TotpVerification(libraries, queries, {
    id: 'totp',
    type: VerificationType.TOTP,
    userId: ownerId,
    verified: true,
    verifiedAt,
    secret,
  });

const backupCode = (verifiedAt?: number) =>
  new BackupCodeVerification(libraries, queries, {
    id: 'backup',
    type: VerificationType.BackupCode,
    userId,
    code: 'code',
    verifiedAt,
  });

const webAuthn = (verifiedAt?: number) =>
  new WebAuthnVerification(libraries, queries, {
    id: 'webauthn',
    type: VerificationType.WebAuthn,
    userId,
    verified: true,
    verifiedAt,
  });

const signInPasskey = (verifiedAt?: number, ownerId = userId) =>
  new SignInPasskeyVerification(libraries, queries, {
    id: 'passkey',
    type: VerificationType.SignInPasskey,
    userId: ownerId,
    verified: true,
    verifiedAt,
  });

/** A verified social assertion; whether the identity is linked to the account is irrelevant. */
const social = (verifiedAt?: number) =>
  new SocialVerification(libraries, queries, {
    id: 'social',
    type: VerificationType.Social,
    connectorId: 'connector',
    socialUserInfo: { id: 'social-user' },
    verifiedAt,
  });

/** A verified registration record: a policy-compliant password proposed for an unused username. */
const newPasswordIdentity = (verifiedAt?: number) =>
  new NewPasswordIdentityVerification(libraries, queries, {
    id: 'new-password-identity',
    type: VerificationType.NewPasswordIdentity,
    identifier: { type: SignInIdentifier.Username, value: 'unused' },
    passwordEncrypted: 'encrypted',
    passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
    verifiedAt,
  });

describe('deriveAuthenticationContext', () => {
  it('reaches 1fa with a password', async () => {
    await expect(derive([password(100)])).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['pwd'],
      ts: 100,
    });
  });

  it('reaches 1fa with a primary email code', async () => {
    await expect(derive([emailCode(100)])).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it('reaches mfa with a password and a TOTP, taking the earliest timestamp', async () => {
    await expect(derive([password(200), totp({ verifiedAt: 100 })])).resolves.toEqual({
      acr: 'urn:logto:acr:mfa',
      amr: ['pwd', 'otp', 'mfa'],
      ts: 100,
    });
  });

  it('reaches mfa with a primary email code and an MFA phone code', async () => {
    await expect(derive([emailCode(100), mfaPhoneCode(200)])).resolves.toEqual({
      acr: 'urn:logto:acr:mfa',
      amr: ['otp', 'sms', 'mfa'],
      ts: 100,
    });
  });

  it('reaches only 1fa with a TOTP alone', async () => {
    await expect(derive([totp({ verifiedAt: 100 })])).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it('reaches only 1fa with two mfa-class factors and no first factor', async () => {
    await expect(derive([totp({ verifiedAt: 100 }), backupCode(200)])).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it.each([webAuthn, signInPasskey])(
    'reaches mfa with a user-verified WebAuthn assertion alone',
    async (build) => {
      await expect(derive([build(100)])).resolves.toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['pop', 'user', 'mfa'],
        ts: 100,
      });
    }
  );

  it('records only fed for a social sign-in', async () => {
    await expect(derive([social(100)])).resolves.toEqual({ amr: ['fed'], ts: 100 });
  });

  it('keeps fed next to a Logto-verifiable factor', async () => {
    await expect(derive([social(100), password(200)])).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['fed', 'pwd'],
      ts: 100,
    });
  });

  it('ignores unverified records and factors enrolled in this interaction', async () => {
    await expect(
      derive([password(100, false), totp({ verifiedAt: 50, secret: 'new' })])
    ).resolves.toEqual({});
    await expect(derive([password(100), totp({ verifiedAt: 50, secret: 'new' })])).resolves.toEqual(
      { acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 }
    );
  });

  it('omits ts when no counted record carries verifiedAt', async () => {
    await expect(derive([password()])).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['pwd'],
    });
  });

  describe('one factor never fills both roles', () => {
    it('stays at 1fa when the MFA code went to the same email as the first factor', async () => {
      await expect(derive([emailCode(100), mfaEmailCode(200)])).resolves.toEqual({
        acr: 'urn:logto:acr:1fa',
        amr: ['otp'],
        ts: 100,
      });
    });

    it('stays at 1fa when the MFA code went to the same phone as the first factor', async () => {
      await expect(derive([phoneCode(100), mfaPhoneCode(200)])).resolves.toEqual({
        acr: 'urn:logto:acr:1fa',
        amr: ['sms'],
        ts: 100,
      });
    });

    it('still reaches mfa when another factor supplies the first factor', async () => {
      await expect(derive([password(100), mfaEmailCode(200)])).resolves.toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['pwd', 'otp', 'mfa'],
        ts: 100,
      });
      await expect(derive([emailCode(100), password(150), mfaEmailCode(200)])).resolves.toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['otp', 'pwd', 'mfa'],
        ts: 100,
      });
    });
  });

  describe('records that are not proofs of the identified user', () => {
    it('never counts a new-password-identity record, even next to a real proof', async () => {
      await expect(derive([social(100), newPasswordIdentity(50)])).resolves.toEqual({
        amr: ['fed'],
        ts: 100,
      });
      // Without the registration password, a TOTP alone reaches only 1fa.
      await expect(
        derive([social(100), newPasswordIdentity(50), totp({ verifiedAt: 200 })])
      ).resolves.toEqual({ acr: 'urn:logto:acr:1fa', amr: ['fed', 'otp'], ts: 100 });
    });

    it('ignores an MFA record of a factor the user has not enabled', async () => {
      await expect(
        deriveAuthenticationContext(
          [password(100), totp({ verifiedAt: 200 }), mfaEmailCode(300)],
          userId,
          noFactorEnabled
        )
      ).resolves.toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
    });

    it('ignores an identifier record that identifies no account', async () => {
      await expect(derive([social(100), emailCode(50, noAccount)])).resolves.toEqual({
        amr: ['fed'],
        ts: 100,
      });
    });

    it('ignores an identifier record that identifies another account', async () => {
      await expect(derive([emailCode(50, 'someone-else')])).resolves.toEqual({});
    });

    it('keeps fed for an identity that is only being linked by this submission', async () => {
      const record = social(50);
      jest
        .spyOn(record, 'identifyUser')
        .mockRejectedValue(new RequestError({ code: 'user.identity_not_exist', status: 404 }));

      await expect(derive([record])).resolves.toEqual({ amr: ['fed'], ts: 50 });
      expect(record.identifyUser).not.toHaveBeenCalled();
    });

    it('ignores factor records created for another user', async () => {
      await expect(
        derive([password(100), totp({ verifiedAt: 50, ownerId: 'someone-else' })])
      ).resolves.toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
      await expect(derive([signInPasskey(100, 'someone-else')])).resolves.toEqual({});
    });

    it('propagates an unexpected identification failure', async () => {
      const record = password(100);
      jest.spyOn(record, 'identifyUser').mockRejectedValue(new Error('database down'));

      await expect(derive([record])).rejects.toThrow('database down');
    });
  });
});
