import { Tenants, type TenantModel } from '@logto/schemas/models';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

const createTenantQueries = (pool: CommonQueryMethods) => {
  const { table, fields } = convertToIdentifiers({
    table: Tenants.tableName,
    fields: Tenants.rawKeys,
  });

  const findTenantSuspendStatusById = async (
    id: string
  ): Promise<Pick<TenantModel, 'id' | 'isSuspended'>> => {
    const result = await pool.one<Pick<TenantModel, 'id' | 'isSuspended'>>(sql`
      select ${sql.join([fields.id, fields.isSuspended], sql`, `)}
      from ${table}
      where ${fields.id} = ${id}
    `);

    return result;
  };

  return {
    findTenantSuspendStatusById,
  };
};

export default createTenantQueries;
