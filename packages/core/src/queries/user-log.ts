import { CreateUserLog, UserLogs } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';

const { table, fields } = convertToIdentifiers(UserLogs);

/** @deprecated */
export const insertUserLog = buildInsertInto<CreateUserLog>(pool, UserLogs);

/** @deprecated */
export const findLogsByUserId = async (userId: string) =>
  pool.many<CreateUserLog>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.userId}=${userId}
    order by created_at desc
  `);
