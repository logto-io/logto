import { userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';
import { InvalidInputError } from 'slonik';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import koaPagination from '@/middleware/koa-pagination';
import { findRolesByRoleNames } from '@/queries/roles';
import { findAllUsers, findTotalNumberOfUsers, findUserById, updateUserById } from '@/queries/user';

import { AuthedRouter } from './types';

export default function adminUserRoutes<T extends AuthedRouter>(router: T) {
  router.get('/users', koaPagination(), async (ctx, next) => {
    const { limit, offset } = ctx.pagination;

    const [{ count }, users] = await Promise.all([
      findTotalNumberOfUsers(),
      findAllUsers(limit, offset),
    ]);

    ctx.pagination.totalCount = count;
    ctx.body = users.map((user) => pick(user, ...userInfoSelectFields));

    return next();
  });

  router.patch(
    '/users/:userId/roleNames',
    koaGuard({
      params: object({ userId: string().min(1) }),
      body: object({ roleNames: string().array() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { roleNames },
      } = ctx.guard;

      await findUserById(userId);

      // Temp solution to validate the existence of input roleNames
      if (roleNames.length > 0) {
        const roles = await findRolesByRoleNames(roleNames);

        if (roles.length !== roleNames.length) {
          const resourcesNotFound = roleNames.filter(
            (roleName) => !roles.some(({ name }) => roleName === name)
          );
          // TODO: Should be cached by the error handler and return request error
          throw new InvalidInputError(`role names (${resourcesNotFound.join(',')}) are not valid`);
        }
      }

      const user = await updateUserById(userId, { roleNames });
      ctx.body = pick(user, ...userInfoSelectFields);

      return next();
    }
  );
}
