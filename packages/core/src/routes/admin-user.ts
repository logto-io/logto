import { emailRegEx, passwordRegEx, phoneRegEx, usernameRegEx } from '@logto/core-kit';
import { arbitraryObjectGuard, userInfoSelectFields, UserRole } from '@logto/schemas';
import { tryThat } from '@logto/shared';
import { conditional, deduplicate, has, pick } from '@silverhand/essentials';
import { boolean, literal, object, string } from 'zod';

import { isTrue } from '#src/env-set/parameters.js';
import RequestError from '#src/errors/RequestError/index.js';
import { encryptUserPassword } from '#src/libraries/user.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function adminUserRoutes<T extends AuthedRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    oidcModelInstances: { revokeInstanceByUserId },
    roles: { findRolesByRoleNames },
    users: {
      deleteUserById,
      deleteUserIdentity,
      findUsers,
      countUsers,
      findUserById,
      hasUser,
      updateUserById,
      hasUserWithEmail,
      hasUserWithPhone,
      findUsersByRoleName,
    },
    usersRoles: { deleteUsersRolesByUserIdAndRoleId, findUsersRolesByRoleId, insertUsersRoles },
  } = queries;
  const {
    users: { checkIdentifierCollision, generateUserId, insertUser },
  } = libraries;

  router.get('/users', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;
    const { searchParams } = ctx.request.URL;

    return tryThat(
      async () => {
        const search = parseSearchParamsForSearch(searchParams);
        const hideAdminUser = isTrue(searchParams.get('hideAdminUser'));
        const excludeRoleId = searchParams.get('excludeRoleId');
        const excludeUsersRoles = excludeRoleId ? await findUsersRolesByRoleId(excludeRoleId) : [];
        const excludeUserIdsByRole = excludeUsersRoles.map(({ userId }) => userId);
        const adminUsers = hideAdminUser ? await findUsersByRoleName(UserRole.Admin) : [];
        const excludeUserIdsByAdmin = adminUsers.map(({ id }) => id);
        const excludeUserIds = deduplicate([...excludeUserIdsByRole, ...excludeUserIdsByAdmin]);

        const [{ count }, users] = await Promise.all([
          countUsers(search, excludeUserIds),
          findUsers(limit, offset, search, excludeUserIds),
        ]);

        ctx.pagination.totalCount = count;
        ctx.body = users.map((user) => pick(user, ...userInfoSelectFields));

        return next();
      },
      (error) => {
        if (error instanceof TypeError) {
          throw new RequestError({ code: 'request.invalid_input', details: error.message }, error);
        }
        throw error;
      }
    );
  });

  router.get(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      const user = await findUserById(userId);

      ctx.body = pick(user, 'roleNames', ...userInfoSelectFields);

      return next();
    }
  );

  router.get(
    '/users/:userId/custom-data',
    koaGuard({
      params: object({ userId: string() }),
      response: arbitraryObjectGuard,
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
      body: object({ customData: arbitraryObjectGuard }),
      response: arbitraryObjectGuard,
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

  router.post(
    '/users',
    koaGuard({
      body: object({
        primaryPhone: string().regex(phoneRegEx),
        primaryEmail: string().regex(emailRegEx),
        username: string().regex(usernameRegEx),
        password: string().regex(passwordRegEx),
        isAdmin: boolean(),
        name: string(),
      }).partial(),
    }),
    async (ctx, next) => {
      const { primaryEmail, primaryPhone, username, password, name, isAdmin } = ctx.guard.body;

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
        new RequestError({ code: 'user.phone_already_in_use' })
      );

      const id = await generateUserId();

      const user = await insertUser({
        id,
        primaryEmail,
        primaryPhone,
        username,
        name,
        roleNames: conditional(isAdmin && [UserRole.Admin]),
        ...conditional(password && (await encryptUserPassword(password))),
      });

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
        customData: arbitraryObjectGuard,
        roleNames: string().array(),
      }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body,
      } = ctx.guard;

      const user = await findUserById(userId);
      await checkIdentifierCollision(body, userId);

      const { roleNames, ...userUpdates } = body;

      // Temp solution to validate the existence of input roleNames
      if (roleNames) {
        const roles = await findRolesByRoleNames(roleNames);

        // Insert new roles
        const newRoles = roleNames.filter((roleName) => !user.roleNames.includes(roleName));

        if (newRoles.length > 0) {
          await insertUsersRoles(
            newRoles.map((roleName) => {
              const role = roles.find(({ name }) => name === roleName);

              if (!role) {
                throw new RequestError({
                  status: 400,
                  code: 'user.invalid_role_names',
                  data: {
                    roleNames: roleName,
                  },
                });
              }

              return {
                userId: user.id,
                roleId: role.id,
              };
            })
          );
        }

        // Remove old roles
        const oldRoles = user.roleNames.filter((roleName) => !roleNames.includes(roleName));

        await Promise.all(
          oldRoles.map(async (roleName) => {
            const role = roles.find(({ name }) => name === roleName);

            if (role) {
              await deleteUsersRolesByUserIdAndRoleId(user.id, role.id);
            }
          })
        );
      }

      const updatedUser = await updateUserById(userId, userUpdates, 'replace');
      ctx.body = pick(updatedUser, ...userInfoSelectFields);

      return next();
    }
  );

  router.patch(
    '/users/:userId/password',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ password: string().regex(passwordRegEx) }),
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

  router.patch(
    '/users/:userId/is-suspended',
    koaGuard({
      params: object({ userId: string() }),
      body: object({ isSuspended: boolean() }),
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

      return next();
    }
  );

  router.delete(
    '/users/:userId',
    koaGuard({
      params: object({ userId: string() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
      } = ctx.guard;

      if (userId === ctx.auth.id) {
        throw new RequestError('user.cannot_delete_self');
      }

      await findUserById(userId);

      await deleteUserById(userId);

      ctx.status = 204;

      return next();
    }
  );

  router.delete(
    '/users/:userId/identities/:target',
    koaGuard({ params: object({ userId: string(), target: string() }) }),
    async (ctx, next) => {
      const {
        params: { userId, target },
      } = ctx.guard;

      const { identities } = await findUserById(userId);

      if (!has(identities, target)) {
        throw new RequestError({ code: 'user.identity_not_exist', status: 404 });
      }

      const updatedUser = await deleteUserIdentity(userId, target);
      ctx.body = pick(updatedUser, ...userInfoSelectFields);

      return next();
    }
  );
}
