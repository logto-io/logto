import {
  SessionGrantRevokeTarget,
  getUserApplicationGrantsResponseGuard,
  getUserSessionResponseGuard,
  getUserSessionsResponseGuard,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { nativeEnum, object, string, enum as zodEnum } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';

import { EnvSet } from '../../env-set/index.js';
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

  if (EnvSet.values.isDevFeaturesEnabled) {
    router.get(
      '/users/:userId/grants',
      koaGuard({
        params: object({ userId: string() }),
        query: object({
          appType: zodEnum(['firstParty', 'thirdParty']).optional(),
        }),
        response: getUserApplicationGrantsResponseGuard,
        status: [200, 500],
      }),
      async (ctx, next) => {
        const {
          params: { userId },
        } = ctx.guard;

        const { appType } = ctx.guard.query;
        const grants = await sessionLibrary.findUserActiveApplicationGrants(userId, appType);

        ctx.body = {
          grants,
        };

        return next();
      }
    );

    router.delete(
      '/users/:userId/grants/:grantId',
      koaGuard({
        params: object({ userId: string(), grantId: string() }),
        status: [204, 404, 500],
      }),
      async (ctx, next) => {
        const { userId, grantId } = ctx.guard.params;

        try {
          await sessionLibrary.revokeUserGrantById({
            provider,
            userId,
            grantId,
          });
        } catch (error: unknown) {
          if (error instanceof RequestError) {
            throw error;
          }

          throw new RequestError(
            { code: 'oidc.failed_to_revoke_grant', status: 500 },
            { cause: error }
          );
        }

        try {
          await sessionLibrary.removeUserSessionAuthorizationByGrantId({
            provider,
            userId,
            grantId,
          });
        } catch (error: unknown) {
          if (error instanceof RequestError) {
            throw error;
          }

          throw new RequestError(
            { code: 'oidc.failed_to_cleanup_session_authorization', status: 500 },
            { cause: error }
          );
        }

        ctx.status = 204;

        return next();
      }
    );
  }

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
      query: object({
        revokeGrantsTarget: nativeEnum(SessionGrantRevokeTarget).optional(),
      }),
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

      const { revokeGrantsTarget } = ctx.guard.query;

      if (revokeGrantsTarget) {
        await sessionLibrary.revokeSessionAssociatedGrants({
          provider,
          authorizations: session.authorizations ?? {},
          target: revokeGrantsTarget,
        });
      }

      await session.destroy();

      ctx.status = 204;

      return next();
    }
  );
}
