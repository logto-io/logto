import {
  AccountCenters,
  accountCenterFieldControlGuard,
  webauthnRelatedOriginsGuard,
} from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function accountCentersRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries }] = args;
  const { findDefaultAccountCenter, updateDefaultAccountCenter } = queries.accountCenters;
  router.get(
    '/account-center',
    koaGuard({
      response: AccountCenters.guard,
      status: [200],
    }),
    async (ctx, next) => {
      ctx.body = await findDefaultAccountCenter();

      return next();
    }
  );

  router.patch(
    '/account-center',
    koaGuard({
      body: z.object({
        enabled: z.boolean().optional(),
        fields: accountCenterFieldControlGuard.optional(),
        webauthnRelatedOrigins: webauthnRelatedOriginsGuard.optional(),
      }),
      response: AccountCenters.guard,
      status: [200],
    }),

    async (ctx, next) => {
      const { enabled, fields, webauthnRelatedOrigins } = ctx.guard.body;

      // Make sure the account center exists
      await findDefaultAccountCenter();
      const updatedAccountCenter = await updateDefaultAccountCenter({
        enabled,
        fields,
        webauthnRelatedOrigins: webauthnRelatedOrigins
          ? deduplicate(webauthnRelatedOrigins)
          : undefined,
      });

      ctx.body = updatedAccountCenter;

      return next();
    }
  );
}
