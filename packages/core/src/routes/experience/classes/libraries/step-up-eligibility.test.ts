import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  AuthenticationProofRole,
  LogtoAcr,
  MfaFactor,
  MfaPolicy,
  VerificationType,
  acrSatisfies,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  type AuthenticationProof,
  type Mfa,
  type User,
} from '@logto/schemas';

import {
  mockUser,
  mockUserBackupCodeMfaVerification,
  mockUserTotpMfaVerification,
  mockUserWebAuthnMfaVerification,
} from '#src/__mocks__/user.js';

import { achieveAcr, deriveCarriedContributions } from './authentication-context.js';
import { computeStepUpEligibility, type StepUpEligibilityInput } from './step-up-eligibility.js';

const allFactors: Mfa = {
  policy: MfaPolicy.UserControlled,
  factors: [
    MfaFactor.TOTP,
    MfaFactor.WebAuthn,
    MfaFactor.BackupCode,
    MfaFactor.EmailVerificationCode,
    MfaFactor.PhoneVerificationCode,
  ],
};

const bothConnectors = { email: true, sms: true };
const noConnectors = { email: false, sms: false };

/** A user with a password, a primary email and phone, and no enrolled MFA factor. */
const passwordUser: User = { ...mockUser, mfaVerifications: [] };
/** A social-only user: no password, no primary identifier, no enrolled factor. */
const socialOnlyUser: User = {
  ...mockUser,
  passwordEncrypted: null,
  passwordEncryptionMethod: null,
  primaryEmail: null,
  primaryPhone: null,
  mfaVerifications: [],
};
const withTotp = (user: User): User => ({
  ...user,
  mfaVerifications: [...user.mfaVerifications, mockUserTotpMfaVerification],
});

const proof = (
  type: VerificationType,
  factor: AuthenticationFactor,
  factorClass: AuthenticationFactorClass | undefined,
  amr: AuthenticationMethodReference[]
): AuthenticationProof => ({
  id: `${type}-record`,
  factor,
  class: factorClass,
  amr,
  role: AuthenticationProofRole.Identify,
});

const passwordProof = proof(
  VerificationType.Password,
  AuthenticationFactor.Password,
  AuthenticationFactorClass.FirstFactor,
  [AuthenticationMethodReference.Password]
);
const emailCodeProof = proof(
  VerificationType.EmailVerificationCode,
  AuthenticationFactor.Email,
  AuthenticationFactorClass.FirstFactor,
  [AuthenticationMethodReference.Otp]
);
const totpProof = proof(
  VerificationType.TOTP,
  AuthenticationFactor.Totp,
  AuthenticationFactorClass.Mfa,
  [AuthenticationMethodReference.Otp]
);
const mfaEmailCodeProof = proof(
  VerificationType.MfaEmailVerificationCode,
  AuthenticationFactor.Email,
  AuthenticationFactorClass.Mfa,
  [AuthenticationMethodReference.Otp]
);

/** The context a password session carries in. */
const passwordSession = deriveCarriedContributions([AuthenticationMethodReference.Password]);

const compute = (input: Partial<StepUpEligibilityInput> = {}) =>
  computeStepUpEligibility({
    user: passwordUser,
    mfaSettings: allFactors,
    connectors: bothConnectors,
    selectedAcr: LogtoAcr.FirstFactor,
    carried: [],
    proofs: [],
    ...input,
  });

describe('computeStepUpEligibility', () => {
  describe('eligibility table', () => {
    it('lists every method of a fully enrolled user for `1fa`', () => {
      const user: User = {
        ...withTotp(passwordUser),
        mfaVerifications: [
          mockUserTotpMfaVerification,
          mockUserWebAuthnMfaVerification,
          mockUserBackupCodeMfaVerification,
        ],
      };

      expect(compute({ user }).availableMethods).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
        VerificationType.WebAuthn,
        VerificationType.TOTP,
        VerificationType.MfaPhoneVerificationCode,
        VerificationType.MfaEmailVerificationCode,
        VerificationType.BackupCode,
      ]);
    });

    it('drops the password for a password-less user', () => {
      const user: User = {
        ...passwordUser,
        passwordEncrypted: null,
        passwordEncryptionMethod: null,
      };

      expect(compute({ user }).availableMethods).toEqual([
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
        VerificationType.MfaPhoneVerificationCode,
        VerificationType.MfaEmailVerificationCode,
      ]);
    });

    it('drops the code methods of an identifier whose connector is not configured', () => {
      const { availableMethods, maskedIdentifiers } = compute({
        connectors: { email: true, sms: false },
      });

      expect(availableMethods).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.MfaEmailVerificationCode,
      ]);
      expect(maskedIdentifiers).toEqual({ email: '****@logto.io' });
    });

    it('drops every code method without connectors', () => {
      const { availableMethods, maskedIdentifiers } = compute({ connectors: noConnectors });

      expect(availableMethods).toEqual([VerificationType.Password]);
      expect(maskedIdentifiers).toEqual({});
    });

    it('drops factors the tenant does not enable and exhausted backup codes', () => {
      const user: User = {
        ...passwordUser,
        mfaVerifications: [
          mockUserTotpMfaVerification,
          mockUserWebAuthnMfaVerification,
          {
            ...mockUserBackupCodeMfaVerification,
            codes: [{ code: 'used', usedAt: new Date().toISOString() }],
          },
        ],
      };

      expect(
        compute({
          user,
          mfaSettings: { policy: MfaPolicy.UserControlled, factors: [MfaFactor.TOTP] },
        }).availableMethods
      ).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
        VerificationType.TOTP,
      ]);
      expect(
        compute({
          user,
          mfaSettings: {
            policy: MfaPolicy.UserControlled,
            factors: [MfaFactor.TOTP, MfaFactor.BackupCode],
          },
        }).availableMethods
      ).not.toContain(VerificationType.BackupCode);
    });

    it('offers nothing to a social-only user', () => {
      expect(compute({ user: socialOnlyUser })).toEqual({
        availableMethods: [],
        isReachable: false,
        maskedIdentifiers: {},
      });
    });

    it('exposes only masked identifiers', () => {
      const { maskedIdentifiers } = compute();

      expect(maskedIdentifiers).toEqual({ email: '****@logto.io', phone: '****1111' });
      expect(JSON.stringify(maskedIdentifiers)).not.toContain(mockUser.primaryEmail);
      expect(JSON.stringify(maskedIdentifiers)).not.toContain(mockUser.primaryPhone);
    });
  });

  describe('reaching `mfa`', () => {
    it('exposes only the MFA subset on a password session with an enrolled TOTP', () => {
      const { availableMethods, isReachable } = compute({
        user: withTotp(passwordUser),
        selectedAcr: LogtoAcr.Mfa,
        carried: passwordSession,
      });

      expect(availableMethods).toEqual([
        VerificationType.TOTP,
        VerificationType.MfaPhoneVerificationCode,
        VerificationType.MfaEmailVerificationCode,
      ]);
      expect(isReachable).toBe(true);
    });

    it('exposes the `1fa` methods first on a social session, then the MFA subset', () => {
      const user = withTotp({ ...socialOnlyUser, primaryEmail: mockUser.primaryEmail });
      const before = compute({ user, selectedAcr: LogtoAcr.Mfa });

      expect(before.availableMethods).toEqual([VerificationType.EmailVerificationCode]);
      expect(before.isReachable).toBe(true);

      const after = compute({ user, selectedAcr: LogtoAcr.Mfa, proofs: [emailCodeProof] });

      // The email factor already supplies the `1fa` context, so its MFA code cannot pair with it.
      expect(after.availableMethods).toEqual([VerificationType.TOTP]);
    });

    it('finds nothing eligible for a user with no enrolled factor', () => {
      const totpOnly: Mfa = { policy: MfaPolicy.UserControlled, factors: [MfaFactor.TOTP] };

      // No method pairs into `mfa`; enrolling a factor is a later milestone's candidate.
      expect(
        compute({ mfaSettings: totpOnly, selectedAcr: LogtoAcr.Mfa, carried: passwordSession })
      ).toMatchObject({ availableMethods: [], isReachable: false });
      expect(
        compute({ mfaSettings: totpOnly, selectedAcr: LogtoAcr.Mfa, proofs: [passwordProof] })
      ).toMatchObject({ availableMethods: [], isReachable: false });
    });

    it('never lets the carried context satisfy the class alone', () => {
      // `prompt=login` on a satisfied session still asks for a fresh verification.
      const { availableMethods, isReachable } = compute({
        user: withTotp(passwordUser),
        selectedAcr: LogtoAcr.FirstFactor,
        carried: passwordSession,
      });

      expect(availableMethods).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
        VerificationType.TOTP,
        VerificationType.MfaPhoneVerificationCode,
        VerificationType.MfaEmailVerificationCode,
      ]);
      expect(isReachable).toBe(true);
    });

    it('finds nothing eligible for a user whose only method is one MFA factor', () => {
      const user = withTotp(socialOnlyUser);

      expect(compute({ user, selectedAcr: LogtoAcr.Mfa })).toEqual({
        availableMethods: [],
        isReachable: false,
        maskedIdentifiers: {},
      });
      // The same factor reaches `1fa` alone.
      expect(compute({ user, selectedAcr: LogtoAcr.FirstFactor })).toMatchObject({
        availableMethods: [VerificationType.TOTP],
        isReachable: true,
      });
    });

    it('cannot pair an MFA code with the primary code of the same identifier', () => {
      const user: User = { ...socialOnlyUser, primaryEmail: mockUser.primaryEmail };

      // Nothing pairs into `mfa`, so nothing is offered: no dead-end verification.
      expect(compute({ user, selectedAcr: LogtoAcr.Mfa })).toMatchObject({
        availableMethods: [],
        isReachable: false,
      });
      // A password session provides the other side of the pair.
      expect(compute({ user, selectedAcr: LogtoAcr.Mfa, carried: passwordSession })).toMatchObject({
        availableMethods: [VerificationType.MfaEmailVerificationCode],
        isReachable: true,
      });
      // A session whose `1fa` could only have come from that same email code does not: `otp`
      // carries no factor identity, so nothing is carried and the pair never forms.
      expect(
        compute({
          user,
          selectedAcr: LogtoAcr.Mfa,
          carried: deriveCarriedContributions([AuthenticationMethodReference.Otp]),
        })
      ).toMatchObject({
        availableMethods: [],
        isReachable: false,
      });
    });

    it('reaches `mfa` with a user-verified WebAuthn factor alone', () => {
      const user: User = {
        ...socialOnlyUser,
        mfaVerifications: [mockUserWebAuthnMfaVerification, mockUserTotpMfaVerification],
      };

      // TOTP needs a `1fa` context the social-only user cannot supply; WebAuthn does not.
      expect(compute({ user, selectedAcr: LogtoAcr.Mfa })).toMatchObject({
        availableMethods: [VerificationType.WebAuthn],
        isReachable: true,
      });
      expect(
        compute({ user: withTotp(passwordUser), selectedAcr: LogtoAcr.Mfa }).availableMethods
      ).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
      ]);
    });

    it('excludes the factor already verified in the `mfa` role from the `1fa` methods', () => {
      const user = withTotp(passwordUser);

      // An MFA email code verified first reaches only `1fa`; the primary email code of the same
      // mailbox cannot be the other side of the pair.
      expect(
        compute({ user, selectedAcr: LogtoAcr.Mfa, proofs: [mfaEmailCodeProof] }).availableMethods
      ).toEqual([VerificationType.Password, VerificationType.PhoneVerificationCode]);
      expect(
        compute({ user, selectedAcr: LogtoAcr.Mfa, proofs: [totpProof] }).availableMethods
      ).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
      ]);
    });

    it('carries nothing from a federated session', () => {
      expect(
        compute({
          user: withTotp(passwordUser),
          selectedAcr: LogtoAcr.Mfa,
          carried: deriveCarriedContributions([AuthenticationMethodReference.Federated]),
        }).availableMethods
      ).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
      ]);
    });

    it('offers only methods a submission would derive to the class', () => {
      // Eligibility is a search over the aggregator, so every offered method, once verified on
      // top of the carried context, reaches the class it was offered for.
      const user = withTotp(passwordUser);
      const { availableMethods } = compute({
        user,
        selectedAcr: LogtoAcr.Mfa,
        carried: passwordSession,
      });

      expect(availableMethods.length).toBeGreaterThan(0);

      for (const method of availableMethods) {
        const proof = {
          factor: getAuthenticationFactor(method),
          class: getAuthenticationFactorClass(method),
        };

        expect(acrSatisfies(achieveAcr([proof], passwordSession), LogtoAcr.Mfa)).toBe(true);
      }
    });
  });

  describe('context achieved in this interaction', () => {
    it('offers nothing once the selected class is reached', () => {
      expect(compute({ proofs: [passwordProof] }).availableMethods).toEqual([]);
      expect(compute({ proofs: [totpProof] }).availableMethods).toEqual([]);
      expect(
        compute({
          user: withTotp(passwordUser),
          selectedAcr: LogtoAcr.Mfa,
          proofs: [passwordProof, totpProof],
        }).availableMethods
      ).toEqual([]);
    });

    it('counts the proofs of this interaction toward reachability', () => {
      expect(compute({ proofs: [passwordProof] }).isReachable).toBe(true);
      expect(compute({ user: socialOnlyUser, proofs: [passwordProof] })).toMatchObject({
        availableMethods: [],
        isReachable: true,
      });
      expect(
        compute({ user: socialOnlyUser, selectedAcr: LogtoAcr.Mfa, proofs: [passwordProof] })
      ).toMatchObject({ availableMethods: [], isReachable: false });
    });
  });
});
