import { getUserApplicationGrantsResponseGuard } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { object, string, enum as zodEnum } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function adminUserGrantRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const {
    provider,
    libraries: { session: sessionLibrary },
  } = tenant;

  router.get(
    '/users/:userId/grants',
    koaGuard({
      params: object({ userId: string() }),
      query: object({
        appType: zodEnum(['firstParty', 'thirdParty']).optional(),
      }),
      response: getUserApplicationGrantsResponseGuard,
      status: [200, 500],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      const { appType } = ctx.guard.query;
      const grants = await sessionLibrary.findUserActiveApplicationGrants(userId, appType);

      ctx.body = {
        grants,
      };

      return next();
    }
  );

  router.delete(
    '/users/:userId/grants/:grantId',
    koaGuard({
      params: object({ userId: string(), grantId: string() }),
      status: [204, 404, 500],
    }),
    async (ctx, next) => {
      const { userId, grantId } = ctx.guard.params;

      await sessionLibrary.revokeUserGrantById(provider, userId, grantId);
      await trySafe(
        async () => {
          await sessionLibrary.removeUserSessionAuthorizationByGrantId(provider, userId, grantId);
        },
        (error) => {
          throw new RequestError(
            { code: 'oidc.failed_to_cleanup_session_authorization', status: 500 },
            { cause: error }
          );
        }
      );

      ctx.status = 204;

      return next();
    }
  );
}
