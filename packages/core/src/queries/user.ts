import type { User, CreateUser } from '@logto/schemas';
import { SearchJointMode, Users, UserRole } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildUpdateWhere } from '#src/database/update-where.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';

const { table, fields } = convertToIdentifiers(Users);

export const findUserByUsername = async (username: string) =>
  envSet.pool.maybeOne<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.username}=${username}
  `);

export const findUserByEmail = async (email: string) =>
  envSet.pool.maybeOne<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where lower(${fields.primaryEmail})=lower(${email})
  `);

export const findUserByPhone = async (phone: string) =>
  envSet.pool.maybeOne<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.primaryPhone}=${phone}
  `);

export const findUserById = async (id: string) =>
  envSet.pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const findUserByIdentity = async (target: string, userId: string) =>
  envSet.pool.maybeOne<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
    `
  );

export const hasUser = async (username: string, excludeUserId?: string) =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.username}=${username}
    ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
  `);

export const hasUserWithId = async (id: string) =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.id}=${id}
  `);

export const hasUserWithEmail = async (email: string, excludeUserId?: string) =>
  envSet.pool.exists(sql`
    select ${fields.primaryEmail}
    from ${table}
    where lower(${fields.primaryEmail})=lower(${email})
    ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
  `);

export const hasUserWithPhone = async (phone: string, excludeUserId?: string) =>
  envSet.pool.exists(sql`
    select ${fields.primaryPhone}
    from ${table}
    where ${fields.primaryPhone}=${phone}
    ${conditionalSql(excludeUserId, (id) => sql`and ${fields.id}<>${id}`)}
  `);

export const hasUserWithIdentity = async (target: string, userId: string) =>
  envSet.pool.exists(
    sql`
      select ${fields.id}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
    `
  );

const buildUserConditions = (search: Search, hideAdminUser: boolean) => {
  const hasSearch = search.matches.length > 0;
  const searchFields = [
    Users.fields.id,
    Users.fields.primaryEmail,
    Users.fields.primaryPhone,
    Users.fields.username,
    Users.fields.name,
  ];

  if (hideAdminUser) {
    return sql`
      where not ${UserRole.Admin}=any(${fields.roleNames})
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

export const defaultUserSearch = { matches: [], isCaseSensitive: false, joint: SearchJointMode.Or };

export const countUsers = async (search: Search = defaultUserSearch, hideAdminUser = false) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    ${buildUserConditions(search, hideAdminUser)}
  `);

export const findUsers = async (
  limit: number,
  offset: number,
  search: Search,
  hideAdminUser: boolean
) =>
  envSet.pool.any<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${buildUserConditions(search, hideAdminUser)}
      limit ${limit}
      offset ${offset}
    `
  );

const updateUser = buildUpdateWhere<CreateUser, User>(Users, true);

export const updateUserById = async (
  id: string,
  set: Partial<OmitAutoSetFields<CreateUser>>,
  jsonbMode: 'replace' | 'merge' = 'merge'
) => updateUser({ set, where: { id }, jsonbMode });

export const deleteUserById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Users.table, id);
  }
};

export const deleteUserIdentity = async (userId: string, target: string) =>
  envSet.pool.one<User>(sql`
    update ${table}
    set ${fields.identities}=${fields.identities}::jsonb-${target}
    where ${fields.id}=${userId}
    returning *
  `);

export const hasActiveUsers = async () =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    limit 1
  `);

export const getDailyNewUserCountsByTimeInterval = async (
  startTimeExclusive: number,
  endTimeInclusive: number
) =>
  envSet.pool.any<{ date: string; count: number }>(sql`
    select date(${fields.createdAt}), count(*)
    from ${table}
    where ${fields.createdAt} > to_timestamp(${startTimeExclusive}::double precision / 1000)
    and ${fields.createdAt} <= to_timestamp(${endTimeInclusive}::double precision / 1000)
    group by date(${fields.createdAt})
  `);
