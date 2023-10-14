import {
  type CreateOrganizationRole,
  type OrganizationRole,
  type OrganizationRoleKeys,
  OrganizationRoles,
  OrganizationScopes,
} from '@logto/schemas';
import { UniqueIntegrityConstraintViolationError } from 'slonik';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaGuard from '#src/middleware/koa-guard.js';
import SchemaRouter, { SchemaActions } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from './types.js';

class OrganizationRoleActions extends SchemaActions<
  OrganizationRoleKeys,
  CreateOrganizationRole,
  OrganizationRole
> {
  override async post(
    data: Omit<CreateOrganizationRole, 'id'>
  ): Promise<Readonly<OrganizationRole>> {
    try {
      return await super.post(data);
    } catch (error: unknown) {
      if (error instanceof UniqueIntegrityConstraintViolationError) {
        throw new RequestError({ code: 'entity.duplicate_value_of_unique_field', field: 'name' });
      }

      throw error;
    }
  }
}

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
  const actions = new OrganizationRoleActions(roles);
  const router = new SchemaRouter(OrganizationRoles, actions, { disabled: { post: true } });

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

  router.addRelationRoutes(OrganizationScopes, rolesScopes, 'scopes');

  originalRouter.use(router.routes());
}
