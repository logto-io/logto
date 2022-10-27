import { passwordRegEx, usernameRegEx } from '@logto/core-kit';
import { SignInIdentifier, SignUpIdentifier, UserRole } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import { verifyUserPassword, encryptUserPassword, generateUserId, insertUser } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import { findUserByUsername, hasActiveUsers, hasUser, updateUserById } from '@/queries/user';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import { getRoutePrefix } from './utils';

export const registerRoute = getRoutePrefix('register', 'password');
export const signInRoute = getRoutePrefix('sign-in', 'password');

export default function passwordRoutes<T extends AnonymousRouter>(router: T, provider: Provider) {
  router.post(
    `${signInRoute}/username`,
    koaGuard({
      body: object({
        username: string().min(1),
        password: string().min(1),
      }),
    }),
    async (ctx, next) => {
      const signInExperience = await findDefaultSignInExperience();
      assertThat(
        signInExperience.signIn.methods.some(
          ({ identifier, password }) => identifier === SignInIdentifier.Username && password
        ),
        new RequestError({
          code: 'user.sign_in_method_not_enabled',
          status: 422,
        })
      );

      await provider.interactionDetails(ctx.req, ctx.res);
      const { username, password } = ctx.guard.body;
      const type = 'SignInUsernamePassword';
      ctx.log(type, { username });

      const user = await findUserByUsername(username);
      const { id } = await verifyUserPassword(user, password);

      ctx.log(type, { userId: id });
      await updateUserById(id, { lastSignInAt: Date.now() });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } }, true);

      return next();
    }
  );

  router.post(
    `${registerRoute}/username`,
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

      const signInExperience = await findDefaultSignInExperience();
      assertThat(
        signInExperience.signUp.identifier === SignUpIdentifier.Username,
        new RequestError({
          code: 'user.sign_up_method_not_enabled',
          status: 422,
        })
      );

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
        lastSignInAt: Date.now(),
      });
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );
}
