import type { User, CreateUser } from '@logto/schemas';
import { Users } from '@logto/schemas';
import { conditionalArray, pick } from '@silverhand/essentials';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { EnvSet } from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Users);

/**
 * The conditions that connected with `and` operator for finding users. It supports the
 * following:
 *
 * - `search`: The search conditions. It can be combined with various search fields and
 * match modes.
 * - `relation`: The relation conditions. It can be used to find users that have or don't
 * have a relation with another table. Note that the relation field is the raw field name
 * in the database, not the camel case one.
 *
 * @example
 * ```ts
 * // Find users that have a relation with the table `foo` and the field `bar` is `baz`.
 * { relation: { table: 'foo', field: 'bar', value: 'baz', type: 'exists' } }
 * ```
 * @see {@link Search} for more information about the search conditions.
 */
export type UserConditions = {
  search?: Search;
  relation?: {
    table: string;
    field: string;
    value: string;
    type: 'exists' | 'not exists';
  };
};

/**
 * The schema field keys that can be used for searching users. For the actual field names,
 * see {@link Users.fields} and {@link userSearchFields}.
 */
export const userSearchKeys = Object.freeze([
  'id',
  'primaryEmail',
  'primaryPhone',
  'username',
  'name',
] as const);

/**
 * The actual database field names that can be used for searching users. For the schema field
 * keys, see {@link userSearchKeys}.
 */
export const userSearchFields = Object.freeze(Object.values(pick(Users.fields, ...userSearchKeys)));

export const createUserQueries = (pool: CommonQueryMethods) => {
  const findUserByUsername = async (username: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${
        EnvSet.values.isCaseSensitiveUsername
          ? sql`where ${fields.username}=${username}`
          : sql`where lower(${fields.username})=lower(${username})`
      }
    `);

  const findUserByEmail = async (email: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where lower(${fields.primaryEmail})=lower(${email})
    `);

  const findUserByPhone = async (phone: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.primaryPhone}=${phone}
    `);

  const findUserById = async (id: string): Promise<User> =>
    pool.one<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.id}=${id}
    `);

  const findUserByIdentity = async (target: string, userId: string) =>
    pool.maybeOne<User>(
      sql`
        select ${sql.join(Object.values(fields), sql`,`)}
        from ${table}
        where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
      `
    );

  const hasUser = async (username: string, excludeUserId?: string) =>
    pool.exists(sql`
      select ${fields.id}
      from ${table}
      ${
        EnvSet.values.isCaseSensitiveUsername
          ? sql`where ${fields.username}=${username}`
          : sql`where lower(${fields.username})=lower(${username})`
      }
      ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  const hasUserWithId = async (id: string) =>
    pool.exists(sql`
      select ${fields.id}
      from ${table}
      where ${fields.id}=${id}
    `);

  const hasUserWithEmail = async (email: string, excludeUserId?: string) =>
    pool.exists(sql`
      select ${fields.primaryEmail}
      from ${table}
      where lower(${fields.primaryEmail})=lower(${email})
      ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  const hasUserWithPhone = async (phone: string, excludeUserId?: string) =>
    pool.exists(sql`
      select ${fields.primaryPhone}
      from ${table}
      where ${fields.primaryPhone}=${phone}
      ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  const hasUserWithIdentity = async (target: string, userId: string, excludeUserId?: string) =>
    pool.exists(
      sql`
        select ${fields.id}
        from ${table}
        where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
        ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
      `
    );

  /**
   * Build the `where` clause for finding users with the given conditions joined with `and`.
   *
   * @see {@link UserConditions} for more information about the conditions.
   */
  const buildUserConditions = ({ search, relation }: UserConditions) => {
    const hasSearch = search?.matches.length;
    const id = sql.identifier;
    const buildRelationCondition = () => {
      if (!relation) {
        return;
      }

      const { table, field, type, value } = relation;

      return sql`
        ${type === 'exists' ? sql`exists` : sql`not exists`} (
          select 1
          from ${id([table])}
          where ${id([table, field])} = ${value}
          and ${id([table, 'user_id'])} = ${id([Users.table, Users.fields.id])}
        )
      `;
    };

    const conditions = conditionalArray(
      buildRelationCondition(),
      hasSearch && sql`(${buildConditionsFromSearch(search, userSearchFields)})`
    );

    if (conditions.length === 0) {
      return sql``;
    }

    return sql`where ${sql.join(conditions, sql` and `)}`;
  };

  const countUsers = async (conditions: UserConditions) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      ${buildUserConditions(conditions)}
    `);

  const findUsers = async (limit: number, offset: number, conditions: UserConditions) =>
    pool.any<User>(
      sql`
        select ${sql.join(
          Object.values(fields).map((field) => sql`${table}.${field}`),
          sql`,`
        )}
        from ${table}
        ${buildUserConditions(conditions)}
        order by ${fields.createdAt} desc
        limit ${limit}
        offset ${offset}
      `
    );

  const findUsersByIds = async (userIds: string[]): Promise<readonly User[]> =>
    userIds.length > 0
      ? pool.any<User>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(userIds, sql`, `)})
      `)
      : [];

  const updateUser = buildUpdateWhereWithPool(pool)(Users, true);

  const updateUserById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateUser>>,
    jsonbMode: 'replace' | 'merge' = 'merge'
  ) => updateUser({ set, where: { id }, jsonbMode });

  const deleteUserById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Users.table, id);
    }
  };

  const deleteUserIdentity = async (userId: string, target: string) =>
    pool.one<User>(sql`
      update ${table}
      set ${fields.identities}=${fields.identities}::jsonb-${target}
      where ${fields.id}=${userId}
      returning *
    `);

  const hasActiveUsers = async () =>
    pool.exists(sql`
      select ${fields.id}
      from ${table}
      where ${fields.isSuspended} = false
      limit 1
    `);

  const getDailyNewUserCountsByTimeInterval = async (
    startTimeExclusive: number,
    endTimeInclusive: number
  ) =>
    pool.any<{ date: string; count: number }>(sql`
      select date(${fields.createdAt}), count(*)
      from ${table}
      where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
      and ${fields.createdAt} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
      group by date(${fields.createdAt})
    `);

  return {
    findUserByUsername,
    findUserByEmail,
    findUserByPhone,
    findUserById,
    findUserByIdentity,
    hasUser,
    hasUserWithId,
    hasUserWithEmail,
    hasUserWithPhone,
    hasUserWithIdentity,
    countUsers,
    findUsers,
    findUsersByIds,
    updateUserById,
    deleteUserById,
    deleteUserIdentity,
    hasActiveUsers,
    getDailyNewUserCountsByTimeInterval,
  };
};
