import { UserLogUpdate, UserLogs } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';

const { table, fields } = convertToIdentifiers(UserLogs);

export const insertUserLog = buildInsertInto<UserLogUpdate>(pool, UserLogs);

export const findLogsByUserId = async (userId: string) =>
  pool.many<UserLogUpdate>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.userId}=${userId}
    order by created_at desc
  `);
