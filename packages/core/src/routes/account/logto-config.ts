import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, userMfaDataGuard, userMfaDataKey } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import RequestError from '../../errors/RequestError/index.js';
import assertThat from '../../utils/assert-that.js';
import type { UserRouter, RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function logtoConfigRoutes<T extends UserRouter>(...args: RouterInitArgs<T>) {
  const [router, { queries }] = args;
  const {
    users: { updateUserById, findUserById },
  } = queries;

  router.get(
    `${accountApiPrefix}/logto-configs`,
    koaGuard({
      response: z.object({
        mfa: z.object({
          skipped: z.boolean(),
        }),
      }),
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;

      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      const { fields } = ctx.accountCenter;
      // Currently, only the MFA skip state is exposed in logto_config
      // so we only need to check the MFA field
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit ||
          fields.mfa === AccountCenterControlValue.ReadOnly,
        new RequestError({ code: 'account_center.field_not_enabled', status: 400 })
      );

      const user = await findUserById(userId);
      const mfaData = userMfaDataGuard.safeParse(user.logtoConfig[userMfaDataKey]);
      const skipped = mfaData.success ? (mfaData.data.skipped ?? false) : false;

      ctx.body = {
        mfa: {
          skipped,
        },
      };

      return next();
    }
  );

  router.patch(
    `${accountApiPrefix}/logto-configs`,
    koaGuard({
      body: z.object({
        mfa: z.object({
          skipped: z.boolean(),
        }),
      }),
      response: z.object({
        mfa: z.object({
          skipped: z.boolean(),
        }),
      }),
      status: [200, 400, 401],
    }),
    async (ctx, next) => {
      const { id: userId, scopes } = ctx.auth;
      assertThat(
        scopes.has(UserScope.Identities),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );
      const {
        mfa: { skipped },
      } = ctx.guard.body;
      const { fields } = ctx.accountCenter;
      // Currently, only the MFA skip state is exposed in logto_config
      // so we only need to check the MFA field
      assertThat(
        fields.mfa === AccountCenterControlValue.Edit,
        new RequestError({ code: 'account_center.field_not_editable', status: 400 })
      );

      const user = await findUserById(userId);
      const existingMfaData = userMfaDataGuard.safeParse(user.logtoConfig[userMfaDataKey]);

      const updatedUser = await updateUserById(userId, {
        logtoConfig: {
          ...user.logtoConfig,
          [userMfaDataKey]: {
            ...(existingMfaData.success ? existingMfaData.data : {}),
            skipped,
          },
        },
      });

      ctx.appendDataHookContext('User.Data.Updated', { user: updatedUser });

      ctx.body = {
        mfa: {
          skipped,
        },
      };

      return next();
    }
  );
}
