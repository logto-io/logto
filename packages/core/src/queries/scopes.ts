import { ResourceScopeDBEntry, ResourceScopes } from '@logto/schemas';
import { sql } from 'slonik';

import { buildInsertInto } from '@/database/insert-into';
import pool from '@/database/pool';
import { buildUpdateWhere } from '@/database/update-where';
import { convertToIdentifiers, OmitAutoSetFields } from '@/database/utils';
import RequestError from '@/errors/RequestError';

const { table, fields } = convertToIdentifiers(ResourceScopes);

export const findAllScopesWithResourceId = async (resourceId: string) =>
  pool.many<ResourceScopeDBEntry>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.resourceId}=${resourceId}
`);

export const insertResource = buildInsertInto<ResourceScopeDBEntry>(pool, ResourceScopes, {
  returning: true,
});

const updateResource = buildUpdateWhere<ResourceScopeDBEntry>(pool, ResourceScopes, true);

export const updateResourceById = async (
  id: string,
  set: Partial<OmitAutoSetFields<ResourceScopeDBEntry>>
) => updateResource({ set, where: { id } });

export const deleteResourceById = async (id: string) => {
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
