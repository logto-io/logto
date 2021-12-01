import { ResourceScopeDBEntry, ResourceScopes } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { convertToIdentifiers } from '@/database/utils';
import RequestError from '@/errors/RequestError';

const { table, fields } = convertToIdentifiers(ResourceScopes);

/**
 * Query all scopes registered under the target resource
 * if no scopes found should return empty array
 * as no pool.maybeMany defined we wrap up the query method using a try..catch..
 * and hide the internal slonik db error
 * @param resourceId
 * @returns ResourceScopeDBEntry[]
 */
export const findAllScopesWithResourceId = async (resourceId: string) => {
  try {
    return await pool.many<ResourceScopeDBEntry>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.resourceId}=${resourceId}
      `);
  } catch {
    return [];
  }
};

export const insertScope = buildInsertInto<ResourceScopeDBEntry>(pool, ResourceScopes, {
  returning: true,
});

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
