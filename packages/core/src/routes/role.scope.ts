import { scopeResponseGuard, Scopes } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { tryThat } from '@silverhand/essentials';
import { object, string } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function roleScopeRoutes<T extends ManagementApiRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    rolesScopes: { deleteRolesScope, findRolesScopesByRoleId, insertRolesScopes },
    roles: { findRoleById },
    scopes: { findScopesByIds, countScopesByScopeIds, searchScopesByScopeIds },
  } = queries;
  const {
    quota,
    roleScopes: { validateRoleScopeAssignment },
    scopes: { attachResourceToScopes },
  } = libraries;

  router.get(
    '/roles/:id/scopes',
    koaPagination({ isOptional: true }),
    koaGuard({
      params: object({ id: string().min(1) }),
      response: scopeResponseGuard.array(),
      status: [200, 400, 404],
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
            const scopes = await searchScopesByScopeIds(scopeIds, search);

            ctx.body = await attachResourceToScopes(scopes);

            return next();
          }

          const [{ count }, scopes] = await Promise.all([
            countScopesByScopeIds(scopeIds, search),
            searchScopesByScopeIds(scopeIds, search, limit, offset),
          ]);

          // Return totalCount to pagination middleware
          ctx.pagination.totalCount = count;
          ctx.body = await attachResourceToScopes(scopes);

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
      body: object({ scopeIds: string().min(1).array().nonempty() }),
      response: Scopes.guard.array(),
      status: [201, 400, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { scopeIds },
      } = ctx.guard;

      await (EnvSet.values.isDevFeaturesEnabled
        ? quota.guardEntityScopesUsage('roles', id)
        : quota.guardKey('scopesPerRoleLimit', id));

      await validateRoleScopeAssignment(scopeIds, id);
      await insertRolesScopes(
        scopeIds.map((scopeId) => ({ id: generateStandardId(), roleId: id, scopeId }))
      );

      /**
       * @deprecated
       *  Align with organization role scopes assignment.
       *  All relation assignment should not return the entity details at the body
       **/
      const newRolesScopes = await findRolesScopesByRoleId(id);
      const scopes = await findScopesByIds(newRolesScopes.map(({ scopeId }) => scopeId));
      ctx.body = scopes;
      ctx.status = 201;

      return next();
    }
  );

  router.delete(
    '/roles/:id/scopes/:scopeId',
    koaGuard({
      params: object({ id: string().min(1), scopeId: string().min(1) }),
      status: [204, 404],
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
