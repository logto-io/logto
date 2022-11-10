import { passwordRegEx, usernameRegEx } from '@logto/core-kit';
import { SignInIdentifier, SignUpIdentifier, UserRole } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import type { Provider } from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '@/errors/RequestError';
import { assignInteractionResults } from '@/lib/session';
import { encryptUserPassword, generateUserId, insertUser } from '@/lib/user';
import koaGuard from '@/middleware/koa-guard';
import { findDefaultSignInExperience } from '@/queries/sign-in-experience';
import {
  findUserByEmail,
  findUserByPhone,
  findUserByUsername,
  hasActiveUsers,
  hasUser,
} from '@/queries/user';
import assertThat from '@/utils/assert-that';

import type { AnonymousRouter } from '../types';
import { checkRequiredProfile, getRoutePrefix, signInWithPassword } from './utils';

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
      const { username, password } = ctx.guard.body;
      const type = 'SignInUsernamePassword';
      await signInWithPassword(ctx, provider, {
        identifier: SignInIdentifier.Username,
        password,
        logType: type,
        logPayload: { username },
        findUser: async () => findUserByUsername(username),
      });

      return next();
    }
  );

  router.post(
    `${signInRoute}/email`,
    koaGuard({
      body: object({
        email: string().min(1),
        password: string().min(1),
      }),
    }),
    async (ctx, next) => {
      const { email, password } = ctx.guard.body;
      const type = 'SignInEmailPassword';
      await signInWithPassword(ctx, provider, {
        identifier: SignInIdentifier.Email,
        password,
        logType: type,
        logPayload: { email },
        findUser: async () => findUserByEmail(email),
      });

      return next();
    }
  );

  router.post(
    `${signInRoute}/sms`,
    koaGuard({
      body: object({
        phone: string().min(1),
        password: string().min(1),
      }),
    }),
    async (ctx, next) => {
      const { phone, password } = ctx.guard.body;
      const type = 'SignInSmsPassword';
      await signInWithPassword(ctx, provider, {
        identifier: SignInIdentifier.Sms,
        password,
        logType: type,
        logPayload: { phone },
        findUser: async () => findUserByPhone(phone),
      });

      return next();
    }
  );

  router.post(
    `${registerRoute}/check-username`,
    koaGuard({
      body: object({
        username: string().regex(usernameRegEx),
      }),
    }),
    async (ctx, next) => {
      const { username } = ctx.guard.body;

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

      ctx.status = 204;

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

      const user = await insertUser({
        id,
        username,
        passwordEncrypted,
        passwordEncryptionMethod,
        roleNames,
        lastSignInAt: Date.now(),
      });
      await checkRequiredProfile(ctx, provider, user, signInExperience);
      await assignInteractionResults(ctx, provider, { login: { accountId: id } });

      return next();
    }
  );
}
