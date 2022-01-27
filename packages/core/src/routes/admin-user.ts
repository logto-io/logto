import { userInfoSelectFields } from '@logto/schemas';
import pick from 'lodash.pick';
import { InvalidInputError } from 'slonik';
import { object, string } from 'zod';

import koaGuard from '@/middleware/koa-guard';
import { findRolesByRoleName } from '@/queries/roles';
import { findUserById, updateUserById } from '@/queries/user';

import { AuthedRouter } from './types';

export default function adminUserRoutes<T extends AuthedRouter>(router: T) {
  router.patch(
    '/users/:userId/roles',
    koaGuard({
      params: object({ userId: string().min(1) }),
      body: object({ roleNames: string().array().nullable() }),
    }),
    async (ctx, next) => {
      const {
        params: { userId },
        body: { roleNames },
      } = ctx.guard;

      await findUserById(userId);

      // Temp solution to validate the existence of input roleNames
      if (roleNames?.length) {
        const roles = await findRolesByRoleName(roleNames);
        if (roles.length !== roleNames.length) {
          const resourcesNotFound = roleNames.filter(
            (rolesNames) => !roles.some(({ name }) => name === rolesNames)
          );
          throw new InvalidInputError(`role names (${resourcesNotFound.join(',')}) are not valid`);
        }
      }

      const user = await updateUserById(userId, { roleNames });
      ctx.body = pick(user, ...userInfoSelectFields);
      return next();
    }
  );
}
