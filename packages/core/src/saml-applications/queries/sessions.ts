import { type SamlApplicationSession, SamlApplicationSessions } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(SamlApplicationSessions);

export const createSamlApplicationSessionQueries = (pool: CommonQueryMethods) => {
  const insertSession = buildInsertIntoWithPool(pool)(SamlApplicationSessions, {
    returning: true,
  });

  const updateSession = buildUpdateWhereWithPool(pool)(SamlApplicationSessions, true);

  /**
   * Removes the OIDC state from a session, which marks OIDC state as consumed.
   *
   * @param id The ID of the session.
   * @returns The updated session.
   */
  const removeSessionOidcStateById = async (id: string) =>
    updateSession({
      set: { oidcState: null },
      where: { id },
      jsonbMode: 'merge',
    });

  const deleteExpiredSessions = async () => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.expiresAt} < now()
    `);

    if (rowCount < 1) {
      throw new DeletionError(SamlApplicationSessions.table);
    }
  };

  const findSessionById = async (id: string) =>
    pool.maybeOne<SamlApplicationSession>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=${id}
    `);

  return {
    insertSession,
    updateSession,
    removeSessionOidcStateById,
    deleteExpiredSessions,
    findSessionById,
  };
};
