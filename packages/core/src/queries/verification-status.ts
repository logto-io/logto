import type { VerificationStatus } from '@logto/schemas';
import { VerificationStatuses } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(VerificationStatuses);

export const createVerificationStatusQueries = (pool: CommonQueryMethods) => {
  const findVerificationStatusByUserId = async (userId: string) =>
    pool.maybeOne<VerificationStatus>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.userId}=${userId}
    `);

  const insertVerificationStatus = buildInsertIntoWithPool(pool)(VerificationStatuses, {
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
