import { generateStandardId } from '@logto/core-kit';
import type { ScopeResponse } from '@logto/schemas';
import { tryThat } from '@logto/shared';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

export default function roleScopeRoutes<T extends AuthedRouter>(
  ...[router, { queries }]: RouterInitArgs<T>
) {
  const {
    resources: { findResourcesByIds },
    rolesScopes: { deleteRolesScope, findRolesScopesByRoleId, insertRolesScopes },
    roles: { findRoleById },
    scopes: { findScopeById, findScopesByIds, countScopesByScopeIds, searchScopesByScopeIds },
  } = queries;

  router.get(
    '/roles/:id/scopes',
    koaPagination({ isOptional: true }),
    koaGuard({
      params: object({ id: string().min(1) }),
    }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;
      const { limit, offset, disabled } = ctx.pagination;
      const { searchParams } = ctx.request.URL;
      await findRoleById(id);

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);

          const rolesScopes = await findRolesScopesByRoleId(id);
          const scopeIds = rolesScopes.map(({ scopeId }) => scopeId);

          if (disabled) {
            ctx.body = await searchScopesByScopeIds(scopeIds, search);

            return next();
          }

          const [{ count }, scopes] = await Promise.all([
            countScopesByScopeIds(scopeIds, search),
            searchScopesByScopeIds(scopeIds, search, limit, offset),
          ]);

          const resources = await findResourcesByIds(scopes.map(({ resourceId }) => resourceId));
          const result: ScopeResponse[] = scopes.map((scope) => {
            const resource = resources.find(({ id }) => id === scope.resourceId);

            assertThat(resource, new Error(`Cannot find resource for id ${scope.resourceId}`));

            return {
              ...scope,
              resource,
            };
          });

          // Return totalCount to pagination middleware
          ctx.pagination.totalCount = count;
          ctx.body = result;

          return next();
        },
        (error) => {
          if (error instanceof TypeError) {
            throw new RequestError(
              { code: 'request.invalid_input', details: error.message },
              error
            );
          }
          throw error;
        }
      );
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
      await insertRolesScopes(
        scopeIds.map((scopeId) => ({ id: generateStandardId(), roleId: id, scopeId }))
      );

      const newRolesScopes = await findRolesScopesByRoleId(id);
      const scopes = await findScopesByIds(newRolesScopes.map(({ scopeId }) => scopeId));
      ctx.body = scopes;

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
