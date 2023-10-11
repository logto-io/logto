import { type CreateOrganization, type Organization, Organizations } from '@logto/schemas';
import { type OmitAutoSetFields } from '@logto/shared';

import { type Pagination } from '#src/middleware/koa-pagination.js';
import type OrganizationQueries from '#src/queries/organizations.js';
import SchemaRouter, { type SchemaActions } from '#src/utils/SchemaRouter.js';

import { type AuthedRouter, type RouterInitArgs } from './types.js';

type PostSchema = Omit<OmitAutoSetFields<CreateOrganization>, 'id'>;
type PatchSchema = Partial<Omit<OmitAutoSetFields<Organization>, 'id'>>;

class OrganizationActions
  implements SchemaActions<CreateOrganization, Organization, PostSchema, PatchSchema>
{
  postGuard = Organizations.createGuard.omit({ id: true, createdAt: true });
  patchGuard = Organizations.guard.omit({ id: true, createdAt: true }).partial();

  constructor(public readonly queries: OrganizationQueries) {}

  public async get({ limit, offset }: Pick<Pagination, 'limit' | 'offset'>) {
    return Promise.all([this.queries.findTotalNumber(), this.queries.findAll(limit, offset)]);
  }

  public async getById(id: string) {
    return this.queries.findById(id);
  }

  public async post(data: PostSchema) {
    return this.queries.insert(data);
  }

  public async patchById(id: string, data: PatchSchema) {
    return this.queries.updateById(id, data);
  }

  public async deleteById(id: string) {
    return this.queries.deleteById(id);
  }
}

export default function organizationRoutes<T extends AuthedRouter>(
  ...[
    originalRouter,
    {
      queries: { organizations },
    },
  ]: RouterInitArgs<T>
) {
  const router = new SchemaRouter(Organizations, new OrganizationActions(organizations));

  originalRouter.use(router.routes());
}
