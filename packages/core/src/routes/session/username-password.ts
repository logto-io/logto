import { passwordRegEx, usernameRegEx } from '@logto/core-kit';
import { UserRole } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import {
  encryptUserPassword,
  generateUserId,
  findUserByUsernameAndPassword,
  updateLastSignInAt,
  insertUser,
} from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { hasUser, hasActiveUsers } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import { AnonymousRouter } from '../types';
import { getRoutePrefix } from './utils';

export const registerRoute = getRoutePrefix('register', 'username-password');
export const signInRoute = getRoutePrefix('sign-in', 'username-password');

export default function usernamePasswordRoutes<T extends AnonymousRouter>(
  router: T,
  provider: Provider
) {
  router.post(
    signInRoute,
    koaGuard({
      body: object({
        username: string().min(1),
        password: string().min(1),
      }),
    }),
    async (ctx, next) => {
      const {
        params: { client_id },
      } = await provider.interactionDetails(ctx.req, ctx.res);
      const { username, password } = ctx.guard.body;
      const type = 'SignInUsernamePassword';
      ctx.log(type, { username });

      const { id } = await findUserByUsernameAndPassword(username, password);

      ctx.log(type, { userId: id });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    registerRoute,
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
        password: string().regex(passwordRegEx),
      }),
    }),
    async (ctx, next) => {
      const { username, password } = ctx.guard.body;
      const type = 'RegisterUsernamePassword';
      ctx.log(type, { username });

      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_exists_register',
          status: 422,
        })
      );

      const {
        params: { client_id },
      } = await provider.interactionDetails(ctx.req, ctx.res);

      const createAdminUser =
        String(client_id) === adminConsoleApplicationId && !(await hasActiveUsers());
      const roleNames = createAdminUser ? [UserRole.Admin] : [];

      const id = await generateUserId();

      ctx.log(type, { userId: id, roleNames });

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
        roleNames,
      });
      await updateLastSignInAt(id);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );
}
