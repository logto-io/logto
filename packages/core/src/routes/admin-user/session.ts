import { getUserSessionResponseGuard, getUserSessionsResponseGuard } from '@logto/schemas';
import { assert, yes } from '@silverhand/essentials';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function adminUserSessionRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    provider,
    libraries: { session: sessionLibrary },
  } = tenant;

  router.get(
    '/users/:userId/sessions',
    koaGuard({
      params: object({ userId: string() }),
      response: getUserSessionsResponseGuard,
      status: [200, 500],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      const sessions = await sessionLibrary.findUserActiveSessionsWithExtensions(userId);

      ctx.body = {
        sessions,
      };

      return next();
    }
  );

  router.get(
    '/users/:userId/sessions/:sessionId',
    koaGuard({
      params: object({ userId: string(), sessionId: string() }),
      response: getUserSessionResponseGuard,
      status: [200, 404, 500],
    }),
    async (ctx, next) => {
      const { userId, sessionId } = ctx.guard.params;

      const extendedSession = await sessionLibrary.findUserActiveSessionWithExtension(
        userId,
        sessionId
      );

      assert(extendedSession, new RequestError({ code: 'oidc.session_not_found', status: 404 }));

      ctx.body = extendedSession;

      return next();
    }
  );

  router.delete(
    '/users/:userId/sessions/:sessionId',
    koaGuard({
      query: object({ revokeGrants: string().optional() }),
      params: object({
        userId: string(),
        sessionId: string(),
      }),
      status: [204, 404, 500],
    }),
    async (ctx, next) => {
      const { sessionId, userId } = ctx.guard.params;

      const session = await provider.Session.findByUid(sessionId);

      assert(session, new RequestError({ code: 'oidc.session_not_found', status: 404 }));

      assert(
        session.accountId === userId,
        new RequestError({ code: 'oidc.invalid_session_account_id', status: 404 })
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
