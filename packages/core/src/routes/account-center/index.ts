import {
  AccountCenters,
  accountCenterFieldControlGuard,
  webauthnRelatedOriginsGuard,
} from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

const deleteAccountUrlGuard = z
  .string()
  .max(2048)
  .refine(
    (value) =>
      value === '' ||
      ((value.startsWith('https://') || value.startsWith('http://')) &&
        z.string().url().safeParse(value).success),
    {
      message: 'deleteAccountUrl must be a valid http(s) URL',
    }
  );

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
        deleteAccountUrl: deleteAccountUrlGuard.optional(),
      }),
      response: AccountCenters.guard,
      status: [200],
    }),

    async (ctx, next) => {
      const { enabled, fields, webauthnRelatedOrigins, deleteAccountUrl } = ctx.guard.body;

      // Make sure the account center exists
      await findDefaultAccountCenter();
      const updatedAccountCenter = await updateDefaultAccountCenter({
        enabled,
        fields,
        webauthnRelatedOrigins: webauthnRelatedOrigins
          ? deduplicate(webauthnRelatedOrigins)
          : undefined,
        ...(deleteAccountUrl !== undefined && { deleteAccountUrl }),
      });

      ctx.body = updatedAccountCenter;

      return next();
    }
  );
}
