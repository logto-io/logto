import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

export const getDatabaseName = async (pool: CommonQueryMethods, normalized = false) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return normalized ? currentDatabase.replaceAll('-', '_') : currentDatabase;
};
