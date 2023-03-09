import type { CreateVerificationStatus, VerificationStatus } from '@logto/schemas';
import { VerificationStatuses } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

const { table, fields } = convertToIdentifiers(VerificationStatuses);

export const createVerificationStatusQueries = (pool: CommonQueryMethods) => {
  const findVerificationStatusByUserId = async (userId: string) =>
    pool.maybeOne<VerificationStatus>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.userId}=${userId}
    `);

  const insertVerificationStatus = buildInsertIntoWithPool(pool)<
    CreateVerificationStatus,
    VerificationStatus
  >(VerificationStatuses, {
    returning: true,
  });

  const deleteVerificationStatusesByUserId = async (userId: string) => {
    await pool.query(sql`
      delete from ${table}
      where ${fields.userId}=${userId}
    `);
  };

  return {
    findVerificationStatusByUserId,
    insertVerificationStatus,
    deleteVerificationStatusesByUserId,
  };
};
