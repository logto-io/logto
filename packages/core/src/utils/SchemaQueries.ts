import { type GeneratedSchema } from '@logto/schemas';
import { type UpdateWhereData, type SchemaLike } from '@logto/shared';
import { type CommonQueryMethods } from '@silverhand/slonik';

import { buildDeleteByIdWithPool } from '#src/database/delete-by-id.js';
import { buildFindAllEntitiesWithPool } from '#src/database/find-all-entities.js';
import {
  buildFindEntitiesByIdsWithPool,
  buildFindEntityByIdWithPool,
} from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildGetTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { type SearchOptions } from '#src/database/utils.js';

import { type OmitAutoSetFields } from './sql.js';

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
  readonly #findTotalNumber: <SearchKey extends Key>(
    search?: SearchOptions<SearchKey>
  ) => Promise<{ count: number }>;

  readonly #findAll: <SearchKey extends Key>(
    limit?: number,
    offset?: number,
    search?: SearchOptions<SearchKey>
  ) => Promise<readonly Schema[]>;

  readonly #findById: (id: string) => Promise<Readonly<Schema>>;

  readonly #findByIds: (ids: string[]) => Promise<readonly Schema[]>;

  readonly #insert: (data: OmitAutoSetFields<CreateSchema>) => Promise<Readonly<Schema>>;

  readonly #updateById: <SetKey extends Key | 'id', WhereKey extends Key | 'id'>(
    data: UpdateWhereData<SetKey, WhereKey>
  ) => Promise<Schema>;

  readonly #deleteById: (id: string) => Promise<void>;

  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly schema: GeneratedSchema<Key | 'id', CreateSchema, Schema>,
    protected readonly orderBy?: { field: Key | 'id'; order: 'asc' | 'desc' }
  ) {
    this.#findTotalNumber = buildGetTotalRowCountWithPool(this.pool, this.schema);
    this.#findAll = buildFindAllEntitiesWithPool(this.pool)(this.schema, orderBy && [orderBy]);
    this.#findById = buildFindEntityByIdWithPool(this.pool)(this.schema);
    this.#findByIds = buildFindEntitiesByIdsWithPool(this.pool)(this.schema);
    this.#insert = buildInsertIntoWithPool(this.pool)(this.schema, { returning: true });
    this.#updateById = buildUpdateWhereWithPool(this.pool)(this.schema, true);
    this.#deleteById = buildDeleteByIdWithPool(this.pool, this.schema.table);
  }

  async findAll<SearchKey extends Key>(
    limit?: number,
    offset?: number,
    search?: SearchOptions<SearchKey>
  ): Promise<[totalNumber: number, rows: readonly Schema[]]> {
    return Promise.all([this.findTotalNumber(search), this.#findAll(limit, offset, search)]);
  }

  async findById(id: string): Promise<Readonly<Schema>> {
    return this.#findById(id);
  }

  async findByIds(ids: string[]): Promise<readonly Schema[]> {
    return this.#findByIds(ids);
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

  protected async findTotalNumber(search?: SearchOptions<Key>): Promise<number> {
    const { count } = await this.#findTotalNumber(search);
    return count;
  }
}
