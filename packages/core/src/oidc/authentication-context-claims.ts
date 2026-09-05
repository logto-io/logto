import { GrantType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { type KoaContextWithOIDC, type UnknownObject } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';

/** Copy the authentication event captured by the source grant, including its original timestamp. */
export const getExtraTokenClaimsForAuthenticationContext = (
  ctx: KoaContextWithOIDC,
  token: unknown
): UnknownObject | undefined => {
  // OIDC step-up authentication context is only available with dev features enabled.
  if (!EnvSet.values.isDevFeaturesEnabled || !(token instanceof ctx.oidc.provider.AccessToken)) {
    return;
  }

  const { entities, params } = ctx.oidc;
  const grantType = params?.grant_type;
  const source =
    grantType === GrantType.AuthorizationCode
      ? entities.AuthorizationCode
      : conditional(grantType === GrantType.RefreshToken && entities.RefreshToken);

  // Other grants must not acquire authentication context from the session or subject token.
  if (!source) {
    return;
  }

  const { acr, amr, authTime } = source;

  if ([acr, amr, authTime].every((value) => value === undefined)) {
    return;
  }

  return {
    ...conditional(acr !== undefined && { acr }),
    ...conditional(amr !== undefined && { amr }),
    ...conditional(authTime !== undefined && { auth_time: authTime }),
  };
};
