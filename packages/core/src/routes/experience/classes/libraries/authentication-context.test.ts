import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  AuthenticationProofRole,
  type AuthenticationProof,
} from '@logto/schemas';

import { aggregateAuthenticationContext } from './authentication-context.js';

const { FirstFactor, Mfa, Both } = AuthenticationFactorClass;
const { Password, Otp, Sms, ProofOfPossession, UserPresence, Federated } =
  AuthenticationMethodReference;
const { Create, Identify, Bind } = AuthenticationProofRole;

const firstFactorAcr = 'urn:logto:acr:1fa';
const mfaAcr = 'urn:logto:acr:mfa';

const proof = (
  factor: AuthenticationFactor,
  factorClass: AuthenticationFactorClass | undefined,
  amr: AuthenticationMethodReference[],
  role: AuthenticationProofRole = Identify
): AuthenticationProof => ({
  id: `${factor}-${role}`,
  factor,
  ...(factorClass && { class: factorClass }),
  amr,
  role,
});

const aggregate = (proofs: AuthenticationProof[]) => aggregateAuthenticationContext(proofs);

const password = (role?: AuthenticationProofRole) =>
  proof(AuthenticationFactor.Password, FirstFactor, [Password], role);
const email = (role?: AuthenticationProofRole) =>
  proof(AuthenticationFactor.Email, FirstFactor, [Otp], role);
const phone = (role?: AuthenticationProofRole) =>
  proof(AuthenticationFactor.Phone, FirstFactor, [Sms], role);
const mfaEmail = (role?: AuthenticationProofRole) =>
  proof(AuthenticationFactor.Email, Mfa, [Otp], role);
const totp = (role?: AuthenticationProofRole) => proof(AuthenticationFactor.Totp, Mfa, [Otp], role);
const backupCode = () =>
  proof(AuthenticationFactor.BackupCode, Mfa, [Otp], AuthenticationProofRole.Mfa);
const webAuthn = (role?: AuthenticationProofRole) =>
  proof(
    AuthenticationFactor.WebAuthn,
    Both,
    [ProofOfPossession, UserPresence, AuthenticationMethodReference.Mfa],
    role
  );
const federated = (role?: AuthenticationProofRole) =>
  proof(AuthenticationFactor.Federated, undefined, [Federated], role);

/**
 * The case matrix of the ACR / AMR tech design, section 6, row for row. The design is the
 * specification; a policy change must update both.
 */
describe('aggregateAuthenticationContext', () => {
  describe('registration', () => {
    it.each([
      ['Username + password', () => [password(Bind)], firstFactorAcr, ['pwd']],
      ['Email + password', () => [email(Create), password(Bind)], firstFactorAcr, ['otp', 'pwd']],
      ['Phone + password', () => [phone(Create), password(Bind)], firstFactorAcr, ['sms', 'pwd']],
      ['Email code only', () => [email(Create)], firstFactorAcr, ['otp']],
      ['Social', () => [federated(Create)], undefined, ['fed']],
      ['Enterprise SSO', () => [federated(Create)], undefined, ['fed']],
      [
        'Username + password, then enrol TOTP',
        () => [password(Bind), totp(Bind)],
        mfaAcr,
        ['pwd', 'otp', 'mfa'],
      ],
      // A social registration that enrols a TOTP under the tenant's MFA policy: an mfa-class
      // factor without a Logto-verifiable first factor reaches only 1fa.
      [
        'Social, then enrol TOTP',
        () => [federated(Create), totp(Bind)],
        firstFactorAcr,
        ['fed', 'otp'],
      ],
      // A user-verified passkey enrolled and bound in the registration is self-sufficient.
      [
        'Social, then enrol passkey',
        () => [federated(Create), webAuthn(Bind)],
        mfaAcr,
        ['fed', 'pop', 'user', 'mfa'],
      ],
    ])('%s', (_, build, acr, amr) => {
      expect(aggregate(build())).toEqual({ ...(acr && { acr }), amr });
    });
  });

  describe('sign-in', () => {
    it.each([
      ['Password', () => [password()], firstFactorAcr, ['pwd']],
      ['Email code', () => [email()], firstFactorAcr, ['otp']],
      [
        'Password + TOTP',
        () => [password(), totp(AuthenticationProofRole.Mfa)],
        mfaAcr,
        ['pwd', 'otp', 'mfa'],
      ],
      ['Password + backup code', () => [password(), backupCode()], mfaAcr, ['pwd', 'otp', 'mfa']],
      ['Passkey sign-in', () => [webAuthn()], mfaAcr, ['pop', 'user', 'mfa']],
      [
        'Password + WebAuthn MFA',
        () => [password(), webAuthn(AuthenticationProofRole.Mfa)],
        mfaAcr,
        ['pwd', 'pop', 'user', 'mfa'],
      ],
      ['Social (already linked)', () => [federated()], undefined, ['fed']],
      ['Social, linking to an existing account', () => [federated()], undefined, ['fed']],
      ['Enterprise SSO, first sign-in (auto-link)', () => [federated()], undefined, ['fed']],
      [
        'Social + TOTP',
        () => [federated(), totp(AuthenticationProofRole.Mfa)],
        firstFactorAcr,
        ['fed', 'otp'],
      ],
      [
        'Password + trusted device (MFA gate bypassed)',
        () => [password()],
        firstFactorAcr,
        ['pwd'],
      ],
      [
        'Password, then bind new TOTP',
        () => [password(), totp(Bind)],
        mfaAcr,
        ['pwd', 'otp', 'mfa'],
      ],
      [
        'Password → set email → bind email MFA',
        () => [password(), email(Bind), mfaEmail(Bind)],
        mfaAcr,
        ['pwd', 'otp', 'mfa'],
      ],
      [
        'Email code + MFA code to the same address',
        () => [email(), mfaEmail(AuthenticationProofRole.Mfa)],
        firstFactorAcr,
        ['otp'],
      ],
      // A second proof of the same factor in the other role is still one factor.
      [
        'Password + password set again',
        () => [password(), password(Bind)],
        firstFactorAcr,
        ['pwd'],
      ],
      ['TOTP alone', () => [totp(AuthenticationProofRole.Mfa)], firstFactorAcr, ['otp']],
      [
        'Two mfa-class factors and no first factor',
        () => [totp(AuthenticationProofRole.Mfa), backupCode()],
        firstFactorAcr,
        ['otp'],
      ],
      // Another first factor supplies the distinct pair even when the mailbox is repeated.
      [
        'Email code + password + MFA code to the same address',
        () => [email(), password(), mfaEmail(AuthenticationProofRole.Mfa)],
        mfaAcr,
        ['otp', 'pwd', 'mfa'],
      ],
    ])('%s', (_, build, acr, amr) => {
      expect(aggregate(build())).toEqual({ ...(acr && { acr }), amr });
    });
  });

  it('seeds nothing for an interaction without a proof', () => {
    expect(aggregateAuthenticationContext([])).toEqual({});
  });
});
