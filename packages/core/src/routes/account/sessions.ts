import { AccountCenterControlValue, getUserSessionsResponseGuard } from '@logto/schemas';
import { yes } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

function accountSessionRoutes<T extends UserRouter>(
  ...[router, { provider, libraries }]: RouterInitArgs<T>
) {
  const { session: sessionLibrary } = libraries;

  router.get(
    `${accountApiPrefix}/sessions`,
    koaGuard({
      status: [200, 400, 500],
      response: getUserSessionsResponseGuard,
    }),
    async (ctx, next) => {
      const { id: userId } = ctx.auth;
      const { fields } = ctx.accountCenter;

      assertThat(
        fields.session === AccountCenterControlValue.Edit ||
          fields.session === AccountCenterControlValue.ReadOnly,
        'account_center.field_not_enabled'
      );

      const sessions = await sessionLibrary.findUserActiveSessionsWithExtensions(userId);

      ctx.body = {
        sessions,
      };

      return next();
    }
  );

  router.delete(
    `${accountApiPrefix}/sessions/:sessionId`,
    koaGuard({
      query: z.object({ revokeGrants: z.string().optional() }),
      params: z.object({
        sessionId: z.string().min(1),
      }),
      status: [204, 400, 404, 500],
    }),
    async (ctx, next) => {
      const { sessionId } = ctx.guard.params;
      const { id: userId } = ctx.auth;
      const { fields } = ctx.accountCenter;

      assertThat(
        fields.session === AccountCenterControlValue.Edit,
        'account_center.field_not_enabled'
      );

      const session = await provider.Session.findByUid(sessionId);

      assertThat(session, new RequestError('oidc.session_not_found', { status: 404 }));

      assertThat(
        session.accountId === userId,
        new RequestError('oidc.invalid_session_account_id', { status: 404 })
      );

      const { revokeGrants } = ctx.guard.query;

      const authorizations = Object.entries(session.authorizations ?? {});

      if (yes(revokeGrants)) {
        /**
         * Revoking all grants and associated tokens for the session.
         * @link https://github.com/logto-io/node-oidc-provider/blob/460feeea606d4f1c0bbab82bc196311053070ffc/lib/actions/end_session.js#L166
         * @link https://github.com/logto-io/node-oidc-provider/blob/460feeea606d4f1c0bbab82bc196311053070ffc/lib/helpers/revoke.js
         */
        await Promise.all(
          authorizations.map(async ([, { grantId }]) => {
            if (grantId) {
              await Promise.all(
                [provider.AccessToken, provider.RefreshToken, provider.AuthorizationCode]
                  .map(async (model) => model.revokeByGrantId(grantId))
                  .concat(provider.Grant.adapter.destroy(grantId))
              );
              // Note: Unlike end_session request.
              // We do not have oidc context here so we cannot trigger the `grant.revoked` event here.
              // This is a known limitation.
            }
          })
        );
      }

      await session.destroy();

      ctx.status = 204;

      return next();
    }
  );
}
