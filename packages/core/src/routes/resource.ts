import { Resources, Scopes } from '@logto/schemas';
import { buildIdGenerator } from '@logto/shared';
import { tryThat, yes } from '@silverhand/essentials';
import { object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import assertThat from '#src/utils/assert-that.js';
import { parseSearchParamsForSearch } from '#src/utils/search.js';

import type { AuthedRouter, RouterInitArgs } from './types.js';

const resourceId = buildIdGenerator(21);
const scopeId = resourceId;

export default function resourceRoutes<T extends AuthedRouter>(
  ...[router, { queries, libraries }]: RouterInitArgs<T>
) {
  const {
    resources: {
      findTotalNumberOfResources,
      findAllResources,
      findResourceById,
      insertResource,
      updateResourceById,
      deleteResourceById,
    },
    scopes: {
      countScopesByResourceId,
      deleteScopeById,
      searchScopesByResourceId,
      findScopeByNameAndResourceId,
      insertScope,
      updateScopeById,
    },
  } = queries;
  const { attachScopesToResources } = libraries.resources;

  router.get(
    '/resources',
    koaPagination({ isOptional: true }),
    koaGuard({
      query: object({
        includeScopes: string().optional(),
      }),
    }),
    async (ctx, next) => {
      const { limit, offset, disabled } = ctx.pagination;
      const {
        query: { includeScopes },
      } = ctx.guard;

      if (disabled) {
        const resources = await findAllResources();
        ctx.body = yes(includeScopes) ? await attachScopesToResources(resources) : resources;

        return next();
      }

      const [{ count }, resources] = await Promise.all([
        findTotalNumberOfResources(),
        findAllResources(limit, offset),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = yes(includeScopes) ? await attachScopesToResources(resources) : resources;

      return next();
    }
  );

  router.post(
    '/resources',
    koaGuard({
      body: Resources.createGuard.omit({ id: true }),
    }),
    async (ctx, next) => {
      const resource = await insertResource({
        id: resourceId(),
        ...ctx.guard.body,
      });

      ctx.body = { ...resource, scopes: [] };

      return next();
    }
  );

  router.get(
    '/resources/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { id },
      } = ctx.guard;

      const resource = await findResourceById(id);
      ctx.body = resource;

      return next();
    }
  );

  router.patch(
    '/resources/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: Resources.createGuard.omit({ id: true }).partial(),
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const resource = await updateResourceById(id, body);
      ctx.body = resource;

      return next();
    }
  );

  router.delete(
    '/resources/:id',
    koaGuard({ params: object({ id: string().min(1) }) }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;
      await deleteResourceById(id);
      ctx.status = 204;

      return next();
    }
  );

  router.get(
    '/resources/:resourceId/scopes',
    koaPagination(),
    koaGuard({ params: object({ resourceId: string().min(1) }) }),
    async (ctx, next) => {
      const {
        params: { resourceId },
      } = ctx.guard;
      const { limit, offset } = ctx.pagination;
      const { searchParams } = ctx.request.URL;

      return tryThat(
        async () => {
          const search = parseSearchParamsForSearch(searchParams);

          const [{ count }, roles] = await Promise.all([
            countScopesByResourceId(resourceId, search),
            searchScopesByResourceId(resourceId, search, limit, offset),
          ]);

          // Return totalCount to pagination middleware
          ctx.pagination.totalCount = count;
          ctx.body = roles;

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
    }),
    async (ctx, next) => {
      const {
        params: { resourceId },
        body,
      } = ctx.guard;

      assertThat(!/\s/.test(body.name), 'scope.name_with_space');

      assertThat(
        !(await findScopeByNameAndResourceId(body.name, resourceId)),
        new RequestError({
          code: 'scope.name_exists',
          name: body.name,
          status: 422,
        })
      );

      ctx.body = await insertScope({
        ...body,
        id: scopeId(),
        resourceId,
      });

      return next();
    }
  );

  router.patch(
    '/resources/:resourceId/scopes/:scopeId',
    koaGuard({
      params: object({ resourceId: string().min(1), scopeId: string().min(1) }),
      body: Scopes.createGuard.pick({ name: true, description: true }),
    }),
    async (ctx, next) => {
      const {
        params: { scopeId, resourceId },
        body,
      } = ctx.guard;

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
    }),
    async (ctx, next) => {
      const {
        params: { resourceId, scopeId },
      } = ctx.guard;

      await deleteScopeById(scopeId);

      ctx.status = 204;

      return next();
    }
  );
}
