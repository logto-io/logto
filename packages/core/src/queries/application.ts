import { Application, ApplicationUpdate, Applications } from '@logto/schemas';
import { sql } from 'slonik';

import { buildFindMany } from '@/database/find-many';
import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields, getTotalRowCount } from '@/database/utils';
import RequestError from '@/errors/RequestError';

const { table, fields } = convertToIdentifiers(Applications);

export const findTotalNumberOfApplications = async () => getTotalRowCount(table);

const findApplicationMany = buildFindMany<ApplicationUpdate, Application>(pool, Applications);

export const findAllApplications = async (limit: number, offset: number) => {
  try {
    return await findApplicationMany({ limit, offset });
  } catch {
    throw new RequestError({
      code: 'entity.not_exists',
      name: Applications.tableSingular,
      status: 404,
    });
  }
};

export const findApplicationById = async (id: string) => {
  try {
    return await pool.one<Application>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id}=${id}
    `);
  } catch {
    throw new RequestError({
      code: 'entity.not_exists_with_id',
      name: Applications.tableSingular,
      id,
      status: 404,
    });
  }
};

export const insertApplication = buildInsertInto<ApplicationUpdate, Application>(
  pool,
  Applications,
  {
    returning: true,
  }
);

const updateApplication = buildUpdateWhere<ApplicationUpdate, Application>(
  pool,
  Applications,
  true
);

export const updateApplicationById = async (
  id: string,
  set: Partial<OmitAutoSetFields<ApplicationUpdate>>
) => updateApplication({ set, where: { id } });

export const deleteApplicationById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);
  if (rowCount < 1) {
    throw new RequestError({
      code: 'entity.not_exists_with_id',
      name: Applications.tableSingular,
      id,
      status: 404,
    });
  }
};
