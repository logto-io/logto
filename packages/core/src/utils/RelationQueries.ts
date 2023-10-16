import pluralize from 'pluralize';
import { sql, type CommonQueryMethods } from 'slonik';

type AtLeast2<T extends unknown[]> = `${T['length']}` extends '0' | '1' ? never : T;

type RemoveLiteral<T extends string, L extends string> = T extends L ? Exclude<T, L> : T;

/**
 * Query class for relation tables that connect several tables by their entry ids.
 *
 * @example
 * Let's say we have two tables `users` and `groups` and a relation table
 * `user_group_relations`. Then we can create a `RelationQueries` instance like this:
 *
 * ```ts
 * const userGroupRelations = new RelationQueries(pool, 'user_group_relations', 'users', 'groups');
 * ```
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
 * To get all entries for a specific table, we can use the {@link RelationQueries.getEntries} method:
 *
 * ```ts
 * await userGroupRelations.getEntries('users', { group_id: 'group-id-1' });
 * ```
 *
 * This will return all entries for the `users` table that are connected to the
 * group with the id `group-id-1`.
 */
export default class RelationQueries<
  SnakeCaseRelations extends Array<Lowercase<string>>,
  Length = AtLeast2<SnakeCaseRelations>['length'],
> {
  protected get table() {
    return sql.identifier([this.relationTable]);
  }

  public readonly relations: SnakeCaseRelations;

  /**
   * @param pool The database pool.
   * @param relationTable The name of the relation table.
   * @param relations The names of the tables that are connected by the relation table.
   */
  constructor(
    public readonly pool: CommonQueryMethods,
    public readonly relationTable: string,
    ...relations: Readonly<SnakeCaseRelations>
  ) {
    this.relations = relations;
  }

  /**
   * Insert new entries into the relation table.
   *
   * Each entry must contain the same number of ids as the number of relations, and
   * the order of the ids must match the order of the relations.
   *
   * @example
   * ```ts
   * const userGroupRelations = new RelationQueries(pool, 'user_group_relations', 'users', 'groups');
   *
   * userGroupRelations.insert(['user-id-1', 'group-id-1']);
   * // Insert multiple relations at once
   * userGroupRelations.insert(
   *   ['user-id-1', 'group-id-1'],
   *   ['user-id-2', 'group-id-1']
   * );
   * ```
   *
   * @param data Entries to insert.
   * @returns A Promise that resolves to the query result.
   */
  async insert(...data: ReadonlyArray<string[] & { length: Length }>) {
    return this.pool.query(sql`
      insert into ${this.table} (${sql.join(
        this.relations.map((relation) => sql.identifier([pluralize(relation, 1) + '_id'])),
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
      )};
    `);
  }

  async getEntries<L extends SnakeCaseRelations[number]>(
    forRelation: L,
    where: Record<RemoveLiteral<SnakeCaseRelations[number], L>, unknown>
  ) {
    throw new Error('Not implemented');
  }
}
