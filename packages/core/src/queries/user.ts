import { User, CreateUser, Users } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { conditionalSql, convertToIdentifiers, OmitAutoSetFields } from '@/database/utils';
import { DeletionError, UpdateError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Users);

export const findUserByUsername = async (username: string) =>
  pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.username}=${username}
  `);

export const findUserByEmail = async (email: string) =>
  pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.primaryEmail}=${email}
  `);

export const findUserByPhone = async (phone: string) =>
  pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.primaryPhone}=${phone}
  `);

export const findUserById = async (id: string) =>
  pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const findUserByIdentity = async (connectorId: string, userId: string) =>
  pool.one<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([connectorId])},userId}' = ${userId}
    `
  );

export const hasUser = async (username: string) =>
  pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.username}=${username}
  `);

export const hasUserWithId = async (id: string) =>
  pool.exists(sql`
    select ${fields.id}
    from ${table}
    where ${fields.id}=${id}
  `);

export const hasUserWithEmail = async (email: string) =>
  pool.exists(sql`
    select ${fields.primaryEmail}
    from ${table}
    where ${fields.primaryEmail}=${email}
  `);

export const hasUserWithPhone = async (phone: string) =>
  pool.exists(sql`
    select ${fields.primaryPhone}
    from ${table}
    where ${fields.primaryPhone}=${phone}
  `);

export const hasUserWithIdentity = async (connectorId: string, userId: string) =>
  pool.exists(
    sql`
      select ${fields.id}
      from ${table}
      where ${fields.identities}::json#>>'{${sql.identifier([connectorId])},userId}' = ${userId}
    `
  );

export const insertUser = buildInsertInto<CreateUser, User>(pool, Users, { returning: true });

const buildUserSearchConditionSql = (search: string) => {
  const searchFields = [fields.primaryEmail, fields.primaryPhone, fields.username, fields.name];
  const conditions = searchFields.map((filedName) => sql`${filedName} like ${'%' + search + '%'}`);

  return sql`${sql.join(conditions, sql` or `)}`;
};

export const countUsers = async (search?: string) =>
  pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    ${conditionalSql(search, (search) => sql`where ${buildUserSearchConditionSql(search)}`)}
  `);

export const findUsers = async (limit: number, offset: number, search?: string) =>
  pool.many<User>(
    sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      ${conditionalSql(search, (search) => sql`where ${buildUserSearchConditionSql(search)}`)}
      limit ${limit}
      offset ${offset}
    `
  );

const updateUser = buildUpdateWhere<CreateUser, User>(pool, Users, true);

export const updateUserById = async (id: string, set: Partial<OmitAutoSetFields<CreateUser>>) =>
  updateUser({ set, where: { id } });

export const deleteUserById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Users.table, id);
  }
};

export const clearUserCustomDataById = async (id: string) => {
  const { rowCount } = await pool.query<User>(sql`
    update ${table}
    set ${fields.customData}='{}'::jsonb
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new UpdateError(Users, { set: { customData: {} }, where: { id } });
  }
};

export const deleteUserIdentity = async (userId: string, connectorId: string) =>
  pool.one<User>(sql`
    update ${table}
    set ${fields.identities}=${fields.identities}::jsonb-${connectorId}
    where ${fields.id}=${userId}
    returning *
  `);
