import { ResourceScope, CreateResourceScope, ResourceScopes } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';
import { DeletionError } from '@/errors/SlonikError';

const { table, fields } = convertToIdentifiers(ResourceScopes);

export const findAllScopesWithResourceId = async (resourceId: string) =>
  pool.any<ResourceScope>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.resourceId}=${resourceId}
  `);

export const insertScope = buildInsertInto<CreateResourceScope, ResourceScope>(
  pool,
  ResourceScopes,
  {
    returning: true,
  }
);

export const deleteScopeById = async (id: string) => {
  const { rowCount } = await pool.query(sql`
    delete from ${table}
    where id=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError();
  }
};
