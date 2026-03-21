import { getUserApplicationGrantsResponseGuard } from '@logto/schemas';
import { object, string, enum as zodEnum } from 'zod';

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

      ctx.status = 204;

      return next();
    }
  );
}
