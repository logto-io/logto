import {
  type CreateOrganizationRole,
  OrganizationRoles,
  organizationRoleWithScopesGuard,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import koaPagination from '#src/middleware/koa-pagination.js';
import SchemaRouter from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

import { errorHandler } from './utils.js';

export default function organizationRoleRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: {
          roles,
          relations: { rolesScopes },
        },
      },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationRoles, roles, {
    disabled: { get: true, post: true },
    errorHandler,
  });

  router.get(
    '/',
    koaPagination(),
    koaGuard({
      response: organizationRoleWithScopesGuard.array(),
      status: [200],
    }),
    async (ctx, next) => {
      const { limit, offset } = ctx.pagination;
      const [count, entities] = await Promise.all([
        roles.findTotalNumber(),
        roles.findAllWithScopes(limit, offset),
      ]);

      ctx.pagination.totalCount = count;
      ctx.body = entities;
      return next();
    }
  );

  /** Allows to carry an initial set of scopes for creating a new organization role. */
  type CreateOrganizationRolePayload = Omit<CreateOrganizationRole, 'id'> & {
    organizationScopeIds: string[];
  };

  const createGuard: z.ZodType<CreateOrganizationRolePayload, z.ZodTypeDef, unknown> =
    OrganizationRoles.createGuard
      .omit({
        id: true,
      })
      .extend({
        organizationScopeIds: z.array(z.string()).default([]),
      });

  router.post(
    '/',
    koaGuard({
      body: createGuard,
      response: OrganizationRoles.guard,
      status: [201, 422],
    }),
    async (ctx, next) => {
      const { organizationScopeIds: scopeIds, ...data } = ctx.guard.body;
      const role = await roles.insert({ id: generateStandardId(), ...data });

      if (scopeIds.length > 0) {
        await rolesScopes.insert(...scopeIds.map<[string, string]>((id) => [role.id, id]));
      }

      ctx.body = role;
      ctx.status = 201;
      return next();
    }
  );

  router.addRelationRoutes(rolesScopes, 'scopes');

  originalRouter.use(router.routes());
}
