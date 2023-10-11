import { type Organization, Organizations, type CreateOrganization } from '@logto/schemas';
import { generateStandardId, type OmitAutoSetFields } from '@logto/shared';

import { buildDeleteByIdWithPool } from '#src/database/delete-by-id.js';
import { buildFindAllEntitiesWithPool } from '#src/database/find-all-entities.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildGetTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import TenantQueries from '#src/utils/TenantQueries.js';

export default class OrganizationQueries extends TenantQueries {
  #findTotalNumber = buildGetTotalRowCountWithPool(this.pool, Organizations.table);
  #findAll = buildFindAllEntitiesWithPool(this.pool)(Organizations);
  #findById = buildFindEntityByIdWithPool(this.pool)(Organizations);
  #insert = buildInsertIntoWithPool(this.pool)(Organizations, { returning: true });
  #updateById = buildUpdateWhereWithPool(this.pool)(Organizations, true);
  #deleteById = buildDeleteByIdWithPool(this.pool, Organizations.table);

  async findTotalNumber(): Promise<number> {
    const { count } = await this.#findTotalNumber();
    return count;
  }

  async findAll(limit: number, offset: number): Promise<readonly Organization[]> {
    return this.#findAll(limit, offset);
  }

  async findById(id: string): Promise<Readonly<Organization>> {
    return this.#findById(id);
  }

  async insert(
    data: Omit<OmitAutoSetFields<CreateOrganization>, 'id'>
  ): Promise<Readonly<Organization>> {
    return this.#insert({ id: generateStandardId(), ...data });
  }

  async updateById(
    id: string,
    data: Partial<OmitAutoSetFields<Organization>>,
    jsonbMode: 'replace' | 'merge' = 'replace'
  ): Promise<Readonly<Organization>> {
    return this.#updateById({ set: data, where: { id }, jsonbMode });
  }

  async deleteById(id: string): Promise<void> {
    await this.#deleteById(id);
  }
}
