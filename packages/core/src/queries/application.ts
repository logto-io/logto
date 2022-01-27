import { Application, CreateApplication, Applications } from '@logto/schemas';
import { sql } from 'slonik';

import { buildFindMany } from '@/database/find-many';
import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields, getTotalRowCount } from '@/database/utils';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(Applications);

export const findTotalNumberOfApplications = async () => getTotalRowCount(table);

const findApplicationMany = buildFindMany<CreateApplication, Application>(pool, Applications);

export const findAllApplications = async (limit: number, offset: number) =>
  findApplicationMany({ limit, offset });

export const findApplicationById = async (id: string) =>
  pool.one<Application>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.id}=${id}
  `);

export const insertApplication = buildInsertInto<CreateApplication, Application>(
  pool,
  Applications,
  {
    returning: true,
  }
);

const updateApplication = buildUpdateWhere<CreateApplication, Application>(
  pool,
  Applications,
  true
);

export const updateApplicationById = async (
  id: string,
  set: Partial<OmitAutoSetFields<CreateApplication>>
) => updateApplication({ set, where: { id } });

export const deleteApplicationById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError();
  }
};
