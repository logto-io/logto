import {
  type GetUserAllIdentitiesResponse,
  getUserAllIdentitiesResponseGuard,
  getUserSsoIdentityResponseGuard,
} from '@logto/schemas';
import { conditional, yes } from '@silverhand/essentials';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { desensitizeTokenSetSecret } from '../../utils/secret-encryption.js';
import { type RouterInitArgs, type ManagementApiRouter } from '../types.js';

export default function adminUserEnterpriseSsoRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    queries: {
      users: { findUserById },
      secrets: secretsQueries,
    },
    libraries: {
      users: { findUserSsoIdentities },
    },
  } = tenant;

  router.get(
    '/users/:userId/sso-identities/:ssoConnectorId',
    koaGuard({
      params: object({
        userId: string(),
        ssoConnectorId: string(),
      }),
      query: object({
        includeTokenSecret: string().optional(),
      }),
      response: getUserSsoIdentityResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId, ssoConnectorId },
        query: { includeTokenSecret },
      } = ctx.guard;

      // Check if the user exists
      await findUserById(userId);

      const ssoIdentities = await findUserSsoIdentities(userId);
      const ssoIdentity = ssoIdentities.find(
        (identity) => identity.ssoConnectorId === ssoConnectorId
      );

      assertThat(
        ssoIdentity,
        new RequestError({
          code: 'user.enterprise_sso_identity_not_exists',
          status: 404,
        })
      );

      if (!yes(includeTokenSecret)) {
        ctx.body = {
          ssoIdentity,
        };
        return next();
      }

      const tokenSetSecret =
        await secretsQueries.findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId(
          userId,
          ssoConnectorId
        );

      ctx.body = {
        ssoIdentity,
        tokenSecret: conditional(tokenSetSecret && desensitizeTokenSetSecret(tokenSetSecret)),
      };

      return next();
    }
  );

  router.get(
    '/users/:userId/all-identities',
    koaGuard({
      params: object({ userId: string() }),
      query: object({
        includeTokenSecret: string().optional(),
      }),
      response: getUserAllIdentitiesResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        query: { includeTokenSecret },
      } = ctx.guard;

      // Throws 404 if user not exist
      const user = await findUserById(userId);

      const socialIdentities: GetUserAllIdentitiesResponse['socialIdentities'] = Object.entries(
        user.identities
      ).map(([target, identity]) => ({
        target,
        identity,
      }));

      const rawSsoIdentities = await findUserSsoIdentities(userId);
      const ssoIdentities: GetUserAllIdentitiesResponse['ssoIdentities'] = rawSsoIdentities.map(
        (ssoIdentity) => ({
          ssoConnectorId: ssoIdentity.ssoConnectorId,
          ssoIdentity,
        })
      );

      if (!includeTokenSecret) {
        ctx.body = {
          socialIdentities,
          ssoIdentities,
        };
        return next();
      }

      const [socialTokenSecrets, enterpriseSsoTokenSecrets] = await Promise.all([
        secretsQueries.findSocialTokenSetSecretsByUserId(userId),
        secretsQueries.findEnterpriseSsoTokenSetSecretsByUserId(userId),
      ]);

      const socialSecretMap = new Map(socialTokenSecrets.map((secret) => [secret.target, secret]));
      const socialIdentitiesWithTokenSecret: GetUserAllIdentitiesResponse['socialIdentities'] =
        socialIdentities.map((socialIdentity) => {
          const secret = socialSecretMap.get(socialIdentity.target);
          return {
            ...socialIdentity,
            tokenSecret: conditional(secret && desensitizeTokenSetSecret(secret)),
          };
        });

      const enterpriseSsoSecretMap = new Map(
        enterpriseSsoTokenSecrets.map((secret) => [secret.ssoConnectorId, secret])
      );
      const ssoIdentitiesWithTokenSecret: GetUserAllIdentitiesResponse['ssoIdentities'] =
        ssoIdentities.map((ssoIdentity) => {
          const secret = enterpriseSsoSecretMap.get(ssoIdentity.ssoConnectorId);
          return {
            ...ssoIdentity,
            tokenSecret: conditional(secret && desensitizeTokenSetSecret(secret)),
          };
        });

      ctx.body = {
        socialIdentities: socialIdentitiesWithTokenSecret,
        ssoIdentities: ssoIdentitiesWithTokenSecret,
      };

      return next();
    }
  );
}
