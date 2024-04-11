import { type SchemaLike, type Table } from '@logto/shared';
import { type KeysToCamelCase } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';
import snakecaseKeys from 'snakecase-keys';
import { type z } from 'zod';

import { expandFields } from '#src/database/utils.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

import { conditionalSql } from './sql.js';

type AtLeast2<T extends unknown[]> = `${T['length']}` extends '0' | '1' ? never : T;

type TableInfo<
  TableName extends string,
  TableSingular extends string,
  Key extends string,
  Schema extends SchemaLike<string>,
> = Table<Key, TableName> & {
  tableSingular: TableSingular;
  guard: z.ZodType<Schema, z.ZodTypeDef, unknown>;
};

type InferSchema<T> = T extends TableInfo<
  infer _,
  infer _,
  Extract<keyof (infer Schema), string>,
  infer Schema
>
  ? Schema
  : never;

type CamelCaseIdObject<T extends string> = KeysToCamelCase<{
  [Key in `${T}_id`]: string;
}>;

/** Options for getting entities in a table. */
export type GetEntitiesOptions = {
  limit: number;
  offset: number;
};

/**
 * Query class for relation tables that connect several tables by their entity ids.
 *
 * Let's say we have two tables `users` and `groups` and a relation table
 * `user_group_relations`. Then we can create a `RelationQueries` instance like this:
 *
 * ```ts
 * const userGroupRelations = new RelationQueries(pool, 'user_group_relations', Users, Groups);
 * ```
 *
 * `Users` and `Groups` are the schemas of the tables that satisfy the {@link TableInfo}
 * interface. The generated schemas in `@logto/schemas` satisfy this interface.
 *
 * To insert a new relation, we can use the {@link RelationQueries.insert} method:
 *
 * ```ts
 * await userGroupRelations.insert(['user-id-1', 'group-id-1']);
 * // Insert multiple relations at once
 * await userGroupRelations.insert(
 *   ['user-id-1', 'group-id-1'],
 *   ['user-id-2', 'group-id-1']
 * );
 * ```
 *
 * To get all entities for a specific table, we can use the {@link RelationQueries.getEntities} method:
 *
 * ```ts
 * await userGroupRelations.getEntities(Users, { groupId: 'group-id-1' });
 * ```
 *
 * This will return all entities for the `users` table that are connected to the
 * group with the id `group-id-1`.
 */
export default class RelationQueries<
  Schemas extends Array<TableInfo<string, string, string, SchemaLike<string>>>,
  Length = AtLeast2<Schemas>['length'],
> {
  protected get table() {
    return sql.identifier([this.relationTable]);
  }

  public readonly schemas: Schemas;

  /**
   * @param pool The database pool.
   * @param relationTable The name of the relation table.
   * @param relations The schemas of the tables that are connected by the relation table.
   * @see {@link TableInfo} for more information about the schemas.
   */
  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly relationTable: string,
    ...schemas: Readonly<Schemas>
  ) {
    this.schemas = schemas;
  }

  /**
   * Insert new entities into the relation table.
   *
   * Each entity must contain the same number of ids as the number of relations, and
   * the order of the ids must match the order of the relations.
   * Insert existing relations will be ignored.
   *
   * @param data Entities to insert.
   * @returns A Promise that resolves to the query result.
   *
   * @example
   * ```ts
   * const userGroupRelations = new RelationQueries(pool, 'user_group_relations', Users, Groups);
   *
   * userGroupRelations.insert(['user-id-1', 'group-id-1']);
   * // Insert multiple relations at once
   * userGroupRelations.insert(
   *   ['user-id-1', 'group-id-1'],
   *   ['user-id-2', 'group-id-1']
   * );
   * ```
   */
  async insert(...data: ReadonlyArray<string[] & { length: Length }>) {
    return this.pool.query(sql`
      insert into ${this.table} (${sql.join(
        this.schemas.map(({ tableSingular }) => sql.identifier([tableSingular + '_id'])),
        sql`, `
      )})
      values ${sql.join(
        data.map(
          (relation) =>
            sql`(${sql.join(
              relation.map((id) => sql`${id}`),
              sql`, `
            )})`
        ),
        sql`, `
      )}
      ${sql`on conflict do nothing`}
    `);
  }

  /**
   * Delete a relation from the relation table.
   *
   * @param data The ids of the entities to delete. The keys must be in camel case
   * and end with `Id`.
   * @returns A Promise that resolves to the query result.
   *
   * @example
   * ```ts
   * const userGroupRelations = new RelationQueries(pool, 'user_group_relations', Users, Groups);
   * userGroupRelations.delete({ userId: 'user-id-1', groupId: 'group-id-1' });
   * ```
   */
  async delete(data: CamelCaseIdObject<Schemas[number]['tableSingular']>) {
    const snakeCaseData = snakecaseKeys(data);
    const { rowCount } = await this.pool.query(sql`
      delete from ${this.table}
      where ${sql.join(
        Object.entries(snakeCaseData).map(
          ([column, value]) => sql`${sql.identifier([column])} = ${value}`
        ),
        sql` and `
      )};
    `);

    if (rowCount < 1) {
      throw new DeletionError(this.relationTable);
    }
  }

  /**
   * Get all entities for a specific schema that are connected to the given ids.
   *
   * @param forSchema The schema to get the entities for.
   * @param where Other ids to filter the entities by. The keys must be in camel case
   * and end with `Id`.
   * @param options Options for the query.
   * @param options.limit The maximum number of entities to return.
   * @param options.offset The number of entities to skip.
   * @returns A Promise that resolves to the total number of entities and the entities.
   *
   * @example
   * ```ts
   * const userGroupRelations = new RelationQueries(pool, 'user_group_relations', Users, Groups);
   *
   * userGroupRelations.getEntities(Users, { groupId: 'group-id-1' });
   * // With pagination
   * userGroupRelations.getEntities(Users, { groupId: 'group-id-1' }, { limit: 10, offset: 20 });
   * ```
   */
  async getEntities<S extends Schemas[number]>(
    forSchema: S,
    where: CamelCaseIdObject<Exclude<Schemas[number]['tableSingular'], S['tableSingular']>>,
    options?: GetEntitiesOptions
  ): Promise<[totalNumber: number, entities: ReadonlyArray<InferSchema<S>>]> {
    const { limit, offset } = options ?? {};
    const snakeCaseWhere = snakecaseKeys(where);
    const forTable = sql.identifier([forSchema.table]);
    const mainSql = sql`
      from ${this.table}
      join ${forTable} on ${sql.identifier([
        this.relationTable,
        forSchema.tableSingular + '_id',
      ])} = ${forTable}.id
      where ${sql.join(
        Object.entries(snakeCaseWhere).map(
          ([column, value]) => sql`${sql.identifier([column])} = ${value}`
        ),
        sql` and `
      )}
    `;

    const [{ count }, { rows }] = await Promise.all([
      // Postgres returns a bigint for count(*), which is then converted to a string by query library.
      // We need to convert it to a number.
      this.pool.one<{ count: string }>(sql`
        select count(*)
        ${mainSql}
      `),

      this.pool.query<InferSchema<S>>(sql`
        select ${expandFields(forSchema, true)}
        ${mainSql}
        ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
        ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
      `),
    ]);

    return [Number(count), rows];
  }

  /**
   * Check if a relation exists.
   *
   * @param ids The ids of the entities to check. The order of the ids must match the order of the relations.
   * @returns A Promise that resolves to `true` if the relation exists, otherwise `false`.
   *
   * @example
   * ```ts
   * const userGroupRelations = new RelationQueries(pool, 'user_group_relations', Users, Groups);
   *
   * userGroupRelations.exists('user-id-1', 'group-id-1');
   * ```
   */
  async exists(...ids: readonly string[] & { length: Length }) {
    return this.pool.exists(sql`
      select
      from ${this.table}
      where ${sql.join(
        this.schemas.map(
          ({ tableSingular }, index) =>
            sql`${sql.identifier([tableSingular + '_id'])} = ${ids[index] ?? sql`null`}`
        ),
        sql` and `
      )}
      limit 1
    `);
  }
}

/**
 * Query class for relation tables that connect two tables by their entity ids. It
 * provides a {@link RelationQueries.replace} method that replaces all relations
 * for a specific entity.
 *
 * @see {@link RelationQueries} for more information.
 */
export class TwoRelationsQueries<
  Schema1 extends TableInfo<string, string, string, SchemaLike<string>>,
  Schema2 extends TableInfo<string, string, string, SchemaLike<string>>,
> extends RelationQueries<[Schema1, Schema2]> {
  /**
   * Replace all relations for a specific `Schema1` entity with the given `Schema2` entities.
   * If `schema2Ids` is empty, all relations for the given `Schema1` entity will be deleted.
   *
   * @remarks This method is transactional.
   * @param schema1Id The id of the `Schema1` entity.
   * @param schema2Ids The ids of the `Schema2` entities to replace the relation s with.
   * @returns A Promise that resolves to the query result.
   */
  async replace(schema1Id: string, schema2Ids: readonly string[]) {
    return this.pool.transaction(async (transaction) => {
      // Lock schema1 row
      await transaction.query(sql`
        select id
        from ${sql.identifier([this.schemas[0].table])}
        where id = ${schema1Id}
        for update
      `);

      // Delete old relations
      await transaction.query(sql`
        delete from ${this.table}
        where ${sql.identifier([this.schemas[0].tableSingular + '_id'])} = ${schema1Id}
      `);

      // Insert new relations
      if (schema2Ids.length === 0) {
        return;
      }

      await transaction.query(sql`
        insert into ${this.table} (
          ${sql.identifier([this.schemas[0].tableSingular + '_id'])},
          ${sql.identifier([this.schemas[1].tableSingular + '_id'])}
        )
          values ${sql.join(
            schema2Ids.map((schema2Id) => sql`(${schema1Id}, ${schema2Id})`),
            sql`, `
          )}
      `);
    });
  }
}
