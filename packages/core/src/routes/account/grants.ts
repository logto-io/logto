import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, getUserApplicationGrantsResponseGuard } from '@logto/schemas';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function accountGrantRoutes<T extends UserRouter>(
  ...[router, { libraries }]: RouterInitArgs<T>
) {
  if (!EnvSet.values.isDevFeaturesEnabled) {
    return;
  }

  const { session: sessionLibrary } = libraries;

  router.get(
    `${accountApiPrefix}/grants`,
    koaGuard({
      query: z.object({
        appType: z.enum(['firstParty', 'thirdParty']).optional(),
      }),
      status: [200, 400, 401, 500],
      response: getUserApplicationGrantsResponseGuard,
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified } = ctx.auth;
      const { fields } = ctx.accountCenter;
      const { appType } = ctx.guard.query;

      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );

      assertThat(
        fields.session === AccountCenterControlValue.Edit ||
          fields.session === AccountCenterControlValue.ReadOnly,
        'account_center.field_not_enabled'
      );

      assertThat(
        scopes.has(UserScope.Sessions),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

      const grants = await sessionLibrary.findUserActiveApplicationGrants(userId, appType);

      ctx.body = {
        grants,
      };

      return next();
    }
  );
}
