import { usernameRegEx } from '@logto/core-kit';
import { userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { checkSessionHealth } from '@/lib/session';
import koaGuard from '@/middleware/koa-guard';
import { findUserById, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import { verificationTimeout } from './consts';
import { checkSignUpIdentifierCollision } from './utils';

export const profileRoute = '/session/profile';

export default function profileRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.get(profileRoute, async (ctx, next) => {
    const { accountId } = await provider.Session.get(ctx);

    if (!accountId) {
      throw new RequestError('auth.unauthorized');
    }

    const user = await findUserById(accountId);

    ctx.body = pick(user, ...userInfoSelectFields);

    return next();
  });

  router.patch(
    `${profileRoute}/username`,
    koaGuard({
      body: object({ username: string().regex(usernameRegEx) }),
    }),
    async (ctx, next) => {
      const userId = await checkSessionHealth(ctx, provider, verificationTimeout);

      assertThat(userId, new RequestError('auth.unauthorized'));

      const { username } = ctx.guard.body;

      await checkSignUpIdentifierCollision({ username }, userId);

      const user = await updateUserById(userId, { username }, 'replace');

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );
}
