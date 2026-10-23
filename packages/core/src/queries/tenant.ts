import { Tenants, type TenantModel } from '@logto/schemas/models';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

const createTenantQueries = (pool: CommonQueryMethods) => {
  const { table, fields } = convertToIdentifiers({
    table: Tenants.tableName,
    fields: Tenants.rawKeys,
  });

  const findTenantMetadataById = async (
    id: string
  ): Promise<Pick<TenantModel, 'id' | 'isSuspended' | 'tag'>> => {
    const result = await pool.one<Pick<TenantModel, 'id' | 'isSuspended' | 'tag'>>(sql`
      select ${sql.join([fields.id, fields.isSuspended, fields.tag], sql`, `)}
      from ${table}
      where ${fields.id} = ${id}
    `);

    return result;
  };

  /**
   * Count every tenant except `excludedTenantId`. Only a pool that is not restricted to one tenant,
   * i.e. `EnvSet.sharedPool`, sees every tenant.
   */
  const countTenantsExcluding = async (excludedTenantId: string) => {
    // `count` is a `bigint`, which comes back as a string.
    const count = await pool.oneFirst<string>(sql`
      select count(*) from ${table}
      where ${fields.id} <> ${excludedTenantId}
    `);

    return Number(count);
  };

  return {
    findTenantMetadataById,
    countTenantsExcluding,
  };
};

export default createTenantQueries;
