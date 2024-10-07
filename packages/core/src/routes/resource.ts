import { isManagementApi, Resources, Scopes } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { yes } from '@silverhand/essentials';
import { boolean, object, string } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import { koaQuotaGuard, koaReportSubscriptionUpdates } from '#src/middleware/koa-quota-guard.js';
import assertThat from '#src/utils/assert-that.js';
import { attachScopesToResources } from '#src/utils/resource.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

export default function resourceRoutes<T extends ManagementApiRouter>(
  ...[
    router,
    {
      queries,
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
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
    scopes: scopeQueries,
  } = queries;

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
        ctx.body = yes(includeScopes)
          ? await attachScopesToResources(resources, scopeQueries)
          : resources;

        return next();
      }

      const [{ count }, resources] = await Promise.all([
        findTotalNumberOfResources(),
        findAllResources(limit, offset),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = yes(includeScopes)
        ? await attachScopesToResources(resources, scopeQueries)
        : resources;

      return next();
    }
  );

  router.post(
    '/resources',
    koaQuotaGuard({ key: 'resourcesLimit', quota }),
    koaGuard({
      // Intentionally omit `isDefault` since it'll affect other rows.
      // Use the dedicated API `PATCH /resources/:id/is-default` to update.
      body: Resources.createGuard.omit({ id: true, isDefault: true }),
      response: Resources.guard.extend({ scopes: Scopes.guard.array().optional() }),
      status: [201, 422],
    }),
    koaReportSubscriptionUpdates({
      key: 'resourcesLimit',
      quota,
      methods: ['POST'],
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
        id: generateStandardId(),
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
      status: [200, 400, 404],
    }),
    async (ctx, next) => {
      const {
        params: { id },
        body,
      } = ctx.guard;

      const { indicator } = await findResourceById(id);
      assertThat(
        !isManagementApi(indicator),
        new RequestError({ code: 'resource.cannot_modify_management_api' })
      );

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
    koaGuard({ params: object({ id: string().min(1) }), status: [204, 400, 404] }),
    koaReportSubscriptionUpdates({
      key: 'resourcesLimit',
      quota,
      methods: ['DELETE'],
    }),
    async (ctx, next) => {
      const { id } = ctx.guard.params;

      const { indicator } = await findResourceById(id);
      assertThat(
        !isManagementApi(indicator),
        new RequestError({ code: 'resource.cannot_delete_management_api' })
      );

      await deleteResourceById(id);
      ctx.status = 204;

      return next();
    }
  );
}
