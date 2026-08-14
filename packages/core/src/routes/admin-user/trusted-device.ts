import { trustedDeviceResponseGuard } from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function adminUserTrustedDeviceRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  // DEV: MFA trusted device management
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const {
    queries: {
      trustedDevices,
      users: { findUserById },
    },
    libraries: { trustedDevices: trustedDeviceLibrary },
  } = tenant;

  router.get(
    '/users/:userId/trusted-devices',
    koaPagination(),
    koaGuard({
      params: z.object({ userId: z.string() }),
      response: trustedDeviceResponseGuard.array(),
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const { userId } = ctx.guard.params;
      const { limit, offset } = ctx.pagination;

      await findUserById(userId);
      const [totalNumber, records] = await trustedDevices.findActiveByUserId(userId, {
        limit,
        offset,
      });

      ctx.pagination.totalCount = totalNumber;
      ctx.body = records;

      return next();
    }
  );

  router.delete(
    '/users/:userId/trusted-devices/:trustedDeviceId',
    koaGuard({
      params: z.object({ userId: z.string(), trustedDeviceId: z.string() }),
      status: [204, 404],
    }),
    async (ctx, next) => {
      const { userId, trustedDeviceId } = ctx.guard.params;

      await findUserById(userId);
      const trustedDevice = await trustedDeviceLibrary.deleteByIdAndUserId(
        ctx,
        trustedDeviceId,
        userId
      );

      assertThat(
        trustedDevice,
        new RequestError({
          code: 'entity.not_found',
          status: 404,
        })
      );

      ctx.status = 204;

      return next();
    }
  );
}
