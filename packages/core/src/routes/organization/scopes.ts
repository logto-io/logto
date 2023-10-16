import {
  type CreateOrganizationScope,
  type OrganizationScope,
  type OrganizationScopeKeys,
  OrganizationScopes,
} from '@logto/schemas';
import { UniqueIntegrityConstraintViolationError } from 'slonik';

import RequestError from '#src/errors/RequestError/index.js';
import SchemaRouter, { SchemaActions } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from '../types.js';

export class OrganizationScopeActions extends SchemaActions<
  OrganizationScopeKeys,
  CreateOrganizationScope,
  OrganizationScope
> {
  override async post(
    data: Omit<CreateOrganizationScope, 'id'>
  ): Promise<Readonly<OrganizationScope>> {
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

export default function organizationScopeRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: {
        organizations: { scopes },
      },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(OrganizationScopes, new OrganizationScopeActions(scopes));

  originalRouter.use(router.routes());
}
