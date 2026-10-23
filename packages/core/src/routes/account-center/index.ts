import {
  accountCenterProfileFieldsGuard,
  deleteAccountUrlGuard,
  maximumAuthenticationAgeInSecondsGuard,
  webauthnRelatedOriginsGuard,
} from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

import { getAccountCenterApiGuards } from './guards.js';

export default function accountCentersRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries, libraries }] = args;
  const { findDefaultAccountCenter, updateDefaultAccountCenter } = queries.accountCenters;
  const { normalizeProfileFields } = libraries.customProfileFields;
  const { accountCenter: accountCenterApiGuard, fields: accountCenterFieldsApiGuard } =
    getAccountCenterApiGuards();
  router.get(
    '/account-center',
    koaGuard({
      response: accountCenterApiGuard,
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
        fields: accountCenterFieldsApiGuard.optional(),
        webauthnRelatedOrigins: webauthnRelatedOriginsGuard.optional(),
        deleteAccountUrl: deleteAccountUrlGuard.nullable().optional(),
        customCss: z.string().nullish(),
        profileFields: accountCenterProfileFieldsGuard.nullable().optional(),
        maximumAuthenticationAgeInSeconds: maximumAuthenticationAgeInSecondsGuard.optional(),
      }),
      response: accountCenterApiGuard,
      status: [200, 400],
    }),

    async (ctx, next) => {
      const {
        enabled,
        fields,
        webauthnRelatedOrigins,
        deleteAccountUrl,
        customCss,
        profileFields,
        maximumAuthenticationAgeInSeconds,
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
        // DEV: OIDC step-up authentication. Nothing enforces the window until the feature is
        // released, so a value saved now would have no effect.
        maximumAuthenticationAgeInSeconds: EnvSet.values.isDevFeaturesEnabled
          ? maximumAuthenticationAgeInSeconds
          : undefined,
        ...(normalizedProfileFields !== undefined && {
          profileFields: normalizedProfileFields,
        }),
      });

      ctx.body = updatedAccountCenter;

      return next();
    }
  );
}
