import { type SamlApplicationSession, SamlApplicationSessions } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(SamlApplicationSessions);

export const createSamlApplicationSessionQueries = (pool: CommonQueryMethods) => {
  const insertSession = buildInsertIntoWithPool(pool)(SamlApplicationSessions, {
    returning: true,
  });

  const updateSession = buildUpdateWhereWithPool(pool)(SamlApplicationSessions, true);

  const deleteExpiredOrFullyUsedSessions = async () => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.expiresAt} < now()
      or (${fields.isSamlResponseSent} = true and ${fields.isOidcStateChecked} = true)
    `);

    return rowCount;
  };

  const findSessionsByApplicationId = async (applicationId: string) =>
    pool.any<SamlApplicationSession>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
    `);

  const findAvailableSessionByAppIdAndState = async (applicationId: string, state: string) =>
    pool.one<SamlApplicationSession>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
      and ${fields.oidcState}=${state} and ${fields.isOidcStateChecked} = false and ${
        fields.expiresAt
      } > now()
    `);

  const findAvailableSessionByAppIdAndSamlRequestId = async (
    applicationId: string,
    samlRequestId: string
  ) =>
    pool.one<SamlApplicationSession>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
      and ${fields.samlRequestId}=${samlRequestId} and ${fields.isSamlResponseSent} = false and ${
        fields.expiresAt
      } > now()
    `);

  return {
    insertSession,
    updateSession,
    deleteExpiredOrFullyUsedSessions,
    findSessionsByApplicationId,
    findAvailableSessionByAppIdAndState,
    findAvailableSessionByAppIdAndSamlRequestId,
  };
};
