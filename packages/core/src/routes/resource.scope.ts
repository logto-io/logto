import { Scopes, isManagementApi } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { tryThat } from '@silverhand/essentials';
import { object, string } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function resourceScopeRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries,
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  const {
    resources: { findResourceById },
    scopes: {
      countScopesByResourceId,
      deleteScopeById,
      searchScopesByResourceId,
      findScopeByNameAndResourceId,
      insertScope,
      updateScopeById,
    },
  } = queries;

  router.get(
    '/resources/:resourceId/scopes',
    koaPagination(),
    koaGuard({
      params: object({ resourceId: string().min(1) }),
      status: [200, 400],
      response: Scopes.guard.array(),
    }),
    async (ctx, next) => {
      const {
        params: { resourceId },
      } = ctx.guard;
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);

          const [{ count }, scopes] = await Promise.all([
            countScopesByResourceId(resourceId, search),
            searchScopesByResourceId(resourceId, search, limit, offset),
          ]);

          // Return totalCount to pagination middleware
          ctx.pagination.totalCount = count;
          ctx.body = scopes;

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
    '/resources/:resourceId/scopes',
    koaGuard({
      params: object({ resourceId: string().min(1) }),
      body: Scopes.createGuard.pick({ name: true, description: true }),
      response: Scopes.guard,
      status: [201, 422, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { resourceId },
        body,
      } = ctx.guard;

      await quota.guardEntityScopesUsage('resources', resourceId);

      assertThat(!/\s/.test(body.name), 'scope.name_with_space');

      const { indicator } = await findResourceById(resourceId);
      assertThat(
        !isManagementApi(indicator),
        new RequestError({ code: 'resource.cannot_modify_management_api' })
      );

      assertThat(
        !(await findScopeByNameAndResourceId(body.name, resourceId)),
        new RequestError({
          code: 'scope.name_exists',
          name: body.name,
          status: 422,
        })
      );

      ctx.status = 201;
      ctx.body = await insertScope({
        ...body,
        id: generateStandardId(),
        resourceId,
      });

      return next();
    }
  );

  router.patch(
    '/resources/:resourceId/scopes/:scopeId',
    koaGuard({
      params: object({ resourceId: string().min(1), scopeId: string().min(1) }),
      body: Scopes.createGuard.pick({ name: true, description: true }).partial(),
      response: Scopes.guard,
      status: [200, 400, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { scopeId, resourceId },
        body,
      } = ctx.guard;

      const { indicator } = await findResourceById(resourceId);
      assertThat(
        !isManagementApi(indicator),
        new RequestError({ code: 'resource.cannot_modify_management_api' })
      );

      if (body.name) {
        assertThat(!/\s/.test(body.name), 'scope.name_with_space');
        assertThat(
          !(await findScopeByNameAndResourceId(body.name, resourceId, scopeId)),
          new RequestError({
            code: 'scope.name_exists',
            name: body.name,
            status: 422,
          })
        );
      }

      ctx.body = await updateScopeById(scopeId, body);

      return next();
    }
  );

  router.delete(
    '/resources/:resourceId/scopes/:scopeId',
    koaGuard({
      params: object({ resourceId: string().min(1), scopeId: string().min(1) }),
      status: [204, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { scopeId, resourceId },
      } = ctx.guard;

      const { indicator } = await findResourceById(resourceId);
      assertThat(
        !isManagementApi(indicator),
        new RequestError({ code: 'resource.cannot_modify_management_api' })
      );

      await deleteScopeById(scopeId);

      ctx.status = 204;

      return next();
    }
  );
}
