import { TenantIdConfig, type TenantIdConfig as TenantIdConfigType } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const createTenantIdConfigQueries = (pool: CommonQueryMethods) => {
  const { table, fields } = convertToIdentifiers(TenantIdConfig);

  const insertTenantIdConfig = buildInsertIntoWithPool(pool)(TenantIdConfig, {
    returning: true,
  });

  const findTenantIdConfigByTenantId = async (
    tenantId: string
  ): Promise<TenantIdConfigType | undefined> => {
    const result = await pool.maybeOne<TenantIdConfigType>(sql`
      select * from ${table}
      where ${fields.tenantId} = ${tenantId}
    `);
    return result ?? undefined;
  };

  const updateTenantIdConfig = async (
    tenantId: string,
    set: Partial<Pick<TenantIdConfigType, 'idFormat'>>
  ): Promise<TenantIdConfigType> => {
    const { fields } = convertToIdentifiers(TenantIdConfig);
    const entries = Object.entries(set);

    return pool.one<TenantIdConfigType>(sql`
      update ${table}
      set ${sql.join(
        // eslint-disable-next-line no-restricted-syntax -- Dynamic field access is necessary here
        entries.map(([key, value]) => sql`${fields[key as keyof typeof fields]} = ${value}`),
        sql`, `
      )}, ${fields.updatedAt} = now()
      where ${fields.tenantId} = ${tenantId}
      returning *
    `);
  };

  return {
    insertTenantIdConfig,
    findTenantIdConfigByTenantId,
    updateTenantIdConfig,
  };
};

export default createTenantIdConfigQueries;
