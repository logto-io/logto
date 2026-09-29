/* eslint-disable max-lines -- the eligibility search and the enrollment preconditions it counts are one decision; splitting them separates rules that have to be read against each other */
/**
 * @file Eligible-method computation for step-up: which of the subject's already-enrolled methods
 * can still contribute to the selected ACR, and whether the subject can reach it at all.
 *
 * Everything here is evaluated on read and never persisted, so a factor the user unbinds during
 * the interaction's lifetime disappears from the next read. Neither reachability nor eligibility is
 * restated here: both are bounded searches over `achieveAcr`, the one definition of what a set of
 * contributions reaches, so the methods offered can never disagree with what a submission derives.
 * The candidates are the subject's enrolled methods. Establishable first factors and enrollable
 * factors stay behind their own preconditions and in their own lists: they are never offered as a
 * peer of verifying a method the user already has, and only `isReachable` counts them.
 */
import {
  AuthenticationFactorClass,
  LogtoAcr,
  MfaFactor,
  MissingProfile,
  VerificationType,
  acrSatisfies,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  type MaskedIdentifiers,
  type Mfa,
  type SubjectProofConnector,
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
  /**
   * Whether the interaction holds a fresh subject proof: a Logto-verifiable verification, or an
   * upstream social / SSO authentication that resolved to the subject. Never the session alone.
   */
  hasFreshSubjectProof?: boolean;
  /**
   * Whether the interaction proved or established a Logto-verifiable first factor. Never the
   * session alone, and never an `mfa`-class proof.
   */
  hasFreshFirstFactor?: boolean;
  /**
   * The first factors the tenant lets a user establish: password when the sign-in experience
   * enables password, email / phone when that identifier is enabled and its connector configured.
   */
  tenantEstablishableMethods?: readonly EstablishableMethod[];
  /** The MFA factors the tenant lets a user enroll. */
  tenantEnrollableFactors?: readonly MfaFactor[];
  /** The subject's linked social / SSO connectors that could serve as subject proof. */
  linkedConnectors?: readonly SubjectProofConnector[];
};

/** The first factors a user without any eligible method may establish. */
export type EstablishableMethod =
  | MissingProfile.password
  | MissingProfile.email
  | MissingProfile.phone;

/** The verification an established first factor is recorded as. */
const establishableMethodToVerificationType = Object.freeze({
  [MissingProfile.password]: VerificationType.Password,
  [MissingProfile.email]: VerificationType.EmailVerificationCode,
  [MissingProfile.phone]: VerificationType.PhoneVerificationCode,
}) satisfies Record<EstablishableMethod, VerificationType>;

export type StepUpEligibility = {
  /**
   * The methods that can still contribute to {@link StepUpEligibilityInput.selectedAcr} from where
   * the interaction stands: every method that some path to the class needs and no other offered
   * method of the same factor beats, shortest path first. Empty once the class is reached or when
   * nothing helps.
   */
  availableMethods: VerificationType[];
  /**
   * Whether the subject can reach the selected class with the methods they have, combined with
   * the carried context where it pairs, or by establishing a first factor and enrolling a factor
   * under the preconditions below (establishing counts only when a subject proof is held or a
   * linked connector can provide one). Decided before any verification, so creation can
   * fast-fail instead of the UI.
   */
  isReachable: boolean;
  /**
   * The first factors the user may establish: non-empty only under a fresh subject proof, when the
   * user has no eligible method at all and the class is not reached yet.
   */
  establishableMethods: EstablishableMethod[];
  /**
   * The factors the user may enroll: non-empty only after a fresh first factor, when no enrolled
   * factor can reach the class. Limited to the factors that reach it on top of what is proven.
   */
  enrollableFactors: MfaFactor[];
  /**
   * The linked connectors that can provide the subject proof establishing needs: non-empty only
   * while no subject proof exists and establishing a method can reach the class.
   */
  subjectProofConnectors: SubjectProofConnector[];
  maskedIdentifiers: MaskedIdentifiers;
};

export const mfaFactorToVerificationType = Object.freeze({
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

/**
 * Every method the user can verify with, in the eligibility-table order: the `1fa`-role methods,
 * then the enrolled MFA factors the tenant enables.
 */
export const getEligibleMethods = (
  user: User,
  mfaSettings: Mfa,
  connectors: MessageConnectorAvailability
): VerificationType[] => [
  ...getFirstFactorMethods(user, connectors),
  ...getMfaMethods(user, mfaSettings, connectors),
];

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
 * Whether the candidate lies on a path to the target on which it is not redundant: some completion
 * drawn from the remaining candidates reaches the class with it and falls short without it.
 *
 * This is what "can still contribute" means, and it is the reason a method is offered. A candidate
 * every path reaches the class without is never offered, so a role the carried context already
 * fills is not asked for again: on a password session the password completes nothing the session
 * does not already supply, while an MFA factor does. A candidate only a longer path needs is still
 * offered, so a `both`-class passkey no longer hides the two-step password + TOTP path behind
 * itself and leaves a user whose passkey is on another device with nothing to pick.
 */
const contributesTo = (
  {
    target,
    carried,
    proofs,
    candidate,
    others,
  }: {
    target: LogtoAcr;
    carried: readonly AuthenticationContribution[];
    proofs: readonly AuthenticationContribution[];
    candidate: VerificationType;
    others: readonly VerificationType[];
  },
  steps = maxSteps - 1
): boolean => {
  if (
    acrSatisfies(achieveAcr([...proofs, toContribution(candidate)], carried), target) &&
    !acrSatisfies(achieveAcr(proofs, carried), target)
  ) {
    return true;
  }

  if (steps === 0) {
    return false;
  }

  return others.some((other, index) =>
    contributesTo(
      {
        target,
        carried,
        proofs: [...proofs, toContribution(other)],
        candidate,
        others: others.filter((_, otherIndex) => otherIndex !== index),
      },
      steps - 1
    )
  );
};

/** The factors that reach the class once enrolled on top of what is proven. */
const filterFactorsReaching = (
  factors: readonly MfaFactor[],
  {
    selectedAcr,
    carried,
    proofs,
  }: Pick<StepUpEligibilityInput, 'selectedAcr' | 'carried' | 'proofs'>
) =>
  factors.filter((factor) =>
    acrSatisfies(
      achieveAcr([...proofs, toContribution(mfaFactorToVerificationType[factor])], carried),
      selectedAcr
    )
  );

/** Whether establishing and enrolling what is on offer reaches the class. */
const isReachableByEnrollment = ({
  selectedAcr,
  carried,
  proofs,
  candidates,
  established,
  enrollable,
  canProveFirstFactor,
}: Pick<StepUpEligibilityInput, 'selectedAcr' | 'carried' | 'proofs'> & {
  candidates: readonly VerificationType[];
  established: readonly EstablishableMethod[];
  enrollable: readonly MfaFactor[];
  canProveFirstFactor: boolean;
}) =>
  Number.isFinite(
    distanceTo({
      target: selectedAcr,
      carried,
      proofs,
      candidates: [
        ...candidates,
        ...established.map((method) => establishableMethodToVerificationType[method]),
        ...(canProveFirstFactor ||
        candidates.some((candidate) => fillsFirstFactorRole(toContribution(candidate)))
          ? enrollable.map((factor) => mfaFactorToVerificationType[factor])
          : []),
      ],
    })
  );

/**
 * What establishing a first factor and enrolling a factor add to the eligibility: the lists they
 * are offered in, and whether they make the class reachable. They are never folded into the
 * candidates `availableMethods` is drawn from, because establishing or enrolling is never an
 * alternative to verifying a method the user already has; only reachability counts them.
 */
// eslint-disable-next-line complexity -- each list is one precondition of the design, read side by side
const computeEnrollment = ({
  candidates,
  isReachableWithEnrolled,
  selectedAcr,
  carried,
  proofs,
  hasFreshSubjectProof,
  hasFreshFirstFactor,
  tenantEstablishableMethods,
  tenantEnrollableFactors,
  linkedConnectors,
}: Required<Omit<StepUpEligibilityInput, 'user' | 'mfaSettings' | 'connectors'>> & {
  candidates: readonly VerificationType[];
  isReachableWithEnrolled: boolean;
}) => {
  // Establishing is only possible for a user with no eligible method at all, and only under a
  // subject proof held or obtainable. Once a first factor is proven or established there is
  // nothing left to establish.
  const establishable =
    candidates.length > 0 || hasFreshFirstFactor ? [] : [...tenantEstablishableMethods];
  const canEstablish =
    establishable.length > 0 && (hasFreshSubjectProof || linkedConnectors.length > 0);
  const isReachable =
    isReachableWithEnrolled ||
    isReachableByEnrollment({
      selectedAcr,
      carried,
      proofs,
      candidates,
      established: canEstablish ? establishable : [],
      enrollable: tenantEnrollableFactors,
      // Enrolling needs a fresh first factor, so it only counts when one is proven, or can be:
      // by verifying an eligible first-factor method or by establishing one.
      canProveFirstFactor: hasFreshFirstFactor || canEstablish,
    });

  return {
    isReachable,
    establishableMethods: hasFreshSubjectProof ? establishable : [],
    // None while an enrolled factor can still reach the class.
    enrollableFactors:
      hasFreshFirstFactor && !isReachableWithEnrolled
        ? filterFactorsReaching(tenantEnrollableFactors, { selectedAcr, carried, proofs })
        : [],
    subjectProofConnectors:
      !hasFreshSubjectProof && canEstablish && isReachable ? [...linkedConnectors] : [],
    // A user whose enrolled methods cannot reach the class but who may enroll a factor after a
    // fresh first factor is offered their first-factor methods first: enrolling is only offered
    // once one of them is verified in this interaction.
    firstFactorBeforeEnrollment:
      isReachable && !isReachableWithEnrolled && !hasFreshFirstFactor
        ? candidates.filter((candidate) => fillsFirstFactorRole(toContribution(candidate)))
        : [],
  };
};

/**
 * Compute the step-up eligibility of the subject for the selected class; see the file overview
 * and the eligibility table of the Experience step-up flow design.
 *
 * `availableMethods` is every method that can still contribute (see {@link contributesTo}) and that
 * no other offered method of the same factor beats, ordered by how many verifications remain after
 * it. So a password session with an enrolled TOTP requesting `mfa` is still offered the MFA subset
 * only, while a user whose passkey reaches `mfa` alone is offered the passkey first and the
 * password + TOTP path behind it. When the class is `mfa` and no
 * Logto-verifiable `1fa` context exists yet, in the carried context or in this interaction, the
 * `1fa`-role methods are offered before the `mfa`-role ones: a social / SSO session establishes
 * `1fa` before an MFA factor counts. The carried context never satisfies the class alone, so a
 * forced step-up (`prompt=login`) always asks for a fresh verification.
 */
export const computeStepUpEligibility = ({
  user,
  mfaSettings,
  connectors,
  ...input
}: StepUpEligibilityInput): StepUpEligibility => {
  const { selectedAcr, carried, proofs } = input;
  const candidates = getEligibleMethods(user, mfaSettings, connectors);
  const distance = distanceTo({ target: selectedAcr, carried, proofs, candidates });
  const remainingCandidates = (index: number) =>
    candidates.filter((_, otherIndex) => otherIndex !== index);
  // No finiteness guard is needed: reaching the class is what makes a candidate contribute, so an
  // unreachable class leaves every candidate out on its own.
  const contributing = candidates.flatMap((candidate, index) =>
    contributesTo({
      target: selectedAcr,
      carried,
      proofs,
      candidate,
      others: remainingCandidates(index),
    })
      ? [
          {
            candidate,
            factor: getAuthenticationFactor(candidate),
            remaining: distanceTo({
              target: selectedAcr,
              carried,
              proofs: [...proofs, toContribution(candidate)],
              candidates: remainingCandidates(index),
            }),
          },
        ]
      : []
  );
  const nextSteps = contributing
    // Drop a method that another offered method of the same factor beats. Both ask the user for the
    // same credential or channel, so a second method of that factor adds nothing they could act on:
    // a strictly shorter one gets to the class first, and a remaining-count tie is the same action
    // finishing on its own (the primary code and the MFA code of one identifier for `1fa`). The
    // first candidate in the eligibility table wins a tie, so the 1fa-role variant is kept.
    .filter(
      ({ factor, remaining }, index) =>
        !contributing.some(
          (other, otherIndex) =>
            other.factor === factor &&
            (other.remaining < remaining || (other.remaining === remaining && otherIndex < index))
        )
    )
    // Shortest path first; the sort is stable, so methods that leave the same number of steps keep
    // the order of the eligibility table.
    .toSorted((left, right) => left.remaining - right.remaining)
    .map(({ candidate }) => candidate);
  const hasFirstFactorContext = [...carried, ...proofs].some((contribution) =>
    fillsFirstFactorRole(contribution)
  );
  const firstFactorSteps = nextSteps.filter((method) =>
    fillsFirstFactorRole(toContribution(method))
  );
  const { primaryEmail, primaryPhone } = user;

  const enrollment = computeEnrollment({
    // Nothing is established or enrolled unless the caller says what the interaction holds.
    hasFreshSubjectProof: false,
    hasFreshFirstFactor: false,
    tenantEstablishableMethods: [],
    tenantEnrollableFactors: [],
    linkedConnectors: [],
    ...input,
    candidates,
    isReachableWithEnrolled: Number.isFinite(distance),
  });
  const { isReachable, firstFactorBeforeEnrollment } = enrollment;

  return {
    availableMethods:
      firstFactorBeforeEnrollment.length > 0
        ? firstFactorBeforeEnrollment
        : selectedAcr === LogtoAcr.Mfa && !hasFirstFactorContext && firstFactorSteps.length > 0
          ? firstFactorSteps
          : nextSteps,
    isReachable,
    establishableMethods: enrollment.establishableMethods,
    enrollableFactors: enrollment.enrollableFactors,
    subjectProofConnectors: enrollment.subjectProofConnectors,
    // Only identifiers a code method can be sent to are hinted, and only in masked form.
    maskedIdentifiers: {
      ...(primaryEmail && connectors.email ? { email: maskEmail(primaryEmail) } : {}),
      ...(primaryPhone && connectors.sms ? { phone: maskPhone(primaryPhone) } : {}),
    },
  };
};
/* eslint-enable max-lines */
