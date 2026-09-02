import { TemplateType } from '@logto/connector-kit';
import { SignInIdentifier, VerificationType } from '@logto/schemas';

import { MockTenant } from '#src/test-utils/tenant.js';

import { BackupCodeVerification } from '../verifications/backup-code-verification.js';
import { EmailCodeVerification } from '../verifications/code-verification.js';
import { PasswordVerification } from '../verifications/password-verification.js';
import { SocialVerification } from '../verifications/social-verification.js';
import { TotpVerification } from '../verifications/totp-verification.js';
import {
  SignInPasskeyVerification,
  WebAuthnVerification,
} from '../verifications/web-authn-verification.js';

import { deriveAuthenticationContext } from './authentication-context.js';

const { libraries, queries } = new MockTenant();

const password = (verifiedAt?: number, verified = true) =>
  new PasswordVerification(libraries, queries, {
    id: 'password',
    type: VerificationType.Password,
    identifier: { type: SignInIdentifier.Username, value: 'foo' },
    verified,
    verifiedAt,
  });

const emailCode = (verifiedAt?: number) =>
  new EmailCodeVerification(libraries, queries, {
    id: 'email',
    type: VerificationType.EmailVerificationCode,
    identifier: { type: SignInIdentifier.Email, value: 'foo@bar.com' },
    templateType: TemplateType.SignIn,
    verified: true,
    verifiedAt,
  });

const totp = ({ verifiedAt, secret }: { verifiedAt?: number; secret?: string } = {}) =>
  new TotpVerification(libraries, queries, {
    id: 'totp',
    type: VerificationType.TOTP,
    userId: 'user',
    verified: true,
    verifiedAt,
    secret,
  });

const backupCode = (verifiedAt?: number) =>
  new BackupCodeVerification(libraries, queries, {
    id: 'backup',
    type: VerificationType.BackupCode,
    userId: 'user',
    code: 'code',
    verifiedAt,
  });

const webAuthn = (verifiedAt?: number) =>
  new WebAuthnVerification(libraries, queries, {
    id: 'webauthn',
    type: VerificationType.WebAuthn,
    userId: 'user',
    verified: true,
    verifiedAt,
  });

const signInPasskey = (verifiedAt?: number) =>
  new SignInPasskeyVerification(libraries, queries, {
    id: 'passkey',
    type: VerificationType.SignInPasskey,
    userId: 'user',
    verified: true,
    verifiedAt,
  });

const social = (verifiedAt?: number) =>
  new SocialVerification(libraries, queries, {
    id: 'social',
    type: VerificationType.Social,
    connectorId: 'connector',
    socialUserInfo: { id: 'social-user' },
    verifiedAt,
  });

describe('deriveAuthenticationContext', () => {
  it('reaches 1fa with a password', () => {
    expect(deriveAuthenticationContext([password(100)])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['pwd'],
      ts: 100,
    });
  });

  it('reaches 1fa with a primary email code', () => {
    expect(deriveAuthenticationContext([emailCode(100)])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it('reaches mfa with a password and a TOTP, taking the earliest timestamp', () => {
    expect(deriveAuthenticationContext([password(200), totp({ verifiedAt: 100 })])).toEqual({
      acr: 'urn:logto:acr:mfa',
      amr: ['pwd', 'otp', 'mfa'],
      ts: 100,
    });
  });

  it('reaches only 1fa with a TOTP alone', () => {
    expect(deriveAuthenticationContext([totp({ verifiedAt: 100 })])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it('reaches only 1fa with two mfa-class factors and no first factor', () => {
    expect(deriveAuthenticationContext([totp({ verifiedAt: 100 }), backupCode(200)])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['otp'],
      ts: 100,
    });
  });

  it.each([webAuthn, signInPasskey])(
    'reaches mfa with a user-verified WebAuthn assertion alone',
    (build) => {
      expect(deriveAuthenticationContext([build(100)])).toEqual({
        acr: 'urn:logto:acr:mfa',
        amr: ['pop', 'user', 'mfa'],
        ts: 100,
      });
    }
  );

  it('records only fed for a social sign-in', () => {
    expect(deriveAuthenticationContext([social(100)])).toEqual({ amr: ['fed'], ts: 100 });
  });

  it('keeps fed next to a Logto-verifiable factor', () => {
    expect(deriveAuthenticationContext([social(100), password(200)])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['fed', 'pwd'],
      ts: 100,
    });
  });

  it('ignores unverified records and factors enrolled in this interaction', () => {
    expect(
      deriveAuthenticationContext([password(100, false), totp({ verifiedAt: 50, secret: 'new' })])
    ).toEqual({});
    expect(
      deriveAuthenticationContext([password(100), totp({ verifiedAt: 50, secret: 'new' })])
    ).toEqual({ acr: 'urn:logto:acr:1fa', amr: ['pwd'], ts: 100 });
  });

  it('omits ts when no counted record carries verifiedAt', () => {
    expect(deriveAuthenticationContext([password()])).toEqual({
      acr: 'urn:logto:acr:1fa',
      amr: ['pwd'],
    });
  });
});
