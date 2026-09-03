import { TemplateType } from '@logto/connector-kit';
import {
  SignInIdentifier,
  UsersPasswordEncryptionMethod,
  VerificationType,
  type User,
} from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { BackupCodeVerification } from '../verifications/backup-code-verification.js';
import { EmailCodeVerification } from '../verifications/code-verification.js';
import { NewPasswordIdentityVerification } from '../verifications/new-password-identity-verification.js';
import { PasswordVerification } from '../verifications/password-verification.js';
import { SocialVerification } from '../verifications/social-verification.js';
import { TotpVerification } from '../verifications/totp-verification.js';
import {
  SignInPasskeyVerification,
  WebAuthnVerification,
} from '../verifications/web-authn-verification.js';

import { deriveAuthenticationContext } from './authentication-context.js';

const { jest } = import.meta;

const { libraries, queries } = new MockTenant();
const userId = mockUser.id;

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

    return { ...mockUser, id: identifiedUserId };
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
      identifier: { type: SignInIdentifier.Email, value: 'foo@bar.com' },
      templateType: TemplateType.SignIn,
      verified: true,
      verifiedAt,
    }),
    identifiedUserId
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

const social = (verifiedAt?: number, identifiedUserId: string | typeof noAccount = userId) =>
  identifying(
    new SocialVerification(libraries, queries, {
      id: 'social',
      type: VerificationType.Social,
      connectorId: 'connector',
      socialUserInfo: { id: 'social-user' },
      verifiedAt,
    }),
    identifiedUserId
  );

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
    await expect(deriveAuthenticationContext([password(100)], userId)).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['pwd'],
      ts: 100,
    });
  });

  it('reaches 1fa with a primary email code', async () => {
    await expect(deriveAuthenticationContext([emailCode(100)], userId)).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it('reaches mfa with a password and a TOTP, taking the earliest timestamp', async () => {
    await expect(
      deriveAuthenticationContext([password(200), totp({ verifiedAt: 100 })], userId)
    ).resolves.toEqual({
      acr: 'urn:logto:acr:mfa',
      amr: ['pwd', 'otp', 'mfa'],
      ts: 100,
    });
  });

  it('reaches only 1fa with a TOTP alone', async () => {
    await expect(deriveAuthenticationContext([totp({ verifiedAt: 100 })], userId)).resolves.toEqual(
      {
        acr: 'urn:logto:acr:1fa',
        amr: ['otp'],
        ts: 100,
      }
    );
  });

  it('reaches only 1fa with two mfa-class factors and no first factor', async () => {
    await expect(
      deriveAuthenticationContext([totp({ verifiedAt: 100 }), backupCode(200)], userId)
    ).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it.each([webAuthn, signInPasskey])(
    'reaches mfa with a user-verified WebAuthn assertion alone',
    async (build) => {
      await expect(deriveAuthenticationContext([build(100)], userId)).resolves.toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['pop', 'user', 'mfa'],
        ts: 100,
      });
    }
  );

  it('records only fed for a social sign-in', async () => {
    await expect(deriveAuthenticationContext([social(100)], userId)).resolves.toEqual({
      amr: ['fed'],
      ts: 100,
    });
  });

  it('keeps fed next to a Logto-verifiable factor', async () => {
    await expect(
      deriveAuthenticationContext([social(100), password(200)], userId)
    ).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['fed', 'pwd'],
      ts: 100,
    });
  });

  it('ignores unverified records and factors enrolled in this interaction', async () => {
    await expect(
      deriveAuthenticationContext(
        [password(100, false), totp({ verifiedAt: 50, secret: 'new' })],
        userId
      )
    ).resolves.toEqual({});
    await expect(
      deriveAuthenticationContext([password(100), totp({ verifiedAt: 50, secret: 'new' })], userId)
    ).resolves.toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
  });

  it('omits ts when no counted record carries verifiedAt', async () => {
    await expect(deriveAuthenticationContext([password()], userId)).resolves.toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['pwd'],
    });
  });

  describe('records that are not proofs of the identified user', () => {
    it('never counts a new-password-identity record, even next to a real proof', async () => {
      await expect(
        deriveAuthenticationContext([social(100), newPasswordIdentity(50)], userId)
      ).resolves.toEqual({ amr: ['fed'], ts: 100 });
      // Without the registration password, a TOTP alone reaches only 1fa.
      await expect(
        deriveAuthenticationContext(
          [social(100), newPasswordIdentity(50), totp({ verifiedAt: 200 })],
          userId
        )
      ).resolves.toEqual({ acr: 'urn:logto:acr:1fa', amr: ['fed', 'otp'], ts: 100 });
    });

    it('ignores an identifier record that identifies no account', async () => {
      await expect(
        deriveAuthenticationContext([social(100), emailCode(50, noAccount)], userId)
      ).resolves.toEqual({ amr: ['fed'], ts: 100 });
    });

    it('ignores an identifier record that identifies another account', async () => {
      await expect(
        deriveAuthenticationContext([emailCode(50, 'someone-else')], userId)
      ).resolves.toEqual({});
    });

    it('ignores a social identity that is not linked to the account', async () => {
      await expect(
        deriveAuthenticationContext([password(100), social(50, noAccount)], userId)
      ).resolves.toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
    });

    it('ignores factor records created for another user', async () => {
      await expect(
        deriveAuthenticationContext(
          [password(100), totp({ verifiedAt: 50, ownerId: 'someone-else' })],
          userId
        )
      ).resolves.toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
      await expect(
        deriveAuthenticationContext([signInPasskey(100, 'someone-else')], userId)
      ).resolves.toEqual({});
    });

    it('propagates an unexpected identification failure', async () => {
      const record = password(100);
      jest.spyOn(record, 'identifyUser').mockRejectedValue(new Error('database down'));

      await expect(deriveAuthenticationContext([record], userId)).rejects.toThrow('database down');
    });
  });
});
