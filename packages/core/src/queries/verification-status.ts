import type { CreateVerificationStatus, VerificationStatus } from '@logto/schemas';
import { VerificationStatuses } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

const { table, fields } = convertToIdentifiers(VerificationStatuses);

export const createVerificationStatusQueries = (pool: CommonQueryMethods) => {
  const findVerificationStatusByUserIdAndSessionId = async (userId: string, sessionId: string) =>
    pool.maybeOne<VerificationStatus>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.sessionId}=${sessionId} and ${fields.userId}=${userId}
    `);

  const insertVerificationStatus = buildInsertIntoWithPool(pool)<
    CreateVerificationStatus,
    VerificationStatus
  >(VerificationStatuses, {
    returning: true,
  });

  const deleteVerificationStatusesByUserIdAndSessionId = async (
    userId: string,
    sessionId: string
  ) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.sessionId}=${sessionId} and ${fields.userId}=${userId}
    `);
  };

  return {
    findVerificationStatusByUserIdAndSessionId,
    insertVerificationStatus,
    deleteVerificationStatusesByUserIdAndSessionId,
  };
};
