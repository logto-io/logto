import {
  jwtCustomizerUserInteractionContextGuard,
  OidcModelInstances,
  oidcSessionInstancePayloadGuard,
} from '@logto/schemas';
import { object, string, array } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import { type ManagementApiRouter, type RouterInitArgs } from '../types.js';

export default function adminUserSessionRoutes<T extends ManagementApiRouter>(
  ...[router, tenant]: RouterInitArgs<T>
) {
  const {
    libraries: { session: sessionLibrary },
  } = tenant;

  router.get(
    '/users/:userId/sessions',
    koaGuard({
      params: object({ userId: string() }),
      response: object({
        sessions: array(
          OidcModelInstances.guard.extend({
            payload: oidcSessionInstancePayloadGuard,
            lastSubmission: jwtCustomizerUserInteractionContextGuard.nullable(),
            clientId: string().nullable(),
            accountId: string().nullable(),
          })
        ),
      }),
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
}
