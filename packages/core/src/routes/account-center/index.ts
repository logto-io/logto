import {
  AccountCenters,
  accountCenterFieldControlGuard,
  accountCenterProfileFieldsGuard,
  deleteAccountUrlGuard,
  webauthnRelatedOriginsGuard,
} from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function accountCentersRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries, libraries }] = args;
  const { findDefaultAccountCenter, updateDefaultAccountCenter } = queries.accountCenters;
  const { normalizeProfileFields } = libraries.customProfileFields;
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
        deleteAccountUrl: deleteAccountUrlGuard.nullable().optional(),
        customCss: z.string().nullish(),
        profileFields: accountCenterProfileFieldsGuard.nullable().optional(),
      }),
      response: AccountCenters.guard,
      status: [200],
    }),

    async (ctx, next) => {
      const {
        enabled,
        fields,
        webauthnRelatedOrigins,
        deleteAccountUrl,
        customCss,
        profileFields,
      } = ctx.guard.body;
      const normalizedDeleteAccountUrl = deleteAccountUrl === '' ? null : deleteAccountUrl;
      const normalizedProfileFields = await normalizeProfileFields(profileFields);

      // Make sure the account center exists
      await findDefaultAccountCenter();
      const updatedAccountCenter = await updateDefaultAccountCenter({
        enabled,
        fields,
        webauthnRelatedOrigins: webauthnRelatedOrigins
          ? deduplicate(webauthnRelatedOrigins)
          : undefined,
        deleteAccountUrl: normalizedDeleteAccountUrl,
        customCss,
        ...(normalizedProfileFields !== undefined && {
          profileFields: normalizedProfileFields,
        }),
      });

      ctx.body = updatedAccountCenter;

      return next();
    }
  );
}
