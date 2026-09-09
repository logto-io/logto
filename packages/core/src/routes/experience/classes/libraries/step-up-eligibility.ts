/**
 * @file Eligible-method computation for step-up: which of the subject's already-enrolled methods
 * can still contribute to the selected ACR, and whether the subject can reach it at all.
 *
 * Everything here is evaluated on read and never persisted, so a factor the user unbinds during
 * the interaction's lifetime disappears from the next read. Reachability is not restated here: it
 * is a bounded search over `achieveAcr`, the one definition of what a set of contributions
 * reaches, so the methods offered can never disagree with what a submission derives. The
 * candidates are the subject's enrolled methods; later milestones add enrollable factors and
 * establishable first factors as further candidate contributions.
 */
import {
  AuthenticationFactorClass,
  LogtoAcr,
  MfaFactor,
  VerificationType,
  acrSatisfies,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  type MaskedIdentifiers,
  type Mfa,
  type User,
} from '@logto/schemas';
import { maskEmail, maskPhone } from '@logto/shared';

import { achieveAcr, type AuthenticationContribution } from './authentication-context.js';
import { MfaValidator } from './mfa-validator.js';

/** Whether an email / SMS connector is configured; gates every code-based method. */
type MessageConnectorAvailability = {
  email: boolean;
  sms: boolean;
};

export type StepUpEligibilityInput = {
  user: User;
  mfaSettings: Mfa;
  connectors: MessageConnectorAvailability;
  /** The minimum class the interaction must reach. */
  selectedAcr: LogtoAcr;
  /**
   * The context the OIDC session carries in, derived from its `amr`; see
   * `deriveCarriedContributions`. Only pure step-up carries anything. It pairs with a proof of
   * this interaction and never satisfies the class alone.
   */
  carried: readonly AuthenticationContribution[];
  /** The proofs this interaction recorded so far. */
  proofs: readonly AuthenticationContribution[];
};

export type StepUpEligibility = {
  /**
   * The methods that make progress toward {@link StepUpEligibilityInput.selectedAcr} from where the
   * interaction stands: the next step of a shortest path to the class. Empty once the class is
   * reached or when nothing helps.
   */
  availableMethods: VerificationType[];
  /**
   * Whether the subject can reach the selected class with the methods they have, combined with
   * the carried context where it pairs. Decided before any verification, so creation can
   * fast-fail instead of the UI.
   */
  isReachable: boolean;
  maskedIdentifiers: MaskedIdentifiers;
};

const mfaFactorToVerificationType = Object.freeze({
  [MfaFactor.TOTP]: VerificationType.TOTP,
  [MfaFactor.WebAuthn]: VerificationType.WebAuthn,
  [MfaFactor.BackupCode]: VerificationType.BackupCode,
  [MfaFactor.EmailVerificationCode]: VerificationType.MfaEmailVerificationCode,
  [MfaFactor.PhoneVerificationCode]: VerificationType.MfaPhoneVerificationCode,
}) satisfies Record<MfaFactor, VerificationType>;

/**
 * The `1fa`-role methods of the eligibility table: password when the user has one, the primary
 * email / phone code when the identifier is set and its connector is configured.
 */
const getFirstFactorMethods = (
  { passwordEncrypted, primaryEmail, primaryPhone }: User,
  connectors: MessageConnectorAvailability
): VerificationType[] => [
  ...(passwordEncrypted ? [VerificationType.Password] : []),
  ...(primaryEmail && connectors.email ? [VerificationType.EmailVerificationCode] : []),
  ...(primaryPhone && connectors.sms ? [VerificationType.PhoneVerificationCode] : []),
];

/**
 * The `mfa`-role methods: the user's enrolled factors that the tenant enables, reusing
 * `MfaValidator.availableUserMfaVerificationTypes` (which already drops exhausted backup codes
 * and orders WebAuthn first and backup code last). `MfaValidator` does not check connector
 * availability, so the connector gate for the code-based factors is added here.
 */
const getMfaMethods = (
  user: User,
  mfaSettings: Mfa,
  connectors: MessageConnectorAvailability
): VerificationType[] =>
  new MfaValidator(mfaSettings, user).availableUserMfaVerificationTypes
    .filter((factor) => {
      switch (factor) {
        case MfaFactor.EmailVerificationCode: {
          return connectors.email;
        }
        case MfaFactor.PhoneVerificationCode: {
          return connectors.sms;
        }
        default: {
          return true;
        }
      }
    })
    .map((factor) => mfaFactorToVerificationType[factor]);

/** What verifying a method would contribute; the same shape a recorded proof takes. */
const toContribution = (method: VerificationType): AuthenticationContribution => ({
  factor: getAuthenticationFactor(method),
  class: getAuthenticationFactorClass(method),
});

const fillsFirstFactorRole = ({ class: factorClass }: AuthenticationContribution) =>
  factorClass === AuthenticationFactorClass.FirstFactor ||
  factorClass === AuthenticationFactorClass.Both;

/** A class is reached with at most two verifications: a `1fa`-role one and an `mfa`-role one. */
const maxSteps = 2;

/**
 * The number of further verifications needed to reach the target from the current proofs, on
 * top of the carried context: `0` when reached, `Infinity` when no combination of the remaining
 * candidates reaches it.
 */
const distanceTo = (
  {
    target,
    carried,
    proofs,
    candidates,
  }: {
    target: LogtoAcr;
    carried: readonly AuthenticationContribution[];
    proofs: readonly AuthenticationContribution[];
    candidates: readonly VerificationType[];
  },
  steps = maxSteps
): number => {
  if (acrSatisfies(achieveAcr(proofs, carried), target)) {
    return 0;
  }

  if (steps === 0) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...candidates.map(
      (candidate, index) =>
        1 +
        distanceTo(
          {
            target,
            carried,
            proofs: [...proofs, toContribution(candidate)],
            candidates: candidates.filter((_, otherIndex) => otherIndex !== index),
          },
          steps - 1
        )
    ),
    Number.POSITIVE_INFINITY
  );
};

/**
 * Compute the step-up eligibility of the subject for the selected class; see the file overview
 * and the eligibility table of the Experience step-up flow design.
 *
 * `availableMethods` is the next step of a shortest path to the class, so a password session with
 * an enrolled TOTP requesting `mfa` is offered the TOTP only. When the class is `mfa` and no
 * Logto-verifiable `1fa` context exists yet, in the carried context or in this interaction, the
 * `1fa`-role methods are offered before the `mfa`-role ones: a social / SSO session establishes
 * `1fa` before an MFA factor counts. The carried context never satisfies the class alone, so a
 * forced step-up (`prompt=login`) always asks for a fresh verification.
 */
export const computeStepUpEligibility = ({
  user,
  mfaSettings,
  connectors,
  selectedAcr,
  carried,
  proofs,
}: StepUpEligibilityInput): StepUpEligibility => {
  const candidates = [
    ...getFirstFactorMethods(user, connectors),
    ...getMfaMethods(user, mfaSettings, connectors),
  ];
  const distance = distanceTo({ target: selectedAcr, carried, proofs, candidates });
  const nextSteps = Number.isFinite(distance)
    ? candidates.filter(
        (candidate, index) =>
          distanceTo({
            target: selectedAcr,
            carried,
            proofs: [...proofs, toContribution(candidate)],
            candidates: candidates.filter((_, otherIndex) => otherIndex !== index),
          }) ===
          distance - 1
      )
    : [];
  const hasFirstFactorContext = [...carried, ...proofs].some((contribution) =>
    fillsFirstFactorRole(contribution)
  );
  const firstFactorSteps = nextSteps.filter((method) =>
    fillsFirstFactorRole(toContribution(method))
  );
  const { primaryEmail, primaryPhone } = user;

  return {
    availableMethods:
      selectedAcr === LogtoAcr.Mfa && !hasFirstFactorContext && firstFactorSteps.length > 0
        ? firstFactorSteps
        : nextSteps,
    isReachable: Number.isFinite(distance),
    // Only identifiers a code method can be sent to are hinted, and only in masked form.
    maskedIdentifiers: {
      ...(primaryEmail && connectors.email ? { email: maskEmail(primaryEmail) } : {}),
      ...(primaryPhone && connectors.sms ? { phone: maskPhone(primaryPhone) } : {}),
    },
  };
};
