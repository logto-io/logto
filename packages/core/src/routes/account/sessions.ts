import { UserScope } from '@logto/core-kit';
import {
  AccountCenterControlValue,
  SessionGrantRevokeTarget,
  getAccountUserSessionsResponseGuard,
} from '@logto/schemas';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { type UserRouter, type RouterInitArgs } from '../types.js';

import { accountApiPrefix } from './constants.js';

export default function accountSessionRoutes<T extends UserRouter>(
  ...[router, { provider, libraries }]: RouterInitArgs<T>
) {
  const { session: sessionLibrary } = libraries;

  router.get(
    `${accountApiPrefix}/sessions`,
    koaGuard({
      status: [200, 400, 401, 500],
      response: getAccountUserSessionsResponseGuard,
    }),
    async (ctx, next) => {
      const { id: userId, scopes, identityVerified, sessionUid } = ctx.auth;
      const { fields } = ctx.accountCenter;

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

      const sessions = await sessionLibrary.findUserActiveSessionsWithExtensions(userId);

      ctx.body = {
        sessions: sessions.map((session) => ({
          ...session,
          isCurrent: session.payload.uid === sessionUid,
        })),
      };

      return next();
    }
  );

  router.delete(
    `${accountApiPrefix}/sessions/:sessionId`,
    koaGuard({
      query: z.object({
        revokeGrantsTarget: z.nativeEnum(SessionGrantRevokeTarget).optional(),
      }),
      params: z.object({
        sessionId: z.string().min(1),
      }),
      status: [204, 400, 401, 404, 500],
    }),
    async (ctx, next) => {
      const { sessionId } = ctx.guard.params;
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

      const session = await provider.Session.findByUid(sessionId);

      assertThat(session, new RequestError('oidc.session_not_found', { status: 404 }));

      assertThat(
        session.accountId === userId,
        new RequestError('oidc.invalid_session_account_id', { status: 404 })
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
