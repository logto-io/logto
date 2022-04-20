import { CreateUserLog, UserLogs } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(UserLogs);

export const insertUserLog = buildInsertInto<CreateUserLog>(UserLogs);

export const findLogsByUserId = async (userId: string) =>
  envSet.pool.many<CreateUserLog>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.userId}=${userId}
    order by created_at desc
  `);
