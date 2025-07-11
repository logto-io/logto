import {
  type EnterpriseSsoTokenSetSecret,
  getThirdPartyAccessTokenResponseGuard,
  type GetThirdPartyAccessTokenResponse,
  type SocialTokenSetSecret,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type Queries from '#src/tenants/Queries.js';
import { decryptTokens } from '#src/utils/secret-encryption.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

const getAccessToken = async (
  { secrets }: Queries,
  tokenSetSecret: SocialTokenSetSecret | EnterpriseSsoTokenSetSecret
): Promise<GetThirdPartyAccessTokenResponse> => {
  const {
    id,
    metadata: { expiresAt, scope, tokenType },
    iv,
    encryptedDek,
    ciphertext,
    authTag,
  } = tokenSetSecret;

  const { access_token, refresh_token } = decryptTokens({
    iv,
    encryptedDek,
    ciphertext,
    authTag,
  });

  if (!access_token) {
    throw new RequestError({
      code: 'secrets.third_party_token_set.token_not_found',
      status: 404,
    });
  }

  const now = Math.floor(Date.now() / 1000);

  if (!expiresAt || now < expiresAt) {
    const expires_in = expiresAt ? expiresAt - now : undefined;
    return {
      access_token,
      ...conditional(scope && { scope }),
      ...conditional(tokenType && { token_type: tokenType }),
      ...conditional(expires_in && { expires_in }),
    };
  }

  // TODO: if refresh_token is available, we should refresh the token and update the secret.

  await secrets.deleteById(id);
  throw new RequestError({
    code: 'secrets.third_party_token_set.access_token_expired',
    status: 401,
  });
};

export default function thirdPartyTokensRoutes<T extends UserRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const { secrets: secretsQueries } = queries;

  router.get(
    `${accountApiPrefix}/identities/:target/access-token`,
    koaGuard({
      params: z.object({
        target: z.string().min(1),
      }),
      status: [200, 404, 401],
      response: getThirdPartyAccessTokenResponseGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { target } = ctx.guard.params;

      const tokenSetSecret = await secretsQueries.findSocialTokenSetSecretByUserIdAndTarget(
        userId,
        target
      );

      if (!tokenSetSecret) {
        throw new RequestError({
          code: 'secrets.third_party_token_set.token_not_found',
          status: 404,
        });
      }

      ctx.body = await getAccessToken(queries, tokenSetSecret);

      return next();
    }
  );

  router.get(
    `${accountApiPrefix}/sso-identities/:connectorId/access-token`,
    koaGuard({
      params: z.object({
        connectorId: z.string().min(1),
      }),
      status: [200, 404, 401],
      response: getThirdPartyAccessTokenResponseGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { connectorId } = ctx.guard.params;

      const tokenSetSecret =
        await secretsQueries.findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId(
          userId,
          connectorId
        );

      if (!tokenSetSecret) {
        throw new RequestError({
          code: 'secrets.third_party_token_set.token_not_found',
          status: 404,
        });
      }

      ctx.body = await getAccessToken(queries, tokenSetSecret);

      return next();
    }
  );
}
