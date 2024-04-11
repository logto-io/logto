import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { DeletionError } from '#src/errors/SlonikError/index.js';

export const buildDeleteByIdWithPool =
  (pool: CommonQueryMethods, table: string) => async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${sql.identifier([table])}
      where ${sql.identifier(['id'])}=${id};
    `);

    if (rowCount < 1) {
      throw new DeletionError(table, id);
    }
  };
