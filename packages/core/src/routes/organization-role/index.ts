import {
  OrganizationRoles,
  organizationRoleWithScopesGuard,
  type CreateOrganizationRole,
  type OrganizationRole,
  type OrganizationRoleKeys,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';
import { buildManagementApiContext } from '#src/libraries/hook/utils.js';
import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import koaQuotaGuard, { newKoaQuotaGuard } from '#src/middleware/koa-quota-guard.js';
import { organizationRoleSearchKeys } from '#src/queries/organization/index.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';
import { parseSearchOptions } from '#src/utils/search.js';

import { errorHandler } from '../organization/utils.js';
import {
  type ManagementApiRouter,
  type ManagementApiRouterContext,
  type RouterInitArgs,
} from '../types.js';

export default function organizationRoleRoutes<T extends ManagementApiRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: {
          roles,
          relations: { rolesScopes, rolesResourceScopes },
        },
      },
      libraries: { quota },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter<
    OrganizationRoleKeys,
    CreateOrganizationRole,
    OrganizationRole,
    unknown,
    ManagementApiRouterContext
  >(OrganizationRoles, roles, {
    middlewares: [
      EnvSet.values.isDevFeaturesEnabled
        ? newKoaQuotaGuard({ key: 'organizationsEnabled', quota, methods: ['POST', 'PUT'] })
        : koaQuotaGuard({ key: 'organizationsEnabled', quota, methods: ['POST', 'PUT'] }),
    ],
    disabled: { get: true, post: true },
    errorHandler,
    searchFields: ['name'],
  });

  router.get(
    '/',
    koaPagination(),
    koaGuard({
      query: z.object({ q: z.string().optional() }),
      response: organizationRoleWithScopesGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const search = parseSearchOptions(organizationRoleSearchKeys, ctx.guard.query);
      const [count, entities] = await roles.findAll(limit, offset, search);

      ctx.pagination.totalCount = count;
      ctx.body = entities;
      return next();
    }
  );

  /** Allows to carry an initial set of scopes for creating a new organization role. */
  type CreateOrganizationRolePayload = Omit<CreateOrganizationRole, 'id'> & {
    organizationScopeIds: string[];
    resourceScopeIds: string[];
  };

  const createGuard: z.ZodType<CreateOrganizationRolePayload, z.ZodTypeDef, unknown> =
    OrganizationRoles.createGuard
      .omit({
        id: true,
      })
      .extend({
        organizationScopeIds: z.array(z.string()).default([]),
        resourceScopeIds: z.array(z.string()).default([]),
      });

  router.post(
    '/',
    koaGuard({
      body: createGuard,
      response: OrganizationRoles.guard,
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { organizationScopeIds, resourceScopeIds, ...data } = ctx.guard.body;
      const role = await roles.insert({ id: generateStandardId(), ...data });

      if (organizationScopeIds.length > 0) {
        await rolesScopes.insert(
          ...organizationScopeIds.map((id) => ({
            organizationRoleId: role.id,
            organizationScopeId: id,
          }))
        );
      }

      if (resourceScopeIds.length > 0) {
        await rolesResourceScopes.insert(
          ...resourceScopeIds.map((id) => ({
            organizationRoleId: role.id,
            scopeId: id,
          }))
        );
      }

      ctx.body = role;
      ctx.status = 201;

      // Trigger `OrganizationRole.Scope.Updated` event if organizationScopeIds or resourceScopeIds are provided.
      if (organizationScopeIds.length > 0 || resourceScopeIds.length > 0) {
        ctx.appendDataHookContext('OrganizationRole.Scopes.Updated', {
          ...buildManagementApiContext(ctx),
          organizationRoleId: role.id,
        });
      }

      return next();
    }
  );

  router.addRelationRoutes(rolesScopes, 'scopes');
  router.addRelationRoutes(rolesResourceScopes, 'resource-scopes');

  originalRouter.use(router.routes());
}
