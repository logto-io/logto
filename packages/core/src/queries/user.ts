import { UserDBEntry, Users } from '@logto/schemas';
import { sql } from 'slonik';
import pool from '@/database/pool';
import { convertToIdentifiers, insertInto } from '@/database/utils';

const { table, fields } = convertToIdentifiers(Users);

export const findUserByUsername = async (username: string) =>
  pool.one<UserDBEntry>(sql`
  select ${sql.join(Object.values(fields), sql`,`)}
  from ${table}
  where ${fields.username}=${username}
`);

export const findUserById = async (id: string) =>
  pool.one<UserDBEntry>(sql`
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

export const insertUser = async (user: UserDBEntry) =>
  pool.query(insertInto(table, fields, Users.fieldKeys, user));
