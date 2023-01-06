import { buildIdGenerator } from '@logto/core-kit';
import { Roles } from '@logto/schemas';
import { object, string, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import {
  deleteRolesScope,
  findRolesScopesByRoleId,
  insertRolesScopes,
} from '#src/queries/roles-scopes.js';
import {
  deleteRoleById,
  findAllRoles,
  findRoleById,
  findRoleByRoleName,
  insertRole,
  updateRoleById,
} from '#src/queries/roles.js';
import { findScopeById, findScopesByIds } from '#src/queries/scope.js';
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
      body: Roles.createGuard
        .omit({ id: true })
        .extend({ scopeIds: z.string().min(1).array().optional() }),
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { scopeIds, ...roleBody } = body;

      assertThat(
        !(await findRoleByRoleName(roleBody.name)),
        new RequestError({
          code: 'role.name_in_use',
          name: roleBody.name,
        })
      );

      const role = await insertRole({
        ...roleBody,
        id: roleId(),
      });

      if (scopeIds) {
        await Promise.all(scopeIds.map(async (scopeId) => findScopeById(scopeId)));
        await insertRolesScopes(scopeIds.map((scopeId) => ({ roleId: role.id, scopeId })));
      }

      ctx.body = role;

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

  router.get(
    '/roles/:id/scopes',
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      await findRoleById(id);
      const rolesScopes = await findRolesScopesByRoleId(id);
      ctx.body = await findScopesByIds(rolesScopes.map(({ scopeId }) => scopeId));

      return next();
    }
  );

  router.post(
    '/roles/:id/scopes',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: object({ scopeIds: string().min(1).array() }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { scopeIds },
      } = ctx.guard;

      await findRoleById(id);
      const rolesScopes = await findRolesScopesByRoleId(id);

      for (const scopeId of scopeIds) {
        assertThat(
          !rolesScopes.some(({ scopeId: _scopeId }) => _scopeId === scopeId),
          new RequestError({
            code: 'role.scope_exists',
            status: 422,
            scopeId,
          })
        );
      }

      await Promise.all(scopeIds.map(async (scopeId) => findScopeById(scopeId)));
      await insertRolesScopes(scopeIds.map((scopeId) => ({ roleId: id, scopeId })));
      ctx.status = 201;

      return next();
    }
  );

  router.delete(
    '/roles/:id/scopes/:scopeId',
    koaGuard({
      params: object({ id: string().min(1), scopeId: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id, scopeId },
      } = ctx.guard;
      await deleteRolesScope(id, scopeId);
      ctx.status = 204;

      return next();
    }
  );
}
