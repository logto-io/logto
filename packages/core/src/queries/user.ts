import type { User, CreateUser } from '@logto/schemas';
import { Users, UserRole } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildUpdateWhere } from '@/database/update-where';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Users);

export const findUserByUsername = async (username: string) =>
  envSet.pool.maybeOne<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.username}=${username}
  `);

export const findUserByEmail = async (email: string) =>
  envSet.pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.primaryEmail}=${email}
  `);

export const findUserByPhone = async (phone: string) =>
  envSet.pool.one<User>(sql`
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
  envSet.pool.one<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
    `
  );

export const hasUser = async (username: string) =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.username}=${username}
  `);

export const hasUserWithId = async (id: string) =>
  envSet.pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.id}=${id}
  `);

export const hasUserWithEmail = async (email: string) =>
  envSet.pool.exists(sql`
    select ${fields.primaryEmail}
    from ${table}
    where ${fields.primaryEmail}=${email}
  `);

export const hasUserWithPhone = async (phone: string) =>
  envSet.pool.exists(sql`
    select ${fields.primaryPhone}
    from ${table}
    where ${fields.primaryPhone}=${phone}
  `);

export const hasUserWithIdentity = async (target: string, userId: string) =>
  envSet.pool.exists(
    sql`
      select ${fields.id}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([target])},userId}' = ${userId}
    `
  );

const buildUserSearchConditionSql = (search: string, isCaseSensitive = false) => {
  const searchFields = [fields.primaryEmail, fields.primaryPhone, fields.username, fields.name];

  return sql`${sql.join(
    searchFields.map(
      (filedName) =>
        sql`${filedName} ${isCaseSensitive ? sql`like` : sql`ilike`} ${'%' + search + '%'}`
    ),
    sql` or `
  )}`;
};

const buildUserConditions = (
  search?: string,
  hideAdminUser?: boolean,
  isCaseSensitive?: boolean
) => {
  if (hideAdminUser) {
    return sql`
      where not (${fields.roleNames}::jsonb?${UserRole.Admin})
      ${conditionalSql(
        search,
        (search) => sql`and (${buildUserSearchConditionSql(search, isCaseSensitive)})`
      )}
    `;
  }

  return sql`
    ${conditionalSql(
      search,
      (search) => sql`where ${buildUserSearchConditionSql(search, isCaseSensitive)}`
    )}
  `;
};

export const countUsers = async (
  search?: string,
  hideAdminUser?: boolean,
  isCaseSensitive?: boolean
) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    ${buildUserConditions(search, hideAdminUser, isCaseSensitive)}
  `);

export const findUsers = async (
  limit: number,
  offset: number,
  search?: string,
  hideAdminUser?: boolean,
  isCaseSensitive?: boolean
) =>
  envSet.pool.any<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${buildUserConditions(search, hideAdminUser, isCaseSensitive)}
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
