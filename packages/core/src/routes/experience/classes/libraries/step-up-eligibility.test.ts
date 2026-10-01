/* eslint-disable max-lines -- the eligibility table and the combination cases are one behaviour table; splitting them separates cases that have to be read against each other. */
import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  AuthenticationProofRole,
  LogtoAcr,
  MfaFactor,
  MfaPolicy,
  MissingProfile,
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
import {
  computeStepUpEligibility,
  type EstablishableMethod,
  type StepUpEligibilityInput,
} from './step-up-eligibility.js';

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
const withWebAuthn = (user: User): User => ({
  ...user,
  mfaVerifications: [...user.mfaVerifications, mockUserWebAuthnMfaVerification],
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

/** What verifying a method would contribute, the shape the eligibility search works in. */
const contributionOf = (method: VerificationType) => ({
  factor: getAuthenticationFactor(method),
  class: getAuthenticationFactorClass(method),
});

/** The context a password session carries in. */
const passwordSession = deriveCarriedContributions([AuthenticationMethodReference.Password]);
/** The context a phone-code session carries in; it collides with the phone MFA factor. */
const phoneSession = deriveCarriedContributions([AuthenticationMethodReference.Sms]);

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
    it('lists each factor once for a fully enrolled user requesting `1fa`', () => {
      const user: User = {
        ...withTotp(passwordUser),
        mfaVerifications: [
          mockUserTotpMfaVerification,
          mockUserWebAuthnMfaVerification,
          mockUserBackupCodeMfaVerification,
        ],
      };

      // A remaining-count tie of the same factor keeps the earlier candidate: for `1fa` the
      // primary code and the MFA code each finish on their own, so the 1fa-role variant is kept.
      expect(compute({ user }).availableMethods).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
        VerificationType.WebAuthn,
        VerificationType.TOTP,
        VerificationType.BackupCode,
      ]);
    });

    it('keeps the primary code over the MFA code of the same identifier for `1fa`', () => {
      expect(compute().availableMethods).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.PhoneVerificationCode,
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
      ]);
    });

    it('drops the code methods of an identifier whose connector is not configured', () => {
      const { availableMethods, maskedIdentifiers } = compute({
        connectors: { email: true, sms: false },
      });

      expect(availableMethods).toEqual([
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
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
        establishableMethods: [],
        enrollableFactors: [],
        subjectProofConnectors: [],
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
      ]);
      expect(isReachable).toBe(true);
    });

    it('finds nothing eligible for a user whose only method is one MFA factor', () => {
      const user = withTotp(socialOnlyUser);

      expect(compute({ user, selectedAcr: LogtoAcr.Mfa })).toEqual({
        availableMethods: [],
        isReachable: false,
        establishableMethods: [],
        enrollableFactors: [],
        subjectProofConnectors: [],
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

    it('offers the longer path behind a passkey that reaches `mfa` alone', () => {
      const user = withWebAuthn(withTotp(passwordUser));

      // The passkey reaches the class on its own and is offered first, but password + TOTP is a
      // longer path rather than no path, so its first step is offered too. Offering the passkey
      // alone made the step-up screen a dead end for a user whose passkey is on another device,
      // because the SPA forwards to a single method.
      expect(compute({ user, selectedAcr: LogtoAcr.Mfa })).toMatchObject({
        availableMethods: [
          VerificationType.WebAuthn,
          VerificationType.Password,
          VerificationType.EmailVerificationCode,
          VerificationType.PhoneVerificationCode,
        ],
        isReachable: true,
      });

      // Without a connector the password is the only fallback left behind the passkey.
      expect(
        compute({ user, selectedAcr: LogtoAcr.Mfa, connectors: noConnectors }).availableMethods
      ).toEqual([VerificationType.WebAuthn, VerificationType.Password]);

      // A session that fills the `1fa` role leaves no path needing a first-factor method, so none
      // is offered: a longer path is offered where it is a path, never as a repeat of the context.
      expect(
        compute({ user, selectedAcr: LogtoAcr.Mfa, carried: passwordSession }).availableMethods
      ).toEqual([
        VerificationType.WebAuthn,
        VerificationType.TOTP,
        VerificationType.MfaPhoneVerificationCode,
        VerificationType.MfaEmailVerificationCode,
      ]);
    });

    it('offers a way round an MFA factor the session collides with', () => {
      // The session's phone fills the `1fa` role, so the phone MFA code is the same factor and
      // cannot pair with it: only the email code finishes in one step. The password pairs with the
      // phone MFA code instead, so a user who cannot reach that mailbox is no longer forwarded
      // straight into the one method that fails them. The primary email code is not offered: it
      // asks for the same mailbox as the MFA email code and takes one more step, so anyone who
      // could complete it could have finished with the MFA code already.
      expect(
        compute({ selectedAcr: LogtoAcr.Mfa, carried: phoneSession }).availableMethods
      ).toEqual([
        VerificationType.MfaEmailVerificationCode,
        VerificationType.Password,
        VerificationType.MfaPhoneVerificationCode,
      ]);
    });

    it('never offers a method that leads to a dead end', () => {
      const user = withWebAuthn(withTotp(passwordUser));
      const { availableMethods } = compute({ user, selectedAcr: LogtoAcr.Mfa });

      expect(availableMethods.length).toBeGreaterThan(0);

      for (const method of availableMethods) {
        const proofs = [contributionOf(method)];

        // Every offered method either reaches the class by itself or leaves something else to pick.
        expect(
          acrSatisfies(achieveAcr(proofs), LogtoAcr.Mfa) ||
            compute({ user, selectedAcr: LogtoAcr.Mfa, proofs }).availableMethods.length > 0
        ).toBe(true);
      }
    });

    it('orders the `1fa` methods behind the ones that pair with an `mfa` proof', () => {
      const user = withTotp(passwordUser);

      // An MFA email code verified first reaches only `1fa`. The password and the phone code are a
      // different factor, so they pair with it and finish in one step. The primary email code of
      // the same mailbox cannot be the other side of that pair, but it can still fill the `1fa`
      // role next to the enrolled TOTP, so it is offered last rather than dropped. The flow does not
      // reach this state on its own: the `1fa`-first rule offers a first-factor method before any
      // MFA code to a user who has one.
      expect(
        compute({ user, selectedAcr: LogtoAcr.Mfa, proofs: [mfaEmailCodeProof] }).availableMethods
      ).toEqual([
        VerificationType.Password,
        VerificationType.PhoneVerificationCode,
        VerificationType.EmailVerificationCode,
      ]);
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

    it('offers methods that finish in one step when the session fills the other role', () => {
      // Eligibility is a search over the aggregator, so an offered method never leads somewhere a
      // submission would not derive. Here the carried `1fa` fills the other role, so every offered
      // method reaches the class on its own; where a longer path is offered, the guarantee is the
      // weaker one the dead-end test above pins.
      const user = withTotp(passwordUser);
      const { availableMethods } = compute({
        user,
        selectedAcr: LogtoAcr.Mfa,
        carried: passwordSession,
      });

      expect(availableMethods.length).toBeGreaterThan(0);

      for (const method of availableMethods) {
        expect(
          acrSatisfies(achieveAcr([contributionOf(method)], passwordSession), LogtoAcr.Mfa)
        ).toBe(true);
      }
    });
  });

  describe('establishing a first factor and enrolling a factor', () => {
    const github = { type: 'social' as const, connectorId: 'github' };
    const tenantEstablishableMethods: EstablishableMethod[] = [
      MissingProfile.password,
      MissingProfile.email,
    ];
    const tenantEnrollableFactors = [MfaFactor.TOTP, MfaFactor.WebAuthn];
    const federatedProof = proof(
      VerificationType.Social,
      AuthenticationFactor.Federated,
      undefined,
      [AuthenticationMethodReference.Federated]
    );
    const establishedPasswordProof: AuthenticationProof = {
      ...passwordProof,
      role: AuthenticationProofRole.Bind,
    };

    it('offers subject proof, then establishing, to a social-only user with a linked connector', () => {
      const before = compute({
        user: socialOnlyUser,
        tenantEstablishableMethods,
        linkedConnectors: [github],
      });

      // Creation succeeds: establishing under a subject proof the linked connector can provide
      // reaches the class.
      expect(before).toMatchObject({
        availableMethods: [],
        isReachable: true,
        establishableMethods: [],
        subjectProofConnectors: [github],
      });

      const after = compute({
        user: socialOnlyUser,
        proofs: [federatedProof],
        hasFreshSubjectProof: true,
        tenantEstablishableMethods,
        linkedConnectors: [github],
      });

      expect(after).toMatchObject({
        availableMethods: [],
        isReachable: true,
        establishableMethods: tenantEstablishableMethods,
        subjectProofConnectors: [],
      });
    });

    it('is unreachable when the tenant enables nothing establishable', () => {
      expect(compute({ user: socialOnlyUser, linkedConnectors: [github] })).toMatchObject({
        isReachable: false,
        subjectProofConnectors: [],
      });
    });

    it('is unreachable without a subject proof or a linked connector to provide one', () => {
      expect(compute({ user: socialOnlyUser, tenantEstablishableMethods })).toMatchObject({
        isReachable: false,
        establishableMethods: [],
        subjectProofConnectors: [],
      });
    });

    it('never offers establishing to a user with any verifiable method', () => {
      for (const user of [
        passwordUser,
        { ...socialOnlyUser, primaryEmail: mockUser.primaryEmail },
        withTotp(socialOnlyUser),
      ]) {
        expect(
          compute({
            user,
            hasFreshSubjectProof: true,
            tenantEstablishableMethods,
            linkedConnectors: [github],
          })
        ).toMatchObject({ establishableMethods: [], subjectProofConnectors: [] });
      }
    });

    it('stops offering establishing once a first factor is established', () => {
      expect(
        compute({
          user: socialOnlyUser,
          proofs: [federatedProof, establishedPasswordProof],
          hasFreshSubjectProof: true,
          hasFreshFirstFactor: true,
          tenantEstablishableMethods,
        })
      ).toMatchObject({ establishableMethods: [], isReachable: true });
    });

    /** A tenant that enables TOTP and WebAuthn, and no factor the user holds implicitly. */
    const enrollableMfaSettings: Mfa = {
      policy: MfaPolicy.UserControlled,
      factors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
    };

    it('offers enrolling only after a fresh first factor, on a password session included', () => {
      const input = {
        mfaSettings: enrollableMfaSettings,
        selectedAcr: LogtoAcr.Mfa,
        carried: passwordSession,
        tenantEnrollableFactors,
      };

      // The session's context never licenses enrolling, so a first factor is asked for first.
      expect(compute(input)).toMatchObject({
        availableMethods: [
          VerificationType.Password,
          VerificationType.EmailVerificationCode,
          VerificationType.PhoneVerificationCode,
        ],
        isReachable: true,
        enrollableFactors: [],
      });
      expect(
        compute({ ...input, proofs: [passwordProof], hasFreshFirstFactor: true })
      ).toMatchObject({
        availableMethods: [],
        isReachable: true,
        enrollableFactors: tenantEnrollableFactors,
      });
    });

    it('offers no enrolling to a user whose enrolled factor can reach the class', () => {
      expect(
        compute({
          user: withTotp(passwordUser),
          mfaSettings: enrollableMfaSettings,
          selectedAcr: LogtoAcr.Mfa,
          proofs: [passwordProof],
          hasFreshFirstFactor: true,
          tenantEnrollableFactors,
        })
      ).toMatchObject({ availableMethods: [VerificationType.TOTP], enrollableFactors: [] });
    });

    it('offers only the factors that pair with what is proven', () => {
      // After an email code, a TOTP pairs but a passkey reaches `mfa` alone as well; both help.
      expect(
        compute({
          user: { ...socialOnlyUser, primaryEmail: mockUser.primaryEmail },
          selectedAcr: LogtoAcr.Mfa,
          proofs: [emailCodeProof],
          hasFreshFirstFactor: true,
          tenantEnrollableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
        }).enrollableFactors
      ).toEqual([MfaFactor.TOTP, MfaFactor.WebAuthn]);
    });

    it('is unreachable for `mfa` when the tenant enables no enrollable factor', () => {
      expect(
        compute({
          mfaSettings: enrollableMfaSettings,
          selectedAcr: LogtoAcr.Mfa,
          carried: passwordSession,
          tenantEnrollableFactors: [],
        })
      ).toMatchObject({ isReachable: false, availableMethods: [] });
    });

    it('reaches `mfa` for a social-only user through establishing and then enrolling', () => {
      expect(
        compute({
          user: socialOnlyUser,
          selectedAcr: LogtoAcr.Mfa,
          tenantEstablishableMethods: [MissingProfile.password],
          tenantEnrollableFactors: [MfaFactor.TOTP],
          linkedConnectors: [github],
        })
      ).toMatchObject({ isReachable: true, subjectProofConnectors: [github] });
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
/* eslint-enable max-lines */
