import { desensitizedEnterpriseSsoTokenSetSecretGuard, UserSsoIdentities } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { desensitizeTokenSetSecret } from '../../utils/secret-encryption.js';
import { type RouterInitArgs, type ManagementApiRouter } from '../types.js';

export default function adminUserEnterpriseSsoRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  router.get(
    '/users/:userId/enterprise-sso-identities/:ssoConnectorId',
    koaGuard({
      params: object({
        userId: string(),
        ssoConnectorId: string(),
      }),
      response: object({
        enterpriseSsoIdentity: UserSsoIdentities.guard,
        tokenSet: desensitizedEnterpriseSsoTokenSetSecretGuard.optional(),
      }),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId, ssoConnectorId },
      } = ctx.guard;

      const {
        queries: {
          users: { findUserById },
          secrets: secretsQueries,
        },
        libraries: {
          users: { findUserSsoIdentities },
        },
      } = tenant;

      // Check if the user exists
      const user = await findUserById(userId);

      const ssoIdentities = await findUserSsoIdentities(userId);
      const enterpriseSsoIdentity = ssoIdentities.find(
        (identity) => identity.ssoConnectorId === ssoConnectorId
      );

      assertThat(
        enterpriseSsoIdentity,
        new RequestError({
          code: 'user.enterprise_sso_identity_not_exists',
          status: 404,
        })
      );

      const tokenSetSecret =
        await secretsQueries.findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId(
          userId,
          ssoConnectorId
        );

      ctx.body = {
        enterpriseSsoIdentity,
        tokenSet: conditional(tokenSetSecret && desensitizeTokenSetSecret(tokenSetSecret)),
      };

      return next();
    }
  );
}
