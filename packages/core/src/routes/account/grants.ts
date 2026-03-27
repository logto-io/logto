import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, getUserApplicationGrantsResponseGuard } from '@logto/schemas';
import { trySafe } from '@silverhand/essentials';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function accountGrantRoutes<T extends UserRouter>(
  ...[router, { provider, libraries }]: RouterInitArgs<T>
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

  router.delete(
    `${accountApiPrefix}/grants/:grantId`,
    koaGuard({
      params: z.object({
        grantId: z.string().min(1),
      }),
      status: [204, 400, 401, 404, 500],
    }),
    async (ctx, next) => {
      const {
        params: { grantId },
      } = ctx.guard;
      const { id: userId, scopes, identityVerified } = ctx.auth;
      const { fields } = ctx.accountCenter;

      assertThat(
        identityVerified,
        new RequestError({ code: 'verification_record.permission_denied', status: 401 })
      );

      assertThat(
        fields.session === AccountCenterControlValue.Edit,
        'account_center.field_not_editable'
      );

      assertThat(
        scopes.has(UserScope.Sessions),
        new RequestError({ code: 'auth.unauthorized', status: 401 })
      );

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
