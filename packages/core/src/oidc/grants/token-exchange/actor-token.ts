import { trySafe } from '@silverhand/essentials';
import { type KoaContextWithOIDC, errors } from 'oidc-provider';

import assertThat from '#src/utils/assert-that.js';

import { TokenExchangeTokenType } from './types.js';

const { InvalidGrant } = errors;

/**
 * Handles the `actor_token` and `actor_token_type` parameters,
 * if both are present and valid, the `accountId` of the actor token is returned.
 */
export const handleActorToken = async (ctx: KoaContextWithOIDC): Promise<{ actorId?: string }> => {
  const { params, provider } = ctx.oidc;
  const { AccessToken } = provider;

  assertThat(params, new InvalidGrant('parameters must be available'));
  assertThat(
    !params.actor_token || params.actor_token_type === TokenExchangeTokenType.AccessToken,
    new InvalidGrant('unsupported actor token type')
  );

  if (!params.actor_token) {
    return { actorId: undefined };
  }

  // The actor token should have `openid` scope (RFC 0005), and a token with this scope is an opaque token.
  // We can use `AccessToken.find` to handle the token, no need to handle JWT tokens.
  const actorToken = await trySafe(async () => AccessToken.find(String(params.actor_token)));
  assertThat(actorToken?.accountId, new InvalidGrant('invalid actor token'));
  assertThat(
    actorToken.scope?.includes('openid'),
    new InvalidGrant('actor token must have openid scope')
  );

  return { actorId: actorToken.accountId };
};
