import { emailRegEx, phoneRegEx, usernameRegEx } from '@logto/core-kit';
import {
  UsersPasswordEncryptionMethod,
  jsonObjectGuard,
  userInfoSelectFields,
  userProfileGuard,
  userProfileResponseGuard,
} from '@logto/schemas';
import { conditional, pick, yes } from '@silverhand/essentials';
import { boolean, literal, nativeEnum, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function adminUserBasicsRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries, libraries }] = args;
  const {
    oidcModelInstances: { revokeInstanceByUserId },
    users: {
      deleteUserById,
      findUserById,
      hasUser,
      updateUserById,
      hasUserWithEmail,
      hasUserWithPhone,
    },
    userSsoIdentities,
  } = queries;
  const {
    users: { checkIdentifierCollision, generateUserId, insertUser, verifyUserPassword },
  } = libraries;

  router.get(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
      query: object({ includeSsoIdentities: string().optional() }),
      response: userProfileResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        query: { includeSsoIdentities },
      } = ctx.guard;

      const user = await findUserById(userId);

      ctx.body = {
        ...pick(user, ...userInfoSelectFields),
        ...conditional(
          includeSsoIdentities &&
            yes(includeSsoIdentities) && {
              ssoIdentities: await userSsoIdentities.findUserSsoIdentitiesByUserId(userId),
            }
        ),
      };

      return next();
    }
  );

  router.get(
    '/users/:userId/custom-data',
    koaGuard({
      params: object({ userId: string() }),
      response: jsonObjectGuard,
      status: [200],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      const { customData } = await findUserById(userId);
      ctx.body = customData;

      return next();
    }
  );

  router.patch(
    '/users/:userId/custom-data',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ customData: jsonObjectGuard }),
      response: jsonObjectGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { customData },
      } = ctx.guard;

      await findUserById(userId);

      const user = await updateUserById(userId, {
        customData,
      });

      ctx.body = user.customData;

      return next();
    }
  );

  router.patch(
    '/users/:userId/profile',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ profile: userProfileGuard }),
      response: userProfileGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { profile },
      } = ctx.guard;

      await findUserById(userId);

      const user = await updateUserById(userId, {
        profile,
      });

      ctx.body = user.profile;

      return next();
    }
  );

  router.post(
    '/users',
    koaGuard({
      body: object({
        primaryPhone: string().regex(phoneRegEx),
        primaryEmail: string().regex(emailRegEx),
        username: string().regex(usernameRegEx),
        password: string().min(1),
        passwordDigest: string(),
        passwordAlgorithm: nativeEnum(UsersPasswordEncryptionMethod),
        name: string(),
        avatar: string().url().or(literal('')).nullable(),
        customData: jsonObjectGuard,
        profile: userProfileGuard,
      }).partial(),
      response: userProfileResponseGuard,
      status: [200, 400, 404, 422],
    }),
    async (ctx, next) => {
      const {
        primaryEmail,
        primaryPhone,
        username,
        password,
        name,
        passwordDigest,
        passwordAlgorithm,
        avatar,
        customData,
        profile,
      } = ctx.guard.body;

      assertThat(!(password && passwordDigest), new RequestError('user.password_and_digest'));
      assertThat(!passwordDigest || passwordAlgorithm, 'user.password_algorithm_required');

      assertThat(
        !username || !(await hasUser(username)),
        new RequestError({
          code: 'user.username_already_in_use',
          status: 422,
        })
      );
      assertThat(
        !primaryEmail || !(await hasUserWithEmail(primaryEmail)),
        new RequestError({
          code: 'user.email_already_in_use',
          status: 422,
        })
      );
      assertThat(
        !primaryPhone || !(await hasUserWithPhone(primaryPhone)),
        new RequestError({ code: 'user.phone_already_in_use', status: 422 })
      );

      const id = await generateUserId();

      const user = await insertUser(
        {
          id,
          primaryEmail,
          primaryPhone,
          username,
          name,
          avatar,
          ...conditional(customData && { customData }),
          ...conditional(password && (await encryptUserPassword(password))),
          ...conditional(
            passwordDigest && {
              passwordEncrypted: passwordDigest,
              passwordEncryptionMethod: passwordAlgorithm,
            }
          ),
          ...conditional(profile && { profile }),
        },
        []
      );

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
      body: object({
        username: string().regex(usernameRegEx).or(literal('')).nullable(),
        primaryEmail: string().regex(emailRegEx).or(literal('')).nullable(),
        primaryPhone: string().regex(phoneRegEx).or(literal('')).nullable(),
        name: string().or(literal('')).nullable(),
        avatar: string().url().or(literal('')).nullable(),
        customData: jsonObjectGuard,
        profile: userProfileGuard,
      }).partial(),
      response: userProfileResponseGuard,
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body,
      } = ctx.guard;

      await findUserById(userId);
      await checkIdentifierCollision(body, userId);

      const updatedUser = await updateUserById(userId, body, 'replace');
      ctx.body = pick(updatedUser, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    '/users/:userId/password',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ password: string().min(1) }),
      response: userProfileResponseGuard,
      status: [200, 422],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { password },
      } = ctx.guard;

      await findUserById(userId);

      const { passwordEncrypted, passwordEncryptionMethod } = await encryptUserPassword(password);

      const user = await updateUserById(userId, {
        passwordEncrypted,
        passwordEncryptionMethod,
      });

      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );

  router.post(
    '/users/:userId/password/verify',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ password: string().min(1) }),
      status: [204, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { password },
      } = ctx.guard;

      const user = await findUserById(userId);
      await verifyUserPassword(user, password);

      ctx.status = 204;

      return next();
    }
  );

  router.get(
    '/users/:userId/has-password',
    koaGuard({
      params: object({ userId: string() }),
      response: object({ hasPassword: boolean() }),
      status: [200, 404],
    }),
    async (ctx, next) => {
      const { userId } = ctx.guard.params;
      const user = await findUserById(userId);

      ctx.body = {
        hasPassword: Boolean(user.passwordEncrypted),
      };

      return next();
    }
  );

  router.patch(
    '/users/:userId/is-suspended',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ isSuspended: boolean() }),
      response: userProfileResponseGuard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { isSuspended },
      } = ctx.guard;

      await findUserById(userId);

      const user = await updateUserById(userId, {
        isSuspended,
      });

      if (isSuspended) {
        await revokeInstanceByUserId('refreshToken', user.id);
      }

      ctx.body = pick(user, ...userInfoSelectFields);

      // eslint-disable-next-line max-lines
      return next();
    }
  );

  router.delete(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
      status: [204, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      if (userId === ctx.auth.id) {
        throw new RequestError('user.cannot_delete_self');
      }

      await deleteUserById(userId);

      ctx.status = 204;

      return next();
    }
  );
}
