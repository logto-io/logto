import { passwordRegEx, usernameRegEx } from '@logto/core-kit';
import { SignInIdentifier, UserRole, adminConsoleApplicationId } from '@logto/schemas';
import type Provider from 'oidc-provider';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import {
  assignInteractionResults,
  getApplicationIdFromInteraction,
} from '#src/libraries/session.js';
import { getSignInExperienceForApplication } from '#src/libraries/sign-in-experience/index.js';
import { encryptUserPassword, generateUserId, insertUser } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import {
  findUserByEmail,
  findUserByPhone,
  findUserByUsername,
  hasActiveUsers,
  hasUser,
} from '#src/queries/user.js';
import assertThat from '#src/utils/assert-that.js';

import type { AnonymousRouterLegacy } from '../types.js';
import { checkRequiredProfile, getRoutePrefix, signInWithPassword } from './utils.js';

export const registerRoute = getRoutePrefix('register', 'password');
export const signInRoute = getRoutePrefix('sign-in', 'password');

export default function passwordRoutes<T extends AnonymousRouterLegacy>(
  router: T,
  provider: Provider
) {
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
        identifier: SignInIdentifier.Phone,
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

      const signInExperience = await getSignInExperienceForApplication(
        await getApplicationIdFromInteraction(ctx, provider)
      );
      assertThat(
        signInExperience.signUp.identifiers.includes(SignInIdentifier.Username),
        new RequestError({
          code: 'user.sign_up_method_not_enabled',
          status: 422,
        })
      );

      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_already_in_use',
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

      const signInExperience = await getSignInExperienceForApplication(
        await getApplicationIdFromInteraction(ctx, provider)
      );
      assertThat(
        signInExperience.signUp.identifiers.includes(SignInIdentifier.Username),
        new RequestError({
          code: 'user.sign_up_method_not_enabled',
          status: 422,
        })
      );

      assertThat(
        !(await hasUser(username)),
        new RequestError({
          code: 'user.username_already_in_use',
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
