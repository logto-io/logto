import { UserDBEntry, Users } from '@logto/schemas';
import { sql } from 'slonik';
import pool from '../database/pool';
import { convertToIdentifiers } from '../database/utils';

const { table, fields } = convertToIdentifiers(Users);

export const findUserById = async (id: string) =>
  pool.one<UserDBEntry>(sql`
  select ${sql.join(Object.values(fields), sql`,`)}
  from ${table}
  where id=${id}
`);
