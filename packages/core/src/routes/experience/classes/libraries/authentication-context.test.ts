import { TemplateType } from '@logto/connector-kit';
import {
  SignInIdentifier,
  UsersPasswordEncryptionMethod,
  VerificationType,
  type User,
} from '@logto/schemas';

import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { BackupCodeVerification } from '../verifications/backup-code-verification.js';
import {
  EmailCodeVerification,
  MfaEmailCodeVerification,
  MfaPhoneCodeVerification,
  PhoneCodeVerification,
} from '../verifications/code-verification.js';
import { NewPasswordIdentityVerification } from '../verifications/new-password-identity-verification.js';
import { OneTimeTokenVerification } from '../verifications/one-time-token-verification.js';
import { PasswordVerification } from '../verifications/password-verification.js';
import { SocialVerification } from '../verifications/social-verification.js';
import { TotpVerification } from '../verifications/totp-verification.js';
import {
  SignInPasskeyVerification,
  WebAuthnVerification,
} from '../verifications/web-authn-verification.js';

import { deriveAuthenticationContext } from './authentication-context.js';

const { libraries, queries } = new MockTenant();
const userId = mockUser.id;
const email = 'foo@bar.com';
const phone = '+11234567890';

/** A user with every MFA factor enrolled. */
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

/** The ids of the identifier records below; the interaction records them at identification. */
const identifiedVerificationIds = new Set(['password', 'email', 'phone', 'one-time-token']);

type Options = Partial<Parameters<typeof deriveAuthenticationContext>[1]>;

const derive = (
  records: Parameters<typeof deriveAuthenticationContext>[0],
  options: Options = {}
) => deriveAuthenticationContext(records, { user, identifiedVerificationIds, ...options });

const password = ({
  verifiedAt,
  verified = true,
  id = 'password',
}: { verifiedAt?: number; verified?: boolean; id?: string } = {}) =>
  new PasswordVerification(libraries, queries, {
    id,
    type: VerificationType.Password,
    identifier: { type: SignInIdentifier.Username, value: 'foo' },
    verified,
    verifiedAt,
  });

const emailCode = (verifiedAt?: number, id = 'email') =>
  new EmailCodeVerification(libraries, queries, {
    id,
    type: VerificationType.EmailVerificationCode,
    identifier: { type: SignInIdentifier.Email, value: email },
    templateType: TemplateType.SignIn,
    verified: true,
    verifiedAt,
  });

const phoneCode = (verifiedAt?: number) =>
  new PhoneCodeVerification(libraries, queries, {
    id: 'phone',
    type: VerificationType.PhoneVerificationCode,
    identifier: { type: SignInIdentifier.Phone, value: phone },
    templateType: TemplateType.SignIn,
    verified: true,
    verifiedAt,
  });

const oneTimeToken = (verifiedAt?: number) =>
  new OneTimeTokenVerification(libraries, queries, {
    id: 'one-time-token',
    type: VerificationType.OneTimeToken,
    identifier: { type: SignInIdentifier.Email, value: email },
    verified: true,
    verifiedAt,
  });

/** An MFA code sent to the given email, as the MFA verification-code route creates it. */
const mfaEmailCode = (verifiedAt?: number, address = email) =>
  new MfaEmailCodeVerification(libraries, queries, {
    id: 'mfa-email',
    type: VerificationType.MfaEmailVerificationCode,
    identifier: { type: SignInIdentifier.Email, value: address },
    templateType: TemplateType.MfaVerification,
    verified: true,
    verifiedAt,
  });

const mfaPhoneCode = (verifiedAt?: number) =>
  new MfaPhoneCodeVerification(libraries, queries, {
    id: 'mfa-phone',
    type: VerificationType.MfaPhoneVerificationCode,
    identifier: { type: SignInIdentifier.Phone, value: phone },
    templateType: TemplateType.MfaVerification,
    verified: true,
    verifiedAt,
  });

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
  it('reaches 1fa with a password', () => {
    expect(derive([password({ verifiedAt: 100 })])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['pwd'],
      ts: 100,
    });
  });

  it('reaches 1fa with a primary email code', () => {
    expect(derive([emailCode(100)])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it('reaches mfa with a password and a TOTP, taking the earliest timestamp', () => {
    expect(derive([password({ verifiedAt: 200 }), totp({ verifiedAt: 100 })])).toEqual({
      acr: 'urn:logto:acr:mfa',
      amr: ['pwd', 'otp', 'mfa'],
      ts: 100,
    });
  });

  it('reaches mfa with a primary email code and an MFA phone code', () => {
    expect(derive([emailCode(100), mfaPhoneCode(200)])).toEqual({
      acr: 'urn:logto:acr:mfa',
      amr: ['otp', 'sms', 'mfa'],
      ts: 100,
    });
  });

  it('reaches mfa with a password and a backup code', () => {
    expect(derive([password({ verifiedAt: 100 }), backupCode(200)])).toEqual({
      acr: 'urn:logto:acr:mfa',
      amr: ['pwd', 'otp', 'mfa'],
      ts: 100,
    });
  });

  it('reaches only 1fa with a TOTP alone', () => {
    expect(derive([totp({ verifiedAt: 100 })])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it('reaches only 1fa with two mfa-class factors and no first factor', () => {
    expect(derive([totp({ verifiedAt: 100 }), backupCode(200)])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it.each([webAuthn, signInPasskey])(
    'reaches mfa with a user-verified WebAuthn assertion alone',
    (build) => {
      expect(derive([build(100)])).toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['pop', 'user', 'mfa'],
        ts: 100,
      });
    }
  );

  it('records only fed for a social sign-in', () => {
    expect(derive([social(100)])).toEqual({ amr: ['fed'], ts: 100 });
  });

  it('keeps fed next to a Logto-verifiable factor', () => {
    expect(derive([social(100), password({ verifiedAt: 200 })])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['fed', 'pwd'],
      ts: 100,
    });
  });

  it('keeps fed for an identity that is only being linked by this submission', () => {
    // A linking social record never identified the user through its stored identity.
    expect(derive([social(50)], { identifiedVerificationIds: new Set() })).toEqual({
      amr: ['fed'],
      ts: 50,
    });
  });

  it('ignores unverified records and factors enrolled in this interaction', () => {
    expect(
      derive([
        password({ verifiedAt: 100, verified: false }),
        totp({ verifiedAt: 50, secret: 'new' }),
      ])
    ).toEqual({});
    expect(
      derive([password({ verifiedAt: 100 }), totp({ verifiedAt: 50, secret: 'new' })])
    ).toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
  });

  it('omits ts when no counted record carries verifiedAt', () => {
    expect(derive([password()])).toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'] });
  });

  describe('one factor never fills both roles', () => {
    it('stays at 1fa when the MFA code went to the same mailbox as a one-time token', () => {
      expect(derive([oneTimeToken(100), mfaEmailCode(200)])).toEqual({
        acr: 'urn:logto:acr:1fa',
        amr: ['otp'],
        ts: 100,
      });
    });

    it.each([
      ['email', () => [emailCode(100), mfaEmailCode(200)], ['otp']],
      ['phone', () => [phoneCode(100), mfaPhoneCode(200)], ['sms']],
    ] as const)(
      'stays at 1fa when the MFA code went to the same %s as the first factor',
      (_, build, amr) => {
        expect(derive(build())).toEqual({ acr: 'urn:logto:acr:1fa', amr, ts: 100 });
      }
    );

    it('still reaches mfa when another factor supplies the first factor', () => {
      expect(derive([password({ verifiedAt: 100 }), mfaEmailCode(200)])).toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['pwd', 'otp', 'mfa'],
        ts: 100,
      });
      expect(derive([emailCode(100), password({ verifiedAt: 150 }), mfaEmailCode(200)])).toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['otp', 'pwd', 'mfa'],
        ts: 100,
      });
    });
  });

  describe('records that are not proofs of the identified user', () => {
    it('ignores an identifier record that did not identify the user', () => {
      // A code for an address the user is adding, or a password verified for another account,
      // is never passed to `identifyUser()` for this user.
      expect(derive([social(100), emailCode(50, 'added-email')])).toEqual({
        amr: ['fed'],
        ts: 100,
      });
      expect(derive([password({ verifiedAt: 50, id: 'other-account' })])).toEqual({});
    });

    it('ignores a registration password that never identified the user', () => {
      // The route only accepts the record in a Register interaction, and `identifyUser()` never
      // records it; a stored one from before the route guard still counts nothing.
      expect(derive([social(100), newPasswordIdentity(50)])).toEqual({ amr: ['fed'], ts: 100 });
      expect(derive([social(100), newPasswordIdentity(50), totp({ verifiedAt: 200 })])).toEqual({
        acr: 'urn:logto:acr:1fa',
        amr: ['fed', 'otp'],
        ts: 100,
      });
    });

    it('ignores an MFA code that was not sent to the primary contact of the user', () => {
      expect(derive([password({ verifiedAt: 100 }), mfaEmailCode(200, 'other@bar.com')])).toEqual({
        acr: 'urn:logto:acr:1fa',
        amr: ['pwd'],
        ts: 100,
      });
    });

    it('ignores factor records created for another user', () => {
      expect(
        derive([password({ verifiedAt: 100 }), totp({ verifiedAt: 50, ownerId: 'someone-else' })])
      ).toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
      expect(derive([signInPasskey(100, 'someone-else')])).toEqual({});
    });
  });
});
