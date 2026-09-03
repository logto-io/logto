import {
  buildAuthenticationMethodReferences,
  getAchievedAcr,
  type AuthenticationMethodReference,
  type LogtoAcr,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';

import { type IdentifiedVerification } from '../../types.js';

/** The authentication context of a sign-in, in the shape of the provider's `login` result. */
export type AuthenticationContext = {
  acr?: LogtoAcr;
  amr?: AuthenticationMethodReference[];
  /** Epoch seconds of the authentication event; becomes `auth_time`. */
  ts?: number;
};

/**
 * Build the authentication context of a sign-in from the verifications that identified the user.
 * `ts` is the earliest identification, the most conservative value for a downstream `max_age`
 * check. An empty list yields an empty context.
 */
export const buildAuthenticationContext = (
  identifiedVerifications: readonly IdentifiedVerification[]
): AuthenticationContext => {
  const amr = buildAuthenticationMethodReferences(identifiedVerifications.map(({ type }) => type));
  const acr = getAchievedAcr(amr);

  return {
    ...conditional(acr && { acr }),
    ...conditional(amr.length > 0 && { amr }),
    ...conditional(
      identifiedVerifications.length > 0 && {
        ts: Math.min(...identifiedVerifications.map(({ verifiedAt }) => verifiedAt)),
      }
    ),
  };
};
