import { type GeneratedSchema } from '@logto/schemas';
import { type UpdateWhereData, type OmitAutoSetFields, type SchemaLike } from '@logto/shared';
import { type CommonQueryMethods } from 'slonik';

import { buildDeleteByIdWithPool } from '#src/database/delete-by-id.js';
import { buildFindAllEntitiesWithPool } from '#src/database/find-all-entities.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildGetTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';

/**
 * Query class that contains all the necessary CRUD queries for a schema. It is
 * designed to be used with a SchemaRouter. You can also extend this class to add
 * more queries.
 */
export default class SchemaQueries<
  Key extends string,
  CreateSchema extends Partial<SchemaLike<Key> & { id: string }>,
  Schema extends SchemaLike<Key> & { id: string },
> {
  #findTotalNumber: () => Promise<{ count: number }>;
  #findAll: (limit?: number, offset?: number) => Promise<readonly Schema[]>;
  #findById: (id: string) => Promise<Readonly<Schema>>;
  #insert: (data: OmitAutoSetFields<CreateSchema>) => Promise<Readonly<Schema>>;

  #updateById: <SetKey extends Key | 'id', WhereKey extends Key | 'id'>(
    data: UpdateWhereData<SetKey, WhereKey>
  ) => Promise<Schema>;

  #deleteById: (id: string) => Promise<void>;

  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly schema: GeneratedSchema<Key | 'id', CreateSchema, Schema>,
    orderBy?: { field: Key | 'id'; order: 'asc' | 'desc' }
  ) {
    this.#findTotalNumber = buildGetTotalRowCountWithPool(this.pool, this.schema.table);
    this.#findAll = buildFindAllEntitiesWithPool(this.pool)(this.schema, orderBy && [orderBy]);
    this.#findById = buildFindEntityByIdWithPool(this.pool)(this.schema);
    this.#insert = buildInsertIntoWithPool(this.pool)(this.schema, { returning: true });
    this.#updateById = buildUpdateWhereWithPool(this.pool)(this.schema, true);
    this.#deleteById = buildDeleteByIdWithPool(this.pool, this.schema.table);
  }

  async findTotalNumber(): Promise<number> {
    const { count } = await this.#findTotalNumber();
    return count;
  }

  async findAll(limit?: number, offset?: number): Promise<readonly Schema[]> {
    return this.#findAll(limit, offset);
  }

  async findById(id: string): Promise<Readonly<Schema>> {
    return this.#findById(id);
  }

  async insert(data: CreateSchema): Promise<Readonly<Schema>> {
    return this.#insert(data);
  }

  async updateById(
    id: string,
    data: Partial<Schema>,
    jsonbMode: 'replace' | 'merge' = 'replace'
  ): Promise<Readonly<Schema>> {
    return this.#updateById({ set: data, where: { id }, jsonbMode });
  }

  async deleteById(id: string): Promise<void> {
    await this.#deleteById(id);
  }
}
