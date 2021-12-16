import { ResourceScope, ResourceScopeDBEntry, ResourceScopes } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';
import RequestError from '@/errors/RequestError';

const { table, fields } = convertToIdentifiers(ResourceScopes);

export const findAllScopesWithResourceId = async (resourceId: string) =>
  pool.any<ResourceScope>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.resourceId}=${resourceId}
  `);

export const insertScope = buildInsertInto<ResourceScopeDBEntry, ResourceScope>(
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
    throw new RequestError({
      code: 'entity.not_exists_with_id',
      name: ResourceScopes.tableSingular,
      id,
      status: 404,
    });
  }
};
