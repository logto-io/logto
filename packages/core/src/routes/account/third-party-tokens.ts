import {
  type EnterpriseSsoTokenSetSecret,
  getThirdPartyAccessTokenResponseGuard,
  type GetThirdPartyAccessTokenResponse,
  type SocialTokenSetSecret,
  type TokenSetMetadata,
  VerificationType,
  tokenSetMetadataGuard,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { buildVerificationRecordByIdAndType } from '#src/libraries/verification.js';
import koaGuard from '#src/middleware/koa-guard.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import assertThat from '#src/utils/assert-that.js';
import { decryptTokens } from '#src/utils/secret-encryption.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

const isSocialTokenSetSecret = (
  tokenSetSecret: SocialTokenSetSecret | EnterpriseSsoTokenSetSecret
): tokenSetSecret is SocialTokenSetSecret =>
  'connectorId' in tokenSetSecret && 'target' in tokenSetSecret;

const formatTokenResponse = (
  access_token: string,
  metadata: TokenSetMetadata,
  now = Math.floor(Date.now() / 1000)
) => {
  const { expiresAt, scope, tokenType } = metadata;

  const expires_in = expiresAt ? expiresAt - now : undefined;

  return {
    access_token,
    ...conditional(scope && { scope }),
    ...conditional(tokenType && { token_type: tokenType }),
    ...conditional(expires_in && { expires_in }),
  };
};

const getAccessToken = async (
  { socials, ssoConnectors }: Libraries,
  { secrets }: Queries,
  tokenSetSecret: SocialTokenSetSecret | EnterpriseSsoTokenSetSecret
): Promise<GetThirdPartyAccessTokenResponse> => {
  const { id, metadata, iv, encryptedDek, ciphertext, authTag } = tokenSetSecret;

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

  const { expiresAt } = metadata;
  const now = Math.floor(Date.now() / 1000);

  if (!expiresAt || now < expiresAt) {
    return formatTokenResponse(access_token, metadata, now);
  }

  if (refresh_token) {
    const refreshedResponse = isSocialTokenSetSecret(tokenSetSecret)
      ? await socials.refreshTokenSetSecret(tokenSetSecret.connectorId, id, refresh_token)
      : await ssoConnectors.refreshTokenSetSecret(tokenSetSecret.ssoConnectorId, id, refresh_token);

    return formatTokenResponse(refreshedResponse.access_token, refreshedResponse.metadata);
  }

  await secrets.deleteById(id);
  throw new RequestError({
    code: 'secrets.third_party_token_set.access_token_expired',
    status: 401,
  });
};

export default function thirdPartyTokensRoutes<T extends UserRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    secrets: secretsQueries,
    users: { findUserByIdentity },
  } = queries;

  const {
    socials: { upsertSocialTokenSetSecret },
  } = libraries;

  router.get(
    `${accountApiPrefix}/identities/:target/access-token`,
    koaGuard({
      params: z.object({
        target: z.string().min(1),
      }),
      status: [200, 404, 401, 422],
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

      ctx.body = await getAccessToken(libraries, queries, tokenSetSecret);

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

      ctx.body = await getAccessToken(libraries, queries, tokenSetSecret);

      return next();
    }
  );

  router.put(
    `${accountApiPrefix}/identities/:target/access-token`,
    koaGuard({
      params: z.object({
        target: z.string().min(1),
      }),
      body: z.object({
        verificationRecordId: z.string().min(1),
      }),
      status: [200, 401, 422],
      response: getThirdPartyAccessTokenResponseGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { target } = ctx.guard.params;
      const { verificationRecordId } = ctx.guard.body;

      const socialVerificationRecord = await buildVerificationRecordByIdAndType({
        type: VerificationType.Social,
        id: verificationRecordId,
        queries,
        libraries,
      });
      assertThat(socialVerificationRecord.isVerified, 'verification_record.not_found');

      const {
        socialIdentity: { target: identityTarget, userInfo },
      } = await socialVerificationRecord.toUserProfile();

      assertThat(
        identityTarget === target,
        new RequestError({
          code: 'verification_record.social_verification.invalid_target',
          status: 422,
          expected: target,
          actual: identityTarget,
        })
      );

      const user = await findUserByIdentity(target, userInfo.id);

      assertThat(
        user && user.id === userId,
        new RequestError({
          code: 'user.identity_not_exists_in_current_user',
          status: 422,
        })
      );

      const tokenSecret = await socialVerificationRecord.getTokenSetSecret();

      assertThat(
        tokenSecret,
        new RequestError({
          code: 'verification_record.social_verification.token_response_not_found',
          status: 422,
        })
      );

      const { metadata, iv, authTag, encryptedDek, ciphertext } = await upsertSocialTokenSetSecret(
        user.id,
        tokenSecret
      );

      const { access_token } = decryptTokens({
        iv,
        encryptedDek,
        ciphertext,
        authTag,
      });

      // Validate the token metadata format, make typescript happy
      const socialTokenSetMetadata = tokenSetMetadataGuard.parse(metadata);
      ctx.body = formatTokenResponse(access_token, socialTokenSetMetadata);

      return next();
    }
  );
}
