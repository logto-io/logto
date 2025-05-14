/* eslint-disable max-lines */
import { emailRegEx, phoneRegEx, usernameRegEx } from '@logto/core-kit';
import {
  UsersPasswordEncryptionMethod,
  jsonObjectGuard,
  userProfileGuard,
  userProfileResponseGuard,
} from '@logto/schemas';
import { conditional, yes } from '@silverhand/essentials';
import { boolean, literal, nativeEnum, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import { buildManagementApiContext } from '#src/libraries/hook/utils.js';
import { encryptUserPassword } from '#src/libraries/user.utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import assertThat from '#src/utils/assert-that.js';

import { parseLegacyPassword } from '../../utils/password.js';
import { transpileUserProfileResponse } from '../../utils/user.js';
import type { ManagementApiRouter, RouterInitArgs } from '../types.js';

export default function adminUserBasicsRoutes<T extends ManagementApiRouter>(
  ...args: RouterInitArgs<T>
) {
  const [router, { queries, libraries }] = args;
  const {
    users: {
      deleteUserById,
      findUserById,
      hasUser,
      updateUserById,
      hasUserWithEmail,
      hasUserWithNormalizedPhone,
    },
  } = queries;
  const {
    users: {
      checkIdentifierCollision,
      generateUserId,
      insertUser,
      verifyUserPassword,
      signOutUser,
      findUserSsoIdentities,
    },
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
        query: { includeSsoIdentities = 'false' },
      } = ctx.guard;

      const user = await findUserById(userId);

      ctx.body = transpileUserProfileResponse(user, {
        ssoIdentities: conditional(
          yes(includeSsoIdentities) && [...(await findUserSsoIdentities(userId))]
        ),
      });

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
        !primaryPhone || !(await hasUserWithNormalizedPhone(primaryPhone)),
        new RequestError({ code: 'user.phone_already_in_use', status: 422 })
      );

      if (passwordAlgorithm === UsersPasswordEncryptionMethod.Legacy) {
        parseLegacyPassword(passwordDigest);
      }

      const id = await generateUserId();

      const [user] = await insertUser(
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

      ctx.body = transpileUserProfileResponse(user);
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
      ctx.body = transpileUserProfileResponse(updatedUser);

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

      ctx.body = transpileUserProfileResponse(user);

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
        await signOutUser(user.id);
      }

      ctx.body = transpileUserProfileResponse(user);

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

      const user = await findUserById(userId);

      await signOutUser(userId);
      await deleteUserById(userId);

      ctx.status = 204;

      // Manually trigger the `User.Deleted` hook since we need to send the user data in the payload
      ctx.appendDataHookContext('User.Deleted', {
        ...buildManagementApiContext(ctx),
        user,
      });

      return next();
    }
  );
}
/* eslint-enable max-lines */
