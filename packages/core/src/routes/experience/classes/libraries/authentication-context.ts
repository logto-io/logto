import {
  AuthenticationFactor,
  AuthenticationFactorClass,
  AuthenticationMethodReference,
  LogtoAcr,
  buildAuthenticationMethodReferences,
  type AuthenticationProof,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

/** The authentication context an interaction achieved, in the shape of the provider's `login` result. */
type AuthenticationContext = {
  acr?: LogtoAcr;
  amr?: AuthenticationMethodReference[];
};

/**
 * What a credential contributes to the ACR: the factor it is a proof of and the role that factor
 * can fill. A recorded {@link AuthenticationProof} is a contribution with an id, a role, and the
 * AMR values it carries; a candidate method and the context carried by the OIDC session are
 * contributions too, so eligibility and aggregation read one shape. `amr` is not part of it:
 * only the proofs of this interaction contribute to `amr`.
 */
export type AuthenticationContribution = Pick<AuthenticationProof, 'factor' | 'class'>;

/** The distinct factors of the contributions whose class fills the given role. */
const factorsOfRole = (
  contributions: readonly AuthenticationContribution[],
  role: AuthenticationFactorClass.FirstFactor | AuthenticationFactorClass.Mfa
) =>
  new Set(
    contributions
      .filter(({ class: factorClass }) =>
        factorClass ? [role, AuthenticationFactorClass.Both].includes(factorClass) : false
      )
      .map(({ factor }) => factor)
  );

/** The ACR a set of contributions reaches by the combination rule, if any. */
const reachAcr = (contributions: readonly AuthenticationContribution[]): LogtoAcr | undefined => {
  const firstFactors = factorsOfRole(contributions, AuthenticationFactorClass.FirstFactor);
  const mfaFactors = factorsOfRole(contributions, AuthenticationFactorClass.Mfa);
  const hasDistinctPair = [...mfaFactors].some((factor) =>
    [...firstFactors].some((firstFactor) => firstFactor !== factor)
  );
  const hasSelfSufficient = contributions.some(
    ({ class: factorClass }) => factorClass === AuthenticationFactorClass.Both
  );

  if (hasDistinctPair || hasSelfSufficient) {
    return LogtoAcr.Mfa;
  }

  return conditional((firstFactors.size > 0 || mfaFactors.size > 0) && LogtoAcr.FirstFactor);
};

/**
 * The ACR the proofs of this interaction achieve on top of the carried context, if any. The one
 * definition of "what a set of contributions reaches", read by the aggregation below and by the
 * step-up eligibility search, so the methods offered can never disagree with what a submission
 * derives.
 */
export const achieveAcr = (
  proofs: readonly AuthenticationContribution[],
  carried: readonly AuthenticationContribution[] = []
): LogtoAcr | undefined => conditional(proofs.length > 0 && reachAcr([...carried, ...proofs]));

/**
 * Aggregate the authentication context an interaction achieved from the proofs it recorded, on
 * top of the context carried by the OIDC session. The aggregation reads nothing but these lists:
 * which credentials count was decided at the touchpoints that recorded them (see
 * `AuthenticationProofs`), and the role of a proof plays no part here.
 *
 * - A `1fa`-class proof reaches `urn:logto:acr:1fa`; an `mfa`-class proof alone also reaches only
 *   `urn:logto:acr:1fa`.
 * - A `1fa`-class proof plus an `mfa`-class proof of a different factor, or a `both`-class proof
 *   (a user-verified WebAuthn authenticator) alone, reaches `urn:logto:acr:mfa`. Repeated proofs
 *   of one factor count once, so a one-time token plus an MFA email code stays at
 *   `urn:logto:acr:1fa`.
 * - The carried context (see {@link deriveCarriedContributions}) fills the other side of the pair
 *   for a proof of this interaction: a TOTP proof on a password session reaches
 *   `urn:logto:acr:mfa`. It never achieves anything alone, so an interaction without a proof
 *   seeds nothing, and it contributes nothing to `amr`: `amr` describes only this interaction.
 * - Federated proofs carry no class: they contribute `fed` to `amr` and nothing to the ACR.
 * - `amr` is the union of the proofs' references in first-seen order with `mfa` last.
 * - No `ts` is seeded: the provider stamps `auth_time` with the submission time itself.
 */
export const aggregateAuthenticationContext = (
  proofs: ReadonlyArray<Pick<AuthenticationProof, 'factor' | 'class' | 'amr'>>,
  carried: readonly AuthenticationContribution[] = []
): AuthenticationContext => {
  const acr = achieveAcr(proofs, carried);
  const amr = buildAuthenticationMethodReferences(
    proofs.map(({ amr }) => amr),
    acr
  );

  return {
    ...conditional(acr && { acr }),
    ...conditional(amr.length > 0 && { amr }),
  };
};

/**
 * Derive the context an OIDC session carries into a pure step-up from the session's `amr`, as
 * contributions of the same shape as the proofs, so "the context so far" has one definition for
 * eligibility and aggregation. The session's `acr` is not read: the combination rule needs the
 * factor, which only `amr` identifies.
 *
 * | `amr`          | contribution                                                    |
 * |----------------|-----------------------------------------------------------------|
 * | `pwd`          | password, `1fa`-class                                           |
 * | `sms`          | phone, `1fa`-class                                              |
 * | `pop` + `user` | WebAuthn, `both`-class                                          |
 * | `fed`          | federated, no class (contributes nothing to the ACR)            |
 * | `otp`          | ambiguous (email, TOTP, or backup code): nothing; a fresh `1fa` |
 * |                | verification is required                                        |
 *
 * The `mfa` marker is a summary of the others and adds nothing. The result only ever pairs with a
 * proof of this interaction; see {@link aggregateAuthenticationContext}.
 */
export const deriveCarriedContributions = (
  amr: readonly string[] = []
): AuthenticationContribution[] => {
  const references = new Set(amr);

  return [
    ...(references.has(AuthenticationMethodReference.Password)
      ? [{ factor: AuthenticationFactor.Password, class: AuthenticationFactorClass.FirstFactor }]
      : []),
    ...(references.has(AuthenticationMethodReference.Sms)
      ? [{ factor: AuthenticationFactor.Phone, class: AuthenticationFactorClass.FirstFactor }]
      : []),
    ...(references.has(AuthenticationMethodReference.ProofOfPossession) &&
    references.has(AuthenticationMethodReference.UserPresence)
      ? [{ factor: AuthenticationFactor.WebAuthn, class: AuthenticationFactorClass.Both }]
      : []),
    ...(references.has(AuthenticationMethodReference.Federated)
      ? [{ factor: AuthenticationFactor.Federated }]
      : []),
  ];
};
