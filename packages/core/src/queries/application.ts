import type { Application, CreateApplication } from '@logto/schemas';
import { Applications } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { convertToIdentifiers, conditionalSql, manyRows } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { getTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(Applications);

export const createApplicationQueries = (pool: CommonQueryMethods) => {
  const findTotalNumberOfApplications = async () => getTotalRowCountWithPool(pool)(table);
  const findAllApplications = async (limit: number, offset: number) =>
    manyRows(
      pool.query<Application>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        order by ${fields.createdAt} desc
        ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
        ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
      `)
    );
  const findApplicationById = buildFindEntityByIdWithPool(pool)<CreateApplication, Application>(
    Applications
  );
  const insertApplication = buildInsertIntoWithPool(pool)<CreateApplication, Application>(
    Applications,
    {
      returning: true,
    }
  );
  const updateApplication = buildUpdateWhereWithPool(pool)<CreateApplication, Application>(
    Applications,
    true
  );
  const updateApplicationById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateApplication>>
  ) => updateApplication({ set, where: { id }, jsonbMode: 'merge' });

  const deleteApplicationById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Applications.table, id);
    }
  };

  return {
    findTotalNumberOfApplications,
    findAllApplications,
    findApplicationById,
    insertApplication,
    updateApplication,
    updateApplicationById,
    deleteApplicationById,
  };
};
