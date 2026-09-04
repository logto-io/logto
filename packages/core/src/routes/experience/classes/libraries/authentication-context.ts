import {
  AuthenticationFactorClass,
  LogtoAcr,
  buildAuthenticationMethodReferences,
  type AuthenticationMethodReference,
  type AuthenticationProof,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

/** The authentication context an interaction achieved, in the shape of the provider's `login` result. */
type AuthenticationContext = {
  acr?: LogtoAcr;
  amr?: AuthenticationMethodReference[];
};

/** The distinct factors of the proofs whose class fills the given role. */
const factorsOfRole = (
  proofs: readonly AuthenticationProof[],
  role: AuthenticationFactorClass.FirstFactor | AuthenticationFactorClass.Mfa
) =>
  new Set(
    proofs
      .filter(({ class: factorClass }) =>
        factorClass ? [role, AuthenticationFactorClass.Both].includes(factorClass) : false
      )
      .map(({ factor }) => factor)
  );

/**
 * Aggregate the authentication context an interaction achieved from the proofs it recorded. The
 * aggregation reads nothing but the proof list: which credentials count was decided at the
 * touchpoints that recorded them (see `AuthenticationProofs`), and the role of a proof plays no
 * part here.
 *
 * - A `1fa`-class proof reaches `urn:logto:acr:1fa`; an `mfa`-class proof alone also reaches only
 *   `urn:logto:acr:1fa`.
 * - A `1fa`-class proof plus an `mfa`-class proof of a different factor, or a `both`-class proof
 *   (a user-verified WebAuthn authenticator) alone, reaches `urn:logto:acr:mfa`. Repeated proofs
 *   of one factor count once, so a one-time token plus an MFA email code stays at
 *   `urn:logto:acr:1fa`.
 * - Federated proofs carry no class: they contribute `fed` to `amr` and nothing to the ACR.
 * - `amr` is the union of the proofs' references in first-seen order with `mfa` last.
 * - No `ts` is seeded: the provider stamps `auth_time` with the submission time itself.
 */
export const aggregateAuthenticationContext = (
  proofs: readonly AuthenticationProof[]
): AuthenticationContext => {
  const firstFactors = factorsOfRole(proofs, AuthenticationFactorClass.FirstFactor);
  const mfaFactors = factorsOfRole(proofs, AuthenticationFactorClass.Mfa);
  const hasDistinctPair = [...mfaFactors].some((factor) =>
    [...firstFactors].some((firstFactor) => firstFactor !== factor)
  );
  const hasSelfSufficient = proofs.some(
    ({ class: factorClass }) => factorClass === AuthenticationFactorClass.Both
  );

  const acr =
    hasDistinctPair || hasSelfSufficient
      ? LogtoAcr.Mfa
      : conditional((firstFactors.size > 0 || mfaFactors.size > 0) && LogtoAcr.FirstFactor);
  const amr = buildAuthenticationMethodReferences(
    proofs.map(({ amr }) => amr),
    acr
  );

  return {
    ...conditional(acr && { acr }),
    ...conditional(amr.length > 0 && { amr }),
  };
};
