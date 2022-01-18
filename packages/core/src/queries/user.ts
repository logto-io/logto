import { User, UserCreate, Users } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields } from '@/database/utils';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Users);

export const findUserByUsername = async (username: string) =>
  pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.username}=${username}
  `);

export const findUserById = async (id: string) =>
  pool.one<User>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.id}=${id}
  `);

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

export const insertUser = buildInsertInto<UserCreate, User>(pool, Users, { returning: true });

export const findAllUsers = async () =>
  pool.many<User>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
  `);

const updateUser = buildUpdateWhere<UserCreate, User>(pool, Users, true);

export const updateUserById = async (id: string, set: Partial<OmitAutoSetFields<UserCreate>>) =>
  updateUser({ set, where: { id } });

export const deleteUserById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);
  if (rowCount < 1) {
    throw new DeletionError();
  }
};
