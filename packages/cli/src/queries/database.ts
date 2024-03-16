import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

export const getDatabaseName = async (pool: CommonQueryMethods, normalized = false) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return normalized ? currentDatabase.replaceAll('-', '_') : currentDatabase;
};
