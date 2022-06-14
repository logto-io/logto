import { Application, CreateApplication, Applications } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import { getTotalRowCount } from '@/database/row-count';
import { buildUpdateWhere } from '@/database/update-where';
import {
  convertToIdentifiers,
  OmitAutoSetFields,
  conditionalSql,
  manyRows,
} from '@/database/utils';
import envSet from '@/env-set';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Applications);

export const findTotalNumberOfApplications = async () => getTotalRowCount(table);

export const findAllApplications = async (limit: number, offset: number) =>
  manyRows(
    envSet.pool.query<Application>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      order by ${fields.createdAt} desc
      ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
      ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
    `)
  );

export const findApplicationById = async (id: string) =>
  envSet.pool.one<Application>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertApplication = buildInsertInto<CreateApplication, Application>(Applications, {
  returning: true,
});

const updateApplication = buildUpdateWhere<CreateApplication, Application>(Applications, true);

export const updateApplicationById = async (
  id: string,
  set: Partial<OmitAutoSetFields<CreateApplication>>,
  jsonbMode: 'replace' | 'merge' = 'merge'
) => updateApplication({ set, where: { id }, jsonbMode });

export const deleteApplicationById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Applications.table, id);
  }
};
