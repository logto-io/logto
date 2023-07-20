import { Resources, Scopes } from '@logto/schemas';
import { buildIdGenerator } from '@logto/shared';
import { tryThat, yes } from '@silverhand/essentials';
import { boolean, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaQuotaGuard from '#src/middleware/koa-quota-guard.js';
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
      findResourceByIndicator,
      setDefaultResource,
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
      response: Resources.guard.extend({ scopes: Scopes.guard.array().optional() }).array(),
      status: [200],
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
    koaQuotaGuard({ key: 'resourcesLimit', quota: libraries.quota }),
    koaGuard({
      // Intentionally omit `isDefault` since it'll affect other rows.
      // Use the dedicated API `PATCH /resources/:id/is-default` to update.
      body: Resources.createGuard.omit({ id: true, isDefault: true }),
      response: Resources.guard.extend({ scopes: Scopes.guard.array().optional() }),
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { body } = ctx.guard;
      const { indicator } = body;

      assertThat(
        !(await findResourceByIndicator(indicator)),
        new RequestError({
          code: 'resource.resource_identifier_in_use',
          indicator,
          status: 422,
        })
      );

      const resource = await insertResource({
        id: resourceId(),
        ...body,
      });

      ctx.status = 201;
      ctx.body = { ...resource, scopes: [] };

      return next();
    }
  );

  router.get(
    '/resources/:id',
    koaGuard({
      params: object({ id: string().min(1) }),
      response: Resources.guard,
      status: [200, 404],
    }),
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
      // Intentionally omit `isDefault` since it'll affect other rows.
      // Use the dedicated API `PATCH /resources/:id/is-default` to update.
      body: Resources.createGuard.omit({ id: true, indicator: true, isDefault: true }).partial(),
      response: Resources.guard,
      status: [200, 404],
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

  router.patch(
    '/resources/:id/is-default',
    koaGuard({
      params: object({ id: string().min(1) }),
      body: object({ isDefault: boolean() }),
      response: Resources.guard,
      status: [200, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body: { isDefault },
      } = ctx.guard;

      // Only 0 or 1 default resource is allowed per tenant, so use a dedicated transaction query for setting the default.
      ctx.body = await (isDefault ? setDefaultResource(id) : updateResourceById(id, { isDefault }));

      return next();
    }
  );

  router.delete(
    '/resources/:id',
    koaGuard({ params: object({ id: string().min(1) }), status: [204, 404] }),
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

      assertThat(!/\s/.test(body.name), 'scope.name_with_space');

      assertThat(
        await findResourceById(resourceId),
        new RequestError({
          code: 'entity.not_exists_with_id',
          name: 'resource',
          id: resourceId,
          resourceId,
          status: 404,
        })
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
      body: Scopes.createGuard.pick({ name: true, description: true }).partial(),
      response: Scopes.guard,
      status: [200, 404, 422],
    }),
    async (ctx, next) => {
      const {
        params: { scopeId, resourceId },
        body,
      } = ctx.guard;

      assertThat(
        await findResourceById(resourceId),
        new RequestError({
          code: 'entity.not_exists_with_id',
          name: 'resource',
          id: resourceId,
          resourceId,
          status: 404,
        })
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
      status: [204, 404],
    }),
    async (ctx, next) => {
      const {
        params: { scopeId },
      } = ctx.guard;

      await deleteScopeById(scopeId);

      ctx.status = 204;

      return next();
    }
  );
}
