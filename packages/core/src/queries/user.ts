import type { User, CreateUser } from '@logto/schemas';
import { SearchJointMode, Users } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';

const { table, fields } = convertToIdentifiers(Users);

export const createUserQueries = (pool: CommonQueryMethods) => {
  const findUserByUsername = async (username: string) =>
    pool.maybeOne<User>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.username}=${username}
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
      where ${fields.username}=${username}
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

  const buildUserConditions = (search: Search, excludeUserIds: string[], userIds?: string[]) => {
    const hasSearch = search.matches.length > 0;
    const searchFields = [
      Users.fields.id,
      Users.fields.primaryEmail,
      Users.fields.primaryPhone,
      Users.fields.username,
      Users.fields.name,
    ];

    if (excludeUserIds.length > 0) {
      // FIXME @sijie temp solution to filter out admin users,
      // It is too complex to use join
      return sql`
        where ${fields.id} not in (${sql.join(excludeUserIds, sql`, `)})
        ${conditionalSql(
          hasSearch,
          () => sql`and (${buildConditionsFromSearch(search, searchFields)})`
        )}
      `;
    }

    if (userIds) {
      return sql`
        where ${fields.id} in (${userIds.length > 0 ? sql.join(userIds, sql`, `) : sql`null`})
        ${conditionalSql(
          hasSearch,
          () => sql`and (${buildConditionsFromSearch(search, searchFields)})`
        )}
      `;
    }

    return conditionalSql(
      hasSearch,
      () => sql`where ${buildConditionsFromSearch(search, searchFields)}`
    );
  };

  const defaultUserSearch = { matches: [], isCaseSensitive: false, joint: SearchJointMode.Or };

  const countUsers = async (
    search: Search = defaultUserSearch,
    excludeUserIds: string[] = [],
    userIds?: string[]
  ) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      ${buildUserConditions(search, excludeUserIds, userIds)}
    `);

  const findUsers = async (
    limit: number,
    offset: number,
    search: Search,
    excludeUserIds: string[] = [],
    userIds?: string[]
  ) =>
    pool.any<User>(
      sql`
        select ${sql.join(
          Object.values(fields).map((field) => sql`${table}.${field}`),
          sql`,`
        )}
        from ${table}
        ${buildUserConditions(search, excludeUserIds, userIds)}
        order by ${fields.createdAt} desc
        limit ${limit}
        offset ${offset}
      `
    );

  const findUsersByIds = async (userIds: string[]) =>
    userIds.length > 0
      ? pool.any<User>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(userIds, sql`, `)})
      `)
      : [];

  const updateUser = buildUpdateWhereWithPool(pool)<CreateUser, User>(Users, true);

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
