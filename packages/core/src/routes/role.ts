import { buildIdGenerator } from '@logto/core-kit';
import { Roles } from '@logto/schemas';
import { object, string } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import {
  deleteRoleById,
  findAllRoles,
  findRoleById,
  findRoleByRoleName,
  insertRole,
  updateRoleById,
} from '#src/queries/roles.js';
import assertThat from '#src/utils/assert-that.js';

import type { AuthedRouter } from './types.js';

const roleId = buildIdGenerator(21);

export default function roleRoutes<T extends AuthedRouter>(router: T) {
  router.get('/roles', async (ctx, next) => {
    ctx.body = await findAllRoles();

    return next();
  });

  router.post(
    '/roles',
    koaGuard({
      body: Roles.createGuard.omit({ id: true }),
    }),
    async (ctx, next) => {
      const {
        body,
        body: { name },
      } = ctx.guard;

      assertThat(!(await findRoleByRoleName(name)), 'role.name_in_use');

      ctx.body = await insertRole({
        ...body,
        id: roleId(),
      });

      return next();
    }
  );

  router.get(
    '/roles/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      ctx.body = await findRoleById(id);

      return next();
    }
  );

  router.patch(
    '/roles/:id',
    koaGuard({
      body: Roles.createGuard.pick({ name: true, description: true }).partial(),
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        body,
        body: { name },
        params: { id },
      } = ctx.guard;

      await findRoleById(id);
      assertThat(!name || !(await findRoleByRoleName(name, id)), 'role.name_in_use');
      ctx.body = await updateRoleById(id, body);

      return next();
    }
  );

  router.delete(
    '/roles/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      await deleteRoleById(id);
      ctx.status = 204;

      return next();
    }
  );
}
