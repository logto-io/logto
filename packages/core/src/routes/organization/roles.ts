import { type CreateOrganizationRole, OrganizationRoles } from '@logto/schemas';
import { z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';
import SchemaRouter, { SchemaActions } from '#src/utils/SchemaRouter.js';

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
  const actions = new SchemaActions(roles);
  const router = new SchemaRouter(OrganizationRoles, actions, {
    disabled: { post: true },
    errorHandler,
  });

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
      const role = await actions.post(data);

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
