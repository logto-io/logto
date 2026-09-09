/**
 * @file Eligible-method computation for step-up: which of the pinned user's already-enrolled
 * methods can still contribute to the selected ACR, and whether the user can reach it at all.
 *
 * Everything here is evaluated on read and never persisted, so a factor the user unbinds during
 * the interaction's lifetime disappears from the next read. The result reads only the user's
 * enrolled methods, the tenant's MFA settings, the message connectors, the session's `acr`, and
 * the proofs this interaction recorded; it never reads verification records directly.
 */
import {
  AuthenticationFactorClass,
  LogtoAcr,
  MfaFactor,
  VerificationType,
  acrSatisfies,
  getAuthenticationFactor,
  getAuthenticationFactorClass,
  type AuthenticationFactor,
  type AuthenticationProof,
  type MaskedIdentifiers,
  type Mfa,
  type User,
} from '@logto/schemas';
import { maskEmail, maskPhone } from '@logto/shared';

import { aggregateAuthenticationContext } from './authentication-context.js';
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
   * The `acr` of the OIDC session that pinned the subject. Only pure step-up passes it: a
   * Logto-verifiable `1fa` on the session skips the first-factor prompt for a user who has an MFA
   * factor to verify with, and contributes nothing else.
   */
  sessionAcr?: string;
  /** The proofs this interaction recorded so far. */
  proofs: readonly AuthenticationProof[];
};

export type StepUpEligibility = {
  /**
   * The methods that can still contribute to {@link StepUpEligibilityInput.selectedAcr} from where
   * the interaction stands; empty once the class is reached or when nothing helps.
   */
  availableMethods: VerificationType[];
  /**
   * Whether the user can reach the selected class with the methods they have, combined with the
   * session's `1fa` where it counts. Decided from the eligibility table alone, before any
   * verification, so creation can fast-fail instead of the UI.
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
 * email / phone code when the identifier is set and its connector is configured. Each reaches
 * `urn:logto:acr:1fa` alone and fills the `1fa` side of an `urn:logto:acr:mfa` pair.
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
 * availability, so the connector gate for the code-based factors is added here. Each reaches
 * `urn:logto:acr:1fa` alone; WebAuthn (user verification required) reaches `urn:logto:acr:mfa`
 * alone.
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

const isSelfSufficient = (method: VerificationType) =>
  getAuthenticationFactorClass(method) === AuthenticationFactorClass.Both;

/**
 * Whether the methods can reach the selected class, by the combination rule: any method reaches
 * `urn:logto:acr:1fa`; `urn:logto:acr:mfa` needs a self-sufficient method, or an `mfa`-role
 * method paired with a Logto-verifiable `1fa` context of a different factor, which the session
 * provides when it satisfies `1fa` and a `1fa`-role method provides otherwise. A user whose only
 * Logto-verifiable method is one MFA factor therefore reaches `1fa` but never `mfa`.
 */
const canReach = (
  selectedAcr: LogtoAcr,
  firstFactorMethods: VerificationType[],
  mfaMethods: VerificationType[],
  hasSessionFirstFactor: boolean
): boolean => {
  if (selectedAcr === LogtoAcr.FirstFactor) {
    return firstFactorMethods.length + mfaMethods.length > 0;
  }

  return mfaMethods.some(
    (mfaMethod) =>
      isSelfSufficient(mfaMethod) ||
      hasSessionFirstFactor ||
      firstFactorMethods.some(
        (firstFactorMethod) =>
          getAuthenticationFactor(firstFactorMethod) !== getAuthenticationFactor(mfaMethod)
      )
  );
};

const factorsOf = (
  proofs: readonly AuthenticationProof[],
  predicate: (factorClass?: AuthenticationFactorClass) => boolean
): ReadonlySet<AuthenticationFactor> =>
  new Set(
    proofs.filter(({ class: factorClass }) => predicate(factorClass)).map(({ factor }) => factor)
  );

const excludeFactors = (
  methods: VerificationType[],
  factors: ReadonlySet<AuthenticationFactor>
): VerificationType[] => methods.filter((method) => !factors.has(getAuthenticationFactor(method)));

/**
 * The next eligible methods for the selected class.
 *
 * - Nothing once the context achieved in this interaction already satisfies the class.
 * - For `urn:logto:acr:1fa`, every method of the table.
 * - For `urn:logto:acr:mfa`, the MFA subset when the user has an enrolled factor and a
 *   Logto-verifiable `1fa` context exists, from the session or from this interaction, minus the
 *   factor whose record already supplies that context (a single factor never fills both roles).
 *   Otherwise the `1fa`-role methods, plus any self-sufficient method (WebAuthn): a social / SSO
 *   session must establish `1fa` before an MFA factor counts, and a user with no enrolled factor
 *   must complete a fresh `1fa` verification before enrollment is offered; the session's `1fa`
 *   never skips that fresh verification.
 */
const getAvailableMethods = ({
  selectedAcr,
  firstFactorMethods,
  mfaMethods,
  hasSessionFirstFactor,
  proofs,
}: {
  selectedAcr: LogtoAcr;
  firstFactorMethods: VerificationType[];
  mfaMethods: VerificationType[];
  hasSessionFirstFactor: boolean;
  proofs: readonly AuthenticationProof[];
}): VerificationType[] => {
  const { acr: achievedAcr } = aggregateAuthenticationContext(proofs);

  if (acrSatisfies(achievedAcr, selectedAcr)) {
    return [];
  }

  if (selectedAcr === LogtoAcr.FirstFactor) {
    return [...firstFactorMethods, ...mfaMethods];
  }

  const provenFirstFactors = factorsOf(
    proofs,
    (factorClass) =>
      factorClass === AuthenticationFactorClass.FirstFactor ||
      factorClass === AuthenticationFactorClass.Both
  );
  const provenFactors = factorsOf(proofs, (factorClass) => factorClass !== undefined);

  if (mfaMethods.length === 0) {
    // A fresh first factor is the precondition for enrolling a factor; once verified, only
    // enrollment can move the interaction forward.
    return provenFirstFactors.size > 0 ? [] : firstFactorMethods;
  }

  if (hasSessionFirstFactor || provenFirstFactors.size > 0) {
    return excludeFactors(mfaMethods, provenFirstFactors);
  }

  // A self-sufficient method reaches `mfa` alone, so it is offered alongside the `1fa` methods.
  return [
    ...excludeFactors(firstFactorMethods, provenFactors),
    ...mfaMethods.filter((method) => isSelfSufficient(method)),
  ];
};

/**
 * Compute the step-up eligibility of the pinned user for the selected class; see the file
 * overview and the eligibility table of the Experience step-up flow design.
 */
export const computeStepUpEligibility = ({
  user,
  mfaSettings,
  connectors,
  selectedAcr,
  sessionAcr,
  proofs,
}: StepUpEligibilityInput): StepUpEligibility => {
  const firstFactorMethods = getFirstFactorMethods(user, connectors);
  const mfaMethods = getMfaMethods(user, mfaSettings, connectors);
  const hasSessionFirstFactor = acrSatisfies(sessionAcr, LogtoAcr.FirstFactor);
  const { primaryEmail, primaryPhone } = user;

  return {
    availableMethods: getAvailableMethods({
      selectedAcr,
      firstFactorMethods,
      mfaMethods,
      hasSessionFirstFactor,
      proofs,
    }),
    isReachable: canReach(selectedAcr, firstFactorMethods, mfaMethods, hasSessionFirstFactor),
    // Only identifiers a code method can be sent to are hinted, and only in masked form.
    maskedIdentifiers: {
      ...(primaryEmail && connectors.email ? { email: maskEmail(primaryEmail) } : {}),
      ...(primaryPhone && connectors.sms ? { phone: maskPhone(primaryPhone) } : {}),
    },
  };
};
