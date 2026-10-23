import { GrantType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { type KoaContextWithOIDC, type UnknownObject } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';

/** Claims only Logto may set; JWT customizer output is stripped of them before merging. */
const reservedAuthenticationContextClaimKeys = new Set(['acr', 'amr', 'auth_time']);

/**
 * Drop the reserved authentication-context claims from JWT customizer output.
 *
 * Account API authorizes sensitive operations from the access token's `acr` and `auth_time`, and the
 * customizer is merged last, so a script must neither override the values Logto derived nor assert
 * a context Logto did not derive (social or enterprise SSO, token exchange).
 */
export const dropReservedAuthenticationContextClaims = (
  customClaims: UnknownObject | undefined
): UnknownObject | undefined => {
  if (!customClaims) {
    return customClaims;
  }

  return Object.fromEntries(
    Object.entries(customClaims).filter(([key]) => !reservedAuthenticationContextClaimKeys.has(key))
  );
};

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
      : grantType === GrantType.DeviceCode
        ? entities.DeviceCode
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
