import type { CreateApplication } from '@logto/schemas';
import { ApplicationType, Applications } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindAllEntitiesWithPool } from '#src/database/find-all-entities.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { getTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(Applications);

export const createApplicationQueries = (pool: CommonQueryMethods) => {
  const findTotalNumberOfApplications = async () => getTotalRowCountWithPool(pool)(table);
  const findAllApplications = buildFindAllEntitiesWithPool(pool)(Applications, [
    { field: 'createdAt', order: 'desc' },
  ]);
  const findApplicationById = buildFindEntityByIdWithPool(pool)(Applications);
  const insertApplication = buildInsertIntoWithPool(pool)(Applications, {
    returning: true,
  });
  const updateApplication = buildUpdateWhereWithPool(pool)(Applications, true);
  const updateApplicationById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateApplication>>
  ) => updateApplication({ set, where: { id }, jsonbMode: 'merge' });
  const countNonM2mApplications = async () => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      where ${fields.type} != ${ApplicationType.MachineToMachine}
    `);

    return { count: Number(count) };
  };
  const countM2mApplications = async () => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      where ${fields.type} = ${ApplicationType.MachineToMachine}
    `);

    return { count: Number(count) };
  };

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
    countNonM2mApplications,
    countM2mApplications,
    deleteApplicationById,
  };
};
